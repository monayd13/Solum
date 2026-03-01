import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { conversationRecordId, elevenlabsConversationId } = await req.json();

    if (!conversationRecordId || !elevenlabsConversationId) {
      return NextResponse.json(
        { error: "conversationRecordId and elevenlabsConversationId are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Link ElevenLabs conversation ID to the Supabase record
    const { error: updateError } = await supabase
      .from("conversations")
      .update({ elevenlabs_conversation_id: elevenlabsConversationId })
      .eq("id", conversationRecordId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to link conversation" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error linking conversation:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
