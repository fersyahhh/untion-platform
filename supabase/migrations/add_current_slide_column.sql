-- ============================================================================
-- ADD CURRENT_SLIDE COLUMN TO ROOMS TABLE
-- ============================================================================
-- 
-- Purpose: Enable real-time slide synchronization for all members
-- When presenter changes slide, all members see the same slide
--
-- ============================================================================

-- Add current_slide column to rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS current_slide INTEGER DEFAULT 1;

-- Add comment
COMMENT ON COLUMN rooms.current_slide IS 'Current slide number that all members should see (real-time synced)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rooms_current_slide ON rooms(current_slide);

-- Verify
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'rooms' 
AND column_name = 'current_slide';

-- ============================================================================
-- USAGE EXAMPLE
-- ============================================================================
-- 
-- Update current slide (presenter):
-- UPDATE rooms SET current_slide = 5 WHERE id = 'room-uuid';
--
-- Subscribe to changes (all members):
-- Real-time will broadcast current_slide updates to all subscribed clients
--
-- ============================================================================
