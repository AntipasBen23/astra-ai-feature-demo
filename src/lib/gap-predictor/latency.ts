// frontend/src/lib/gap-predictor/latency.ts

/**
 * Tiny helper to mimic backend latency + jitter.
 * Use it to make UI updates feel like real network + inference work.
 */
export async function withLatency<T>(
  work: () => T | Promise<T>,
  opts?: { minMs?: number; maxMs?: number }
): Promise<T> {
  const minMs = opts?.minMs ?? 120;
  const maxMs = opts?.maxMs ?? 420;

  const delay = Math.max(minMs, Math.min(maxMs, randomInt(minMs, maxMs)));
  await sleep(delay);
  return await work();
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}