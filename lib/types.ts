export type PatchSeverity = "critical" | "high" | "medium" | "low";

export interface Device {
  id: string;
  hostname: string;
  ip: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  lastSeenAt: string;
  riskScore: number;
  status: "online" | "offline";
  networkZone: string;
}

export interface Patch {
  id: string;
  manufacturer: string;
  model: string;
  targetFirmwareVersion: string;
  severity: PatchSeverity;
  cve: string;
  summary: string;
  releasedAt: string;
  requiresReboot: boolean;
}

export interface PatchStatus {
  id: string;
  deviceId: string;
  patchId: string;
  applicable: boolean;
  scheduled: boolean;
  installed: boolean;
}

export interface VulnerabilityAlert {
  id: string;
  severity: PatchSeverity;
  cve: string;
  summary: string;
  impactedDevices: number;
  patchId: string;
}

export interface PatchSummary {
  totalDevices: number;
  vulnerableDevices: number;
  criticalPatches: number;
  scheduledUpdates: number;
}

export interface ScheduledUpdate {
  id: string;
  deviceId: string;
  patchId: string;
  plannedFor: string;
  status: "queued" | "pending_agent" | "in_progress" | "completed" | "failed";
  queueJobId?: string;
  createdAt: string;
  requestedBy: string;
}

export interface PurchaseRecord {
  email: string;
  sessionId: string;
  purchasedAt: string;
  plan: string;
}

export interface PatchSnapshot {
  statuses: PatchStatus[];
  alerts: VulnerabilityAlert[];
  summary: PatchSummary;
}
