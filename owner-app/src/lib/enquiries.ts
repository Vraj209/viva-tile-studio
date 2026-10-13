import "server-only";
import { GetObjectCommand, S3Client, type GetObjectCommandInput } from "@aws-sdk/client-s3";
import { neon } from "@neondatabase/serverless";
import {
  ENQUIRIES_PAGE_SIZE,
  normalizeEnquiryFilters,
  type EnquiryDetail,
  type EnquiryFilterInput,
  type EnquiryFilters,
  type EnquiryList,
  type EnquiryStats,
  type EnquirySummary,
} from "./enquiry-types";

type Row = Record<string, unknown>;
type Query = (text: string, values: unknown[]) => Promise<Row[]>;
type StoredObject = { body: ReadableStream<Uint8Array>; contentLength?: number };

// Server-only dependency seams let tests assert authorization occurs before IO.
export type EnquiryServices = {
  authorize?: () => Promise<unknown>;
  query?: Query;
  env?: Record<string, string | undefined>;
  readObject?: (input: GetObjectCommandInput, signal: AbortSignal) => Promise<StoredObject>;
};

const referencePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const downloadHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

export class EnquiryUnavailableError extends Error {
  constructor() {
    super("Enquiries are temporarily unavailable. Please try again.");
    this.name = "EnquiryUnavailableError";
  }
}

async function authorize(services: EnquiryServices) {
  if (services.authorize) {
    await services.authorize();
    return;
  }
  const { requireOwner } = await import("@/lib/auth");
  await requireOwner();
}

function queryFor(services: EnquiryServices): Query {
  if (services.query) return services.query;
  const url = (services.env ?? process.env).DATABASE_URL?.trim();
  if (!url) throw new EnquiryUnavailableError();
  try {
    const parsed = new URL(url);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol) || !parsed.username || !parsed.password)
      throw new Error("configuration");
    const sql = neon(url, { fetchOptions: { cache: "no-store", signal: AbortSignal.timeout(15_000) } });
    return async (text, values) => {
      try {
        return await sql.query(text, values) as Row[];
      } catch {
        // Database errors can contain credentials, SQL values, and customer data.
        throw new EnquiryUnavailableError();
      }
    };
  } catch {
    throw new EnquiryUnavailableError();
  }
}

