"use client";

import type { OverlapMode } from "@/lib/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const MODES: { id: OverlapMode; label: string; hint: string }[] = [
  {
    id: "strict",
    label: "Strict",
    hint: "Classes + hard blocks only",
  },
  {
    id: "balanced",
    label: "Balanced",
    hint: "Also respects soft prefs (default)",
  },
  {
    id: "max",
    label: "Max",
    hint: "Ignore soft — same busy set as Strict for now",
  },
];

type Props = {
  mode: OverlapMode;
  onChange: (mode: OverlapMode) => void;
  className?: string;
};

export default function ModeToggle({ mode, onChange, className }: Props) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Overlap mode
      </p>
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(v) => {
          if (v === "strict" || v === "balanced" || v === "max") onChange(v);
        }}
        variant="outline"
        size="sm"
        className="flex w-full flex-wrap justify-start gap-1"
        aria-label="Overlap mode"
      >
        {MODES.map((m) => (
          <ToggleGroupItem
            key={m.id}
            value={m.id}
            aria-label={`${m.label}: ${m.hint}`}
            className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {m.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-xs text-muted-foreground">
        {MODES.find((m) => m.id === mode)?.hint}
      </p>
    </div>
  );
}
