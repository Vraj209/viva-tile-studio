import test from "node:test";
import assert from "node:assert/strict";
import {
  EnquiryUnavailableError,
  getEnquiries,
  getEnquiry,
  getEnquiryAttachment,
  getEnquiryStats,
  type EnquiryServices,
} from "../src/lib/enquiries";
import { normalizeEnquiryFilters } from "../src/lib/enquiry-types";

const reference = "cb6d2e8a-a4bb-4db7-a875-bdd987bd98f7";
const fixture = {
  reference,
  received_at: "2026-10-12T14:00:00Z",
  name: "Example Designer",
  email: "designer@example.test",
  idea: "A botanical wall for a reading room.",
  idea_preview: "A botanical wall for a reading room.",
  project_type: "Residential",
  application: "Feature wall",
  location: "Toronto",
  dimensions: "3 by 2 metres",
  company: "Example Studio",
  phone: "+1 555 0100",
  desired_date: "2027-01-20",
  has_attachment: true,
  inspiration_bucket: "viva-tile-studio",
  inspiration_key: `enquiries/${reference}/inspiration.pdf`,
  inspiration_original_name: "Concept.pdf",
  inspiration_mime: "application/pdf",
  inspiration_bytes: 14,
};

const authorize = async () => ({ id: "owner-test" });

test("every read requires authorization before query or object storage access, including malformed IDs", async () => {
  let reads = 0;
  const denied = new Error("denied");
  const services: EnquiryServices = {
    authorize: async () => { throw denied; },
    query: async () => { reads++; return []; },
    readObject: async () => { reads++; throw new Error("must never run"); },
  };
  for (const read of [
    () => getEnquiries({}, services),
    () => getEnquiryStats(services),
    () => getEnquiry(reference, services),
    () => getEnquiry("malformed", services),
    () => getEnquiryAttachment(reference, services),
    () => getEnquiryAttachment("malformed", services),
  ]) await assert.rejects(read, (error) => error === denied);
  assert.equal(reads, 0);
});

test("query filters bind SQL-like text and escape wildcard characters while paginating on the server", async () => {
  const search = "%' OR 1=1; --_\\";
  const projectType = "Residential'); DROP TABLE project_enquiries; --";
  const queries: { text: string; values: unknown[] }[] = [];
  const result = await getEnquiries({ q: search, projectType, period: "7d", page: "2" }, {
    authorize,
    query: async (text, values) => {
      queries.push({ text, values });
      assert.ok(!text.includes(search));
      assert.ok(!text.includes(projectType));
      return text.startsWith("SELECT count") ? [{ total: "43" }] : [fixture];
    },
  });
  assert.equal(queries.length, 2);
  assert.deepEqual(queries[0].values, ["%\\%' OR 1=1; --\\_\\\\%", projectType, 7]);
  assert.deepEqual(queries[1].values, [...queries[0].values, 20, 20]);
  assert.match(queries[1].text, /ORDER BY received_at DESC, reference DESC/);
  assert.equal(result.total, 43);
  assert.equal(result.totalPages, 3);
  assert.equal(result.page, 2);
  assert.equal(result.items[0].name, fixture.name);
  assert.equal(result.items[0].hasAttachment, true);
  assert.ok(!("inspiration_key" in result.items[0]));
  assert.ok(!("phone" in result.items[0]));
});

test("pagination clamps out-of-range requests to a real last page and zero results remain usable", async () => {
  for (const [total, expectedPage, expectedOffset] of [[25, 2, 20], [0, 1, 0]]) {
    let offset: unknown;
    const result = await getEnquiries({ page: "999999" }, {
      authorize,
      query: async (text, values) => {
        if (text.startsWith("SELECT count")) return [{ total: String(total) }];
        offset = values.at(-1);
        return [];
      },
    });
    assert.equal(result.page, expectedPage);
    assert.equal(result.filters.page, expectedPage);
    assert.equal(offset, expectedOffset);
    assert.equal(result.total, total);
  }
});

test("filter parsing bounds hostile or ambiguous query parameters", () => {
  assert.deepEqual(normalizeEnquiryFilters({ q: ["one", "two"], period: "forever", page: "-1" }), {
    q: "", projectType: "", period: "all", page: 1,
  });
  assert.equal(normalizeEnquiryFilters({ q: `a\u0000b${"x".repeat(300)}` }).q.length, 200);
  assert.equal(normalizeEnquiryFilters({ page: Infinity }).page, 1);
  assert.equal(normalizeEnquiryFilters({ page: "0" }).page, 1);
  assert.equal(normalizeEnquiryFilters({ page: "1000000" }).page, 1_000_000);
  assert.equal(normalizeEnquiryFilters({ page: "1.5" }).page, 1);
});

