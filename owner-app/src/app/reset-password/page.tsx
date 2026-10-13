import AuthFrame from "@/components/AuthFrame";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const dynamic = "force-dynamic";
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";
  return <AuthFrame title="A fresh start." description="Choose a new password for your VAVI account."><ResetPasswordForm token={token} invalid={!token || token.length > 2048 || !!query.error} /></AuthFrame>;
}
