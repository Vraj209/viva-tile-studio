/** Authorization policy for the owner application. This module contains no secrets. */
export type OwnerUser = {
  id: string;
  email: string;
  name: string;
};

export type OwnerAccess =
  | { status: "authorized"; user: OwnerUser }
  | { status: "unverified"; user: OwnerUser }
  | { status: "unauthenticated" | "forbidden" | "unconfigured" | "unavailable" };

export type OwnerAuthCode = Exclude<OwnerAccess["status"], "authorized">;

const accessErrors: Record<OwnerAuthCode, { status: number; message: string }> = {
  unauthenticated: { status: 401, message: "Sign in to access owner enquiries." },
  unverified: { status: 403, message: "Verify your email before accessing enquiries." },
  forbidden: { status: 403, message: "This account does not have owner access." },
  unconfigured: { status: 503, message: "Owner access has not been configured." },
  unavailable: { status: 503, message: "We could not verify your session. Please try again." },
};

export class OwnerAuthError extends Error {
  readonly code: OwnerAuthCode;
  readonly status: number;

  constructor(code: OwnerAuthCode) {
    super(accessErrors[code].message);
    this.name = "OwnerAuthError";
    this.code = code;
    this.status = accessErrors[code].status;
  }
}

/** Exact email matches only: never treat domains, wildcards, or substrings as owners. */
export function parseOwnerEmails(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => /^[^\s@*,;]+@[^\s@*,;]+\.[^\s@*,;]+$/.test(email)),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Only pass data obtained from a fresh, server-verified managed Auth session. */
export function evaluateOwnerSession(
  value: unknown,
  allowedEmails: ReadonlySet<string>,
  now = Date.now(),
): OwnerAccess {
  if (allowedEmails.size === 0) return { status: "unconfigured" };
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value.session)) {
    return { status: "unauthenticated" };
  }

  const { user, session } = value;
  const expiresAt = session.expiresAt instanceof Date
    ? session.expiresAt.getTime()
    : typeof session.expiresAt === "string" ? Date.parse(session.expiresAt) : NaN;

  if (
    typeof user.id !== "string" || !user.id ||
    typeof user.email !== "string" || !user.email ||
    session.userId !== user.id ||
    !Number.isFinite(expiresAt) || expiresAt <= now
  ) {
    return { status: "unauthenticated" };
  }

  const email = user.email.trim().toLowerCase();
  if (!allowedEmails.has(email) || user.banned === true || session.impersonatedBy) {
    return { status: "forbidden" };
  }

  const owner = { id: user.id, email, name: typeof user.name === "string" ? user.name : email };
  if (user.emailVerified !== true) return { status: "unverified", user: owner };
  return { status: "authorized", user: owner };
}

export function ownerFromAccess(access: OwnerAccess): OwnerUser {
  if (access.status !== "authorized") throw new OwnerAuthError(access.status);
  return access.user;
}

/** Only email/password account workflows are exposed by this private app. */
export function isAllowedAuthEndpoint(method: string, path: readonly string[]): boolean {
  const endpoint = path.join("/");
  if (method === "GET") return endpoint === "get-session" || /^reset-password\/[^/]+$/.test(endpoint);
  if (method !== "POST") return false;
  return new Set([
    "sign-in/email",
    "sign-out",
    "request-password-reset",
    "reset-password",
    "change-password",
    "email-otp/send-verification-otp",
    "email-otp/verify-email",
  ]).has(endpoint);
}
