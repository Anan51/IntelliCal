"use client";

import type { CSSProperties } from "react";
import type { CalEvent } from "@/lib/types";
import { DEMO_WEEK_START } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const HOUR_START = 8;
const HOUR_END = 21;
const HOUR_HEIGHT = 48;

/** GCal Modern solid fills — white text, AA on these blues/reds */
const KIND_COLORS: Record<CalEvent["kind"], string> = {
  lecture: "var(--lecture)",
  discussion: "var(--discussion)",
  exam: "var(--exam)",
  busy: "var(--busy)",
  other: "var(--other)",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

type BlockTone = "class" | "soft" | "hard" | "gcal";

function getTone(event: CalEvent): BlockTone {
  if (event.source === "gcal" && !event.preferenceId) return "gcal";
  if (!event.preferenceId) return "class";
  return (event.strength ?? "hard") === "soft" ? "soft" : "hard";
}

function getWeekDays(weekStart: string) {
  const [y, m, d] = weekStart.split("-").map(Number);
  return DAY_NAMES.map((label, i) => {
    const dt = new Date(y, m - 1, d + i);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const dateNum = String(dt.getDate());
    return { iso, label, dateNum };
  });
}

function formatHourLabel(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function displayTitle(event: CalEvent, hidePrefLabels: boolean): string {
  if (hidePrefLabels && event.preferenceId) return "Busy";
  return event.title;
}

function gridPosition(event: CalEvent): CSSProperties {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  const top = ((startMin - HOUR_START * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 2, 18);
  return { top, height };
}

/**
 * Event chip — Google Calendar week-view language:
 * solid fill + white title for classes; muted solid for busy/gcal;
 * Notion-soft for preferences (readable fg on tinted bg, left rail).
 */
function EventChip({
  event,
  hidePrefLabels,
  compact,
  onClick,
  style,
  className,
}: {
  event: CalEvent;
  hidePrefLabels: boolean;
  compact?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
}) {
  const tone = getTone(event);
  const title = displayTitle(event, hidePrefLabels);
  const clickable = Boolean(onClick);

  const visual: CSSProperties =
    tone === "soft"
      ? {
          background: "var(--pref-soft-bg)",
          color: "var(--pref-soft-fg)",
          boxShadow: "inset 3px 0 0 var(--pref-soft-rail)",
        }
      : tone === "hard"
        ? {
            background: "var(--pref-hard-bg)",
            color: "var(--pref-hard-fg)",
            boxShadow: "inset 3px 0 0 var(--pref-hard-rail)",
          }
        : tone === "gcal"
          ? {
              background: "var(--busy)",
              color: "#fafafa",
              boxShadow: "inset 3px 0 0 rgba(255,255,255,0.35)",
            }
          : {
              background: KIND_COLORS[event.kind],
              color: "#ffffff",
              boxShadow: "inset 3px 0 0 rgba(0,0,0,0.25)",
            };

  const showStrength = !hidePrefLabels && (tone === "soft" || tone === "hard");

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "overflow-hidden rounded text-left",
        clickable ? "cursor-pointer hover:brightness-110" : "cursor-default",
        className
      )}
      style={{ ...visual, ...style }}
      title={title}
      aria-label={`${title}${showStrength ? `, ${tone} preference` : ""}`}
    >
      <div className={cn(compact ? "px-1.5 py-0.5" : "px-2 py-1.5")}>
        <div
          className={cn(
            "truncate font-medium",
            compact ? "text-[11px] leading-tight" : "text-[13px] leading-snug"
          )}
        >
          {title}
        </div>
        {!compact && (
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] tabular opacity-90">
            <span>
              {formatClock(event.start)}–{formatClock(event.end)}
            </span>
            {event.building && !hidePrefLabels && (
              <span className="truncate opacity-80">{event.building}</span>
            )}
            {showStrength && (
              <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide opacity-70">
                {tone}
              </span>
            )}
          </div>
        )}
        {compact && event.building && !hidePrefLabels && (
          <div className="truncate text-[10px] tabular opacity-85">{event.building}</div>
        )}
      </div>
    </button>
  );
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
      {/* Desktop week grid — Notion hairlines, GCal chips */}
      <div
        className="hidden md:block"
        role="grid"
        aria-label="Week calendar, Monday through Friday, 8 AM to 9 PM"
      >
        <div
          className="grid"
          style={{ gridTemplateColumns: "56px repeat(5, minmax(0, 1fr))" }}
        >
          <div />
          {days.map((d) => (
            <div key={d.iso} className="pb-2 text-center" role="columnheader">
              <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                {d.label}
              </div>
              <div className="text-[18px] font-medium tabular tracking-tight text-[var(--text)]">
                {d.dateNum}
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
                className="relative"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2 right-2 tabular text-[11px] text-[var(--text-tertiary)]">
                  {formatHourLabel(h)}
                </span>
              </div>
            ))}
          </div>

          {days.map((d, colIdx) => (
            <div
              key={d.iso}
              className="relative border-l border-[var(--hairline)]"
              style={{
                gridColumn: colIdx + 2,
                gridRow: 2,
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
                      ? `${d.label} ${formatHourLabel(h)}. Protect this time.`
                      : undefined
                  }
                  className={cn(
                    "border-t border-[var(--hairline)]",
                    isOverlapCell(d.iso, h) && "overlap-cell",
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

              {eventsForDay(d.iso).map((ev) => (
                <EventChip
                  key={ev.id}
                  event={ev}
                  hidePrefLabels={hidePreferenceLabels}
                  compact
                  onClick={
                    onEventClick && ev.preferenceId ? () => onEventClick(ev) : undefined
                  }
                  className="absolute left-[2px] right-[2px] z-[2]"
                  style={gridPosition(ev)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile agenda — GCal schedule list */}
      <div className="md:hidden" aria-label="Week schedule">
        {days.map((d) => {
          const dayEvents = eventsForDay(d.iso).sort(
            (a, b) => +new Date(a.start) - +new Date(b.start)
          );
          return (
            <section key={d.iso} className="border-t border-[var(--hairline)] py-3 first:border-t-0 first:pt-0">
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-[13px] font-medium text-[var(--text)]">
                  {d.label}{" "}
                  <span className="tabular text-[var(--text-secondary)]">{d.dateNum}</span>
                </h3>
                {onEmptySlotClick && (
                  <button
                    type="button"
                    className="text-[12px] text-[var(--primary)] hover:underline"
                    onClick={() => onEmptySlotClick(d.iso, 15)}
                  >
                    Protect time
                  </button>
                )}
              </div>
              {dayEvents.length === 0 ? (
                <p className="text-[12px] text-[var(--text-tertiary)]">No events</p>
              ) : (
                <ul className="space-y-1.5">
                  {dayEvents.map((ev) => (
                    <li key={ev.id}>
                      <EventChip
                        event={ev}
                        hidePrefLabels={hidePreferenceLabels}
                        onClick={
                          onEventClick && ev.preferenceId
                            ? () => onEventClick(ev)
                            : undefined
                        }
                        className="w-full"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
