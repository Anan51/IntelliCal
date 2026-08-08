import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEMO_WEEK_START } from "@/lib/constants";
import { projectFreeBusy } from "@/lib/freeBusy";
import { toCalEvent, toShareLink } from "@/lib/mappers";
import { ensureSeeded } from "@/lib/seed";
import { addDaysISO, localDateTimeISO } from "@/lib/time";

export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Params) {
  await ensureSeeded();
  const { token } = await params;
  const link = await prisma.shareLink.findUnique({ where: { token } });
  if (!link || link.revoked) {
    return NextResponse.json({ error: "Link revoked or not found", status: "dead" }, { status: 404 });
  }
  if (new Date(link.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "Link expired", status: "expired" }, { status: 410 });
  }

  const events = await prisma.calEvent.findMany({ where: { personId: link.personId } });
  const calEvents = events.map(toCalEvent);
  const busy = projectFreeBusy(calEvents, {
    rangeStart: new Date(localDateTimeISO(DEMO_WEEK_START, "00:00")),
    rangeEnd: new Date(localDateTimeISO(addDaysISO(DEMO_WEEK_START, 7), "00:00")),
    prefsAsFree: link.prefsAsFree,
  });

  // Privacy: times only — never titles/kinds/locations.
  return NextResponse.json({
    status: "ok",
    link: toShareLink(link),
    ownerName: "A friend",
    weekStartISO: DEMO_WEEK_START,
    busy,
  });
}
