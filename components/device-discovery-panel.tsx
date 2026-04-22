"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Radar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Device } from "@/lib/types";

function riskVariant(score: number): "critical" | "warning" | "success" {
  if (score >= 85) {
    return "critical";
  }
  if (score >= 70) {
    return "warning";
  }
  return "success";
}

export function DeviceDiscoveryPanel({ initialDevices }: { initialDevices: Device[] }) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");

  const highRisk = useMemo(() => devices.filter((device) => device.riskScore >= 80).length, [devices]);

  async function rescanNetwork() {
    setIsScanning(true);
    setError("");
    try {
      const response = await fetch("/api/devices/scan", { method: "POST" });
      const payload = (await response.json()) as { devices?: Device[]; error?: string };
      if (!response.ok || !payload.devices) {
        setError(payload.error || "Device scan failed.");
        return;
      }
      setDevices(payload.devices);
    } catch {
      setError("Unable to contact the scanner service.");
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-[var(--info)]" />
            Device Discovery
          </span>
          <Button onClick={rescanNetwork} size="sm" disabled={isScanning}>
            {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run Scan
          </Button>
        </CardTitle>
        <CardDescription>
          Live inventory from scanning agents across network segments. {highRisk} devices currently have
          high risk posture.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? <p className="mb-4 text-sm text-[var(--critical)]">{error}</p> : null}

        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] bg-black/20 p-4 text-sm md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">{device.hostname}</p>
                <p className="text-xs text-[var(--muted)]">
                  {device.manufacturer} {device.model} • {device.ip} • {device.networkZone}
                </p>
              </div>
              <div className="text-[var(--muted)]">
                Firmware <span className="font-medium text-[var(--foreground)]">{device.firmwareVersion}</span>
              </div>
              <div className="text-[var(--muted)]">
                Seen {formatDistanceToNow(new Date(device.lastSeenAt), { addSuffix: true })}
              </div>
              <div className="flex items-center justify-start gap-2 md:justify-end">
                <Badge variant={device.status === "online" ? "success" : "default"}>{device.status}</Badge>
                <Badge variant={riskVariant(device.riskScore)}>{device.riskScore} risk</Badge>
              </div>
            </div>
          ))}
          {devices.length === 0 ? (
            <div className="rounded-md border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
              No devices found yet. Run a scan to populate the inventory.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
