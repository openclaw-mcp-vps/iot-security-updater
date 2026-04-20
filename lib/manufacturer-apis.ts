import type { DeviceRecord, PatchRecord, RiskLevel } from "@/lib/types";

interface VendorPatchTemplate {
  title: string;
  cve: string;
  severity: RiskLevel;
  cvss: number;
  targetVersion: string;
  summary: string;
  requiresReboot: boolean;
}

const vendorPatches: Record<string, VendorPatchTemplate[]> = {
  Axis: [
    {
      title: "TLS Downgrade Prevention Patch",
      cve: "CVE-2026-20114",
      severity: "critical",
      cvss: 9.3,
      targetVersion: "7.4.2",
      summary: "Fixes a downgrade path that could allow interception of remote camera control sessions.",
      requiresReboot: true
    }
  ],
  Hikvision: [
    {
      title: "Authentication Bypass Mitigation",
      cve: "CVE-2026-18401",
      severity: "critical",
      cvss: 9.8,
      targetVersion: "6.2.5",
      summary: "Prevents crafted request chains from bypassing admin authentication on edge camera gateways.",
      requiresReboot: true
    },
    {
      title: "SSH Key Rotation Enforcement",
      cve: "CVE-2025-90117",
      severity: "high",
      cvss: 8.1,
      targetVersion: "6.2.5",
      summary: "Adds strict host key rotation validation and blocks weak key fallback negotiation.",
      requiresReboot: false
    }
  ],
  Ubiquiti: [
    {
      title: "Controller Session Hardening",
      cve: "CVE-2025-77210",
      severity: "high",
      cvss: 8.0,
      targetVersion: "4.1.8",
      summary: "Fixes stale API token replay risk in controller-managed access points.",
      requiresReboot: false
    }
  ],
  Cisco: [
    {
      title: "SNMP RCE Patch",
      cve: "CVE-2026-14432",
      severity: "critical",
      cvss: 9.6,
      targetVersion: "12.5.1",
      summary: "Resolves unsafe OID parser behavior that enables remote command execution.",
      requiresReboot: true
    },
    {
      title: "DHCP Relay Memory Safety Fix",
      cve: "CVE-2026-10109",
      severity: "high",
      cvss: 7.9,
      targetVersion: "12.5.1",
      summary: "Eliminates a heap corruption issue in malformed DHCP relay packet handling.",
      requiresReboot: true
    }
  ],
  default: [
    {
      title: "Firmware Signature Validation Update",
      cve: "CVE-2026-14900",
      severity: "medium",
      cvss: 6.8,
      targetVersion: "2.0.4",
      summary: "Improves firmware signature verification and rejects unsigned image chains.",
      requiresReboot: false
    }
  ]
};

function numericVersion(version: string): number[] {
  return version
    .split(".")
    .map((chunk) => Number.parseInt(chunk.replace(/\D/g, ""), 10))
    .map((part) => (Number.isFinite(part) ? part : 0));
}

function isOutdated(current: string, target: string): boolean {
  const currentParts = numericVersion(current);
  const targetParts = numericVersion(target);
  const maxLength = Math.max(currentParts.length, targetParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const currentValue = currentParts[index] ?? 0;
    const targetValue = targetParts[index] ?? 0;

    if (currentValue < targetValue) {
      return true;
    }

    if (currentValue > targetValue) {
      return false;
    }
  }

  return false;
}

function buildPatchId(deviceId: string, cve: string): string {
  return `${deviceId}-${cve.toLowerCase()}`;
}

export async function fetchManufacturerPatches(device: DeviceRecord): Promise<PatchRecord[]> {
  const templates = vendorPatches[device.manufacturer] ?? vendorPatches.default;
  const now = new Date().toISOString();

  return templates
    .filter((template) => isOutdated(device.firmwareVersion, template.targetVersion))
    .map((template) => ({
      id: buildPatchId(device.id, template.cve),
      deviceId: device.id,
      manufacturer: device.manufacturer,
      title: template.title,
      cve: template.cve,
      severity: template.severity,
      cvss: template.cvss,
      releasedAt: now,
      currentVersion: device.firmwareVersion,
      targetVersion: template.targetVersion,
      requiresReboot: template.requiresReboot,
      status: "available",
      summary: template.summary
    }));
}

export async function fetchPatchesForDevices(devices: DeviceRecord[]): Promise<PatchRecord[]> {
  const patchLists = await Promise.all(devices.map((device) => fetchManufacturerPatches(device)));
  return patchLists.flat();
}
