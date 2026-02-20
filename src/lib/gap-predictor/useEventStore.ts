// frontend/src/lib/gap-predictor/useEventStore.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AttemptEvent } from "./types";
import { seededDemoEvents } from "./demoData";
import { withLatency } from "./latency";

type StoreState = {
  events: AttemptEvent[];
  isIngesting: boolean; // mimics “backend ingest in progress”
  lastIngestedAt?: number;
};

const STORAGE_KEY = "astra_gap_predictor_events_v1";

/**
 * Frontend-only “backend mimic”:
 * - Ingest events with latency/jitter
 * - Persist locally (so it survives refresh)
 * - Expose a clean API like a real client SDK would
 */
export function useEventStore(opts?: { persist?: boolean; seed?: boolean }) {
  const persist = opts?.persist ?? true;
  const seed = opts?.seed ?? true;

  const [state, setState] = useState<StoreState>(() => {
    const fromStorage = persist ? readFromStorage() : null;
    const initial = fromStorage ?? (seed ? seededDemoEvents() : []);
    return { events: initial, isIngesting: false };
  });

  // Persist any changes (mimics backend durability)
  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
    } catch {
      // Ignore storage errors (quota/private mode)
    }
  }, [persist, state.events]);

  const sortedEvents = useMemo(() => {
    // Keep a stable ordering for inference/UI
    return [...state.events].sort((a, b) => a.ts - b.ts);
  }, [state.events]);

  const ingest = useCallback(
    async (event: AttemptEvent) => {
      setState((s) => ({ ...s, isIngesting: true }));

      await withLatency(
        () => {
          setState((s) => ({
            events: [...s.events, event],
            isIngesting: false,
            lastIngestedAt: Date.now(),
          }));
        },
        { minMs: 140, maxMs: 520 }
      );
    },
    []
  );

  const reset = useCallback(() => {
    const next = seed ? seededDemoEvents() : [];
    setState({ events: next, isIngesting: false, lastIngestedAt: Date.now() });

    if (persist) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [persist, seed]);

  const clear = useCallback(() => {
    setState({ events: [], isIngesting: false, lastIngestedAt: Date.now() });
    if (persist) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [persist]);

  return {
    events: sortedEvents,
    isIngesting: state.isIngesting,
    lastIngestedAt: state.lastIngestedAt,
    ingest,
    reset,
    clear,
  };
}

function readFromStorage(): AttemptEvent[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    // Shallow shape check
    return parsed.filter(isAttemptEvent);
  } catch {
    return null;
  }
}

function isAttemptEvent(x: any): x is AttemptEvent {
  return (
    x &&
    typeof x === "object" &&
    typeof x.id === "string" &&
    typeof x.ts === "number" &&
    typeof x.problemId === "string" &&
    typeof x.prompt === "string" &&
    Array.isArray(x.conceptTags) &&
    typeof x.studentAnswer === "string" &&
    typeof x.correctAnswer === "string" &&
    typeof x.isCorrect === "boolean" &&
    typeof x.timeSpentSec === "number" &&
    typeof x.hintsUsed === "number"
  );
}