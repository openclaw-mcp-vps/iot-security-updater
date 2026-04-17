export type Device = {
  id: string;
  ip: string;
  mac?: string;
  hostname?: string;
  vendor?: string;
  model?: string;
  firmwareVersion: string;
  lastSeen: string;
  vulnerable: boolean;
  highestSeverity?: "low" | "medium" | "high" | "critical";
  openPorts?: number[];
};

export type Vulnerability = {
  id: string;
  firmwareRange: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  cvss: number;
  patchedIn: string;
  summary: string;
  affectedModels: string[];
};

export type PatchJob = {
  id: string;
  deviceId: string;
  targetVersion: string;
  scheduledAt: string;
  status: "scheduled" | "running" | "completed" | "failed";
  notes: string;
};
