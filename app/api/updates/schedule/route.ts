import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasValidAccess, verifyAccessToken } from "@/lib/auth";
import { getStoredDevices } from "@/lib/device-scanner";
import { getStoredPatches } from "@/lib/manufacturer-apis";
import { listScheduledUpdates, scheduleUpdateJob } from "@/lib/update-orchestrator";

const scheduleSchema = z.object({
  deviceId: z.string().min(1),
  patchId: z.string().min(1),
  plannedFor: z.string().datetime({ offset: false }).or(z.string().min(1))
});

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!hasValidAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedules = await listScheduledUpdates();
  return NextResponse.json({ schedules });
}

export async function POST(request: NextRequest) {
  if (!hasValidAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = scheduleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid scheduling payload." }, { status: 400 });
  }

  const plannedDate = new Date(parsed.data.plannedFor);
  if (Number.isNaN(plannedDate.getTime()) || plannedDate.getTime() <= Date.now()) {
    return NextResponse.json({ error: "plannedFor must be a future datetime." }, { status: 400 });
  }

  const [devices, patches] = await Promise.all([getStoredDevices(), getStoredPatches()]);

  const device = devices.find((item) => item.id === parsed.data.deviceId);
  if (!device) {
    return NextResponse.json({ error: "Device not found." }, { status: 404 });
  }

  const patch = patches.find((item) => item.id === parsed.data.patchId);
  if (!patch) {
    return NextResponse.json({ error: "Patch not found." }, { status: 404 });
  }

  const token = request.cookies.get("iotsec_access")?.value || "";
  const requester = verifyAccessToken(token).email || "authorized-user";

  await scheduleUpdateJob({
    deviceId: device.id,
    patchId: patch.id,
    plannedFor: plannedDate.toISOString(),
    requestedBy: requester
  });

  const schedules = await listScheduledUpdates();
  return NextResponse.json({ schedules });
}
