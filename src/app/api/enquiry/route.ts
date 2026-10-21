import { enquiryAvailability, handleEnquiry } from "../../../lib/enquiry";
import { after } from "next/server";
import { deliverEnquiryNotification } from "../../../lib/enquiry-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  return Response.json(enquiryAvailability(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  return handleEnquiry(request, {
    onSaved: (reference) => after(async () => { await deliverEnquiryNotification(reference); }),
  });
}
