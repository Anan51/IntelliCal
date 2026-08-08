import { NextResponse } from "next/server";
import { DEMO_WEEK_START } from "@/lib/constants";
import { parseSyllabus } from "@/lib/parseSyllabus";
import { filterImportantDates } from "@/lib/syllabusFilter";

export const runtime = "nodejs";

async function readBody(req: Request): Promise<{
  text: string;
  weekStartISO: string;
  importantDatesOnly: boolean;
}> {
  const contentType = req.headers.get("content-type") ?? "";
  let text = "";
  let weekStartISO = DEMO_WEEK_START;
  let importantDatesOnly = false;

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as {
      text?: string;
      weekStartISO?: string;
      importantDatesOnly?: boolean;
    };
    text = body.text ?? "";
    weekStartISO = body.weekStartISO ?? DEMO_WEEK_START;
    importantDatesOnly = Boolean(body.importantDatesOnly);
    return { text, weekStartISO, importantDatesOnly };
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    weekStartISO = String(form.get("weekStartISO") ?? DEMO_WEEK_START);
    importantDatesOnly = String(form.get("importantDatesOnly") ?? "") === "true";
    const inline = form.get("text");
    if (typeof inline === "string" && inline.trim()) {
      text = inline;
    }
    const file = form.get("file");
    if (file && typeof file !== "string") {
      const name = file.name.toLowerCase();
      if (name.endsWith(".pdf")) {
        throw new Error(
          "PDF upload is not enabled in this build. Paste syllabus text or upload a .txt file."
        );
      }
      text = Buffer.from(await file.arrayBuffer()).toString("utf8");
    }
    return { text, weekStartISO, importantDatesOnly };
  }

  text = await req.text();
  return { text, weekStartISO, importantDatesOnly };
}

export async function POST(req: Request) {
  try {
    const { text, weekStartISO, importantDatesOnly } = await readBody(req);
    if (!text.trim()) {
      return NextResponse.json({ error: "No syllabus text provided" }, { status: 400 });
    }

    const drafts = parseSyllabus(text, {
      weekStartISO,
      termEndISO: "2026-12-12",
      importantDatesOnly,
    });
    const importantHits = filterImportantDates(text);

    return NextResponse.json({
      drafts,
      importantDateCount: importantHits.length,
      importantDates: importantHits.map((h) => ({
        label: h.label,
        dateISO: h.dateISO,
        kind: h.kind,
        startTime: h.startTime,
        endTime: h.endTime,
      })),
      engine: "text-filter",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "parse failed" },
      { status: 400 }
    );
  }
}
