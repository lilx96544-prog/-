import { NextResponse } from "next/server";
import { buildCsv } from "@/lib/csv";
import { getTask } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: { taskId: string } }) {
  const task = await getTask(params.taskId);

  if (!task) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }

  const csv = buildCsv(task.items);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${task.taskId}.csv"`
    }
  });
}
