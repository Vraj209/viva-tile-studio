import { neon } from "@neondatabase/serverless";
import {
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import type { EnquiryData, Upload } from "./enquiry";

export type NeonEnquiryConfig = {
  kind: "neon";
  databaseUrl: string;
  bucket: string;
  storage: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    region: string;
  };
};

export type EnquiryRecord = EnquiryData & {
  reference: string;
  receivedAt: string;
  inspiration: {
    filename: string;
    originalName: string;
    mime: string;
    bytes: number;
  } | null;
};

export type EnquiryNeonServices = {
  sql?: (
    strings: TemplateStringsArray,
    ...parameters: unknown[]
  ) => PromiseLike<unknown>;
  putObject?: (
    input: PutObjectCommandInput,
    signal: AbortSignal,
  ) => Promise<unknown>;
};

export function neonEnquiryConfiguration(
  env: Record<string, string | undefined>,
): NeonEnquiryConfig | null {
  const databaseUrl = env.DATABASE_URL?.trim();
  const accessKeyId = env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY?.trim();
  const endpoint = env.AWS_ENDPOINT_URL_S3?.trim();
  const region = env.AWS_REGION?.trim();
  const bucket = env.ENQUIRY_STORAGE_BUCKET?.trim() || "viva-tile-studio";
  if (!databaseUrl || !accessKeyId || !secretAccessKey || !endpoint || !region)
    return null;
  try {
    const database = new URL(databaseUrl);
    const storage = new URL(endpoint);
    if (
      !["postgres:", "postgresql:"].includes(database.protocol) ||
      !database.hostname ||
      !database.username ||
      !database.password ||
      database.pathname.length < 2 ||
      storage.protocol !== "https:" ||
      storage.username ||
      storage.password ||
      storage.search ||
      storage.hash ||
      !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket) ||
      bucket.includes("..")
    )
      return null;
  } catch {
    return null;
  }
  return {
    kind: "neon",
    databaseUrl,
    bucket,
    storage: { accessKeyId, secretAccessKey, endpoint, region },
  };
}

async function putObject(
  config: NeonEnquiryConfig,
  input: PutObjectCommandInput,
  signal: AbortSignal,
) {
  const client = new S3Client({
    endpoint: config.storage.endpoint,
    region: config.storage.region,
    credentials: {
      accessKeyId: config.storage.accessKeyId,
      secretAccessKey: config.storage.secretAccessKey,
    },
    // Neon requires path-style addressing for its branch-specific endpoint.
    forcePathStyle: true,
    maxAttempts: 2,
  });
  try {
    await client.send(new PutObjectCommand(input), { abortSignal: signal });
  } finally {
    client.destroy();
  }
}

export async function persistNeonEnquiry(
  config: NeonEnquiryConfig,
  record: EnquiryRecord,
  upload?: Upload,
  services: EnquiryNeonServices = {},
) {
  // The handler supplies validated data; keep object paths safe at this boundary too.
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      record.reference,
    ) ||
    (upload && !/^(jpg|png|webp|pdf)$/.test(upload.extension)) ||
    Boolean(upload) !== Boolean(record.inspiration)
  )
    throw new Error("Invalid enquiry storage record");

  const signal = AbortSignal.timeout(15_000);
  const key = upload
    ? `enquiries/${record.reference}/inspiration.${upload.extension}`
    : null;
  if (upload) {
    const input: PutObjectCommandInput = {
      Bucket: config.bucket,
      Key: key!,
      Body: upload.bytes,
      ContentType: upload.mime,
      ContentLength: upload.bytes.length,
      // Use a generated ASCII filename, never user input in HTTP headers.
      ContentDisposition: `attachment; filename="inspiration.${upload.extension}"`,
      CacheControl: "private, no-store",
    };
    if (services.putObject) await services.putObject(input, signal);
    else await putObject(config, input, signal);
  }

  const sql =
    services.sql ?? neon(config.databaseUrl, { fetchOptions: { signal } });
  // All enquiry values are bound parameters. No credentials or private URLs are stored.
  // Keep any uploaded object on a database timeout: the INSERT may have committed
  // even when its acknowledgement was lost. Reconcile private orphans separately.
  await sql`
    INSERT INTO public.project_enquiries (
      reference, received_at, name, email, idea, project_type, application,
      location, dimensions, company, phone, desired_date,
      inspiration_bucket, inspiration_key, inspiration_original_name,
      inspiration_mime, inspiration_bytes
    ) VALUES (
      ${record.reference}, ${record.receivedAt}, ${record.name}, ${record.email},
      ${record.idea}, ${record.projectType}, ${record.application},
      ${record.location}, ${record.dimensions}, ${record.company}, ${record.phone},
      ${record.desiredDate || null}, ${upload ? config.bucket : null}, ${key},
      ${upload?.originalName ?? null}, ${upload?.mime ?? null},
      ${upload?.bytes.length ?? null}
    )
  `;
}
