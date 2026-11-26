"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { AnalysisHistoryPanel } from "@/components/AnalysisHistoryPanel";
import { AnalysisResultCard } from "@/components/AnalysisResultCard";
import { AppNav } from "@/components/AppNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChartAnalysisControls } from "@/components/ChartAnalysisControls";
import { ScreenshotUploadPanel } from "@/components/ScreenshotUploadPanel";
import { isChartAnalysisResult, loadAnalysisHistory, saveAnalysisHistory } from "@/lib/chartAnalysis";
import type { AnalysisHistoryEntry, ChartAnalysisResult, ChartTimeframe } from "@/types/chartAnalysis";
import type { Instrument } from "@/types/trade";

export function ChartAnalysisApp() {
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [instrument, setInstrument] = useState<Instrument>("MNQ");
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("5m");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ChartAnalysisResult>();
  const [resultContext, setResultContext] = useState<{ instrument: Instrument; timeframe: ChartTimeframe; note?: string }>();
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);

  useEffect(() => setHistory(loadAnalysisHistory()), []);

  function handleImageChange(dataUrl: string, name: string) {
    setImageDataUrl(dataUrl);
    setImageName(name);
    setError("");
    if (!dataUrl) setResult(undefined);
  }

  async function analyze() {
    if (!imageDataUrl || loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, instrument, timeframe, note })
      });
      const payload = (await response.json()) as unknown;
      if (!response.ok) {
        const message = payload && typeof payload === "object" && typeof (payload as { error?: unknown }).error === "string" ? (payload as { error: string }).error : "分析失败，请稍后重试。";
        throw new Error(message);
      }
      if (!isChartAnalysisResult(payload)) throw new Error("服务器返回的分析格式无效，请重试。");

      const now = new Date().toISOString();
      const entry: AnalysisHistoryEntry = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
        createdAt: now,
        instrument,
        timeframe,
        note: note.trim() || undefined,
        imageName: imageName || undefined,
        result: payload
      };
      const nextHistory = [entry, ...history].slice(0, 30);
      setResult(payload);
      setResultContext({ instrument, timeframe, note: note.trim() || undefined });
      setHistory(nextHistory);
      try {
        saveAnalysisHistory(nextHistory);
      } catch {
        setError("分析已完成，但浏览器无法保存本地历史记录。");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "分析失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  function selectHistory(entry: AnalysisHistoryEntry) {
    setResult(entry.result);
    setResultContext({ instrument: entry.instrument, timeframe: entry.timeframe, note: entry.note });
    setInstrument(entry.instrument);
    setTimeframe(entry.timeframe);
    setNote(entry.note ?? "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearHistory() {
    if (!window.confirm("确认清空所有图表分析历史吗？")) return;
    setHistory([]);
    saveAnalysisHistory([]);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-slate-50">图表分析</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">上传截图，按你的 long-only 框架检查位置、形态与风险。只辅助判断，不连接券商或下单。</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300">位置第一，形态第二</div>
        </div>
      </header>

      <AppNav />

      {error ? (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
          <div className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>
          <button type="button" onClick={() => setError("")} aria-label="关闭错误提示"><X className="h-4 w-4" /></button>
        </div>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.7fr)]">
        <div className="space-y-4">
          <ScreenshotUploadPanel imageDataUrl={imageDataUrl} imageName={imageName} disabled={loading} onImageChange={handleImageChange} onError={setError} />
          {result ? <AnalysisResultCard result={result} instrument={resultContext?.instrument} timeframe={resultContext?.timeframe} note={resultContext?.note} /> : null}
        </div>
        <aside className="space-y-4 xl:sticky xl:top-4">
          <ChartAnalysisControls instrument={instrument} timeframe={timeframe} note={note} hasImage={Boolean(imageDataUrl)} loading={loading} onInstrumentChange={setInstrument} onTimeframeChange={setTimeframe} onNoteChange={setNote} onAnalyze={analyze} />
          <AnalysisHistoryPanel entries={history} onSelect={selectHistory} onClear={clearHistory} />
        </aside>
      </div>
    </main>
  );
}
