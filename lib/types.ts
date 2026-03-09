export const platforms = ["douyin", "wechat_channel"] as const;
export const styles = ["conflict", "practical", "founder"] as const;
export const durations = [15, 30, 60] as const;
export const counts = [10, 20, 50, 100] as const;

export type Platform = (typeof platforms)[number];
export type ContentStyle = (typeof styles)[number];
export type Duration = (typeof durations)[number];
export type OutputCount = (typeof counts)[number];

export type GenerateInput = {
  topic: string;
  niche: string;
  audience: string;
  platform: Platform;
  style: ContentStyle;
  duration: Duration;
  count: OutputCount;
  extra?: string;
};

export type ScriptItem = {
  id: string;
  title: string;
  hook: string;
  script: string;
  cover_text: string;
  createdAt: string;
  version: number;
};

export type GenerateResponse = {
  taskId: string;
  status: "completed";
  items: ScriptItem[];
};

export type TaskRecord = {
  taskId: string;
  params: GenerateInput;
  status: "running" | "completed" | "failed";
  progress: {
    total: number;
    done: number;
    failed: number;
  };
  items: ScriptItem[];
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export type HistoryStore = {
  tasks: TaskRecord[];
};
