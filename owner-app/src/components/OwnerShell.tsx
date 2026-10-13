"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/SignOutButton";

type OwnerShellProps = {
  children: ReactNode;
  user: { name?: string | null; email: string };
};

export function OwnerShell({ children, user }: OwnerShellProps) {
  const pathname = usePathname();
  const accountPage = pathname.startsWith("/account");
  const displayName = user.name?.trim() || user.email;

  return (
    <div className="owner-layout">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="VAVI Tile Studio owner home">
          <span className="brand-wordmark">VAVI</span>
          <span className="brand-subtitle">TILE STUDIO</span>
        </Link>
        <div className="sidebar-section-label">STUDIO WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <Link href="/" aria-current={!accountPage ? "page" : undefined}>
            <span className="nav-symbol" aria-hidden="true">↘</span>
            Inquiries
            <span className="nav-indicator" aria-hidden="true" />
          </Link>
          <Link href="/account" aria-current={accountPage ? "page" : undefined}>
            <span className="nav-symbol" aria-hidden="true">○</span>
            My account
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="avatar" aria-hidden="true">{displayName.slice(0, 1).toUpperCase()}</span>
            <div className="sidebar-user-details">
              <strong>{displayName}</strong>
              <span>Owner access</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-topbar">
          <span>VAVI <span className="topbar-separator" aria-hidden="true">/</span> Owner portal</span>
          <span className="private-label"><span className="status-dot" aria-hidden="true" />Private workspace</span>
        </header>
        <main id="main" className="workspace-main">{children}</main>
        <footer className="workspace-footer">
          <span>VAVI Tile Studio</span><span>Times shown in Toronto (ET)</span>
        </footer>
      </div>
    </div>
  );
}
