import { NextRequest, NextResponse } from "next/server";
import { getTask, listTasks } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (taskId) {
    const task = await getTask(taskId);
    if (!task) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }
    return NextResponse.json({ task });
  }

  const tasks = await listTasks();
  return NextResponse.json({ tasks });
}
