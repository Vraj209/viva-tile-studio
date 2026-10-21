import {
  notificationConfiguration,
  retryEnquiryNotifications,
} from "../src/lib/enquiry-notifications.ts";

// Deliberate operator action; use the same private environment as the website.
// Print counts/status only, never credentials, recipients, or inquiry content.
if (!process.env.DATABASE_URL || !notificationConfiguration(process.env)) {
  console.error(JSON.stringify({ processed: 0, status: "configuration_missing" }));
  process.exitCode = 1;
} else {
  try {
    const results = await retryEnquiryNotifications({ log: () => {} });
    const summary = {
      processed: results.length,
      sent: results.filter((status) => status === "sent").length,
      failed: results.filter((status) => status === "failed").length,
      needs_review: results.filter((status) => status === "needs_review").length,
    };
    console.log(JSON.stringify(summary));
    if (summary.failed || summary.needs_review) process.exitCode = 1;
  } catch {
    console.error(JSON.stringify({ processed: 0, status: "retry_failed" }));
    process.exitCode = 1;
  }
}
