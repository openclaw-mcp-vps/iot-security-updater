import Link from "next/link";
import { AlertOctagon, CalendarClock, Radar, ShieldAlert, ShieldCheck } from "lucide-react";
import { CheckoutOverlayButton } from "@/components/checkout-overlay-button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-14 pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs tracking-wide text-cyan-200">
            <ShieldAlert className="h-3.5 w-3.5" />
            Automated IoT Device Security Patch Management
          </p>

          <h1 className="text-4xl font-semibold leading-tight text-slate-100 md:text-5xl">
            Stop Unpatched IoT Devices from Becoming Your Next Breach Entry Point
          </h1>

          <p className="max-w-2xl text-lg text-slate-300">
            PatchPilot continuously discovers IoT devices, tracks vendor-specific security advisories, and schedules firmware
            updates during your maintenance windows so your team can close exposure without manual spreadsheet triage.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <CheckoutOverlayButton />
            <Link className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400" href="/unlock">
              Already Purchased? Unlock Access
            </Link>
          </div>

          <p className="text-sm text-slate-400">
            Built for IT security managers at mid-market companies running mixed camera, badge, controller, and OT device fleets.
          </p>
        </div>

        <Card className="border-cyan-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/70">
          <CardTitle className="mb-2">What You Get in Week 1</CardTitle>
          <CardDescription>Immediate visibility and patch execution without hiring an IoT specialist.</CardDescription>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            <li className="flex items-start gap-2">
              <Radar className="mt-0.5 h-4 w-4 text-cyan-300" />
              Continuous discovery to surface unmanaged endpoints on production subnets.
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
              Vendor-aware patch intelligence with CVE severity scoring and reboot requirements.
            </li>
            <li className="flex items-start gap-2">
              <CalendarClock className="mt-0.5 h-4 w-4 text-cyan-300" />
              One-click scheduling across maintenance windows to minimize operational risk.
            </li>
          </ul>
        </Card>
      </section>

      <section className="border-y border-slate-800 bg-slate-950/30">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-3">
          <Card>
            <CardTitle className="mb-2 text-lg">Problem</CardTitle>
            <p className="text-sm text-slate-300">
              IoT fleets grow faster than patch workflows. Security teams inherit dozens of vendor portals, weak asset inventory, and no
              coordinated rollout process.
            </p>
          </Card>
          <Card>
            <CardTitle className="mb-2 text-lg">Consequence</CardTitle>
            <p className="text-sm text-slate-300">
              Critical vulnerabilities stay open for weeks. Breach investigations repeatedly trace lateral movement to neglected IoT endpoints.
            </p>
          </Card>
          <Card>
            <CardTitle className="mb-2 text-lg">Solution</CardTitle>
            <p className="text-sm text-slate-300">
              PatchPilot automates discovery, vulnerability prioritization, and scheduled patch orchestration so your small team can keep up.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold text-slate-100">Pricing</h2>
        <p className="mt-2 max-w-3xl text-slate-300">
          Predictable pricing for teams that need enterprise-grade coverage without enterprise procurement overhead.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-cyan-400/30 bg-cyan-500/5">
            <CardTitle className="text-xl">Security Tools Plan</CardTitle>
            <p className="mt-3 text-4xl font-semibold text-cyan-200">
              $12<span className="text-base text-slate-300">/month</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              <li>Unlimited device scans across internal subnets</li>
              <li>Patch feed monitoring across mixed manufacturers</li>
              <li>Maintenance-window scheduling and queue management</li>
              <li>Webhook-driven purchase activation and paywall access</li>
            </ul>
            <CheckoutOverlayButton className="mt-6 w-full" />
          </Card>

          <Card>
            <CardTitle className="text-lg">FAQ</CardTitle>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <div>
                <p className="font-medium text-slate-100">How quickly can we start using it?</p>
                <p>Most teams import their first network range and queue critical patches in under 30 minutes.</p>
              </div>
              <div>
                <p className="font-medium text-slate-100">Does this replace our existing security stack?</p>
                <p>No. PatchPilot complements SIEM and EDR tools by fixing the IoT patching blind spot they usually expose.</p>
              </div>
              <div>
                <p className="font-medium text-slate-100">How does access work after purchase?</p>
                <p>Payment events activate your account via webhook, then you unlock the dashboard with your billing email.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8">
          <p className="text-sm text-slate-400">Protect your weakest attack surface before attackers automate against it.</p>
          <Link className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200" href="/dashboard">
            <AlertOctagon className="h-4 w-4" />
            Open Security Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
