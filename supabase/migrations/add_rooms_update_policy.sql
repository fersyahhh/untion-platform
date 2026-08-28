-- Migration: Add UPDATE policy for rooms table
-- Description: Allow members to update room state (active_presenter_id, current_slide, status)
-- This fixes the "new row violates row-level security policy" error when moving to next presenter

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Members can update their room" ON rooms;

-- Policy: Members of a room can update the room
-- This allows any member to update room fields like:
-- - active_presenter_id (move to next presenter)
-- - current_slide (sync slide changes)
-- - status (complete session)
CREATE POLICY "Members can update their room"
ON rooms FOR UPDATE
USING (
  -- User must be a member of this room
  EXISTS (
    SELECT 1 FROM room_membersa
    WHERE room_members.room_id = rooms.id
    AND room_members.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Same condition for the updated row
  EXISTS (
    SELECT 1 FROM room_members
    WHERE room_members.room_id = rooms.id
    AND room_members.user_id = auth.uid()
  )
);

-- Note: This policy allows any member to update the room, not just the leader.
-- This is intentional because:
-- 1. Current presenter needs to update active_presenter_id when finishing their turn
-- 2. Current presenter needs to update current_slide during their presentation
-- 3. The last presenter needs to update status to "completed"
-- 
-- Security note: Frontend already validates who can perform these actions.
-- For additional security, you could add column-level checks using SECURITY DEFINER functions.