function whereFor(filters: EnquiryFilters) {
  const clauses: string[] = [];
  const values: unknown[] = [];
  if (filters.q) {
    // Treat user-entered %, _ and backslashes literally, including SQL-like input.
    values.push(`%${filters.q.replace(/[\\%_]/g, "\\$&")}%`);
    clauses.push(`concat_ws(' ', name, email, phone, company, location, project_type, application, idea, reference::text) ILIKE $${values.length}`);
  }
  if (filters.projectType) {
    values.push(filters.projectType);
    clauses.push(`project_type = $${values.length}`);
  }
  if (filters.period !== "all") {
    values.push(filters.period === "7d" ? 7 : 30);
    clauses.push(`received_at >= CURRENT_TIMESTAMP - ($${values.length}::integer * INTERVAL '1 day')`);
  }
  return { text: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", values };
}

function string(value: unknown) {
  return typeof value === "string" ? value : "";
}

function timestamp(value: unknown) {
  const date = value instanceof Date ? value : new Date(string(value));
  if (!Number.isFinite(date.valueOf())) throw new EnquiryUnavailableError();
  return date.toISOString();
}

function count(value: unknown) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

function summary(row: Row): EnquirySummary {
  return {
    reference: string(row.reference),
    receivedAt: timestamp(row.received_at),
    name: string(row.name),
    email: string(row.email),
    projectType: string(row.project_type),
    application: string(row.application),
    location: string(row.location),
    company: string(row.company),
    ideaPreview: string(row.idea_preview),
    hasAttachment: row.has_attachment === true,
  };
}

export async function getEnquiries(
  input: EnquiryFilterInput = {},
  services: EnquiryServices = {},
): Promise<EnquiryList> {
  await authorize(services);
  const query = queryFor(services);
  const filters = normalizeEnquiryFilters(input);
  const where = whereFor(filters);
  const [totals] = await query(`SELECT count(*)::text AS total FROM public.project_enquiries ${where.text}`, where.values);
  const total = count(totals?.total);
  const totalPages = Math.max(1, Math.ceil(total / ENQUIRIES_PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const rows = await query(
    `SELECT reference, received_at, name, email, project_type, application,
            location, company, left(idea, 180) AS idea_preview,
            inspiration_key IS NOT NULL AS has_attachment
       FROM public.project_enquiries ${where.text}
      ORDER BY received_at DESC, reference DESC
      LIMIT $${where.values.length + 1} OFFSET $${where.values.length + 2}`,
    [...where.values, ENQUIRIES_PAGE_SIZE, (page - 1) * ENQUIRIES_PAGE_SIZE],
  );
  return { items: rows.map(summary), total, page, pageSize: ENQUIRIES_PAGE_SIZE, totalPages, filters: { ...filters, page } };
}

export async function getEnquiryStats(services: EnquiryServices = {}): Promise<EnquiryStats> {
  await authorize(services);
  const [row] = await queryFor(services)(
    `SELECT count(*)::text AS total,
            count(*) FILTER (WHERE received_at >= CURRENT_TIMESTAMP - INTERVAL '7 days')::text AS last_7_days,
            count(*) FILTER (WHERE received_at >= CURRENT_TIMESTAMP - INTERVAL '30 days')::text AS last_30_days,
            count(*) FILTER (WHERE inspiration_key IS NOT NULL)::text AS with_attachments
       FROM public.project_enquiries`,
    [],
  );
  return { total: count(row?.total), last7Days: count(row?.last_7_days), last30Days: count(row?.last_30_days), withAttachments: count(row?.with_attachments) };
}

export async function getEnquiry(reference: string, services: EnquiryServices = {}): Promise<EnquiryDetail | null> {
  await authorize(services);
  if (!referencePattern.test(reference)) return null;
  const [row] = await queryFor(services)(
    `SELECT reference, received_at, name, email, idea, left(idea, 180) AS idea_preview,
            project_type, application, location, dimensions, company, phone, desired_date::text,
            inspiration_key IS NOT NULL AS has_attachment,
            inspiration_original_name, inspiration_mime, inspiration_bytes
       FROM public.project_enquiries WHERE reference = $1::uuid LIMIT 1`,
    [reference],
  );
  if (!row) return null;
  return {
    ...summary(row),
    idea: string(row.idea),
    dimensions: string(row.dimensions),
    phone: string(row.phone),
    desiredDate: typeof row.desired_date === "string" ? row.desired_date : null,
    inspiration: row.has_attachment === true ? {
      originalName: string(row.inspiration_original_name),
      mime: string(row.inspiration_mime),
      bytes: count(row.inspiration_bytes),
    } : null,
  };
}

async function readBoundedObject(object: StoredObject, expectedBytes: number) {
  if (object.contentLength !== undefined && object.contentLength !== expectedBytes) {
    await object.body.cancel();
    throw new EnquiryUnavailableError();
  }
  const reader = object.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > expectedBytes || size > MAX_ATTACHMENT_BYTES) {
        await reader.cancel();
        throw new EnquiryUnavailableError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (size !== expectedBytes) throw new EnquiryUnavailableError();
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function getEnquiryAttachment(reference: string, services: EnquiryServices = {}): Promise<Response> {
  await authorize(services);
  const missing = () => Response.json({ message: "Attachment not found." }, { status: 404, headers: downloadHeaders });
  if (!referencePattern.test(reference)) return missing();
  const [row] = await queryFor(services)(
    `SELECT inspiration_bucket, inspiration_key, inspiration_mime, inspiration_bytes
       FROM public.project_enquiries WHERE reference = $1::uuid LIMIT 1`,
    [reference],
  );
  if (!row || !row.inspiration_key) return missing();
  const env = services.env ?? process.env;
  const bucket = env.ENQUIRY_STORAGE_BUCKET?.trim() || "viva-tile-studio";
  const mime = string(row.inspiration_mime);
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" } as Record<string, string>)[mime];
  const expectedKey = `enquiries/${reference.toLowerCase()}/inspiration.${extension}`;
  const expectedBytes = count(row.inspiration_bytes);
  if (!extension || row.inspiration_bucket !== bucket || row.inspiration_key !== expectedKey || expectedBytes < 1 || expectedBytes > MAX_ATTACHMENT_BYTES)
    throw new EnquiryUnavailableError();

  const signal = AbortSignal.timeout(15_000);
  let client: S3Client | undefined;
  try {
    const input = { Bucket: bucket, Key: expectedKey };
    let object: StoredObject;
    if (services.readObject) object = await services.readObject(input, signal);
    else {
      const endpoint = new URL(env.AWS_ENDPOINT_URL_S3?.trim() || "");
      const region = env.AWS_REGION?.trim();
      const accessKeyId = env.AWS_ACCESS_KEY_ID?.trim();
      const secretAccessKey = env.AWS_SECRET_ACCESS_KEY?.trim();
      if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || !region || !accessKeyId || !secretAccessKey)
        throw new EnquiryUnavailableError();
      client = new S3Client({ endpoint: endpoint.toString(), region, credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true, maxAttempts: 2 });
      const result = await client.send(new GetObjectCommand(input), { abortSignal: signal });
      if (!result.Body) throw new EnquiryUnavailableError();
      object = { body: result.Body.transformToWebStream(), contentLength: result.ContentLength };
    }
    const bytes = await readBoundedObject(object, expectedBytes);
    return new Response(bytes, {
      headers: {
        ...downloadHeaders,
        "Content-Type": mime,
        "Content-Length": String(bytes.byteLength),
        // Generated ASCII names keep user-supplied filenames out of HTTP headers.
        "Content-Disposition": `attachment; filename="inspiration-${reference.toLowerCase()}.${extension}"`,
        "Content-Security-Policy": "sandbox; default-src 'none'",
      },
    });
  } catch {
    throw new EnquiryUnavailableError();
  } finally {
    client?.destroy();
  }
}
