"use client";

import React from "react";
import type { AttemptEvent, ViewMode } from "@/lib/gap-predictor/types";
import { CONCEPT_LABEL } from "@/lib/gap-predictor/types";

type Props = {
  events: AttemptEvent[];
  mode: ViewMode;
  onReset: () => void;
};

export function EventTimeline({ events, mode, onReset }: Props) {
  const recent = [...events].sort((a, b) => b.ts - a.ts).slice(0, 8);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/90">
          Problem-solving timeline
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/55">
            {events.length} events
          </span>
          <button
            onClick={onReset}
            className="text-xs text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {recent.map((e) => (
          <div
            key={e.id}
            className="rounded-xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-white/90">
                <span className="font-medium">{e.problemId}</span>{" "}
                <span className="text-white/60">•</span>{" "}
                <span className="text-white/75">{e.prompt}</span>
              </div>

              <span className={statusPill(e.isCorrect)}>
                {e.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>

            <div className="mt-2 grid gap-2 text-xs text-white/65 sm:grid-cols-2">
              <div>
                Answer:{" "}
                <span className="text-white/85">
                  {e.studentAnswer}
                </span>{" "}
                <span className="text-white/40">→</span>{" "}
                <span className="text-white/85">
                  {e.correctAnswer}
                </span>
              </div>

              <div className="sm:text-right">
                {e.timeSpentSec}s • {e.hintsUsed} hint
                {e.hintsUsed === 1 ? "" : "s"} •{" "}
                {e.conceptTags
                  .map((c) => CONCEPT_LABEL[c])
                  .join(", ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {mode === "coach" && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
          <div className="font-semibold text-white/85">
            Backend mimic (local telemetry)
          </div>
          <div className="mt-1">
            Each attempt emits an event → stored locally → inference
            recomputes gap risk in real time.
          </div>
        </div>
      )}
    </section>
  );
}

function statusPill(isCorrect: boolean) {
  return `rounded-full px-2 py-1 text-xs ring-1 ${
    isCorrect
      ? "bg-emerald-400/10 text-emerald-200 ring-emerald-400/20"
      : "bg-yellow-400/10 text-yellow-200 ring-yellow-400/20"
  }`;
}