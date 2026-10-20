import { randomUUID } from "node:crypto";
import { mkdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  neonEnquiryConfiguration,
  persistNeonEnquiry,
  type EnquiryRecord,
  type NeonEnquiryConfig,
} from "./enquiry-neon";
import {
  enquiryFields,
  MAX_UPLOAD_BYTES,
  type EnquiryErrors,
} from "./enquiry-config";

const MAX_REQUEST_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const MAX_RATE_KEYS = 2048;
const optionalLimits = {
  projectType: 120,
  application: 120,
  location: 200,
  dimensions: 160,
  company: 160,
  phone: 50,
  desiredDate: 10,
} as const;
const fieldNames = [
  ...Object.keys(enquiryFields),
  ...Object.keys(optionalLimits),
  "inspiration",
  "website",
];

export type EnquiryData = Record<
  keyof typeof enquiryFields | keyof typeof optionalLimits,
  string
>;
export type Upload = {
  bytes: Buffer;
  mime: string;
  extension: string;
  originalName: string;
};
type DeliveryConfig =
  | NeonEnquiryConfig
  | { kind: "webhook"; url: string; token?: string }
  | { kind: "filesystem"; directory: string };
type Environment = Record<string, string | undefined>;
type Bucket = { count: number; until: number };
export type EnquiryServices = {
  env?: Environment;
  fetch?: typeof fetch;
  now?: () => number;
  buckets?: Map<string, Bucket>;
  persistNeon?: typeof persistNeonEnquiry;
};

// Per-process safeguard. See docs/enquiry.md for multi-instance limits and proxy setup.
const processBuckets = new Map<string, Bucket>();

function configuration(env: Environment): DeliveryConfig | null {
  const webhook = env.ENQUIRY_WEBHOOK_URL?.trim();
  const directory = env.ENQUIRY_STORAGE_DIR?.trim();
  if (env.DATABASE_URL?.trim()) {
    if (webhook || directory) return null;
    return neonEnquiryConfiguration(env);
  }
  if (webhook && directory) return null;
  if (webhook) {
    try {
      const url = new URL(webhook);
      if (url.protocol !== "https:" || url.username || url.password)
        return null;
      return {
        kind: "webhook",
        url: url.toString(),
        token: env.ENQUIRY_WEBHOOK_TOKEN,
      };
    } catch {
      return null;
    }
  }
  if (
    directory &&
    path.isAbsolute(directory) &&
    !directory.split(/[\\/]/).some((part) => part.toLowerCase() === "public")
  ) {
    return { kind: "filesystem", directory };
  }
  return null;
}

export function enquiryAvailability(env: Environment = process.env) {
  const config = configuration(env);
  return {
    available: config !== null,
    uploadsAvailable: config !== null &&
      (config.kind !== "neon" || config.storage !== null),
  };
}

