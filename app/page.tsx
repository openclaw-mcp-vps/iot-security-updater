import {
  AlarmClock,
  ArrowRight,
  BadgeCheck,
  Network,
  ShieldAlert,
  Wrench
} from "lucide-react";
import Link from "next/link";

const checkoutHref = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string;

const faqItems = [
  {
    question: "What devices can this manage?",
    answer:
      "Any network-discoverable IoT asset with vendor patch metadata, including cameras, printers, access controllers, badge systems, environmental sensors, and industrial gateways."
  },
  {
    question: "How fast can we start seeing vulnerabilities?",
    answer:
      "Most teams get their first asset risk map in under 30 minutes after deploying a scanning agent in each network segment."
  },
  {
    question: "Can we control patch timing?",
    answer:
      "Yes. Updates are queued with maintenance windows so critical fixes can be staged safely without disrupting business-hour operations."
  },
  {
    question: "How is this priced?",
    answer:
      "Flat $12/month entry plan with hosted checkout. That covers discovery, patch intelligence, and orchestrated update scheduling."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3 text-sm">
          <ShieldAlert className="h-5 w-5 text-[var(--critical)]" />
          <span className="font-semibold tracking-wide">IoT Security Updater</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <a
            href={checkoutHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-[var(--info)] bg-[var(--info)]/10 px-4 py-2 font-medium text-[var(--foreground)] transition hover:bg-[var(--info)]/20"
          >
            Buy Access
          </a>
          <Link
            href="/access"
            className="rounded-md border border-[var(--border)] px-4 py-2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Unlock Console
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-20 pt-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]">
            <BadgeCheck className="h-4 w-4 text-[var(--success)]" />
            Built for IT security managers handling mixed-vendor fleets
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Automated IoT device security patch management
          </h1>
          <p className="max-w-2xl text-lg text-[var(--muted)]">
            Stop chasing firmware advisories across disconnected vendor portals. Discover devices,
            identify exposed firmware, and schedule coordinated updates from one controlled security
            workflow.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={checkoutHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--critical)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Start Protection for $12/mo
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/access"
              className="inline-flex items-center justify-center rounded-md border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white/5"
            >
              Open Purchased Workspace
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold">Security Control Snapshot</h2>
          <div className="mt-6 space-y-4 text-sm text-[var(--muted)]">
            <div className="rounded-lg border border-[var(--border)] bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Discovered devices</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">486</p>
              <p className="mt-1">Across 17 manufacturers and 9 network zones</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Critical patches pending</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--critical)]">41</p>
              <p className="mt-1">2 vendor APIs reporting actively exploited CVEs</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">This week updates</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--success)]">128</p>
              <p className="mt-1">Scheduled during approved maintenance windows</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <h3 className="mb-6 text-2xl font-semibold">Why teams buy this</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <Network className="mb-3 h-6 w-6 text-[var(--info)]" />
            <h4 className="font-semibold">Manual inventory fails fast</h4>
            <p className="mt-2 text-sm text-[var(--muted)]">
              IoT assets are deployed by multiple departments and rarely documented accurately, so
              vulnerability assessments miss devices entirely.
            </p>
          </article>
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <Wrench className="mb-3 h-6 w-6 text-[var(--warning)]" />
            <h4 className="font-semibold">Vendors all patch differently</h4>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Teams waste time handling different APIs, upgrade formats, and firmware rollout rules for
              every manufacturer in the environment.
            </p>
          </article>
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <AlarmClock className="mb-3 h-6 w-6 text-[var(--critical)]" />
            <h4 className="font-semibold">Patch timing is operationally risky</h4>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Security teams need updates to happen quickly, but only during windows that avoid outage
              risk for operations and facilities.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <h3 className="mb-6 text-2xl font-semibold">How it works</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Step 1</p>
            <h4 className="mt-2 text-lg font-semibold">Discover</h4>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Scanning agents map active IoT endpoints, fingerprint device types, and maintain a live
              inventory of firmware versions.
            </p>
          </article>
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Step 2</p>
            <h4 className="mt-2 text-lg font-semibold">Correlate</h4>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Manufacturer feeds and patch catalogs are normalized into one model so vulnerabilities and
              fix availability are tracked consistently.
            </p>
          </article>
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Step 3</p>
            <h4 className="mt-2 text-lg font-semibold">Orchestrate</h4>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Updates are pushed through an orchestrator queue with maintenance windows, retries, and
              full audit visibility for security reporting.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <h3 className="text-2xl font-semibold">Pricing</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Designed for mid-market security teams that need immediate risk reduction without adding
            specialist headcount.
          </p>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-4xl font-semibold">$12/mo</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Includes discovery dashboard, patch intelligence, and update scheduling orchestration.
              </p>
            </div>
            <a
              href={checkoutHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-[var(--critical)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Buy With Stripe Checkout
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <h3 className="mb-6 text-2xl font-semibold">FAQ</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h4 className="font-semibold">{item.question}</h4>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
