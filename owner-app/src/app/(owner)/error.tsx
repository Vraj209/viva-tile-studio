"use client";

import Link from "next/link";

export default function OwnerError({ retry }: { retry: () => void }) {
  return (
    <section className="error-state" role="alert">
      <span className="eyebrow">Connection interrupted</span>
      <h1>We couldn’t load this page.</h1>
      <p>Your inquiries are still saved. Try again to reconnect to your workspace.</p>
      <div className="button-row">
        <button className="button" onClick={() => retry()}>Try again</button>
        <Link className="button button-secondary" href="/login">Return to sign in</Link>
      </div>
    </section>
  );
}
