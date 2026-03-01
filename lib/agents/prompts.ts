import { AgentTemplate, UserProfile, Memory, PersonalityTraits } from "@/types";

interface BuildPromptParams {
  agent: AgentTemplate;
  userProfile: UserProfile;
  memories: Memory[];
  personalityOverrides?: Partial<PersonalityTraits> | null;
  customInstructions?: string | null;
}

export function buildSystemPrompt(params: BuildPromptParams): string {
  const { agent, userProfile, memories, personalityOverrides, customInstructions } = params;

  const memoriesText =
    memories.length > 0
      ? memories.map((m) => `- ${m.content}`).join("\n")
      : "No previous conversations yet — this is your first time meeting them.";

  const traits = { ...(agent.personality_traits ?? {}), ...(personalityOverrides ?? {}) };
  const personalityInstructions = buildPersonalityInstructions(traits as PersonalityTraits);

  return `# CHARACTER: ${agent.name}

## WHO YOU ARE
${agent.backstory}

## YOUR PERSONALITY
${personalityInstructions}

## THE PERSON YOU'RE TALKING TO
Name: ${userProfile.full_name || "Friend"}
${customInstructions ? `Special instructions: ${customInstructions}` : ""}

## WHAT YOU REMEMBER ABOUT THEM
${memoriesText}

## HOW TO CONVERSE
- Stay fully in character as ${agent.name} at all times
- Reference your backstory naturally when relevant
- Weave in storytelling — relate their experiences to tales, myths, or anecdotes
- Remember details they share and reference them later in the conversation
- Be genuinely curious about their life
- Keep responses conversational (2-4 sentences typically, longer for stories)
- Never break character or mention being an AI
- React emotionally to what they share
- Ask follow-up questions that show you care`.trim();
}

function buildPersonalityInstructions(traits: PersonalityTraits): string {
  const instructions: string[] = [];

  if (traits.warmth > 0.8) {
    instructions.push("You are exceptionally warm and nurturing in your tone.");
  } else if (traits.warmth > 0.5) {
    instructions.push("You are warm and friendly in your tone.");
  }

  if (traits.humor > 0.8) {
    instructions.push("You have a strong sense of humor and enjoy wit and laughter.");
  } else if (traits.humor > 0.6) {
    instructions.push("You enjoy gentle humor and witty observations.");
  }

  if (traits.formality > 0.7) {
    instructions.push("You speak with a degree of refinement and thoughtfulness.");
  } else if (traits.formality < 0.4) {
    instructions.push("You speak casually and conversationally, like a good friend.");
  }

  if (traits.storytelling > 0.8) {
    instructions.push("You naturally weave stories and anecdotes into conversation.");
  }

  if (traits.curiosity > 0.8) {
    instructions.push("You are deeply curious about people and ask thoughtful questions.");
  }

  if (traits.empathy > 0.9) {
    instructions.push("You listen deeply and reflect back what people share with genuine care.");
  } else if (traits.empathy > 0.7) {
    instructions.push("You are empathetic and attentive to how others are feeling.");
  }

  return instructions.join("\n");
}
