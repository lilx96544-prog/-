import { Duration, ContentStyle, GenerateInput, Platform } from "@/lib/types";

type ExistingSample = {
  title: string;
  hook: string;
};

const platformGuide: Record<Platform, string> = {
  douyin: "抖音平台：节奏更快，冲突更直接，句子更短，首句必须抓人。",
  wechat_channel: "视频号平台：观点更完整，可信感更强，表达稳但不拖沓。"
};

const styleGuide: Record<ContentStyle, string> = {
  conflict: "冲突型：优先对立、反常识、利益冲突、风险感、结果导向。",
  practical: "干货型：优先具体、可执行、简洁、有判断、有步骤。",
  founder: "创始人口播型：真实经验、第一人称、观点鲜明、少套路。"
};

const durationGuide: Record<Duration, string> = {
  15: "15秒：80-120字，钩子后直给结论。",
  30: "30秒：150-220字，钩子+一个关键论点+行动句。",
  60: "60秒：280-420字，钩子+2-3层观点，保持口语化。"
};

const hookRules = [
  "开头前3秒必须是强钩子，优先使用：反直觉结论 / 利益损失警告 / 尖锐提问 / 结果对比。",
  "第一句尽量短，避免背景铺垫，不要出现‘今天分享’、‘接下来我讲’这类模板话。",
  "hook 要和标题互补，不要重复同一句话。"
];

export function buildSystemPrompt(): string {
  return [
    "你是短视频口播总编，专门为抖音/视频号生成可直接拍摄的内容。",
    "必须严格执行：",
    "1) 只输出 JSON 对象，不要 markdown，不要解释。",
    "2) 字段必须且仅能包含 title, hook, script, cover_text。",
    "3) 禁止官腔、培训稿味、新闻稿味、空话套话。",
    "4) 口语化，像真人在镜头前说话。",
    "5) 每条内容都要有明显差异，避免模板感。",
    "6) title 12-24字以内，hook 简短有冲击。",
    ...hookRules,
    '输出格式: {"title":"","hook":"","script":"","cover_text":""}'
  ].join("\n");
}

export function buildUserPrompt(args: {
  input: GenerateInput;
  index: number;
  existingSamples: ExistingSample[];
  rewriteHint?: string;
}): string {
  const { input, index, existingSamples, rewriteHint } = args;

  const existingHint = existingSamples.length
    ? `以下是已有内容样本（避免复用表达）:\n${existingSamples
        .slice(0, 10)
        .map((item, i) => `${i + 1}. title=${item.title}; hook=${item.hook}`)
        .join("\n")}`
    : "当前为首批内容，确保表达风格可拓展。";

  return [
    `任务：生成第 ${index + 1} 条短视频口播。`,
    `主题：${input.topic}`,
    `细分赛道：${input.niche}`,
    `目标人群：${input.audience}`,
    `平台：${input.platform}`,
    platformGuide[input.platform],
    `风格：${input.style}`,
    styleGuide[input.style],
    `时长：${input.duration}秒`,
    durationGuide[input.duration],
    input.extra ? `补充要求：${input.extra}` : "补充要求：无",
    existingHint,
    rewriteHint ? `强制改写要求：${rewriteHint}` : "",
    "请输出可直接拍摄的口播稿，避免书面化。",
    "仅输出 JSON。"
  ]
    .filter(Boolean)
    .join("\n");
}
