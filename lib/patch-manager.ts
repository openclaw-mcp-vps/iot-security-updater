import { CronJob } from "cron";
import { Client } from "ssh2";

import type { Device, PatchJob } from "@/lib/types";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

const jobs = new Map<string, CronJob>();

async function runPatch(device: Device, targetVersion: string): Promise<{ ok: boolean; notes: string }> {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, notes: `Simulated patch to ${targetVersion} for ${device.hostname ?? device.ip}` };
  }

  const ssh = new Client();

  return new Promise((resolve) => {
    ssh
      .on("ready", () => {
        ssh.exec(`sudo /usr/local/bin/apply_patch --target ${targetVersion}`, (err, stream) => {
          if (err) {
            resolve({ ok: false, notes: `SSH execution failed: ${err.message}` });
            ssh.end();
            return;
          }

          let output = "";
          stream
            .on("data", (chunk: Buffer) => {
              output += chunk.toString("utf8");
            })
            .on("close", () => {
              ssh.end();
              resolve({ ok: true, notes: output || `Patch command completed for ${device.ip}` });
            });
        });
      })
      .on("error", (error) => {
        resolve({ ok: false, notes: `SSH connection failed: ${error.message}` });
      })
      .connect({
        host: device.ip,
        port: 22,
        username: process.env.DEVICE_SSH_USER,
        password: process.env.DEVICE_SSH_PASS,
        readyTimeout: 6000
      });
  });
}

export async function listPatchJobs(): Promise<PatchJob[]> {
  return readJsonFile<PatchJob[]>("patch-jobs.json", []);
}

export async function schedulePatchJob(device: Device, targetVersion: string, scheduledAt: string): Promise<PatchJob> {
  const patchJob: PatchJob = {
    id: `${device.id}-${Date.now()}`,
    deviceId: device.id,
    targetVersion,
    scheduledAt,
    status: "scheduled",
    notes: "Queued for deployment"
  };

  const existingJobs = await listPatchJobs();
  await writeJsonFile("patch-jobs.json", [...existingJobs, patchJob]);

  const scheduledDate = new Date(scheduledAt);

  const cronExpr = `${scheduledDate.getUTCMinutes()} ${scheduledDate.getUTCHours()} ${scheduledDate.getUTCDate()} ${scheduledDate.getUTCMonth() + 1} *`;

  const job = CronJob.from({
    cronTime: cronExpr,
    start: true,
    timeZone: "UTC",
    onTick: async () => {
      const jobsOnDisk = await listPatchJobs();
      const current = jobsOnDisk.find((entry) => entry.id === patchJob.id);
      if (!current || current.status !== "scheduled") return;

      current.status = "running";
      current.notes = "Deployment in progress";
      await writeJsonFile("patch-jobs.json", jobsOnDisk);

      const result = await runPatch(device, targetVersion);
      current.status = result.ok ? "completed" : "failed";
      current.notes = result.notes;
      await writeJsonFile("patch-jobs.json", jobsOnDisk);
    }
  });

  jobs.set(patchJob.id, job);
  return patchJob;
}
