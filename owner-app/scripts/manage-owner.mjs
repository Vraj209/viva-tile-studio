import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";

const help = `Create an approved owner account and email a password setup link.

Usage:
  npm run owner:setup -- --email owner@example.com --name "Owner Name" --origin http://localhost:3001
  npm run owner:setup -- --email owner@example.com --origin https://owners.example.com --reset-only

Required environment: NEON_AUTH_BASE_URL and OWNER_EMAILS.
The account email must already be in the comma-separated OWNER_EMAILS allowlist.
The app origin must be a trusted domain in Neon Auth. Use the deployed owner app origin in production.

This command sends account emails. It never prints or stores a password.
After setting a password, verify the email through the app's verification form.
Use --reset-only for an existing account. Revoke access by removing its email from OWNER_EMAILS and redeploying.
`;

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      origin: { type: "string" },
      "reset-only": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(help);
    return;
  }

  const email = values.email?.trim().toLowerCase();
  const name = values.name?.trim();
  const allowedEmails = new Set((process.env.OWNER_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()));
  if (!email || !/^[^\s@*,;]+@[^\s@*,;]+\.[^\s@*,;]+$/.test(email) || !allowedEmails.has(email)) {
    throw new Error("Provide --email and add that exact address to OWNER_EMAILS before creating an account.");
  }
  if (!values["reset-only"] && (!name || name.length > 100)) {
    throw new Error("Provide --name (1–100 characters) for the new owner.");
  }
  if (!process.env.NEON_AUTH_BASE_URL) throw new Error("Configure NEON_AUTH_BASE_URL in .env.local first.");
  const authUrl = new URL(process.env.NEON_AUTH_BASE_URL);
  if (authUrl.protocol !== "https:" || authUrl.username || authUrl.password || authUrl.search || authUrl.hash) {
    throw new Error("NEON_AUTH_BASE_URL must be an HTTPS Auth URL without credentials or query parameters.");
  }
  if (!values.origin) throw new Error("Provide --origin for the owner app, including http:// or https://.");
  const originUrl = new URL(values.origin);
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(originUrl.hostname);
  if (
    (originUrl.protocol !== "https:" && !(isLocal && originUrl.protocol === "http:")) ||
    originUrl.username || originUrl.password || originUrl.search || originUrl.hash ||
    (originUrl.pathname !== "/" && originUrl.pathname !== "")
  ) {
    throw new Error("Use an HTTPS owner app origin, or HTTP localhost for local development.");
  }

  const authBase = authUrl.toString().replace(/\/$/, "") + "/";
  async function authRequest(path, body) {
    const response = await fetch(new URL(path, authBase), {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: originUrl.origin },
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      if (path === "sign-up/email" && data?.code === "USER_ALREADY_EXISTS") {
        throw new Error("The account already exists. Run this command with --reset-only to send a setup link.");
      }
      // Do not print raw auth responses, which can contain session details.
      throw new Error(`Managed Auth rejected ${path} (HTTP ${response.status}). Check Auth configuration and trusted domains in Neon.`);
    }
  }

  if (!values["reset-only"]) {
    await authRequest("sign-up/email", {
      email,
      name,
      password: `${randomBytes(36).toString("base64url")}A!1`,
    });
    console.log("Owner identity created. No password was printed or stored.");
  }

  await authRequest("request-password-reset", {
    email,
    redirectTo: `${originUrl.origin}/reset-password`,
  });
  console.log("Password setup requested. Check the owner's inbox for the link, then verify the email in the app before opening enquiries.");
  console.log("If setup email delivery fails, correct the Neon email configuration and rerun with --reset-only.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Owner setup failed.");
  process.exitCode = 1;
});
