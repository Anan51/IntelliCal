"use client";

import { useRef, useState } from "react";
import { parseSyllabus } from "@/lib/parseSyllabus";
import { resolveLocation } from "@/lib/resolveLocation";
import type { EventKind, ParsedEvent } from "@/lib/types";
import { EVENT_KINDS } from "@/lib/types";
import { useCalendarStore } from "@/store/calendarStore";
import { Badge, Button, Empty, Section } from "./ui";

type Props = {
  embedded?: boolean;
  onCommitted?: () => void;
};

export default function SyllabusIntake({ embedded = false, onCommitted }: Props) {
  const weekStartISO = useCalendarStore((s) => s.weekStartISO);
  const parseDrafts = useCalendarStore((s) => s.parseDrafts);
  const setParseDrafts = useCalendarStore((s) => s.setParseDrafts);
  const updateParseDraft = useCalendarStore((s) => s.updateParseDraft);
  const commitParseDrafts = useCalendarStore((s) => s.commitParseDrafts);

  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importantCount, setImportantCount] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function loadTestSyllabus() {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/test-syllabus.txt");
      if (!res.ok) throw new Error("Could not load test syllabus");
      setText(await res.text());
      setFileName("test-syllabus.txt");
      setStatus("Loaded public/test-syllabus.txt");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load test syllabus");
    } finally {
      setLoading(false);
    }
  }

  async function onFileChosen(file: File | null) {
    if (!file) return;
    setError(null);
    setStatus(null);
    if (file.name.toLowerCase().endsWith(".pdf")) {
      setError("Upload a .txt syllabus for now (PDF parsing is not enabled).");
      return;
    }
    setLoading(true);
    try {
      const contents = await file.text();
      setText(contents);
      setFileName(file.name);
      setStatus(`Loaded ${file.name}`);
    } catch {
      setError("Could not read that file.");
    } finally {
      setLoading(false);
    }
  }

  async function runScan(opts: { importantDatesOnly: boolean; saveAfter?: boolean }) {
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      let drafts: ParsedEvent[] = [];
      let importantDateCount = 0;

      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text,
          weekStartISO,
          importantDatesOnly: opts.importantDatesOnly,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          drafts: ParsedEvent[];
          importantDateCount?: number;
        };
        drafts = data.drafts;
        importantDateCount = data.importantDateCount ?? drafts.filter((d) =>
          d.kind === "exam" || d.kind === "due_date"
        ).length;
      } else {
        drafts = parseSyllabus(text, {
          weekStartISO,
          termEndISO: "2026-12-12",
          importantDatesOnly: opts.importantDatesOnly,
        });
        importantDateCount = drafts.filter(
          (d) => d.kind === "exam" || d.kind === "due_date"
        ).length;
      }

      setImportantCount(importantDateCount);

      if (opts.saveAfter && drafts.length > 0) {
        commitParseDrafts(drafts);
        setParseDrafts([]);
        setStatus(
          `Saved ${drafts.length} important date${drafts.length === 1 ? "" : "s"} to your calendar.`
        );
        onCommitted?.();
        return;
      }

      setParseDrafts(drafts);
      setStatus(
        opts.importantDatesOnly
          ? `Found ${importantDateCount} important date${importantDateCount === 1 ? "" : "s"}.`
          : `Parsed ${drafts.length} event${drafts.length === 1 ? "" : "s"} (${importantDateCount} important dates).`
      );
    } catch {
      const drafts = parseSyllabus(text, {
        weekStartISO,
        termEndISO: "2026-12-12",
        importantDatesOnly: opts.importantDatesOnly,
      });
      setParseDrafts(drafts);
      setImportantCount(
        drafts.filter((d) => d.kind === "exam" || d.kind === "due_date").length
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCommit() {
    const count = parseDrafts.length;
    commitParseDrafts();
    setStatus(`Saved ${count} event${count === 1 ? "" : "s"} to your calendar.`);
    setImportantCount(null);
    onCommitted?.();
  }

  const body = (
    <>
      <div className="section-actions" style={{ marginBottom: 12 }}>
        <Button variant="secondary" onClick={loadTestSyllabus} disabled={loading}>
          Load test syllabus
        </Button>
        <Button
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
        >
          Upload .txt
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,text/plain"
          hidden
          onChange={(e) => void onFileChosen(e.target.files?.[0] ?? null)}
        />
        <Button
          onClick={() => void runScan({ importantDatesOnly: true })}
          disabled={!text.trim() || loading}
        >
          Scan important dates
        </Button>
        <Button
          variant="secondary"
          onClick={() => void runScan({ importantDatesOnly: false })}
          disabled={!text.trim() || loading}
        >
          Scan full syllabus
        </Button>
        <Button
          onClick={() => void runScan({ importantDatesOnly: true, saveAfter: true })}
          disabled={!text.trim() || loading}
        >
          Scan & save dates
        </Button>
      </div>

      {fileName ? (
        <p className="muted" style={{ marginTop: 0 }}>
          Source: <code>{fileName}</code>
          {importantCount != null ? ` · ${importantCount} important dates detected` : ""}
        </p>
      ) : null}

      <textarea
        className="syllabus-textarea"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setFileName(null);
        }}
        rows={embedded ? 10 : 8}
        placeholder="Paste syllabus text or upload the test syllabus…"
        aria-label="Syllabus text"
      />
      {error ? <p className="form-error">{error}</p> : null}
      {status ? <p className="scan-status">{status}</p> : null}

      {parseDrafts.length === 0 ? (
        <Empty>
          Upload or load the test syllabus, then scan. Important dates (exams, quizzes, deadlines)
          can be saved straight to the calendar.
        </Empty>
      ) : (
        <div className="review-table-wrap">
          <div className="review-toolbar">
            <Badge tone="accent">{parseDrafts.length} draft events</Badge>
            <Button onClick={handleCommit}>Save to calendar</Button>
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
    </>
  );

  if (embedded) return <div className="syllabus-embedded">{body}</div>;

  return (
    <Section
      title="Import syllabus"
      subtitle="Scan uploaded text for exams, quizzes, and deadlines, then save them to your calendar."
    >
      {body}
    </Section>
  );
}
