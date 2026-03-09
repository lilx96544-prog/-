"use client";

import { useState } from "react";
import { ScriptItem } from "@/lib/types";
import { CopyButton } from "@/components/copy-button";

type ResultCardProps = {
  taskId: string;
  item: ScriptItem;
  index: number;
  onRegenerated: (itemId: string, next: ScriptItem) => void;
};

export function ResultCard({ taskId, item, index, onRegenerated }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, itemId: item.id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "重生成失败");
      }

      onRegenerated(item.id, data.item as ScriptItem);
    } catch (error) {
      alert(error instanceof Error ? error.message : "重生成失败");
    } finally {
      setLoading(false);
    }
  }

  const allText = `标题：${item.title}\n开头钩子：${item.hook}\n口播文案：${item.script}\n封面文案：${item.cover_text}`;

  return (
    <article className="result-item">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <strong>
          {index + 1}. {item.title}
        </strong>
        <span className="muted">v{item.version}</span>
      </div>

      <p style={{ margin: "8px 0" }}>
        <b>Hook：</b>
        {item.hook}
      </p>

      {expanded ? (
        <>
          <pre>Script: {item.script}</pre>
          <pre>Cover: {item.cover_text}</pre>
        </>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <CopyButton text={item.title} label="复制标题" />
        <CopyButton text={allText} label="复制整条" />
        <button type="button" onClick={() => setExpanded((p) => !p)} style={{ width: "auto", padding: "6px 10px", fontSize: 12 }}>
          {expanded ? "收起详情" : "查看详情"}
        </button>
        <button type="button" onClick={handleRegenerate} disabled={loading} style={{ width: "auto", padding: "6px 10px", fontSize: 12 }}>
          {loading ? "重生成中..." : "重新生成"}
        </button>
      </div>
    </article>
  );
}
