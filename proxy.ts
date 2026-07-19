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

  // If the target URL is not the login page, we allow the response to proceed without modification. This ensures that users are redirected to the appropriate page based on their authentication status.
  if (targetUrl.pathname !== loginUrl.pathname) {
    return response;
  }

  // If the "redirectTo" query parameter is not already present in the target URL, we add it to ensure that the user is redirected back to their original destination after signing in. This helps maintain a smooth user experience by returning them to the page they were trying to access before being prompted to sign in.
  if (!targetUrl.searchParams.has("redirectTo")) {
    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    targetUrl.searchParams.set("redirectTo", requestedPath || "/");
  }

  // If the "toast" query parameter is not already present in the target URL, we add it to indicate that reauthentication is required. This ensures that the user receives a notification about the need to sign in again.
  if (!targetUrl.searchParams.has("toast")) {
    targetUrl.searchParams.set("toast", "reauth-required");
  }

  response.headers.set("location", targetUrl.toString());

  return response;
}

export const config = {
  matcher: ["/account/:path*"],
};
