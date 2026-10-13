import { type NextRequest } from "next/server";
import { isAllowedAuthEndpoint } from "@/lib/access";
import { getAuth, isOwnerAccessConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AuthContext = { params: Promise<{ path: string[] }> };

async function handleAuth(request: NextRequest, context: AuthContext) {
  const { path } = await context.params;
  if (!isAllowedAuthEndpoint(request.method, path)) {
    return Response.json(
      { code: "AUTH_ROUTE_DISABLED", message: "This account operation is not available." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  const auth = getAuth();
  if (!auth || !isOwnerAccessConfigured()) {
    return Response.json(
      { code: "AUTH_NOT_CONFIGURED", message: "Owner access has not been configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const handlers = auth.handler();
    const handler = request.method === "GET" ? handlers.GET : handlers.POST;
    const response = await handler(request, context);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return Response.json(
      { code: "AUTH_UNAVAILABLE", message: "Account services are unavailable. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const GET = handleAuth;
export const POST = handleAuth;
