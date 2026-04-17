import { NextResponse } from "next/server";
import { z } from "zod";

import { readJsonFile, writeJsonFile } from "@/lib/storage";
import type { Device } from "@/lib/types";

const upsertSchema = z.object({
  id: z.string(),
  ip: z.string(),
  firmwareVersion: z.string(),
  hostname: z.string().optional(),
  vendor: z.string().optional(),
  model: z.string().optional(),
  vulnerable: z.boolean().optional(),
  highestSeverity: z.enum(["low", "medium", "high", "critical"]).optional()
});

export async function GET() {
  const devices = await readJsonFile<Device[]>("devices.json", []);
  return NextResponse.json({ devices });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = upsertSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const devices = await readJsonFile<Device[]>("devices.json", []);
  const existingIndex = devices.findIndex((entry) => entry.id === parsed.data.id);

  const nextDevice: Device = {
    ...parsed.data,
    lastSeen: new Date().toISOString(),
    vulnerable: parsed.data.vulnerable ?? false,
    openPorts: []
  };

  if (existingIndex >= 0) {
    devices[existingIndex] = { ...devices[existingIndex], ...nextDevice };
  } else {
    devices.push(nextDevice);
  }

  await writeJsonFile("devices.json", devices);
  return NextResponse.json({ device: nextDevice }, { status: 201 });
}
