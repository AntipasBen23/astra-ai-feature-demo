// frontend/src/lib/gap-predictor/demoData.ts

import type { AttemptEvent } from "./types";

function id() {
  // crypto.randomUUID is available in modern browsers; keep a fallback.
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export function seededDemoEvents(): AttemptEvent[] {
  const base = Date.now();

  return [
    {
      id: id(),
      ts: base - 1000 * 60 * 12,
      problemId: "P-1041",
      prompt: "Compute: 1/3 + 1/6",
      conceptTags: ["fractions_add_sub"],
      studentAnswer: "2/9",
      correctAnswer: "1/2",
      isCorrect: false,
      timeSpentSec: 74,
      hintsUsed: 2,
      errorCode: "denominator_mismatch",
    },
    {
      id: id(),
      ts: base - 1000 * 60 * 8,
      problemId: "P-1047",
      prompt: "Compute: 2/5 - 1/10",
      conceptTags: ["fractions_add_sub"],
      studentAnswer: "1/5",
      correctAnswer: "3/10",
      isCorrect: false,
      timeSpentSec: 68,
      hintsUsed: 1,
      errorCode: "denominator_mismatch",
    },
    {
      id: id(),
      ts: base - 1000 * 60 * 5,
      problemId: "P-2102",
      prompt: "Simplify: -3 - (-7)",
      conceptTags: ["negatives_signs"],
      studentAnswer: "-10",
      correctAnswer: "4",
      isCorrect: false,
      timeSpentSec: 42,
      hintsUsed: 1,
      errorCode: "sign_error",
    },
    {
      id: id(),
      ts: base - 1000 * 60 * 2,
      problemId: "P-2106",
      prompt: "Compute: -2 × (-5)",
      conceptTags: ["negatives_signs"],
      studentAnswer: "-10",
      correctAnswer: "10",
      isCorrect: false,
      timeSpentSec: 36,
      hintsUsed: 0,
      errorCode: "sign_error",
    },
  ];
}