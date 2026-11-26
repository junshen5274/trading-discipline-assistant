"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy, Eye, ShieldAlert, Timer, Unplug } from "lucide-react";
import { Panel } from "@/components/Panel";
import { resultToMarkdown } from "@/lib/chartAnalysis";
import type { ChartAnalysisResult } from "@/types/chartAnalysis";

type Props = {
  result: ChartAnalysisResult;
  instrument?: string;
  timeframe?: string;
  note?: string;
};

const decisionStyles: Record<ChartAnalysisResult["overallDecision"], string> = {
  不做: "border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200",
  等待: "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200",
  可关注: "border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200",
  可以试单: "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
};

const gradeStyles: Record<string, string> = {
  A: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200",
  B: "bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200",
  C: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200",
  不适用: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  不做: "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200"
};

export function AnalysisResultCard({ result, instrument, timeframe, note }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyMarkdown() {
    const markdown = resultToMarkdown(result, { instrument, timeframe, note });
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Panel
      title="框架判断"
      action={
        <button type="button" onClick={copyMarkdown} className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "已复制" : "复制 Markdown"}
        </button>
      }
    >
      <div className={`rounded-lg border px-4 py-4 ${decisionStyles[result.overallDecision]}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest opacity-70">Overall decision</p><p className="mt-1 text-3xl font-black">{result.overallDecision}</p></div>
          <div className="rounded-full bg-white/70 dark:bg-slate-900/70 px-3 py-1.5 text-sm font-bold">置信度：{result.confidence}</div>
        </div>
        <p className="mt-3 text-sm leading-6">{result.summary}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {result.detectedSetups.map((setup) => (
          <div key={setup.name} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">{setup.name}</h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${gradeStyles[setup.grade]}`}>{setup.grade}</span>
            </div>
            {setup.reasons.length ? <ul className="mt-2 space-y-1 text-sm leading-5 text-slate-600 dark:text-slate-400">{setup.reasons.map((reason, index) => <li key={index}>• {reason}</li>)}</ul> : null}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ResultSection title="关键观察" items={result.keyObservations} icon={Eye} tone="slate" />
        <ResultSection title="风险提醒" items={result.riskWarnings} icon={ShieldAlert} tone="rose" />
        <ResultSection title="等待确认" items={result.waitFor} icon={Timer} tone="amber" />
        <ResultSection title="缺失信息" items={result.missingContext} icon={Unplug} tone="sky" />
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        这是按既定框架生成的辅助判断，不构成金融建议，不会连接券商或执行交易。
      </div>
    </Panel>
  );
}

function ResultSection({ title, items, icon: Icon, tone }: { title: string; items: string[]; icon: typeof Eye; tone: "slate" | "rose" | "amber" | "sky" }) {
  const colors = {
    slate: "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300",
    rose: "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200",
    amber: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200",
    sky: "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200"
  };
  return (
    <section className={`rounded-lg p-3 ${colors[tone]}`}>
      <h3 className="flex items-center gap-2 text-sm font-bold"><Icon className="h-4 w-4" /> {title}</h3>
      {items.length ? <ul className="mt-2 space-y-1 text-sm leading-5">{items.map((item, index) => <li key={index}>• {item}</li>)}</ul> : <p className="mt-2 text-sm opacity-60">无</p>}
    </section>
  );
}
