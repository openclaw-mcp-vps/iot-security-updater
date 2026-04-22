import { NextRequest, NextResponse } from "next/server";
import { hasValidAccess } from "@/lib/auth";
import { discoverDevices, getStoredDevices } from "@/lib/device-scanner";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!hasValidAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const devices = await getStoredDevices();
  return NextResponse.json({ devices, count: devices.length });
}

export async function POST(request: NextRequest) {
  if (!hasValidAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const devices = await discoverDevices();
  return NextResponse.json({ devices, count: devices.length, scannedAt: new Date().toISOString() });
}
