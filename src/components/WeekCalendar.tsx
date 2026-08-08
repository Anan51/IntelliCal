"use client";

import type { CSSProperties } from "react";
import type { CalEvent, EventKind, FreeSlot, TransitionCue } from "@/lib/types";
import { assertNever } from "@/lib/types";
import { DEMO_WEEK_START } from "@/lib/constants";
import { eachDayISO, formatTimeLabel, minutesSinceMidnight } from "@/lib/time";

const HOUR_START = 8;
const HOUR_END = 21;
const HOUR_HEIGHT = 48;

function kindColor(kind: EventKind): string {
  switch (kind) {
    case "lecture":
      return "var(--lecture)";
    case "discussion":
      return "var(--discussion)";
    case "exam":
      return "var(--exam)";
    case "due_date":
      return "var(--due)";
    case "preference":
      return "var(--preference)";
    case "external":
      return "var(--external)";
    case "other":
      return "var(--other)";
    default:
      return assertNever(kind);
  }
}

function eventStyle(event: CalEvent): CSSProperties {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startMin = minutesSinceMidnight(start);
  const endMin = minutesSinceMidnight(end);
  const top = ((startMin - HOUR_START * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 2, 18);
  return {
    top,
    height,
    background: kindColor(event.kind),
  };
}

type Props = {
  events: CalEvent[];
  personId?: string;
  weekStart?: string;
  overlapSlots?: FreeSlot[] | { dayISO: string; start: Date; end: Date }[];
  showOverlap?: boolean;
  cues?: TransitionCue[];
  onEventClick?: (event: CalEvent) => void;
};

export default function WeekCalendar({
  events,
  personId,
  weekStart = DEMO_WEEK_START,
  overlapSlots,
  showOverlap = false,
  cues = [],
  onEventClick,
}: Props) {
  const days = eachDayISO(weekStart, 5).map((iso) => {
    const dt = new Date(`${iso}T12:00:00`);
    return {
      iso,
      label: dt.toLocaleDateString("en-US", { weekday: "short" }),
      date: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
  const filtered = personId ? events.filter((e) => e.personId === personId) : events;
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
  const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;
  const leaveByFor = new Map(cues.map((c) => [c.fromEventId, c]));

  function isOverlapCell(dayISO: string, hour: number): boolean {
    if (!showOverlap || !overlapSlots) return false;
    const cellStart = new Date(`${dayISO}T00:00:00`);
    cellStart.setHours(hour, 0, 0, 0);
    const cellEnd = new Date(cellStart.getTime() + 60 * 60_000);
    return overlapSlots.some((s) => {
      const start = s.start instanceof Date ? s.start : new Date(s.start);
      const end = s.end instanceof Date ? s.end : new Date(s.end);
      return s.dayISO === dayISO && start < cellEnd && cellStart < end;
    });
  }

  const legendKinds: EventKind[] = [
    "lecture",
    "discussion",
    "exam",
    "preference",
    "due_date",
    "external",
    "other",
  ];

  return (
    <div>
      <div className="cal-wrap">
        <div className="cal-grid">
          <div className="cal-header gutter" />
          {days.map((d) => (
            <div key={d.iso} className="cal-header">
              {d.label}
              <span className="date">{d.date}</span>
            </div>
          ))}

          <div
            style={{
              gridColumn: 1,
              gridRow: `2 / span ${hours.length}`,
              position: "relative",
            }}
          >
            {hours.map((h) => (
              <div key={h} className="cal-time" style={{ height: HOUR_HEIGHT }}>
                {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
              </div>
            ))}
          </div>

          {days.map((d, colIdx) => (
            <div
              key={d.iso}
              style={{
                gridColumn: colIdx + 2,
                gridRow: 2,
                position: "relative",
                height: totalHeight,
              }}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className={`cal-cell${isOverlapCell(d.iso, h) ? " overlap-free" : ""}`}
                  style={{ height: HOUR_HEIGHT }}
                />
              ))}
              {filtered
                .filter((e) => e.start.startsWith(d.iso))
                .map((ev) => {
                  const cue = leaveByFor.get(ev.id);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className={`cal-event source-${ev.source}`}
                      style={eventStyle(ev)}
                      title={`${ev.title}${ev.location?.building ? ` @ ${ev.location.building}` : ""}`}
                      onClick={() => onEventClick?.(ev)}
                    >
                      <div className="ev-title">{ev.title}</div>
                      <div className="ev-meta">
                        {formatTimeLabel(ev.start)}
                        {ev.location?.building ? ` · ${ev.location.building}` : ""}
                      </div>
                      {cue?.tight ? (
                        <div className="ev-cue warn">Leave by {formatTimeLabel(cue.leaveBy)}</div>
                      ) : cue ? (
                        <div className="ev-cue">Leave by {formatTimeLabel(cue.leaveBy)}</div>
                      ) : null}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      <div className="cal-legend">
        {legendKinds.map((k) => (
          <span key={k} className="legend-item">
            <span className="legend-dot" style={{ background: kindColor(k) }} />
            {k.replace("_", " ")}
          </span>
        ))}
        {showOverlap && (
          <span className="legend-item">
            <span
              className="legend-dot"
              style={{ background: "var(--green-dim)", border: "1px solid var(--green)" }}
            />
            both free
          </span>
        )}
      </div>
    </div>
  );
}
