import { haversineKm } from "./resolveLocation";
import type { Location, TravelEstimate, TravelMode } from "./types";

/** Known UCLA walk times in minutes (static, authoritative when present). */
export const STATIC_WALK_MIN: Record<string, number> = {
  "Boelter Hall|Bunche Hall": 12,
  "Bunche Hall|Boelter Hall": 12,
  "Boelter Hall|Royce Hall": 10,
  "Royce Hall|Boelter Hall": 10,
  "Bunche Hall|Powell Library": 8,
  "Powell Library|Bunche Hall": 8,
  "Boelter Hall|John Wooden Center": 6,
  "John Wooden Center|Boelter Hall": 6,
  "Bunche Hall|John Wooden Center": 14,
  "John Wooden Center|Bunche Hall": 14,
};

const SPEED_KMH: Record<TravelMode, number> = {
  walk: 5,
  bike: 14,
  transit: 12,
};

const PATH_FACTOR = 1.3;

function buildingKey(loc?: Location): string | null {
  return loc?.building ?? null;
}

export function staticTravelMin(from?: Location, to?: Location): number | null {
  const a = buildingKey(from);
  const b = buildingKey(to);
  if (!a || !b) return null;
  if (a === b) return 0;
  return STATIC_WALK_MIN[`${a}|${b}`] ?? null;
}

export function estimateTravel(
  from: Location | undefined,
  to: Location | undefined,
  mode: TravelMode = "walk"
): TravelEstimate | null {
  if (!from || !to) return null;
  if (from.building && to.building && from.building === to.building) {
    return { durationMin: 0, approximate: false, mode };
  }

  const known = mode === "walk" ? staticTravelMin(from, to) : null;
  if (known != null) {
    return { durationMin: known, approximate: false, mode };
  }

  if (from.lat == null || from.lng == null || to.lat == null || to.lng == null) {
    return null;
  }

  const km = haversineKm(
    { lat: from.lat, lng: from.lng },
    { lat: to.lat, lng: to.lng }
  );
  const hours = (km * PATH_FACTOR) / SPEED_KMH[mode];
  const durationMin = Math.max(1, Math.round(hours * 60));
  return { durationMin, approximate: true, mode };
}
