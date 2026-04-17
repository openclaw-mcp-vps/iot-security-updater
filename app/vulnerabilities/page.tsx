import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import VulnerabilityAlert from "@/components/VulnerabilityAlert";
import { listKnownVulnerabilities } from "@/lib/vulnerability-db";

export default async function VulnerabilitiesPage() {
  const cookieStore = await cookies();
  const paid = cookieStore.get("iot_paid")?.value === "1";

  if (!paid) {
    redirect("/?paywall=1");
  }

  const vulnerabilities = listKnownVulnerabilities();

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-10">
      <h1 className="text-3xl font-semibold">Firmware Vulnerabilities</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Known CVEs matched by model and firmware range.</p>
      <section className="mt-7 grid gap-4 md:grid-cols-2">
        {vulnerabilities.map((vuln) => (
          <VulnerabilityAlert key={vuln.id} vulnerability={vuln} />
        ))}
      </section>
    </main>
  );
}
