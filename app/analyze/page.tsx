import type { Metadata } from "next";
import { ChartAnalysisApp } from "@/components/ChartAnalysisApp";

export const metadata: Metadata = {
  title: "图表分析 · Trade Assistant",
  description: "Screenshot-based chart analysis using a conservative long-only trading framework."
};

export default function AnalyzePage() {
  return <ChartAnalysisApp />;
}
