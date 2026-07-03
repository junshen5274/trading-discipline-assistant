import type { Instrument, SetupType } from "@/types/trade";

export const chartTimeframes = ["5m", "15m", "60m"] as const;
export type ChartTimeframe = (typeof chartTimeframes)[number];

export const overallDecisions = ["不做", "等待", "可关注", "可以试单"] as const;
export type OverallDecision = (typeof overallDecisions)[number];

export const analysisConfidences = ["低", "中", "高"] as const;
export type AnalysisConfidence = (typeof analysisConfidences)[number];

export const setupGrades = ["A", "B", "C", "不适用", "不做"] as const;
export type AnalysisSetupGrade = (typeof setupGrades)[number];

export type DetectedSetup = {
  name: SetupType;
  grade: AnalysisSetupGrade;
  reasons: string[];
};

export type ChartAnalysisResult = {
  overallDecision: OverallDecision;
  confidence: AnalysisConfidence;
  summary: string;
  detectedSetups: DetectedSetup[];
  keyObservations: string[];
  riskWarnings: string[];
  waitFor: string[];
  missingContext: string[];
};

export type AnalysisHistoryEntry = {
  id: string;
  createdAt: string;
  instrument: Instrument;
  timeframe: ChartTimeframe;
  note?: string;
  imageName?: string;
  result: ChartAnalysisResult;
};
