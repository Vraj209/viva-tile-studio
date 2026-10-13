import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import AuthFrame from "@/components/AuthFrame";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  const access = await getOwner();
  if (access.status === "authorized") redirect("/");
  if (access.status === "unverified") redirect("/verify-email");
  if (access.status === "forbidden") redirect("/access-denied");
  return <AuthFrame title="Welcome back." description="Sign in to view your project inquiries."><LoginForm enabled={access.status !== "unconfigured"} /></AuthFrame>;
}
