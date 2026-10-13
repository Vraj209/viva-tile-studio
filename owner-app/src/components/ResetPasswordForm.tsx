"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import PasswordField from "./PasswordField";

export default function ResetPasswordForm({ token, invalid }: { token: string; invalid: boolean }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || invalid) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== data.get("confirmPassword")) { setError("The passwords don’t match."); return; }
    setPending(true); setError("");
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) setError("This reset link may have expired or already been used. Request a new link below.");
      else {
        setDone(true);
        window.history.replaceState(null, "", "/reset-password");
      }
    } catch { setError("We couldn’t reset your password. Please try again."); }
    finally { setPending(false); }
  }
  if (done) return <div className="form-stack"><p className="notice" role="status">Your password has been updated. Sign in with your new password.</p><Link className="button" href="/login">Back to sign in</Link></div>;
  if (invalid) return <div className="form-stack"><p className="notice">This reset link is missing or invalid. Request a fresh link to continue.</p><Link className="button" href="/forgot-password">Request a new link</Link></div>;
  return <form onSubmit={submit} className="form-stack" aria-busy={pending}>
    <fieldset disabled={pending} className="form-stack">
      <PasswordField label="New password" autoComplete="new-password" minLength={12} />
      <PasswordField label="Confirm new password" name="confirmPassword" autoComplete="new-password" minLength={12} />
      <p className="muted">Use 12 or more characters. A long, unique passphrase works well.</p>
      <button className="button" type="submit">{pending ? "Updating password…" : "Set new password"}</button>
    </fieldset>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <Link className="text-link" href="/forgot-password">Request a new reset link</Link>
  </form>;
}
