import type { CSSProperties } from "react";
import Link from "next/link";
import { TaskRecord } from "@/lib/types";

type HistoryTableProps = {
  tasks: TaskRecord[];
};

export function HistoryTable({ tasks }: HistoryTableProps) {
  if (!tasks.length) {
    return <p className="muted">暂无历史任务。</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={cell}>任务ID</th>
            <th style={cell}>主题</th>
            <th style={cell}>平台</th>
            <th style={cell}>风格</th>
            <th style={cell}>数量</th>
            <th style={cell}>状态</th>
            <th style={cell}>创建时间</th>
            <th style={cell}>操作</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.taskId}>
              <td style={cell}>{task.taskId.slice(0, 12)}...</td>
              <td style={cell}>{task.params.topic || "-"}</td>
              <td style={cell}>{task.params.platform}</td>
              <td style={cell}>{task.params.style}</td>
              <td style={cell}>{task.progress.total}</td>
              <td style={cell}>{task.status}</td>
              <td style={cell}>{new Date(task.createdAt).toLocaleString()}</td>
              <td style={cell}>
                <Link href={`/history/${task.taskId}`}>查看</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cell: CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  padding: "10px 8px",
  textAlign: "left",
  verticalAlign: "top"
};
