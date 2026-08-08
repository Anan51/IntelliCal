"use client";

import type { Slot } from "@/lib/overlap";
import type { CalEvent, OverlapMode } from "@/lib/types";
import WeekCalendar from "./WeekCalendar";
import ModeToggle from "./ModeToggle";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function formatDay(dayISO: string): string {
  const d = new Date(`${dayISO}T12:00:00`);
  const dow =
    DAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1] ??
    d.toLocaleDateString("en-US", { weekday: "short" });
  return `${dow} ${d.getDate()}`;
}

function sanitizeForFriendView(events: CalEvent[]): CalEvent[] {
  return events.map((e) => {
    if (!e.preferenceId) return e;
    return { ...e, title: "Busy", building: undefined };
  });
}

type Props = {
  events: CalEvent[];
  slots: Slot[];
  mode: OverlapMode;
  onModeChange: (mode: OverlapMode) => void;
};

export default function OverlapView({ events, slots, mode, onModeChange }: Props) {
  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    (acc[s.dayISO] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">Find time</h1>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
            Shared free hours with Alex. Soft preferences count as busy in Balanced.
          </p>
        </div>
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>

      <WeekCalendar
        events={sanitizeForFriendView(events)}
        overlapSlots={slots}
        showOverlap
        hidePreferenceLabels
      />

      <section>
        <h2 className="mb-2 text-[12px] font-medium text-[var(--text-secondary)]">
          {slots.length} shared slots
        </h2>
        {slots.length === 0 ? (
          <p className="text-[13px] text-[var(--text-tertiary)]">
            No overlap in this mode. Try Max or loosen a preference.
          </p>
        ) : (
          <ul className="columns-1 gap-2 sm:columns-2 lg:columns-3">
            {Object.entries(grouped).flatMap(([dayISO, daySlots]) =>
              daySlots.map((s, idx) => (
                <li
                  key={`${dayISO}-${idx}`}
                  className="mb-1.5 break-inside-avoid text-[13px] tabular text-[var(--green)]"
                >
                  {formatDay(dayISO)}{" "}
                  <span className="text-emerald-200/90">
                    {s.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    –
                    {s.end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
