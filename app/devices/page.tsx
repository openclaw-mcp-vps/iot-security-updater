import { DeviceList } from "@/components/device-list";
import { ProtectedPageHeader } from "@/components/protected-page-header";
import { getDevices } from "@/lib/storage";

export default async function DevicesPage() {
  const devices = await getDevices();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ProtectedPageHeader
        title="Device Discovery"
        description="Identify unmanaged endpoints and maintain an accurate, security-relevant inventory across camera, network, and operational devices."
      />
      <DeviceList devices={devices} />
    </div>
  );
}
