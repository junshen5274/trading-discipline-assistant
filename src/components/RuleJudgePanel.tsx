"use client";

import { CheckCircle2, CircleAlert, LogIn, RotateCcw } from "lucide-react";
import { setupRules } from "@/data/setupRules";
import { displayJudgeGrade } from "@/lib/labels";
import type {
  DailyStatus,
  GradeResult,
  Instrument,
  RuleAnswers,
  SetupType
} from "@/types/trade";
import { Panel } from "@/components/Panel";

type RuleJudgePanelProps = {
  instrument: Instrument;
  setup: SetupType;
  answers: RuleAnswers;
  riskSelected: boolean;
  gradeResult: GradeResult;
  dailyStatus: DailyStatus;
  hasActiveTrade: boolean;
  entryPrice: string;
  note: string;
  onAnswer: (questionId: string, optionId: string) => void;
  onRiskChange: (selected: boolean) => void;
  onEntryPriceChange: (entryPrice: string) => void;
  onNoteChange: (note: string) => void;
  onResetSetup: () => void;
  onEntered: () => void;
};

export function RuleJudgePanel({
  instrument,
  setup,
  answers,
  riskSelected,
  gradeResult,
  dailyStatus,
  hasActiveTrade,
  entryPrice,
  note,
  onAnswer,
  onRiskChange,
  onEntryPriceChange,
  onNoteChange,
  onResetSetup,
  onEntered
}: RuleJudgePanelProps) {
  const rule = setupRules[setup];
  const disabledReason =
    gradeResult.grade === "Pending"
      ? "待判断"
      : gradeResult.grade === "No Trade"
        ? "不做"
    : dailyStatus === "Trading Locked"
        ? "今日锁单"
        : hasActiveTrade
          ? "已有当前交易"
          : "";
  const canEnter = !disabledReason;

  return (
    <Panel
      title="Rule Judge"
      action={
        <button
          type="button"
          onClick={onResetSetup}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw size={15} />
          Reset Setup
        </button>
      }
    >
      <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white">{instrument}</span>
          <span className="rounded-md bg-teal-700 px-2 py-1 text-xs font-semibold text-white">{setup}</span>
          <span className="text-sm text-slate-600">{rule.premise}</span>
        </div>
      </div>

      <div className="space-y-3">
        {rule.questions.map((question, index) => (
          <div key={question.id} className="rounded-md border border-slate-200 p-3">
            <p className="mb-2 text-sm font-medium text-slate-800">
              {index + 1}. {question.text}
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onAnswer(question.id, option.id)}
                    className={[
                      "min-h-10 rounded-md border px-3 py-2 text-sm font-medium transition",
                      selected
                        ? option.hardBlock
                          ? "border-rose-700 bg-rose-700 text-white"
                          : "border-teal-700 bg-teal-700 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-teal-500"
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <label
        className={[
          "mt-4 flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm font-semibold",
          riskSelected ? "border-rose-300 bg-rose-50 text-rose-800" : "border-slate-200 bg-white text-slate-700"
        ].join(" ")}
      >
        <input
          type="checkbox"
          checked={riskSelected}
          onChange={(event) => onRiskChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 accent-rose-700"
        />
        {rule.riskLabel}
      </label>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">入场价，可选</span>
          <input
            value={entryPrice}
            onChange={(event) => onEntryPriceChange(event.target.value)}
            placeholder="e.g. 18972.25"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">备注</span>
          <input
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="简短执行备注"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={onEntered}
          disabled={!canEnter}
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 md:min-w-32"
          title={disabledReason || "记录已入场"}
        >
          <LogIn size={16} />
          已入场
        </button>
      </div>

      <div
        className={[
          "mt-4 flex items-start gap-3 rounded-md border p-3",
          gradeResult.grade === "No Trade"
            ? "border-rose-200 bg-rose-50 text-rose-900"
            : gradeResult.grade === "Pending"
              ? "border-slate-200 bg-slate-50 text-slate-700"
              : gradeResult.grade === "C"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-teal-200 bg-teal-50 text-teal-900"
        ].join(" ")}
      >
        {gradeResult.grade === "No Trade" || gradeResult.grade === "Pending" || gradeResult.grade === "C" ? (
          <CircleAlert size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}
        <div>
          <div className="text-sm font-semibold">判断：{displayJudgeGrade(gradeResult.grade)}</div>
          <p className="mt-1 text-sm">{gradeResult.explanation}</p>
        </div>
      </div>
    </Panel>
  );
}
