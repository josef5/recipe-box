// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const base64 = authHeader.split(" ")[1];
    const decoded = atob(base64);
    const [, password] = decoded.split(":");

    if (password === process.env.SITE_PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="recipe-box"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
