import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversation_id, transcript, duration_seconds } = body;

    if (!conversation_id) {
      return NextResponse.json({ error: "Missing conversation_id" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Find the conversation record
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("elevenlabs_conversation_id", conversation_id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const transcriptText = Array.isArray(transcript)
      ? transcript.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")
      : JSON.stringify(transcript);

    // Extract memories using Claude (skipped if no API key)
    let memories: { content: string; category: string; importance: number }[] = [];
    if (anthropic) {
      try {
        const memoryResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: `Extract 3-5 key facts about the USER (not the AI) from this conversation transcript.
Return ONLY a valid JSON array with no other text: [{"content": "fact about user", "category": "family|work|health|interests|other", "importance": 1-10}]
Only include facts that would be meaningful to remember for future conversations.`,
          messages: [{ role: "user", content: transcriptText }],
        });

        const rawText = memoryResponse.content[0].type === "text" ? memoryResponse.content[0].text : "[]";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          memories = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.error("Memory extraction failed:", err);
      }
    } else {
      console.warn("ANTHROPIC_API_KEY not set — skipping memory extraction");
    }

    // Generate summary using Claude (skipped if no API key)
    let summary = "";
    if (anthropic) {
      try {
        const summaryResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `Summarize this conversation in 2-3 warm, personal sentences from the perspective of an AI companion recap:\n\n${transcriptText}`,
            },
          ],
        });
        summary =
          summaryResponse.content[0].type === "text"
            ? summaryResponse.content[0].text
            : "";
      } catch (err) {
        console.error("Summary generation failed:", err);
      }
    }

    // Update conversation record
    await supabase
      .from("conversations")
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: duration_seconds ?? null,
        transcript,
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

    return NextResponse.json({ success: true, memoriesSaved: memories.length });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
