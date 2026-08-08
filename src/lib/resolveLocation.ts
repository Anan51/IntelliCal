import { CAMPUS_BUILDINGS, type Building } from "./data/buildings";
import type { Location } from "./types";

const ROOM_RE = /\b(\d{2,5}[A-Za-z]?)\b/;

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function parseBuildingRaw(raw: string): { buildingName: string; room?: string } {
  const cleaned = raw.trim();
  const roomMatch = cleaned.match(ROOM_RE);
  const room = roomMatch?.[1];
  const buildingName = room
    ? cleaned.replace(roomMatch![0], "").replace(/[,\-#]/g, " ").trim()
    : cleaned;
  return { buildingName, room };
}

export function findBuilding(
  query: string,
  campus = "ucla"
): Building | null {
  const buildings = CAMPUS_BUILDINGS[campus] ?? [];
  const q = normalize(query);
  if (!q) return null;

  for (const b of buildings) {
    if (normalize(b.name) === q) return b;
    if (b.aliases.some((a) => normalize(a) === q)) return b;
  }
  for (const b of buildings) {
    if (q.includes(normalize(b.name)) || b.aliases.some((a) => q.includes(normalize(a)))) {
      return b;
    }
  }
  return null;
}

export function resolveLocation(raw: string, campus = "ucla"): Location {
  const { buildingName, room } = parseBuildingRaw(raw);
  const building = findBuilding(buildingName, campus);
  if (!building) {
    return { raw, room };
  }
  return {
    raw,
    building: building.name,
    room,
    lat: building.lat,
    lng: building.lng,
  };
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
