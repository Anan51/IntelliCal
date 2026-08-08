"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="chaos-root">
      <div className="chaos-noise" aria-hidden="true" />
      <div className="chaos-slash" aria-hidden="true" />
      <main className="app-shell">{children}</main>
    </div>
  );
}

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
      <Shell>
        <Section kicker="Share" title="Loading share link…">
          <Empty>Fetching free/busy…</Empty>
        </Section>
      </Shell>
    );
  }

  if (data.status !== "ok") {
    return (
      <Shell>
        <Section kicker="Dead link" title="Link unavailable">
          <Empty>{data.error}. Ask your friend for a fresh share link.</Empty>
        </Section>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="masthead">
        <div className="masthead-brand">
          <p className="brand">
            Intelli<span>Cal</span>
          </p>
          <p className="chaos-stamp">SHARED FREE/BUSY</p>
        </div>
        <div className="masthead-copy">
          <h1>Find a time with {data.ownerName}</h1>
          <p className="lede">
            Times only. No class names, no locations. Your local demo calendar powers the overlap
            comparison.
          </p>
        </div>
        <div className="masthead-actions">
          <a className="btn btn-secondary" href="/">
            Back to app
          </a>
        </div>
        <dl className="stat-strip" aria-label="Share snapshot">
          <div>
            <dt>Busy blocks</dt>
            <dd>{data.busy.length}</dd>
          </div>
          <div>
            <dt>Shared slots</dt>
            <dd>{slots.length}</dd>
          </div>
          <div>
            <dt>Top picks</dt>
            <dd>{suggestions.length}</dd>
          </div>
          <div>
            <dt>Week of</dt>
            <dd className="mono">{data.weekStartISO}</dd>
          </div>
        </dl>
      </header>

      <div className="stack" style={{ marginTop: 18 }}>
        <Section
          kicker="01 / Owner"
          title="Owner availability"
          subtitle="Busy blocks from the share link. Titles stripped on purpose."
        >
          <WeekCalendar events={ownerBusyAsEvents} weekStart={data.weekStartISO} />
        </Section>

        <Section
          kicker="02 / Overlap"
          title="Your overlap"
          subtitle="Compared against your local IntelliCal week."
          actions={<Badge tone="good">{slots.length} shared</Badge>}
        >
          <WeekCalendar
            events={combined}
            weekStart={data.weekStartISO}
            overlapSlots={slots}
            showOverlap
          />
        </Section>

        <Section kicker="03 / Suggest" title="Suggested hangout times">
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
    </Shell>
  );
}
