import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");

export async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  const filePath = path.join(dataDir, fileName);
  try {
    const data = await readFile(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch {
    await mkdir(dataDir, { recursive: true });
    await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

export async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, fileName);
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}
