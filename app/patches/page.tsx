import { ConsoleHeader } from "@/components/console-header";
import { PatchStatusGrid } from "@/components/patch-status-grid";
import { VulnerabilityAlerts } from "@/components/vulnerability-alerts";
import { getStoredDevices } from "@/lib/device-scanner";
import { getStoredPatches } from "@/lib/manufacturer-apis";
import { buildPatchSnapshot } from "@/lib/patch-tracker";
import { listScheduledUpdates } from "@/lib/update-orchestrator";

export const dynamic = "force-dynamic";

export default async function PatchesPage() {
  const [devices, patches, schedules] = await Promise.all([
    getStoredDevices(),
    getStoredPatches(),
    listScheduledUpdates()
  ]);

  const snapshot = buildPatchSnapshot(devices, patches, schedules);

  return (
    <main className="min-h-screen pb-14">
      <ConsoleHeader
        title="Patch Intelligence"
        description="Manufacturer advisories normalized into a single severity model with exposed device counts."
      />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 xl:grid-cols-2">
        <VulnerabilityAlerts initialAlerts={snapshot.alerts} />
        <PatchStatusGrid
          initialDevices={devices}
          initialPatches={patches}
          initialStatuses={snapshot.statuses}
          initialSummary={snapshot.summary}
        />
      </section>
    </main>
  );
}
