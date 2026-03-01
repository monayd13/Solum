import { AgentTemplate, UserProfile, Memory } from "@/types";

interface BuildDynamicVarsParams {
  agent: AgentTemplate;
  userProfile: UserProfile;
  memories: Memory[];
  conversationCount: number;
  customInstructions?: string | null;
}

/**
 * Build dynamic variables to inject into the ElevenLabs agent prompt at call time.
 * The agent's core personality lives in the ElevenLabs dashboard (voice-optimized prompt).
 * These variables fill the {{placeholders}} in that prompt.
 */
export function buildDynamicVariables(params: BuildDynamicVarsParams): Record<string, string> {
  const { agent, userProfile, memories, conversationCount, customInstructions } = params;

  const userName = userProfile.full_name || "Friend";

  const memoriesText =
    memories.length > 0
      ? memories.map((m) => `- ${m.content}`).join("\n")
      : "No previous conversations yet — this is your first time meeting them.";

  const contextParts: string[] = [];
  if (customInstructions) {
    contextParts.push(`Special instructions: ${customInstructions}`);
  }
  if (userProfile.age) {
    contextParts.push(`Age: ${userProfile.age}`);
  }
  if (userProfile.gender) {
    contextParts.push(`Gender: ${userProfile.gender}`);
  }
  const userContext = contextParts.length > 0 ? contextParts.join("\n") : "";

  const firstMessage = buildFirstMessage({
    agentName: agent.name,
    userName,
    conversationCount,
    memories,
  });

  return {
    user_name: userName,
    user_context: userContext,
    memories: memoriesText,
    first_message: firstMessage,
  };
}

/**
 * Build an adaptive first message based on whether the user is new or returning.
 */
function buildFirstMessage(params: {
  agentName: string;
  userName: string;
  conversationCount: number;
  memories: Memory[];
}): string {
  const { agentName, userName, conversationCount, memories } = params;
  const firstName = userName.split(" ")[0];

  // First ever conversation
  if (conversationCount === 0) {
    return `Hey ${firstName}! I'm ${agentName}. It's really nice to meet you. What's on your mind today?`;
  }

  // Returning user — try to reference a recent memory
  const recentMemory = memories.length > 0 ? memories[0] : null;
  if (recentMemory) {
    return `Hey ${firstName}! Good to hear from you again. I was thinking about what you told me — ${recentMemory.content.toLowerCase()}. How's that going?`;
  }

  // Returning user, no specific memory to reference
  return `Hey ${firstName}! Great to talk again. How have things been since we last chatted?`;
}
