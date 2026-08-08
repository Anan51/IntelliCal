"use client";

import { useEffect, useState } from "react";
import { applyReconcileOps, reconcileSync } from "@/lib/syncReconcile";
import type { CalEvent } from "@/lib/types";
import { useCalendarStore } from "@/store/calendarStore";
import { Badge, Button, Section } from "./ui";

type SyncStatus = {
  configured: boolean;
  message: string;
};

export default function SyncPanel() {
  const events = useCalendarStore((s) => s.events);
  const setEvents = useCalendarStore((s) => s.setEvents);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [lastOps, setLastOps] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sync/status")
      .then((r) => r.json())
      .then((data: SyncStatus) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({
            configured: false,
            message: "Google Calendar sync is not configured. Demo mode works without it.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function runMockSync() {
    // Simulate a remote Google event colliding with local state.
    const remote: CalEvent[] = events
      .filter((e) => e.externalId)
      .map((e) => ({ ...e, updatedAt: e.updatedAt }));

    const demoRemote: CalEvent = {
      id: "gcal-remote-1",
      personId: "you",
      title: "Club meeting (from Google)",
      start: "2026-09-29T16:00:00",
      end: "2026-09-29T17:00:00",
      kind: "external",
      source: "sync",
      externalId: "gcal-club-1",
      updatedAt: new Date().toISOString(),
      location: { raw: "Ackerman Union", building: "Ackerman Union" },
    };

    const ops = reconcileSync({
      local: events,
      remote: [...remote, demoRemote],
    });
    setEvents(applyReconcileOps(events, ops));
    setLastOps(ops.length);
  }

  return (
    <Section
      title="Calendar sync"
      subtitle="Two-way Google Calendar sync uses a dedicated IntelliCal secondary calendar. Without OAuth keys, everything else still works."
    >
      <div className="sync-status">
        {status == null ? (
          <p className="muted">Checking configuration…</p>
        ) : (
          <>
            <Badge tone={status.configured ? "good" : "warn"}>
              {status.configured ? "Configured" : "Not configured"}
            </Badge>
            <p>{status.message}</p>
          </>
        )}
      </div>

      <div className="sync-actions">
        <Button variant="secondary" onClick={runMockSync} disabled={status?.configured}>
          Run demo reconcile
        </Button>
        {lastOps > 0 ? (
          <p className="muted">Last reconcile produced {lastOps} operation(s).</p>
        ) : null}
      </div>
    </Section>
  );
}
