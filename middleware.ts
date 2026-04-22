import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE_NAME = "iotsec_access";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (token) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/access";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/devices/:path*", "/patches/:path*", "/schedules/:path*"]
};
