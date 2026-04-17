import type { Metadata } from "next";
import Script from "next/script";

import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://iot-security-updater.example"),
  title: "IoT Security Updater | Automated IoT device security patch management",
  description:
    "Discover IoT assets, track firmware risk against known vulnerabilities, and safely automate patch deployment workflows from one dashboard.",
  openGraph: {
    title: "IoT Security Updater",
    description:
      "Automated IoT device security patch management with continuous discovery and patch scheduling.",
    type: "website",
    url: "https://iot-security-updater.example"
  },
  twitter: {
    card: "summary_large_image",
    title: "IoT Security Updater",
    description: "Reduce firmware exposure with guided vulnerability triage and controlled update rollout."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
