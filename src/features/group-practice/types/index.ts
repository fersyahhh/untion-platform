// Type definitions for Group Practice feature

export type RoomStatus = 'waiting' | 'in_progress' | 'completed' | 'abandoned';

export interface Room {
  id: string;
  name: string;
  code: string;
  leader_id: string;
  status: RoomStatus;
  pdf_url: string | null;
  pdf_file_name: string | null;
  total_slides: number | null;
  duration_minutes: number | null;
  active_presenter_id: string | null;
  current_slide: number;
  created_at: string;
  updated_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  assigned_slide_start: number | null;
  assigned_slide_end: number | null;
  turn_order: number | null;
  joined_at: string;
  // Joined from auth.users via query
  username?: string;
  email?: string;
}

export interface SlideAssignment {
  user_id: string;
  username: string;
  slide_start: number;
  slide_end: number;
  turn_order: number;
}

export interface RoomSession {
  id: string;
  room_id: string;
  user_id: string;
  transcript: string;
  filler_word_count: number;
  filler_breakdown: Record<string, number>;
  long_pauses: number;
  actual_duration_seconds: number;
  word_count: number;
  wpm: number;
  overall_score: number;
  aspects: AspectScore[];
  summary: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
}

export interface AspectScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

// Database insert types (without auto-generated fields)
export type RoomInsert = Omit<Room, 'id' | 'created_at' | 'updated_at'>;
export type RoomMemberInsert = Omit<RoomMember, 'id' | 'joined_at'>;
export type RoomSessionInsert = Omit<RoomSession, 'id' | 'created_at'>;
