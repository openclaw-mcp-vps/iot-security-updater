export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface DeviceRecord {
  id: string;
  ip: string;
  hostname: string;
  mac: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  lastSeenAt: string;
  discoveredAt: string;
  status: "online" | "offline";
}

export interface PatchRecord {
  id: string;
  deviceId: string;
  manufacturer: string;
  title: string;
  cve: string;
  severity: RiskLevel;
  cvss: number;
  releasedAt: string;
  currentVersion: string;
  targetVersion: string;
  requiresReboot: boolean;
  status: "available" | "scheduled" | "in_progress" | "applied" | "failed";
  summary: string;
}

export interface MaintenanceWindow {
  id: string;
  name: string;
  cron: string;
  timezone: string;
  maxConcurrent: number;
}

export interface PatchJob {
  id: string;
  patchIds: string[];
  deviceIds: string[];
  maintenanceWindowId: string;
  scheduledFor: string;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface PurchaseRecord {
  id: string;
  email: string;
  source: "lemonsqueezy-webhook" | "manual";
  createdAt: string;
  active: boolean;
  lastOrderId?: string;
}

export interface AppState {
  devices: DeviceRecord[];
  patches: PatchRecord[];
  jobs: PatchJob[];
  maintenanceWindows: MaintenanceWindow[];
  purchases: PurchaseRecord[];
}
