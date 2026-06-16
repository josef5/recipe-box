import { auth } from "@/lib/auth/server";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const authMiddleware = auth.middleware({
  loginUrl: "/sign-in",
});

export default async function proxy(request: NextRequest) {
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }

  const response = await authMiddleware(request);
  const redirectLocation = response.headers.get("location");

  if (!redirectLocation) {
    return response;
  }

  const loginUrl = new URL("/sign-in", request.url);
  const targetUrl = new URL(redirectLocation, request.url);

  if (targetUrl.pathname !== loginUrl.pathname) {
    return response;
  }

  if (!targetUrl.searchParams.has("redirectTo")) {
    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    targetUrl.searchParams.set("redirectTo", requestedPath || "/");
    response.headers.set("location", targetUrl.toString());
  }

  return response;
}

export const config = {
  matcher: ["/account/:path*"],
};
