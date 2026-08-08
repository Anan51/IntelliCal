import { NextResponse } from "next/server";
import { resolveLocation } from "@/lib/resolveLocation";
import { estimateTravel } from "@/lib/travelTime";
import type { TravelMode } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    fromRaw?: string;
    toRaw?: string;
    mode?: TravelMode;
  };

  if (!body.fromRaw || !body.toRaw) {
    return NextResponse.json({ error: "fromRaw and toRaw required" }, { status: 400 });
  }

  const mode = body.mode ?? "walk";
  const from = resolveLocation(body.fromRaw);
  const to = resolveLocation(body.toRaw);

  // Live Distance Matrix would run here when GOOGLE_MAPS_API_KEY is set.
  // Campus table + haversine fallback always works without keys.
  const estimate = estimateTravel(from, to, mode);
  if (!estimate) {
    return NextResponse.json({ error: "Could not resolve locations" }, { status: 422 });
  }

  return NextResponse.json({
    from,
    to,
    ...estimate,
    provider: process.env.GOOGLE_MAPS_API_KEY ? "maps-or-static" : "static-or-estimate",
  });
}
