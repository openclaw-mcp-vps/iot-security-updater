import { cookies } from "next/headers";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProtectedPageHeader } from "@/components/protected-page-header";
import { ACCESS_COOKIE } from "@/lib/constants";
import { getMaintenanceWindows } from "@/lib/storage";

export default async function SettingsPage() {
  const windows = await getMaintenanceWindows();
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(ACCESS_COOKIE)?.value === "granted";

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-8">
      <ProtectedPageHeader
        title="Settings"
        description="Review deployment defaults, maintenance policy, and environment values required for automated billing and webhook validation."
      />

      <Card>
        <CardTitle>Access Status</CardTitle>
        <CardDescription>
          The dashboard is currently {hasAccess ? "unlocked for this browser" : "locked"}. Access is managed through a secure paid cookie.
        </CardDescription>
      </Card>

      <Card className="space-y-4">
        <div>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Set these values in production so checkout and webhook verification work correctly.</CardDescription>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="storeId">NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID</Label>
            <Input id="storeId" readOnly value={process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID ?? "Not set"} />
          </div>
          <div>
            <Label htmlFor="productId">NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID</Label>
            <Input id="productId" readOnly value={process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID ?? "Not set"} />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Maintenance Windows</CardTitle>
        <CardDescription>Current rollout windows used by the patch scheduler.</CardDescription>
        <Textarea
          readOnly
          className="mt-3 min-h-44 font-[var(--font-mono)] text-xs"
          value={JSON.stringify(windows, null, 2)}
        />
      </Card>
    </div>
  );
}
