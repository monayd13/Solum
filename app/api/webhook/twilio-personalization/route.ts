import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildDynamicVariables } from "@/lib/agents/prompts";
import { UserProfile, Memory, AgentTemplate } from "@/types";

/**
 * Twilio Personalization Webhook
 *
 * Called by ElevenLabs when an inbound Twilio call is received.
 * Looks up the caller by phone number, finds their preferred agent,
 * loads memories, and returns personalized conversation_initiation_client_data.
 *
 * ElevenLabs sends: { caller_id, agent_id, called_number, call_sid }
 * We return: { type, dynamic_variables, conversation_config_override }
 */

// Normalize phone to E.164 for comparison (strip spaces/dashes, ensure +)
function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caller_id, agent_id, called_number, call_sid } = body;

    console.log("📞 Twilio personalization webhook:", {
      caller_id,
      agent_id,
      called_number,
      call_sid,
    });

    if (!caller_id) {
      console.warn("⚠️ No caller_id — returning default");
      return NextResponse.json({
        type: "conversation_initiation_client_data",
        dynamic_variables: {
          user_name: "Friend",
          user_context: "",
          memories: "No previous conversations yet — this is your first time meeting them.",
          first_message: "Hey there! Nice to meet you. What's on your mind today?",
        },
      });
    }

    const supabase = await createServiceClient();
    const normalizedPhone = normalizePhone(caller_id);

    // 1. Look up user by phone number
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("phone", normalizedPhone)
      .single();

    if (profileError || !profile) {
      // Try without the + prefix as fallback
      const { data: profileAlt } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", caller_id)
        .single();

      if (!profileAlt) {
        console.log("👤 Unknown caller:", caller_id, "— returning default personalization");
        return NextResponse.json({
          type: "conversation_initiation_client_data",
          dynamic_variables: {
            user_name: "Friend",
            user_context: "",
            memories: "No previous conversations yet — this is your first time meeting them.",
            first_message: "Hey there! Nice to meet you. What's on your mind today?",
          },
        });
      }

      // Use the alt profile
      return await buildPersonalizedResponse(supabase, profileAlt as UserProfile, agent_id);
    }

    return await buildPersonalizedResponse(supabase, profile as UserProfile, agent_id);
  } catch (err) {
    console.error("❌ Twilio personalization error:", err);
    // Return default rather than error — don't block the call
    return NextResponse.json({
      type: "conversation_initiation_client_data",
      dynamic_variables: {
        user_name: "Friend",
        user_context: "",
        memories: "No previous conversations yet — this is your first time meeting them.",
        first_message: "Hey there! Nice to meet you. What's on your mind today?",
      },
    });
  }
}

async function buildPersonalizedResponse(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  profile: UserProfile,
  elevenlabsAgentId: string
) {
  console.log("👤 Found user:", profile.full_name, "(", profile.id, ")");

  // 2. Find the agent template matching the ElevenLabs agent_id
  const { data: template } = await supabase
    .from("agent_templates")
    .select("*")
    .eq("elevenlabs_agent_id", elevenlabsAgentId)
    .single();

  // 3. Find the user's agent instance for this template
  let userAgentId: string | null = null;
  let agentTemplate: AgentTemplate | null = template as AgentTemplate | null;

  if (template) {
    const { data: userAgent } = await supabase
      .from("user_agents")
      .select("*, template:agent_templates(*)")
      .eq("user_id", profile.id)
      .eq("template_id", template.id)
      .single();

    if (userAgent) {
      userAgentId = userAgent.id;
      agentTemplate = userAgent.template as AgentTemplate;
    }
  } else {
    console.log("⚠️ ElevenLabs agent not found in agent_templates — will use default_phone_agent_id if set");
  }

  // 4. Check if user has a preferred phone agent (override)
  // Also used as fallback when the Twilio-assigned agent isn't in our DB
  let overrideConfig: Record<string, unknown> | null = null;

  if (profile.default_phone_agent_id) {
    const defaultPhoneAgentId = profile.default_phone_agent_id;

    const { data: preferredAgent } = await supabase
      .from("user_agents")
      .select("*, template:agent_templates(*)")
      .eq("id", defaultPhoneAgentId)
      .eq("user_id", profile.id)
      .single();

    if (preferredAgent?.template) {
      const preferredTemplate = preferredAgent.template as AgentTemplate;
      console.log("🔀 Overriding to preferred agent:", preferredTemplate.name);

      userAgentId = preferredAgent.id;
      agentTemplate = preferredTemplate;

      overrideConfig = {
        agent: {
          prompt: {
            prompt: preferredTemplate.default_system_prompt,
          },
          first_message: "", // Will be set by dynamic_variables
        },
        tts: {
          voice_id: preferredTemplate.voice_id,
        },
      };
    }
  }

  // 5. Load memories for this user + agent
  const memories: Memory[] = [];
  if (userAgentId) {
    const { data: memData } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", profile.id)
      .eq("agent_id", userAgentId)
      .order("importance", { ascending: false })
      .limit(20);

    if (memData) {
      memories.push(...(memData as Memory[]));
    }
  }

  // 6. Count past conversations
  let conversationCount = 0;
  if (userAgentId) {
    const { count } = await supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("agent_id", userAgentId);
    conversationCount = count ?? 0;
  }

  // 7. Build dynamic variables (same logic as web call start)
  const dynamicVariables = agentTemplate
    ? buildDynamicVariables({
        agent: agentTemplate,
        userProfile: profile,
        memories,
        conversationCount,
        customInstructions: null,
      })
    : {
        user_name: profile.full_name || "Friend",
        user_context: "",
        memories: "No previous conversations yet — this is your first time meeting them.",
        first_message: `Hey ${(profile.full_name || "Friend").split(" ")[0]}! Nice to hear from you. What's on your mind?`,
      };

  console.log("📤 Returning personalization:", {
    user: profile.full_name,
    agent: agentTemplate?.name,
    memoriesCount: memories.length,
    conversationCount,
    hasOverride: !!overrideConfig,
  });

  // 8. Create a conversation record for this phone call
  if (userAgentId) {
    const { data: conversation } = await supabase
      .from("conversations")
      .insert({
        user_id: profile.id,
        agent_id: userAgentId,
      })
      .select()
      .single();

    if (conversation) {
      console.log("📝 Created conversation record:", conversation.id);
    }
  }

  const response: Record<string, unknown> = {
    type: "conversation_initiation_client_data",
    dynamic_variables: dynamicVariables,
  };

  if (overrideConfig) {
    response.conversation_config_override = overrideConfig;
  }

  return NextResponse.json(response);
}
