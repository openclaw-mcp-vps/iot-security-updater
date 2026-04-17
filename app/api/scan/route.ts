import { NextResponse } from "next/server";
import { z } from "zod";

import { discoverDevices } from "@/lib/device-discovery";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import type { Device } from "@/lib/types";
import { getHighestSeverity, matchDeviceVulnerabilities } from "@/lib/vulnerability-db";

const scanSchema = z.object({ subnet: z.string() });

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = scanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const discovered = await discoverDevices(parsed.data.subnet);

    const enriched = discovered.map((device) => {
      const vulnerabilities = matchDeviceVulnerabilities(device);
      return {
        ...device,
        vulnerable: vulnerabilities.length > 0,
        highestSeverity: getHighestSeverity(vulnerabilities)
      };
    });

    const existing = await readJsonFile<Device[]>("devices.json", []);
    const byId = new Map(existing.map((device) => [device.id, device]));

    for (const device of enriched) {
      byId.set(device.id, { ...byId.get(device.id), ...device, lastSeen: new Date().toISOString() });
    }

    await writeJsonFile("devices.json", Array.from(byId.values()));

    return NextResponse.json({ devices: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Network scan failed" },
      { status: 500 }
    );
  }
}
