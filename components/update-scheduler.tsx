"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Device, Patch, ScheduledUpdate } from "@/lib/types";

const scheduleSchema = z.object({
  deviceId: z.string().min(1, "Select a device."),
  patchId: z.string().min(1, "Select a patch."),
  plannedFor: z
    .string()
    .min(1, "Choose a maintenance window time.")
    .refine((value) => new Date(value).getTime() > Date.now(), "Use a future date/time.")
});

type ScheduleValues = z.infer<typeof scheduleSchema>;

interface UpdateSchedulerProps {
  devices: Device[];
  patches: Patch[];
  initialSchedules: ScheduledUpdate[];
}

export function UpdateScheduler({ devices, patches, initialSchedules }: UpdateSchedulerProps) {
  const [schedules, setSchedules] = useState<ScheduledUpdate[]>(initialSchedules);
  const [error, setError] = useState<string>("");

  const form = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      deviceId: devices[0]?.id || "",
      patchId: "",
      plannedFor: ""
    }
  });

  const selectedDeviceId = form.watch("deviceId");

  const relevantPatches = useMemo(() => {
    const selected = devices.find((device) => device.id === selectedDeviceId);
    if (!selected) {
      return [];
    }

    return patches.filter(
      (patch) => patch.manufacturer === selected.manufacturer && patch.model === selected.model
    );
  }, [devices, patches, selectedDeviceId]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError("");

    const response = await fetch("/api/updates/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as {
      schedule?: ScheduledUpdate;
      schedules?: ScheduledUpdate[];
      error?: string;
    };

    if (!response.ok) {
      setError(payload.error || "Failed to schedule update.");
      return;
    }

    if (payload.schedules) {
      setSchedules(payload.schedules);
    } else if (payload.schedule) {
      setSchedules((current) => [payload.schedule as ScheduledUpdate, ...current]);
    }

    form.reset({
      ...values,
      plannedFor: ""
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-[var(--info)]" />
          Update Scheduler
        </CardTitle>
        <CardDescription>
          Queue firmware updates into controlled maintenance windows with orchestration metadata.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <form className="grid gap-4 rounded-lg border border-[var(--border)] bg-black/20 p-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="deviceId">Device</Label>
            <Select
              id="deviceId"
              {...form.register("deviceId")}
              onChange={(event) => {
                form.setValue("deviceId", event.target.value, { shouldValidate: true });
                form.setValue("patchId", "");
              }}
            >
              <option value="">Select device</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.hostname} ({device.manufacturer} {device.model})
                </option>
              ))}
            </Select>
            {form.formState.errors.deviceId ? (
              <p className="text-sm text-[var(--critical)]">{form.formState.errors.deviceId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="patchId">Patch</Label>
            <Select id="patchId" {...form.register("patchId")}>
              <option value="">Select patch</option>
              {relevantPatches.map((patch) => (
                <option key={patch.id} value={patch.id}>
                  {patch.cve} → {patch.targetFirmwareVersion} ({patch.severity})
                </option>
              ))}
            </Select>
            {form.formState.errors.patchId ? (
              <p className="text-sm text-[var(--critical)]">{form.formState.errors.patchId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="plannedFor">Maintenance Window</Label>
            <Input id="plannedFor" type="datetime-local" {...form.register("plannedFor")} />
            {form.formState.errors.plannedFor ? (
              <p className="text-sm text-[var(--critical)]">{form.formState.errors.plannedFor.message}</p>
            ) : null}
          </div>

          {error ? <p className="md:col-span-2 text-sm text-[var(--critical)]">{error}</p> : null}

          <div className="md:col-span-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Queue Update Job
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Scheduled Jobs</h3>
          {schedules
            .slice()
            .sort((a, b) => new Date(a.plannedFor).getTime() - new Date(b.plannedFor).getTime())
            .map((schedule) => {
              const device = devices.find((item) => item.id === schedule.deviceId);
              const patch = patches.find((item) => item.id === schedule.patchId);

              return (
                <article key={schedule.id} className="rounded-md border border-[var(--border)] bg-black/20 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{device?.hostname || schedule.deviceId}</p>
                      <p className="text-xs text-[var(--muted)]">{patch?.cve || schedule.patchId}</p>
                    </div>
                    <Badge
                      variant={
                        schedule.status === "queued"
                          ? "info"
                          : schedule.status === "pending_agent"
                            ? "warning"
                            : schedule.status === "completed"
                              ? "success"
                              : "default"
                      }
                    >
                      {schedule.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Planned for {format(new Date(schedule.plannedFor), "PPP p")} • requested by {schedule.requestedBy}
                  </p>
                </article>
              );
            })}
          {schedules.length === 0 ? (
            <div className="rounded-md border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
              No updates scheduled yet. Queue your first maintenance window.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
