import { NextResponse } from "next/server";

export async function GET() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return NextResponse.json(
    { status: configured ? "ok" : "degraded", version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "development" },
    { status: configured ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
