"use client";

import type { CSSProperties } from "react";
import type { CalEvent } from "@/lib/types";
import { DEMO_WEEK_START } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

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

function formatHour(h: number): string {
  if (h === 12) return "12 PM";
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
}

function eventStyle(event: CalEvent, friendBusyLabel: boolean): CSSProperties {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  const top = ((startMin - HOUR_START * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 2, 18);

  const soft = (event.strength ?? "hard") === "soft";
  const hardPref = Boolean(event.preferenceId) && !soft;

  if (soft) {
    return {
      top,
      height,
      backgroundColor: "var(--pref-soft)",
      color: "#bfdbfe",
    };
  }
  if (hardPref) {
    return {
      top,
      height,
      backgroundColor: "var(--pref-hard)",
      color: "#e2e8f0",
    };
  }
  if (friendBusyLabel && event.preferenceId) {
    return {
      top,
      height,
      background: KIND_COLORS.busy,
      color: "white",
    };
  }
  return {
    top,
    height,
    background: KIND_COLORS[event.kind] ?? "var(--other)",
    color: "white",
  };
}

function displayTitle(event: CalEvent, hidePrefLabels: boolean): string {
  if (hidePrefLabels && event.preferenceId) return "Busy";
  return event.title;
}

type Props = {
  events: CalEvent[];
  personId?: string;
  weekStart?: string;
  overlapSlots?: { dayISO: string; start: Date; end: Date }[];
  showOverlap?: boolean;
  showPreferences?: boolean;
  /** Friend overlap: don't leak preference labels */
  hidePreferenceLabels?: boolean;
  onEmptySlotClick?: (dayISO: string, hour: number) => void;
};

export default function WeekCalendar({
  events,
  personId,
  weekStart = DEMO_WEEK_START,
  overlapSlots,
  showOverlap = false,
  showPreferences = true,
  hidePreferenceLabels = false,
  onEmptySlotClick,
}: Props) {
  const days = getWeekDays(weekStart);
  const filtered = (personId ? events.filter((e) => e.personId === personId) : events).filter(
    (e) => showPreferences || !e.preferenceId
  );
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  function isOverlapCell(dayISO: string, hour: number): boolean {
    if (!showOverlap || !overlapSlots) return false;
    const cellStart = new Date(`${dayISO}T00:00:00`);
    cellStart.setHours(hour, 0, 0, 0);
    const cellEnd = new Date(cellStart.getTime() + 60 * 60_000);
    return overlapSlots.some(
      (s) => s.dayISO === dayISO && s.start < cellEnd && cellStart < s.end
    );
  }

  function eventsForDay(dayISO: string) {
    return filtered.filter((e) => e.start.startsWith(dayISO));
  }

  const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

  return (
    <div>
      {/* Desktop grid */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-[var(--surface-2)]">
        <div
          className="grid min-w-[680px]"
          style={{ gridTemplateColumns: "52px repeat(5, minmax(120px, 1fr))" }}
          role="grid"
          aria-label="Week calendar Monday through Friday, 8 AM to 9 PM"
        >
          <div className="border-b border-border bg-[var(--surface)] p-2.5" role="columnheader" />
          {days.map((d) => (
            <div
              key={d.iso}
              className="border-b border-border bg-[var(--surface)] p-2.5 text-center text-xs font-semibold"
              role="columnheader"
            >
              {d.label}
              <span className="mt-0.5 block font-normal text-muted-foreground">{d.date}</span>
            </div>
          ))}

          <div
            style={{
              gridColumn: 1,
              gridRow: `2 / span ${hours.length}`,
              position: "relative",
            }}
            role="rowheader"
          >
            {hours.map((h) => (
              <div
                key={h}
                className="border-b border-r border-border/50 pr-1.5 text-right text-[0.7rem] leading-[48px] text-muted-foreground"
                style={{ height: HOUR_HEIGHT }}
              >
                {formatHour(h)}
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
              role="gridcell"
              aria-label={d.label}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  role={onEmptySlotClick ? "button" : undefined}
                  tabIndex={onEmptySlotClick ? 0 : undefined}
                  aria-label={
                    onEmptySlotClick
                      ? `Empty slot ${d.label} ${formatHour(h)}. Protect this time.`
                      : undefined
                  }
                  className={cn(
                    "border-b border-r border-border/50",
                    isOverlapCell(d.iso, h) && "bg-[var(--green-dim)]",
                    onEmptySlotClick && "cal-cell-clickable"
                  )}
                  style={{ height: HOUR_HEIGHT }}
                  onClick={
                    onEmptySlotClick
                      ? () => onEmptySlotClick(d.iso, h)
                      : undefined
                  }
                  onKeyDown={
                    onEmptySlotClick
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onEmptySlotClick(d.iso, h);
                          }
                        }
                      : undefined
                  }
                />
              ))}
              {eventsForDay(d.iso).map((ev) => {
                const soft = (ev.strength ?? "hard") === "soft";
                const hardPref = Boolean(ev.preferenceId) && !soft;
                return (
                  <div
                    key={ev.id}
                    className={cn(
                      "absolute left-[3px] right-[3px] z-[2] overflow-hidden rounded-md px-1.5 py-0.5 text-[0.68rem] leading-snug",
                      soft && "cal-event-soft pref-soft-pattern",
                      hardPref && "cal-event-hard-pref",
                      !soft && !hardPref && "border-l-[3px] border-white/40"
                    )}
                    style={eventStyle(ev, hidePreferenceLabels)}
                    title={`${displayTitle(ev, hidePreferenceLabels)}${
                      soft ? " (soft)" : hardPref ? " (hard)" : ""
                    }${ev.building && !hidePreferenceLabels ? ` @ ${ev.building}` : ""}`}
                    aria-label={`${displayTitle(ev, hidePreferenceLabels)}${
                      soft ? ", soft preference" : hardPref ? ", hard preference" : ""
                    }`}
                  >
                    <div className="truncate font-semibold">
                      {displayTitle(ev, hidePreferenceLabels)}
                    </div>
                    <div className="text-[0.62rem] opacity-85">
                      {new Date(ev.start).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {ev.building && !hidePreferenceLabels ? ` · ${ev.building}` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile agenda */}
      <div className="md:hidden space-y-4" aria-label="Week agenda">
        {days.map((d) => {
          const dayEvents = eventsForDay(d.iso).sort(
            (a, b) => +new Date(a.start) - +new Date(b.start)
          );
          return (
            <div key={d.iso} className="rounded-xl border border-border bg-[var(--surface)] p-3">
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">
                  {d.label}{" "}
                  <span className="font-normal text-muted-foreground">{d.date}</span>
                </h3>
                {onEmptySlotClick && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => onEmptySlotClick(d.iso, 15)}
                  >
                    Protect a slot
                  </button>
                )}
              </div>
              {dayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing scheduled</p>
              ) : (
                <ul className="space-y-2">
                  {dayEvents.map((ev) => {
                    const soft = (ev.strength ?? "hard") === "soft";
                    const hardPref = Boolean(ev.preferenceId) && !soft;
                    return (
                      <li
                        key={ev.id}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          soft && "cal-event-soft pref-soft-pattern",
                          hardPref && "cal-event-hard-pref",
                          !soft && !hardPref && "text-white"
                        )}
                        style={
                          !soft && !hardPref
                            ? { background: KIND_COLORS[ev.kind] }
                            : undefined
                        }
                      >
                        <div className="font-medium">
                          {displayTitle(ev, hidePreferenceLabels)}
                          {soft ? " · soft" : hardPref ? " · hard" : ""}
                        </div>
                        <div className="text-xs opacity-90">
                          {new Date(ev.start).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {" – "}
                          {new Date(ev.end).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {ev.building && !hidePreferenceLabels ? ` · ${ev.building}` : ""}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {showOverlap &&
                overlapSlots
                  ?.filter((s) => s.dayISO === d.iso)
                  .map((s, i) => (
                    <div
                      key={`ov-${i}`}
                      className="mt-2 rounded-md border border-[rgba(52,211,153,0.35)] bg-[var(--green-dim)] px-2 py-1 text-xs text-[var(--green)]"
                    >
                      Both free{" "}
                      {s.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      {" – "}
                      {s.end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </div>
                  ))}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(["lecture", "discussion", "exam", "busy", "other"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-sm"
              style={{ background: KIND_COLORS[k] }}
              aria-hidden
            />
            {k}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm border border-dashed border-[rgba(96,165,250,0.65)] bg-[var(--pref-soft)]"
            aria-hidden
          />
          soft pref
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm bg-[var(--pref-hard)]"
            aria-hidden
          />
          hard pref
        </span>
        {showOverlap && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-sm border border-[var(--green)] bg-[var(--green-dim)]"
              aria-hidden
            />
            both free
          </span>
        )}
      </div>
    </div>
  );
}
