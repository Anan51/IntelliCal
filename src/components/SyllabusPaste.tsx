"use client";

import { useState } from "react";
import type { CalEvent } from "@/lib/types";
import { parseSyllabus } from "@/lib/parseSyllabus";

type Props = {
  onParsed: (events: CalEvent[]) => void;
};

export default function SyllabusPaste({ onParsed }: Props) {
  const [syllabus, setSyllabus] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCount, setLastCount] = useState<number | null>(null);

  async function loadSample() {
    setLoading(true);
    try {
      const res = await fetch("/sample-syllabus.txt");
      const text = await res.text();
      setSyllabus(text);
    } finally {
      setLoading(false);
    }
  }

  function handleParse() {
    const parsed = parseSyllabus(syllabus);
    onParsed(parsed);
    setLastCount(parsed.length);
  }

  return (
    <div className="section-card">
      <h2>Syllabus → calendar</h2>
      <p className="subtitle">
        Paste syllabus text or load the sample CS 31 syllabus. Parsed lectures, discussion, midterm &amp; final appear on your week.
      </p>
      <textarea
        className="syllabus-textarea"
        value={syllabus}
        onChange={(e) => setSyllabus(e.target.value)}
        rows={7}
        placeholder="Paste syllabus text…"
      />
      <div className="syllabus-actions">
        <button className="btn btn-secondary" onClick={loadSample} disabled={loading}>
          {loading ? "Loading…" : "Load sample syllabus"}
        </button>
        <button className="btn btn-primary" onClick={handleParse} disabled={!syllabus.trim()}>
          Parse into calendar
        </button>
      </div>
      {lastCount !== null && (
        <p style={{ marginTop: 10, fontSize: "0.85rem", color: "var(--green)" }}>
          Added {lastCount} event{lastCount === 1 ? "" : "s"} to your calendar.
        </p>
      )}
    </div>
  );
}
