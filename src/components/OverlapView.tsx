import type { Slot } from "@/lib/overlap";
import WeekCalendar from "./WeekCalendar";
import type { CalEvent } from "@/lib/types";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function formatDay(dayISO: string): string {
  const d = new Date(`${dayISO}T12:00:00`);
  const dow = DAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1] ?? d.toLocaleDateString("en-US", { weekday: "short" });
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${dow} ${date}`;
}

type Props = {
  events: CalEvent[];
  slots: Slot[];
};

export default function OverlapView({ events, slots }: Props) {
  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    (acc[s.dayISO] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="section-card" style={{ padding: 16, marginBottom: 16 }}>
        <p className="subtitle" style={{ margin: "0 0 12px" }}>
          Green = you and Alex are both free (9 AM – 9 PM, 1-hour blocks). Mon/Wed afternoons should light up.
        </p>
        <WeekCalendar
          events={events}
          overlapSlots={slots}
          showOverlap
        />
      </div>

      <div className="section-card">
        <h2>Shared free slots ({slots.length})</h2>
        <p className="subtitle">Tap a slot when planning hangouts — no when2meet painting required.</p>
        {slots.length === 0 ? (
          <p className="empty-state">No shared free slots in the demo window.</p>
        ) : (
          <ul className="overlap-list">
            {Object.entries(grouped).map(([dayISO, daySlots]) =>
              daySlots.map((s, idx) => (
                <li key={`${dayISO}-${idx}`}>
                  <span className="day-label">{formatDay(dayISO)}</span>
                  {" · "}
                  {s.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  {" – "}
                  {s.end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
