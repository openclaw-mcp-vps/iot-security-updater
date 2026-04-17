"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Device, PatchJob } from "@/lib/types";

type PatchesResponse = {
  jobs: PatchJob[];
  devices: Device[];
};

export default function PatchScheduler() {
  const [jobs, setJobs] = useState<PatchJob[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [targetVersion, setTargetVersion] = useState("2.1.4");
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/patches", { cache: "no-store" });
    const payload = (await response.json()) as PatchesResponse;
    setJobs(payload.jobs);
    setDevices(payload.devices);
    if (!deviceId && payload.devices[0]) {
      setDeviceId(payload.devices[0].id);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function schedule() {
    if (!deviceId || !scheduledAt) {
      setMessage("Choose a device and schedule time.");
      return;
    }

    const response = await fetch("/api/patches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, targetVersion, scheduledAt })
    });

    const payload = (await response.json()) as { message?: string; error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Failed to schedule patch.");
      return;
    }

    setMessage(payload.message ?? "Patch scheduled.");
    await load();
  }

  const chartData = [
    {
      name: "Scheduled",
      value: jobs.filter((job) => job.status === "scheduled").length
    },
    {
      name: "Running",
      value: jobs.filter((job) => job.status === "running").length
    },
    {
      name: "Done",
      value: jobs.filter((job) => job.status === "completed").length
    },
    {
      name: "Failed",
      value: jobs.filter((job) => job.status === "failed").length
    }
  ];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-lg font-semibold">Patch Scheduler</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">Queue targeted firmware updates with auditable job state.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <select
          className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
          value={deviceId}
          onChange={(event) => setDeviceId(event.target.value)}
        >
          {devices.length === 0 ? <option value="">No devices discovered</option> : null}
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.hostname ?? device.ip}
            </option>
          ))}
        </select>

        <input
          className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
          value={targetVersion}
          onChange={(event) => setTargetVersion(event.target.value)}
          placeholder="Target version"
        />

        <input
          className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
        />
      </div>

      <button className="mt-3 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black" onClick={schedule}>
        Schedule Patch
      </button>

      {message ? <p className="mt-2 text-sm text-[var(--muted)]">{message}</p> : null}

      <div className="mt-5 h-48 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b354a" />
            <XAxis dataKey="name" stroke="#9aa6b2" />
            <YAxis stroke="#9aa6b2" allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#121926", border: "1px solid #2b354a" }} />
            <Bar dataKey="value" fill="#2fbf71" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
