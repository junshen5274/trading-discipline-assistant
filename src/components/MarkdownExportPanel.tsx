"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { buildDailyMarkdown } from "@/lib/markdown";
import type { DailyRecord } from "@/types/trade";
import { Panel } from "@/components/Panel";

type MarkdownExportPanelProps = {
  record: DailyRecord;
};

export function MarkdownExportPanel({ record }: MarkdownExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const markdown = useMemo(() => buildDailyMarkdown(record), [record]);

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Panel
      title="复盘导出"
      action={
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white"
          title="复制 Markdown"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "已复制" : "复制"}
        </button>
      }
    >
      <textarea
        readOnly
        value={markdown}
        className="h-64 w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-800"
      />
    </Panel>
  );
}
