import Link from "next/link";
import { HistoryTable } from "@/components/history-table";
import { listTasks } from "@/lib/storage";

export default async function HistoryPage() {
  const tasks = await listTasks();

  return (
    <main>
      <section className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>历史任务</h1>
          <p className="muted" style={{ marginBottom: 0 }}>查看所有批量生成记录与状态。</p>
        </div>
        <Link href="/">返回生成页</Link>
      </section>

      <section className="panel">
        <HistoryTable tasks={tasks} />
      </section>
    </main>
  );
}
