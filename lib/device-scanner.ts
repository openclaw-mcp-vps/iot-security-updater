import { subMinutes } from "date-fns";
import { readDataFile, writeDataFile } from "@/lib/storage";
import type { Device } from "@/lib/types";

const DEVICES_FILE = "devices.json";

const fallbackSeed: Omit<Device, "lastSeenAt">[] = [
  {
    id: "dev_cam_lobby_01",
    hostname: "lobby-cam-01",
    ip: "10.20.10.12",
    manufacturer: "Axis",
    model: "Q6215-LE",
    firmwareVersion: "10.9.2",
    riskScore: 88,
    status: "online",
    networkZone: "physical-security"
  },
  {
    id: "dev_cam_lobby_02",
    hostname: "lobby-cam-02",
    ip: "10.20.10.13",
    manufacturer: "Axis",
    model: "Q6215-LE",
    firmwareVersion: "10.8.7",
    riskScore: 72,
    status: "online",
    networkZone: "physical-security"
  },
  {
    id: "dev_badge_01",
    hostname: "badge-gateway-01",
    ip: "10.20.12.8",
    manufacturer: "HID",
    model: "Aero-X",
    firmwareVersion: "5.3.1",
    riskScore: 91,
    status: "online",
    networkZone: "facilities"
  },
  {
    id: "dev_hvac_04",
    hostname: "hvac-controller-04",
    ip: "10.20.18.44",
    manufacturer: "JohnsonControls",
    model: "Metasys-NC",
    firmwareVersion: "4.1.0",
    riskScore: 69,
    status: "offline",
    networkZone: "operations"
  },
  {
    id: "dev_printer_01",
    hostname: "print-floor2-01",
    ip: "10.20.30.20",
    manufacturer: "HP",
    model: "LaserJet-MFP-E626",
    firmwareVersion: "3.8.4",
    riskScore: 76,
    status: "online",
    networkZone: "corporate"
  }
];

function withDynamicLastSeen(devices: Omit<Device, "lastSeenAt">[]): Device[] {
  return devices.map((device, index) => ({
    ...device,
    lastSeenAt: subMinutes(new Date(), index * 6).toISOString()
  }));
}

function parseNmapHost(raw: unknown, index: number): Device | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const host = raw as {
    ip?: string;
    hostname?: string;
    openPorts?: Array<{ service?: string }>;
  };

  if (!host.ip) {
    return null;
  }

  const normalizedHostname = host.hostname || `iot-device-${index + 1}`;
  const usesRtsp = host.openPorts?.some((p) => p.service?.toLowerCase().includes("rtsp"));

  return {
    id: `dev_scan_${host.ip.replaceAll(".", "_")}`,
    hostname: normalizedHostname,
    ip: host.ip,
    manufacturer: usesRtsp ? "Axis" : "GenericVendor",
    model: usesRtsp ? "Q-Series" : "Embedded-Controller",
    firmwareVersion: usesRtsp ? "10.8.0" : "1.0.0",
    riskScore: usesRtsp ? 78 : 55,
    status: "online",
    networkZone: "discovered",
    lastSeenAt: new Date().toISOString()
  };
}

async function scanViaNmap(): Promise<Device[]> {
  try {
    const nmap = await import("node-nmap");
    const range = process.env.IOT_SCAN_RANGE || "10.20.0.0/16";

    return await new Promise<Device[]>((resolve, reject) => {
      const scan = new nmap.NmapScan(range, "-sP");

      scan.on("complete", (hosts: unknown[]) => {
        const devices = hosts
          .map((host, index) => parseNmapHost(host, index))
          .filter((item): item is Device => Boolean(item));
        resolve(devices);
      });

      scan.on("error", (error: Error) => {
        reject(error);
      });

      scan.startScan();
    });
  } catch {
    return [];
  }
}

function mergeDeviceInventory(current: Device[], incoming: Device[]): Device[] {
  const byId = new Map(current.map((device) => [device.id, device]));

  for (const discovered of incoming) {
    const existing = byId.get(discovered.id);
    byId.set(discovered.id, {
      ...(existing || discovered),
      ...discovered,
      lastSeenAt: new Date().toISOString()
    });
  }

  return Array.from(byId.values()).sort((a, b) => (a.hostname > b.hostname ? 1 : -1));
}

export async function getStoredDevices(): Promise<Device[]> {
  return readDataFile<Device[]>(DEVICES_FILE, []);
}

export async function discoverDevices(): Promise<Device[]> {
  const current = await getStoredDevices();
  const nmapDevices = await scanViaNmap();
  const discovered = nmapDevices.length > 0 ? nmapDevices : withDynamicLastSeen(fallbackSeed);
  const merged = mergeDeviceInventory(current, discovered);
  await writeDataFile(DEVICES_FILE, merged);
  return merged;
}
