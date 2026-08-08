"use client";

import { useState } from "react";
import { parseSyllabus } from "@/lib/parseSyllabus";
import { resolveLocation } from "@/lib/resolveLocation";
import type { EventKind, ParsedEvent } from "@/lib/types";
import { EVENT_KINDS } from "@/lib/types";
import { useCalendarStore } from "@/store/calendarStore";
import { Badge, Button, Empty, Section } from "./ui";

export default function SyllabusIntake() {
  const weekStartISO = useCalendarStore((s) => s.weekStartISO);
  const parseDrafts = useCalendarStore((s) => s.parseDrafts);
  const setParseDrafts = useCalendarStore((s) => s.setParseDrafts);
  const updateParseDraft = useCalendarStore((s) => s.updateParseDraft);
  const commitParseDrafts = useCalendarStore((s) => s.commitParseDrafts);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSample() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/sample-syllabus.txt");
      setText(await res.text());
    } finally {
      setLoading(false);
    }
  }

  async function runParse() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, weekStartISO }),
      });
      if (!res.ok) {
        // Client-side fallback keeps the demo working if the API is down.
        setParseDrafts(parseSyllabus(text, { weekStartISO, termEndISO: "2026-12-12" }));
        return;
      }
      const data = (await res.json()) as { drafts: ParsedEvent[] };
      setParseDrafts(data.drafts);
    } catch {
      setParseDrafts(parseSyllabus(text, { weekStartISO, termEndISO: "2026-12-12" }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section
      kicker="02 / Intake"
      title="Syllabus intake"
      subtitle="Paste a syllabus, review the extracted events, then commit. Nothing is added until you confirm."
      actions={
        <>
          <Button variant="secondary" onClick={loadSample} disabled={loading}>
            {loading ? "Loading…" : "Load sample"}
          </Button>
          <Button onClick={runParse} disabled={!text.trim() || loading}>
            Parse
          </Button>
        </>
      }
    >
      <textarea
        className="syllabus-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder="Paste syllabus text…"
        aria-label="Syllabus text"
      />
      {error ? <p className="form-error">{error}</p> : null}

      {parseDrafts.length === 0 ? (
        <Empty>Parsed events will appear here for review.</Empty>
      ) : (
        <div className="review-table-wrap">
          <div className="review-toolbar">
            <Badge tone="accent">{parseDrafts.length} draft events</Badge>
            <Button onClick={commitParseDrafts}>Commit to calendar</Button>
            <Button variant="ghost" onClick={() => setParseDrafts([])}>
              Discard
            </Button>
          </div>
          <table className="review-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Kind</th>
                <th>Start</th>
                <th>End</th>
                <th>Location</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {parseDrafts.map((d) => (
                <tr key={d.draftId}>
                  <td>
                    <input
                      value={d.title}
                      onChange={(e) => updateParseDraft(d.draftId, { title: e.target.value })}
                      aria-label="Title"
                    />
                  </td>
                  <td>
                    <select
                      value={d.kind}
                      onChange={(e) =>
                        updateParseDraft(d.draftId, { kind: e.target.value as EventKind })
                      }
                      aria-label="Kind"
                    >
                      {EVENT_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      value={d.start}
                      onChange={(e) => updateParseDraft(d.draftId, { start: e.target.value })}
                      aria-label="Start"
                    />
                  </td>
                  <td>
                    <input
                      value={d.end}
                      onChange={(e) => updateParseDraft(d.draftId, { end: e.target.value })}
                      aria-label="End"
                    />
                  </td>
                  <td>
                    <input
                      value={d.location?.raw ?? ""}
                      onChange={(e) =>
                        updateParseDraft(d.draftId, {
                          location: e.target.value
                            ? resolveLocation(e.target.value)
                            : undefined,
                        })
                      }
                      aria-label="Location"
                    />
                  </td>
                  <td>
                    <Badge
                      tone={
                        d.confidence.start >= 0.85
                          ? "good"
                          : d.confidence.start >= 0.6
                            ? "warn"
                            : "neutral"
                      }
                    >
                      {Math.round(d.confidence.start * 100)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
