import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_COOKIE_NAME, issueAccessToken, normalizeEmail } from "@/lib/auth";
import { readDataFile } from "@/lib/storage";
import type { PurchaseRecord } from "@/lib/types";

const unlockSchema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  const payload = unlockSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Provide a valid purchase email." }, { status: 400 });
  }

  const purchases = await readDataFile<PurchaseRecord[]>("purchases.json", []);
  const email = normalizeEmail(payload.data.email);
  const matching = purchases.find((purchase) => normalizeEmail(purchase.email) === email);

  if (!matching) {
    return NextResponse.json(
      {
        error:
          "No completed checkout found for that email yet. Complete Stripe checkout and retry in a few seconds."
      },
      { status: 403 }
    );
  }

  const token = issueAccessToken(email);
  const response = NextResponse.json({ message: "Purchase verified. Redirecting to dashboard." });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
