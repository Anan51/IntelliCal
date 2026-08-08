import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const configured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  return NextResponse.json({
    configured,
    provider: "google",
    message: configured
      ? "Google Calendar OAuth is configured."
      : "Google Calendar sync is not configured. Demo mode works without it.",
  });
}
