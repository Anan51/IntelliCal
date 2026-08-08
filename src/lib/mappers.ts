import type { CalEvent as DbEvent, Preference as DbPref, Person as DbPerson, ShareLink as DbShare } from "@prisma/client";
import type { CalEvent, EventKind, EventSource, Person, Preference, ShareLink, TimeWindow, TravelMode } from "./types";

export function toCalEvent(row: DbEvent): CalEvent {
  return {
    id: row.id,
    personId: row.personId,
    title: row.title,
    start: row.start,
    end: row.end,
    kind: row.kind as EventKind,
    recurrence: row.recurrence ?? undefined,
    location: row.locationRaw
      ? {
          raw: row.locationRaw,
          building: row.building ?? undefined,
          room: row.room ?? undefined,
          lat: row.lat ?? undefined,
          lng: row.lng ?? undefined,
        }
      : undefined,
    source: row.source as EventSource,
    externalId: row.externalId ?? undefined,
    contentHash: row.contentHash ?? undefined,
    updatedAt: row.updatedAt,
  };
}

export function fromCalEvent(event: CalEvent) {
  return {
    id: event.id,
    personId: event.personId,
    title: event.title,
    start: event.start,
    end: event.end,
    kind: event.kind,
    recurrence: event.recurrence ?? null,
    locationRaw: event.location?.raw ?? null,
    building: event.location?.building ?? null,
    room: event.location?.room ?? null,
    lat: event.location?.lat ?? null,
    lng: event.location?.lng ?? null,
    source: event.source,
    externalId: event.externalId ?? null,
    contentHash: event.contentHash ?? null,
    updatedAt: event.updatedAt,
  };
}

export function toPreference(row: DbPref): Preference {
  return {
    id: row.id,
    personId: row.personId,
    label: row.label,
    targetPerWeek: row.targetPerWeek,
    durationMin: row.durationMin,
    windows: JSON.parse(row.windowsJson) as TimeWindow[],
    priority: row.priority as 1 | 2 | 3,
  };
}

export function fromPreference(pref: Preference) {
  return {
    id: pref.id,
    personId: pref.personId,
    label: pref.label,
    targetPerWeek: pref.targetPerWeek,
    durationMin: pref.durationMin,
    windowsJson: JSON.stringify(pref.windows),
    priority: pref.priority,
  };
}

export function toPerson(row: DbPerson): Person {
  return {
    id: row.id,
    name: row.name,
    homeAddress: row.homeAddress ?? undefined,
    homeLat: row.homeLat ?? undefined,
    homeLng: row.homeLng ?? undefined,
    travelMode: row.travelMode as TravelMode,
  };
}

export function toShareLink(row: DbShare): ShareLink {
  return {
    token: row.token,
    personId: row.personId,
    expiresAt: row.expiresAt,
    scope: "free_busy",
    revoked: row.revoked,
    prefsAsFree: row.prefsAsFree,
  };
}
