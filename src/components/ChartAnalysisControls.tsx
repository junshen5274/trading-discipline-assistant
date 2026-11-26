"use client";

import { LoaderCircle, ScanSearch } from "lucide-react";
import { Panel } from "@/components/Panel";
import { chartTimeframes, type ChartTimeframe } from "@/types/chartAnalysis";
import { instruments, type Instrument } from "@/types/trade";

type Props = {
  instrument: Instrument;
  timeframe: ChartTimeframe;
  note: string;
  hasImage: boolean;
  loading: boolean;
  onInstrumentChange: (instrument: Instrument) => void;
  onTimeframeChange: (timeframe: ChartTimeframe) => void;
  onNoteChange: (note: string) => void;
  onAnalyze: () => void;
};

export function ChartAnalysisControls(props: Props) {
  return (
    <Panel title="分析条件">
      <div className="space-y-4">
        <ControlGroup label="品种">
          {instruments.map((instrument) => (
            <ChoiceButton key={instrument} selected={props.instrument === instrument} onClick={() => props.onInstrumentChange(instrument)} disabled={props.loading}>
              {instrument}
            </ChoiceButton>
          ))}
        </ControlGroup>

        <ControlGroup label="截图周期">
          {chartTimeframes.map((timeframe) => (
            <ChoiceButton key={timeframe} selected={props.timeframe === timeframe} onClick={() => props.onTimeframeChange(timeframe)} disabled={props.loading}>
              {timeframe}
            </ChoiceButton>
          ))}
        </ControlGroup>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">你的观察 <span className="font-normal text-slate-400 dark:text-slate-500">（可选）</span></span>
          <textarea
            value={props.note}
            maxLength={1000}
            disabled={props.loading}
            onChange={(event) => props.onNoteChange(event.target.value)}
            placeholder="例如：我觉得像破底翻，帮我确认是否值得做"
            className="min-h-24 w-full resize-y rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-800"
          />
        </label>

        <button
          type="button"
          disabled={!props.hasImage || props.loading}
          onClick={props.onAnalyze}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
        >
          {props.loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ScanSearch className="h-5 w-5" />}
          {props.loading ? "正在分析图表…" : "开始分析"}
        </button>
        {!props.hasImage ? <p className="text-center text-xs text-slate-400 dark:text-slate-500">先上传或粘贴一张图表截图</p> : null}
      </div>
    </Panel>
  );
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <fieldset><legend className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</legend><div className="grid grid-cols-4 gap-2">{children}</div></fieldset>;
}

function ChoiceButton({ selected, onClick, disabled, children }: { selected: boolean; onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`rounded-md border px-2 py-2 text-sm font-bold transition disabled:opacity-50 ${selected ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-600"}`}>
      {children}
    </button>
  );
}
