import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    let query = supabase
      .from("memories")
      .select("*")
      .eq("user_id", user.id)
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false });

    if (agentId) {
      query = query.eq("agent_id", agentId);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memories: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memoryId, agentId, deleteAll } = await req.json();

    if (memoryId) {
      // Delete a single memory
      const { error } = await supabase
        .from("memories")
        .delete()
        .eq("id", memoryId)
        .eq("user_id", user.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      console.log("[Memories] Deleted memory:", memoryId, "for user:", user.id);
      return NextResponse.json({ deleted: 1 });
    }

    if (agentId) {
      // Delete all memories for a specific agent
      const { data, error } = await supabase
        .from("memories")
        .delete()
        .eq("user_id", user.id)
        .eq("agent_id", agentId)
        .select("id");

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      console.log("[Memories] Deleted", data?.length, "memories for agent:", agentId, "user:", user.id);
      return NextResponse.json({ deleted: data?.length ?? 0 });
    }

    if (deleteAll) {
      // Delete ALL memories for the user
      const { data, error } = await supabase
        .from("memories")
        .delete()
        .eq("user_id", user.id)
        .select("id");

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      console.log("[Memories] Deleted ALL", data?.length, "memories for user:", user.id);
      return NextResponse.json({ deleted: data?.length ?? 0 });
    }

    return NextResponse.json({ error: "Provide memoryId, agentId, or deleteAll" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
