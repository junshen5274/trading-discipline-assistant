"use client";

import { Ban, CircleDollarSign, MinusCircle, Trophy, type LucideIcon } from "lucide-react";
import { Panel } from "@/components/Panel";
import { displayJudgeGrade } from "@/lib/labels";
import type { TradeEntry, TradeResult } from "@/types/trade";

type ActiveTradePanelProps = {
  trade?: TradeEntry;
  actualPnl: string;
  closeNote: string;
  onActualPnlChange: (value: string) => void;
  onCloseNoteChange: (value: string) => void;
  onClose: (result: TradeResult) => void;
};

const resultButtons: Array<{
  result: TradeResult;
  label: string;
  icon: LucideIcon;
  className: string;
}> = [
  { result: "Win", label: "盈利", icon: Trophy, className: "border-teal-600 text-teal-800 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-teal-950/40" },
  { result: "Loss", label: "止损", icon: CircleDollarSign, className: "border-rose-600 text-rose-800 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40" },
  { result: "Breakeven", label: "保本", icon: MinusCircle, className: "border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60" },
  { result: "Rule Violation", label: "违规单", icon: Ban, className: "border-amber-600 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40" }
];

export function ActiveTradePanel({
  trade,
  actualPnl,
  closeNote,
  onActualPnlChange,
  onCloseNoteChange,
  onClose
}: ActiveTradePanelProps) {
  return (
    <Panel title="当前交易">
      {trade ? (
        <div className="space-y-3">
          <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <strong>{trade.instrument}</strong>
              <span>{trade.setup}</span>
              <span className="rounded-md bg-slate-900 dark:bg-slate-100 px-2 py-0.5 text-xs font-semibold text-white dark:text-slate-900">{displayJudgeGrade(trade.grade)}</span>
              <span className="text-slate-500 dark:text-slate-400">{trade.entryTime}</span>
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              入场: {trade.entryPrice || "未记录"}
              {trade.note ? ` · ${trade.note}` : ""}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">实际盈亏，可选</span>
              <input
                value={actualPnl}
                onChange={(event) => onActualPnlChange(event.target.value)}
                placeholder="e.g. -58.50"
                inputMode="decimal"
                className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">平仓备注</span>
              <input
                value={closeNote}
                onChange={(event) => onCloseNoteChange(event.target.value)}
                placeholder="结果备注"
                className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {resultButtons.map(({ result, label, icon: Icon, className }) => (
              <button
                key={result}
                type="button"
                onClick={() => onClose(result)}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border bg-white dark:bg-slate-900 px-3 text-sm font-semibold ${className}`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-slate-300 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">
          当前没有交易。判断有效后点击已入场开始跟踪。
        </div>
      )}
    </Panel>
  );
}
