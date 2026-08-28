-- Enable Realtime DELETE events for Group Practice Tables
-- This ensures DELETE events include full row data

-- Set REPLICA IDENTITY to FULL for room_members table
-- This allows Supabase Realtime to include the full row data in DELETE events
ALTER TABLE room_members REPLICA IDENTITY FULL;

-- Also ensure rooms table has realtime enabled
ALTER TABLE rooms REPLICA IDENTITY FULL;

-- And room_sessions
ALTER TABLE room_sessions REPLICA IDENTITY FULL;

-- Verify realtime is enabled (optional check)
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename IN ('rooms', 'room_members', 'room_sessions');
