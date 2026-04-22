import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDataDirectory() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readDataFile<T>(fileName: string, fallback: T): Promise<T> {
  await ensureDataDirectory();
  const filePath = path.join(DATA_DIR, fileName);

  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await writeDataFile(fileName, fallback);
    return fallback;
  }
}

export async function writeDataFile<T>(fileName: string, data: T): Promise<void> {
  await ensureDataDirectory();
  const filePath = path.join(DATA_DIR, fileName);
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function buildId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${random}`;
}
