"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import WeekCalendar from "@/components/WeekCalendar";
import { Badge, Empty, Section } from "@/components/ui";
import { ALEX_ID, DEMO_WEEK_START, YOU_ID } from "@/lib/constants";
import { freeOverlapWeek, topHangoutSuggestions } from "@/lib/overlap";
import { formatDayLabel, formatTimeLabel } from "@/lib/time";
import type { BusyBlock, CalEvent } from "@/lib/types";
import { useCalendarStore } from "@/store/calendarStore";

type ShareResponse =
  | { status: "ok"; busy: BusyBlock[]; weekStartISO: string; ownerName: string }
  | { status: "dead" | "expired"; error: string };

export default function SharePage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<ShareResponse | null>(null);
  const visitorEvents = useCalendarStore((s) => s.events);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/share/${params.token}`)
      .then(async (r) => {
        const json = (await r.json()) as ShareResponse & { error?: string };
        if (!r.ok) {
          return {
            status: r.status === 410 ? "expired" : "dead",
            error: json.error ?? "Link unavailable",
          } satisfies ShareResponse;
        }
        return json;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData({ status: "dead", error: "Could not load share link" });
      });
    return () => {
      cancelled = true;
    };
  }, [params.token]);

  const ownerBusyAsEvents: CalEvent[] = useMemo(() => {
    if (!data || data.status !== "ok") return [];
    return data.busy.map((b, i) => ({
      id: `busy-${i}`,
      personId: "owner",
      title: "Busy",
      start: b.start.slice(0, 19),
      end: b.end.slice(0, 19),
      kind: "external" as const,
      source: "sync" as const,
      updatedAt: new Date().toISOString(),
    }));
  }, [data]);

  const combined = useMemo(() => {
    const mine = visitorEvents.filter((e) => e.personId === YOU_ID || e.personId === ALEX_ID);
    // Map owner busy onto a synthetic person and reuse overlap vs local "you".
    return [
      ...mine,
      ...ownerBusyAsEvents.map((e) => ({ ...e, personId: "owner" })),
    ];
  }, [visitorEvents, ownerBusyAsEvents]);

  const slots = useMemo(() => {
    if (!data || data.status !== "ok") return [];
    return freeOverlapWeek(combined, YOU_ID, "owner", data.weekStartISO ?? DEMO_WEEK_START);
  }, [combined, data]);

  const suggestions = topHangoutSuggestions(
    slots.map((s) => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
      dayISO: s.dayISO,
      durationMin: s.durationMin,
    })),
    3
  );

  if (!data) {
    return (
      <main className="app-shell">
        <Section title="Loading share link…">
          <Empty>Fetching free/busy…</Empty>
        </Section>
      </main>
    );
  }

  if (data.status !== "ok") {
    return (
      <main className="app-shell">
        <Section title="Link unavailable">
          <Empty>{data.error}. Ask your friend for a fresh share link.</Empty>
        </Section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="brand">IntelliCal</p>
          <h1>Find a time with {data.ownerName}</h1>
          <p className="lede">
            You only see free/busy blocks — never class names or locations. Signed-in comparison uses
            your local demo calendar.
          </p>
        </div>
      </header>

      <div className="stack">
        <Section
          title="Owner availability"
          subtitle="Busy blocks from the share link (titles stripped)."
        >
          <WeekCalendar events={ownerBusyAsEvents} weekStart={data.weekStartISO} />
        </Section>

        <Section
          title="Your overlap"
          subtitle="Compared against your local IntelliCal week (demo You)."
          actions={<Badge tone="good">{slots.length} shared slots</Badge>}
        >
          <WeekCalendar
            events={combined}
            weekStart={data.weekStartISO}
            overlapSlots={slots}
            showOverlap
          />
        </Section>

        <Section title="Suggested hangout times">
          {suggestions.length === 0 ? (
            <Empty>No overlapping free windows this week.</Empty>
          ) : (
            <ol className="suggest-list">
              {suggestions.map((s, i) => (
                <li key={`${s.dayISO}-${i}`}>
                  <Badge tone="good">#{i + 1}</Badge>{" "}
                  <strong>{formatDayLabel(s.dayISO)}</strong>{" "}
                  {formatTimeLabel(s.start)} – {formatTimeLabel(s.end)}
                </li>
              ))}
            </ol>
          )}
        </Section>
      </div>
    </main>
  );
}
