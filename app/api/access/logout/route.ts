import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0
  });
  return response;
}
