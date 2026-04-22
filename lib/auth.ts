import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ACCESS_COOKIE_NAME = "iotsec_access";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 30;

function cookieSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-dev-cookie-secret";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function issueAccessToken(email: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + COOKIE_TTL_SECONDS;
  const normalizedEmail = normalizeEmail(email);
  const payload = `${normalizedEmail}|${expiresAt}`;
  const signature = createHmac("sha256", cookieSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}|${signature}`).toString("base64url");
}

export function verifyAccessToken(token: string): { valid: boolean; email?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [email, expiresRaw, signature] = decoded.split("|");
    if (!email || !expiresRaw || !signature) {
      return { valid: false };
    }

    const payload = `${email}|${expiresRaw}`;
    const expected = createHmac("sha256", cookieSecret()).update(payload).digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const actualBuffer = Buffer.from(signature, "hex");

    if (expectedBuffer.length !== actualBuffer.length) {
      return { valid: false };
    }

    if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
      return { valid: false };
    }

    const expiresAt = Number(expiresRaw);
    if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

export function hasValidAccess(request: NextRequest): boolean {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }

  return verifyAccessToken(token).valid;
}
