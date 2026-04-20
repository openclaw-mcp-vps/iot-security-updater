import { NextResponse } from "next/server";
import { z } from "zod";
import { accessCookieConfig, hasActivePurchase } from "@/lib/paywall";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const allowBypass = process.env.NODE_ENV !== "production" && process.env.ALLOW_UNLOCK_WITHOUT_PURCHASE === "true";
    const hasPurchase = allowBypass ? true : await hasActivePurchase(email);

    if (!hasPurchase) {
      return NextResponse.json(
        {
          error:
            "No active purchase found for this email yet. Complete checkout first, then retry after webhook delivery reaches this app."
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(accessCookieConfig());

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify access.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
