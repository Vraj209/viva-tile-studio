import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import AuthFrame from "@/components/AuthFrame";
import VerifyEmailForm from "@/components/VerifyEmailForm";

export const dynamic = "force-dynamic";
export default async function VerifyEmailPage() {
  const access = await getOwner();
  if (access.status === "authorized") redirect("/");
  if (access.status === "forbidden") redirect("/access-denied");
  if (access.status !== "unverified") redirect("/login");
  return <AuthFrame title="Confirm it’s you." description="One quick check to keep customer details private."><VerifyEmailForm email={access.user.email} /></AuthFrame>;
}
