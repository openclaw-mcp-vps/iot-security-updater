import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readJsonFile } from "@/lib/storage";
import type { Device } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const cookieStore = await cookies();
  const paid = cookieStore.get("iot_paid")?.value === "1";

  if (!paid) {
    redirect("/?paywall=1");
  }

  const devices = await readJsonFile<Device[]>("devices.json", []);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-10">
      <h1 className="text-3xl font-semibold">Managed Devices</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Tracked device inventory and firmware posture.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface)]">
            <tr>
              <th className="px-4 py-3 font-medium">Device</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">Firmware</th>
              <th className="px-4 py-3 font-medium">Risk</th>
              <th className="px-4 py-3 font-medium">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-[var(--muted)]" colSpan={5}>
                  No devices found. Run a network scan from the dashboard.
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">{device.hostname ?? device.model ?? device.id}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{device.ip}</td>
                  <td className="px-4 py-3">{device.firmwareVersion}</td>
                  <td className="px-4 py-3 capitalize">{device.highestSeverity ?? "none"}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{new Date(device.lastSeen).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
