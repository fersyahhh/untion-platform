-- ============================================================================
-- VERIFY REALTIME IS ENABLED
-- ============================================================================
--
-- Run this to check if realtime is properly enabled for all tables
--
-- ============================================================================

-- Check which tables are in supabase_realtime publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Expected output:
-- public | room_members     ✅
-- public | room_sessions    ✅
-- public | rooms            ✅
-- (and possibly other tables from your project)

-- ============================================================================
-- If you see all 3 tables above → Realtime is ENABLED! ✅
-- If missing any table → Run the missing ones only:
-- ============================================================================

-- Only run these if table is MISSING from the list above:

-- If room_members missing:
-- ALTER PUBLICATION supabase_realtime ADD TABLE room_members;

-- If room_sessions missing:
-- ALTER PUBLICATION supabase_realtime ADD TABLE room_sessions;

-- If rooms missing (but you got error, so it's already there):
-- ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- ============================================================================
-- IMPORTANT: After verifying, do a HARD REFRESH in browser!
-- Windows/Linux: Ctrl + Shift + R
-- Mac: Cmd + Shift + R
-- ============================================================================
