import { buildRewriteHint, evaluateSimilarity } from "@/lib/dedupe";
import { generateScriptCandidate, GeneratedItem } from "@/lib/openai";
import { retry } from "@/lib/retry";
import { GenerateInput } from "@/lib/types";

type BatchOptions = {
  concurrency?: number;
  maxRewriteRounds?: number;
  onProgress?: (done: number, failed: number) => Promise<void> | void;
};

async function generateUniqueItem(
  input: GenerateInput,
  index: number,
  existing: GeneratedItem[],
  maxRewriteRounds: number
): Promise<GeneratedItem> {
  let rewriteHint = "";

  for (let round = 0; round <= maxRewriteRounds; round += 1) {
    const item = await retry(() =>
      generateScriptCandidate({
        input,
        index,
        existing,
        rewriteHint
      })
    );

    const report = evaluateSimilarity(item, existing);
    if (report.passed || existing.length === 0) {
      return item;
    }

    rewriteHint = buildRewriteHint(report);
  }

  throw new Error(`第 ${index + 1} 条去重失败，重写次数已达上限`);
}

export async function runBatchGeneration(
  input: GenerateInput,
  options: BatchOptions = {}
): Promise<{ items: GeneratedItem[]; failed: number }> {
  const target = input.count;
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 3, 8));
  const maxRewriteRounds = Math.max(1, options.maxRewriteRounds ?? 2);

  const items: GeneratedItem[] = [];
  let done = 0;
  let failed = 0;
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= target) return;

      try {
        const item = await generateUniqueItem(input, index, items, maxRewriteRounds);
        items.push(item);
      } catch {
        failed += 1;
      } finally {
        done += 1;
        if (options.onProgress) {
          await options.onProgress(done, failed);
        }
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return { items, failed };
}
