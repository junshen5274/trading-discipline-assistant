"use client";

import { Clock3, Trash2 } from "lucide-react";
import { Panel } from "@/components/Panel";
import type { AnalysisHistoryEntry } from "@/types/chartAnalysis";

type Props = {
  entries: AnalysisHistoryEntry[];
  onSelect: (entry: AnalysisHistoryEntry) => void;
  onClear: () => void;
};

export function AnalysisHistoryPanel({ entries, onSelect, onClear }: Props) {
  return (
    <Panel
      title={`分析历史${entries.length ? ` · ${entries.length}` : ""}`}
      action={entries.length ? <button type="button" onClick={onClear} className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" />清空</button> : null}
    >
      {entries.length ? (
        <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <button key={entry.id} type="button" onClick={() => onSelect(entry)} className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-teal-300 hover:bg-teal-50/40">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900">{entry.instrument} · {entry.timeframe}</span>
                <DecisionPill decision={entry.result.overallDecision} />
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{entry.result.summary}</p>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400"><Clock3 className="h-3 w-3" />{formatDate(entry.createdAt)}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">完成一次分析后会保存在这台设备上。</div>
      )}
    </Panel>
  );
}

function DecisionPill({ decision }: { decision: AnalysisHistoryEntry["result"]["overallDecision"] }) {
  const style = decision === "不做" ? "bg-rose-100 text-rose-700" : decision === "等待" ? "bg-amber-100 text-amber-700" : decision === "可关注" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${style}`}>{decision}</span>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
