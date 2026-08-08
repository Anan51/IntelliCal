"use client";

import { useEffect, useMemo, useState } from "react";
import EventModal from "@/components/EventModal";
import OverlapView from "@/components/OverlapView";
import PreferencesPanel from "@/components/PreferencesPanel";
import SharePanel from "@/components/SharePanel";
import SyllabusIntake from "@/components/SyllabusIntake";
import SyncPanel from "@/components/SyncPanel";
import WalkAlerts from "@/components/WalkAlerts";
import WeekCalendar from "@/components/WeekCalendar";
import { Button, Section, TabBar } from "@/components/ui";
import type { CalEvent } from "@/lib/types";
import { allTransitionCues } from "@/lib/walkTimes";
import { YOU_ID, useCalendarStore } from "@/store/calendarStore";

type Tab = "week" | "preferences" | "overlap" | "walk" | "share" | "sync";

export default function Home() {
  const [tab, setTab] = useState<Tab>("week");
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const events = useCalendarStore((s) => s.events);
  const weekStartISO = useCalendarStore((s) => s.weekStartISO);
  const people = useCalendarStore((s) => s.people);
  const hydrateFromServer = useCalendarStore((s) => s.hydrateFromServer);
  const resetDemo = useCalendarStore((s) => s.resetDemo);
  const upsertEvent = useCalendarStore((s) => s.upsertEvent);
  const removeEvent = useCalendarStore((s) => s.removeEvent);
  const pinEvent = useCalendarStore((s) => s.pinEvent);
  const rearrange = useCalendarStore((s) => s.rearrange);

  const you = people.find((p) => p.id === YOU_ID);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/bootstrap")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) hydrateFromServer(data);
      })
      .catch(() => {
        // Client demo seed already loaded in the store.
      });
    return () => {
      cancelled = true;
    };
  }, [hydrateFromServer]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void fetch("/api/events", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ events }),
      }).catch(() => undefined);
    }, 800);
    return () => window.clearTimeout(id);
  }, [events]);

  const cues = useMemo(
    () =>
      allTransitionCues(
        events,
        YOU_ID,
        you?.travelMode ?? "walk",
        you?.homeLat != null && you.homeLng != null
          ? { lat: you.homeLat, lng: you.homeLng, raw: you.homeAddress }
          : undefined
      ),
    [events, you]
  );

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="brand">IntelliCal</p>
          <h1>Your quarter, already arranged.</h1>
          <p className="lede">
            Syllabi in, walk times counted, gym protected, friends overlapping — without painting
            when2meet by hand.
          </p>
        </div>
        <div className="header-actions">
          <Button variant="secondary" onClick={resetDemo}>
            Reset demo
          </Button>
          <Button variant="secondary" onClick={rearrange}>
            Re-arrange prefs
          </Button>
        </div>
      </header>

      <TabBar
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "week", label: "My Week" },
          { id: "preferences", label: "Preferences" },
          { id: "overlap", label: "Friend Overlap" },
          { id: "walk", label: "Walk" },
          { id: "share", label: "Share" },
          { id: "sync", label: "Sync" },
        ]}
      />

      {tab === "week" && (
        <div className="stack">
          <Section
            title="Your week"
            subtitle="Demo UCLA schedule with arranged preference blocks. Click an event to edit or pin."
          >
            <WeekCalendar
              events={events}
              personId={YOU_ID}
              weekStart={weekStartISO}
              cues={cues}
              onEventClick={setSelected}
            />
          </Section>
          <SyllabusIntake />
        </div>
      )}

      {tab === "preferences" && <PreferencesPanel />}
      {tab === "overlap" && <OverlapView />}
      {tab === "walk" && <WalkAlerts />}
      {tab === "share" && <SharePanel />}
      {tab === "sync" && <SyncPanel />}

      {selected ? (
        <EventModal
          event={selected}
          onClose={() => setSelected(null)}
          onSave={(e) => {
            upsertEvent(e);
            setSelected(null);
          }}
          onDelete={(id) => {
            removeEvent(id);
            setSelected(null);
          }}
          onPin={(id) => {
            pinEvent(id);
            setSelected(null);
          }}
        />
      ) : null}
    </main>
  );
}
