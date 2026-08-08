"use client";

import { useMemo } from "react";
import type { CalEvent, EventKind } from "@/lib/types";
import { assertNever } from "@/lib/types";
import { formatISODate, formatTimeLabel, parseISODate } from "@/lib/time";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function kindTone(kind: EventKind): "exam" | "due" | "class" | "other" {
  switch (kind) {
    case "exam":
      return "exam";
    case "due_date":
      return "due";
    case "lecture":
    case "discussion":
      return "class";
    case "preference":
    case "external":
    case "other":
      return "other";
    default:
      return assertNever(kind);
  }
}

type DayCell = {
  iso: string;
  inMonth: boolean;
  events: CalEvent[];
};

function buildMonth(year: number, monthIndex: number, events: CalEvent[]): DayCell[] {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: DayCell[] = [];

  for (let i = 0; i < startPad; i++) {
    const d = new Date(year, monthIndex, -startPad + i + 1);
    const iso = formatISODate(d);
    cells.push({ iso, inMonth: false, events: [] });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = formatISODate(new Date(year, monthIndex, day));
    cells.push({
      iso,
      inMonth: true,
      events: events.filter((e) => e.start.startsWith(iso)),
    });
  }

  while (cells.length % 7 !== 0) {
    const last = parseISODate(cells[cells.length - 1].iso);
    last.setDate(last.getDate() + 1);
    cells.push({ iso: formatISODate(last), inMonth: false, events: [] });
  }

  return cells;
}

type Props = {
  year: number;
  events: CalEvent[];
  personId?: string;
  onSelectDay?: (iso: string) => void;
  onEventClick?: (event: CalEvent) => void;
};

export default function YearCalendar({
  year,
  events,
  personId,
  onSelectDay,
  onEventClick,
}: Props) {
  const mine = useMemo(
    () => (personId ? events.filter((e) => e.personId === personId) : events),
    [events, personId]
  );

  const keyDates = useMemo(
    () =>
      mine
        .filter((e) => e.kind === "exam" || e.kind === "due_date")
        .sort((a, b) => a.start.localeCompare(b.start)),
    [mine]
  );

  const months = useMemo(
    () => MONTHS.map((_, idx) => buildMonth(year, idx, mine)),
    [year, mine]
  );

  return (
    <div className="year-layout">
      <div className="year-grid">
        {months.map((cells, monthIndex) => (
          <section key={MONTHS[monthIndex]} className="year-month" aria-label={MONTHS[monthIndex]}>
            <h3>{MONTHS[monthIndex]}</h3>
            <div className="year-dow">
              {DOW.map((d, i) => (
                <span key={`${d}-${i}`}>{d}</span>
              ))}
            </div>
            <div className="year-days">
              {cells.map((cell) => {
                const hasExam = cell.events.some((e) => e.kind === "exam");
                const hasDue = cell.events.some((e) => e.kind === "due_date");
                const hasClass = cell.events.some(
                  (e) => e.kind === "lecture" || e.kind === "discussion"
                );
                const dayNum = Number(cell.iso.slice(8, 10));
                return (
                  <button
                    key={cell.iso + String(cell.inMonth)}
                    type="button"
                    className={[
                      "year-day",
                      cell.inMonth ? "" : "muted",
                      hasExam ? "has-exam" : "",
                      hasDue ? "has-due" : "",
                      hasClass ? "has-class" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onSelectDay?.(cell.iso)}
                    title={
                      cell.events.length
                        ? cell.events.map((e) => e.title).join(", ")
                        : cell.iso
                    }
                  >
                    <span>{dayNum}</span>
                    {(hasExam || hasDue || hasClass) && (
                      <span className="year-dots" aria-hidden="true">
                        {hasExam ? <i className="dot exam" /> : null}
                        {hasDue ? <i className="dot due" /> : null}
                        {hasClass && !hasExam && !hasDue ? <i className="dot class" /> : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="year-agenda panel">
        <div className="panel-head">
          <div>
            <p className="kicker">Key dates</p>
            <h2>Exams & deadlines</h2>
            <p className="subtitle">Jump the year to midterms, finals, and due dates.</p>
          </div>
        </div>
        {keyDates.length === 0 ? (
          <p className="empty-state">No exams or deadlines in {year} yet. Import a syllabus to populate.</p>
        ) : (
          <ul className="agenda-list">
            {keyDates.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  className={`agenda-item tone-${kindTone(e.kind)}`}
                  onClick={() => onEventClick?.(e)}
                >
                  <span className="agenda-date">
                    {parseISODate(e.start.slice(0, 10)).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="agenda-body">
                    <strong>{e.title}</strong>
                    <span>
                      {formatTimeLabel(e.start)}
                      {e.kind === "due_date" ? " due" : ` – ${formatTimeLabel(e.end)}`}
                    </span>
                  </span>
                  <span className="badge badge-accent">{e.kind === "exam" ? "exam" : "due"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
