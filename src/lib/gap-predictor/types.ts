// frontend/src/lib/gap-predictor/types.ts

export type Concept =
  | "fractions_add_sub"
  | "fractions_mul_div"
  | "negatives_signs"
  | "algebra_simplify"
  | "linear_equations";

export type ErrorCode =
  | "denominator_mismatch"
  | "sign_error"
  | "distribution_error"
  | "careless";

export type AttemptEvent = {
  id: string;
  ts: number;
  problemId: string;
  prompt: string;
  conceptTags: Concept[];
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpentSec: number;
  hintsUsed: number;
  errorCode?: ErrorCode;
};

export type GapSeverity = "low" | "medium" | "high";

export type GapPrediction = {
  concept: Concept;
  confidence: number; // 0..1 (prototype confidence)
  severity: GapSeverity;
  rationale: string[];
  recommendedNext: { title: string; action: string }[];
};

export type ViewMode = "student" | "coach";

export const CONCEPT_LABEL: Record<Concept, string> = {
  fractions_add_sub: "Fractions: add/subtract",
  fractions_mul_div: "Fractions: multiply/divide",
  negatives_signs: "Negatives & signs",
  algebra_simplify: "Algebra: simplify",
  linear_equations: "Linear equations",
};