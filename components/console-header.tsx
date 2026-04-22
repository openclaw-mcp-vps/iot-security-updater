import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/devices", label: "Devices" },
  { href: "/patches", label: "Patches" },
  { href: "/schedules", label: "Schedules" }
];

export function ConsoleHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="border-b border-[var(--border)] bg-black/15 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted)]">
            <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
            Secured Workspace
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
          <form action="/api/access/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-[var(--critical)]/40 bg-[var(--critical)]/10 px-3 py-2 text-sm text-[var(--critical)] transition hover:bg-[var(--critical)]/20"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
