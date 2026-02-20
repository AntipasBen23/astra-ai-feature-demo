// frontend/src/app/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { DemoShell } from "@/components/gap-predictor/DemoShell";
import { seededDemoEvents } from "@/lib/gap-predictor/demoData";
import { computeGapPredictions } from "@/lib/gap-predictor/inference";
import type { AttemptEvent, ViewMode } from "@/lib/gap-predictor/types";

export default function Page() {
  // Straight to the feature: no header/footer, no navigation.
  const [events, setEvents] = useState<AttemptEvent[]>(() => seededDemoEvents());
  const [mode, setMode] = useState<ViewMode>("student");

  const predictions = useMemo(() => computeGapPredictions(events), [events]);

  function resetDemo() {
    setEvents(seededDemoEvents());
  }

  function addSimulatedAttempt(kind: "fractions" | "signs") {
    const ts = Date.now();

    const next: AttemptEvent =
      kind === "fractions"
        ? {
            id: crypto.randomUUID(),
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
          }
        : {
            id: crypto.randomUUID(),
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

    setEvents((prev) => [...prev, next]);
  }

  return (
    <DemoShell
      mode={mode}
      setMode={setMode}
      events={events}
      predictions={predictions}
      onReset={resetDemo}
      onSimulateFractions={() => addSimulatedAttempt("fractions")}
      onSimulateSigns={() => addSimulatedAttempt("signs")}
    />
  );
}