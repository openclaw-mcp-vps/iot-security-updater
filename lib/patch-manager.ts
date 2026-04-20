import { fetchPatchesForDevices } from "@/lib/manufacturer-apis";
import { getDevices, getPatches, setPatches } from "@/lib/storage";
import type { DeviceRecord, PatchRecord, RiskLevel } from "@/lib/types";

const severityWeights: Record<RiskLevel, number> = {
  critical: 100,
  high: 70,
  medium: 35,
  low: 15
};

function dedupePatches(patches: PatchRecord[]): PatchRecord[] {
  const map = new Map<string, PatchRecord>();

  for (const patch of patches) {
    const existing = map.get(patch.id);
    if (!existing) {
      map.set(patch.id, patch);
      continue;
    }

    if (existing.status === "applied") {
      map.set(patch.id, existing);
      continue;
    }

    map.set(patch.id, {
      ...existing,
      ...patch,
      status: existing.status
    });
  }

  return Array.from(map.values());
}

export async function checkForPatches(deviceList?: DeviceRecord[]): Promise<PatchRecord[]> {
  const devices = deviceList ?? (await getDevices());
  const currentPatches = await getPatches();
  const discoveredPatches = await fetchPatchesForDevices(devices);

  const merged = dedupePatches([...currentPatches, ...discoveredPatches]);
  await setPatches(merged);

  return merged;
}

export async function getPatchSummary(): Promise<{
  totalDevices: number;
  onlineDevices: number;
  availablePatches: number;
  scheduledPatches: number;
  appliedPatches: number;
  criticalOpenPatches: number;
  exposureScore: number;
}> {
  const [devices, patches] = await Promise.all([getDevices(), getPatches()]);

  const available = patches.filter((patch) => patch.status === "available");
  const criticalOpen = available.filter((patch) => patch.severity === "critical").length;

  const exposureScore = available.reduce((total, patch) => total + severityWeights[patch.severity], 0);

  return {
    totalDevices: devices.length,
    onlineDevices: devices.filter((device) => device.status === "online").length,
    availablePatches: available.length,
    scheduledPatches: patches.filter((patch) => patch.status === "scheduled").length,
    appliedPatches: patches.filter((patch) => patch.status === "applied").length,
    criticalOpenPatches: criticalOpen,
    exposureScore
  };
}

export async function listOpenPatches(): Promise<PatchRecord[]> {
  const patches = await getPatches();
  return patches.filter((patch) => ["available", "scheduled", "in_progress", "failed"].includes(patch.status));
}
