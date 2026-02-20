// frontend/src/components/gap-predictor/GapPanel.tsx
"use client";

import React from "react";
import type { GapPrediction } from "@/lib/gap-predictor/types";
import { CONCEPT_LABEL } from "@/lib/gap-predictor/types";

type Props = {
  predictions: GapPrediction[];
};

export function GapPanel({ predictions }: Props) {
  const top = predictions.slice(0, 3);

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-sm font-semibold text-white/90">Predicted learning gaps</h2>
      <p className="mt-1 text-xs text-white/65">
        Uses repeated error signatures + friction (time/hints) to flag gaps early.
      </p>

      <div className="mt-4 space-y-3">
        {top.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
            No strong gaps detected yet. Keep practicing.
          </div>
        ) : (
          top.map((p) => {
            const pct = Math.round(p.confidence * 100);
            return (
              <div key={p.concept} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-white/90">
                    {CONCEPT_LABEL[p.concept]}
                  </div>
                  <span className={severityPill(p.severity)}>
                    {p.severity.toUpperCase()} • {pct}%
                  </span>
                </div>

                <ul className="mt-2 space-y-1 text-xs text-white/70">
                  {p.rationale.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400/80" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3">
                  <div className="text-xs font-semibold text-white/85">Recommended next</div>
                  <div className="mt-2 space-y-2">
                    {p.recommendedNext.slice(0, 3).map((rec, i) => (
                      <button
                        key={i}
                        className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left text-xs text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
                      >
                        <span>{rec.title}</span>
                        <span className="text-blue-200">{rec.action}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-white/55">
                  Prototype note: confidence is a local heuristic (not a trained model).
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-gradient-to-r from-blue-600/20 to-transparent p-4 text-xs text-white/70">
        <div className="font-semibold text-white/90">Impact</div>
        <div className="mt-1">Fewer stuck moments → less frustration → higher retention.</div>
      </div>
    </aside>
  );
}

function severityPill(sev: "low" | "medium" | "high") {
  if (sev === "high") {
    return "rounded-full px-2 py-1 text-xs ring-1 bg-yellow-400/15 text-yellow-200 ring-yellow-400/25";
  }
  if (sev === "medium") {
    return "rounded-full px-2 py-1 text-xs ring-1 bg-blue-600/15 text-blue-200 ring-blue-500/25";
  }
  return "rounded-full px-2 py-1 text-xs ring-1 bg-white/10 text-white/80 ring-white/15";
}