import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildRewriteHint, evaluateSimilarity } from "@/lib/dedupe";
import { generateScriptCandidate } from "@/lib/openai";
import { retry } from "@/lib/retry";
import { getTask, upsertTask } from "@/lib/storage";

const schema = z.object({
  taskId: z.string().min(1),
  itemId: z.string().min(1)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, itemId } = schema.parse(body);

    const task = await getTask(taskId);
    if (!task) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    const target = task.items.find((item) => item.id === itemId);
    if (!target) {
      return NextResponse.json({ error: "内容不存在" }, { status: 404 });
    }

    const peers = task.items.filter((item) => item.id !== itemId);
    let rewriteHint = "";
    let candidate: Awaited<ReturnType<typeof generateScriptCandidate>> | null = null;

    for (let round = 0; round < 3; round += 1) {
      const generated = await retry(() =>
        generateScriptCandidate({
          input: task.params,
          index: 0,
          existing: peers,
          rewriteHint
        })
      );

      const report = evaluateSimilarity(generated, peers);
      if (report.passed || peers.length === 0) {
        candidate = generated;
        break;
      }
      rewriteHint = buildRewriteHint(report);
    }

    if (!candidate) {
      return NextResponse.json({ error: "重生成失败：相似度过高" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updatedItem = {
      ...target,
      id: `item_${randomUUID()}`,
      title: candidate.title,
      hook: candidate.hook,
      script: candidate.script,
      cover_text: candidate.cover_text,
      version: target.version + 1,
      createdAt: now
    };

    const items = task.items.map((item) => (item.id === itemId ? updatedItem : item));
    const updatedTask = {
      ...task,
      items,
      updatedAt: now
    };

    await upsertTask(updatedTask);

    return NextResponse.json({ taskId, item: updatedItem });
  } catch (error) {
    const message = error instanceof Error ? error.message : "重生成失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
