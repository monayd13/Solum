-- Migration 006: Wipe all users and auto-assign random agent on signup
-- Run in Supabase SQL Editor

-- ─────────────────────────────────────────────
-- 1. WIPE ALL EXISTING USER DATA
-- ─────────────────────────────────────────────
-- Order matters due to FK constraints (children first)

DELETE FROM public.memories;
DELETE FROM public.conversations;
DELETE FROM public.user_agents;
DELETE FROM public.profiles;

-- Delete from auth.users (this is the source of truth)
DELETE FROM auth.users;

-- ─────────────────────────────────────────────
-- 2. AUTO-ASSIGN RANDOM AGENT ON SIGNUP
-- ─────────────────────────────────────────────
-- When a user signs up with phone +13412247278,
-- pick a random agent_template, create a user_agent,
-- and set it as their default_phone_agent_id.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  _phone TEXT;
  _random_template_id UUID;
  _new_user_agent_id UUID;
BEGIN
  _phone := NEW.raw_user_meta_data->>'phone';

  -- Create the profile
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, dob, gender)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    _phone,
    CASE
      WHEN NEW.raw_user_meta_data->>'dob' IS NOT NULL AND NEW.raw_user_meta_data->>'dob' != ''
      THEN (NEW.raw_user_meta_data->>'dob')::DATE
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'gender'
  );

  -- If the phone is +13412247278, auto-assign a random agent
  IF _phone = '+13412247278' THEN
    -- Pick a random agent template
    SELECT id INTO _random_template_id
    FROM public.agent_templates
    ORDER BY random()
    LIMIT 1;

    IF _random_template_id IS NOT NULL THEN
      -- Create user_agent instance
      INSERT INTO public.user_agents (user_id, template_id)
      VALUES (NEW.id, _random_template_id)
      RETURNING id INTO _new_user_agent_id;

      -- Set as default phone agent
      UPDATE public.profiles
      SET default_phone_agent_id = _new_user_agent_id
      WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
