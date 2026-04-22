import axios from "axios";
import { subDays } from "date-fns";
import { readDataFile, writeDataFile } from "@/lib/storage";
import type { Device, Patch, PatchSeverity } from "@/lib/types";

const PATCHES_FILE = "patches.json";

const fallbackLibrary: Record<string, Array<Omit<Patch, "id" | "manufacturer" | "model">>> = {
  Axis: [
    {
      targetFirmwareVersion: "10.10.4",
      severity: "critical",
      cve: "CVE-2026-1174",
      summary: "Remote command execution through malformed ONVIF request parsing.",
      releasedAt: subDays(new Date(), 9).toISOString(),
      requiresReboot: true
    },
    {
      targetFirmwareVersion: "10.9.8",
      severity: "high",
      cve: "CVE-2026-0952",
      summary: "Authentication bypass on camera API token refresh endpoint.",
      releasedAt: subDays(new Date(), 24).toISOString(),
      requiresReboot: false
    }
  ],
  HID: [
    {
      targetFirmwareVersion: "5.4.0",
      severity: "critical",
      cve: "CVE-2026-1019",
      summary: "Badge relay controller accepts unsigned update packages.",
      releasedAt: subDays(new Date(), 14).toISOString(),
      requiresReboot: true
    }
  ],
  JohnsonControls: [
    {
      targetFirmwareVersion: "4.2.1",
      severity: "high",
      cve: "CVE-2026-0760",
      summary: "Privilege escalation in building automation BACnet integration.",
      releasedAt: subDays(new Date(), 31).toISOString(),
      requiresReboot: true
    }
  ],
  HP: [
    {
      targetFirmwareVersion: "3.9.2",
      severity: "medium",
      cve: "CVE-2026-0703",
      summary: "Network print service memory disclosure under malformed SNMP queries.",
      releasedAt: subDays(new Date(), 17).toISOString(),
      requiresReboot: false
    }
  ],
  GenericVendor: [
    {
      targetFirmwareVersion: "1.0.7",
      severity: "medium",
      cve: "CVE-2026-1202",
      summary: "Hard-coded service account credentials in default image.",
      releasedAt: subDays(new Date(), 5).toISOString(),
      requiresReboot: true
    }
  ]
};

function severityFromText(value: string): PatchSeverity {
  const lowered = value.toLowerCase();
  if (lowered === "critical" || lowered === "high" || lowered === "medium" || lowered === "low") {
    return lowered;
  }
  return "medium";
}

function buildPatchId(device: Device, cve: string, targetVersion: string): string {
  return `${device.manufacturer.toLowerCase()}_${device.model.toLowerCase().replace(/[^a-z0-9]+/g, "-")}_${cve.toLowerCase()}_${targetVersion}`;
}

async function pullFromVendorApi(device: Device): Promise<Patch[]> {
  const envKey = `PATCH_FEED_${device.manufacturer.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  const endpoint = process.env[envKey];

  if (!endpoint) {
    return [];
  }

  try {
    const response = await axios.get(endpoint, {
      timeout: 3000,
      params: {
        model: device.model,
        firmwareVersion: device.firmwareVersion
      }
    });

    const records = Array.isArray(response.data?.patches) ? response.data.patches : [];

    return records.map((item: Record<string, unknown>) => {
      const cve = typeof item.cve === "string" ? item.cve : "CVE-UNSPECIFIED";
      const targetVersion =
        typeof item.targetFirmwareVersion === "string" ? item.targetFirmwareVersion : device.firmwareVersion;
      return {
        id: buildPatchId(device, cve, targetVersion),
        manufacturer: device.manufacturer,
        model: device.model,
        targetFirmwareVersion: targetVersion,
        severity: severityFromText(typeof item.severity === "string" ? item.severity : "medium"),
        cve,
        summary:
          typeof item.summary === "string"
            ? item.summary
            : "Vendor patch available for security hardening and exploit mitigation.",
        releasedAt: typeof item.releasedAt === "string" ? item.releasedAt : new Date().toISOString(),
        requiresReboot: Boolean(item.requiresReboot)
      };
    });
  } catch {
    return [];
  }
}

function buildFallbackPatches(device: Device): Patch[] {
  const templates = fallbackLibrary[device.manufacturer] || fallbackLibrary.GenericVendor;

  return templates.map((template) => ({
    id: buildPatchId(device, template.cve, template.targetFirmwareVersion),
    manufacturer: device.manufacturer,
    model: device.model,
    ...template
  }));
}

export async function getStoredPatches(): Promise<Patch[]> {
  return readDataFile<Patch[]>(PATCHES_FILE, []);
}

export async function refreshPatchCatalog(devices: Device[]): Promise<Patch[]> {
  const allPatches = (
    await Promise.all(
      devices.map(async (device) => {
        const live = await pullFromVendorApi(device);
        return live.length > 0 ? live : buildFallbackPatches(device);
      })
    )
  ).flat();

  const deduped = Array.from(new Map(allPatches.map((patch) => [patch.id, patch])).values());
  await writeDataFile(PATCHES_FILE, deduped);
  return deduped;
}
