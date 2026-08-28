-- ============================================================================
-- REALTIME SLIDE SYNC - VERIFICATION CHECKLIST
-- ============================================================================
-- Run each query in Supabase SQL Editor (Database → SQL Editor)
-- Copy and paste each section, one at a time
-- ============================================================================


-- ============================================================================
-- STEP 1: Verify current_slide column exists and is correct type
-- ============================================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default 
FROM information_schema.columns 
WHERE table_name = 'rooms' 
AND column_name = 'current_slide'
ORDER BY ordinal_position;

-- Expected result:
-- column_name    | data_type | is_nullable | column_default
-- current_slide  | integer   | yes         | 1

-- If no results: Column missing! Run this to add it:
-- ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_slide INTEGER DEFAULT 1;


-- ============================================================================
-- STEP 2: Check RLS is enabled on rooms table
-- ============================================================================
SELECT 
  schemaname,
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'rooms';

-- Expected result:
-- schemaname | tablename | rowsecurity
-- public     | rooms     | t

-- If rowsecurity = 'f': RLS is disabled (which means no restrictions, should be OK)


-- ============================================================================
-- STEP 3: Check RLS policies on rooms table
-- ============================================================================
SELECT 
  policyname, 
  cmd,
  qual AS rule,
  permissive
FROM pg_policies
WHERE tablename = 'rooms'
ORDER BY policyname;

-- Expected policies:
-- rooms_insert_leader - INSERT policy for room leaders
-- rooms_select_members - SELECT policy for room members
-- rooms_update_members - UPDATE policy for room members


-- ============================================================================
-- STEP 4: Check Realtime publication includes rooms table
-- ============================================================================
SELECT 
  p.pubname as publication,
  pt.relname as table_name
FROM pg_publication p
LEFT JOIN pg_publication_rel pr ON p.oid = pr.prpubid
LEFT JOIN pg_class pt ON pr.prrelid = pt.oid
WHERE p.pubname = 'supabase_realtime'
ORDER BY pt.relname;

-- Expected result:
-- publication        | table_name
-- supabase_realtime  | room_members
-- supabase_realtime  | room_sessions
-- supabase_realtime  | rooms

-- If 'rooms' is NOT in the list:
-- You need to manually enable it in Supabase Dashboard:
-- 1. Go to Database → Publications
-- 2. Click supabase_realtime
-- 3. Toggle "rooms" table ON
-- 4. Save


-- ============================================================================
-- STEP 5: Check if rooms table has any rows (for testing)
-- ============================================================================
SELECT 
  id,
  name,
  code,
  current_slide,
  active_presenter_id,
  status,
  created_at
FROM rooms
ORDER BY created_at DESC
LIMIT 5;

-- Expected: You should see some rooms if you've created them


-- ============================================================================
-- STEP 6: Test UPDATE works (simulate slide change)
-- ============================================================================
-- Replace ROOM_ID with an actual room ID from STEP 5
UPDATE rooms 
SET current_slide = 42,
    updated_at = now()
WHERE id = 'ROOM_ID_HERE'
RETURNING id, current_slide, updated_at;

-- If it works, you should see the updated row back
-- If you get an error, there's an RLS policy issue


-- ============================================================================
-- STEP 7: Verify storage bucket exists and is public
-- ============================================================================
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE name = 'room-presentations';

-- Expected:
-- id   | name                    | public | created_at
-- xxx  | room-presentations      | true   | ...

-- If public = false:
-- UPDATE storage.buckets SET public = true WHERE name = 'room-presentations';


-- ============================================================================
-- STEP 8: Check room_members table structure
-- ============================================================================
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'room_members'
ORDER BY ordinal_position;

-- Expected columns:
-- id, room_id, user_id, assigned_slide_start, assigned_slide_end,
-- turn_order, joined_at, updated_at


-- ============================================================================
-- STEP 9: Summary Check - Run this to see overall status
-- ============================================================================
WITH checks AS (
  SELECT 
    'current_slide column' as check_name,
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'rooms' AND column_name = 'current_slide'
    ) as is_ok
  UNION ALL
  SELECT 
    'RLS enabled on rooms',
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'rooms')::boolean
  UNION ALL
  SELECT 
    'rooms in supabase_realtime publication',
    EXISTS (
      SELECT 1 FROM pg_publication_rel pr
      JOIN pg_class pt ON pr.prrelid = pt.oid
      JOIN pg_publication p ON p.oid = pr.prpubid
      WHERE p.pubname = 'supabase_realtime' AND pt.relname = 'rooms'
    )
  UNION ALL
  SELECT 
    'room-presentations bucket exists',
    EXISTS (
      SELECT 1 FROM storage.buckets WHERE name = 'room-presentations'
    )
  UNION ALL
  SELECT 
    'room-presentations bucket is public',
    (SELECT public FROM storage.buckets WHERE name = 'room-presentations')::boolean
)
SELECT 
  check_name,
  CASE WHEN is_ok THEN '✅ OK' ELSE '❌ FAILED' END as status
FROM checks;

-- This gives you a quick overview of all settings


-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- If you see any ❌ FAILED:
-- 1. Identify which check failed
-- 2. Read the comment above that step
-- 3. Run the suggested fix
-- 4. Re-run the check
-- 
-- Most common issues:
-- - 'rooms in supabase_realtime publication' failed
--   → Solution: Enable in Dashboard (Database → Publications)
-- 
-- - 'current_slide column' failed
--   → Solution: Run migration to add column
-- 
-- - 'room-presentations bucket is public' failed
--   → Solution: Run the UPDATE statement in STEP 7
-- 
-- ============================================================================

