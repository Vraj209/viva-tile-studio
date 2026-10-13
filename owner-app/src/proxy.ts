import { NextResponse, type NextRequest } from "next/server";
import { getAuth, isOwnerAccessConfigured } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  if (!isOwnerAccessConfigured()) return NextResponse.next();
  const auth = getAuth();
  if (!auth) return NextResponse.next();

  try {
    // Refresh and clean up cookies in a context that can write them. This is only
    // a navigation optimization: every page/data handler still requires a fresh
    // upstream session and the server-side owner allowlist through requireOwner.
    return await auth.middleware({ loginUrl: "/login" })(request);
  } catch {
    // Let the page's strict getOwner check show a service error without a loop.
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/", "/enquiries/:path*", "/account/:path*"],
};
