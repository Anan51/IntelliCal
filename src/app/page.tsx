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
import {
  MOCK_GCAL_EVENTS,
  MOCK_PREF_SUGGESTIONS,
  type PrefSuggestion,
} from "@/lib/mock-gcal";
import AppShell, { type AppTab } from "@/components/AppShell";
import WeekCalendar from "@/components/WeekCalendar";
import SyllabusPaste from "@/components/SyllabusPaste";
import OverlapView from "@/components/OverlapView";
import WalkAlerts from "@/components/WalkAlerts";
import PreferencesPanel from "@/components/PreferencesPanel";
import ProtectThisDialog from "@/components/ProtectThisDialog";
import EventPrefSheet from "@/components/EventPrefSheet";
import SuggestionCards from "@/components/SuggestionCards";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const CONNECTED_KEY = "intellical:gcal-connected:v1";
const DISMISSED_KEY = "intellical:suggestions-dismissed:v1";

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
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setPreferences(loadPreferences());
    try {
      setCalendarConnected(localStorage.getItem(CONNECTED_KEY) === "1");
      const raw = localStorage.getItem(DISMISSED_KEY);
      if (raw) setDismissedSuggestions(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
    setPrefsHydrated(true);
  }, []);

  useEffect(() => {
    if (!prefsHydrated) return;
    savePreferences(preferences);
  }, [preferences, prefsHydrated]);

  useEffect(() => {
    if (!prefsHydrated) return;
    if (!calendarConnected) return;
    setEvents((prev) => {
      const withoutGcal = prev.filter((e) => e.source !== "gcal");
      const toAdd = MOCK_GCAL_EVENTS.filter((g) => !withoutGcal.some((e) => e.id === g.id));
      return [...withoutGcal, ...toAdd];
    });
  }, [calendarConnected, prefsHydrated]);

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
  const editingPref = preferences.find((p) => p.id === editingPrefId) ?? null;

  const openSuggestions = useMemo(() => {
    if (!calendarConnected) return [];
    return MOCK_PREF_SUGGESTIONS.filter((s) => {
      if (dismissedSuggestions.includes(s.id)) return false;
      // Don't suggest if category already present
      return !preferences.some((p) => p.category === s.draft.category);
    });
  }, [calendarConnected, dismissedSuggestions, preferences]);

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

  function connectCalendar() {
    setCalendarConnected(true);
    localStorage.setItem(CONNECTED_KEY, "1");
    setTab("week");
  }

  function acceptSuggestion(s: PrefSuggestion) {
    setPreferences((prev) => {
      if (prev.some((p) => p.category === s.draft.category || p.id === s.draft.id)) {
        return prev;
      }
      return [...prev, { ...s.draft, id: s.draft.id }];
    });
  }

  function dismissSuggestion(id: string) {
    setDismissedSuggestions((prev) => {
      const next = [...prev, id];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <AppShell
      tab={tab}
      onTabChange={setTab}
      calendarConnected={calendarConnected}
      onConnectCalendar={connectCalendar}
    >
      {tab === "week" && (
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-[20px] font-semibold tracking-tight text-[var(--text)]">
              Week of Sep 28
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {!calendarConnected && (
                <Button size="sm" variant="outline" onClick={connectCalendar}>
                  Connect calendar
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  id="show-prefs"
                  checked={showPreferences}
                  onCheckedChange={setShowPreferences}
                />
                <Label
                  htmlFor="show-prefs"
                  className="text-[12px] text-[var(--text-secondary)]"
                >
                  Preferences
                </Label>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setTab("preferences")}>
                Edit
              </Button>
            </div>
          </div>

          {warnings.length > 0 && (
            <button
              type="button"
              onClick={() => setTab("walk")}
              className="text-left text-[12px] text-[var(--warn)] hover:underline"
            >
              {warnings[0].message}
            </button>
          )}

          <SuggestionCards
            suggestions={openSuggestions}
            onAccept={acceptSuggestion}
            onDismiss={dismissSuggestion}
          />

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
