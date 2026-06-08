export const instruments = ["MNQ", "MGC", "MCL", "SIL"] as const;
export type Instrument = (typeof instruments)[number];

export const setups = ["破底翻", "2-2", "互换", "破小"] as const;
export type SetupType = (typeof setups)[number];

export type TradeGrade = "A" | "B" | "C" | "No Trade";
export type JudgeGrade = "Pending" | TradeGrade;
export type TradeResult = "Win" | "Loss" | "Breakeven" | "Rule Violation";
export type DailyStatus = "Trading Allowed" | "Trading Locked";

export type RuleOption = {
  id: string;
  label: string;
  points: number;
  hardBlock?: boolean;
};

export type RuleQuestion = {
  id: string;
  text: string;
  options: [RuleOption, RuleOption, RuleOption];
};

export type SetupRule = {
  setup: SetupType;
  premise: string;
  riskLabel: string;
  questions: RuleQuestion[];
};

export type RuleAnswers = Record<string, string>;

export type GradeResult = {
  grade: JudgeGrade;
  score: number;
  maxScore: number;
  explanation: string;
  missingCount: number;
  hardBlockReasons: string[];
  riskSelected: boolean;
};

export type TradeEntry = {
  id: string;
  date: string;
  entryTime: string;
  closeTime?: string;
  instrument: Instrument;
  setup: SetupType;
  grade: TradeGrade;
  entryPrice?: string;
  result?: TradeResult;
  actualPnl?: number;
  note?: string;
  answers: RuleAnswers;
  riskSelected?: boolean;
};

export type DailyRecord = {
  date: string;
  failedAttempts: number;
  realizedPnl: number;
  activeTradeId?: string;
  trades: TradeEntry[];
};
