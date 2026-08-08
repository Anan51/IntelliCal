"use client";

import { useState } from "react";
import type { Preference, PreferenceCategory, Strength } from "@/lib/types";
import { DAY_LABELS } from "@/lib/types";
import { createId, formatMinutes } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Dumbbell, Moon, Focus, Users, Coffee, Plus, Trash2, Sparkles } from "lucide-react";

type Props = {
  preferences: Preference[];
  onChange: (prefs: Preference[]) => void;
};

type Template = {
  category: PreferenceCategory;
  label: string;
  blurb: string;
  icon: typeof Dumbbell;
  strength: Strength;
  windows: NonNullable<Preference["windows"]>;
  locationText?: string;
  flexible?: Preference["flexible"];
};

const TEMPLATES: Template[] = [
  {
    category: "gym",
    label: "Gym",
    blurb: "Mon/Wed evenings · 60 min",
    icon: Dumbbell,
    strength: "soft",
    windows: [{ days: [0, 2], startMin: 18 * 60, endMin: 19 * 60 }],
    locationText: "John Wooden Center",
  },
  {
    category: "quiet_hours",
    label: "Quiet mornings",
    blurb: "No hangouts before 10am",
    icon: Moon,
    strength: "hard",
    windows: [{ days: [0, 1, 2, 3, 4], startMin: 8 * 60, endMin: 10 * 60 }],
  },
  {
    category: "downtime",
    label: "Downtime",
    blurb: "Weeknights after 9",
    icon: Coffee,
    strength: "soft",
    windows: [{ days: [0, 1, 2, 3, 4], startMin: 21 * 60, endMin: 22 * 60 }],
  },
  {
    category: "focus",
    label: "Focus block",
    blurb: "Tue/Thu afternoons",
    icon: Focus,
    strength: "soft",
    windows: [{ days: [1, 3], startMin: 15 * 60, endMin: 17 * 60 }],
  },
  {
    category: "social",
    label: "Social window",
    blurb: "Friday evenings preferred",
    icon: Users,
    strength: "soft",
    windows: [{ days: [4], startMin: 17 * 60, endMin: 20 * 60 }],
  },
];

