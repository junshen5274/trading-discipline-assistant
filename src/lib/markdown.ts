import type { DailyRecord, TradeEntry } from "@/types/trade";
import { displayDailyStatus, displayJudgeGrade, displayTradeResult } from "@/lib/labels";

export function buildDailyMarkdown(record: DailyRecord) {
  const status = displayDailyStatus(record.failedAttempts >= 3 ? "Trading Locked" : "Trading Allowed");
  const totalTrades = record.trades.length;

  return [
    `# 交易复盘 - ${record.date}`,
    "",
    "## 今日概况",
    `- 状态：${status}`,
    `- 失败次数：${record.failedAttempts}/3`,
    `- 已实现盈亏：${formatPnl(record.realizedPnl)}`,
    `- 总交易数：${totalTrades}`,
    "",
    "## 交易记录",
    "| 时间 | 品种 | 形态 | 判断 | 结果 | P/L | 入场价 | 备注 |",
    "|---|---|---|---|---|---:|---|---|",
    record.trades.length ? record.trades.map(formatTradeRow).join("\n") : "| - | - | - | - | - | - | - | - |",
    "",
    "## 纪律复盘",
    "- 是否达到停单条件：",
    "- 是否有违规单：",
    "- 今日主要问题：",
    "- 明日重点：",
    "",
    "## 形态统计",
    ...formatSetupStats(record),
    "",
    "## 备注",
    ""
  ].join("\n");
}

function formatTradeRow(trade: TradeEntry) {
  return [
    trade.entryTime,
    trade.instrument,
    trade.setup,
    displayJudgeGrade(trade.grade),
    trade.result ? displayTradeResult(trade.result) : "当前交易",
    formatPnl(trade.actualPnl),
    trade.entryPrice || "未记录",
    sanitizeTableCell(trade.note || "")
  ].join(" | ").replace(/^/, "| ").replace(/$/, " |");
}

function formatPnl(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

function formatSetupStats(record: DailyRecord) {
  return ["破底翻", "2-2", "互换", "破小"].map((setup) => {
    const count = record.trades.filter((trade) => trade.setup === setup).length;
    return `- ${setup}：${count}`;
  });
}

function sanitizeTableCell(value: string) {
  return value.replace(/\|/g, "/").replace(/\n/g, " ");
}
