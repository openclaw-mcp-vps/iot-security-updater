import { buildId } from "@/lib/storage";
import type {
  Device,
  Patch,
  PatchSnapshot,
  PatchStatus,
  ScheduledUpdate,
  VulnerabilityAlert
} from "@/lib/types";

function parseVersion(version: string): number[] {
  return version
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));
}

function isVersionGreater(target: string, current: string): boolean {
  const targetParts = parseVersion(target);
  const currentParts = parseVersion(current);
  const length = Math.max(targetParts.length, currentParts.length);

  for (let i = 0; i < length; i += 1) {
    const targetPart = targetParts[i] ?? 0;
    const currentPart = currentParts[i] ?? 0;
    if (targetPart > currentPart) {
      return true;
    }
    if (targetPart < currentPart) {
      return false;
    }
  }

  return false;
}

export function buildPatchSnapshot(
  devices: Device[],
  patches: Patch[],
  schedules: ScheduledUpdate[]
): PatchSnapshot {
  const statuses: PatchStatus[] = [];

  for (const device of devices) {
    const applicablePatches = patches.filter(
      (patch) => patch.manufacturer === device.manufacturer && patch.model === device.model
    );

    for (const patch of applicablePatches) {
      const scheduled = schedules.some(
        (schedule) => schedule.deviceId === device.id && schedule.patchId === patch.id
      );

      statuses.push({
        id: buildId("status"),
        deviceId: device.id,
        patchId: patch.id,
        applicable: isVersionGreater(patch.targetFirmwareVersion, device.firmwareVersion),
        scheduled,
        installed: !isVersionGreater(patch.targetFirmwareVersion, device.firmwareVersion)
      });
    }
  }

  const actionable = statuses.filter((status) => status.applicable);
  const alerts = buildAlerts(actionable, patches);

  return {
    statuses,
    alerts,
    summary: {
      totalDevices: devices.length,
      vulnerableDevices: new Set(actionable.map((status) => status.deviceId)).size,
      criticalPatches: alerts
        .filter((alert) => alert.severity === "critical")
        .reduce((sum, alert) => sum + alert.impactedDevices, 0),
      scheduledUpdates: actionable.filter((status) => status.scheduled).length
    }
  };
}

function buildAlerts(actionable: PatchStatus[], patches: Patch[]): VulnerabilityAlert[] {
  const byPatchId = new Map<string, number>();

  for (const status of actionable) {
    const current = byPatchId.get(status.patchId) || 0;
    byPatchId.set(status.patchId, current + 1);
  }

  return Array.from(byPatchId.entries())
    .map(([patchId, impactedDevices]) => {
      const patch = patches.find((item) => item.id === patchId);
      if (!patch) {
        return null;
      }

      return {
        id: buildId("alert"),
        severity: patch.severity,
        cve: patch.cve,
        summary: patch.summary,
        impactedDevices,
        patchId
      };
    })
    .filter((item): item is VulnerabilityAlert => Boolean(item))
    .sort((a, b) => {
      const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityWeight[b.severity] - severityWeight[a.severity] || b.impactedDevices - a.impactedDevices;
    });
}
