import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth";
import { readDataFile, writeDataFile } from "@/lib/storage";
import type { PurchaseRecord } from "@/lib/types";

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string): boolean {
  const pieces = signatureHeader.split(",").map((part) => part.trim());
  const timestampPart = pieces.find((part) => part.startsWith("t="));
  const signatures = pieces.filter((part) => part.startsWith("v1=")).map((part) => part.replace("v1=", ""));

  if (!timestampPart || signatures.length === 0) {
    return false;
  }

  const timestamp = timestampPart.replace("t=", "");
  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");

  return signatures.some((candidate) => {
    try {
      const expectedBuffer = Buffer.from(expected, "hex");
      const candidateBuffer = Buffer.from(candidate, "hex");
      if (expectedBuffer.length !== candidateBuffer.length) {
        return false;
      }
      return timingSafeEqual(expectedBuffer, candidateBuffer);
    } catch {
      return false;
    }
  });
}

function extractEmailFromCheckoutEvent(eventData: unknown): string | null {
  if (!eventData || typeof eventData !== "object") {
    return null;
  }

  const object = eventData as {
    customer_email?: string;
    customer_details?: { email?: string };
  };

  const email = object.customer_email || object.customer_details?.email;
  return email ? normalizeEmail(email) : null;
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is missing." }, { status: 500 });
  }

  if (!signature || !verifyStripeSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: unknown }; id?: string };
  try {
    event = JSON.parse(payload) as { type?: string; data?: { object?: unknown }; id?: string };
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const email = extractEmailFromCheckoutEvent(event.data?.object);

    if (email) {
      const purchases = await readDataFile<PurchaseRecord[]>("purchases.json", []);
      const existing = purchases.find((purchase) => normalizeEmail(purchase.email) === email);

      if (!existing) {
        purchases.push({
          email,
          sessionId: event.id || `session_${Date.now()}`,
          purchasedAt: new Date().toISOString(),
          plan: "$12/month"
        });
        await writeDataFile("purchases.json", purchases);
      }
    }
  }

  return NextResponse.json({ received: true });
}
