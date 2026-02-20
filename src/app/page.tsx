// frontend/src/app/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { DemoShell } from "@/components/gap-predictor/DemoShell";
import { computeGapPredictions } from "@/lib/gap-predictor/inference";
import { useEventStore } from "@/lib/gap-predictor/useEventStore";
import type { AttemptEvent, ViewMode } from "@/lib/gap-predictor/types";

function makeAttempt(kind: "fractions" | "signs"): AttemptEvent {
  const ts = Date.now();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2) + "-" + String(ts);

  if (kind === "fractions") {
    return {
      id,
      ts,
      problemId: "P-1054",
      prompt: "Compute: 3/4 + 1/8",
      conceptTags: ["fractions_add_sub"],
      studentAnswer: "4/12",
      correctAnswer: "7/8",
      isCorrect: false,
      timeSpentSec: 83,
      hintsUsed: 2,
      errorCode: "denominator_mismatch",
    };
  }

  return {
    id,
    ts,
    problemId: "P-2113",
    prompt: "Simplify: -(x - 4) when x=2",
    conceptTags: ["negatives_signs", "algebra_simplify"],
    studentAnswer: "-(-2)",
    correctAnswer: "2",
    isCorrect: false,
    timeSpentSec: 58,
    hintsUsed: 1,
    errorCode: "sign_error",
  };
}

export default function Page() {
  const { events, ingest, reset, isIngesting, lastIngestedAt } = useEventStore({
    persist: true,
    seed: true,
  });

  const [mode, setMode] = useState<ViewMode>("student");
  const predictions = useMemo(() => computeGapPredictions(events), [events]);

  function onSimulate(kind: "fractions" | "signs") {
    void ingest(makeAttempt(kind));
  }

  return (
    <DemoShell
      mode={mode}
      setMode={setMode}
      events={events}
      predictions={predictions}
      onReset={reset}
      onSimulateFractions={() => onSimulate("fractions")}
      onSimulateSigns={() => onSimulate("signs")}
      isIngesting={isIngesting}
      lastIngestedAt={lastIngestedAt}
    />
  );
}