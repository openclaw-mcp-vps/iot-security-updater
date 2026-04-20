import { NextResponse } from "next/server";
import { z } from "zod";
import { discoverDevices } from "@/lib/device-scanner";

const schema = z.object({
  range: z.string().default("192.168.1.0/24"),
  mergeWithExisting: z.boolean().default(true)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = schema.parse(body);

    const devices = await discoverDevices({
      range: input.range,
      mergeWithExisting: input.mergeWithExisting
    });

    return NextResponse.json({ devices });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to scan devices.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
