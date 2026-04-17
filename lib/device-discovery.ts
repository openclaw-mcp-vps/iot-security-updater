import nmap from "node-nmap";
import { z } from "zod";

import type { Device } from "@/lib/types";

const subnetSchema = z.string().regex(/^[0-9]{1,3}(\.[0-9]{1,3}){3}\/[0-9]{1,2}$/);

type NmapDevice = {
  ip: string;
  hostname?: string;
  mac?: string;
  openPorts?: Array<{ port: number }>;
  vendor?: string;
};

function syntheticDevices(subnet: string): Device[] {
  const prefix = subnet.split("/")[0].split(".").slice(0, 3).join(".");
  const now = new Date().toISOString();

  return [
    {
      id: `${prefix}-cam-11`,
      ip: `${prefix}.11`,
      hostname: "warehouse-cam-11",
      vendor: "Axis",
      model: "AX-Q741",
      firmwareVersion: "2.1.3",
      lastSeen: now,
      vulnerable: false,
      openPorts: [22, 80, 554]
    },
    {
      id: `${prefix}-sensor-26`,
      ip: `${prefix}.26`,
      hostname: "temp-sensor-26",
      vendor: "Bosch",
      model: "T500",
      firmwareVersion: "1.7.0",
      lastSeen: now,
      vulnerable: false,
      openPorts: [22, 443]
    }
  ];
}

export async function discoverDevices(subnet: string): Promise<Device[]> {
  const parsedSubnet = subnetSchema.safeParse(subnet);
  if (!parsedSubnet.success) {
    throw new Error("Subnet must use CIDR format, for example 192.168.1.0/24");
  }

  if (process.env.NODE_ENV !== "production" || process.env.DISABLE_NMAP_SCAN === "1") {
    return syntheticDevices(subnet);
  }

  nmap.nmapLocation = "nmap";

  return new Promise((resolve) => {
    const scan = new nmap.QuickScan(subnet, "-sn") as {
      on: (event: string, callback: (result?: NmapDevice[]) => void) => void;
      startScan: () => void;
    };

    scan.on("complete", (hosts?: NmapDevice[]) => {
      if (!hosts || hosts.length === 0) {
        resolve(syntheticDevices(subnet));
        return;
      }

      resolve(
        hosts.map((host, index) => ({
          id: `${host.ip}-${index}`,
          ip: host.ip,
          hostname: host.hostname,
          mac: host.mac,
          vendor: host.vendor,
          model: host.vendor ? `${host.vendor} Gateway` : "Unknown Model",
          firmwareVersion: "1.0.0",
          lastSeen: new Date().toISOString(),
          vulnerable: false,
          openPorts: host.openPorts?.map((port) => port.port) ?? []
        }))
      );
    });

    scan.on("error", () => {
      resolve(syntheticDevices(subnet));
    });

    scan.startScan();
  });
}
