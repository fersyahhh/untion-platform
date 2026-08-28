-- Migration: Add current_slide tracking to rooms
-- Created: 2026-08-26
-- Purpose: Enable real-time slide synchronization across all members

-- Add current_slide column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_slide INTEGER DEFAULT 1;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_current_slide ON rooms(id, current_slide);

-- Update existing rooms to have current_slide = 1
UPDATE rooms SET current_slide = 1 WHERE current_slide IS NULL;
