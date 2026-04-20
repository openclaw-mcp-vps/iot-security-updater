import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/constants";

const protectedPagePrefixes = ["/dashboard", "/devices", "/patches", "/settings"];
const protectedApiPrefixes = ["/api/devices", "/api/patches"];

function pathStartsWith(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccess = request.cookies.get(ACCESS_COOKIE)?.value === "granted";

  const isProtectedPage = pathStartsWith(pathname, protectedPagePrefixes);
  const isProtectedApi = pathStartsWith(pathname, protectedApiPrefixes);

  if (!hasAccess && isProtectedApi) {
    return NextResponse.json(
      {
        error: "Paid access required. Complete checkout and unlock from /unlock first."
      },
      { status: 402 }
    );
  }

  if (!hasAccess && isProtectedPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/unlock";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/devices/:path*", "/patches/:path*", "/settings/:path*", "/api/devices/:path*", "/api/patches/:path*"]
};
