"use client";

import type { OverlapMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const MODES: { id: OverlapMode; label: string }[] = [
  { id: "strict", label: "Strict" },
  { id: "balanced", label: "Balanced" },
  { id: "max", label: "Max" },
];

type Props = {
  mode: OverlapMode;
  onChange: (mode: OverlapMode) => void;
  className?: string;
};

export default function ModeToggle({ mode, onChange, className }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Overlap mode"
      className={cn(
        "inline-flex rounded border border-[var(--hairline)] p-0.5",
        className
      )}
    >
      {MODES.map((m) => {
        const on = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(m.id)}
            className={cn(
              "rounded-[3px] px-2.5 py-1 text-[12px] transition-colors",
              on
                ? "bg-[var(--elevated)] font-medium text-[var(--text)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
