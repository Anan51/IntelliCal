import type { Interval } from "./types";

export function interval(startMs: number, endMs: number): Interval {
  return { startMs, endMs };
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.startMs < b.endMs && b.startMs < a.endMs;
}

export function mergeIntervals(input: Interval[]): Interval[] {
  if (input.length === 0) return [];
  const sorted = [...input].sort((a, b) => a.startMs - b.startMs);
  const out: Interval[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = out[out.length - 1];
    if (cur.startMs <= last.endMs) {
      last.endMs = Math.max(last.endMs, cur.endMs);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

/** Subtract busy intervals from a window; returns free intervals. */
export function subtractIntervals(window: Interval, busy: Interval[]): Interval[] {
  let free: Interval[] = [window];
  const merged = mergeIntervals(busy);
  for (const b of merged) {
    const next: Interval[] = [];
    for (const f of free) {
      if (!overlaps(f, b)) {
        next.push(f);
        continue;
      }
      if (b.startMs > f.startMs) {
        next.push({ startMs: f.startMs, endMs: Math.min(b.startMs, f.endMs) });
      }
      if (b.endMs < f.endMs) {
        next.push({ startMs: Math.max(b.endMs, f.startMs), endMs: f.endMs });
      }
    }
    free = next.filter((x) => x.endMs - x.startMs > 0);
  }
  return free;
}

export function clampInterval(i: Interval, window: Interval): Interval | null {
  const startMs = Math.max(i.startMs, window.startMs);
  const endMs = Math.min(i.endMs, window.endMs);
  if (endMs <= startMs) return null;
  return { startMs, endMs };
}
