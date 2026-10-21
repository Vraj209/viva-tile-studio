export type EnquirySubmissionIdentity = {
  fingerprint: string;
  key: string;
};

async function digest(bytes: ArrayBuffer) {
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/** Keep a retry tied to the exact submitted fields and attachment, in memory only. */
export async function enquirySubmissionIdentity(
  form: FormData,
  previous: EnquirySubmissionIdentity | null,
): Promise<EnquirySubmissionIdentity> {
  const fields = await Promise.all(
    Array.from(form.entries())
      // Browsers submit an empty File for an unselected optional upload. Treat
      // that the same as an upload control that has not been enabled yet.
      .filter(([, value]) => typeof value === "string" || value.size > 0)
      .map(async ([name, value]) => [
      name,
      typeof value === "string"
        ? value
        : {
            name: value.name,
            type: value.type,
            bytes: await digest(await value.arrayBuffer()),
          },
      ]),
  );
  // Multipart boundaries and File.lastModified change between requests; neither
  // changes the saved inquiry. Field values and actual file bytes do.
  fields.sort(([a], [b]) => String(a).localeCompare(String(b)));
  const fingerprint = await digest(
    new TextEncoder().encode(JSON.stringify(fields)).buffer,
  );
  return previous?.fingerprint === fingerprint
    ? previous
    : { fingerprint, key: crypto.randomUUID() };
}
