import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";
import {
  evaluateOwnerSession,
  ownerFromAccess,
  parseOwnerEmails,
  type OwnerAccess,
} from "./access";

export { OwnerAuthError } from "./access";
export type { OwnerAccess, OwnerUser } from "./access";

type ManagedAuth = ReturnType<typeof createNeonAuth>;
let authInstance: ManagedAuth | undefined;

function readAuthConfiguration() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL?.trim();
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!baseUrl || !secret || secret.length < 32) return null;

  try {
    const url = new URL(baseUrl);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return null;
  } catch {
    return null;
  }

  return { baseUrl, secret };
}

/** Configuration is checked at request time so an unconfigured deployment stays locked. */
export function isOwnerAccessConfigured(): boolean {
  return readAuthConfiguration() !== null && parseOwnerEmails(process.env.OWNER_EMAILS).size > 0;
}

export function getAuth(): ManagedAuth | null {
  const config = readAuthConfiguration();
  if (!config) return null;

  authInstance ??= createNeonAuth({
    baseUrl: config.baseUrl,
    cookies: {
      secret: config.secret,
      sameSite: "lax",
    },
  });

  return authInstance;
}

/** Every protected read and write verifies the upstream session before applying owner policy. */
export async function getOwner(): Promise<OwnerAccess> {
  const allowedEmails = parseOwnerEmails(process.env.OWNER_EMAILS);
  if (allowedEmails.size === 0 || !readAuthConfiguration()) return { status: "unconfigured" };

  try {
    const auth = getAuth();
    if (!auth) return { status: "unconfigured" };
    // The managed SDK requires the literal query string "true" to skip its signed
    // session_data cookie. A boolean would leave revoked sessions cached.
    const { data, error } = await auth.getSession({
      query: {
        disableCookieCache: "true",
        // Server Components cannot write cookies; the browser proxy handles renewal.
        disableRefresh: "true",
      },
    });
    if (error) {
      return { status: error.status === 401 || error.status === 403 ? "unauthenticated" : "unavailable" };
    }
    return evaluateOwnerSession(data, allowedEmails);
  } catch {
    // Never include upstream payloads, cookies, or credentials in user-facing errors.
    return { status: "unavailable" };
  }
}

export async function requireOwner() {
  return ownerFromAccess(await getOwner());
}
