"use client";

import { useEffect, useMemo, useState } from "react";
import EventModal from "@/components/EventModal";
import FriendsView from "@/components/FriendsView";
import SettingsView from "@/components/SettingsView";
import SyllabusModal from "@/components/SyllabusModal";
import WeekCalendar from "@/components/WeekCalendar";
import YearCalendar from "@/components/YearCalendar";
import { Badge, Button } from "@/components/ui";
import { DEMO_YEAR } from "@/lib/constants";
import { addDaysISO, formatDayLabel, weekStartMonday } from "@/lib/time";
import type { CalEvent } from "@/lib/types";
import { allTransitionCues } from "@/lib/walkTimes";
import { YOU_ID, useCalendarStore } from "@/store/calendarStore";

type Nav = "calendar" | "friends" | "settings";
type CalView = "week" | "year";

export default function Home() {
  const [nav, setNav] = useState<Nav>("calendar");
  const [calView, setCalView] = useState<CalView>("week");
  const [year, setYear] = useState(DEMO_YEAR);
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [walkOpen, setWalkOpen] = useState(false);

  const events = useCalendarStore((s) => s.events);
  const weekStartISO = useCalendarStore((s) => s.weekStartISO);
  const setWeekStart = useCalendarStore((s) => s.setWeekStart);
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

  const tight = cues.filter((c) => c.tight);
  const examCount = events.filter(
    (e) => e.personId === YOU_ID && (e.kind === "exam" || e.kind === "due_date")
  ).length;

  function jumpToDay(iso: string) {
    setWeekStart(weekStartMonday(iso));
    setCalView("week");
    setNav("calendar");
  }

  return (
    <div className="chaos-root app-mode">
      <div className="chaos-noise" aria-hidden="true" />

      <div className="app-frame">
        <header className="app-bar">
          <div className="app-bar-left">
            <p className="app-logo">
              Intelli<span>Cal</span>
            </p>
            <span className="app-mark">CHAOS</span>
            <nav className="app-nav" aria-label="Primary">
              {(
                [
                  ["calendar", "Calendar"],
                  ["friends", "Friends"],
                  ["settings", "Settings"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`app-nav-btn${nav === id ? " active" : ""}`}
                  onClick={() => setNav(id)}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="app-bar-right">
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              Import syllabus
            </Button>
            <Button variant="secondary" onClick={rearrange}>
              Re-arrange
            </Button>
            <Button variant="ghost" onClick={resetDemo}>
              Reset
            </Button>
          </div>
        </header>

        <main className="app-main">
          {nav === "calendar" && (
            <section className="workspace">
              <div className="workspace-toolbar">
                <div className="view-switch" role="group" aria-label="Calendar view">
                  <button
                    type="button"
                    className={calView === "week" ? "active" : ""}
                    onClick={() => setCalView("week")}
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    className={calView === "year" ? "active" : ""}
                    onClick={() => setCalView("year")}
                  >
                    Year
                  </button>
                </div>

                {calView === "week" ? (
                  <div className="week-nav">
                    <Button
                      variant="secondary"
                      onClick={() => setWeekStart(addDaysISO(weekStartISO, -7))}
                    >
                      Prev
                    </Button>
                    <p className="week-label">{formatDayLabel(weekStartISO)} week</p>
                    <Button
                      variant="secondary"
                      onClick={() => setWeekStart(addDaysISO(weekStartISO, 7))}
                    >
                      Next
                    </Button>
                  </div>
                ) : (
                  <div className="week-nav">
                    <Button variant="secondary" onClick={() => setYear((y) => y - 1)}>
                      Prev
                    </Button>
                    <p className="week-label">{year}</p>
                    <Button variant="secondary" onClick={() => setYear((y) => y + 1)}>
                      Next
                    </Button>
                  </div>
                )}

                <div className="toolbar-meta">
                  <Badge tone="accent">{examCount} key dates</Badge>
                  {tight.length > 0 ? (
                    <button
                      type="button"
                      className="alert-chip"
                      onClick={() => setWalkOpen((v) => !v)}
                    >
                      {tight.length} tight walk{tight.length === 1 ? "" : "s"}
                    </button>
                  ) : (
                    <Badge tone="good">Walks clear</Badge>
                  )}
                </div>
              </div>

              {walkOpen && tight.length > 0 ? (
                <div className="inline-alerts">
                  {tight.map((c) => (
                    <p key={`${c.fromEventId}-${c.toEventId}`}>
                      <strong>
                        {c.fromLabel} → {c.toLabel}
                      </strong>
                      : {c.gapMin} min gap, needs {c.travelMin + 5} min
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="workspace-body panel">
                {calView === "week" ? (
                  <WeekCalendar
                    events={events}
                    personId={YOU_ID}
                    weekStart={weekStartISO}
                    cues={cues}
                    onEventClick={setSelected}
                  />
                ) : (
                  <YearCalendar
                    year={year}
                    events={events}
                    personId={YOU_ID}
                    onSelectDay={jumpToDay}
                    onEventClick={setSelected}
                  />
                )}
              </div>
            </section>
          )}

          {nav === "friends" && <FriendsView />}
          {nav === "settings" && <SettingsView />}
        </main>
      </div>

      <SyllabusModal open={importOpen} onClose={() => setImportOpen(false)} />

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
    </div>
  );
}
