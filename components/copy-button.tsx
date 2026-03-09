"use client";

import { useState } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
};

export function CopyButton({ text, label = "复制" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button type="button" onClick={handleCopy} style={{ width: "auto", padding: "6px 10px", fontSize: 12 }}>
      {copied ? "已复制" : label}
    </button>
  );
}
