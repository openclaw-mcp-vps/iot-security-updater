import { ConsoleHeader } from "@/components/console-header";
import { DeviceDiscoveryPanel } from "@/components/device-discovery-panel";
import { getStoredDevices } from "@/lib/device-scanner";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const devices = await getStoredDevices();

  return (
    <main className="min-h-screen pb-14">
      <ConsoleHeader
        title="Device Inventory"
        description="Continuously discovered IoT endpoints across network zones with risk posture metadata."
      />
      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <DeviceDiscoveryPanel initialDevices={devices} />
      </section>
    </main>
  );
}
