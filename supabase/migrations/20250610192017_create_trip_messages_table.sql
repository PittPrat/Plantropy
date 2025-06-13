-- supabase/migrations/20250610192017_create_trip_messages_table.sql

-- 1. Create the trip_messages table
CREATE TABLE public.trip_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 10000), -- Max 10k chars per message
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add indexes for performance
CREATE INDEX idx_trip_messages_trip_id_created_at ON public.trip_messages(trip_id, created_at DESC);
CREATE INDEX idx_trip_messages_user_id ON public.trip_messages(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.trip_messages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Policy: Allow members to read messages for their trips
CREATE POLICY "Allow trip members to read messages"
ON public.trip_messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.trip_members tm
        WHERE tm.trip_id = public.trip_messages.trip_id
        AND tm.user_id = auth.uid()
    )
);

-- Policy: Allow trip members to send messages in their trips
CREATE POLICY "Allow trip members to send messages"
ON public.trip_messages
FOR INSERT
WITH CHECK (
    auth.uid() = user_id -- User can only insert messages as themselves
    AND EXISTS (
        SELECT 1
        FROM public.trip_members tm
        WHERE tm.trip_id = public.trip_messages.trip_id
        AND tm.user_id = auth.uid()
    )
);

-- Note: For a basic chat, UPDATE and DELETE are often restricted.
-- If needed, add policies for UPDATE and DELETE. For now, only SELECT and INSERT are allowed.
-- Example: Disallow updates
-- CREATE POLICY "Disallow updates to messages"
-- ON public.trip_messages
-- FOR UPDATE
-- USING (false);

-- Example: Disallow deletes (or allow only for message owner / admin within a time window)
-- CREATE POLICY "Disallow deletes of messages"
-- ON public.trip_messages
-- FOR DELETE
-- USING (false);

-- 5. Enable Realtime for the trip_messages table
-- This step is usually done through the Supabase dashboard (Database > Replication),
-- or by ensuring your publication includes the new table.
-- For programmatic setup via migrations, you might need to alter the publication.
-- Assuming 'supabase_realtime' is the publication used by default.
-- Check existing publications: SELECT * FROM pg_publication;
-- Check tables in publication: SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- If 'trip_messages' is not automatically added, you might add:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_messages;
-- However, Supabase often handles this if RLS is set up and the table is new.
-- For now, we'll rely on Supabase's default behavior or manual setup in the dashboard for enabling realtime on the table.
-- The key parts are table creation and RLS.

COMMENT ON TABLE public.trip_messages IS 'Stores chat messages for trips.';
COMMENT ON COLUMN public.trip_messages.id IS 'Unique identifier for the message.';
COMMENT ON COLUMN public.trip_messages.trip_id IS 'Identifier of the trip this message belongs to.';
COMMENT ON COLUMN public.trip_messages.user_id IS 'Identifier of the user who sent this message.';
COMMENT ON COLUMN public.trip_messages.content IS 'The text content of the message.';
COMMENT ON COLUMN public.trip_messages.created_at IS 'Timestamp when the message was created.';
