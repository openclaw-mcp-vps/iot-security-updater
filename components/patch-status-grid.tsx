"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Device, Patch, PatchStatus, PatchSummary } from "@/lib/types";

interface PatchGridProps {
  initialDevices: Device[];
  initialPatches: Patch[];
  initialStatuses: PatchStatus[];
  initialSummary: PatchSummary;
}

export function PatchStatusGrid({
  initialDevices,
  initialPatches,
  initialStatuses,
  initialSummary
}: PatchGridProps) {
  const [devices] = useState<Device[]>(initialDevices);
  const [patches, setPatches] = useState<Patch[]>(initialPatches);
  const [statuses, setStatuses] = useState<PatchStatus[]>(initialStatuses);
  const [summary, setSummary] = useState<PatchSummary>(initialSummary);
  const [loading, setLoading] = useState(false);

  const severityData = useMemo(() => {
    const map = new Map<string, number>();

    for (const status of statuses.filter((item) => item.applicable)) {
      const patch = patches.find((item) => item.id === status.patchId);
      if (!patch) {
        continue;
      }
      map.set(patch.severity, (map.get(patch.severity) || 0) + 1);
    }

    return ["critical", "high", "medium", "low"].map((severity) => ({
      severity,
      count: map.get(severity) || 0
    }));
  }, [patches, statuses]);

  const manufacturerData = useMemo(() => {
    const map = new Map<string, number>();

    for (const status of statuses.filter((item) => item.applicable)) {
      const device = devices.find((item) => item.id === status.deviceId);
      if (!device) {
        continue;
      }

      map.set(device.manufacturer, (map.get(device.manufacturer) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([manufacturer, vulnerable]) => ({ manufacturer, vulnerable }))
      .sort((a, b) => b.vulnerable - a.vulnerable)
      .slice(0, 6);
  }, [devices, statuses]);

  async function refreshCorrelation() {
    setLoading(true);
    try {
      const response = await fetch("/api/patches/check", { cache: "no-store" });
      const payload = (await response.json()) as {
        patches?: Patch[];
        statuses?: PatchStatus[];
        summary?: PatchSummary;
      };

      if (response.ok) {
        if (payload.patches) {
          setPatches(payload.patches);
        }
        if (payload.statuses) {
          setStatuses(payload.statuses);
        }
        if (payload.summary) {
          setSummary(payload.summary);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--info)]" />
            Patch Status Grid
          </span>
          <Button size="sm" variant="secondary" onClick={refreshCorrelation} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Check Patch Feeds
          </Button>
        </CardTitle>
        <CardDescription>
          Correlated exposure view across firmware versions and vendor advisories.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[var(--border)] bg-black/20 p-4">
            <p className="text-xs uppercase text-[var(--muted)]">Total Devices</p>
            <p className="mt-2 text-2xl font-semibold">{summary.totalDevices}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-black/20 p-4">
            <p className="text-xs uppercase text-[var(--muted)]">Vulnerable Devices</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--warning)]">{summary.vulnerableDevices}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-black/20 p-4">
            <p className="text-xs uppercase text-[var(--muted)]">Critical Fixes</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--critical)]">{summary.criticalPatches}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-black/20 p-4">
            <p className="text-xs uppercase text-[var(--muted)]">Scheduled Updates</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--success)]">{summary.scheduledUpdates}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-black/20 p-4">
            <p className="mb-3 text-sm font-medium">Exposure by Severity</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} />
                  <XAxis dataKey="severity" stroke="#9caec4" />
                  <YAxis stroke="#9caec4" />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #273244",
                      background: "#0f1623",
                      color: "#e6edf3"
                    }}
                  />
                  <Bar dataKey="count" fill="#4f8cff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-black/20 p-4">
            <p className="mb-3 text-sm font-medium">Top Manufacturers Requiring Updates</p>
            <div className="space-y-3">
              {manufacturerData.map((item) => (
                <div key={item.manufacturer} className="flex items-center justify-between rounded-md border border-[var(--border)] p-3 text-sm">
                  <span>{item.manufacturer}</span>
                  <Badge variant={item.vulnerable > 3 ? "warning" : "info"}>{item.vulnerable} pending</Badge>
                </div>
              ))}
              {manufacturerData.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No patch exposure detected in current correlation run.</p>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
