import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UUID_PATTERN, validateTranscript } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { conversationRecordId, transcript: transcriptInput } = await req.json();
    const transcript = validateTranscript(transcriptInput);
    if (typeof conversationRecordId !== "string" || !UUID_PATTERN.test(conversationRecordId) || transcript === null) {
      return NextResponse.json({ error: "Valid conversation data is required" }, { status: 400 });
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id,agent_id,started_at")
      .eq("id", conversationRecordId)
      .eq("user_id", user.id)
      .single();
    if (conversationError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const endedAt = new Date();
    const durationSeconds = Math.max(0, Math.round((endedAt.getTime() - new Date(conversation.started_at).getTime()) / 1000));
    const { error: updateError } = await supabase
      .from("conversations")
      .update({ ended_at: endedAt.toISOString(), duration_seconds: durationSeconds, transcript })
      .eq("id", conversation.id)
      .eq("user_id", user.id);
    if (updateError) throw updateError;

    const { count: existingMemories } = await supabase
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversation.id)
      .eq("user_id", user.id);

    const distinctUserMessages = Array.from(
      new Set(transcript.filter((turn) => turn.role === "user").map((turn) => turn.content).filter((content) => content.length > 20)),
    ).slice(0, 5);

    if (!existingMemories && distinctUserMessages.length > 0) {
      const { error: memoryError } = await supabase.from("memories").insert(
        distinctUserMessages.map((content) => ({
          user_id: user.id,
          agent_id: conversation.agent_id,
          conversation_id: conversation.id,
          content,
          category: "other",
          importance: 3,
        })),
      );
      if (memoryError) throw memoryError;
    }

    return NextResponse.json({ success: true, memoriesSaved: existingMemories ? 0 : distinctUserMessages.length });
  } catch {
    return NextResponse.json({ error: "Unable to complete the conversation" }, { status: 500 });
  }
}
