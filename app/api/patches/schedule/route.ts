import { NextResponse } from "next/server";
import { z } from "zod";
import { schedulePatchRollout, runDueJobs, startPatchScheduler } from "@/lib/scheduler";

const schema = z.object({
  patchIds: z.array(z.string()).min(1, "Select at least one patch."),
  deviceIds: z.array(z.string()).min(1, "Select at least one device."),
  maintenanceWindowId: z.string().min(1, "Maintenance window is required."),
  scheduledFor: z.string().datetime()
});

export async function POST(request: Request) {
  try {
    startPatchScheduler();

    const body = await request.json();
    const input = schema.parse(body);

    const job = await schedulePatchRollout(input);
    await runDueJobs();

    return NextResponse.json({ job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to schedule rollout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
