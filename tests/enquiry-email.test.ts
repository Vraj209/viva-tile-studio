import assert from "node:assert/strict";
import test from "node:test";
import { ENQUIRY_DASHBOARD_URL, renderEnquiryEmail } from "../src/lib/enquiry-email";
import type { EnquiryRecord } from "../src/lib/enquiry-neon";

const record: EnquiryRecord = {
  reference: "cb6d2e8a-a4bb-4db7-a875-bdd987bd98f7",
  receivedAt: "2026-10-20T17:45:00.000Z",
  name: "Alex Designer",
  email: "alex@example.test",
  phone: "+1 555 0100",
  company: "Example Studio",
  projectType: "Residential",
  application: "Feature wall",
  location: "Toronto",
  dimensions: "3 by 2 metres",
  desiredDate: "2027-01-20",
  idea: "A botanical wall for a reading room.\nSoft green tones, please.",
  inspiration: {
    filename: "inspiration.pdf",
    originalName: "Reading room.pdf",
    mime: "application/pdf",
    bytes: 200,
  },
};

test("owner email includes the requested copy, all supplied fields, and both dashboard links", () => {
  const email = renderEnquiryEmail(record);
  assert.equal(email.subject, "New Inquiry — VAVI Tile Studio");
  for (const content of [
    "You’ve received a new inquiry.",
    "A visitor has submitted an inquiry through the VAVI Tile Studio website. Review their details below and open your dashboard to follow up.",
    record.name, record.email, record.phone, record.company, record.projectType,
    record.application, record.location, record.dimensions, "January 20, 2027",
    "Reading room.pdf", record.reference,
  ]) {
    assert.ok(email.html.includes(content), `HTML includes ${content}`);
    assert.ok(email.text.includes(content), `Plain text includes ${content}`);
  }
  assert.ok(email.html.includes(record.idea.replace("\n", "<br />")));
  assert.ok(email.text.includes(record.idea));
  assert.equal(ENQUIRY_DASHBOARD_URL, "https://dashboard.vavitilestudio.com/");
  assert.equal(email.html.split(`href="${ENQUIRY_DASHBOARD_URL}"`).length - 1, 2);
  assert.ok(email.html.includes(`>${ENQUIRY_DASHBOARD_URL}</a>`));
  assert.ok(email.html.includes(">View Inquiry Dashboard</a>"));
  assert.ok(email.text.includes(`View Inquiry Dashboard: ${ENQUIRY_DASHBOARD_URL}`));
});

test("empty optional fields are omitted in HTML and plain text", () => {
  const email = renderEnquiryEmail({
    ...record, phone: "  ", company: "", projectType: "", application: "",
    location: "", dimensions: "", desiredDate: "", inspiration: null,
  });
  for (const label of ["Phone number", "Company / studio", "Project type", "Application", "Location", "Dimensions / area", "Desired date", "Inspiration file"]) {
    assert.ok(!email.html.includes(label));
    assert.ok(!email.text.includes(label));
  }
  assert.ok(email.html.includes(record.name));
  assert.ok(email.text.includes(record.email));
});

test("visitor content is escaped and cannot introduce HTML or links", () => {
  const payload = '<a href="https://evil.example/">&\'hello\'</a><script>alert(1)</script>';
  const email = renderEnquiryEmail({
    ...record, name: payload, idea: `First line\r\n${payload}`, company: payload,
    inspiration: { ...record.inspiration!, originalName: payload },
  });
  assert.ok(!email.html.includes(payload));
  assert.ok(!email.html.includes('<a href="https://evil.example/">'));
  assert.ok(!email.html.includes("<script>"));
  assert.ok(email.html.includes("&lt;a href=&quot;https://evil.example/&quot;&gt;&amp;&#39;hello&#39;&lt;/a&gt;"));
  assert.ok(email.html.includes("First line<br />&lt;a"));
  assert.ok(email.text.includes(payload));
});

test("submission timestamp labels the actual timezone and daylight-saving offset", () => {
  const summer = renderEnquiryEmail(record);
  assert.match(summer.text, /October 20, 2026 at 1:45 p\.m\. GMT-04:00 \(America\/Toronto\)/);
  const winter = renderEnquiryEmail({ ...record, receivedAt: "2026-12-20T01:45:00.000Z" });
  assert.match(winter.text, /December 19, 2026 at 8:45 p\.m\. GMT-05:00 \(America\/Toronto\)/);
  const otherZone = renderEnquiryEmail(record, "Asia/Kolkata");
  assert.ok(otherZone.text.includes("GMT+05:30 (Asia/Kolkata)"));
  assert.ok(otherZone.text.includes("Desired date: January 20, 2027"));
});

test("invalid timestamps and timezone configuration fail rather than fabricating a submission time", () => {
  assert.throws(() => renderEnquiryEmail({ ...record, receivedAt: "invalid" }), RangeError);
  assert.throws(() => renderEnquiryEmail(record, "invalid/timezone"), RangeError);
});
