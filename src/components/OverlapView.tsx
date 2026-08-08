"use client";

import { freeOverlapWeek, topHangoutSuggestions } from "@/lib/overlap";
import { formatDayLabel, formatTimeLabel } from "@/lib/time";
import { ALEX_ID, YOU_ID, useCalendarStore } from "@/store/calendarStore";
import WeekCalendar from "./WeekCalendar";
import { Badge, Button, Empty, Section } from "./ui";

export default function OverlapView() {
  const events = useCalendarStore((s) => s.events);
  const weekStartISO = useCalendarStore((s) => s.weekStartISO);
  const prefsAsFree = useCalendarStore((s) => s.prefsAsFreeForOverlap);
  const setPrefsAsFree = useCalendarStore((s) => s.setPrefsAsFreeForOverlap);

  const slots = freeOverlapWeek(
    events,
    YOU_ID,
    ALEX_ID,
    weekStartISO,
    5,
    9,
    21,
    60,
    prefsAsFree
  );
  const suggestions = topHangoutSuggestions(
    slots.map((s) => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
      dayISO: s.dayISO,
      durationMin: s.durationMin,
    })),
    3
  );

  const grouped = slots.reduce<Record<string, typeof slots>>((acc, s) => {
    (acc[s.dayISO] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="stack">
      <Section
        title="Availability overlap"
        subtitle="Shared free time with Alex. Preference blocks count as busy unless you toggle them free."
        actions={
          <Button
            variant={prefsAsFree ? "primary" : "secondary"}
            onClick={() => setPrefsAsFree(!prefsAsFree)}
          >
            {prefsAsFree ? "Prefs count as free" : "Prefs count as busy"}
          </Button>
        }
      >
        <WeekCalendar
          events={events}
          weekStart={weekStartISO}
          overlapSlots={slots}
          showOverlap
        />
      </Section>

      <Section title="Top hangout times" subtitle="Longest shared free windows this week.">
        {suggestions.length === 0 ? (
          <Empty>No shared free slots in the demo window.</Empty>
        ) : (
          <ol className="suggest-list">
            {suggestions.map((s, i) => (
              <li key={`${s.dayISO}-${i}`}>
                <Badge tone="good">#{i + 1}</Badge>{" "}
                <strong>{formatDayLabel(s.dayISO)}</strong>{" "}
                {formatTimeLabel(s.start)} – {formatTimeLabel(s.end)}{" "}
                <span className="muted">({s.durationMin} min)</span>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section title={`All shared slots (${slots.length})`}>
        {slots.length === 0 ? (
          <Empty>No shared free slots.</Empty>
        ) : (
          <ul className="overlap-list">
            {Object.entries(grouped).map(([dayISO, daySlots]) =>
              daySlots.map((s, idx) => (
                <li key={`${dayISO}-${idx}`}>
                  <span className="day-label">{formatDayLabel(dayISO)}</span>
                  {" · "}
                  {s.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  {" – "}
                  {s.end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </li>
              ))
            )}
          </ul>
        )}
      </Section>
    </div>
  );
}
