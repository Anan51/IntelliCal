"use client";

import { formatTimeLabel } from "@/lib/time";
import { allTransitionCues } from "@/lib/walkTimes";
import { YOU_ID, useCalendarStore } from "@/store/calendarStore";
import { Badge, Empty, Section } from "./ui";

export default function WalkAlerts() {
  const events = useCalendarStore((s) => s.events);
  const people = useCalendarStore((s) => s.people);
  const you = people.find((p) => p.id === YOU_ID);

  const cues = allTransitionCues(
    events,
    YOU_ID,
    you?.travelMode ?? "walk",
    you?.homeLat != null && you.homeLng != null
      ? { lat: you.homeLat, lng: you.homeLng, raw: you.homeAddress }
      : undefined
  );
  const tight = cues.filter((c) => c.tight);

  return (
    <div className="stack">
      <Section
        title="Campus travel"
        subtitle="Leave-by cues use building walk times plus a 5-minute buffer."
      >
        {cues.length === 0 ? (
          <Empty>No transitions that need travel time.</Empty>
        ) : (
          <ul className="walk-list">
            {cues.map((c) => (
              <li key={`${c.fromEventId}-${c.toEventId}`} className={`walk-card${c.tight ? " tight" : ""}`}>
                <div className="walk-card-top">
                  <h3>
                    {c.fromLabel} → {c.toLabel}
                  </h3>
                  {c.tight ? <Badge tone="warn">Tight</Badge> : <Badge tone="good">OK</Badge>}
                </div>
                <p>
                  Leave by <strong>{formatTimeLabel(c.leaveBy)}</strong>
                  {c.approximate ? " (estimate)" : ""}.
                </p>
                <div className="stats">
                  <span className="walk-stat">
                    Gap: <strong>{c.gapMin} min</strong>
                  </span>
                  <span className="walk-stat">
                    Travel: <strong>{c.travelMin} min</strong>
                  </span>
                  <span className="walk-stat">
                    Need: <strong>{c.travelMin + 5} min</strong>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Tight transitions (${tight.length})`}>
        {tight.length === 0 ? (
          <Empty>No tight walks in your current schedule.</Empty>
        ) : (
          <p className="muted">
            {tight.length} transition{tight.length === 1 ? "" : "s"} where the gap is shorter than
            travel time plus buffer.
          </p>
        )}
      </Section>
    </div>
  );
}
