import { handleNotificationRetry } from "../../../../../lib/enquiry-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET supports a secured scheduler; POST supports an operator's explicit retry.
export async function GET(request: Request) { return handleNotificationRetry(request); }
export async function POST(request: Request) { return handleNotificationRetry(request); }
