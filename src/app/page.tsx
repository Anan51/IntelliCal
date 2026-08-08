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

const TAB_META: Record<Tab, { title: string; blurb: string }> = {
  week: {
    title: "Command the week",
    blurb: "Classes, exams, and arranged blocks on one grid. Click any event to edit or pin.",
  },
  preferences: {
    title: "Protect the non-negotiables",
    blurb: "Gym, downtime, social. The arranger finds free windows and places them for you.",
  },
  overlap: {
    title: "Find the hangout gap",
    blurb: "Shared free time with Alex, ranked by length. No when2meet painting.",
  },
  walk: {
    title: "Respect the campus map",
    blurb: "Leave-by cues and tight Boelter↔Bunche warnings before you sprint.",
  },
  share: {
    title: "One link, free/busy only",
    blurb: "Friends see availability, never titles or locations.",
  },
  sync: {
    title: "Keep calendars honest",
    blurb: "Two-way Google sync when configured. Demo reconcile works without keys.",
  },
};

export default function Home() {
  const [tab, setTab] = useState<Tab>("week");
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const events = useCalendarStore((s) => s.events);
  const weekStartISO = useCalendarStore((s) => s.weekStartISO);
  const people = useCalendarStore((s) => s.people);
  const preferences = useCalendarStore((s) => s.preferences);
  const hydrateFromServer = useCalendarStore((s) => s.hydrateFromServer);
  const resetDemo = useCalendarStore((s) => s.resetDemo);
  const upsertEvent = useCalendarStore((s) => s.upsertEvent);
  const removeEvent = useCalendarStore((s) => s.removeEvent);
  const pinEvent = useCalendarStore((s) => s.pinEvent);
  const rearrange = useCalendarStore((s) => s.rearrange);

  const you = people.find((p) => p.id === YOU_ID);
  const yourEvents = events.filter((e) => e.personId === YOU_ID);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/bootstrap")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) hydrateFromServer(data);
      })
      .catch(() => undefined);
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

  const tightCount = cues.filter((c) => c.tight).length;
  const meta = TAB_META[tab];

  return (
    <div className="chaos-root">
      <div className="chaos-noise" aria-hidden="true" />
      <div className="chaos-slash" aria-hidden="true" />

      <main className="app-shell">
        <header className="masthead">
          <div className="masthead-brand">
            <p className="brand">
              Intelli<span>Cal</span>
            </p>
            <p className="chaos-stamp">CHAOS → ORDER</p>
          </div>

          <div className="masthead-copy">
            <h1>
              Your quarter,
              <span className="strike"> scrambled</span>
              <span className="volt-text"> arranged.</span>
            </h1>
            <p className="lede">
              Syllabi, walk times, gym blocks, and friend overlap in one production calendar.
              Built for Week 1 chaos. Tuned for daily use.
            </p>
          </div>

          <div className="masthead-actions">
            <Button variant="secondary" onClick={resetDemo}>
              Reset demo
            </Button>
            <Button onClick={rearrange}>Re-arrange</Button>
          </div>

          <dl className="stat-strip" aria-label="Schedule snapshot">
            <div>
              <dt>Events</dt>
              <dd>{yourEvents.length}</dd>
            </div>
            <div>
              <dt>Prefs</dt>
              <dd>{preferences.length}</dd>
            </div>
            <div>
              <dt>Tight walks</dt>
              <dd className={tightCount ? "hot" : undefined}>{tightCount}</dd>
            </div>
            <div>
              <dt>Week of</dt>
              <dd className="mono">{weekStartISO}</dd>
            </div>
          </dl>
        </header>

        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "week", label: "My Week", hint: "Grid" },
            { id: "preferences", label: "Preferences", hint: "Arrange" },
            { id: "overlap", label: "Overlap", hint: "Friends" },
            { id: "walk", label: "Walk", hint: "Campus" },
            { id: "share", label: "Share", hint: "Link" },
            { id: "sync", label: "Sync", hint: "Google" },
          ]}
        />

        <div className="view-banner" key={tab}>
          <p className="kicker">Active module</p>
          <h2>{meta.title}</h2>
          <p className="subtitle">{meta.blurb}</p>
        </div>

        {tab === "week" && (
          <div className="stack">
            <Section kicker="01 / Calendar" title="This week" subtitle={meta.blurb}>
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
    </div>
  );
}
