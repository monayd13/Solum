import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildDynamicVariables } from "@/lib/agents/prompts";
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

    const userAgent = agent as UserAgent;
    const template = userAgent.template!;
    if (!template) {
      return NextResponse.json({ error: "Companion configuration is unavailable" }, { status: 503 });
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

    // Count past conversations for adaptive first message
    const { count: conversationCount } = await supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("agent_id", agentId);

    // Build dynamic variables (fills {{placeholders}} in the ElevenLabs voice prompt)
    const dynamicVariables = buildDynamicVariables({
      agent: template,
      userProfile: (profile as UserProfile) ?? { id: user.id, full_name: null, avatar_url: null, created_at: "" },
      memories: (memories as Memory[]) ?? [],
      conversationCount: conversationCount ?? 0,
      customInstructions: userAgent.custom_instructions,
    });

    const elevenlabsAgentId = template.elevenlabs_agent_id;
    if (!elevenlabsAgentId) {
      return NextResponse.json({ error: "Voice service is not configured for this companion" }, { status: 503 });
    }

    // Create a record only after the selected companion is known to be callable.
    const { data: conversation } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, agent_id: agentId })
      .select("id")
      .single();

    if (!conversation?.id) {
      return NextResponse.json({ error: "Unable to create a conversation" }, { status: 500 });
    }

    return NextResponse.json({
      conversationRecordId: conversation.id,
      elevenlabsAgentId,
      dynamicVariables,
      voiceSettings: userAgent.voice_settings,
    });
  } catch (err) {
    console.error("Unable to start call", err instanceof Error ? err.name : "UnknownError");
    return NextResponse.json(
      { error: "Unable to start the call" },
      { status: 500 }
    );
  }
}
