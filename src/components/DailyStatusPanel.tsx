import { CalendarDays, Lock, Unlock } from "lucide-react";
import { Panel } from "@/components/Panel";
import type { DailyRecord, DailyStatus } from "@/types/trade";

type DailyStatusPanelProps = {
  date: string;
  record: DailyRecord;
  status: DailyStatus;
  onDateChange: (date: string) => void;
  onResetDay: () => void;
};

export function DailyStatusPanel({ date, record, status, onDateChange, onResetDay }: DailyStatusPanelProps) {
  const isLocked = status === "Trading Locked";

  return (
    <Panel
      title="Daily Status"
      action={
        <button
          type="button"
          onClick={onResetDay}
          className="h-9 rounded-md border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 px-3 text-sm font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          Reset Day
        </button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex min-h-20 flex-col justify-between rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3">
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <CalendarDays size={15} />
            Date
          </span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            onInput={(event) => onDateChange(event.currentTarget.value)}
            onBlur={(event) => onDateChange(event.currentTarget.value)}
            className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100"
          />
        </label>

        <Metric label="失败次数" value={`${record.failedAttempts}/3`} tone={isLocked ? "danger" : "neutral"} />
        <Metric label="已实现盈亏" value={formatPnl(record.realizedPnl)} tone={record.realizedPnl < 0 ? "danger" : "positive"} />

        <div
          className={[
            "flex min-h-20 flex-col justify-between rounded-md border p-3",
            isLocked
              ? "border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
              : "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
          ].join(" ")}
        >
          <span className="flex items-center gap-2 text-xs font-medium">
            {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
            状态
          </span>
          <strong className="text-base">{isLocked ? "今日锁单" : "允许交易"}</strong>
        </div>
      </div>
      {isLocked ? (
        <div className="mt-3 rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-sm font-semibold text-rose-800 dark:text-rose-200">
          今日失败次数已达 3 次。停止开新仓，只允许复盘。
        </div>
      ) : null}
    </Panel>
  );
}

function Metric({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "danger";
}) {
  const toneClass = {
    neutral: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100",
    positive: "border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200",
    danger: "border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
  }[tone];

  return (
    <div className={`flex min-h-20 flex-col justify-between rounded-md border p-3 ${toneClass}`}>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <strong className="text-xl">{value}</strong>
    </div>
  );
}

function formatPnl(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}
