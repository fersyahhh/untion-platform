-- ============================================================================
-- ENABLE SUPABASE REALTIME FOR GROUP PRACTICE TABLES
-- ============================================================================
-- 
-- This script enables Supabase Realtime for the group practice feature.
-- Run this in your Supabase SQL Editor.
--
-- WHY: Real-time subscriptions won't work until tables are added to the 
--      supabase_realtime publication.
--
-- ============================================================================

-- Enable Realtime for rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Enable Realtime for room_members table
ALTER PUBLICATION supabase_realtime ADD TABLE room_members;

-- Enable Realtime for room_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE room_sessions;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if tables are in the publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Expected output:
-- public | room_members
-- public | room_sessions
-- public | rooms

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If you get error "table already exists in publication", run:
-- ALTER PUBLICATION supabase_realtime DROP TABLE rooms;
-- ALTER PUBLICATION supabase_realtime DROP TABLE room_members;
-- ALTER PUBLICATION supabase_realtime DROP TABLE room_sessions;
-- Then run the ADD commands again.

-- If still not working:
-- 1. Check Supabase Dashboard → Database → Replication
-- 2. Verify tables are listed under "supabase_realtime" publication
-- 3. Restart your app (hard refresh: Ctrl+Shift+R)
-- 4. Check browser console for real-time connection logs
