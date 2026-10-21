import { createHash } from "node:crypto";
import type { EnquiryRecord } from "./enquiry-neon";
import type { Upload } from "./enquiry";

export const SUBMISSION_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class EnquiryConflictError extends Error {
  constructor() { super("Submission key already belongs to different content"); }
}

export function enquiryFingerprint(record: EnquiryRecord, upload?: Upload) {
  // Canonical field order; submission time is assigned once by the first save.
  const values = Object.entries(record).filter(([key]) => key !== "reference" && key !== "receivedAt")
    .sort(([a], [b]) => a.localeCompare(b));
  return createHash("sha256").update(JSON.stringify(values))
    .update(upload?.bytes ?? Buffer.alloc(0)).digest("hex");
}
