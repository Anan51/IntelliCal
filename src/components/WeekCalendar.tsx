"use client";

import type { CSSProperties } from "react";
import type { CalEvent } from "@/lib/types";
import { DEMO_WEEK_START } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const HOUR_START = 8;
const HOUR_END = 21;
const HOUR_HEIGHT = 52;

const KIND_COLORS: Record<CalEvent["kind"], string> = {
  lecture: "var(--lecture)",
  discussion: "var(--discussion)",
  exam: "var(--exam)",
  busy: "var(--busy)",
  other: "var(--other)",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function getWeekDays(weekStart: string) {
  const [y, m, d] = weekStart.split("-").map(Number);
  return DAY_NAMES.map((label, i) => {
    const dt = new Date(y, m - 1, d + i);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const date = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { iso, label, date };
  });
}

function formatHour(h: number): string {
  if (h === 12) return "12";
  if (h > 12) return String(h - 12);
  return String(h);
}

function formatHourSuffix(h: number): string {
  return h >= 12 ? "PM" : "AM";
}

function displayTitle(event: CalEvent, hidePrefLabels: boolean): string {
  if (hidePrefLabels && event.preferenceId) return "Busy";
  return event.title;
}

function eventStyle(event: CalEvent): CSSProperties {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  const top = ((startMin - HOUR_START * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 2, 20);

  const soft = (event.strength ?? "hard") === "soft";
  const hardPref = Boolean(event.preferenceId) && !soft;

  if (soft) {
    return { top, height, color: "#c5d4ff" };
  }
  if (hardPref) {
    return {
      top,
      height,
      backgroundColor: "var(--pref-hard-fill)",
      color: "#c8d0e0",
    };
  }
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
  showPreferences?: boolean;
  hidePreferenceLabels?: boolean;
  onEmptySlotClick?: (dayISO: string, hour: number) => void;
  onEventClick?: (event: CalEvent) => void;
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
  onEventClick,
}: Props) {
  const days = getWeekDays(weekStart);
  const filtered = (personId ? events.filter((e) => e.personId === personId) : events).filter(
    (e) => showPreferences || !e.preferenceId
  );
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
  const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

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

  return (
    <div>
      {/* Desktop — Cron-like dense week grid */}
      <div className="hidden overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--surface)] md:block">
        <div
          className="grid"
          style={{ gridTemplateColumns: "56px repeat(5, minmax(0, 1fr))" }}
          role="grid"
          aria-label="Week calendar Monday through Friday, 8 AM to 9 PM"
        >
          <div className="border-b border-[var(--hairline)]" />
          {days.map((d) => (
            <div
              key={d.iso}
              className="border-b border-l border-[var(--hairline)] px-2 py-2.5 text-center"
              role="columnheader"
            >
              <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                {d.label}
              </div>
              <div className="mt-0.5 text-[13px] font-medium tabular text-foreground">
                {d.date}
              </div>
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
              <div
                key={h}
                className="flex items-start justify-end border-b border-[var(--hairline)] pr-2 pt-1"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="tabular text-[10px] text-muted-foreground/80">
                  {formatHour(h)}
                  <span className="ml-0.5 text-[9px] opacity-70">{formatHourSuffix(h)}</span>
                </span>
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
                      ? `${d.label} ${formatHour(h)} ${formatHourSuffix(h)}. Protect this time.`
                      : undefined
                  }
                  className={cn(
                    "border-b border-l border-[var(--hairline)]",
                    isOverlapCell(d.iso, h) && "overlap-glow",
                    onEmptySlotClick && "cal-cell-hit cursor-pointer"
                  )}
                  style={{ height: HOUR_HEIGHT }}
                  onClick={onEmptySlotClick ? () => onEmptySlotClick(d.iso, h) : undefined}
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
                const clickable = Boolean(onEventClick && ev.preferenceId);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    disabled={!clickable}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (clickable) onEventClick?.(ev);
                    }}
                    className={cn(
                      "absolute left-1 right-1 z-[2] overflow-hidden rounded px-1.5 py-1 text-left text-[11px] leading-tight transition-opacity",
                      soft && "pref-hatch border border-dashed border-[var(--pref-soft-border)]",
                      hardPref && "border border-white/10",
                      !soft && !hardPref && "shadow-[inset_3px_0_0_rgba(255,255,255,0.25)]",
                      clickable ? "cursor-pointer hover:opacity-90" : "cursor-default"
                    )}
                    style={eventStyle(ev)}
                    title={`${displayTitle(ev, hidePreferenceLabels)}${
                      soft ? " · soft" : hardPref ? " · hard" : ""
                    }`}
                    aria-label={`${displayTitle(ev, hidePreferenceLabels)}${
                      soft ? ", soft preference" : hardPref ? ", hard preference" : ""
                    }`}
                  >
                    <div className="truncate font-medium">
                      {displayTitle(ev, hidePreferenceLabels)}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] opacity-80 tabular">
                      {new Date(ev.start).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {ev.building && !hidePreferenceLabels ? ` · ${ev.building}` : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile agenda */}
      <div className="space-y-3 md:hidden" aria-label="Week agenda">
        {days.map((d) => {
          const dayEvents = eventsForDay(d.iso).sort(
            (a, b) => +new Date(a.start) - +new Date(b.start)
          );
          return (
            <section key={d.iso} className="border-b border-[var(--hairline)] pb-3">
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-[13px] font-medium">
                  {d.label}{" "}
                  <span className="font-normal text-muted-foreground">{d.date}</span>
                </h3>
                {onEmptySlotClick && (
                  <button
                    type="button"
                    className="text-[11px] text-primary hover:underline"
                    onClick={() => onEmptySlotClick(d.iso, 15)}
                  >
                    Protect hour
                  </button>
                )}
              </div>
              {dayEvents.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">Free</p>
              ) : (
                <ul className="space-y-1.5">
                  {dayEvents.map((ev) => {
                    const soft = (ev.strength ?? "hard") === "soft";
                    const hardPref = Boolean(ev.preferenceId) && !soft;
                    return (
                      <li key={ev.id}>
                        <button
                          type="button"
                          disabled={!onEventClick || !ev.preferenceId}
                          onClick={() => onEventClick?.(ev)}
                          className={cn(
                            "w-full rounded-md px-2.5 py-2 text-left text-[12px]",
                            soft && "pref-hatch border border-dashed border-[var(--pref-soft-border)]",
                            hardPref && "bg-[var(--pref-hard-fill)]",
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
                          <div className="mt-0.5 tabular opacity-85">
                            {new Date(ev.start).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                            {" – "}
                            {new Date(ev.end).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[2px]" style={{ background: KIND_COLORS.lecture }} />
          Class
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] border border-dashed border-[var(--pref-soft-border)] bg-[var(--pref-soft-fill)]" />
          Soft pref
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] bg-[var(--pref-hard-fill)]" />
          Hard pref
        </span>
        {showOverlap && (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-[var(--green-dim)] ring-1 ring-[var(--green)]/40" />
            Both free
          </span>
        )}
      </div>
    </div>
  );
}
