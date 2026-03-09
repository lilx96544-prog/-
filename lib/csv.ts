import { ScriptItem } from "@/lib/types";

function escapeCell(value: string): string {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}

export function buildCsv(items: ScriptItem[]): string {
  const header = ["title", "hook", "script", "cover_text"];
  const rows = items.map((item) => [item.title, item.hook, item.script, item.cover_text].map(escapeCell).join(","));
  return [header.join(","), ...rows].join("\n");
}
