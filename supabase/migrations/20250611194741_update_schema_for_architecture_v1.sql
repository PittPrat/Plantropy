-- supabase/migrations/20250611194741_update_schema_for_architecture_v1.sql

-- 1. Create ENUM type for plan categories
CREATE TYPE public.plan_category AS ENUM ('date', 'hangout', 'travel', 'other');

-- 2. Alter the 'profiles' table
ALTER TABLE public.profiles
ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN social_connections JSONB DEFAULT '{"friends": []}'::jsonb;

-- Add comments for new columns in 'profiles'
COMMENT ON COLUMN public.profiles.preferences IS 'User-specific preferences, stored as JSONB.';
COMMENT ON COLUMN public.profiles.social_connections IS 'User social connections, e.g., list of friend IDs, stored as JSONB.';

-- 3. Alter the 'trips' table
ALTER TABLE public.trips
ADD COLUMN plan_type public.plan_category,
ADD COLUMN plan_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN budget NUMERIC,
ADD COLUMN max_group_size INTEGER;

-- Add comments for new columns in 'trips'
COMMENT ON COLUMN public.trips.plan_type IS 'Category of the plan (e.g., date, hangout, travel).';
COMMENT ON COLUMN public.trips.plan_details IS 'Additional details specific to the plan, stored as JSONB (e.g., location specifics, activity preferences).';
COMMENT ON COLUMN public.trips.budget IS 'Estimated budget for the plan.';
COMMENT ON COLUMN public.trips.max_group_size IS 'Maximum number of participants for the plan.';

-- Note: Existing RLS policies on 'profiles' and 'trips' tables will generally apply to these new columns.
-- For example, users can update their own 'preferences' and 'social_connections' in 'profiles'.
-- Trip members can view all columns of trips they are part of, including 'plan_type', 'plan_details', 'budget', and 'max_group_size'.
-- If more granular RLS is needed for these new columns in the future, policies can be refined.
