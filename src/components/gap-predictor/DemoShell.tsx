// frontend/src/components/gap-predictor/DemoShell.tsx
"use client";

import React from "react";
import type { AttemptEvent, GapPrediction, ViewMode } from "@/lib/gap-predictor/types";
import { CONCEPT_LABEL } from "@/lib/gap-predictor/types";

type Props = {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  events: AttemptEvent[];
  predictions: GapPrediction[];
  onReset: () => void;
  onSimulateFractions: () => void;
  onSimulateSigns: () => void;
};

export function DemoShell({
  mode,
  setMode,
  events,
  predictions,
  onReset,
  onSimulateFractions,
  onSimulateSigns,
}: Props) {
  const recent = [...events].sort((a, b) => b.ts - a.ts).slice(0, 8);
  const top = predictions.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        {/* Straight-to-feature “hero” (no header/footer) */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-7">
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-yellow-400/15 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  Learning Gap Predictor (frontend-only, backend-mimic)
                </div>

                <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Flags conceptual gaps before they become blockers.
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  Prototype logic runs locally: it watches problem-solving patterns (errors, time, hints), detects repeated
                  conceptual signatures, and recommends targeted remediation.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <ToggleButton active={mode === "student"} onClick={() => setMode("student")}>
                    Student View
                  </ToggleButton>
                  <ToggleButton active={mode === "coach"} onClick={() => setMode("coach")}>
                    Coach View
                  </ToggleButton>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ActionButton onClick={onSimulateFractions}>Simulate Fractions Mistake</ActionButton>
                  <ActionButton onClick={onSimulateSigns}>Simulate Sign Mistake</ActionButton>
                  <button
                    onClick={onReset}
                    className="rounded-xl px-4 py-2 text-xs text-white/70 underline-offset-4 hover:text-white hover:underline"
                  >
                    Reset demo
                  </button>
                </div>
              </div>
            </div>

            {/* Feature grid */}
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Timeline */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white/90">Problem-solving timeline</h2>
                  <span className="text-xs text-white/55">{events.length} events</span>
                </div>

                <div className="mt-4 space-y-3">
                  {recent.map((e) => (
                    <div key={e.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm text-white/90">
                          <span className="font-medium">{e.problemId}</span>{" "}
                          <span className="text-white/60">•</span>{" "}
                          <span className="text-white/75">{e.prompt}</span>
                        </div>

                        <span className={StatusPillClass(e.isCorrect)}>
                          {e.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>

                      <div className="mt-2 grid gap-2 text-xs text-white/65 sm:grid-cols-2">
                        <div>
                          Answer: <span className="text-white/85">{e.studentAnswer}</span>{" "}
                          <span className="text-white/40">→</span>{" "}
                          <span className="text-white/85">{e.correctAnswer}</span>
                        </div>

                        <div className="sm:text-right">
                          {e.timeSpentSec}s • {e.hintsUsed} hint{e.hintsUsed === 1 ? "" : "s"} •{" "}
                          {e.conceptTags.map((c) => CONCEPT_LABEL[c]).join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {mode === "coach" && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
                    <div className="font-semibold text-white/85">Backend mimic (local telemetry)</div>
                    <div className="mt-1">
                      Each attempt emits an event → stored locally → inference recomputes gap risk in real-time.
                    </div>
                  </div>
                )}
              </section>

              {/* Predictions */}
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
                            <div className="text-sm font-semibold text-white/90">{CONCEPT_LABEL[p.concept]}</div>
                            <span className={SeverityPillClass(p.severity)}>
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs transition ${
        active ? "bg-blue-600 text-white" : "text-white/70 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-white/5 px-4 py-2 text-xs text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
    >
      {children}
    </button>
  );
}

function StatusPillClass(isCorrect: boolean) {
  return `rounded-full px-2 py-1 text-xs ring-1 ${
    isCorrect
      ? "bg-emerald-400/10 text-emerald-200 ring-emerald-400/20"
      : "bg-yellow-400/10 text-yellow-200 ring-yellow-400/20"
  }`;
}

function SeverityPillClass(sev: "low" | "medium" | "high") {
  if (sev === "high") return "rounded-full px-2 py-1 text-xs ring-1 bg-yellow-400/15 text-yellow-200 ring-yellow-400/25";
  if (sev === "medium") return "rounded-full px-2 py-1 text-xs ring-1 bg-blue-600/15 text-blue-200 ring-blue-500/25";
  return "rounded-full px-2 py-1 text-xs ring-1 bg-white/10 text-white/80 ring-white/15";
}