test("detail returns every submitted field without private storage locations", async () => {
  const detail = await getEnquiry(reference, {
    authorize,
    query: async (text, values) => {
      assert.match(text, /WHERE reference = \$1::uuid/);
      assert.deepEqual(values, [reference]);
      return [fixture];
    },
  });
  assert.ok(detail);
  assert.equal(detail.receivedAt, "2026-10-12T14:00:00.000Z");
  assert.equal(detail.idea, fixture.idea);
  assert.equal(detail.phone, fixture.phone);
  assert.equal(detail.dimensions, fixture.dimensions);
  assert.equal(detail.desiredDate, fixture.desired_date);
  assert.deepEqual(detail.inspiration, { originalName: "Concept.pdf", mime: "application/pdf", bytes: 14 });
  assert.ok(!JSON.stringify(detail).includes("viva-tile-studio"));
  assert.ok(!JSON.stringify(detail).includes("enquiries/"));
});

test("missing, invalid and attachment-free enquiries have explicit results", async () => {
  let queries = 0;
  const services: EnquiryServices = { authorize, query: async () => { queries++; return []; } };
  assert.equal(await getEnquiry("../../other", services), null);
  assert.equal(queries, 0);
  assert.equal(await getEnquiry(reference, services), null);
  const detail = await getEnquiry(reference, {
    authorize,
    query: async () => [{ ...fixture, has_attachment: false, desired_date: null }],
  });
  assert.equal(detail?.inspiration, null);
  assert.equal(detail?.desiredDate, null);
  const response = await getEnquiryAttachment(reference, services);
  assert.equal(response.status, 404);
  assert.match(response.headers.get("cache-control")!, /no-store/);
});

test("stats convert PostgreSQL count strings and account for all enquiry time windows", async () => {
  const stats = await getEnquiryStats({
    authorize,
    query: async (text, values) => {
      assert.match(text, /INTERVAL '7 days'/);
      assert.match(text, /INTERVAL '30 days'/);
      assert.deepEqual(values, []);
      return [{ total: "45", last_7_days: "6", last_30_days: "12", with_attachments: "9" }];
    },
  });
  assert.deepEqual(stats, { total: 45, last7Days: 6, last30Days: 12, withAttachments: 9 });
});

test("missing database configuration returns a safe application error after authorization", async () => {
  let authorized = false;
  await assert.rejects(
    () => getEnquiries({}, { authorize: async () => { authorized = true; }, env: {} }),
    EnquiryUnavailableError,
  );
  assert.ok(authorized);
});

function storedObject(bytes: Uint8Array, contentLength: number | undefined = bytes.length) {
  return {
    contentLength,
    body: new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(bytes); controller.close(); } }),
  };
}

test("attachments download privately using DB-selected keys, generated headers, and bounded bytes", async () => {
  const bytes = new TextEncoder().encode("%PDF-1.4\nhello");
  const response = await getEnquiryAttachment(reference.toUpperCase(), {
    authorize,
    env: {},
    query: async () => [{ ...fixture, inspiration_bytes: bytes.length }],
    readObject: async (input) => {
      assert.deepEqual(input, { Bucket: "viva-tile-studio", Key: fixture.inspiration_key });
      return storedObject(bytes);
    },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/pdf");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(response.headers.get("cache-control")!, /private, no-store/);
  assert.match(response.headers.get("content-disposition")!, /^attachment; filename="inspiration-[a-f0-9-]+\.pdf"$/);
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
});

test("attachment metadata cannot select another bucket, key, type or oversized object", async () => {
  for (const change of [
    { inspiration_bucket: "another-bucket" },
    { inspiration_key: "admin/private.json" },
    { inspiration_mime: "text/html" },
    { inspiration_bytes: 0 },
    { inspiration_bytes: 5 * 1024 * 1024 + 1 },
  ]) {
    let downloaded = false;
    await assert.rejects(() => getEnquiryAttachment(reference, {
      authorize,
      env: {},
      query: async () => [{ ...fixture, ...change }],
      readObject: async () => { downloaded = true; throw new Error("must never run"); },
    }), EnquiryUnavailableError);
    assert.equal(downloaded, false);
  }
});

test("attachment reads reject mismatched lengths and bound streams even without Content-Length", async () => {
  for (const [actualBytes, reportedBytes] of [[15, 14], [13, 14], [15, 15], [15, undefined]]) {
    await assert.rejects(() => getEnquiryAttachment(reference, {
      authorize,
      env: {},
      query: async () => [fixture],
      readObject: async () => {
        const object = storedObject(new Uint8Array(actualBytes!));
        return { ...object, contentLength: reportedBytes };
      },
    }), EnquiryUnavailableError);
  }
});

test("storage failures do not expose provider diagnostics or credentials", async () => {
  await assert.rejects(() => getEnquiryAttachment(reference, {
    authorize,
    env: {},
    query: async () => [fixture],
    readObject: async () => { throw new Error("private provider credential diagnostic"); },
  }), (error: unknown) => error instanceof EnquiryUnavailableError && !error.message.includes("credential"));
});
