-- Migration 006: safely create a profile and starter companion for every signup.
-- This migration is intentionally non-destructive and contains no user-specific data.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_template_id UUID;
  created_agent_id UUID;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, dob, gender)
  VALUES (
    NEW.id,
    NULLIF(BTRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'dob' ~ '^\d{4}-\d{2}-\d{2}$'
      THEN (NEW.raw_user_meta_data->>'dob')::DATE
      ELSE NULL
    END,
    NULLIF(NEW.raw_user_meta_data->>'gender', '')
  )
  ON CONFLICT (id) DO NOTHING;

  SELECT id INTO selected_template_id
  FROM public.agent_templates
  WHERE id::TEXT = NEW.raw_user_meta_data->>'companion_id'
    AND elevenlabs_agent_id IS NOT NULL
  LIMIT 1;

  IF selected_template_id IS NULL THEN
    SELECT id INTO selected_template_id
    FROM public.agent_templates
    WHERE elevenlabs_agent_id IS NOT NULL
  ORDER BY random()
  LIMIT 1;
  END IF;

  IF selected_template_id IS NOT NULL THEN
    INSERT INTO public.user_agents (user_id, template_id)
    VALUES (NEW.id, selected_template_id)
    RETURNING id INTO created_agent_id;

    UPDATE public.profiles
    SET default_phone_agent_id = created_agent_id
    WHERE id = NEW.id AND default_phone_agent_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$;
