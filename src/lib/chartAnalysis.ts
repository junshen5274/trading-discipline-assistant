import {
  analysisConfidences,
  chartTimeframes,
  overallDecisions,
  setupGrades,
  type AnalysisHistoryEntry,
  type ChartAnalysisResult
} from "@/types/chartAnalysis";
import { instruments, setups } from "@/types/trade";

const HISTORY_KEY = "trade-assistant:analysis-history";
const MAX_HISTORY_ENTRIES = 30;

export function isChartAnalysisResult(value: unknown): value is ChartAnalysisResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<ChartAnalysisResult>;

  return (
    overallDecisions.includes(result.overallDecision as never) &&
    analysisConfidences.includes(result.confidence as never) &&
    typeof result.summary === "string" &&
    Array.isArray(result.detectedSetups) &&
    result.detectedSetups.every(
      (setup) =>
        setup &&
        setups.includes(setup.name as never) &&
        setupGrades.includes(setup.grade as never) &&
        isStringArray(setup.reasons)
    ) &&
    isStringArray(result.keyObservations) &&
    isStringArray(result.riskWarnings) &&
    isStringArray(result.waitFor) &&
    isStringArray(result.missingContext)
  );
}

export function loadAnalysisHistory(): AnalysisHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isHistoryEntry).slice(0, MAX_HISTORY_ENTRIES);
  } catch {
    return [];
  }
}

export function saveAnalysisHistory(entries: AnalysisHistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY_ENTRIES)));
}

export function resultToMarkdown(
  result: ChartAnalysisResult,
  context?: { instrument?: string; timeframe?: string; note?: string }
) {
  const lines = [
    "# 图表分析",
    "",
    context?.instrument || context?.timeframe
      ? `- 品种 / 周期：${context.instrument ?? "—"} / ${context.timeframe ?? "—"}`
      : "",
    context?.note ? `- 备注：${context.note}` : "",
    `- 结论：**${result.overallDecision}**`,
    `- 置信度：${result.confidence}`,
    "",
    result.summary,
    "",
    "## 形态评分",
    ...result.detectedSetups.flatMap((setup) => [
      `- **${setup.name}：${setup.grade}**`,
      ...setup.reasons.map((reason) => `  - ${reason}`)
    ]),
    ...markdownSection("关键观察", result.keyObservations),
    ...markdownSection("风险提醒", result.riskWarnings),
    ...markdownSection("等待确认", result.waitFor),
    ...markdownSection("缺失信息", result.missingContext),
    "",
    "> 仅按交易框架辅助复盘与判断，不构成金融建议，也不会执行交易。"
  ];

  return lines.filter((line, index) => line !== "" || lines[index - 1] !== "").join("\n").trim();
}

function markdownSection(title: string, items: string[]) {
  return items.length ? ["", `## ${title}`, ...items.map((item) => `- ${item}`)] : [];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isHistoryEntry(value: unknown): value is AnalysisHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<AnalysisHistoryEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.createdAt === "string" &&
    instruments.includes(entry.instrument as never) &&
    chartTimeframes.includes(entry.timeframe as never) &&
    isChartAnalysisResult(entry.result)
  );
}
