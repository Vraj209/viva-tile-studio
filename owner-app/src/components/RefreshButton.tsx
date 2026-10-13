"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="button button-secondary"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      aria-busy={pending}
    >
      <span aria-hidden="true">↻</span>{pending ? "Refreshing…" : "Refresh"}
    </button>
  );
}
