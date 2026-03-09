# AI Content Factory (MVP+)

一个面向内容团队的 AI 内容工厂，可批量生成抖音/视频号短视频口播内容。

## 当前能力

- 批量生成：主题/赛道/人群/平台/风格/时长/数量
- 并发控制：批量任务支持可配置并发
- 失败重试：每条内容失败自动重试
- 结构化输出：固定 `title / hook / script / cover_text`
- 内容去重：标题、hook、script 相似度检测 + 自动改写
- 单条重生成：保留任务上下文，支持再生成
- 历史记录：本地 `data/history.json` 持久化
- CSV 导出：任务结果一键导出
- 复制功能：复制标题、复制整条内容

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- OpenAI Node SDK (Responses API)
- Zod
- 本地 JSON 存储（MVP 阶段）

## 快速开始

```bash
npm install
cp .env.example .env.local
# 填入 OPENAI_API_KEY
npm run dev
```

## 环境变量

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
GENERATE_CONCURRENCY=3
MAX_REWRITE_ROUNDS=2
```

## 关键接口

- `POST /api/generate`：并发批量生成 + 去重改写 + 历史写入
- `POST /api/regenerate`：单条重生成 + 相似度校验
- `GET /api/history`：历史任务列表
- `GET /api/history?taskId=xxx`：任务详情
- `GET /api/export/:taskId`：CSV 导出
