import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AppState, DeviceRecord, MaintenanceWindow, PatchJob, PatchRecord, PurchaseRecord } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DEVICES_PATH = path.join(DATA_DIR, "devices.json");
const PATCHES_PATH = path.join(DATA_DIR, "patches.json");
const JOBS_PATH = path.join(DATA_DIR, "jobs.json");
const WINDOWS_PATH = path.join(DATA_DIR, "maintenance-windows.json");
const PURCHASES_PATH = path.join(DATA_DIR, "purchases.json");

const defaultWindows: MaintenanceWindow[] = [
  {
    id: "weekday-night",
    name: "Weekday Night Window",
    cron: "0 2 * * 1-5",
    timezone: "Etc/UTC",
    maxConcurrent: 25
  },
  {
    id: "sunday-maintenance",
    name: "Sunday Maintenance",
    cron: "0 3 * * 0",
    timezone: "Etc/UTC",
    maxConcurrent: 60
  }
];

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    await writeJson(filePath, fallback);
    return fallback;
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getDevices(): Promise<DeviceRecord[]> {
  await ensureDataDir();
  return readJson<DeviceRecord[]>(DEVICES_PATH, []);
}

export async function setDevices(devices: DeviceRecord[]): Promise<void> {
  await writeJson(DEVICES_PATH, devices);
}

export async function getPatches(): Promise<PatchRecord[]> {
  await ensureDataDir();
  return readJson<PatchRecord[]>(PATCHES_PATH, []);
}

export async function setPatches(patches: PatchRecord[]): Promise<void> {
  await writeJson(PATCHES_PATH, patches);
}

export async function getJobs(): Promise<PatchJob[]> {
  await ensureDataDir();
  return readJson<PatchJob[]>(JOBS_PATH, []);
}

export async function setJobs(jobs: PatchJob[]): Promise<void> {
  await writeJson(JOBS_PATH, jobs);
}

export async function getMaintenanceWindows(): Promise<MaintenanceWindow[]> {
  await ensureDataDir();
  return readJson<MaintenanceWindow[]>(WINDOWS_PATH, defaultWindows);
}

export async function setMaintenanceWindows(windows: MaintenanceWindow[]): Promise<void> {
  await writeJson(WINDOWS_PATH, windows);
}

export async function getPurchases(): Promise<PurchaseRecord[]> {
  await ensureDataDir();
  return readJson<PurchaseRecord[]>(PURCHASES_PATH, []);
}

export async function setPurchases(purchases: PurchaseRecord[]): Promise<void> {
  await writeJson(PURCHASES_PATH, purchases);
}

export async function getAppState(): Promise<AppState> {
  const [devices, patches, jobs, maintenanceWindows, purchases] = await Promise.all([
    getDevices(),
    getPatches(),
    getJobs(),
    getMaintenanceWindows(),
    getPurchases()
  ]);

  return { devices, patches, jobs, maintenanceWindows, purchases };
}