function minutesToInput(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function inputToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function summarize(pref: Preference): string {
  if (pref.flexible) {
    const band = pref.flexible.preferredBands[0];
    return `${pref.flexible.timesPerWeek}× / week · ${pref.flexible.durationMin} min${
      band ? ` · prefers ${formatMinutes(band.startMin)}–${formatMinutes(band.endMin)}` : ""
    }`;
  }
  const win = pref.windows?.[0];
  if (!win) return "No schedule yet";
  const days = win.days.map((d) => DAY_LABELS[d]).join(", ");
  return `${days} · ${formatMinutes(win.startMin)}–${formatMinutes(win.endMin)}`;
}

function PreferenceEditor({
  pref,
  onUpdate,
  onDelete,
}: {
  pref: Preference;
  onUpdate: (p: Preference) => void;
  onDelete: () => void;
}) {
  const win = pref.windows?.[0] ?? {
    days: [] as number[],
    startMin: 18 * 60,
    endMin: 19 * 60,
  };
  const isFlexible = Boolean(pref.flexible);

  return (
    <div className="border-b border-[var(--hairline)] px-4 py-4 last:border-b-0 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={pref.label}
            onChange={(e) => onUpdate({ ...pref, label: e.target.value })}
            className="h-8 border-transparent bg-transparent px-0 text-[15px] font-medium shadow-none focus-visible:border-transparent focus-visible:ring-0"
            aria-label="Preference name"
          />
          <p className="text-[12px] text-muted-foreground">{summarize(pref)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor={`${pref.id}-hard`} className="text-[11px] text-muted-foreground">
              {pref.strength === "hard" ? "Hard" : "Soft"}
            </Label>
            <Switch
              id={`${pref.id}-hard`}
              checked={pref.strength === "hard"}
              onCheckedChange={(hard) =>
                onUpdate({ ...pref, strength: hard ? "hard" : "soft" })
              }
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Delete ${pref.label}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          {!isFlexible && (
            <>
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Days</p>
                <div className="flex flex-wrap gap-1">
                  {DAY_LABELS.map((label, i) => {
                    const on = win.days.includes(i);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const days = on
                            ? win.days.filter((d) => d !== i)
                            : [...win.days, i].sort();
                          onUpdate({ ...pref, windows: [{ ...win, days }] });
                        }}
                        aria-pressed={on}
                        className={cn(
                          "h-7 min-w-9 rounded-md px-2 text-[11px] font-medium transition-colors",
                          on
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.07]"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div>
                  <Label
                    htmlFor={`${pref.id}-start`}
                    className="mb-1 block text-[11px] text-muted-foreground"
                  >
                    From
                  </Label>
                  <Input
                    id={`${pref.id}-start`}
                    type="time"
                    value={minutesToInput(win.startMin)}
                    onChange={(e) =>
                      onUpdate({
                        ...pref,
                        windows: [{ ...win, startMin: inputToMinutes(e.target.value) }],
                      })
                    }
                    className="h-8 w-[7.5rem] bg-[var(--surface-2)] tabular"
                  />
                </div>
                <div>
                  <Label
                    htmlFor={`${pref.id}-end`}
                    className="mb-1 block text-[11px] text-muted-foreground"
                  >
                    To
                  </Label>
                  <Input
                    id={`${pref.id}-end`}
                    type="time"
                    value={minutesToInput(win.endMin)}
                    onChange={(e) =>
                      onUpdate({
                        ...pref,
                        windows: [{ ...win, endMin: inputToMinutes(e.target.value) }],
                      })
                    }
                    className="h-8 w-[7.5rem] bg-[var(--surface-2)] tabular"
                  />
                </div>
                <div className="min-w-[10rem] flex-1">
                  <Label
                    htmlFor={`${pref.id}-loc`}
                    className="mb-1 block text-[11px] text-muted-foreground"
                  >
                    Location (optional)
                  </Label>
                  <Input
                    id={`${pref.id}-loc`}
                    value={pref.locationText ?? ""}
                    placeholder="e.g. Wooden Center"
                    onChange={(e) =>
                      onUpdate({
                        ...pref,
                        locationText: e.target.value || undefined,
                      })
                    }
                    className="h-8 bg-[var(--surface-2)]"
                  />
                </div>
              </div>
            </>
          )}

          {isFlexible && pref.flexible && (
            <div className="flex flex-wrap gap-3">
              <div>
                <Label className="mb-1 block text-[11px] text-muted-foreground">
                  Times / week
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={pref.flexible.timesPerWeek}
                  onChange={(e) =>
                    onUpdate({
                      ...pref,
                      flexible: {
                        ...pref.flexible!,
                        timesPerWeek: Number(e.target.value) || 1,
                      },
                    })
                  }
                  className="h-8 w-20 bg-[var(--surface-2)] tabular"
                />
              </div>
              <div>
                <Label className="mb-1 block text-[11px] text-muted-foreground">
                  Duration (min)
                </Label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={pref.flexible.durationMin}
                  onChange={(e) =>
                    onUpdate({
                      ...pref,
                      flexible: {
                        ...pref.flexible!,
                        durationMin: Number(e.target.value) || 60,
                      },
                    })
                  }
                  className="h-8 w-24 bg-[var(--surface-2)] tabular"
                />
              </div>
              <div>
                <Label className="mb-1 block text-[11px] text-muted-foreground">
                  Preferred from
                </Label>
                <Input
                  type="time"
                  value={minutesToInput(pref.flexible.preferredBands[0]?.startMin ?? 18 * 60)}
                  onChange={(e) => {
                    const startMin = inputToMinutes(e.target.value);
                    const end =
                      pref.flexible!.preferredBands[0]?.endMin ?? startMin + 180;
                    onUpdate({
                      ...pref,
                      flexible: {
                        ...pref.flexible!,
                        preferredBands: [{ startMin, endMin: Math.max(end, startMin + 60) }],
                      },
                    });
                  }}
                  className="h-8 w-[7.5rem] bg-[var(--surface-2)] tabular"
                />
              </div>
              <div>
                <Label className="mb-1 block text-[11px] text-muted-foreground">
                  Preferred to
                </Label>
                <Input
                  type="time"
                  value={minutesToInput(pref.flexible.preferredBands[0]?.endMin ?? 21 * 60)}
                  onChange={(e) => {
                    const endMin = inputToMinutes(e.target.value);
                    const start = pref.flexible!.preferredBands[0]?.startMin ?? 18 * 60;
                    onUpdate({
                      ...pref,
                      flexible: {
                        ...pref.flexible!,
                        preferredBands: [{ startMin: start, endMin }],
                      },
                    });
                  }}
                  className="h-8 w-[7.5rem] bg-[var(--surface-2)] tabular"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              if (isFlexible) {
                onUpdate({
                  ...pref,
                  flexible: undefined,
                  windows: [{ days: [0, 2], startMin: 18 * 60, endMin: 19 * 60 }],
                });
              } else {
                onUpdate({
                  ...pref,
                  windows: undefined,
                  flexible: {
                    timesPerWeek: 3,
                    durationMin: 60,
                    preferredBands: [{ startMin: 17 * 60, endMin: 21 * 60 }],
                  },
                });
              }
            }}
            className="text-left text-[11px] text-primary hover:underline"
          >
            {isFlexible ? "Switch to fixed days" : "Switch to flexible (N× / week)"}
          </button>
          <p className="max-w-[14rem] text-[10px] leading-snug text-muted-foreground">
            Soft = Balanced overlap treats as busy. Hard = always blocks.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PreferencesPanel({ preferences, onChange }: Props) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");

  const missingTemplates = TEMPLATES.filter(
    (t) => !preferences.some((p) => p.category === t.category)
  );

  function addFromTemplate(t: Template) {
    if (preferences.some((p) => p.category === t.category)) {
      return;
    }
    onChange([
      ...preferences,
      {
        id: createId(t.category),
        userId: "you",
        category: t.category,
        label: t.label,
        strength: t.strength,
        windows: t.windows,
        locationText: t.locationText,
        createdFrom: "manual",
      },
    ]);
  }

  function addCustom() {
    const label = customLabel.trim() || "Protected time";
    onChange([
      ...preferences,
      {
        id: createId("custom"),
        userId: "you",
        category: "custom",
        label,
        strength: "soft",
        windows: [{ days: [0, 2, 4], startMin: 16 * 60, endMin: 17 * 60 }],
        createdFrom: "manual",
      },
    ]);
    setCustomLabel("");
    setCustomOpen(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight">Preferences</h1>
        <p className="mt-1 max-w-lg text-[13px] text-[var(--text-secondary)]">
          Empty slots aren&apos;t always free. Soft prefs hide from Balanced hangouts; hard prefs
          always block.
        </p>
      </div>

      {/* Quick add — primary input path */}
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-[13px] font-medium text-foreground">Add a preference</h2>
          <span className="text-[11px] text-muted-foreground">One tap to start</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => {
            const Icon = t.icon;
            const exists = preferences.some((p) => p.category === t.category);
            return (
              <button
                key={t.category + t.label}
                type="button"
                disabled={exists}
                onClick={() => addFromTemplate(t)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] px-3 py-3 text-left transition-colors",
                  exists
                    ? "opacity-40"
                    : "hover:border-[var(--hairline-strong)] hover:bg-[var(--elevated)]"
                )}
              >
                <span className="mt-0.5 flex size-8 items-center justify-center rounded-md bg-white/[0.04]">
                  <Icon className="size-3.5 text-primary" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium">{t.label}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {exists ? "Already added" : t.blurb}
                  </span>
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setCustomOpen(true)}
            className="flex items-start gap-3 rounded-lg border border-dashed border-[var(--hairline-strong)] bg-transparent px-3 py-3 text-left transition-colors hover:bg-[var(--surface)]"
          >
            <span className="mt-0.5 flex size-8 items-center justify-center rounded-md bg-white/[0.04]">
              <Plus className="size-3.5 text-muted-foreground" aria-hidden />
            </span>
            <span>
              <span className="block text-[13px] font-medium">Custom</span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                Name your own block
              </span>
            </span>
          </button>
        </div>

        {customOpen && (
          <div className="mt-3 flex flex-col gap-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center">
            <Input
              autoFocus
              placeholder="e.g. Club prep, therapy, shift"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustom();
              }}
              className="h-9 bg-[var(--surface-2)]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addCustom}>
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCustomOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>

      <Separator className="bg-[var(--hairline)]" />

      {/* Active list — Notion-like rows */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[13px] font-medium">
            Your protected time
            <span className="ml-2 tabular text-muted-foreground">{preferences.length}</span>
          </h2>
          <button
            type="button"
            disabled
            title="Coming in Phase 2 after calendar connect"
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/60"
          >
            <Sparkles className="size-3" aria-hidden />
            Suggest from calendar
            <span className="rounded bg-white/[0.04] px-1 py-0.5 text-[9px] uppercase tracking-wide">
              Soon
            </span>
          </button>
        </div>

        {preferences.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--hairline-strong)] px-4 py-10 text-center">
            <p className="text-[13px] text-foreground">Nothing protected yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Add gym or quiet hours above — or click an empty hour on My Week.
            </p>
            {missingTemplates[0] && (
              <Button
                size="sm"
                className="mt-4"
                onClick={() => addFromTemplate(missingTemplates[0])}
              >
                Add {missingTemplates[0].label}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--surface)]">
            {preferences.map((pref) => (
              <PreferenceEditor
                key={pref.id}
                pref={pref}
                onUpdate={(updated) =>
                  onChange(preferences.map((p) => (p.id === updated.id ? updated : p)))
                }
                onDelete={() => onChange(preferences.filter((p) => p.id !== pref.id))}
              />
            ))}
          </div>
        )}
      </section>

      <p className="text-[11px] text-muted-foreground">
        Tip: on <span className="text-foreground">My Week</span>, click any empty hour → Protect
        this. Saved in this browser only.
      </p>
    </div>
  );
}
