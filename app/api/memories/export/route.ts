import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("memories")
      .select("id,agent_id,conversation_id,content,category,importance,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), memories: data ?? [] }, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": "attachment; filename=solum-memories.json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to export memories" }, { status: 500 });
  }
}
