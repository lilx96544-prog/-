import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runBatchGeneration } from "@/lib/batch-runner";
import { upsertTask } from "@/lib/storage";
import { counts, durations, platforms, styles, TaskRecord } from "@/lib/types";

const requestSchema = z.object({
  topic: z.string().min(1, "主题不能为空"),
  niche: z.string().min(1, "细分赛道不能为空"),
  audience: z.string().min(1, "目标人群不能为空"),
  platform: z.enum(platforms),
  style: z.enum(styles),
  duration: z.enum(durations),
  count: z.enum(counts),
  extra: z.string().optional()
});

export async function POST(req: NextRequest) {
  const now = new Date().toISOString();
  const taskId = `task_${randomUUID()}`;

  try {
    const payload = await req.json();
    const input = requestSchema.parse(payload);

    const runningTask: TaskRecord = {
      taskId,
      params: input,
      status: "running",
      progress: {
        total: input.count,
        done: 0,
        failed: 0
      },
      items: [],
      createdAt: now,
      updatedAt: now
    };

    await upsertTask(runningTask);

    const { items: generatedItems, failed } = await runBatchGeneration(input, {
      concurrency: Number(process.env.GENERATE_CONCURRENCY || 3),
      maxRewriteRounds: Number(process.env.MAX_REWRITE_ROUNDS || 2),
      onProgress: async (done, failedCount) => {
        await upsertTask({
          ...runningTask,
          progress: {
            total: input.count,
            done,
            failed: failedCount
          },
          updatedAt: new Date().toISOString()
        });
      }
    });

    const completedAt = new Date().toISOString();
    const items = generatedItems.map((item) => ({
      id: `item_${randomUUID()}`,
      title: item.title,
      hook: item.hook,
      script: item.script,
      cover_text: item.cover_text,
      createdAt: completedAt,
      version: 1
    }));

    const completedTask: TaskRecord = {
      ...runningTask,
      status: failed > 0 ? "failed" : "completed",
      progress: {
        total: input.count,
        done: input.count,
        failed
      },
      items,
      error: failed > 0 ? `有 ${failed} 条内容生成失败` : undefined,
      updatedAt: completedAt
    };

    await upsertTask(completedTask);

    return NextResponse.json({
      taskId,
      status: "completed",
      items,
      progress: completedTask.progress
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    const failedAt = new Date().toISOString();

    const fallbackTask: TaskRecord = {
      taskId,
      params: {
        topic: "",
        niche: "",
        audience: "",
        platform: "douyin",
        style: "conflict",
        duration: 30,
        count: 10
      },
      status: "failed",
      progress: {
        total: 0,
        done: 0,
        failed: 1
      },
      items: [],
      error: message,
      createdAt: now,
      updatedAt: failedAt
    };

    await upsertTask(fallbackTask);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
