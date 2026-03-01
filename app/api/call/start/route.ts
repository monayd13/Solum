import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/agents/prompts";
import { startConversation } from "@/lib/elevenlabs/client";
import { UserAgent, UserProfile, Memory } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { agentId } = await req.json();

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch agent with template
    const { data: agent, error: agentError } = await supabase
      .from("user_agents")
      .select("*, template:agent_templates(*)")
      .eq("id", agentId)
      .eq("user_id", user.id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Fetch top memories for this user+agent
    const { data: memories } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", user.id)
      .eq("agent_id", agentId)
      .order("importance", { ascending: false })
      .limit(20);

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const systemPrompt = buildSystemPrompt({
      agent: (agent as UserAgent).template!,
      userProfile: (profile as UserProfile) ?? { id: user.id, full_name: null, avatar_url: null, created_at: "" },
      memories: (memories as Memory[]) ?? [],
      personalityOverrides: (agent as UserAgent).personality_overrides,
      customInstructions: (agent as UserAgent).custom_instructions,
    });

    // Start ElevenLabs conversation
    const elevenLabsData = await startConversation({
      agentId: process.env.ELEVENLABS_AGENT_ID!,
      systemPrompt,
      userId: user.id,
      userAgentId: agentId,
    });

    // Create conversation record
    const { data: conversation } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        agent_id: agentId,
        elevenlabs_conversation_id: elevenLabsData.conversation_id,
      })
      .select()
      .single();

    return NextResponse.json({
      conversationId: conversation?.id,
      websocketUrl: elevenLabsData.websocket_url,
    });
  } catch (err) {
    console.error("Error starting call:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
