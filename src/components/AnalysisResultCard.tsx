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
  不做: "border-rose-200 bg-rose-50 text-rose-800",
  等待: "border-amber-200 bg-amber-50 text-amber-800",
  可关注: "border-sky-200 bg-sky-50 text-sky-800",
  可以试单: "border-emerald-200 bg-emerald-50 text-emerald-800"
};

const gradeStyles: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800",
  B: "bg-sky-100 text-sky-800",
  C: "bg-amber-100 text-amber-800",
  不适用: "bg-slate-100 text-slate-600",
  不做: "bg-rose-100 text-rose-800"
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
        <button type="button" onClick={copyMarkdown} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "已复制" : "复制 Markdown"}
        </button>
      }
    >
      <div className={`rounded-lg border px-4 py-4 ${decisionStyles[result.overallDecision]}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest opacity-70">Overall decision</p><p className="mt-1 text-3xl font-black">{result.overallDecision}</p></div>
          <div className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold">置信度：{result.confidence}</div>
        </div>
        <p className="mt-3 text-sm leading-6">{result.summary}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {result.detectedSetups.map((setup) => (
          <div key={setup.name} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900">{setup.name}</h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${gradeStyles[setup.grade]}`}>{setup.grade}</span>
            </div>
            {setup.reasons.length ? <ul className="mt-2 space-y-1 text-sm leading-5 text-slate-600">{setup.reasons.map((reason, index) => <li key={index}>• {reason}</li>)}</ul> : null}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ResultSection title="关键观察" items={result.keyObservations} icon={Eye} tone="slate" />
        <ResultSection title="风险提醒" items={result.riskWarnings} icon={ShieldAlert} tone="rose" />
        <ResultSection title="等待确认" items={result.waitFor} icon={Timer} tone="amber" />
        <ResultSection title="缺失信息" items={result.missingContext} icon={Unplug} tone="sky" />
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        这是按既定框架生成的辅助判断，不构成金融建议，不会连接券商或执行交易。
      </div>
    </Panel>
  );
}

function ResultSection({ title, items, icon: Icon, tone }: { title: string; items: string[]; icon: typeof Eye; tone: "slate" | "rose" | "amber" | "sky" }) {
  const colors = {
    slate: "bg-slate-50 text-slate-700",
    rose: "bg-rose-50 text-rose-800",
    amber: "bg-amber-50 text-amber-800",
    sky: "bg-sky-50 text-sky-800"
  };
  return (
    <section className={`rounded-lg p-3 ${colors[tone]}`}>
      <h3 className="flex items-center gap-2 text-sm font-bold"><Icon className="h-4 w-4" /> {title}</h3>
      {items.length ? <ul className="mt-2 space-y-1 text-sm leading-5">{items.map((item, index) => <li key={index}>• {item}</li>)}</ul> : <p className="mt-2 text-sm opacity-60">无</p>}
    </section>
  );
}
