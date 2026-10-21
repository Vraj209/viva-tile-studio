import test from "node:test";
import assert from "node:assert/strict";
import { enquirySubmissionIdentity } from "../src/lib/enquiry-submission";

function form() {
  const data = new FormData();
  data.set("name", "A Designer");
  data.set("email", "designer@example.com");
  data.set("idea", "A botanical wall for a reading room.");
  return data;
}

test("an unchanged retry reuses its UUID even with a fresh FormData instance", async () => {
  const first = await enquirySubmissionIdentity(form(), null);
  assert.match(first.key, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(await enquirySubmissionIdentity(form(), first), first);
});

test("changed details and an intentional new inquiry receive new keys", async () => {
  const data = form();
  const first = await enquirySubmissionIdentity(data, null);
  data.set("phone", "+1 226 555 0100");
  assert.notEqual((await enquirySubmissionIdentity(data, first)).key, first.key);
  assert.notEqual((await enquirySubmissionIdentity(form(), null)).key, first.key);
});

test("attachment bytes distinguish files even when metadata matches", async () => {
  const data = form();
  data.set("inspiration", new File(["original"], "plan.pdf", { type: "application/pdf", lastModified: 1 }));
  const first = await enquirySubmissionIdentity(data, null);
  data.set("inspiration", new File(["original"], "plan.pdf", { type: "application/pdf", lastModified: 2 }));
  assert.equal(await enquirySubmissionIdentity(data, first), first);
  data.set("inspiration", new File(["modified"], "plan.pdf", { type: "application/pdf", lastModified: 2 }));
  assert.notEqual((await enquirySubmissionIdentity(data, first)).key, first.key);
});

test("field insertion order does not turn a retry into another inquiry", async () => {
  const first = await enquirySubmissionIdentity(form(), null);
  const reversed = new FormData();
  for (const [key, value] of Array.from(form().entries()).reverse()) reversed.set(key, value);
  assert.equal(await enquirySubmissionIdentity(reversed, first), first);
});

test("an optional upload control becoming available does not duplicate a fileless retry", async () => {
  const data = form();
  const first = await enquirySubmissionIdentity(data, null);
  data.set("inspiration", new File([], "", { type: "application/octet-stream" }));
  assert.equal(await enquirySubmissionIdentity(data, first), first);
});
