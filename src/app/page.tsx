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
import WeekCalendar from "@/components/WeekCalendar";
import SyllabusPaste from "@/components/SyllabusPaste";
import OverlapView from "@/components/OverlapView";
import WalkAlerts from "@/components/WalkAlerts";
import PreferencesPanel from "@/components/PreferencesPanel";
import ProtectThisDialog from "@/components/ProtectThisDialog";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Tab = "week" | "preferences" | "overlap" | "walk";

export default function Home() {
  const [events, setEvents] = useState<CalEvent[]>(demoEvents);
  const [tab, setTab] = useState<Tab>("week");
  const [preferences, setPreferences] = useState<Preference[]>(DEFAULT_PREFERENCES);
  const [prefsHydrated, setPrefsHydrated] = useState(false);
  const [overlapMode, setOverlapMode] = useState<OverlapMode>("balanced");
  const [showPreferences, setShowPreferences] = useState(true);
  const [protectSlot, setProtectSlot] = useState<{ dayISO: string; hour: number } | null>(
    null
  );

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

  function handleParsed(parsed: CalEvent[]) {
    setEvents((prev) => {
      const withoutDupes = parsed.filter((p) => !prev.some((e) => e.id === p.id));
      return [...prev, ...withoutDupes];
    });
  }

  function handlePreferencesChange(next: Preference[]) {
    setPreferences(next);
  }

  function confirmProtect() {
    if (!protectSlot) return;
    const pref = preferenceFromSlot(protectSlot.dayISO, protectSlot.hour);
    setPreferences((prev) => [...prev, pref]);
    setProtectSlot(null);
  }

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          UCLA · Demo week
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          IntelliCal
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          when2meet, but it already knows your classes, preferences, and how long it takes to walk
          across UCLA.
        </p>
      </header>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        className="gap-4"
      >
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-1 border-b border-border bg-transparent p-0"
          aria-label="Main navigation"
        >
          <TabsTrigger value="week" className="px-3 py-2">
            My Week
          </TabsTrigger>
          <TabsTrigger value="preferences" className="px-3 py-2">
            Preferences
          </TabsTrigger>
          <TabsTrigger value="overlap" className="px-3 py-2">
            Friend Overlap
          </TabsTrigger>
          <TabsTrigger value="walk" className="px-3 py-2">
            Walk Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-4 outline-none">
          <OnboardingChecklist
            hasSyllabusExtras={hasSyllabusExtras}
            hasPreferences={preferences.length > 0}
            onGoPreferences={() => setTab("preferences")}
          />

          <Card className="border-border bg-[var(--surface)]">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Your week</CardTitle>
                  <CardDescription>
                    Demo UCLA schedule — CS 31, GE Cluster, plus your preferences. Click an empty
                    hour to protect it.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-prefs"
                    checked={showPreferences}
                    onCheckedChange={setShowPreferences}
                  />
                  <Label htmlFor="show-prefs" className="text-xs text-muted-foreground">
                    Show preferences
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <WeekCalendar
                events={myWeekEvents}
                personId="you"
                showPreferences={showPreferences}
                onEmptySlotClick={(dayISO, hour) => setProtectSlot({ dayISO, hour })}
              />
            </CardContent>
          </Card>

          <SyllabusPaste onParsed={handleParsed} />
        </TabsContent>

        <TabsContent value="preferences" className="outline-none">
          <PreferencesPanel preferences={preferences} onChange={handlePreferencesChange} />
        </TabsContent>

        <TabsContent value="overlap" className="outline-none">
          <OverlapView
            events={allEvents}
            slots={overlapSlots}
            mode={overlapMode}
            onModeChange={setOverlapMode}
          />
        </TabsContent>

        <TabsContent value="walk" className="outline-none">
          <WalkAlerts warnings={warnings} />
        </TabsContent>
      </Tabs>

      <ProtectThisDialog
        open={protectSlot != null}
        dayISO={protectSlot?.dayISO ?? null}
        hour={protectSlot?.hour ?? null}
        onOpenChange={(open) => {
          if (!open) setProtectSlot(null);
        }}
        onConfirm={confirmProtect}
      />
    </main>
  );
}
