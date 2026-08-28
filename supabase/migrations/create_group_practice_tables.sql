-- Migration: Create Group Practice Tables
-- Created: 2026-08-25

-- =============================================================================
-- TABLE: rooms
-- =============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'in_progress', 'completed', 'abandoned')) DEFAULT 'waiting',
  pdf_url TEXT,
  pdf_file_name TEXT,
  total_slides INTEGER,
  duration_minutes INTEGER,
  active_presenter_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rooms
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_leader_id ON rooms(leader_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);

-- =============================================================================
-- TABLE: room_members
-- =============================================================================
CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_slide_start INTEGER,
  assigned_slide_end INTEGER,
  turn_order INTEGER,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Indexes for room_members
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_turn_order ON room_members(room_id, turn_order);

-- =============================================================================
-- TABLE: room_sessions
-- =============================================================================
CREATE TABLE IF NOT EXISTS room_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL DEFAULT '',
  filler_word_count INTEGER NOT NULL DEFAULT 0,
  filler_breakdown JSONB DEFAULT '{}'::jsonb,
  long_pauses INTEGER NOT NULL DEFAULT 0,
  actual_duration_seconds INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  wpm INTEGER NOT NULL DEFAULT 0,
  overall_score INTEGER NOT NULL DEFAULT 0,
  aspects JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Indexes for room_sessions
CREATE INDEX IF NOT EXISTS idx_room_sessions_room_id ON room_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_room_sessions_user_id ON room_sessions(user_id);

-- =============================================================================
-- RLS POLICIES (Create after all tables exist)
-- =============================================================================

-- Enable RLS for all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS Policies for rooms
-- =============================================================================

-- Policy: Users can read rooms they are members of
DROP POLICY IF EXISTS "Users can read their rooms" ON rooms;
CREATE POLICY "Users can read their rooms"
ON rooms FOR SELECT
USING (
  id IN (
    SELECT room_id FROM room_members WHERE user_id = auth.uid()
  )
);

-- Policy: Leader can update their room
DROP POLICY IF EXISTS "Leader can update room" ON rooms;
CREATE POLICY "Leader can update room"
ON rooms FOR UPDATE
USING (leader_id = auth.uid());

-- Policy: Any authenticated user can create a room
DROP POLICY IF EXISTS "Users can create rooms" ON rooms;
CREATE POLICY "Users can create rooms"
ON rooms FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND leader_id = auth.uid());

-- =============================================================================
-- RLS Policies for room_members
-- =============================================================================

-- =============================================================================
-- RLS Policies for room_members
-- =============================================================================

-- Policy: Users can read members of rooms they're in
DROP POLICY IF EXISTS "Users can read room members" ON room_members;
CREATE POLICY "Users can read room members"
ON room_members FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM room_members WHERE user_id = auth.uid()
  )
);

-- Policy: Users can insert themselves into a room
DROP POLICY IF EXISTS "Users can join rooms" ON room_members;
CREATE POLICY "Users can join rooms"
ON room_members FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Leader can update member assignments
DROP POLICY IF EXISTS "Leader can update members" ON room_members;
CREATE POLICY "Leader can update members"
ON room_members FOR UPDATE
USING (
  room_id IN (
    SELECT id FROM rooms WHERE leader_id = auth.uid()
  )
);

-- Policy: Users can remove themselves from room
DROP POLICY IF EXISTS "Users can leave rooms" ON room_members;
CREATE POLICY "Users can leave rooms"
ON room_members FOR DELETE
USING (user_id = auth.uid());

-- =============================================================================
-- RLS Policies for room_sessions
-- =============================================================================

-- Policy: Users can read sessions from rooms they're in
DROP POLICY IF EXISTS "Users can read room sessions" ON room_sessions;
CREATE POLICY "Users can read room sessions"
ON room_sessions FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM room_members WHERE user_id = auth.uid()
  )
);

-- Policy: Users can insert their own session
DROP POLICY IF EXISTS "Users can create their session" ON room_sessions;
CREATE POLICY "Users can create their session"
ON room_sessions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own session
DROP POLICY IF EXISTS "Users can update their session" ON room_sessions;
CREATE POLICY "Users can update their session"
ON room_sessions FOR UPDATE
USING (user_id = auth.uid());

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for rooms table
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STORAGE BUCKET (Optional - run manually if needed)
-- =============================================================================
-- This bucket will store uploaded PDF presentations
-- Run this separately in Supabase Storage UI or SQL Editor:
-- 
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('room-presentations', 'room-presentations', false);
--
-- CREATE POLICY "Room members can read presentations"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'room-presentations' AND
--   auth.uid() IN (
--     SELECT user_id FROM room_members 
--     WHERE room_id::text = (storage.foldername(name))[1]
--   )
-- );
--
-- CREATE POLICY "Room leaders can upload presentations"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'room-presentations' AND
--   auth.uid() IN (
--     SELECT leader_id FROM rooms 
--     WHERE id::text = (storage.foldername(name))[1]
--   )
-- );

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
