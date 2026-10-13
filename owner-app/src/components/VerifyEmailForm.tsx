"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import SignOutButton from "./SignOutButton";

export default function VerifyEmailForm({ email }: { email: string }) {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function sendCode() {
    if (pending) return;
    setPending(true); setError("");
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
      if (result.error) setError("We couldn’t send a code. Please try again in a moment.");
      else setSent(true);
    } catch { setError("The verification service is unavailable. Please try again."); }
    finally { setPending(false); }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const otp = String(new FormData(event.currentTarget).get("code")).trim();
    setPending(true); setError("");
    try {
      const result = await authClient.emailOtp.verifyEmail({ email, otp });
      if (result.error) setError("That code is invalid or has expired. Try again or request a new code.");
      else {
        // Reload to discard access-denied data cached before email verification.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/");
      }
    } catch { setError("We couldn’t verify the code. Please try again."); }
    finally { setPending(false); }
  }
  return <div className="form-stack">
    <p className="notice">Verify <strong>{email}</strong> to access customer inquiries.</p>
    {sent ? <p className="form-success" role="status">A verification code has been requested. Check your inbox and spam folder.</p> : null}
    <button className="button button-secondary" onClick={sendCode} disabled={pending}>{pending ? "Please wait…" : sent ? "Send a new code" : "Send verification code"}</button>
    <form onSubmit={verify} className="form-stack" aria-busy={pending}>
      <div className="field"><label htmlFor="code">Verification code</label><input id="code" name="code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} minLength={6} required disabled={pending} /></div>
      <button className="button" disabled={pending}>Verify email</button>
    </form>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <SignOutButton />
  </div>;
}
