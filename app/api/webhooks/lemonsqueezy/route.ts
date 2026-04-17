import { NextResponse } from "next/server";

import {
  extractSessionIdFromWebhook,
  verifyLemonSqueezySignature,
  webhookRepresentsActivePayment
} from "@/lib/lemonsqueezy";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

type PaymentStore = {
  paidSessions: string[];
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonSqueezySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventPayload = payload as {
    meta?: { event_name?: string };
    data?: { attributes?: { status?: string } };
  };

  if (!webhookRepresentsActivePayment(eventPayload)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const sessionId = extractSessionIdFromWebhook(eventPayload);
  if (!sessionId) {
    return NextResponse.json({ received: true, ignored: true, reason: "missing_session_id" });
  }

  const store = await readJsonFile<PaymentStore>("payments.json", { paidSessions: [] });
  if (!store.paidSessions.includes(sessionId)) {
    store.paidSessions.push(sessionId);
    await writeJsonFile("payments.json", store);
  }

  return NextResponse.json({ received: true, unlockedSession: sessionId });
}
