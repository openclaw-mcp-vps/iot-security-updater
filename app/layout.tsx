import type { Metadata } from "next";
import { Space_Grotesk, Source_Code_Pro } from "next/font/google";
import "@/app/globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const monoFont = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iot-security-updater.example.com"),
  title: {
    default: "IoT Security Updater | Automated Patch Orchestration",
    template: "%s | IoT Security Updater"
  },
  description:
    "Discover IoT assets, track security patches across manufacturers, and orchestrate maintenance-window updates from one security dashboard.",
  keywords: [
    "IoT patch management",
    "IoT vulnerability remediation",
    "enterprise security",
    "device firmware updates",
    "security automation"
  ],
  openGraph: {
    type: "website",
    title: "IoT Security Updater",
    description:
      "Automated IoT device security patch management for mid-market security teams.",
    url: "https://iot-security-updater.example.com",
    siteName: "IoT Security Updater"
  },
  twitter: {
    card: "summary_large_image",
    title: "IoT Security Updater",
    description:
      "Find vulnerable IoT devices and push coordinated security updates without vendor-by-vendor chaos."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${monoFont.variable} font-[var(--font-display)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
