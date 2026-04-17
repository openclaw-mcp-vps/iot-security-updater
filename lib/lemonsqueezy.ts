import crypto from "node:crypto";

const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;

export function getCheckoutOverlayUrl(sessionId: string): string {
  if (!productId || !storeId) {
    return "";
  }

  const base = `https://app.lemonsqueezy.com/checkout/buy/${productId}`;
  const query = new URLSearchParams({
    checkout: "1",
    embed: "1",
    media: "0",
    logo: "0",
    desc: "1",
    discount: "0",
    "checkout[custom][session_id]": sessionId,
    "checkout[custom][store_id]": storeId
  });

  return `${base}?${query.toString()}`;
}

export function verifyLemonSqueezySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

type LemonSqueezyWebhookPayload = {
  meta?: {
    custom_data?: {
      session_id?: string;
    };
    event_name?: string;
  };
  data?: {
    attributes?: {
      status?: string;
      first_order_item?: {
        custom_data?: {
          session_id?: string;
        };
      };
      custom_data?: {
        session_id?: string;
      };
    };
  };
};

export function extractSessionIdFromWebhook(payload: LemonSqueezyWebhookPayload): string {
  const fromMeta = payload.meta?.custom_data?.session_id;
  const fromData = payload.data?.attributes?.custom_data?.session_id;
  const fromOrderItem = payload.data?.attributes?.first_order_item?.custom_data?.session_id;
  return fromMeta ?? fromData ?? fromOrderItem ?? "";
}

export function webhookRepresentsActivePayment(payload: LemonSqueezyWebhookPayload): boolean {
  const event = payload.meta?.event_name ?? "";
  const status = payload.data?.attributes?.status ?? "";

  if (event === "order_created" || event === "subscription_payment_success") {
    return true;
  }

  if (event === "subscription_created" || event === "subscription_updated") {
    return status === "active" || status === "on_trial";
  }

  return false;
}
