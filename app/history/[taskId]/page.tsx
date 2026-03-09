import Link from "next/link";
import { notFound } from "next/navigation";
import { ExportButton } from "@/components/export-button";
import { ResultList } from "@/components/result-list";
import { getTask } from "@/lib/storage";

export default async function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const task = await getTask(params.taskId);
  if (!task) return notFound();

  return (
    <main>
      <section className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>任务详情</h1>
          <p className="muted" style={{ marginBottom: 0 }}>主题：{task.params.topic} ｜ 平台：{task.params.platform} ｜ 风格：{task.params.style}</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <ExportButton taskId={task.taskId} />
          <Link href="/history">返回历史</Link>
        </div>
      </section>

      <ResultList taskId={task.taskId} initialItems={task.items} />
    </main>
  );
}
