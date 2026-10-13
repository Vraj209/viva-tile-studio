import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { OwnerShell } from "@/components/OwnerShell";
import { getOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const owner = await getOwner();
  if (owner.status === "unauthenticated") redirect("/login");
  if (owner.status === "forbidden" || owner.status === "unverified") redirect("/access-denied");
  if (owner.status !== "authorized") {
    return (
      <main id="main" className="setup-screen">
        <Link href="/login" className="setup-brand">VAVI<span>OWNER PORTAL</span></Link>
        <section className="auth-card">
          <span className="eyebrow">OWNER WORKSPACE</span>
          <h1>{owner.status === "unconfigured" ? "Your workspace is almost ready." : "We couldn’t connect."}</h1>
          <p>{owner.status === "unconfigured"
            ? "Owner access needs to be connected before you can open the inbox. Ask your administrator to finish the owner portal setup."
            : "The sign-in service is temporarily unavailable. Please try again in a moment."}</p>
          <Link href="/login" className="button">Return to sign in</Link>
        </section>
      </main>
    );
  }
  return <OwnerShell user={owner.user}>{children}</OwnerShell>;
}
