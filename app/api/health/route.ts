import { NextResponse } from "next/server";
import { checkRuntimeReadiness } from "../../../lib/runtime/readiness";

export async function GET() {
  const readiness = await checkRuntimeReadiness();
  const ready = readiness.checks.supabase === "healthy";

  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "development",
      checks: readiness.checks,
    },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
