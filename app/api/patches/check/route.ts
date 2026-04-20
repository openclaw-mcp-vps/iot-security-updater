import { NextResponse } from "next/server";
import { checkForPatches } from "@/lib/patch-manager";
import { getDevices } from "@/lib/storage";

export async function POST() {
  try {
    const devices = await getDevices();
    const patches = await checkForPatches(devices);

    return NextResponse.json({ patches });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Patch check failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
