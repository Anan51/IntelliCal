import { applyArrangement, arrangePreferences } from "./arrange";
import { DEMO_WEEK_START } from "./constants";
import { prisma } from "./db";
import { demoEvents, demoPreferences, demoShareLink, people } from "./demo-data";
import { fromCalEvent, fromPreference } from "./mappers";

export async function ensureSeeded(): Promise<void> {
  const count = await prisma.person.count();
  if (count > 0) return;

  for (const p of people) {
    await prisma.person.create({
      data: {
        id: p.id,
        name: p.name,
        homeAddress: p.homeAddress ?? null,
        homeLat: p.homeLat ?? null,
        homeLng: p.homeLng ?? null,
        travelMode: p.travelMode,
      },
    });
  }

  const arranged = arrangePreferences(demoEvents, demoPreferences, {
    weekStartISO: DEMO_WEEK_START,
  });
  const events = applyArrangement(demoEvents, arranged.placed, DEMO_WEEK_START);

  for (const e of events) {
    await prisma.calEvent.create({ data: fromCalEvent(e) });
  }

  for (const pref of demoPreferences) {
    await prisma.preference.create({ data: fromPreference(pref) });
  }

  await prisma.shareLink.create({
    data: {
      token: demoShareLink.token,
      personId: demoShareLink.personId,
      expiresAt: demoShareLink.expiresAt,
      scope: demoShareLink.scope,
      revoked: demoShareLink.revoked,
      prefsAsFree: demoShareLink.prefsAsFree,
    },
  });
}
