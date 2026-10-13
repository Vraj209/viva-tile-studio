import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const owner = await getOwner();
  if (owner.status !== "authorized") redirect("/login");

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>My account<span className="title-dot">.</span></h1>
          <p>Your studio identity and sign-in details.</p>
        </div>
      </div>
      <div className="account-content">
        <section className="detail-panel" aria-labelledby="profile-heading">
          <div className="panel-heading"><span className="section-number">01</span><h2 id="profile-heading">Profile</h2></div>
          <dl className="detail-grid">
            <div><dt>Name</dt><dd>{owner.user.name || "Not provided"}</dd></div>
            <div><dt>Email address</dt><dd>{owner.user.email}</dd></div>
            <div><dt>Access level</dt><dd><span className="verified-badge">Studio owner</span></dd></div>
            <div><dt>Email status</dt><dd>Verified</dd></div>
          </dl>
        </section>
        <section className="detail-panel account-security" aria-labelledby="security-heading">
          <div className="panel-heading"><span className="section-number">02</span><h2 id="security-heading">Password & security</h2></div>
          <p>Reset your password using the email address associated with your account.</p>
          <Link href="/forgot-password" className="button button-secondary">Reset password<span aria-hidden="true">↗</span></Link>
        </section>
        <p className="inbox-note">Access to this workspace is managed by the studio administrator.</p>
      </div>
    </>
  );
}
