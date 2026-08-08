"use client";

import { create } from "zustand";
import { applyArrangement, arrangePreferences } from "@/lib/arrange";
import {
  ALEX_ID,
  DEMO_WEEK_START,
  YOU_ID,
  demoEvents,
  demoPreferences,
  demoShareLink,
  people as demoPeople,
} from "@/lib/demo-data";
import { eventContentHash } from "@/lib/hash";
import { newId } from "@/lib/id";
import type {
  ArrangeResult,
  CalEvent,
  ParsedEvent,
  Person,
  Preference,
  ShareLink,
} from "@/lib/types";

type CalendarState = {
  hydrated: boolean;
  weekStartISO: string;
  people: Person[];
  events: CalEvent[];
  preferences: Preference[];
  shareLinks: ShareLink[];
  parseDrafts: ParsedEvent[];
  arrangeMeta: ArrangeResult["unmet"];
  prefsAsFreeForOverlap: boolean;
  activePersonId: string;

  hydrateFromServer: (payload: {
    events: CalEvent[];
    preferences: Preference[];
    people: Person[];
    shareLinks: ShareLink[];
  }) => void;
  resetDemo: () => void;
  setWeekStart: (iso: string) => void;
  setEvents: (events: CalEvent[]) => void;
  upsertEvent: (event: CalEvent) => void;
  removeEvent: (id: string) => void;
  pinEvent: (id: string) => void;
  setParseDrafts: (drafts: ParsedEvent[]) => void;
  updateParseDraft: (draftId: string, patch: Partial<ParsedEvent>) => void;
  commitParseDrafts: () => void;
  setPreferences: (prefs: Preference[]) => void;
  upsertPreference: (pref: Preference) => void;
  removePreference: (id: string) => void;
  rearrange: () => void;
  setPrefsAsFreeForOverlap: (v: boolean) => void;
  addShareLink: (link: ShareLink) => void;
  revokeShareLink: (token: string) => void;
};

function withHash(event: CalEvent): CalEvent {
  return {
    ...event,
    updatedAt: event.updatedAt || new Date().toISOString(),
    contentHash: eventContentHash(event),
  };
}

function seedArranged(): { events: CalEvent[]; unmet: ArrangeResult["unmet"] } {
  const result = arrangePreferences(demoEvents, demoPreferences, {
    weekStartISO: DEMO_WEEK_START,
  });
  return {
    events: applyArrangement(demoEvents, result.placed, DEMO_WEEK_START),
    unmet: result.unmet,
  };
}

const seeded = seedArranged();

export const useCalendarStore = create<CalendarState>((set, get) => ({
  hydrated: false,
  weekStartISO: DEMO_WEEK_START,
  people: demoPeople,
  events: seeded.events,
  preferences: demoPreferences,
  shareLinks: [demoShareLink],
  parseDrafts: [],
  arrangeMeta: seeded.unmet,
  prefsAsFreeForOverlap: false,
  activePersonId: YOU_ID,

  hydrateFromServer: (payload) => {
    if (payload.events.length === 0) {
      set({ hydrated: true });
      return;
    }
    set({
      hydrated: true,
      events: payload.events,
      preferences: payload.preferences.length ? payload.preferences : get().preferences,
      people: payload.people.length ? payload.people : get().people,
      shareLinks: payload.shareLinks.length ? payload.shareLinks : get().shareLinks,
    });
  },

  resetDemo: () => {
    const next = seedArranged();
    set({
      events: next.events,
      preferences: demoPreferences,
      people: demoPeople,
      shareLinks: [demoShareLink],
      parseDrafts: [],
      arrangeMeta: next.unmet,
      weekStartISO: DEMO_WEEK_START,
    });
  },

  setWeekStart: (iso) => set({ weekStartISO: iso }),

  setEvents: (events) => set({ events }),

  upsertEvent: (event) =>
    set((s) => {
      const next = withHash(event);
      const exists = s.events.some((e) => e.id === next.id);
      return {
        events: exists
          ? s.events.map((e) => (e.id === next.id ? next : e))
          : [...s.events, next],
      };
    }),

  removeEvent: (id) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

  pinEvent: (id) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id ? withHash({ ...e, source: "manual" }) : e
      ),
    })),

  setParseDrafts: (drafts) => set({ parseDrafts: drafts }),

  updateParseDraft: (draftId, patch) =>
    set((s) => ({
      parseDrafts: s.parseDrafts.map((d) =>
        d.draftId === draftId ? { ...d, ...patch } : d
      ),
    })),

  commitParseDrafts: () => {
    const { parseDrafts, events, preferences, weekStartISO, activePersonId } = get();
    const now = new Date().toISOString();
    const incoming: CalEvent[] = parseDrafts.map((d) =>
      withHash({
        id: newId("evt"),
        personId: activePersonId,
        title: d.title,
        start: d.start,
        end: d.end,
        kind: d.kind,
        location: d.location,
        recurrence: d.recurrence,
        source: "syllabus",
        updatedAt: now,
      })
    );
    const merged = [...events, ...incoming];
    const arranged = arrangePreferences(merged, preferences, { weekStartISO });
    set({
      events: applyArrangement(merged, arranged.placed, weekStartISO),
      parseDrafts: [],
      arrangeMeta: arranged.unmet,
    });
  },

  setPreferences: (prefs) => set({ preferences: prefs }),

  upsertPreference: (pref) =>
    set((s) => {
      const exists = s.preferences.some((p) => p.id === pref.id);
      const preferences = exists
        ? s.preferences.map((p) => (p.id === pref.id ? pref : p))
        : [...s.preferences, pref];
      return { preferences };
    }),

  removePreference: (id) =>
    set((s) => ({ preferences: s.preferences.filter((p) => p.id !== id) })),

  rearrange: () => {
    const { events, preferences, weekStartISO } = get();
    const arranged = arrangePreferences(events, preferences, { weekStartISO });
    set({
      events: applyArrangement(events, arranged.placed, weekStartISO),
      arrangeMeta: arranged.unmet,
    });
  },

  setPrefsAsFreeForOverlap: (v) => set({ prefsAsFreeForOverlap: v }),

  addShareLink: (link) =>
    set((s) => ({ shareLinks: [...s.shareLinks, link] })),

  revokeShareLink: (token) =>
    set((s) => ({
      shareLinks: s.shareLinks.map((l) =>
        l.token === token ? { ...l, revoked: true } : l
      ),
    })),
}));

export { YOU_ID, ALEX_ID, DEMO_WEEK_START };
