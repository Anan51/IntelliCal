import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fromPreference, toPreference } from "@/lib/mappers";
import type { Preference } from "@/lib/types";
import { ensureSeeded } from "@/lib/seed";

export const runtime = "nodejs";

export async function GET() {
  await ensureSeeded();
  const rows = await prisma.preference.findMany();
  return NextResponse.json(rows.map(toPreference));
}

export async function PUT(req: Request) {
  await ensureSeeded();
  const body = (await req.json()) as { preferences?: Preference[] };
  if (!Array.isArray(body.preferences)) {
    return NextResponse.json({ error: "preferences array required" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.preference.deleteMany(),
    ...body.preferences.map((p) =>
      prisma.preference.create({ data: fromPreference(p) })
    ),
  ]);

  const rows = await prisma.preference.findMany();
  return NextResponse.json(rows.map(toPreference));
}
