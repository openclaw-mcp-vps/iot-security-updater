import { NextRequest, NextResponse } from "next/server";
import { hasValidAccess } from "@/lib/auth";
import { discoverDevices, getStoredDevices } from "@/lib/device-scanner";
import { refreshPatchCatalog } from "@/lib/manufacturer-apis";
import { buildPatchSnapshot } from "@/lib/patch-tracker";
import { listScheduledUpdates } from "@/lib/update-orchestrator";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!hasValidAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storedDevices = await getStoredDevices();
  const devices = storedDevices.length > 0 ? storedDevices : await discoverDevices();
  const patches = await refreshPatchCatalog(devices);
  const schedules = await listScheduledUpdates();
  const snapshot = buildPatchSnapshot(devices, patches, schedules);

  return NextResponse.json({
    devices,
    patches,
    statuses: snapshot.statuses,
    alerts: snapshot.alerts,
    summary: snapshot.summary,
    checkedAt: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
