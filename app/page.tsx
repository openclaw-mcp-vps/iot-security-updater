"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ShieldAlert, TimerReset, Wifi } from "lucide-react";

const faq = [
  {
    question: "How quickly can we detect exposed firmware?",
    answer:
      "Network scans and version checks run on demand and can be scheduled every hour, so newly exposed firmware is surfaced quickly with severity context."
  },
  {
    question: "Do patches deploy all at once?",
    answer:
      "No. You can schedule phased deployment windows, starting with a pilot group, and track completion before wider rollout."
  },
  {
    question: "What do we need to connect devices?",
    answer:
      "API credentials or SSH access for your device fleet. The platform stores only the minimum connection metadata required for patch orchestration."
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [unlockMessage, setUnlockMessage] = useState("");
  const [showPaywallNotice, setShowPaywallNotice] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setShowPaywallNotice(query.get("paywall") === "1");

    const existing = window.localStorage.getItem("iot-session-id");
    if (existing) {
      setSessionId(existing);
      return;
    }

    const created = crypto.randomUUID();
    window.localStorage.setItem("iot-session-id", created);
    document.cookie = `iot_session_id=${created}; path=/; max-age=2592000; samesite=lax`;
    setSessionId(created);
  }, []);

  const checkoutUrl = useMemo(() => {
    const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
    const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;
    if (!productId || !storeId) return "";

    const base = `https://app.lemonsqueezy.com/checkout/buy/${productId}`;
    const params = new URLSearchParams({
      checkout: "1",
      embed: "1",
      media: "0",
      logo: "0",
      discount: "0",
      "checkout[custom][session_id]": sessionId,
      "checkout[custom][store_id]": storeId
    });

    return `${base}?${params.toString()}`;
  }, [sessionId]);

  async function verifyPurchase() {
    if (!sessionId) {
      setUnlockMessage("Session not initialized. Refresh and try again.");
      return;
    }

    const response = await fetch("/api/paywall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });

    if (!response.ok) {
      setUnlockMessage("No completed purchase found for this session yet.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 md:px-10">
      <nav className="mb-14 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/75 px-5 py-3 backdrop-blur">
        <div className="text-lg font-semibold tracking-tight">IoT Security Updater</div>
        <a
          href="#pricing"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--text)]"
        >
          Pricing
        </a>
      </nav>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            <ShieldAlert size={14} />
            security-tools
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Automated IoT device security patch management
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Discover unmanaged IoT assets, correlate firmware versions against known vulnerabilities, and deploy patches in controlled windows before exposure turns into incidents.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={checkoutUrl || "#pricing"}
              className="lemonsqueezy-button inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Start Protecting Devices
              <ArrowRight size={16} />
            </a>
            <a
              href="/dashboard"
              className="rounded-md border border-[var(--border)] px-5 py-3 text-sm text-[var(--muted)] transition hover:text-[var(--text)]"
            >
              Preview Dashboard
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_0_80px_rgba(47,191,113,0.08)]">
          <div className="mb-4 text-sm font-medium text-[var(--muted)]">Live Risk Snapshot</div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2">
              <span>Devices discovered</span>
              <span className="font-semibold">184</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2">
              <span>High/Critical firmware risks</span>
              <span className="font-semibold text-[var(--danger)]">27</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2">
              <span>Patch jobs in progress</span>
              <span className="font-semibold text-[var(--warning)]">9</span>
            </div>
          </div>
        </div>
      </section>

      {showPaywallNotice ? (
        <section className="mt-8 rounded-xl border border-[var(--warning)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-semibold">Dashboard access requires an active subscription</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Complete checkout, then click verify to activate your secure session cookie.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={checkoutUrl || "#pricing"}
              className="lemonsqueezy-button rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black"
            >
              Open Checkout
            </a>
            <button
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
              onClick={verifyPurchase}
            >
              Verify Purchase
            </button>
          </div>
          {unlockMessage ? <p className="mt-2 text-sm text-[var(--warning)]">{unlockMessage}</p> : null}
        </section>
      ) : null}

      <section className="mt-20 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <Wifi className="mb-3" size={20} />
          <h2 className="text-lg font-semibold">The Problem</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            IoT fleets expand faster than patch cycles. Unknown devices and outdated firmware create blind spots that attackers exploit first.
          </p>
        </article>
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <TimerReset className="mb-3" size={20} />
          <h2 className="text-lg font-semibold">The Solution</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Continuous discovery and vulnerability mapping highlight what needs action now, with scheduled deployment windows to reduce operational risk.
          </p>
        </article>
        <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <CheckCircle2 className="mb-3" size={20} />
          <h2 className="text-lg font-semibold">The Outcome</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Security and operations teams share one execution workflow for remediation, with visible status and audit-friendly patch history.
          </p>
        </article>
      </section>

      <section id="pricing" className="mt-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">One plan for small teams running IoT infrastructure in production.</p>
        <div className="mt-6 inline-flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-6">
          <div className="text-sm uppercase tracking-[0.12em] text-[var(--muted)]">Starter Security</div>
          <div className="mt-1 text-4xl font-semibold">$12<span className="text-base font-medium text-[var(--muted)]">/mo</span></div>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>Up to 500 devices scanned monthly</li>
            <li>Firmware vulnerability matching</li>
            <li>Patch scheduling and deployment queue</li>
            <li>Lemon Squeezy managed billing</li>
          </ul>
          <a
            href={checkoutUrl || "#"}
            className="lemonsqueezy-button mt-6 inline-flex justify-center rounded-md bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-black"
          >
            Checkout Securely
          </a>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-6 space-y-3">
          {faq.map((item) => (
            <article key={item.question} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="text-base font-medium">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
