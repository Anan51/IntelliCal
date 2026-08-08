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

type BlockTone = "class" | "soft" | "hard";

function getTone(event: CalEvent): BlockTone {
  if (!event.preferenceId) return "class";
  return (event.strength ?? "hard") === "soft" ? "soft" : "hard";
}

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
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 3, 22);
  return { top, height };
}

/** Shared visual language for calendar blocks — Cron/Notion restraint */
function blockClasses(tone: BlockTone, kind: CalEvent["kind"]): string {
  if (tone === "soft") {
    return cn(
      "cal-block cal-block-soft",
      "bg-[rgba(91,140,255,0.1)] text-[#b8c9f0]",
      "border border-[rgba(91,140,255,0.22)]"
    );
  }
  if (tone === "hard") {
    return cn(
      "cal-block cal-block-hard",
      "bg-[rgba(255,255,255,0.04)] text-[#aeb8cc]",
      "border border-[rgba(255,255,255,0.08)]"
    );
  }
  return cn("cal-block cal-block-class text-white border border-transparent");
}

function blockInlineStyle(tone: BlockTone, kind: CalEvent["kind"]): CSSProperties {
  if (tone === "class") {
    return {
      background: KIND_COLORS[kind],
      boxShadow: `inset 2px 0 0 rgba(255,255,255,0.35)`,
    };
  }
  if (tone === "soft") {
    return { boxShadow: `inset 2px 0 0 rgba(91,140,255,0.7)` };
  }
  return { boxShadow: `inset 2px 0 0 rgba(148,163,184,0.55)` };
}

function EventBlock({
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
  const meta = [
    formatClock(event.start),
    !compact ? `– ${formatClock(event.end)}` : null,
    event.building && !hidePrefLabels ? event.building : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const strengthHint =
    !hidePrefLabels && tone !== "class" ? (tone === "soft" ? "Soft" : "Hard") : null;

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "overflow-hidden rounded-[3px] text-left transition-[filter,background-color]",
        blockClasses(tone, event.kind),
        clickable ? "cursor-pointer hover:brightness-110" : "cursor-default",
        className
      )}
      style={{ ...blockInlineStyle(tone, event.kind), ...style }}
      title={[title, strengthHint, meta].filter(Boolean).join(" · ")}
      aria-label={[title, strengthHint ? `${strengthHint} preference` : null, meta]
        .filter(Boolean)
        .join(", ")}
    >
      <div className={cn("min-w-0", compact ? "px-1.5 py-1" : "px-2.5 py-2")}>
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              "truncate font-medium tracking-[-0.01em]",
              compact ? "text-[11px] leading-tight" : "text-[13px] leading-snug"
            )}
          >
            {title}
          </div>
          {strengthHint && (
            <span
              className={cn(
                "shrink-0 uppercase tracking-[0.08em] text-[9px] font-medium opacity-55",
                compact && "mt-0.5"
              )}
            >
              {strengthHint}
            </span>
          )}
        </div>
        <div
          className={cn(
            "truncate tabular opacity-70",
            compact ? "mt-0.5 text-[10px] leading-none" : "mt-0.5 text-[11px]"
          )}
        >
          {meta}
        </div>
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
      {/* Desktop grid */}
      <div className="hidden overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--surface)] md:block">
        <div
          className="grid"
          style={{ gridTemplateColumns: "52px repeat(5, minmax(0, 1fr))" }}
          role="grid"
          aria-label="Week calendar Monday through Friday, 8 AM to 9 PM"
        >
          <div className="border-b border-[var(--hairline)]" />
          {days.map((d) => (
            <div
              key={d.iso}
              className="border-b border-l border-[var(--hairline)] px-2 py-2 text-center"
              role="columnheader"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {d.label}
              </div>
              <div className="mt-0.5 text-[12px] font-medium tabular text-foreground/90">
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
                <span className="tabular text-[10px] text-muted-foreground/75">
                  {formatHour(h)}
                  <span className="ml-0.5 text-[8px] opacity-60">{formatHourSuffix(h)}</span>
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

              {eventsForDay(d.iso).map((ev) => (
                <EventBlock
                  key={ev.id}
                  event={ev}
                  hidePrefLabels={hidePreferenceLabels}
                  compact
                  onClick={
                    onEventClick && ev.preferenceId ? () => onEventClick(ev) : undefined
                  }
                  className="absolute left-0.5 right-0.5 z-[2]"
                  style={gridPosition(ev)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile — timeline list, not day-cards */}
      <div className="md:hidden" aria-label="Week agenda">
        {days.map((d) => {
          const dayEvents = eventsForDay(d.iso).sort(
            (a, b) => +new Date(a.start) - +new Date(b.start)
          );
          return (
            <section key={d.iso} className="border-b border-[var(--hairline)] py-4 first:pt-0">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="text-[12px] font-medium tracking-[-0.01em]">
                  <span className="text-foreground">{d.label}</span>
                  <span className="ml-1.5 text-muted-foreground">{d.date}</span>
                </h3>
                {onEmptySlotClick && (
                  <button
                    type="button"
                    className="text-[11px] text-muted-foreground transition-colors hover:text-primary"
                    onClick={() => onEmptySlotClick(d.iso, 15)}
                  >
                    Protect a time
                  </button>
                )}
              </div>

              {dayEvents.length === 0 ? (
                <p className="pl-[3.25rem] text-[12px] text-muted-foreground/70">Nothing scheduled</p>
              ) : (
                <ul className="space-y-2">
                  {dayEvents.map((ev) => {
                    const start = new Date(ev.start);
                    const startLabel = start.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                    return (
                      <li key={ev.id} className="grid grid-cols-[3rem_1fr] gap-2">
                        <div className="pt-2 text-right tabular text-[11px] text-muted-foreground">
                          {startLabel}
                        </div>
                        <EventBlock
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
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <LegendPip tone="class" label="Class" />
        <LegendPip tone="soft" label="Soft preference" />
        <LegendPip tone="hard" label="Hard preference" />
        {showOverlap && (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-[rgba(62,207,142,0.25)]" aria-hidden />
            Both free
          </span>
        )}
      </div>
    </div>
  );
}

function LegendPip({ tone, label }: { tone: BlockTone; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "size-2 rounded-[2px]",
          tone === "class" && "bg-[var(--lecture)]",
          tone === "soft" && "bg-[rgba(91,140,255,0.35)] ring-1 ring-[rgba(91,140,255,0.5)]",
          tone === "hard" && "bg-[rgba(255,255,255,0.12)] ring-1 ring-white/15"
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}
