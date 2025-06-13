-- supabase/migrations/YYYYMMDDHHMMSS_create_profiles_table.sql

-- 1. Create the profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Allow public read access to display names
CREATE POLICY "Allow public read access to profiles" 
ON public.profiles
FOR SELECT
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile" 
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" 
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. (Optional but Recommended) Create a function to handle new user sign-ups
-- This function will be triggered by Supabase Auth when a new user signs up
-- and will automatically create a profile entry for them.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important for accessing auth.users table
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.email); -- Or use a default display name, or extract from NEW.raw_user_meta_data if available
  RETURN NEW;
END;
$$;

-- 5. (Optional but Recommended) Create a trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comments:
-- - The `handle_new_user` function and its trigger are highly recommended to ensure
--   that every authenticated user has a corresponding entry in the `profiles` table.
--   You might want to adjust the default `display_name` (e.g., parse from email, or use a generic one).
-- - Ensure this migration is run after the Supabase Auth setup is complete.
-- - The `SECURITY DEFINER` on `handle_new_user` is crucial for it to have permissions
--   to insert into `public.profiles` based on an event in `auth.users`.
