import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agent_templates")
      .select("id,name,tagline,backstory,personality_traits,languages,accent_color")
      .not("elevenlabs_agent_id", "is", null)
      .order("name");

    if (error) throw error;

    return NextResponse.json(
      { companions: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json({ error: "Unable to load companions" }, { status: 503 });
  }
}
