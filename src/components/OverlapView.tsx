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
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${dow} ${date}`;
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Find time with Alex</h1>
        <p className="mt-1.5 max-w-xl text-[13px] text-muted-foreground">
          Mint cells are hours you&apos;re both free. Soft preferences show as Busy here — labels
          stay private.
        </p>
      </div>

      <ModeToggle mode={mode} onChange={onModeChange} />

      <WeekCalendar
        events={sanitizeForFriendView(events)}
        overlapSlots={slots}
        showOverlap
        hidePreferenceLabels
      />

      <section>
        <h2 className="mb-2 text-[13px] font-medium">
          Shared free slots
          <span className="ml-2 tabular text-muted-foreground">{slots.length}</span>
        </h2>
        {slots.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            Nothing open in this mode. Try Max, or loosen a soft pref.
          </p>
        ) : (
          <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(grouped).flatMap(([dayISO, daySlots]) =>
              daySlots.map((s, idx) => (
                <li
                  key={`${dayISO}-${idx}`}
                  className="rounded-md border border-[rgba(62,207,142,0.25)] bg-[var(--green-dim)] px-3 py-2 text-[12px] text-[var(--green)]"
                >
                  <span className="font-medium">{formatDay(dayISO)}</span>
                  <span className="tabular text-emerald-200/90">
                    {" · "}
                    {s.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    {" – "}
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
