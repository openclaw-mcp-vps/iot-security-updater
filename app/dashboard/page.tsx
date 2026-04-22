import { ConsoleHeader } from "@/components/console-header";
import { DeviceDiscoveryPanel } from "@/components/device-discovery-panel";
import { PatchStatusGrid } from "@/components/patch-status-grid";
import { UpdateScheduler } from "@/components/update-scheduler";
import { VulnerabilityAlerts } from "@/components/vulnerability-alerts";
import { getStoredDevices } from "@/lib/device-scanner";
import { getStoredPatches } from "@/lib/manufacturer-apis";
import { buildPatchSnapshot } from "@/lib/patch-tracker";
import { getQueueHealth, listScheduledUpdates } from "@/lib/update-orchestrator";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [devices, patches, schedules, queueHealth] = await Promise.all([
    getStoredDevices(),
    getStoredPatches(),
    listScheduledUpdates(),
    getQueueHealth()
  ]);
  const snapshot = buildPatchSnapshot(devices, patches, schedules);

  return (
    <main className="min-h-screen pb-14">
      <ConsoleHeader
        title="Security Operations Dashboard"
        description="Discover IoT assets, prioritize vulnerabilities, and orchestrate updates through one queue-backed workflow."
      />

      <section className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
          Queue status: {queueHealth.enabled ? (queueHealth.connected ? "Connected to Redis" : "Redis unavailable") : "Redis not configured"}
        </div>
        <DeviceDiscoveryPanel initialDevices={devices} />
        <div className="grid gap-6 xl:grid-cols-2">
          <VulnerabilityAlerts initialAlerts={snapshot.alerts} />
          <PatchStatusGrid
            initialDevices={devices}
            initialPatches={patches}
            initialStatuses={snapshot.statuses}
            initialSummary={snapshot.summary}
          />
        </div>
        <UpdateScheduler devices={devices} patches={patches} initialSchedules={schedules} />
      </section>
    </main>
  );
}
