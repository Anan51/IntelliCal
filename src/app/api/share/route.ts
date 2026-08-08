import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { newId } from "@/lib/id";
import { toShareLink } from "@/lib/mappers";
import { ensureSeeded } from "@/lib/seed";
import { YOU_ID } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET() {
  await ensureSeeded();
  const rows = await prisma.shareLink.findMany();
  return NextResponse.json(rows.map(toShareLink));
}

export async function POST(req: Request) {
  await ensureSeeded();
  const body = (await req.json()) as {
    personId?: string;
    prefsAsFree?: boolean;
    daysValid?: number;
  };
  const personId = body.personId ?? YOU_ID;
  const daysValid = body.daysValid ?? 30;
  const expires = new Date();
  expires.setDate(expires.getDate() + daysValid);

  const row = await prisma.shareLink.create({
    data: {
      token: newId("share"),
      personId,
      expiresAt: expires.toISOString(),
      scope: "free_busy",
      revoked: false,
      prefsAsFree: Boolean(body.prefsAsFree),
    },
  });

  return NextResponse.json(toShareLink(row));
}

export async function DELETE(req: Request) {
  await ensureSeeded();
  const body = (await req.json()) as { token?: string };
  if (!body.token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }
  await prisma.shareLink.update({
    where: { token: body.token },
    data: { revoked: true },
  });
  return NextResponse.json({ ok: true });
}
