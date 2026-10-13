import { getOwner } from "@/lib/auth";
import AuthFrame from "@/components/AuthFrame";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const dynamic = "force-dynamic";
export default async function ForgotPasswordPage() {
  const access = await getOwner();
  return <AuthFrame title="Forgot your password?" description="We’ll send you a secure link to get back into your workspace."><ForgotPasswordForm enabled={access.status !== "unconfigured"} /></AuthFrame>;
}
