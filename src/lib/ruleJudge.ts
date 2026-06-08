import { setupRules } from "@/data/setupRules";
import type { GradeResult, JudgeGrade, RuleAnswers, SetupType } from "@/types/trade";

export function judgeSetup(setup: SetupType, answers: RuleAnswers, riskSelected: boolean): GradeResult {
  const rule = setupRules[setup];
  const selectedOptions = rule.questions.map((question) => {
    const selectedId = answers[question.id];
    return question.options.find((option) => option.id === selectedId);
  });

  const missingCount = selectedOptions.filter((option) => !option).length;
  const maxScore = rule.questions.length * 2;
  const score = selectedOptions.reduce((total, option) => total + (option?.points ?? 0), 0);
  const uncertainCount = selectedOptions.filter((option) => option?.points === 1).length;
  const weakCount = selectedOptions.filter((option) => option?.points === 0).length;
  const hardBlockReasons = rule.questions.flatMap((question) => {
    const selectedId = answers[question.id];
    const option = question.options.find((candidate) => candidate.id === selectedId);
    return option?.hardBlock ? [`${question.text} (${option.label})`] : [];
  });
  const blockReasons = riskSelected ? [rule.riskLabel, ...hardBlockReasons] : hardBlockReasons;

  const grade = getGrade(missingCount, blockReasons.length > 0, uncertainCount, weakCount);

  return {
    grade,
    score,
    maxScore,
    missingCount,
    hardBlockReasons: blockReasons,
    riskSelected,
    explanation: getExplanation(grade, missingCount, blockReasons, uncertainCount, weakCount, score, maxScore)
  };
}

function getGrade(
  missingCount: number,
  hasHardBlock: boolean,
  uncertainCount: number,
  weakCount: number
): JudgeGrade {
  if (hasHardBlock) {
    return "No Trade";
  }

  if (missingCount > 0) return "Pending";
  if (uncertainCount === 0 && weakCount === 0) return "A";
  if (weakCount === 0 && uncertainCount <= 2) return "B";
  return "C";
}

function getExplanation(
  grade: JudgeGrade,
  missingCount: number,
  hardBlockReasons: string[],
  uncertainCount: number,
  weakCount: number,
  score: number,
  maxScore: number
) {
  if (hardBlockReasons.length > 0) {
    return `有明确禁止条件：${hardBlockReasons[0]}。停止开新仓，等待更干净的机会。`;
  }

  if (missingCount > 0) {
    return `还需要回答 ${missingCount} 个问题，才能完成判断。`;
  }

  if (grade === "A") {
    return `A 判断（${score}/${maxScore}）：条件清楚，位置和入场质量都较好。`;
  }

  if (grade === "B") {
    return `B 判断（${score}/${maxScore}）：整体有效，但有 ${uncertainCount} 个不确定项，需要更谨慎执行。`;
  }

  if (grade === "C") {
    return "C级：条件勉强，原则上不建议做。若仍入场，请确认这不是情绪单。";
  }

  return `不做（${score}/${maxScore}）：条件不足，不记录入场。`;
}
