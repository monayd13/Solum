-- Migration 007: close the broad anonymous profile read policy and add integrity checks.
DROP POLICY IF EXISTS "Service role can read profiles by phone" ON public.profiles;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memories_user_agent_importance
  ON public.memories (user_id, agent_id, importance DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_elevenlabs_id
  ON public.conversations (elevenlabs_conversation_id)
  WHERE elevenlabs_conversation_id IS NOT NULL;
