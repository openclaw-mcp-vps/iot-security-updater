import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "700"]
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://patchpilot-iot.example"),
  title: {
    default: `${APP_NAME} | Automated IoT Device Security Patch Management`,
    template: `%s | ${APP_NAME}`
  },
  description:
    "Automatically discover IoT devices, identify critical firmware vulnerabilities, and orchestrate secure patch rollouts during approved maintenance windows.",
  openGraph: {
    title: `${APP_NAME} | Automated IoT Device Security Patch Management`,
    description:
      "Stop IoT devices from becoming your weakest security link. Discover unmanaged devices and patch them safely across multiple vendors.",
    type: "website",
    url: "https://patchpilot-iot.example"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${headingFont.variable} ${monoFont.variable} font-[var(--font-heading)] text-slate-100`}>
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0d1117]/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-sm font-semibold tracking-wide text-cyan-300">
              PatchPilot for IoT
            </Link>
            <nav className="flex items-center gap-5 text-sm text-slate-300">
              <Link className="hover:text-cyan-300" href="/dashboard">
                Dashboard
              </Link>
              <Link className="hover:text-cyan-300" href="/devices">
                Devices
              </Link>
              <Link className="hover:text-cyan-300" href="/patches">
                Patches
              </Link>
              <Link className="hover:text-cyan-300" href="/settings">
                Settings
              </Link>
              <Link className="rounded-md border border-cyan-500/40 px-3 py-1 text-cyan-200 hover:border-cyan-400" href="/unlock">
                Unlock
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
