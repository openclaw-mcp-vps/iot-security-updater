import { ConsoleHeader } from "@/components/console-header";
import { UpdateScheduler } from "@/components/update-scheduler";
import { getStoredDevices } from "@/lib/device-scanner";
import { getStoredPatches } from "@/lib/manufacturer-apis";
import { listScheduledUpdates } from "@/lib/update-orchestrator";

export const dynamic = "force-dynamic";

export default async function SchedulesPage() {
  const [devices, patches, schedules] = await Promise.all([
    getStoredDevices(),
    getStoredPatches(),
    listScheduledUpdates()
  ]);

  return (
    <main className="min-h-screen pb-14">
      <ConsoleHeader
        title="Update Scheduling"
        description="Queue and audit firmware updates across mixed device families and maintenance windows."
      />
      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <UpdateScheduler devices={devices} patches={patches} initialSchedules={schedules} />
      </section>
    </main>
  );
}
