import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { HistoryStore, TaskRecord } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const historyPath = path.join(dataDir, "history.json");

let writeQueue: Promise<void> = Promise.resolve();

async function ensureStore(): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(historyPath, "utf-8");
  } catch {
    const initial: HistoryStore = { tasks: [] };
    await writeFile(historyPath, JSON.stringify(initial, null, 2), "utf-8");
  }
}

export async function readHistoryStore(): Promise<HistoryStore> {
  await ensureStore();
  const raw = await readFile(historyPath, "utf-8");
  const parsed = JSON.parse(raw) as HistoryStore;
  return parsed;
}

export async function writeHistoryStore(store: HistoryStore): Promise<void> {
  await ensureStore();
  writeQueue = writeQueue.then(async () => {
    await writeFile(historyPath, JSON.stringify(store, null, 2), "utf-8");
  });
  await writeQueue;
}

export async function upsertTask(task: TaskRecord): Promise<void> {
  const store = await readHistoryStore();
  const idx = store.tasks.findIndex((t) => t.taskId === task.taskId);
  if (idx === -1) {
    store.tasks.unshift(task);
  } else {
    store.tasks[idx] = task;
  }
  await writeHistoryStore(store);
}

export async function getTask(taskId: string): Promise<TaskRecord | null> {
  const store = await readHistoryStore();
  return store.tasks.find((task) => task.taskId === taskId) ?? null;
}

export async function listTasks(): Promise<TaskRecord[]> {
  const store = await readHistoryStore();
  return store.tasks;
}
