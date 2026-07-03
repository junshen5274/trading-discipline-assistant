"use client";

import { useEffect, useMemo, useState } from "react";
import { ActiveTradePanel } from "@/components/ActiveTradePanel";
import { AppNav } from "@/components/AppNav";
import { DailyStatusPanel } from "@/components/DailyStatusPanel";
import { InstrumentSelector } from "@/components/InstrumentSelector";
import { MarkdownExportPanel } from "@/components/MarkdownExportPanel";
import { RuleJudgePanel } from "@/components/RuleJudgePanel";
import { SetupSelector } from "@/components/SetupSelector";
import { TradeHistoryPanel } from "@/components/TradeHistoryPanel";
import { judgeSetup } from "@/lib/ruleJudge";
import {
  clearTradeAssistantStorage,
  createEmptyDailyRecord,
  getTodayKey,
  loadDailyRecord,
  loadSelectedDate,
  saveDailyRecord,
  saveSelectedDate
} from "@/lib/storage";
import type {
  DailyRecord,
  DailyStatus,
  Instrument,
  RuleAnswers,
  SetupType,
  TradeEntry,
  TradeResult
} from "@/types/trade";

export function TradeAssistantApp() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [record, setRecord] = useState<DailyRecord>(() => createEmptyDailyRecord(getTodayKey()));
  const [hasLoadedRecord, setHasLoadedRecord] = useState(false);
  const [hasLoadedSelectedDate, setHasLoadedSelectedDate] = useState(false);
  const [instrument, setInstrument] = useState<Instrument>("MNQ");
  const [setup, setSetup] = useState<SetupType>("破底翻");
  const [answers, setAnswers] = useState<RuleAnswers>({});
  const [riskSelected, setRiskSelected] = useState(false);
  const [entryPrice, setEntryPrice] = useState("");
  const [entryNote, setEntryNote] = useState("");
  const [actualPnl, setActualPnl] = useState("");
  const [closeNote, setCloseNote] = useState("");
  const [resetVersion, setResetVersion] = useState(0);

  useEffect(() => {
    const storedDate = loadSelectedDate();
    if (storedDate) {
      setSelectedDate(storedDate);
    }
    setHasLoadedSelectedDate(true);
  }, []);

  useEffect(() => {
    setRecord(loadDailyRecord(selectedDate));
    setHasLoadedRecord(true);
  }, [selectedDate]);

  useEffect(() => {
    if (!hasLoadedSelectedDate) {
      return;
    }

    saveSelectedDate(selectedDate);
  }, [hasLoadedSelectedDate, selectedDate]);

  useEffect(() => {
    if (!hasLoadedRecord) {
      return;
    }

    saveDailyRecord(record);
  }, [hasLoadedRecord, record]);

  useEffect(() => {
    setAnswers({});
    setRiskSelected(false);
    setEntryPrice("");
    setEntryNote("");
  }, [setup]);

  const dailyStatus: DailyStatus = record.failedAttempts >= 3 ? "Trading Locked" : "Trading Allowed";
  const activeTrade = record.trades.find((trade) => trade.id === record.activeTradeId);
  const gradeResult = useMemo(() => judgeSetup(setup, answers, riskSelected), [setup, answers, riskSelected]);

  function updateRecord(nextRecord: DailyRecord) {
    const realizedPnl = nextRecord.trades.reduce((total, trade) => total + (trade.actualPnl ?? 0), 0);
    setRecord({ ...nextRecord, realizedPnl });
  }

  function resetSetupJudge() {
    setAnswers({});
    setRiskSelected(false);
    setEntryPrice("");
    setEntryNote("");
    setResetVersion((version) => version + 1);
  }

  function resetCloseInputs() {
    setActualPnl("");
    setCloseNote("");
  }

  function handleAnswer(questionId: string, optionId: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId
    }));
  }

  function handleEntered() {
    const grade = gradeResult.grade;

    if (grade === "Pending" || grade === "No Trade" || dailyStatus === "Trading Locked" || activeTrade) {
      return;
    }

    if (grade === "C" && !window.confirm("当前是 C 级机会，原则上不建议做。确定要记录入场吗？")) {
      return;
    }

    const now = new Date();
    const trade: TradeEntry = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      date: record.date,
      entryTime: formatTime(now),
      instrument,
      setup,
      grade,
      entryPrice: entryPrice.trim() || undefined,
      note: entryNote.trim() || undefined,
      answers,
      riskSelected
    };

    updateRecord({
      ...record,
      activeTradeId: trade.id,
      trades: [trade, ...record.trades]
    });

    setEntryPrice("");
    setEntryNote("");
  }

  function handleCloseTrade(result: TradeResult) {
    if (!activeTrade) {
      return;
    }

    const pnl = normalizeActualPnl(result, actualPnl);
    const failedAttempts = result === "Loss" || result === "Rule Violation" ? record.failedAttempts + 1 : record.failedAttempts;
    const closeTime = formatTime(new Date());
    const trimmedCloseNote = closeNote.trim();

    const trades = record.trades.map((trade) => {
      if (trade.id !== activeTrade.id) {
        return trade;
      }

      return {
        ...trade,
        closeTime,
        result,
        actualPnl: pnl,
        note: [trade.note, trimmedCloseNote].filter(Boolean).join(" | ") || undefined
      };
    });

    updateRecord({
      ...record,
      failedAttempts: Math.min(failedAttempts, 3),
      activeTradeId: undefined,
      trades
    });

    resetCloseInputs();
    resetSetupJudge();
  }

  function handleResetDay() {
    if (!window.confirm("确认重置当前日期的交易记录和纪律状态吗？")) {
      return;
    }

    updateRecord(createEmptyDailyRecord(record.date));
    resetSetupJudge();
    resetCloseInputs();
  }

  function handleClearTestData() {
    if (!window.confirm("确认清空 Trade Assistant 的所有本地测试数据吗？")) {
      return;
    }

    clearTradeAssistantStorage();
    window.location.reload();
  }

  function handleDateChange(date: string) {
    if (!date) {
      return;
    }

    setSelectedDate(date);
    resetSetupJudge();
    resetCloseInputs();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Trade Assistant</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Long-only futures discipline tracker. No broker connection, no orders, just setup quality and daily execution control.
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
          一次只跟踪一笔交易
        </div>
      </header>

      <AppNav />

      {process.env.NODE_ENV === "development" ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClearTestData}
            className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
          >
            清空本地测试数据
          </button>
        </div>
      ) : null}

      <DailyStatusPanel
        date={selectedDate}
        record={record}
        status={dailyStatus}
        onDateChange={handleDateChange}
        onResetDay={handleResetDay}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <InstrumentSelector selected={instrument} onSelect={setInstrument} />
        <SetupSelector selected={setup} onSelect={setSetup} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
        <RuleJudgePanel
          key={`${setup}-${resetVersion}`}
          instrument={instrument}
          setup={setup}
          answers={answers}
          riskSelected={riskSelected}
          gradeResult={gradeResult}
          dailyStatus={dailyStatus}
          hasActiveTrade={Boolean(activeTrade)}
          entryPrice={entryPrice}
          note={entryNote}
          onAnswer={handleAnswer}
          onRiskChange={setRiskSelected}
          onEntryPriceChange={setEntryPrice}
          onNoteChange={setEntryNote}
          onResetSetup={resetSetupJudge}
          onEntered={handleEntered}
        />
        <div className="space-y-4">
          <ActiveTradePanel
            trade={activeTrade}
            actualPnl={actualPnl}
            closeNote={closeNote}
            onActualPnlChange={setActualPnl}
            onCloseNoteChange={setCloseNote}
            onClose={handleCloseTrade}
          />
          <MarkdownExportPanel record={record} />
        </div>
      </div>

      <TradeHistoryPanel trades={record.trades} />
    </main>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeActualPnl(result: TradeResult, value: string) {
  const parsed = parseOptionalNumber(value);

  if (typeof parsed !== "number") {
    return result === "Breakeven" && value.trim() === "" ? 0 : undefined;
  }

  if (result === "Win") {
    return Math.abs(parsed);
  }

  if (result === "Loss" || result === "Rule Violation") {
    return -Math.abs(parsed);
  }

  return parsed;
}
