import type { CalEvent } from "./types";

/** Stable content hash for sync reconciliation (not cryptographic). */
export function eventContentHash(event: Pick<CalEvent, "title" | "start" | "end" | "kind" | "location">): string {
  const loc = event.location?.raw ?? "";
  return `${event.title}|${event.start}|${event.end}|${event.kind}|${loc}`;
}
