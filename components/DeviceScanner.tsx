"use client";

import { useState } from "react";

import type { Device } from "@/lib/types";

export default function DeviceScanner() {
  const [subnet, setSubnet] = useState("192.168.1.0/24");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);

  async function runScan() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subnet })
      });

      const payload = (await response.json()) as { devices?: Device[]; error?: string };
      if (!response.ok || !payload.devices) {
        throw new Error(payload.error ?? "Scan failed");
      }

      setDevices(payload.devices);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Unable to scan network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-lg font-semibold">Device Discovery</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">Scan a subnet to discover active IoT endpoints and import them.</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          value={subnet}
          onChange={(event) => setSubnet(event.target.value)}
          placeholder="192.168.1.0/24"
        />
        <button
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          onClick={runScan}
          disabled={loading}
        >
          {loading ? "Scanning..." : "Run Scan"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

      <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-[var(--border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Host</th>
              <th className="px-3 py-2">IP</th>
              <th className="px-3 py-2">Firmware</th>
              <th className="px-3 py-2">Severity</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-[var(--muted)]" colSpan={4}>
                  No scan data yet.
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2">{device.hostname ?? device.model ?? "Unknown"}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">{device.ip}</td>
                  <td className="px-3 py-2">{device.firmwareVersion}</td>
                  <td className="px-3 py-2 capitalize">{device.highestSeverity ?? "none"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
