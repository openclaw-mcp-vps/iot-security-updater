import Bull from "bull";
import { createClient } from "redis";
import { buildId, readDataFile, writeDataFile } from "@/lib/storage";
import type { ScheduledUpdate } from "@/lib/types";

const SCHEDULES_FILE = "schedules.json";

interface UpdateJobPayload {
  scheduleId: string;
  deviceId: string;
  patchId: string;
  plannedFor: string;
}

let queue: Bull.Queue<UpdateJobPayload> | null = null;

function resolveQueue(): Bull.Queue<UpdateJobPayload> | null {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  if (!queue) {
    queue = new Bull<UpdateJobPayload>("iot-update-orchestrator", redisUrl, {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 25,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 30000
        }
      }
    });
  }

  return queue;
}

export async function listScheduledUpdates(): Promise<ScheduledUpdate[]> {
  return readDataFile<ScheduledUpdate[]>(SCHEDULES_FILE, []);
}

export async function getQueueHealth(): Promise<{ enabled: boolean; connected: boolean }> {
  if (!process.env.REDIS_URL) {
    return { enabled: false, connected: false };
  }

  const client = createClient({ url: process.env.REDIS_URL });
  try {
    await client.connect();
    await client.ping();
    return { enabled: true, connected: true };
  } catch {
    return { enabled: true, connected: false };
  } finally {
    try {
      await client.quit();
    } catch {
      // ignore disconnect errors
    }
  }
}

export async function scheduleUpdateJob(input: {
  deviceId: string;
  patchId: string;
  plannedFor: string;
  requestedBy: string;
}): Promise<ScheduledUpdate> {
  const schedules = await listScheduledUpdates();
  const schedule: ScheduledUpdate = {
    id: buildId("schedule"),
    deviceId: input.deviceId,
    patchId: input.patchId,
    plannedFor: input.plannedFor,
    status: "pending_agent",
    createdAt: new Date().toISOString(),
    requestedBy: input.requestedBy
  };

  const queueInstance = resolveQueue();

  if (queueInstance) {
    const delay = Math.max(new Date(input.plannedFor).getTime() - Date.now(), 0);
    const job = await queueInstance.add(
      {
        scheduleId: schedule.id,
        deviceId: input.deviceId,
        patchId: input.patchId,
        plannedFor: input.plannedFor
      },
      {
        delay
      }
    );
    schedule.status = "queued";
    schedule.queueJobId = String(job.id);
  }

  schedules.push(schedule);
  await writeDataFile(SCHEDULES_FILE, schedules);
  return schedule;
}
