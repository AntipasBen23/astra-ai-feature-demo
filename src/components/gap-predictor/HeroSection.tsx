// frontend/src/components/gap-predictor/HeroSection.tsx
"use client";

import React from "react";
import type { ViewMode } from "@/lib/gap-predictor/types";

type Props = {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  onSimulateFractions: () => void;
  onSimulateSigns: () => void;
  onReset: () => void;
};

export function HeroSection({
  mode,
  setMode,
  onSimulateFractions,
  onSimulateSigns,
  onReset,
}: Props) {
  return (
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
          Watches problem-solving patterns (errors, time, hints), detects repeated conceptual signatures,
          and recommends targeted remediation.
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