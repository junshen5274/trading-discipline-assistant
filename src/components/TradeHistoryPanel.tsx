import { Panel } from "@/components/Panel";
import { displayJudgeGrade, displayTradeResult } from "@/lib/labels";
import type { TradeEntry } from "@/types/trade";

type TradeHistoryPanelProps = {
  trades: TradeEntry[];
};

export function TradeHistoryPanel({ trades }: TradeHistoryPanelProps) {
  return (
    <Panel title="今日交易">
      {trades.length ? (
        <div className="max-h-96 overflow-auto rounded-md border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">时间</th>
                <th className="px-3 py-2 font-semibold">品种</th>
                <th className="px-3 py-2 font-semibold">形态</th>
                <th className="px-3 py-2 font-semibold">判断</th>
                <th className="px-3 py-2 font-semibold">结果</th>
                <th className="px-3 py-2 font-semibold">P/L</th>
                <th className="px-3 py-2 font-semibold">备注</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{trade.entryTime}</td>
                  <td className="px-3 py-2 font-semibold">{trade.instrument}</td>
                  <td className="px-3 py-2">{trade.setup}</td>
                  <td className="px-3 py-2">
                    <span className={gradeClass(trade.grade)}>{displayJudgeGrade(trade.grade)}</span>
                  </td>
                  <td className="px-3 py-2">{trade.result ? displayTradeResult(trade.result) : "当前交易"}</td>
                  <td className="px-3 py-2">{formatPnl(trade.actualPnl)}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{trade.note || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-slate-300 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">
          当前日期还没有交易记录。
        </div>
      )}
    </Panel>
  );
}

function gradeClass(grade: TradeEntry["grade"]) {
  const color =
    grade === "A"
      ? "bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200"
      : grade === "B"
        ? "bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200"
        : grade === "C"
          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
          : "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200";

  return `inline-flex min-w-14 justify-center rounded-md px-2 py-0.5 text-xs font-semibold ${color}`;
}

function formatPnl(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}
