import crypto from "node:crypto";
import cron from "node-cron";
import { getJobs, getMaintenanceWindows, getPatches, setJobs, setPatches } from "@/lib/storage";
import type { PatchJob } from "@/lib/types";

interface SchedulePatchInput {
  patchIds: string[];
  deviceIds: string[];
  maintenanceWindowId: string;
  scheduledFor: string;
}

let schedulerStarted = false;
let schedulerTask: cron.ScheduledTask | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function randomFailure(): boolean {
  const value = crypto.randomInt(0, 100);
  return value < 6;
}

export function startPatchScheduler(): void {
  if (schedulerStarted) {
    return;
  }

  schedulerTask = cron.schedule(
    "* * * * *",
    async () => {
      await runDueJobs();
    },
    {
      timezone: "Etc/UTC"
    }
  );

  schedulerStarted = true;
}

export function stopPatchScheduler(): void {
  if (schedulerTask) {
    schedulerTask.stop();
  }

  schedulerTask = null;
  schedulerStarted = false;
}

export async function listMaintenanceWindows() {
  return getMaintenanceWindows();
}

export async function schedulePatchRollout(input: SchedulePatchInput): Promise<PatchJob> {
  startPatchScheduler();

  const jobs = await getJobs();
  const job: PatchJob = {
    id: crypto.randomUUID(),
    patchIds: input.patchIds,
    deviceIds: input.deviceIds,
    maintenanceWindowId: input.maintenanceWindowId,
    scheduledFor: input.scheduledFor,
    status: "queued",
    createdAt: nowIso()
  };

  jobs.unshift(job);
  await setJobs(jobs);

  const patches = await getPatches();
  const patchSet = new Set(input.patchIds);
  const updatedPatches = patches.map((patch) => {
    if (patchSet.has(patch.id) && patch.status === "available") {
      return {
        ...patch,
        status: "scheduled" as const
      };
    }

    return patch;
  });

  await setPatches(updatedPatches);

  return job;
}

export async function runDueJobs(): Promise<PatchJob[]> {
  const [jobs, patches] = await Promise.all([getJobs(), getPatches()]);
  const now = Date.now();

  const queuedJobs = jobs.filter((job) => job.status === "queued" && new Date(job.scheduledFor).getTime() <= now);
  if (queuedJobs.length === 0) {
    return jobs;
  }

  const patchMap = new Map(patches.map((patch) => [patch.id, patch]));

  const updatedJobs: PatchJob[] = jobs.map((job): PatchJob => {
    if (!queuedJobs.some((queued) => queued.id === job.id)) {
      return job;
    }

    const failed = randomFailure();

    for (const patchId of job.patchIds) {
      const patch = patchMap.get(patchId);
      if (!patch) {
        continue;
      }

      patchMap.set(patchId, {
        ...patch,
        status: failed ? "failed" : "applied"
      });
    }

    return {
      ...job,
      status: failed ? "failed" : "completed",
      completedAt: nowIso(),
      failureReason: failed ? "One or more devices did not acknowledge firmware handoff." : undefined
    };
  });

  await Promise.all([setJobs(updatedJobs), setPatches(Array.from(patchMap.values()))]);
  return updatedJobs;
}
