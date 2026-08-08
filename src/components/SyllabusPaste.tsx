"use client";

import { useState } from "react";
import type { CalEvent } from "@/lib/types";
import { parseSyllabus } from "@/lib/parseSyllabus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="border-border bg-[var(--surface)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Syllabus → calendar</CardTitle>
        <CardDescription>
          Paste syllabus text or load the sample CS 31 syllabus. Lectures, discussion, midterm
          &amp; final land on your week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <textarea
          className="min-h-[140px] w-full resize-y rounded-lg border border-border bg-[var(--surface-2)] p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={syllabus}
          onChange={(e) => setSyllabus(e.target.value)}
          rows={7}
          placeholder="Paste syllabus text…"
          aria-label="Syllabus text"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadSample} disabled={loading}>
            {loading ? "Loading…" : "Load sample syllabus"}
          </Button>
          <Button onClick={handleParse} disabled={!syllabus.trim()}>
            Parse into calendar
          </Button>
        </div>
        {lastCount !== null && (
          <p className="mt-3 text-sm text-[var(--green)]">
            Added {lastCount} event{lastCount === 1 ? "" : "s"} to your calendar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
