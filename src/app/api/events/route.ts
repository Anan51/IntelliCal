import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fromCalEvent, toCalEvent } from "@/lib/mappers";
import type { CalEvent } from "@/lib/types";
import { ensureSeeded } from "@/lib/seed";

export const runtime = "nodejs";

export async function GET() {
  await ensureSeeded();
  const rows = await prisma.calEvent.findMany();
  return NextResponse.json(rows.map(toCalEvent));
}

export async function PUT(req: Request) {
  await ensureSeeded();
  const body = (await req.json()) as { events?: CalEvent[] };
  if (!Array.isArray(body.events)) {
    return NextResponse.json({ error: "events array required" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.calEvent.deleteMany(),
    ...body.events.map((e) =>
      prisma.calEvent.create({ data: fromCalEvent(e) })
    ),
  ]);

  const rows = await prisma.calEvent.findMany();
  return NextResponse.json(rows.map(toCalEvent));
}
