// frontend/src/components/gap-predictor/DemoShell.tsx
"use client";

import React, { useMemo } from "react";
import type { AttemptEvent, GapPrediction, ViewMode } from "@/lib/gap-predictor/types";
import { HeroSection } from "@/components/gap-predictor/HeroSection";
import { EventTimeline } from "@/components/gap-predictor/EventTimeline";
import { GapPanel } from "@/components/gap-predictor/GapPanel";

type Props = {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  events: AttemptEvent[];
  predictions: GapPrediction[];
  onReset: () => void;
  onSimulateFractions: () => void;
  onSimulateSigns: () => void;

  // Optional “backend-mimic” signals (safe defaults)
  isIngesting?: boolean;
  lastIngestedAt?: number;
};

export function DemoShell({
  mode,
  setMode,
  events,
  predictions,
  onReset,
  onSimulateFractions,
  onSimulateSigns,
  isIngesting,
  lastIngestedAt,
}: Props) {
  const coachStats = useMemo(() => computeCoachStats(events), [events]);

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-7">
          {/* ambient blobs */}
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-yellow-400/15 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6">
            <HeroSection
              mode={mode}
              setMode={setMode}
              onSimulateFractions={onSimulateFractions}
              onSimulateSigns={onSimulateSigns}
              onReset={onReset}
            />

            {/* Live system status row */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.45)]" />
                <div className="text-xs text-white/75">
                  <span className="text-white/90 font-semibold">Demo system</span>{" "}
                  <span className="text-white/50">•</span>{" "}
                  Local telemetry + inference
                </div>

                {isIngesting ? (
                  <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-blue-600/15 px-3 py-1 text-[11px] text-blue-200 ring-1 ring-blue-500/25">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                    ingesting…
                  </span>
                ) : (
                  <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/70 ring-1 ring-white/10">
                    <span className="h-2 w-2 rounded-full bg-yellow-400/80" />
                    ready
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60">
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                  events: <span className="text-white/85">{events.length}</span>
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                  gaps: <span className="text-white/85">{predictions.length}</span>
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                  last ingest:{" "}
                  <span className="text-white/85">
                    {lastIngestedAt ? timeAgo(lastIngestedAt) : "—"}
                  </span>
                </span>
              </div>
            </div>

            {/* Coach-only diagnostics (THIS is what makes views feel different) */}
            {mode === "coach" && (
              <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 lg:grid-cols-3">
                <CoachCard title="Mastery snapshot">
                  <div className="space-y-3">
                    {coachStats.mastery.map((m) => (
                      <div key={m.label}>
                        <div className="flex items-center justify-between text-xs text-white/70">
                          <span className="text-white/85">{m.label}</span>
                          <span>{m.score}/100</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-black/30 ring-1 ring-white/10">
                          <div
                            className="h-2 rounded-full bg-blue-600/70"
                            style={{ width: `${m.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CoachCard>

                <CoachCard title="Top error signatures">
                  {coachStats.topErrors.length === 0 ? (
                    <div className="text-xs text-white/65">No error signatures yet.</div>
                  ) : (
                    <ul className="space-y-2">
                      {coachStats.topErrors.map((e) => (
                        <li
                          key={e.code}
                          className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-xs ring-1 ring-white/10"
                        >
                          <span className="text-white/80">{humanizeError(e.code)}</span>
                          <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-[11px] text-yellow-200 ring-1 ring-yellow-400/25">
                            {e.count}x
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CoachCard>

                <CoachCard title="Intervention timing">
                  <div className="space-y-2 text-xs text-white/70">
                    <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10">
                      <div className="text-white/85 font-semibold">Now</div>
                      <div className="mt-1">
                        Trigger a 2–3 minute micro-lesson when a signature repeats twice in the last 5 attempts.
                      </div>
                    </div>
                    <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10">
                      <div className="text-white/85 font-semibold">Later</div>
                      <div className="mt-1">
                        Schedule mixed review if confidence drops but student is still progressing.
                      </div>
                    </div>
                  </div>
                </CoachCard>
              </section>
            )}

            {/* Main feature grid */}
            <div className="grid gap-5 lg:grid-cols-3">
              <EventTimeline events={events} mode={mode} onReset={onReset} />
              <GapPanel predictions={predictions} />
            </div>
          </div>
        </div>

        {/* Subtle bottom hint (not a footer) */}
        <div className="mt-5 text-center text-[11px] text-white/45">
          Tip: Click “Simulate … Mistake” a few times to watch gap confidence rise like a real system.
        </div>
      </div>
    </main>
  );
}

function CoachCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-sm font-semibold text-white/90">{title}</div>
      {children}
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function computeCoachStats(events: AttemptEvent[]) {
  // Simple “coach lens”: mastery proxy + signature counts
  const wrong = events.filter((e) => !e.isCorrect);
  const total = Math.max(1, events.length);

  const byConcept = new Map<string, { total: number; wrong: number }>();
  for (const e of events) {
    for (const c of e.conceptTags) {
      const cur = byConcept.get(c) ?? { total: 0, wrong: 0 };
      cur.total += 1;
      if (!e.isCorrect) cur.wrong += 1;
      byConcept.set(c, cur);
    }
  }

  const mastery = [...byConcept.entries()]
    .map(([concept, v]) => {
      const wrongRate = v.wrong / Math.max(1, v.total);
      const score = Math.round(100 - wrongRate * 85); // heuristic
      return { label: conceptLabel(concept), score: clamp(score, 0, 100) };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);

  const errorCounts = new Map<string, number>();
  for (const w of wrong) {
    if (w.errorCode) errorCounts.set(w.errorCode, (errorCounts.get(w.errorCode) ?? 0) + 1);
  }
  const topErrors = [...errorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([code, count]) => ({ code, count }));

  return { mastery, topErrors, wrongRate: wrong.length / total };
}

function conceptLabel(concept: string) {
  switch (concept) {
    case "fractions_add_sub":
      return "Fractions: add/subtract";
    case "fractions_mul_div":
      return "Fractions: multiply/divide";
    case "negatives_signs":
      return "Negatives & signs";
    case "algebra_simplify":
      return "Algebra: simplify";
    case "linear_equations":
      return "Linear equations";
    default:
      return concept;
  }
}

function humanizeError(code: string) {
  switch (code) {
    case "denominator_mismatch":
      return "Common denominator mistakes";
    case "sign_error":
      return "Negative sign mistakes";
    case "distribution_error":
      return "Distribution / brackets";
    case "careless":
      return "Careless arithmetic slips";
    default:
      return code;
  }
}

function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x));
}