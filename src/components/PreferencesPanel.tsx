"use client";

import { useState } from "react";
import { newId } from "@/lib/id";
import type { DayOfWeek, Preference } from "@/lib/types";
import { YOU_ID, useCalendarStore } from "@/store/calendarStore";
import { Badge, Button, Empty, Section } from "./ui";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function windowsSummary(pref: Preference): string {
  return pref.windows
    .map((w) => {
      const sh = Math.floor(w.startMin / 60);
      const eh = Math.floor(w.endMin / 60);
      return `${DAY_LABELS[w.day]} ${sh}:00–${eh}:00`;
    })
    .join(", ");
}

export default function PreferencesPanel() {
  const preferences = useCalendarStore((s) => s.preferences);
  const upsertPreference = useCalendarStore((s) => s.upsertPreference);
  const removePreference = useCalendarStore((s) => s.removePreference);
  const rearrange = useCalendarStore((s) => s.rearrange);
  const arrangeMeta = useCalendarStore((s) => s.arrangeMeta);

  const [label, setLabel] = useState("Gym");
  const [targetPerWeek, setTargetPerWeek] = useState(3);
  const [durationMin, setDurationMin] = useState(60);
  const [priority, setPriority] = useState<1 | 2 | 3>(1);
  const [days, setDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]);
  const [startHour, setStartHour] = useState(17);
  const [endHour, setEndHour] = useState(20);

  function toggleDay(d: DayOfWeek) {
    setDays((prev) =>
      prev.includes(d) ? (prev.filter((x) => x !== d) as DayOfWeek[]) : [...prev, d]
    );
  }

  function addPreference() {
    if (!label.trim() || days.length === 0) return;
    const pref: Preference = {
      id: newId("pref"),
      personId: YOU_ID,
      label: label.trim(),
      targetPerWeek,
      durationMin,
      priority,
      windows: days
        .slice()
        .sort((a, b) => a - b)
        .map((day) => ({
          day,
          startMin: startHour * 60,
          endMin: endHour * 60,
        })),
    };
    upsertPreference(pref);
    rearrange();
  }

  return (
    <Section
      title="Schedule preferences"
      subtitle="Gym, relaxation, and social blocks are placed into free windows. Editing a block pins it."
      actions={
        <Button variant="secondary" onClick={rearrange}>
          Re-arrange now
        </Button>
      }
    >
      {arrangeMeta.length > 0 && (
        <div className="callout warn">
          {arrangeMeta.map((u) => (
            <p key={u.preferenceId}>
              Could only place <strong>{u.placed}/{u.target}</strong> {u.label} blocks this week.
            </p>
          ))}
        </div>
      )}

      <div className="pref-list">
        {preferences.length === 0 ? (
          <Empty>No preferences yet.</Empty>
        ) : (
          preferences.map((p) => (
            <article key={p.id} className="pref-card">
              <div className="pref-card-top">
                <h3>{p.label}</h3>
                <Badge tone="accent">P{p.priority}</Badge>
              </div>
              <p>
                {p.targetPerWeek}× / week · {p.durationMin} min
              </p>
              <p className="muted">{windowsSummary(p)}</p>
              <div className="pref-card-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    upsertPreference(p);
                    rearrange();
                  }}
                >
                  Place
                </Button>
                <Button variant="danger" onClick={() => removePreference(p.id)}>
                  Remove
                </Button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="pref-form">
        <h3>Add preference</h3>
        <div className="form-grid">
          <label>
            Label
            <input value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label>
            Times / week
            <input
              type="number"
              min={1}
              max={7}
              value={targetPerWeek}
              onChange={(e) => setTargetPerWeek(Number(e.target.value))}
            />
          </label>
          <label>
            Duration (min)
            <input
              type="number"
              min={15}
              step={15}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            />
          </label>
          <label>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
            >
              <option value={1}>1 — highest</option>
              <option value={2}>2</option>
              <option value={3}>3 — lowest</option>
            </select>
          </label>
          <label>
            Window start hour
            <input
              type="number"
              min={6}
              max={22}
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
            />
          </label>
          <label>
            Window end hour
            <input
              type="number"
              min={7}
              max={23}
              value={endHour}
              onChange={(e) => setEndHour(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="day-toggles">
          {DAY_LABELS.map((labelDay, idx) => (
            <button
              key={labelDay}
              type="button"
              className={`day-chip${days.includes(idx as DayOfWeek) ? " on" : ""}`}
              onClick={() => toggleDay(idx as DayOfWeek)}
            >
              {labelDay}
            </button>
          ))}
        </div>
        <Button onClick={addPreference}>Add & arrange</Button>
      </div>
    </Section>
  );
}
