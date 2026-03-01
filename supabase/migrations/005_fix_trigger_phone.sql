-- Fix: Update handle_new_user trigger to capture phone, dob, gender from signup metadata
-- This ensures profile fields are saved even before email confirmation (when RLS blocks updates)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, dob, gender)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    CASE
      WHEN NEW.raw_user_meta_data->>'dob' IS NOT NULL AND NEW.raw_user_meta_data->>'dob' != ''
      THEN (NEW.raw_user_meta_data->>'dob')::DATE
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'gender'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
