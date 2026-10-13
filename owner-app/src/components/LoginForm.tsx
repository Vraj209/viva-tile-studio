"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import PasswordField from "./PasswordField";

export default function LoginForm({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !enabled) return;
    const form = new FormData(event.currentTarget);
    setPending(true); setError("");
    try {
      const result = await authClient.signIn.email({ email: String(form.get("email")).trim(), password: String(form.get("password")) });
      if (result.error) {
        setError("We couldn’t sign you in. Check your email and password, or reset your password.");
      } else {
        // Reload so the workspace cannot reuse a previous account's router cache.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/");
      }
    } catch { setError("Sign-in is unavailable right now. Please try again."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="form-stack" aria-busy={pending}>
    {!enabled ? <p className="notice">Owner access is waiting to be activated. Add your approved owner email and finish account setup to sign in.</p> : null}
    <fieldset disabled={!enabled || pending} className="form-stack">
      <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="username" placeholder="you@company.com" maxLength={254} required /></div>
      <PasswordField />
      <Link className="text-link" href="/forgot-password">Forgot your password?</Link>
      <button className="button" type="submit">{pending ? "Signing in…" : "Sign in to your workspace"}</button>
    </fieldset>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <p className="muted">Access is limited to approved VAVI team accounts.</p>
  </form>;
}
