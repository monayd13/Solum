import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyElevenLabsSignature } from "@/lib/security/webhooks";

export async function GET() {
  return NextResponse.json({
    message: "ElevenLabs Post-Call Webhook Endpoint",
    method: "POST",
    status: "ready",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("ElevenLabs webhook rejected because its secret is not configured");
      return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
    }
    if (!verifyElevenLabsSignature(rawBody, req.headers.get("elevenlabs-signature"), webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // ElevenLabs wraps payload under { type, data, event_timestamp }
    const eventType = body.type;
    const data = body.data ?? body;

    // Only process transcription webhooks
    if (eventType && eventType !== "post_call_transcription") {
      return NextResponse.json({ success: true, message: `Ignored event type: ${eventType}` });
    }

    const conversation_id = data.conversation_id;
    const agent_id = data.agent_id;
    const transcript = data.transcript;
    const call_duration_secs = data.metadata?.call_duration_secs;

    void agent_id;

    if (!conversation_id) {
      return NextResponse.json({ error: "Missing conversation_id" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("elevenlabs_conversation_id", conversation_id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ 
        success: true, 
        message: "Webhook received but conversation not tracked" 
      });
    }

    // ElevenLabs transcript uses 'message' field, not 'content'
    // Use ElevenLabs built-in transcript summary (no external LLM needed)
    const summary = data.analysis?.transcript_summary ?? "";

    // Store the summary as a memory so the companion remembers the conversation
    const memories: { content: string; category: string; importance: number }[] = [];
    if (summary) {
      memories.push({ content: summary, category: "other", importance: 5 });
    }

    // Also extract user messages as lightweight memories
    if (Array.isArray(transcript)) {
      const userMessages = transcript
        .filter((m: { role: string }) => m.role === "user")
        .map((m: { message?: string; content?: string }) => m.message ?? m.content ?? "")
        .filter((msg: string) => msg.length > 20);
      for (const msg of userMessages.slice(0, 3)) {
        memories.push({ content: `User said: ${msg}`, category: "other", importance: 3 });
      }
    }

    await supabase
      .from("conversations")
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: call_duration_secs ?? null,
        transcript,
        summary,
      })
      .eq("id", conversation.id);

    const { count: existingMemories } = await supabase
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversation.id);

    if (!existingMemories && memories.length > 0) {
      const memoryRows = memories.map((m) => ({
        user_id: conversation.user_id,
        agent_id: conversation.agent_id,
        conversation_id: conversation.id,
        content: m.content,
        category: m.category,
        importance: m.importance ?? 5,
      }));
      const { error: memError } = await supabase.from("memories").insert(memoryRows);
      if (memError) console.error("Unable to persist extracted memories", memError.code);
    }

    return NextResponse.json({ success: true, memoriesSaved: memories.length });
  } catch (err) {
    console.error("ElevenLabs webhook processing failed", err instanceof Error ? err.name : "UnknownError");
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
