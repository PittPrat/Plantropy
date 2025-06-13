-- trips table
CREATE TABLE public.trips (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    join_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Or ON DELETE CASCADE if a trip must have a creator
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Comment on trips table
COMMENT ON TABLE public.trips IS 'Stores information about planned trips.';
COMMENT ON COLUMN public.trips.join_code IS 'Unique code for users to join the trip.';

-- trip_members table (join table)
CREATE TABLE public.trip_members (
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('creator', 'member')), -- Example roles
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (trip_id, user_id)
);

-- Comment on trip_members table
COMMENT ON TABLE public.trip_members IS 'Associates users with trips and defines their role within the trip.';

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for trips table
CREATE TRIGGER handle_updated_at_trips
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS) for the tables
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Examples - these need to be refined based on your app's logic)

-- For trips table:
-- Users can see trips they are a member of.
CREATE POLICY "Users can view trips they are members of"
ON public.trips FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = trips.id
    AND trip_members.user_id = auth.uid()
  )
);

-- Authenticated users can create new trips.
CREATE POLICY "Authenticated users can create trips"
ON public.trips FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
-- Note: The `created_by` field should be set to `auth.uid()` by the application logic.

-- Trip creators can update their trips.
CREATE POLICY "Trip creators can update their trips"
ON public.trips FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Trip creators can delete their trips. (Consider soft deletes or more restrictive policies)
CREATE POLICY "Trip creators can delete their trips"
ON public.trips FOR DELETE
USING (auth.uid() = created_by);


-- For trip_members table:
-- Users can see their own membership record.
CREATE POLICY "Users can view their own trip membership"
ON public.trip_members FOR SELECT
USING (auth.uid() = user_id);

-- Users can see other members of trips they are part of.
CREATE POLICY "Users can view members of their trips"
ON public.trip_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trip_members AS tm_check
    WHERE tm_check.trip_id = trip_members.trip_id
    AND tm_check.user_id = auth.uid()
  )
);

-- Users can join a trip (insert into trip_members).
-- This policy assumes join codes are validated by application logic before insert.
-- Or, a Supabase Function could handle the join, bypassing direct client inserts to trip_members for non-creators.
CREATE POLICY "Authenticated users can join trips"
ON public.trip_members FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can leave a trip (delete their own membership).
CREATE POLICY "Users can leave trips"
ON public.trip_members FOR DELETE
USING (auth.uid() = user_id AND role <> 'creator'); -- Prevent creator from leaving, or handle creator leaving separately.

-- Trip creators can remove other members (but not themselves this way).
CREATE POLICY "Trip creators can remove members"
ON public.trip_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = trip_members.trip_id
    AND trips.created_by = auth.uid()
  )
  AND trip_members.user_id <> auth.uid() -- Creator cannot remove themselves with this policy
);
