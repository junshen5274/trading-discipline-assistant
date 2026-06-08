import type { DailyRecord } from "@/types/trade";

const STORAGE_PREFIX = "trade-assistant:daily:";
const SELECTED_DATE_KEY = "trade-assistant:selected-date";

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createEmptyDailyRecord(date: string): DailyRecord {
  return {
    date,
    failedAttempts: 0,
    realizedPnl: 0,
    trades: []
  };
}

export function loadDailyRecord(date: string): DailyRecord {
  if (typeof window === "undefined") {
    return createEmptyDailyRecord(date);
  }

  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${date}`);
  if (!raw) {
    return createEmptyDailyRecord(date);
  }

  try {
    const parsed = JSON.parse(raw) as DailyRecord;
    return {
      ...createEmptyDailyRecord(date),
      ...parsed,
      date,
      trades: Array.isArray(parsed.trades) ? parsed.trades : []
    };
  } catch {
    return createEmptyDailyRecord(date);
  }
}

export function saveDailyRecord(record: DailyRecord) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${STORAGE_PREFIX}${record.date}`, JSON.stringify(record));
}

export function loadSelectedDate() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage.getItem(SELECTED_DATE_KEY) || undefined;
}

export function saveSelectedDate(date: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SELECTED_DATE_KEY, date);
}

export function clearTradeAssistantStorage() {
  if (typeof window === "undefined") {
    return;
  }

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX) || key === SELECTED_DATE_KEY)
    .forEach((key) => window.localStorage.removeItem(key));
}
