"use client";

import { useMemo, useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { DeviceRecord, MaintenanceWindow, PatchRecord } from "@/lib/types";

const schema = z.object({
  maintenanceWindowId: z.string().min(1, "Pick a maintenance window."),
  scheduledFor: z.string().min(1, "Choose a date and time."),
  severityScope: z.enum(["critical", "high-or-higher", "all"])
});

type FormData = z.infer<typeof schema>;

interface MaintenanceWindowProps {
  patches: PatchRecord[];
  devices: DeviceRecord[];
  windows: MaintenanceWindow[];
}

function severityRank(value: PatchRecord["severity"]): number {
  switch (value) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    default:
      return 1;
  }
}

export function MaintenanceWindowPlanner({ patches, devices, windows }: MaintenanceWindowProps) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      maintenanceWindowId: windows[0]?.id ?? "",
      scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
      severityScope: "high-or-higher"
    }
  });

  const availablePatches = useMemo(() => patches.filter((patch) => patch.status === "available"), [patches]);

  const onSubmit = (values: FormData) => {
    startTransition(async () => {
      setMessage("");

      const minRank = values.severityScope === "critical" ? 4 : values.severityScope === "high-or-higher" ? 3 : 1;
      const selectedPatches = availablePatches.filter((patch) => severityRank(patch.severity) >= minRank);

      if (selectedPatches.length === 0) {
        setMessage("No matching patches in the selected risk scope.");
        return;
      }

      const response = await fetch("/api/patches/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          maintenanceWindowId: values.maintenanceWindowId,
          scheduledFor: new Date(values.scheduledFor).toISOString(),
          patchIds: selectedPatches.map((patch) => patch.id),
          deviceIds: Array.from(new Set(selectedPatches.map((patch) => patch.deviceId)))
        })
      });

      const data = (await response.json()) as { job?: { id: string }; error?: string };
      if (!response.ok || !data.job) {
        setMessage(data.error ?? "Unable to schedule patch rollout.");
        return;
      }

      setMessage(`Rollout queued as job ${data.job.id}. ${selectedPatches.length} patches are now scheduled.`);
    });
  };

  return (
    <Card className="space-y-4">
      <div>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-cyan-300" />
          Maintenance Window Orchestration
        </CardTitle>
        <CardDescription>
          Bundle risky patches into a controlled rollout and apply them during your approved maintenance period.
        </CardDescription>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="window">Maintenance Window</Label>
          <Select id="window" {...form.register("maintenanceWindowId")}>
            {windows.map((window) => (
              <option key={window.id} value={window.id}>
                {window.name} ({window.cron}, {window.timezone})
              </option>
            ))}
          </Select>
          {form.formState.errors.maintenanceWindowId ? (
            <p className="mt-1 text-xs text-red-300">{form.formState.errors.maintenanceWindowId.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="scheduledFor">Execute At (UTC)</Label>
          <Input id="scheduledFor" type="datetime-local" {...form.register("scheduledFor")} />
          {form.formState.errors.scheduledFor ? <p className="mt-1 text-xs text-red-300">{form.formState.errors.scheduledFor.message}</p> : null}
        </div>

        <div>
          <Label htmlFor="severityScope">Risk Scope</Label>
          <Select id="severityScope" {...form.register("severityScope")}>
            <option value="critical">Critical only</option>
            <option value="high-or-higher">High + Critical</option>
            <option value="all">All open patches</option>
          </Select>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300">
          <p className="font-medium text-slate-100">Planned impact</p>
          <p className="mt-1">{availablePatches.length} available patches across {devices.length} tracked devices.</p>
          <p className="mt-1 inline-flex items-center gap-1 text-cyan-300">
            <Clock3 className="h-3.5 w-3.5" />
            Jobs execute automatically every minute once due.
          </p>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Scheduling..." : "Schedule Rollout"}
          </Button>
        </div>
      </form>

      {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
    </Card>
  );
}
