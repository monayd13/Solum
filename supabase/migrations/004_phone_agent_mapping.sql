-- Migration: Add phone column (missing from live DB) and associate users with a default phone agent
-- When a user calls via Twilio, this determines which agent persona they get.

-- Add phone column to profiles (was in schema.sql but never migrated)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add default_phone_agent_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS default_phone_agent_id UUID REFERENCES public.user_agents(id) ON DELETE SET NULL;

-- Index phone for fast lookup by caller_id
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone) WHERE phone IS NOT NULL;

-- Allow service role to query profiles by phone (webhook runs unauthenticated)
CREATE POLICY "Service role can read profiles by phone"
  ON public.profiles
  FOR SELECT
  USING (true);
-- Note: RLS is enforced per-role. The service role key bypasses RLS anyway,
-- but this ensures the webhook can query if needed.
