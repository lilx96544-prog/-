import OpenAI from "openai";
import { z } from "zod";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt-builder";
import { GenerateInput } from "@/lib/types";

const generatedItemSchema = z.object({
  title: z.string().min(4).max(40),
  hook: z.string().min(6).max(60),
  script: z.string().min(20),
  cover_text: z.string().min(4).max(30)
});

export type GeneratedItem = z.infer<typeof generatedItemSchema>;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function parseJsonObject(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const block = text.match(/```json\s*([\s\S]*?)```/i);
    if (block?.[1]) return JSON.parse(block[1]);
    throw new Error("模型返回内容不是合法 JSON");
  }
}

export async function generateScriptCandidate(args: {
  input: GenerateInput;
  index: number;
  existing: Array<{ title: string; hook: string }>;
  rewriteHint?: string;
}): Promise<GeneratedItem> {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    temperature: 0.95,
    input: [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: buildUserPrompt({
          input: args.input,
          index: args.index,
          existingSamples: args.existing,
          rewriteHint: args.rewriteHint
        })
      }
    ]
  });

  const rawText = response.output_text?.trim();
  if (!rawText) {
    throw new Error("模型返回为空");
  }

  const parsed = parseJsonObject(rawText);
  return generatedItemSchema.parse(parsed);
}
