import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ElevenLabsTranscriptTurn {
  role: "agent" | "user";
  message: string;
  time_in_call_secs?: number;
}

interface ElevenLabsWebhookPayload {
  type: "post_call_transcription" | "post_call_audio" | "call_initiation_failure";
  event_timestamp: number;
  data: {
    agent_id: string;
    conversation_id: string;
    status: string;
    transcript?: ElevenLabsTranscriptTurn[];
    metadata?: {
      call_duration_secs?: number;
      start_time_unix_secs?: number;
    };
    analysis?: {
      transcript_summary?: string;
      call_successful?: string;
    };
    conversation_initiation_client_data?: {
      dynamic_variables?: Record<string, string>;
    };
    failure_reason?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload: ElevenLabsWebhookPayload = await req.json();

    // Handle call initiation failures — log and return 200
    if (payload.type === "call_initiation_failure") {
      console.log("Call initiation failed:", payload.data.failure_reason, payload.data.conversation_id);
      return NextResponse.json({ received: true });
    }

    // Only process transcription webhooks
    if (payload.type !== "post_call_transcription") {
      return NextResponse.json({ received: true });
    }

    const { data } = payload;
    const { conversation_id, transcript, metadata, analysis } = data;

    if (!conversation_id) {
      return NextResponse.json({ error: "Missing conversation_id" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Find the conversation record by ElevenLabs conversation ID
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("elevenlabs_conversation_id", conversation_id)
      .single();

    if (convError || !conversation) {
      console.error("Conversation not found for elevenlabs_conversation_id:", conversation_id);
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Format transcript for storage — convert ElevenLabs format to our format
    const formattedTranscript = (transcript ?? []).map((turn) => ({
      role: turn.role === "agent" ? "assistant" : "user",
      content: turn.message,
      timestamp: turn.time_in_call_secs,
    }));

    // Build plain text version for Claude
    const transcriptText = (transcript ?? [])
      .map((t) => `${t.role === "agent" ? "Assistant" : "User"}: ${t.message}`)
      .join("\n");

    // Use ElevenLabs summary if available, otherwise generate with Claude
    let summary = analysis?.transcript_summary ?? "";
    if (!summary && transcriptText) {
      try {
        const summaryResponse = await anthropic.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `Summarize this conversation in 2-3 warm, personal sentences from the perspective of an AI companion recap:\n\n${transcriptText}`,
            },
          ],
        });
        summary = summaryResponse.content[0].type === "text"
          ? summaryResponse.content[0].text
          : "";
      } catch (err) {
        console.error("Summary generation failed:", err);
      }
    }

    // Extract memories using Claude
    let memories: { content: string; category: string; importance: number }[] = [];
    if (transcriptText) {
      try {
        const memoryResponse = await anthropic.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 500,
          system: `Extract 3-5 key facts about the USER (not the AI) from this conversation transcript.
Return ONLY a valid JSON array with no other text: [{"content": "fact about user", "category": "family|work|health|interests|other", "importance": 1-10}]
Only include facts that would be meaningful to remember for future conversations.`,
          messages: [{ role: "user", content: transcriptText }],
        });

        const rawText = memoryResponse.content[0].type === "text"
          ? memoryResponse.content[0].text
          : "[]";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          memories = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.error("Memory extraction failed:", err);
      }
    }

    // Update conversation record with full payload data
    await supabase
      .from("conversations")
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: metadata?.call_duration_secs ?? null,
        transcript: formattedTranscript,
        summary,
      })
      .eq("id", conversation.id);

    // Save extracted memories
    if (memories.length > 0) {
      await supabase.from("memories").insert(
        memories.map((m) => ({
          user_id: conversation.user_id,
          agent_id: conversation.agent_id,
          conversation_id: conversation.id,
          content: m.content,
          category: m.category,
          importance: m.importance ?? 5,
        }))
      );
    }

    console.log(`Webhook processed: conversation ${conversation_id}, memories saved: ${memories.length}`);
    return NextResponse.json({ received: true, memoriesSaved: memories.length });

  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
