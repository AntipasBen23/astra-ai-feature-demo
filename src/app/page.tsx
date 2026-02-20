// frontend/src/app/page.tsx
"use client";

import React, { useMemo, useState } from "react";

type Concept =
  | "fractions_add_sub"
  | "fractions_mul_div"
  | "negatives_signs"
  | "algebra_simplify"
  | "linear_equations";

type AttemptEvent = {
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
  errorCode?: "denominator_mismatch" | "sign_error" | "distribution_error" | "careless";
};

type GapPrediction = {
  concept: Concept;
  confidence: number; // 0..1 (our prototype confidence, not “truth”)
  severity: "low" | "medium" | "high";
  rationale: string[];
  recommendedNext: { title: string; action: string }[];
};

function nowId() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

const CONCEPT_LABEL: Record<Concept, string> = {
  fractions_add_sub: "Fractions: add/subtract",
  fractions_mul_div: "Fractions: multiply/divide",
  negatives_signs: "Negatives & signs",
  algebra_simplify: "Algebra: simplify",
  linear_equations: "Linear equations",
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function computeGapPredictions(events: AttemptEvent[]): GapPrediction[] {
  // “Frontend-only, backend-mimicking” heuristic:
  // - Track per-concept mastery proxy from correctness + friction (time/hints)
  // - Detect repeated error signatures -> flags conceptual gap before it becomes a blocker
  const byConcept = new Map<Concept, AttemptEvent[]>();
  for (const e of events) {
    for (const c of e.conceptTags) {
      const arr = byConcept.get(c) ?? [];
      arr.push(e);
      byConcept.set(c, arr);
    }
  }

  const preds: GapPrediction[] = [];
  for (const [concept, arr] of byConcept.entries()) {
    const n = arr.length;
    if (n < 2) continue;

    const wrong = arr.filter((a) => !a.isCorrect);
    const wrongRate = wrong.length / n;

    const avgTime = arr.reduce((s, a) => s + a.timeSpentSec, 0) / n;
    const avgHints = arr.reduce((s, a) => s + a.hintsUsed, 0) / n;

    const errorCounts = new Map<string, number>();
    for (const w of wrong) {
      if (w.errorCode) errorCounts.set(w.errorCode, (errorCounts.get(w.errorCode) ?? 0) + 1);
    }
    const topError = [...errorCounts.entries()].sort((a, b) => b[1] - a[1])[0];

    // Confidence rises with repeated wrongs + repeated same error signature + friction.
    const repeatedSignatureBoost = topError ? Math.min(0.35, (topError[1] / n) * 0.6) : 0;
    const frictionBoost = clamp01((avgTime - 25) / 80) * 0.2 + clamp01((avgHints - 0.2) / 2) * 0.2;

    const confidence = clamp01(wrongRate * 0.75 + repeatedSignatureBoost + frictionBoost);

    // Severity thresholds tuned for demo readability.
    const severity: GapPrediction["severity"] =
      confidence > 0.72 ? "high" : confidence > 0.48 ? "medium" : "low";

    // Flag “before blockers”: medium+ even if last attempt correct but signature exists.
    if (severity === "low" && wrongRate < 0.34) continue;

    const rationale: string[] = [];
    rationale.push(`${wrong.length}/${n} recent attempts incorrect (${Math.round(wrongRate * 100)}%).`);
    if (topError) {
      const [code, count] = topError;
      const human =
        code === "denominator_mismatch"
          ? "Denominator mismatch (not finding common denominators)"
          : code === "sign_error"
          ? "Sign errors with negatives"
          : code === "distribution_error"
          ? "Distribution / bracket expansion mistakes"
          : "Careless arithmetic slips";
      rationale.push(`Repeated pattern detected: ${human} (${count}x).`);
    }
    if (avgHints >= 1) rationale.push(`High hint usage (avg ${avgHints.toFixed(1)}).`);
    if (avgTime >= 60) rationale.push(`Slow solve time (avg ${Math.round(avgTime)}s).`);

    const recommendedNext =
      concept === "fractions_add_sub"
        ? [
            { title: "Micro-lesson: common denominators", action: "Review in 2 minutes" },
            { title: "5 targeted drills", action: "Practice now" },
            { title: "One worked example", action: "See step-by-step" },
          ]
        : concept === "negatives_signs"
        ? [
            { title: "Rule card: sign flips", action: "Memorize + test" },
            { title: "Timed mini-quiz (90s)", action: "Practice now" },
            { title: "Explain-back prompt", action: "Teach it to Astra" },
          ]
        : concept === "algebra_simplify"
        ? [
            { title: "Like terms refresher", action: "Review in 3 minutes" },
            { title: "Simplify 6 expressions", action: "Practice now" },
            { title: "Common traps", action: "Quick checklist" },
          ]
        : [
            { title: "Targeted warm-up", action: "Practice now" },
            { title: "One concept recap", action: "Review" },
            { title: "Mixed review set", action: "Schedule later" },
          ];

    preds.push({ concept, confidence, severity, rationale, recommendedNext });
  }

  // Highest risk first
  return preds.sort((a, b) => b.confidence - a.confidence);
}

function seededDemoEvents(): AttemptEvent[] {
  const base = Date.now();
  return [
    {
      id: nowId(),
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
      id: nowId(),
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
      id: nowId(),
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
      id: nowId(),
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

export default function Page() {
  const [events, setEvents] = useState<AttemptEvent[]>(() => seededDemoEvents());
  const [mode, setMode] = useState<"student" | "coach">("student");

  const predictions = useMemo(() => computeGapPredictions(events), [events]);

  function addSimulatedAttempt(kind: "fractions" | "signs") {
    const ts = Date.now();
    if (kind === "fractions") {
      setEvents((prev) => [
        ...prev,
        {
          id: nowId(),
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
        },
      ]);
      return;
    }
    setEvents((prev) => [
      ...prev,
      {
        id: nowId(),
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
      },
    ]);
  }

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        {/* Hero (no header/nav, straight to feature) */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-7">
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-yellow-400/15 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  Learning Gap Predictor (Frontend-only Demo)
                </div>
                <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Detect conceptual gaps before they become blockers.
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  This prototype mimics backend event tracking + gap inference locally: it watches problem-solving
                  patterns, flags likely gaps early, and proposes the next best remediation steps.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <button
                    onClick={() => setMode("student")}
                    className={`rounded-lg px-3 py-2 text-xs transition ${
                      mode === "student" ? "bg-blue-600 text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    Student View
                  </button>
                  <button
                    onClick={() => setMode("coach")}
                    className={`rounded-lg px-3 py-2 text-xs transition ${
                      mode === "coach" ? "bg-blue-600 text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    Coach View
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addSimulatedAttempt("fractions")}
                    className="rounded-xl bg-white/5 px-4 py-2 text-xs text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
                  >
                    Simulate Fractions Mistake
                  </button>
                  <button
                    onClick={() => addSimulatedAttempt("signs")}
                    className="rounded-xl bg-white/5 px-4 py-2 text-xs text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
                  >
                    Simulate Sign Mistake
                  </button>
                </div>
              </div>
            </div>

            {/* Core feature UI */}
            <div className="grid gap-5 lg:grid-cols-3">
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white/90">Problem-solving timeline</h2>
                  <button
                    onClick={() => setEvents(seededDemoEvents())}
                    className="text-xs text-white/60 underline-offset-4 hover:text-white hover:underline"
                  >
                    Reset demo
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {events
                    .slice()
                    .sort((a, b) => b.ts - a.ts)
                    .slice(0, 8)
                    .map((e) => (
                      <div key={e.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm text-white/90">
                            <span className="font-medium">{e.problemId}</span>{" "}
                            <span className="text-white/60">•</span>{" "}
                            <span className="text-white/75">{e.prompt}</span>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ring-1 ${
                              e.isCorrect
                                ? "bg-emerald-400/10 text-emerald-200 ring-emerald-400/20"
                                : "bg-yellow-400/10 text-yellow-200 ring-yellow-400/20"
                            }`}
                          >
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
                    <div className="font-semibold text-white/85">Backend-mimic (local) telemetry</div>
                    <div className="mt-1">
                      Events captured: <span className="text-white/90">{events.length}</span> • Stored
                      locally (prototype) • Inference runs on every new attempt
                    </div>
                  </div>
                )}
              </section>

              <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-sm font-semibold text-white/90">Predicted learning gaps</h2>
                <p className="mt-1 text-xs text-white/65">
                  Flags conceptual gaps early using repeated error signatures + friction signals.
                </p>

                <div className="mt-4 space-y-3">
                  {predictions.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
                      No strong gaps detected yet. Keep practicing.
                    </div>
                  ) : (
                    predictions.slice(0, 3).map((p) => {
                      const pct = Math.round(p.confidence * 100);
                      const badge =
                        p.severity === "high"
                          ? "bg-yellow-400/15 text-yellow-200 ring-yellow-400/25"
                          : p.severity === "medium"
                          ? "bg-blue-600/15 text-blue-200 ring-blue-500/25"
                          : "bg-white/10 text-white/80 ring-white/15";
                      return (
                        <div key={p.concept} className="rounded-xl border border-white/10 bg-black/20 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-white/90">{CONCEPT_LABEL[p.concept]}</div>
                            <span className={`rounded-full px-2 py-1 text-xs ring-1 ${badge}`}>
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
                  <div className="font-semibold text-white/90">Why this helps growth</div>
                  <div className="mt-1">
                    Fewer “stuck” moments → less frustration → higher retention. Gaps get handled *before* the student
                    churns.
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}