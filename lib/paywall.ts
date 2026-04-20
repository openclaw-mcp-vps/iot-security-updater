import crypto from "node:crypto";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, ACCESS_DURATION_DAYS } from "@/lib/constants";
import { getPurchases, setPurchases } from "@/lib/storage";
import type { PurchaseRecord } from "@/lib/types";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hasAccessCookie(): Promise<boolean> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value === "granted";
}

export function webhookSignatureMatches(rawBody: string, incomingSignature: string | null, secret: string): boolean {
  if (!incomingSignature || !secret) {
    return false;
  }

  const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(computed, "utf-8");
  const right = Buffer.from(incomingSignature, "utf-8");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export async function markPurchaseActive(email: string, lastOrderId?: string): Promise<PurchaseRecord> {
  const normalized = normalizeEmail(email);
  const purchases = await getPurchases();
  const existing = purchases.find((purchase) => purchase.email === normalized);

  const record: PurchaseRecord = existing
    ? {
        ...existing,
        active: true,
        lastOrderId: lastOrderId ?? existing.lastOrderId
      }
    : {
        id: crypto.randomUUID(),
        email: normalized,
        source: "lemonsqueezy-webhook",
        active: true,
        createdAt: new Date().toISOString(),
        lastOrderId
      };

  const rest = purchases.filter((purchase) => purchase.id !== record.id);
  rest.unshift(record);
  await setPurchases(rest);

  return record;
}

export async function hasActivePurchase(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const purchases = await getPurchases();

  return purchases.some((purchase) => purchase.email === normalized && purchase.active);
}

export function accessCookieConfig() {
  return {
    name: ACCESS_COOKIE,
    value: "granted",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ACCESS_DURATION_DAYS * 24 * 60 * 60
  };
}
