import crypto from "node:crypto";
import type { DeviceRecord } from "@/lib/types";
import { getDevices, setDevices } from "@/lib/storage";

interface ScanOptions {
  range: string;
  mergeWithExisting?: boolean;
}

const manufacturerPool = [
  { manufacturer: "Cisco", model: "SG350-28P", versions: ["11.8.0", "12.4.0"] },
  { manufacturer: "Ubiquiti", model: "UniFi AP AC Pro", versions: ["3.9.4", "4.0.1"] },
  { manufacturer: "Axis", model: "P1468-LE", versions: ["7.0.1", "7.3.0"] },
  { manufacturer: "Hikvision", model: "DS-2CD2387G2", versions: ["5.5.0", "6.1.3"] }
];

function deterministicHash(input: string): number {
  const hash = crypto.createHash("sha1").update(input).digest("hex");
  return Number.parseInt(hash.slice(0, 8), 16);
}

function pickFrom<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

function sanitizeRange(range: string): string {
  const trimmed = range.trim();
  if (trimmed.length === 0) {
    return "192.168.1.0/24";
  }

  return trimmed;
}

function buildSimulatedDevice(range: string, index: number): DeviceRecord {
  const seed = deterministicHash(`${range}-${index}`);
  const octet3 = (seed % 5) + 1;
  const octet4 = (seed % 220) + 10;
  const pick = pickFrom(manufacturerPool, seed);
  const firmwareVersion = pickFrom(pick.versions, Math.floor(seed / 11));
  const ip = `192.168.${octet3}.${octet4}`;
  const hostname = `${pick.manufacturer.toLowerCase()}-${pick.model.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${octet4}`;

  return {
    id: crypto.createHash("md5").update(`${ip}-${pick.model}`).digest("hex"),
    ip,
    hostname,
    mac: `02:00:${(seed % 255).toString(16).padStart(2, "0")}:${(Math.floor(seed / 255) % 255)
      .toString(16)
      .padStart(2, "0")}:${(Math.floor(seed / 510) % 255).toString(16).padStart(2, "0")}:${(
      Math.floor(seed / 1020) %
      255
    )
      .toString(16)
      .padStart(2, "0")}`,
    manufacturer: pick.manufacturer,
    model: pick.model,
    firmwareVersion,
    lastSeenAt: new Date().toISOString(),
    discoveredAt: new Date().toISOString(),
    status: "online"
  };
}

async function scanWithNmap(range: string): Promise<DeviceRecord[]> {
  try {
    const nmap = await import("node-nmap");
    const scanClass = nmap.NmapScan;

    return await new Promise<DeviceRecord[]>((resolve) => {
      const devices: DeviceRecord[] = [];
      const scan = new scanClass(range, "-O -sV");

      scan.on("complete", (...args: unknown[]) => {
        const hosts = (args[0] as unknown[]) ?? [];
        const parsed = hosts
          .map((host, index) => {
            const maybeHost = host as {
              ip?: string;
              hostname?: string;
              mac?: string;
              vendor?: string;
              osNmap?: string;
            };

            if (!maybeHost.ip) {
              return null;
            }

            const manufacturer = maybeHost.vendor?.trim() || "Unknown";
            const model = maybeHost.osNmap?.trim() || "Unclassified Device";
            const ip = maybeHost.ip;

            return {
              id: crypto.createHash("md5").update(`${ip}-${model}-${index}`).digest("hex"),
              ip,
              hostname: maybeHost.hostname || `device-${index + 1}`,
              mac: maybeHost.mac || "00:00:00:00:00:00",
              manufacturer,
              model,
              firmwareVersion: "0.0.0",
              lastSeenAt: new Date().toISOString(),
              discoveredAt: new Date().toISOString(),
              status: "online"
            } as DeviceRecord;
          })
          .filter((device): device is DeviceRecord => device !== null);

        devices.push(...parsed);
        resolve(devices);
      });

      scan.on("error", () => {
        resolve([]);
      });

      scan.startScan();
    });
  } catch {
    return [];
  }
}

export async function discoverDevices(options: ScanOptions): Promise<DeviceRecord[]> {
  const range = sanitizeRange(options.range);
  const shouldUseNmap = process.env.ENABLE_REAL_NMAP === "true";
  const existingDevices = options.mergeWithExisting ? await getDevices() : [];

  const nmapResults = shouldUseNmap ? await scanWithNmap(range) : [];
  const discovered = nmapResults.length > 0 ? nmapResults : Array.from({ length: 18 }, (_, index) => buildSimulatedDevice(range, index));

  const deduped = new Map<string, DeviceRecord>();
  for (const device of [...existingDevices, ...discovered]) {
    deduped.set(device.id, device);
  }

  const merged = Array.from(deduped.values());
  await setDevices(merged);
  return merged;
}
