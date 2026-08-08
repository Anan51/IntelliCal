"use client";

import type { OverlapMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const MODES: { id: OverlapMode; label: string; hint: string }[] = [
  { id: "strict", label: "Strict", hint: "Classes + hard only" },
  { id: "balanced", label: "Balanced", hint: "Respects soft prefs" },
  { id: "max", label: "Max", hint: "Ignore soft prefs" },
];

type Props = {
  mode: OverlapMode;
  onChange: (mode: OverlapMode) => void;
  className?: string;
};

export default function ModeToggle({ mode, onChange, className }: Props) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[11px] font-medium text-muted-foreground">Overlap mode</p>
      <div
        role="radiogroup"
        aria-label="Overlap mode"
        className="inline-flex rounded-md border border-[var(--hairline)] bg-[var(--surface-2)] p-0.5"
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
                "rounded-[5px] px-3 py-1.5 text-[12px] font-medium transition-colors",
                on
                  ? "bg-[var(--elevated)] text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {MODES.find((m) => m.id === mode)?.hint}
        {mode === "balanced" ? " — default for hangouts." : null}
      </p>
    </div>
  );
}
