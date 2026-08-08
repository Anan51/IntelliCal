import { describe, expect, it } from "vitest";
import { applyReconcileOps, reconcileSync } from "@/lib/syncReconcile";
import { eventContentHash } from "@/lib/hash";
import type { CalEvent } from "@/lib/types";

function evt(partial: Partial<CalEvent> & Pick<CalEvent, "id" | "title" | "start" | "end">): CalEvent {
  const base: CalEvent = {
    personId: "you",
    kind: "other",
    source: "manual",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...partial,
  };
  return { ...base, contentHash: eventContentHash(base) };
}

describe("reconcileSync", () => {
  it("imports fresh remote events", () => {
    const remote = [
      evt({
        id: "r1",
        title: "Remote",
        start: "2026-09-28T16:00:00",
        end: "2026-09-28T17:00:00",
        externalId: "g1",
        source: "sync",
        kind: "external",
      }),
    ];
    const ops = reconcileSync({ local: [], remote });
    expect(ops.some((o) => o.op === "create" && o.remote?.externalId === "g1")).toBe(true);
    const next = applyReconcileOps([], ops);
    expect(next).toHaveLength(1);
  });

  it("prefers newer remote on conflict", () => {
    const local = evt({
      id: "l1",
      title: "Local title",
      start: "2026-09-28T16:00:00",
      end: "2026-09-28T17:00:00",
      externalId: "g1",
      updatedAt: "2026-09-01T00:00:00.000Z",
    });
    const remote = evt({
      id: "r1",
      title: "Remote title",
      start: "2026-09-28T16:00:00",
      end: "2026-09-28T17:00:00",
      externalId: "g1",
      source: "sync",
      kind: "external",
      updatedAt: "2026-09-02T00:00:00.000Z",
    });
    const ops = reconcileSync({ local: [local], remote: [remote] });
    expect(ops).toEqual([
      expect.objectContaining({ op: "update", winner: "remote" }),
    ]);
  });

  it("deletes local when remote removed", () => {
    const local = evt({
      id: "l1",
      title: "Gone remote",
      start: "2026-09-28T16:00:00",
      end: "2026-09-28T17:00:00",
      externalId: "g1",
    });
    const ops = reconcileSync({ local: [local], remote: [] });
    expect(ops.some((o) => o.op === "delete" && o.side === "local")).toBe(true);
  });

  it("does not duplicate on re-import", () => {
    const shared = evt({
      id: "l1",
      title: "Same",
      start: "2026-09-28T16:00:00",
      end: "2026-09-28T17:00:00",
      externalId: "g1",
      source: "sync",
      kind: "external",
    });
    const ops = reconcileSync({ local: [shared], remote: [{ ...shared, id: "r1" }] });
    expect(ops.filter((o) => o.op === "create")).toHaveLength(0);
    expect(applyReconcileOps([shared], ops)).toHaveLength(1);
  });
});
