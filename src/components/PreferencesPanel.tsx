"use client";

import { useState } from "react";
import type { Preference, PreferenceCategory, Strength } from "@/lib/types";
import { DAY_LABELS } from "@/lib/types";
import { createId, formatMinutes } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  preferences: Preference[];
  onChange: (prefs: Preference[]) => void;
};

const CATEGORY_META: {
  category: PreferenceCategory;
  title: string;
  blurb: string;
}[] = [
  { category: "gym", title: "Gym", blurb: "Workout windows you want protected." },
  { category: "downtime", title: "Downtime", blurb: "Wind-down or recharge blocks." },
  { category: "quiet_hours", title: "Quiet hours", blurb: "No meetings before / after a cutoff." },
  { category: "custom", title: "Custom", blurb: "Anything else you want to protect." },
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

function PreferenceCard({
  pref,
  onUpdate,
  onDelete,
}: {
  pref: Preference;
  onUpdate: (p: Preference) => void;
  onDelete?: () => void;
}) {
  const win = pref.windows?.[0] ?? { days: [], startMin: 18 * 60, endMin: 19 * 60 };
  const days = win.days;

  function toggleDay(day: number) {
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
    onUpdate({
      ...pref,
      windows: [{ ...win, days: next }],
    });
  }

  function setStrength(hard: boolean) {
    const strength: Strength = hard ? "hard" : "soft";
    onUpdate({ ...pref, strength });
  }

  return (
    <Card className="border-border bg-[var(--surface)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{pref.label}</CardTitle>
            <CardDescription className="mt-1">
              {formatMinutes(win.startMin)} – {formatMinutes(win.endMin)}
              {pref.locationText ? ` · ${pref.locationText}` : ""}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              pref.strength === "soft"
                ? "border-[rgba(96,165,250,0.5)] text-sky-300"
                : "border-slate-500 text-slate-300"
            )}
          >
            {pref.strength}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block text-xs text-muted-foreground">Days (Mon = 0)</Label>
          <div className="flex flex-wrap gap-1.5">
            {DAY_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs transition-colors",
                  days.includes(i)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-[var(--surface-2)] text-muted-foreground hover:border-primary/50"
                )}
                aria-pressed={days.includes(i)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`${pref.id}-start`} className="mb-1.5 block text-xs text-muted-foreground">
              Start
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
              className="bg-[var(--surface-2)]"
            />
          </div>
          <div>
            <Label htmlFor={`${pref.id}-end`} className="mb-1.5 block text-xs text-muted-foreground">
              End
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
              className="bg-[var(--surface-2)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-[var(--surface-2)] px-3 py-2.5">
          <div>
            <Label htmlFor={`${pref.id}-strength`} className="text-sm">
              Hard block
            </Label>
            <p className="text-xs text-muted-foreground">
              Off = soft (balanced overlap only). On = always busy.
            </p>
          </div>
          <Switch
            id={`${pref.id}-strength`}
            checked={pref.strength === "hard"}
            onCheckedChange={setStrength}
          />
        </div>

        {pref.category === "custom" && onDelete && (
          <Button variant="outline" size="sm" onClick={onDelete} className="w-full">
            Remove
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function PreferencesPanel({ preferences, onChange }: Props) {
  const [customLabel, setCustomLabel] = useState("");

  function updatePref(updated: Preference) {
    onChange(preferences.map((p) => (p.id === updated.id ? updated : p)));
  }

  function deletePref(id: string) {
    onChange(preferences.filter((p) => p.id !== id));
  }

  function addCustom() {
    const label = customLabel.trim() || "Custom block";
    const pref: Preference = {
      id: createId("custom"),
      userId: "you",
      category: "custom",
      label,
      strength: "soft",
      windows: [{ days: [0, 2, 4], startMin: 16 * 60, endMin: 17 * 60 }],
      createdFrom: "manual",
    };
    onChange([...preferences, pref]);
    setCustomLabel("");
  }

  function ensureCategory(category: PreferenceCategory): Preference | undefined {
    return preferences.find((p) => p.category === category);
  }

  function addCategoryDefault(category: PreferenceCategory) {
    const defaults: Record<string, Partial<Preference>> = {
      downtime: {
        label: "Downtime",
        strength: "soft",
        windows: [{ days: [0, 1, 2, 3, 4], startMin: 21 * 60, endMin: 22 * 60 }],
      },
      social: {
        label: "Social window",
        strength: "soft",
        windows: [{ days: [4], startMin: 17 * 60, endMin: 20 * 60 }],
      },
      focus: {
        label: "Focus block",
        strength: "soft",
        windows: [{ days: [1, 3], startMin: 15 * 60, endMin: 17 * 60 }],
      },
    };
    const base = defaults[category] ?? {
      label: category,
      strength: "soft" as Strength,
      windows: [{ days: [0], startMin: 12 * 60, endMin: 13 * 60 }],
    };
    onChange([
      ...preferences,
      {
        id: createId(category),
        userId: "you",
        category,
        label: String(base.label),
        strength: (base.strength as Strength) ?? "soft",
        windows: base.windows,
        createdFrom: "manual",
      },
    ]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Empty slots aren&apos;t always free. Soft prefs hide from hangouts in Balanced mode; hard
          prefs always block. Saved in this browser.
        </p>
      </div>

      {CATEGORY_META.map(({ category, title, blurb }) => {
        const prefs = preferences.filter((p) => p.category === category);
        return (
          <section key={category} className="space-y-3">
            <div className="flex items-end justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">{blurb}</p>
              </div>
              {category !== "custom" && !ensureCategory(category) && (
                <Button size="sm" variant="outline" onClick={() => addCategoryDefault(category)}>
                  Add
                </Button>
              )}
            </div>
            {prefs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                None yet
                {category === "custom" ? " — protect a slot on My Week, or add below." : "."}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {prefs.map((pref) => (
                  <PreferenceCard
                    key={pref.id}
                    pref={pref}
                    onUpdate={updatePref}
                    onDelete={
                      pref.category === "custom" ? () => deletePref(pref.id) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <Card className="border-border bg-[var(--surface)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Add custom preference</CardTitle>
          <CardDescription>Or click an empty hour on My Week → Protect this.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Label (e.g. Club meeting prep)"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="bg-[var(--surface-2)]"
          />
          <Button onClick={addCustom}>Add custom</Button>
        </CardContent>
      </Card>
    </div>
  );
}
