// frontend/src/lib/gap-predictor/inference.ts

import type { AttemptEvent, GapPrediction, Concept } from "./types";
import { CONCEPT_LABEL } from "./types";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function computeGapPredictions(
  events: AttemptEvent[]
): GapPrediction[] {
  // Group attempts by concept (mimics backend aggregation layer)
  const byConcept = new Map<Concept, AttemptEvent[]>();

  for (const e of events) {
    for (const c of e.conceptTags) {
      const arr = byConcept.get(c) ?? [];
      arr.push(e);
      byConcept.set(c, arr);
    }
  }

  const predictions: GapPrediction[] = [];

  for (const [concept, arr] of byConcept.entries()) {
    if (arr.length < 2) continue; // need pattern, not single mistake

    const total = arr.length;
    const wrong = arr.filter((a) => !a.isCorrect);
    const wrongRate = wrong.length / total;

    const avgTime =
      arr.reduce((sum, a) => sum + a.timeSpentSec, 0) / total;

    const avgHints =
      arr.reduce((sum, a) => sum + a.hintsUsed, 0) / total;

    // Count repeated error signatures
    const errorCounts = new Map<string, number>();
    for (const w of wrong) {
      if (w.errorCode) {
        errorCounts.set(
          w.errorCode,
          (errorCounts.get(w.errorCode) ?? 0) + 1
        );
      }
    }

    const topError = [...errorCounts.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Confidence heuristic (prototype logic)
    const repeatedBoost = topError
      ? Math.min(0.35, (topError[1] / total) * 0.6)
      : 0;

    const frictionBoost =
      clamp01((avgTime - 25) / 80) * 0.2 +
      clamp01((avgHints - 0.2) / 2) * 0.2;

    const confidence = clamp01(
      wrongRate * 0.75 + repeatedBoost + frictionBoost
    );

    const severity =
      confidence > 0.72
        ? "high"
        : confidence > 0.48
        ? "medium"
        : "low";

    // Only surface meaningful signals
    if (severity === "low" && wrongRate < 0.34) continue;

    const rationale: string[] = [];

    rationale.push(
      `${wrong.length}/${total} recent attempts incorrect (${Math.round(
        wrongRate * 100
      )}%).`
    );

    if (topError) {
      const [code, count] = topError;
      rationale.push(
        `Repeated error signature: ${humanizeError(code)} (${count}x).`
      );
    }

    if (avgHints >= 1) {
      rationale.push(
        `High hint usage (avg ${avgHints.toFixed(1)}).`
      );
    }

    if (avgTime >= 60) {
      rationale.push(
        `Slow solve time (avg ${Math.round(avgTime)}s).`
      );
    }

    predictions.push({
      concept,
      confidence,
      severity,
      rationale,
      recommendedNext: recommendedActions(concept),
    });
  }

  return predictions.sort((a, b) => b.confidence - a.confidence);
}

function humanizeError(code: string): string {
  switch (code) {
    case "denominator_mismatch":
      return "Not finding common denominators";
    case "sign_error":
      return "Sign mistakes with negatives";
    case "distribution_error":
      return "Incorrect distribution across brackets";
    default:
      return "Careless arithmetic slips";
  }
}

function recommendedActions(concept: Concept) {
  switch (concept) {
    case "fractions_add_sub":
      return [
        { title: "Micro-lesson: common denominators", action: "Review" },
        { title: "5 targeted drills", action: "Practice" },
        { title: "Worked example breakdown", action: "See steps" },
      ];
    case "negatives_signs":
      return [
        { title: "Rule card: sign flips", action: "Review" },
        { title: "Timed mini-quiz", action: "Practice" },
        { title: "Explain the rule back", action: "Self-test" },
      ];
    case "algebra_simplify":
      return [
        { title: "Like terms refresher", action: "Review" },
        { title: "Simplify 6 expressions", action: "Practice" },
        { title: "Common traps checklist", action: "Scan" },
      ];
    default:
      return [
        { title: `${CONCEPT_LABEL[concept]} warm-up`, action: "Practice" },
        { title: "Quick recap", action: "Review" },
      ];
  }
}