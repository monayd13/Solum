import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UUID_PATTERN } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const { conversationRecordId, elevenlabsConversationId } = await req.json();

    if (
      typeof conversationRecordId !== "string" ||
      !UUID_PATTERN.test(conversationRecordId) ||
      typeof elevenlabsConversationId !== "string" ||
      !/^[A-Za-z0-9_-]{8,128}$/.test(elevenlabsConversationId)
    ) {
      return NextResponse.json(
        { error: "Valid conversation identifiers are required" },
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
  } catch {
    return NextResponse.json(
      { error: "Unable to link the conversation" },
      { status: 500 }
    );
  }
}
