-- Migration: Add username column to room_members table
-- Description: Store username in room_members to display real names instead of "Member 1", "Member 2"
-- This fixes the issue where other members' usernames are not visible

-- Add username column to room_members
ALTER TABLE room_members
ADD COLUMN IF NOT EXISTS username TEXT;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_room_members_username ON room_members(username);

-- Note: Existing rows will have NULL username
-- They will be updated when users rejoin rooms or when we run a backfill script
