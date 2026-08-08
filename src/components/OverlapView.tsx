"use client";

import type { Slot } from "@/lib/overlap";
import type { CalEvent, OverlapMode } from "@/lib/types";
import WeekCalendar from "./WeekCalendar";
import ModeToggle from "./ModeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function formatDay(dayISO: string): string {
  const d = new Date(`${dayISO}T12:00:00`);
  const dow =
    DAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1] ??
    d.toLocaleDateString("en-US", { weekday: "short" });
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${dow} ${date}`;
}

/** Soft prefs show as generic "Busy" on friend overlap — don't leak labels. */
function sanitizeForFriendView(events: CalEvent[]): CalEvent[] {
  return events.map((e) => {
    if (!e.preferenceId) return e;
    return {
      ...e,
      title: "Busy",
      building: undefined,
    };
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

  const displayEvents = sanitizeForFriendView(events);

  return (
    <div className="space-y-4">
      <Card className="border-border bg-[var(--surface)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">You × Alex</CardTitle>
          <CardDescription>
            Mint cells = both free (9 AM – 9 PM, 1-hour blocks). Soft prefs count as busy in
            Balanced — try Max to ignore them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModeToggle mode={mode} onChange={onModeChange} />
          <WeekCalendar
            events={displayEvents}
            overlapSlots={slots}
            showOverlap
            hidePreferenceLabels
          />
        </CardContent>
      </Card>

      <Card className="border-border bg-[var(--surface)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Shared free slots ({slots.length})</CardTitle>
          <CardDescription>
            No when2meet painting — your classes and prefs already shape this.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No shared free slots in the demo window for this mode.
            </p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(grouped).map(([dayISO, daySlots]) =>
                daySlots.map((s, idx) => (
                  <li
                    key={`${dayISO}-${idx}`}
                    className="rounded-lg border border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.12)] px-3.5 py-2.5 text-sm text-emerald-300"
                  >
                    <span className="font-semibold text-[var(--green)]">
                      {formatDay(dayISO)}
                    </span>
                    {" · "}
                    {s.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    {" – "}
                    {s.end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </li>
                ))
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
