import type { EnquiryRecord } from "./enquiry-neon";

export const ENQUIRY_DASHBOARD_URL =
  "https://vavi-tile-studio-dashboard.vercel.app/";

const subject = "New Inquiry — VAVI Tile Studio";
const heading = "You’ve received a new inquiry.";
const introduction =
  "A visitor has submitted an inquiry through the VAVI Tile Studio website. Review their details below and open your dashboard to follow up.";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

function detailRow(label: string, value: string) {
  return `<tr><td style="padding:16px 0;border-bottom:1px solid #d0c6ba;word-wrap:break-word;overflow-wrap:anywhere;">
    <p style="margin:0 0 5px;color:#57534d;font:12px/1.5 Arial,sans-serif;">${escapeHtml(label)}</p>
    <p style="margin:0;color:#1c1a1a;font:16px/1.6 Arial,sans-serif;word-break:break-word;">${escapeHtml(value).replace(/\r\n|\r|\n/g, "<br />")}</p>
  </td></tr>`;
}

/** Pure rendering: only the server notification worker sends the resulting email. */
export function renderEnquiryEmail(
  record: EnquiryRecord,
  timeZone = "America/Toronto",
): { subject: string; html: string; text: string } {
  // Include the IANA timezone and the offset at submission, including DST changes.
  const submitted = `${new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "longOffset",
  }).format(new Date(record.receivedAt))} (${timeZone})`;
  // A requested calendar day must not shift when rendered in another timezone.
  const desiredDate = record.desiredDate
    ? new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC", year: "numeric", month: "long", day: "numeric",
    }).format(new Date(`${record.desiredDate}T00:00:00Z`))
    : "";
  const details = [
    ["Name", record.name],
    ["Email address", record.email],
    ["Phone number", record.phone],
    ["Company / studio", record.company],
    ["Project type", record.projectType],
    ["Application", record.application],
    ["Location", record.location],
    ["Dimensions / area", record.dimensions],
    ["Desired date", desiredDate],
    ["Message", record.idea],
    ["Inspiration file", record.inspiration?.originalName ?? ""],
  ].filter(([, value]) => value.trim().length > 0);

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${subject}</title>
  <style>
    @media only screen and (max-width:480px) {
      .email-content { padding:28px 24px !important; }
      .email-heading { font-size:32px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#eae4da;color:#1c1a1a;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${heading} Open your dashboard to review the project details.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#eae4da;">
    <tr><td align="center" style="padding:24px 12px;">
      <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;table-layout:fixed;background-color:#faf8f4;">
        <tr><td style="height:5px;background-color:#303c32;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td class="email-content" style="padding:40px 40px 32px;">
          <p style="margin:0;color:#303c32;font:32px/1.1 Georgia,'Times New Roman',serif;letter-spacing:5px;">VAVI</p>
          <p style="margin:8px 0 36px;color:#57534d;font:10px/1.5 Arial,sans-serif;letter-spacing:3px;">TILE STUDIO</p>
          <h1 class="email-heading" style="margin:0 0 18px;color:#303c32;font:normal 38px/1.14 Georgia,'Times New Roman',serif;">${heading}</h1>
          <p style="margin:0 0 28px;color:#57534d;font:15px/1.7 Arial,sans-serif;">${introduction}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-top:1px solid #d0c6ba;">
            ${details.map(([label, value]) => detailRow(label, value)).join("\n")}
            ${detailRow("Submitted", submitted)}
          </table>
          <p style="margin:28px 0 20px;color:#57534d;font:14px/1.7 Arial,sans-serif;">Reply directly to this email to contact the visitor, or open your dashboard to review the inquiry.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
            <tr><td align="center" bgcolor="#303c32" style="background-color:#303c32;mso-padding-alt:16px 22px;">
              <a href="${ENQUIRY_DASHBOARD_URL}" style="display:inline-block;padding:16px 22px;color:#faf8f4;font:bold 14px/1.5 Arial,sans-serif;text-align:center;text-decoration:none;mso-padding-alt:0;">View Inquiry Dashboard</a>
            </td></tr>
          </table>
          <p style="margin:0;color:#57534d;font:12px/1.7 Arial,sans-serif;">If the button does not work, open this link:<br />
            <a href="${ENQUIRY_DASHBOARD_URL}" style="color:#303c32;text-decoration:underline;word-break:break-all;">${ENQUIRY_DASHBOARD_URL}</a>
          </p>
        </td></tr>
        <tr><td class="email-content" style="padding:24px 40px;background-color:#e4ded4;">
          <p style="margin:0;color:#57534d;font:12px/1.6 Arial,sans-serif;">VAVI Tile Studio · Website inquiry</p>
          <p style="margin:6px 0 0;color:#57534d;font:11px/1.6 Arial,sans-serif;word-break:break-all;">Reference: ${escapeHtml(record.reference)}</p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    "VAVI Tile Studio",
    heading,
    introduction,
    ...details.map(([label, value]) => `${label}: ${value}`),
    `Submitted: ${submitted}`,
    "Reply directly to this email to contact the visitor, or open your dashboard to review the inquiry.",
    `View Inquiry Dashboard: ${ENQUIRY_DASHBOARD_URL}`,
    `Reference: ${record.reference}`,
  ].join("\n\n");

  return { subject, html, text };
}
