"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordForm({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !enabled) return;
    const email = String(new FormData(event.currentTarget).get("email")).trim();
    setPending(true); setError("");
    try {
      const result = await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/reset-password` });
      if (result.error) setError("We couldn’t process the request. Please try again in a moment.");
      else setSent(true);
    } catch { setError("The reset service is unavailable right now. Please try again."); }
    finally { setPending(false); }
  }
  return <div className="form-stack">
    {sent ? <p className="notice" role="status">If this email has an account, you’ll receive a link to choose a new password. Check your inbox and spam folder.</p> : <form onSubmit={submit} className="form-stack" aria-busy={pending}>
      {!enabled ? <p className="notice">Account setup must be completed before requesting a password reset.</p> : null}
      <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} disabled={!enabled || pending} /></div>
      <button className="button" disabled={!enabled || pending} type="submit">{pending ? "Requesting link…" : "Send reset link"}</button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>}
    <Link className="text-link" href="/login">Back to sign in</Link>
  </div>;
}
