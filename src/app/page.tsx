"use client";

import { useEffect, useMemo, useState } from "react";
import { demoEvents } from "@/lib/demo-data";
import type { CalEvent, OverlapMode, Preference } from "@/lib/types";
import { freeOverlapWeek } from "@/lib/overlap";
import { tightTransitions } from "@/lib/walkTimes";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  preferenceFromSlot,
  preferencesToEvents,
  savePreferences,
} from "@/lib/preferences";
import AppShell, { type AppTab } from "@/components/AppShell";
import WeekCalendar from "@/components/WeekCalendar";
import SyllabusPaste from "@/components/SyllabusPaste";
import OverlapView from "@/components/OverlapView";
import WalkAlerts from "@/components/WalkAlerts";
import PreferencesPanel from "@/components/PreferencesPanel";
import ProtectThisDialog from "@/components/ProtectThisDialog";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import EventPrefSheet from "@/components/EventPrefSheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [events, setEvents] = useState<CalEvent[]>(demoEvents);
  const [tab, setTab] = useState<AppTab>("week");
  const [preferences, setPreferences] = useState<Preference[]>(DEFAULT_PREFERENCES);
  const [prefsHydrated, setPrefsHydrated] = useState(false);
  const [overlapMode, setOverlapMode] = useState<OverlapMode>("balanced");
  const [showPreferences, setShowPreferences] = useState(true);
  const [protectSlot, setProtectSlot] = useState<{ dayISO: string; hour: number } | null>(
    null
  );
  const [editingPrefId, setEditingPrefId] = useState<string | null>(null);

  useEffect(() => {
    setPreferences(loadPreferences());
    setPrefsHydrated(true);
  }, []);

  useEffect(() => {
    if (!prefsHydrated) return;
    savePreferences(preferences);
  }, [preferences, prefsHydrated]);

  const prefEvents = useMemo(() => preferencesToEvents(preferences), [preferences]);
  const allEvents = useMemo(() => [...events, ...prefEvents], [events, prefEvents]);
  const myWeekEvents = useMemo(
    () => allEvents.filter((e) => e.personId === "you"),
    [allEvents]
  );
  const overlapSlots = useMemo(
    () => freeOverlapWeek(allEvents, "you", "alex", { mode: overlapMode }),
    [allEvents, overlapMode]
  );
  const warnings = useMemo(() => tightTransitions(events, "you"), [events]);
  const hasSyllabusExtras = events.some((e) => e.id.startsWith("parsed-"));
  const editingPref = preferences.find((p) => p.id === editingPrefId) ?? null;

  function handleParsed(parsed: CalEvent[]) {
    setEvents((prev) => {
      const withoutDupes = parsed.filter((p) => !prev.some((e) => e.id === p.id));
      return [...prev, ...withoutDupes];
    });
  }

  function confirmProtect() {
    if (!protectSlot) return;
    const pref = preferenceFromSlot(protectSlot.dayISO, protectSlot.hour);
    setPreferences((prev) => [...prev, pref]);
    setProtectSlot(null);
  }

  return (
    <AppShell
      tab={tab}
      onTabChange={setTab}
      prefCount={preferences.length}
      walkCount={warnings.length}
    >
      {tab === "week" && (
        <div className="mx-auto max-w-5xl space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">My Week</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Sep 28 – Oct 2 · click an empty hour to protect it
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-prefs"
                  checked={showPreferences}
                  onCheckedChange={setShowPreferences}
                />
                <Label htmlFor="show-prefs" className="text-[12px] text-muted-foreground">
                  Show preferences
                </Label>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTab("preferences")}
              >
                Edit preferences
              </Button>
            </div>
          </div>

          <OnboardingChecklist
            hasSyllabusExtras={hasSyllabusExtras}
            prefCount={preferences.length}
            walkCount={warnings.length}
            onGoPreferences={() => setTab("preferences")}
          />

          {warnings.length > 0 && (
            <button
              type="button"
              onClick={() => setTab("walk")}
              className="w-full rounded-md border border-[rgba(232,184,109,0.25)] bg-[var(--warn-bg)] px-3 py-2 text-left text-[12px] text-[var(--warn)] transition-colors hover:border-[rgba(232,184,109,0.4)]"
            >
              {warnings[0].message}
              {warnings.length > 1 ? ` · +${warnings.length - 1} more` : ""} →
            </button>
          )}

          <WeekCalendar
            events={myWeekEvents}
            personId="you"
            showPreferences={showPreferences}
            onEmptySlotClick={(dayISO, hour) => setProtectSlot({ dayISO, hour })}
            onEventClick={(ev) => {
              if (ev.preferenceId) setEditingPrefId(ev.preferenceId);
            }}
          />

          <SyllabusPaste onParsed={handleParsed} />
        </div>
      )}

      {tab === "preferences" && (
        <PreferencesPanel preferences={preferences} onChange={setPreferences} />
      )}

      {tab === "overlap" && (
        <OverlapView
          events={allEvents}
          slots={overlapSlots}
          mode={overlapMode}
          onModeChange={setOverlapMode}
        />
      )}

      {tab === "walk" && <WalkAlerts warnings={warnings} />}

      <ProtectThisDialog
        open={protectSlot != null}
        dayISO={protectSlot?.dayISO ?? null}
        hour={protectSlot?.hour ?? null}
        onOpenChange={(open) => {
          if (!open) setProtectSlot(null);
        }}
        onConfirm={confirmProtect}
      />

      <EventPrefSheet
        preference={editingPref}
        open={editingPrefId != null}
        onOpenChange={(open) => {
          if (!open) setEditingPrefId(null);
        }}
        onUpdate={(updated) =>
          setPreferences((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        }
        onDelete={(id) => setPreferences((prev) => prev.filter((p) => p.id !== id))}
      />
    </AppShell>
  );
}
