import type { Metadata } from "next";
import { UnlockForm } from "@/components/unlock-form";

export const metadata: Metadata = {
  title: "Unlock Access",
  description: "Verify purchase and unlock the protected IoT security dashboard."
};

export default function UnlockPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      <UnlockForm />
    </div>
  );
}
