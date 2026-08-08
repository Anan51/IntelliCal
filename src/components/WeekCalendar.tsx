import type { CSSProperties } from "react";
import type { CalEvent } from "@/lib/types";
import { DEMO_WEEK_START } from "@/lib/demo-data";

const HOUR_START = 8;
const HOUR_END = 21;
const HOUR_HEIGHT = 48;

const KIND_COLORS: Record<CalEvent["kind"], string> = {
  lecture: "var(--lecture)",
  discussion: "var(--discussion)",
  exam: "var(--exam)",
  busy: "var(--busy)",
  other: "var(--other)",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function getWeekDays(weekStart: string): { iso: string; label: string; date: string }[] {
  const [y, m, d] = weekStart.split("-").map(Number);
  return DAY_NAMES.map((label, i) => {
    const dt = new Date(y, m - 1, d + i);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const date = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { iso, label, date };
  });
}

function eventStyle(event: CalEvent): CSSProperties {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  const top = ((startMin - HOUR_START * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 2, 18);
  return {
    top,
    height,
    background: KIND_COLORS[event.kind] ?? "var(--other)",
    color: "white",
  };
}

type Props = {
  events: CalEvent[];
  personId?: string;
  weekStart?: string;
  overlapSlots?: { dayISO: string; start: Date; end: Date }[];
  showOverlap?: boolean;
};

export default function WeekCalendar({
  events,
  personId,
  weekStart = DEMO_WEEK_START,
  overlapSlots,
  showOverlap = false,
}: Props) {
  const days = getWeekDays(weekStart);
  const filtered = personId ? events.filter((e) => e.personId === personId) : events;
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  function isOverlapCell(dayISO: string, hour: number): boolean {
    if (!showOverlap || !overlapSlots) return false;
    const cellStart = new Date(`${dayISO}T00:00:00`);
    cellStart.setHours(hour, 0, 0, 0);
    const cellEnd = new Date(cellStart.getTime() + 60 * 60_000);
    return overlapSlots.some(
      (s) =>
        s.dayISO === dayISO &&
        s.start < cellEnd &&
        cellStart < s.end
    );
  }

  function eventsForDay(dayISO: string) {
    return filtered.filter((e) => e.start.startsWith(dayISO));
  }

  const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

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
              {eventsForDay(d.iso).map((ev) => (
                <div
                  key={ev.id}
                  className="cal-event"
                  style={eventStyle(ev)}
                  title={`${ev.title} ${ev.building ? `@ ${ev.building}` : ""}`}
                >
                  <div className="ev-title">{ev.title}</div>
                  <div className="ev-meta">
                    {new Date(ev.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    {ev.building ? ` · ${ev.building}` : ""}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="cal-legend">
        {(["lecture", "discussion", "exam", "busy", "other"] as const).map((k) => (
          <span key={k} className="legend-item">
            <span className="legend-dot" style={{ background: KIND_COLORS[k] }} />
            {k}
          </span>
        ))}
        {showOverlap && (
          <span className="legend-item">
            <span className="legend-dot" style={{ background: "var(--green-dim)", border: "1px solid var(--green)" }} />
            both free
          </span>
        )}
      </div>
    </div>
  );
}
