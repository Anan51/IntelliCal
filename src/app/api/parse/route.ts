import { NextResponse } from "next/server";
import { DEMO_WEEK_START } from "@/lib/constants";
import { parseSyllabus } from "@/lib/parseSyllabus";

export const runtime = "nodejs";

async function readBody(req: Request): Promise<{ text: string; weekStartISO: string }> {
  const contentType = req.headers.get("content-type") ?? "";
  let text = "";
  let weekStartISO = DEMO_WEEK_START;

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { text?: string; weekStartISO?: string };
    text = body.text ?? "";
    weekStartISO = body.weekStartISO ?? DEMO_WEEK_START;
    return { text, weekStartISO };
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    weekStartISO = String(form.get("weekStartISO") ?? DEMO_WEEK_START);
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
    return { text, weekStartISO };
  }

  text = await req.text();
  return { text, weekStartISO };
}

export async function POST(req: Request) {
  try {
    const { text, weekStartISO } = await readBody(req);
    if (!text.trim()) {
      return NextResponse.json({ error: "No syllabus text provided" }, { status: 400 });
    }

    // Optional LLM assist when OPENAI_API_KEY is set (not required).
    // Regex parser is the always-on path so demos never need secrets.
    const drafts = parseSyllabus(text, { weekStartISO, termEndISO: "2026-12-12" });
    return NextResponse.json({
      drafts,
      engine: process.env.OPENAI_API_KEY ? "regex+llm-ready" : "regex",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "parse failed" },
      { status: 400 }
    );
  }
}
