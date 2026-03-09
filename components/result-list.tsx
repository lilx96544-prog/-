"use client";

import { useState } from "react";
import { ScriptItem } from "@/lib/types";
import { ResultCard } from "@/components/result-card";

type ResultListProps = {
  taskId: string;
  initialItems: ScriptItem[];
};

export function ResultList({ taskId, initialItems }: ResultListProps) {
  const [items, setItems] = useState(initialItems);

  function handleRegenerated(itemId: string, next: ScriptItem) {
    setItems((prev) => prev.map((item) => (item.id === itemId ? next : item)));
  }

  return (
    <section className="panel">
      <h2>生成结果（{items.length} 条）</h2>
      <p className="muted">Task ID: {taskId}</p>
      {items.map((item, index) => (
        <ResultCard key={item.id} item={item} index={index} taskId={taskId} onRegenerated={handleRegenerated} />
      ))}
    </section>
  );
}
