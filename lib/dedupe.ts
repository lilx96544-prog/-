import { maxSimilarity } from "@/lib/similarity";

type ComparableItem = {
  title: string;
  hook: string;
  script: string;
};

export type SimilarityReport = {
  title: number;
  hook: number;
  script: number;
  passed: boolean;
};

const threshold = {
  title: 0.78,
  hook: 0.8,
  script: 0.72
};

export function evaluateSimilarity(current: ComparableItem, existing: ComparableItem[]): SimilarityReport {
  const report = {
    title: maxSimilarity(current.title, existing.map((item) => item.title)),
    hook: maxSimilarity(current.hook, existing.map((item) => item.hook)),
    script: maxSimilarity(current.script, existing.map((item) => item.script)),
    passed: true
  };

  report.passed = report.title < threshold.title && report.hook < threshold.hook && report.script < threshold.script;
  return report;
}

export function buildRewriteHint(report: SimilarityReport): string {
  const hints: string[] = ["与已有内容相似度过高，请强制改写。"];
  if (report.title >= threshold.title) {
    hints.push("标题换一个完全不同的切入角度，句式不要重复。");
  }
  if (report.hook >= threshold.hook) {
    hints.push("开头钩子请改成不同的冲突/问题/风险起手句。");
  }
  if (report.script >= threshold.script) {
    hints.push("正文结构重排，换案例、换论证路径、换结尾行动句。");
  }
  hints.push("禁止复用已有表达习惯和高频词组。",
    "保持口播感和短视频节奏感。"
  );
  return hints.join(" ");
}
