"use client";

import { useState } from "react";
import type { CalEvent } from "@/lib/types";
import { parseSyllabus } from "@/lib/parseSyllabus";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onParsed: (events: CalEvent[]) => void;
};

export default function SyllabusPaste({ onParsed }: Props) {
  const [open, setOpen] = useState(false);
  const [syllabus, setSyllabus] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCount, setLastCount] = useState<number | null>(null);

  async function loadSample() {
    setLoading(true);
    try {
      const res = await fetch("/sample-syllabus.txt");
      setSyllabus(await res.text());
      setOpen(true);
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
    <div className="border-t border-[var(--hairline)] pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1 text-left"
        aria-expanded={open}
      >
        <span className="text-[13px] text-[var(--text-secondary)]">Add from syllabus</span>
        <ChevronDown
          className={cn(
            "size-4 text-[var(--text-tertiary)] transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          <textarea
            className="min-h-[100px] w-full resize-y rounded border border-[var(--hairline)] bg-[var(--surface)] p-3 font-mono text-[12px] text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            rows={5}
            placeholder="Paste syllabus text…"
            aria-label="Syllabus text"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={loadSample} disabled={loading}>
              {loading ? "Loading…" : "Load sample"}
            </Button>
            <Button size="sm" onClick={handleParse} disabled={!syllabus.trim()}>
              Parse into calendar
            </Button>
          </div>
          {lastCount !== null && (
            <p className="text-[12px] text-[var(--green)]">Added {lastCount} events.</p>
          )}
        </div>
      )}
    </div>
  );
}
