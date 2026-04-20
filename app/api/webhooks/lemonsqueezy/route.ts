import { NextResponse } from "next/server";
import { markPurchaseActive, webhookSignatureMatches } from "@/lib/paywall";

function extractCustomerEmail(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = (payload as { data?: { attributes?: Record<string, unknown> } }).data;
  const attributes = data?.attributes;
  if (!attributes) {
    return null;
  }

  const email = attributes.user_email ?? attributes.email ?? attributes.customer_email;
  return typeof email === "string" ? email : null;
}

function extractOrderId(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const data = (payload as { data?: { id?: string } }).data;
  return data?.id;
}

const activatingEvents = new Set(["order_created", "subscription_created", "subscription_payment_success"]);

export async function POST(request: Request) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "LEMON_SQUEEZY_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? request.headers.get("X-Signature");

  if (!webhookSignatureMatches(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const eventName = request.headers.get("x-event-name") ?? request.headers.get("X-Event-Name") ?? "unknown";

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  if (!activatingEvents.has(eventName)) {
    return NextResponse.json({ received: true, ignored: true, eventName });
  }

  const email = extractCustomerEmail(payload);
  if (!email) {
    return NextResponse.json({ error: "No customer email was provided in webhook payload." }, { status: 400 });
  }

  const purchase = await markPurchaseActive(email, extractOrderId(payload));

  return NextResponse.json({ received: true, activatedEmail: purchase.email, eventName });
}
