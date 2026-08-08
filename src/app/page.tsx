"use client";

import { useMemo, useState } from "react";
import { demoEvents } from "@/lib/demo-data";
import type { CalEvent } from "@/lib/types";
import { freeOverlapWeek } from "@/lib/overlap";
import { tightTransitions } from "@/lib/walkTimes";
import WeekCalendar from "@/components/WeekCalendar";
import OverlapView from "@/components/OverlapView";
import SyllabusPaste from "@/components/SyllabusPaste";
import WalkAlerts from "@/components/WalkAlerts";

type Tab = "week" | "overlap" | "walk";

export default function Home() {
  const [events, setEvents] = useState<CalEvent[]>(demoEvents);
  const [tab, setTab] = useState<Tab>("week");

  const overlapSlots = useMemo(
    () => freeOverlapWeek(events, "you", "alex"),
    [events]
  );
  const warnings = useMemo(() => tightTransitions(events, "you"), [events]);

  function handleParsed(parsed: CalEvent[]) {
    setEvents((prev) => {
      const withoutDupes = parsed.filter(
        (p) => !prev.some((e) => e.id === p.id)
      );
      return [...prev, ...withoutDupes];
    });
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>IntelliCal</h1>
        <p>when2meet, but it already knows your classes and how long it takes to walk across UCLA.</p>
      </header>

      <nav className="tab-bar">
        {(
          [
            ["week", "My Week"],
            ["overlap", "Friend Overlap"],
            ["walk", "Walk Alerts"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={`tab-btn${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "week" && (
        <>
          <div className="section-card">
            <h2>Your week</h2>
            <p className="subtitle">Demo UCLA schedule — CS 31, GE Cluster, gym blocks.</p>
            <WeekCalendar events={events} personId="you" />
          </div>
          <SyllabusPaste onParsed={handleParsed} />
        </>
      )}

      {tab === "overlap" && <OverlapView events={events} slots={overlapSlots} />}

      {tab === "walk" && <WalkAlerts warnings={warnings} />}
    </main>
  );
}
