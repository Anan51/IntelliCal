"use client";

import type { PrefSuggestion } from "@/lib/mock-gcal";
import { Button } from "@/components/ui/button";

type Props = {
  suggestions: PrefSuggestion[];
  onAccept: (s: PrefSuggestion) => void;
  onDismiss: (id: string) => void;
};

export default function SuggestionCards({ suggestions, onAccept, onDismiss }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <section className="space-y-2" aria-label="Suggested preferences">
      <h2 className="text-[12px] font-medium text-[var(--text-secondary)]">
        From your calendar
      </h2>
      <ul className="space-y-2">
        {suggestions.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-3 rounded border border-[var(--hairline)] bg-[var(--surface)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[var(--text)]">{s.label}</p>
              <p className="mt-0.5 text-[12px] text-[var(--text-secondary)]">{s.evidence}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => onDismiss(s.id)}>
                Dismiss
              </Button>
              <Button size="sm" onClick={() => onAccept(s)}>
                Protect
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
