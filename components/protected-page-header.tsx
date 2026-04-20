import Link from "next/link";
import { Shield } from "lucide-react";

interface ProtectedPageHeaderProps {
  title: string;
  description: string;
}

export function ProtectedPageHeader({ title, description }: ProtectedPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">{description}</p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-cyan-400"
      >
        <Shield className="h-3.5 w-3.5" />
        Billing & Plan
      </Link>
    </div>
  );
}
