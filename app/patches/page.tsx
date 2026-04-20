import { MaintenanceWindowPlanner } from "@/components/maintenance-window";
import { PatchStatus } from "@/components/patch-status";
import { ProtectedPageHeader } from "@/components/protected-page-header";
import { listOpenPatches } from "@/lib/patch-manager";
import { getDevices } from "@/lib/storage";
import { listMaintenanceWindows } from "@/lib/scheduler";

export default async function PatchesPage() {
  const [patches, devices, windows] = await Promise.all([listOpenPatches(), getDevices(), listMaintenanceWindows()]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <ProtectedPageHeader
        title="Patch Intelligence & Rollouts"
        description="Prioritize risk by CVE severity, then orchestrate updates across manufacturers with maintenance-window controls."
      />

      <PatchStatus patches={patches} />
      <MaintenanceWindowPlanner patches={patches} devices={devices} windows={windows} />
    </div>
  );
}
