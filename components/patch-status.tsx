"use client";

import { useMemo, useTransition, useState } from "react";
import { AlertTriangle, ShieldCheck, ShieldEllipsis } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { formatDateTime, severityBadgeClass } from "@/lib/format";
import type { PatchRecord } from "@/lib/types";

interface PatchStatusProps {
  patches: PatchRecord[];
}

const statusColors: Record<string, string> = {
  available: "#f97316",
  scheduled: "#06b6d4",
  applied: "#22c55e",
  failed: "#ef4444",
  in_progress: "#38bdf8"
};

export function PatchStatus({ patches: initialPatches }: PatchStatusProps) {
  const [patches, setPatches] = useState<PatchRecord[]>(initialPatches);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const chartData = useMemo(() => {
    const grouped = patches.reduce<Record<string, number>>((acc, patch) => {
      acc[patch.status] = (acc[patch.status] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      fill: statusColors[name] ?? "#64748b"
    }));
  }, [patches]);

  const openPatches = useMemo(() => patches.filter((patch) => patch.status !== "applied"), [patches]);

  const handleCheck = () => {
    startTransition(async () => {
      setMessage("");
      const response = await fetch("/api/patches/check", {
        method: "POST"
      });
      const data = (await response.json()) as { patches?: PatchRecord[]; error?: string };
      if (!response.ok || !data.patches) {
        setMessage(data.error ?? "Patch check failed.");
        return;
      }

      setPatches(data.patches);
      const availableCount = data.patches.filter((patch) => patch.status === "available").length;
      setMessage(`Patch intelligence refreshed. ${availableCount} patches are ready for rollout.`);
    });
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldEllipsis className="h-4 w-4 text-cyan-300" />
              Patch Risk Overview
            </CardTitle>
            <CardDescription>
              Live status for discovered vulnerabilities and firmware updates across your fleet.
            </CardDescription>
          </div>
          <Button onClick={handleCheck} disabled={isPending}>
            {isPending ? "Checking..." : "Check for New Patches"}
          </Button>
        </div>

        {message ? <p className="text-sm text-cyan-300">{message}</p> : null}

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="h-64 rounded-lg border border-slate-800 bg-slate-950/40 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "0.5rem"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid content-start gap-3">
            {chartData.length === 0 ? <p className="text-sm text-slate-400">No patch data available yet.</p> : null}
            {chartData.map((entry) => (
              <div key={entry.name} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{entry.name.replace("_", " ")}</p>
                <p className="text-2xl font-semibold text-slate-100">{entry.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-300" />
            Open Patch Queue
          </CardTitle>
          <Badge className="border-cyan-400/40 bg-cyan-500/10 text-cyan-200">{openPatches.length} pending</Badge>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <Table>
            <Thead>
              <Tr>
                <Th>Patch</Th>
                <Th>CVE</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th>Released</Th>
              </Tr>
            </Thead>
            <Tbody>
              {openPatches.map((patch) => (
                <Tr key={patch.id}>
                  <Td>
                    <div className="font-medium text-slate-100">{patch.title}</div>
                    <div className="text-xs text-slate-400">{patch.manufacturer}</div>
                  </Td>
                  <Td className="font-mono text-xs">{patch.cve}</Td>
                  <Td>
                    <Badge className={severityBadgeClass(patch.severity)}>{patch.severity}</Badge>
                  </Td>
                  <Td>
                    <Badge className="border-slate-600 bg-slate-800/80">{patch.status.replace("_", " ")}</Badge>
                  </Td>
                  <Td className="text-xs text-slate-300">{formatDateTime(patch.releasedAt)}</Td>
                </Tr>
              ))}
              {openPatches.length === 0 ? (
                <Tr>
                  <Td colSpan={5} className="py-8 text-center text-emerald-300">
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      No open patches. Your fleet is fully updated.
                    </span>
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
