"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { GenerateInput, GenerateResponse } from "@/lib/types";
import { ResultList } from "@/components/result-list";
import { ExportButton } from "@/components/export-button";

const defaultForm: GenerateInput = {
  topic: "",
  niche: "",
  audience: "老板/创业者",
  platform: "douyin",
  style: "conflict",
  duration: 30,
  count: 10,
  extra: ""
};

export default function HomePage() {
  const [form, setForm] = useState<GenerateInput>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const canSubmit = useMemo(() => Boolean(form.topic.trim() && form.niche.trim() && form.audience.trim()), [form]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, extra: form.extra?.trim() || undefined })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setResult(data as GenerateResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>AI内容工厂（MVP）</h1>
          <p className="muted" style={{ marginBottom: 0 }}>批量生成短视频脚本，支持历史记录与 CSV 导出。</p>
        </div>
        <Link href="/history">查看历史任务</Link>
      </section>

      <section className="panel">
        <form onSubmit={onSubmit} className="grid">
          <div>
            <label>主题</label>
            <input value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))} placeholder="例如：老板做IP" />
          </div>
          <div>
            <label>细分赛道</label>
            <input value={form.niche} onChange={(e) => setForm((p) => ({ ...p, niche: e.target.value }))} placeholder="例如：企业管理咨询" />
          </div>
          <div>
            <label>目标人群</label>
            <input value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))} />
          </div>
          <div>
            <label>发布平台</label>
            <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value as GenerateInput["platform"] }))}>
              <option value="douyin">抖音</option>
              <option value="wechat_channel">视频号</option>
            </select>
          </div>
          <div>
            <label>内容风格</label>
            <select value={form.style} onChange={(e) => setForm((p) => ({ ...p, style: e.target.value as GenerateInput["style"] }))}>
              <option value="conflict">冲突型</option>
              <option value="practical">干货型</option>
              <option value="founder">创始人口播型</option>
            </select>
          </div>
          <div>
            <label>视频时长</label>
            <select value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) as GenerateInput["duration"] }))}>
              <option value={15}>15秒</option>
              <option value={30}>30秒</option>
              <option value={60}>60秒</option>
            </select>
          </div>
          <div>
            <label>输出数量</label>
            <select value={form.count} onChange={(e) => setForm((p) => ({ ...p, count: Number(e.target.value) as GenerateInput["count"] }))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="full">
            <label>补充要求（可选）</label>
            <textarea rows={3} value={form.extra} onChange={(e) => setForm((p) => ({ ...p, extra: e.target.value }))} />
          </div>
          <div className="full">
            <button disabled={loading || !canSubmit} type="submit">
              {loading ? "生成中..." : "开始批量生成"}
            </button>
          </div>
        </form>
      </section>

      {error ? (
        <section className="panel">
          <p style={{ color: "#b91c1c", margin: 0 }}>错误：{error}</p>
        </section>
      ) : null}

      {result ? (
        <>
          <section className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className="muted" style={{ margin: 0 }}>任务已保存到历史记录：{result.taskId}</p>
            <ExportButton taskId={result.taskId} />
          </section>
          <ResultList taskId={result.taskId} initialItems={result.items} />
        </>
      ) : null}
    </main>
  );
}
