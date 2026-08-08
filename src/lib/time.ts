import type { DayOfWeek } from "./types";

export const DEFAULT_TZ = "America/Los_Angeles";

/** Parse YYYY-MM-DD as a local calendar date (no TZ shift). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysISO(isoDate: string, days: number): string {
  const dt = parseISODate(isoDate);
  dt.setDate(dt.getDate() + days);
  return formatISODate(dt);
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export function normalizeHHMM(t: string): string {
  const [h, m] = t.split(":");
  return `${pad2(Number(h))}:${pad2(Number(m ?? 0))}`;
}

export function localDateTimeISO(dateISO: string, hhmm: string): string {
  return `${dateISO}T${normalizeHHMM(hhmm)}:00`;
}

export function toMs(iso: string): number {
  return new Date(iso).getTime();
}

export function dayOfWeek(isoDate: string): DayOfWeek {
  return parseISODate(isoDate).getDay() as DayOfWeek;
}

/** Monday-based week start for a date ISO. */
export function weekStartMonday(isoDate: string): string {
  const dt = parseISODate(isoDate);
  const day = dt.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  dt.setDate(dt.getDate() + diff);
  return formatISODate(dt);
}

export function eachDayISO(startISO: string, dayCount: number): string[] {
  return Array.from({ length: dayCount }, (_, i) => addDaysISO(startISO, i));
}

export function formatTimeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDayLabel(dayISO: string): string {
  const d = parseISODate(dayISO);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function sameLocalDay(aISO: string, bISO: string): boolean {
  return aISO.slice(0, 10) === bISO.slice(0, 10);
}

export function durationMin(startISO: string, endISO: string): number {
  return Math.round((toMs(endISO) - toMs(startISO)) / 60_000);
}

export function leaveByISO(startISO: string, travelMin: number): string {
  const leave = new Date(toMs(startISO) - travelMin * 60_000);
  return leave.toISOString().replace(/\.\d{3}Z$/, "");
}

/** Local leave-by as YYYY-MM-DDTHH:mm:ss for UI. */
export function leaveByLocal(startISO: string, travelMin: number): string {
  const leave = new Date(toMs(startISO) - travelMin * 60_000);
  return `${formatISODate(leave)}T${pad2(leave.getHours())}:${pad2(leave.getMinutes())}:00`;
}
