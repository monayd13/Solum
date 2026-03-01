export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  tagline: string | null;
  backstory: string;
  personality_traits: PersonalityTraits | null;
  voice_id: string;
  avatar_url: string | null;
  avatar_emoji: string | null;
  accent_color: string | null;
  default_system_prompt: string;
  created_at: string;
}

export interface UserAgent {
  id: string;
  user_id: string;
  template_id: string;
  custom_name: string | null;
  personality_overrides: Partial<PersonalityTraits> | null;
  custom_instructions: string | null;
  created_at: string;
  template?: AgentTemplate;
}

export interface Conversation {
  id: string;
  user_id: string;
  agent_id: string;
  elevenlabs_conversation_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  transcript: TranscriptMessage[] | null;
  summary: string | null;
  mood_score: number | null;
}

export interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface Memory {
  id: string;
  user_id: string;
  agent_id: string;
  conversation_id: string;
  content: string;
  category: MemoryCategory | null;
  importance: number;
  created_at: string;
}

export type MemoryCategory =
  | "family"
  | "work"
  | "health"
  | "interests"
  | "other";

export interface PersonalityTraits {
  warmth: number;
  humor: number;
  formality: number;
  storytelling: number;
  curiosity: number;
  empathy: number;
}

export type CallStatus = "idle" | "connecting" | "connected" | "error";
