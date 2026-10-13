import { OwnerAuthError } from "@/lib/auth";
import { EnquiryUnavailableError, getEnquiryAttachment } from "@/lib/enquiries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    return await getEnquiryAttachment(id);
  } catch (error) {
    const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
    if (error instanceof OwnerAuthError)
      return Response.json({ message: "Sign in with an authorized owner account to download this attachment." }, { status: error.status, headers });
    if (error instanceof EnquiryUnavailableError)
      return Response.json({ message: "This attachment is temporarily unavailable. Please try again." }, { status: 503, headers });
    throw error;
  }
}
