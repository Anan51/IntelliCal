import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCalEvent, toPerson, toPreference, toShareLink } from "@/lib/mappers";
import { ensureSeeded } from "@/lib/seed";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureSeeded();
    const [people, events, preferences, shareLinks] = await Promise.all([
      prisma.person.findMany(),
      prisma.calEvent.findMany(),
      prisma.preference.findMany(),
      prisma.shareLink.findMany(),
    ]);
    return NextResponse.json({
      people: people.map(toPerson),
      events: events.map(toCalEvent),
      preferences: preferences.map(toPreference),
      shareLinks: shareLinks.map(toShareLink),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "bootstrap failed" },
      { status: 500 }
    );
  }
}
