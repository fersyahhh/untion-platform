-- Fix: Allow active presenter to update current_slide
-- Members need to update current_slide when it's their turn

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Leader can update room" ON rooms;

-- Create new policy: Leader OR active presenter can update room
CREATE POLICY "Leader or active presenter can update room"
ON rooms FOR UPDATE
USING (
  -- Leader can update everything
  leader_id = auth.uid()
  OR
  -- Active presenter can update current_slide only
  (
    active_presenter_id = auth.uid()
    AND
    id IN (
      SELECT room_id FROM room_members WHERE user_id = auth.uid()
    )
  )
);
