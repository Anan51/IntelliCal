"use client";

import { useMemo, useState } from "react";
import { demoEvents } from "@/lib/demo-data";
import type { CalEvent } from "@/lib/types";
import { parseSyllabus } from "@/lib/parseSyllabus";
import { freeOverlap } from "@/lib/overlap";
import { tightTransitions } from "@/lib/walkTimes";

type Tab = "week" | "overlap" | "walk";

export default function Home() {
  const [events, setEvents] = useState<CalEvent[]>(demoEvents);
  const [tab, setTab] = useState<Tab>("week");
  const [syllabus, setSyllabus] = useState("");

  const yours = events.filter((e) => e.personId === "you");
  const overlapMon = useMemo(
    () => freeOverlap(events, "you", "alex", "2026-09-28"),
    [events]
  );
  const warnings = useMemo(() => tightTransitions(events, "you"), [events]);

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 4 }}>IntelliCal</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        when2meet, but it already knows your classes and UCLA walk times.
      </p>

      <div style={{ display: "flex", gap: 8, margin: "20px 0" }}>
        {(["week", "overlap", "walk"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #334",
              background: tab === t ? "#3b6cff" : "#151b2e",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            {t === "week" ? "My Week" : t === "overlap" ? "Friend Overlap" : "Walk Alerts"}
          </button>
        ))}
      </div>

      {tab === "week" && (
        <section>
          <h2>Your events</h2>
          <ul>
            {yours.map((e) => (
              <li key={e.id} style={{ marginBottom: 8 }}>
                <strong>{e.title}</strong> — {new Date(e.start).toLocaleString()} →{" "}
                {new Date(e.end).toLocaleTimeString()}
                {e.building ? ` @ ${e.building}` : ""}
              </li>
            ))}
          </ul>

          <h3>Paste syllabus</h3>
          <textarea
            value={syllabus}
            onChange={(ev) => setSyllabus(ev.target.value)}
            rows={8}
            style={{ width: "100%", background: "#151b2e", color: "inherit", borderRadius: 8, padding: 12 }}
            placeholder="Paste syllabus text…"
          />
          <button
            style={{ marginTop: 8, padding: "8px 14px", borderRadius: 8, background: "#3b6cff", border: 0, color: "white", cursor: "pointer" }}
            onClick={() => {
              const parsed = parseSyllabus(syllabus);
              setEvents((prev) => [...prev, ...parsed]);
            }}
          >
            Parse into calendar
          </button>
        </section>
      )}

      {tab === "overlap" && (
        <section>
          <h2>Free with Alex — Mon 2026-09-28</h2>
          {overlapMon.length === 0 ? (
            <p>No shared free slots in the demo window.</p>
          ) : (
            <ul>
              {overlapMon.map((s, idx) => (
                <li key={idx} style={{ color: "#5dffa8", marginBottom: 6 }}>
                  {s.start.toLocaleTimeString()} – {s.end.toLocaleTimeString()}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "walk" && (
        <section>
          <h2>Tight transitions</h2>
          {warnings.length === 0 ? (
            <p>No tight walks in current schedule.</p>
          ) : (
            <ul>
              {warnings.map((w, i) => (
                <li key={i} style={{ color: "#ffb454" }}>{w}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