function response(status: number, message: string, extra: object = {}) {
  return Response.json(
    { message, ...extra },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

function consumeRateLimit(
  request: Request,
  env: Environment,
  buckets: Map<string, Bucket>,
  now: number,
) {
  for (const [key, bucket] of buckets)
    if (bucket.until <= now) buckets.delete(key);
  // Only enable after the ingress proxy overwrites this header. It is not trusted by default.
  const forwarded =
    env.ENQUIRY_TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      : undefined;
  const key =
    forwarded && /^[a-fA-F0-9:.]{3,64}$/.test(forwarded) ? forwarded : "shared";
  const previous = buckets.get(key);
  if (previous) {
    if (previous.count >= RATE_LIMIT) return false;
    previous.count += 1;
    return true;
  }
  if (buckets.size >= MAX_RATE_KEYS) return false;
  buckets.set(key, { count: 1, until: now + WINDOW_MS });
  return true;
}

async function readBoundedForm(request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data;")) throw new Error("type");
  const contentLength = request.headers.get("content-length");
  if (
    contentLength &&
    (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_REQUEST_BYTES)
  )
    throw new Error("size");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("body");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new Error("size");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = Buffer.concat(chunks);
  return new Response(bytes, {
    headers: { "Content-Type": contentType },
  }).formData();
}

function signature(bytes: Buffer) {
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return { mime: "image/png", extension: "png", extensions: ["png"] };
  if (
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    return {
      mime: "image/jpeg",
      extension: "jpg",
      extensions: ["jpg", "jpeg"],
    };
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  )
    return { mime: "image/webp", extension: "webp", extensions: ["webp"] };
  if (bytes.length >= 5 && bytes.toString("ascii", 0, 5) === "%PDF-")
    return { mime: "application/pdf", extension: "pdf", extensions: ["pdf"] };
  return null;
}

export async function validateEnquiry(
  form: FormData,
): Promise<{
  data: EnquiryData;
  upload?: Upload;
  errors: EnquiryErrors;
  malformed: boolean;
}> {
  const errors: EnquiryErrors = {};
  const data = {} as EnquiryData;
  let malformed = false;
  for (const key of form.keys())
    if (!fieldNames.includes(key) || form.getAll(key).length > 1)
      malformed = true;
  for (const [key, config] of Object.entries(enquiryFields)) {
    const entry = form.get(key);
    const value = typeof entry === "string" ? entry.trim() : "";
    const field = key as keyof typeof enquiryFields;
    data[field] = value;
    if (config.required && !value)
      errors[field] = `${config.label} is required.`;
    else if (value.length > config.maxLength)
      errors[field] = `Please use ${config.maxLength} characters or fewer.`;
    else if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value))
      errors[field] = "Please remove unsupported control characters.";
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Enter a valid email address.";
  for (const [key, limit] of Object.entries(optionalLimits)) {
    const entry = form.get(key);
    const field = key as keyof typeof optionalLimits;
    data[field] = typeof entry === "string" ? entry.trim() : "";
    if (entry !== null && typeof entry !== "string") malformed = true;
    if (data[field].length > limit || /[\u0000-\u001F\u007F]/.test(data[field]))
      errors[field] = `Please use plain text, up to ${limit} characters.`;
  }
  if (data.desiredDate) {
    const date = new Date(`${data.desiredDate}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data.desiredDate) ||
      data.desiredDate.startsWith("0000-") ||
      Number.isNaN(date.valueOf()) ||
      date.toISOString().slice(0, 10) !== data.desiredDate
    )
      errors.desiredDate = "Enter a valid date.";
  }
  let upload: Upload | undefined;
  const file = form.get("inspiration");
  if (typeof file === "string" && file)
    errors.inspiration = "Choose a JPG, PNG, WebP or PDF file.";
  if (file && typeof file !== "string" && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES)
      errors.inspiration = "Please choose a file no larger than 5 MB.";
    else {
      const bytes = Buffer.from(await file.arrayBuffer());
      const detected = signature(bytes);
      const originalName = file.name
        .replace(/^.*[\\/]/, "")
        .replace(/[^\p{L}\p{N} ._()-]/gu, "_")
        .slice(0, 160);
      const extension = originalName.split(".").at(-1)?.toLowerCase() ?? "";
      if (
        !detected ||
        file.type !== detected.mime ||
        !detected.extensions.includes(extension)
      )
        errors.inspiration =
          "The file content must match its JPG, PNG, WebP or PDF file type.";
      else
        upload = {
          bytes,
          mime: detected.mime,
          extension: detected.extension,
          originalName,
        };
    }
  }
  return { data, upload, errors, malformed };
}

async function persist(
  directory: string,
  reference: string,
  record: object,
  upload?: Upload,
) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const destination = await realpath(directory);
  const publicDirectory = await realpath(
    path.join(process.cwd(), "public"),
  ).catch(() => path.resolve(process.cwd(), "public"));
  const relativeToPublic = path.relative(publicDirectory, destination);
  if (
    !relativeToPublic ||
    (!relativeToPublic.startsWith(`..${path.sep}`) &&
      relativeToPublic !== ".." &&
      !path.isAbsolute(relativeToPublic))
  )
    throw new Error("unsafe storage");
  // A randomized private staging directory is renamed only after every write succeeds.
  const staging = path.join(destination, `.pending-${reference}`);
  await mkdir(staging, { mode: 0o700 });
  try {
    if (upload)
      await writeFile(
        path.join(staging, `inspiration.${upload.extension}`),
        upload.bytes,
        { flag: "wx", mode: 0o600 },
      );
    await writeFile(
      path.join(staging, "enquiry.json"),
      JSON.stringify(record, null, 2),
      { flag: "wx", mode: 0o600 },
    );
    await rename(staging, path.join(destination, reference));
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}

export async function handleEnquiry(
  request: Request,
  services: EnquiryServices = {},
) {
  const env = services.env ?? process.env;
  let expectedOrigin: string;
  try {
    let expected = new URL(env.ENQUIRY_ALLOWED_ORIGIN || request.url);
    const host = request.headers.get("host");
    if (!env.ENQUIRY_ALLOWED_ORIGIN && host) {
      // NextURL normalizes loopback IPs to localhost. Host preserves the actual
      // destination the browser used; do not trust X-Forwarded-Host here.
      const destination = new URL(`${expected.protocol}//${host}`);
      if (destination.username || destination.password || destination.pathname !== "/" || destination.search || destination.hash)
        throw new Error("invalid host");
      expected = destination;
    }
    expectedOrigin = expected.origin;
  } catch {
    return response(
      503,
      "Project enquiries are temporarily unavailable. Please try again later.",
    );
  }
  if (request.headers.get("origin") !== expectedOrigin)
    return response(
      403,
      "This submission could not be verified. Please return to the studio website and try again.",
    );
  if (
    !consumeRateLimit(
      request,
      env,
      services.buckets ?? processBuckets,
      (services.now ?? Date.now)(),
    )
  )
    return response(
      429,
      "Too many attempts. Please wait 10 minutes before trying again.",
    );
  const config = configuration(env);
  if (!config)
    return response(
      503,
      "Online enquiries are not connected yet. Your idea has not been sent.",
    );
  let form: FormData;
  try {
    form = await readBoundedForm(request);
  } catch (error) {
    return error instanceof Error && error.message === "size"
      ? response(
          413,
          "This submission is too large. Please keep the inspiration file below 5 MB.",
        )
      : response(400, "The form could not be read. Please try again.");
  }
  if (form.get("website"))
    return response(
      400,
      "This submission could not be verified. Please try again.",
    );
  const { data, upload, errors, malformed } = await validateEnquiry(form);
  if (malformed)
    return response(
      400,
      "The form contains unsupported or repeated fields. Please reload the page and try again.",
    );
  if (upload && config.kind === "neon" && !config.storage)
    errors.inspiration =
      "Attachments are currently unavailable. Remove the file to send your enquiry.";
  if (Object.keys(errors).length)
    return response(
      422,
      "Please check the highlighted fields. Your idea has not been sent.",
      { errors },
    );
  const reference = randomUUID();
  const record: EnquiryRecord = {
    reference,
    receivedAt: new Date((services.now ?? Date.now)()).toISOString(),
    ...data,
    inspiration: upload
      ? {
          filename: `inspiration.${upload.extension}`,
          originalName: upload.originalName,
          mime: upload.mime,
          bytes: upload.bytes.length,
        }
      : null,
  };
  try {
    if (config.kind === "neon")
      await (services.persistNeon ?? persistNeonEnquiry)(config, record, upload);
    else if (config.kind === "filesystem")
      await persist(config.directory, reference, record, upload);
    else {
      const body = new FormData();
      body.set("enquiry", JSON.stringify(record));
      if (upload)
        body.set(
          "inspiration",
          new Blob([new Uint8Array(upload.bytes)], { type: upload.mime }),
          `inspiration.${upload.extension}`,
        );
      const result = await (services.fetch ?? fetch)(config.url, {
        method: "POST",
        body,
        headers: config.token
          ? { Authorization: `Bearer ${config.token}` }
          : undefined,
        signal: AbortSignal.timeout(12_000),
        redirect: "error",
      });
      if (!result.ok) throw new Error("delivery not accepted");
    }
  } catch {
    // Never log enquiry content or expose transport details in a browser response.
    return response(
      502,
      "We could not confirm receipt. Your information is still here; please try again later.",
    );
  }
  return response(
    201,
    "Your enquiry has been received. Thank you for sharing your idea.",
    { reference },
  );
}
