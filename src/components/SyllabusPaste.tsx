"use client";

import { useState } from "react";
import type { CalEvent } from "@/lib/types";
import { parseSyllabus } from "@/lib/parseSyllabus";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onParsed: (events: CalEvent[]) => void;
  defaultOpen?: boolean;
};

export default function SyllabusPaste({ onParsed, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [syllabus, setSyllabus] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCount, setLastCount] = useState<number | null>(null);

  async function loadSample() {
    setLoading(true);
    try {
      const res = await fetch("/sample-syllabus.txt");
      const text = await res.text();
      setSyllabus(text);
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
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div>
          <div className="text-[13px] font-medium">Add from syllabus</div>
          <div className="text-[11px] text-muted-foreground">
            Paste text or load the sample CS 31 syllabus
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="border-t border-[var(--hairline)] px-4 py-3">
          <textarea
            className="min-h-[120px] w-full resize-y rounded-md border border-[var(--hairline)] bg-[var(--surface-2)] p-3 font-mono text-[12px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            rows={6}
            placeholder="Paste syllabus text…"
            aria-label="Syllabus text"
          />
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={loadSample} disabled={loading}>
              {loading ? "Loading…" : "Load sample"}
            </Button>
            <Button size="sm" onClick={handleParse} disabled={!syllabus.trim()}>
              Parse into calendar
            </Button>
          </div>
          {lastCount !== null && (
            <p className="mt-2 text-[12px] text-[var(--green)]">
              Added {lastCount} event{lastCount === 1 ? "" : "s"}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
