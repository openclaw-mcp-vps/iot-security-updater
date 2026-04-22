import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { UnlockAccessForm } from "@/components/unlock-access-form";

export default function AccessPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-sm">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <LockKeyhole className="h-4 w-4 text-[var(--info)]" />
          Paid workspace access
        </div>
        <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)]">
          Back to landing
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-10">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Access the IoT Security Console</h1>
          <p className="mt-3 text-[var(--muted)]">
            The dashboard and update orchestration tools are gated behind your paid subscription. Verify
            your purchase email to create an access cookie.
          </p>
        </div>
        <UnlockAccessForm />
      </div>
    </main>
  );
}
