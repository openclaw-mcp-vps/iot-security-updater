import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import DeviceScanner from "@/components/DeviceScanner";
import PatchScheduler from "@/components/PatchScheduler";
import VulnerabilityAlert from "@/components/VulnerabilityAlert";
import { listKnownVulnerabilities } from "@/lib/vulnerability-db";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const paid = cookieStore.get("iot_paid")?.value === "1";

  if (!paid) {
    redirect("/?paywall=1");
  }

  const vulns = listKnownVulnerabilities();

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-10">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Security Operations Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Scan devices, review firmware risk, and execute patch rollouts from one place.
          </p>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {vulns.slice(0, 3).map((vuln) => (
          <VulnerabilityAlert key={vuln.id} vulnerability={vuln} compact />
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <DeviceScanner />
        <PatchScheduler />
      </section>
    </main>
  );
}
