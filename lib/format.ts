export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function severityBadgeClass(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-500/20 text-red-300 border-red-400/40";
    case "high":
      return "bg-orange-500/20 text-orange-300 border-orange-400/40";
    case "medium":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-400/40";
    default:
      return "bg-slate-500/20 text-slate-200 border-slate-400/40";
  }
}
