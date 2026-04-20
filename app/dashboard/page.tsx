import { AlertTriangle, CheckCircle2, Clock, Radar } from "lucide-react";
import { ProtectedPageHeader } from "@/components/protected-page-header";
import { SecurityMetricsChart } from "@/components/security-metrics-chart";
import { Card } from "@/components/ui/card";
import { getJobs } from "@/lib/storage";
import { getPatchSummary } from "@/lib/patch-manager";

export default async function DashboardPage() {
  const [summary, jobs] = await Promise.all([getPatchSummary(), getJobs()]);

  const chartData = [
    { label: "Online", value: summary.onlineDevices },
    { label: "Available", value: summary.availablePatches },
    { label: "Scheduled", value: summary.scheduledPatches },
    { label: "Applied", value: summary.appliedPatches },
    { label: "Critical", value: summary.criticalOpenPatches }
  ];

  const recentJobs = jobs.slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ProtectedPageHeader
        title="Security Operations Dashboard"
        description="Monitor IoT patch exposure, prioritize critical CVEs, and confirm maintenance execution across your mixed-vendor device fleet."
      />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Tracked Devices</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{summary.totalDevices}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-cyan-300">
            <Radar className="h-3.5 w-3.5" />
            {summary.onlineDevices} online now
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Open Patches</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{summary.availablePatches}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-orange-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            {summary.criticalOpenPatches} critical
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Scheduled Rollouts</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{summary.scheduledPatches}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-cyan-300">
            <Clock className="h-3.5 w-3.5" />
            queued for maintenance
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Risk Exposure Score</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{summary.exposureScore}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            weighted by severity
          </p>
        </Card>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-400">Patch Pipeline Health</h2>
          <SecurityMetricsChart data={chartData} />
        </div>

        <Card>
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">Recent Jobs</h2>
          <div className="mt-3 space-y-3">
            {recentJobs.length === 0 ? <p className="text-sm text-slate-400">No rollout jobs have been scheduled yet.</p> : null}
            {recentJobs.map((job) => (
              <div key={job.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <p className="text-xs font-mono text-slate-400">{job.id}</p>
                <p className="mt-1 text-sm text-slate-100">
                  {job.patchIds.length} patches for {job.deviceIds.length} devices
                </p>
                <p className="text-xs text-slate-400">Status: {job.status.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
