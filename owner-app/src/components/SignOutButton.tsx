"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function signOut() {
    setPending(true);
    setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      // A full navigation removes the private workspace from the client router cache.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login");
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return (
    <div className="sign-out">
      <button className="sign-out-button" onClick={signOut} disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}<span aria-hidden="true">↗</span>
      </button>
      {error && <p className="sign-out-error" role="alert">Could not sign out. Please try again.</p>}
    </div>
  );
}

export default SignOutButton;
