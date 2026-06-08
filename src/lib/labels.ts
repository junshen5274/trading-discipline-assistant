import type { DailyStatus, JudgeGrade, TradeGrade, TradeResult } from "@/types/trade";

export function displayJudgeGrade(grade: JudgeGrade | TradeGrade) {
  return {
    Pending: "待判断",
    A: "A",
    B: "B",
    C: "C",
    "No Trade": "不做"
  }[grade];
}

export function displayTradeResult(result: TradeResult) {
  return {
    Win: "盈利",
    Loss: "止损",
    Breakeven: "保本",
    "Rule Violation": "违规单"
  }[result];
}

export function displayDailyStatus(status: DailyStatus) {
  return status === "Trading Locked" ? "今日锁单" : "允许交易";
}
