"use client";

import { useMemo } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Url?: {
        Open: (url: string) => void;
      };
    };
  }
}

interface CheckoutOverlayButtonProps {
  className?: string;
}

function resolveCheckoutUrl(): string {
  const productOrUrl = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID?.trim() ?? "";
  if (productOrUrl.startsWith("https://")) {
    return productOrUrl;
  }

  if (productOrUrl.length === 0) {
    return "";
  }

  return `https://checkout.lemonsqueezy.com/buy/${productOrUrl}`;
}

export function CheckoutOverlayButton({ className }: CheckoutOverlayButtonProps) {
  const checkoutUrl = useMemo(() => resolveCheckoutUrl(), []);

  const openCheckout = () => {
    if (!checkoutUrl) {
      window.alert("Configure NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID to launch checkout.");
      return;
    }

    window.createLemonSqueezy?.();

    const finalUrl = checkoutUrl.includes("?")
      ? `${checkoutUrl}&embed=1&checkout[custom][app]=iot-security-updater`
      : `${checkoutUrl}?embed=1&checkout[custom][app]=iot-security-updater`;

    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(finalUrl);
      return;
    }

    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />
      <Button className={className} onClick={openCheckout}>
        Start Secure Patch Coverage - $12/mo
      </Button>
    </>
  );
}
