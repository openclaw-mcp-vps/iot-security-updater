import { NextResponse } from "next/server";
import { z } from "zod";

import { listPatchJobs, schedulePatchJob } from "@/lib/patch-manager";
import { readJsonFile } from "@/lib/storage";
import type { Device } from "@/lib/types";

const createPatchSchema = z.object({
  deviceId: z.string(),
  targetVersion: z.string(),
  scheduledAt: z.string()
});

export async function GET() {
  const [jobs, devices] = await Promise.all([listPatchJobs(), readJsonFile<Device[]>("devices.json", [])]);

  return NextResponse.json({ jobs, devices });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createPatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid patch job payload" }, { status: 400 });
  }

  const devices = await readJsonFile<Device[]>("devices.json", []);
  const target = devices.find((device) => device.id === parsed.data.deviceId);
  if (!target) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  const scheduleTime = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(scheduleTime.getTime())) {
    return NextResponse.json({ error: "Invalid schedule time" }, { status: 400 });
  }

  const job = await schedulePatchJob(target, parsed.data.targetVersion, scheduleTime.toISOString());

  return NextResponse.json({ message: `Patch queued for ${target.hostname ?? target.ip}`, job }, { status: 201 });
}
