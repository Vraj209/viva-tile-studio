import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateOwnerSession,
  isAllowedAuthEndpoint,
  OwnerAuthError,
  ownerFromAccess,
  parseOwnerEmails,
} from "../src/lib/access";

const now = Date.parse("2026-10-12T12:00:00.000Z");
const owners = parseOwnerEmails("owner@example.com, OTHER@example.com");
const session = () => ({
  session: { userId: "owner-1", expiresAt: "2026-10-13T12:00:00.000Z" },
  user: { id: "owner-1", email: "owner@example.com", emailVerified: true, name: "Owner" },
});

test("only exact configured email addresses can receive access", () => {
  assert.deepEqual([...parseOwnerEmails(" Owner@example.com,OWNER@example.com,*.example.com, @example.com")], ["owner@example.com"]);
  assert.equal(evaluateOwnerSession(session(), new Set(), now).status, "unconfigured");
  const denied = session();
  denied.user.email = "owner@example.com.attacker.test";
  assert.equal(evaluateOwnerSession(denied, owners, now).status, "forbidden");
});

test("an approved verified user receives only the minimal identity", () => {
  const current = session();
  current.user.email = "OWNER@example.com";
  assert.deepEqual(evaluateOwnerSession(current, owners, now), {
    status: "authorized",
    user: { id: "owner-1", email: "owner@example.com", name: "Owner" },
  });
});

test("missing, incomplete, expired, and mismatched sessions cannot authorize", () => {
  for (const value of [null, {}, { user: session().user }, { ...session(), session: {} }]) {
    assert.equal(evaluateOwnerSession(value, owners, now).status, "unauthenticated");
  }
  const expired = session();
  expired.session.expiresAt = new Date(now).toISOString();
  assert.equal(evaluateOwnerSession(expired, owners, now).status, "unauthenticated");
  expired.session.expiresAt = "invalid-date";
  assert.equal(evaluateOwnerSession(expired, owners, now).status, "unauthenticated");
  const mismatch = session();
  mismatch.session.userId = "another-account";
  assert.equal(evaluateOwnerSession(mismatch, owners, now).status, "unauthenticated");
});

test("unverified email and managed admin impersonation never grant owner access", () => {
  assert.equal(evaluateOwnerSession({ ...session(), user: { ...session().user, emailVerified: false } }, owners, now).status, "unverified");
  assert.equal(evaluateOwnerSession({ ...session(), user: { ...session().user, emailVerified: "true" } }, owners, now).status, "unverified");
  assert.equal(evaluateOwnerSession({ ...session(), user: { ...session().user, banned: true } }, owners, now).status, "forbidden");
  assert.equal(evaluateOwnerSession({ ...session(), session: { ...session().session, impersonatedBy: "admin-1" } }, owners, now).status, "forbidden");
});

test("failed access raises stable HTTP errors for protected data handlers", () => {
  for (const [code, status] of [["unauthenticated", 401], ["forbidden", 403], ["unverified", 403], ["unconfigured", 503], ["unavailable", 503]] as const) {
    assert.throws(() => ownerFromAccess(code === "unverified" ? { status: code, user: session().user } : { status: code }), (error: unknown) => error instanceof OwnerAuthError && error.code === code && error.status === status);
  }
});

test("public signup, admin, social, and unexpected auth paths are blocked", () => {
  for (const path of ["sign-up/email", "admin/create-user", "admin/impersonate-user", "sign-in/social", "update-user", "token", "sign-in/email/extra"]) {
    assert.equal(isAllowedAuthEndpoint("POST", path.split("/")), false);
  }
  assert.equal(isAllowedAuthEndpoint("POST", ["sign-in", "email"]), true);
  assert.equal(isAllowedAuthEndpoint("POST", ["request-password-reset"]), true);
  assert.equal(isAllowedAuthEndpoint("POST", ["reset-password"]), true);
  assert.equal(isAllowedAuthEndpoint("GET", ["get-session"]), true);
  assert.equal(isAllowedAuthEndpoint("GET", ["reset-password", "token"]), true);
  assert.equal(isAllowedAuthEndpoint("DELETE", ["get-session"]), false);
});
