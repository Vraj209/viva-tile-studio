import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import AuthFrame from "@/components/AuthFrame";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";
export default async function AccessDeniedPage() {
  const access = await getOwner();
  if (access.status === "authorized") redirect("/");
  if (access.status === "unauthenticated" || access.status === "unconfigured") redirect("/login");
  if (access.status === "unverified") redirect("/verify-email");
  return <AuthFrame title="Access is restricted." description="This workspace is available to approved VAVI team members."><div className="form-stack"><p className="notice">Ask your workspace administrator to approve your account, or sign in with a different email.</p><SignOutButton /></div></AuthFrame>;
}
