import { enquiryAvailability, handleEnquiry } from "../../../lib/enquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(enquiryAvailability(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  return handleEnquiry(request);
}
