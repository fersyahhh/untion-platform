import { supabase } from "../../../lib/supabase";
import type { Room, RoomMember } from "../types";
import { generateUniqueRoomCode } from "./roomCodeGenerator";

/**
 * Create a new practice room
 * @param name - Room name
 * @param leaderId - User ID of the room leader
 * @returns Created room object
 */
export async function createRoom(name: string, leaderId: string): Promise<Room> {
  // Generate unique code
  const code = await generateUniqueRoomCode();
  
  // Get leader's username
  const { data: { user } } = await supabase.auth.getUser();
  const leaderUsername = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  
  // Insert room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({
      name,
      code,
      leader_id: leaderId,
      status: 'waiting',
    })
    .select()
    .single();
  
  if (roomError || !room) {
    throw new Error(`Failed to create room: ${roomError?.message || 'Unknown error'}`);
  }
  
  // Add leader as first member WITH username
  const { error: memberError } = await supabase
    .from('room_members')
    .insert({
      room_id: room.id,
      user_id: leaderId,
      username: leaderUsername,
    });
  
  if (memberError) {
    // Non-fatal, room is still created
  }
  
  return room;
}

/**
 * Get room by code
 * @param code - 6-character room code
 * @returns Room object or null if not found
 */
export async function getRoomByCode(code: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();
  
  if (error) {
    return null;
  }
  
  return data;
}

/**
 * Get room by ID
 * @param roomId - Room UUID
 * @returns Room object or null if not found
 */
export async function getRoomById(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();
  
  if (error) {
    return null;
  }
  
  return data;
}

/**
 * Join an existing room
 * @param code - 6-character room code
 * @param userId - User ID of the member joining
 * @returns Room object
 * @throws Error if room not found, already started, or full
 */
export async function joinRoom(code: string, userId: string): Promise<Room> {
  // Get room
  const room = await getRoomByCode(code);
  
  if (!room) {
    throw new Error('Room not found. Please check the code and try again.');
  }
  
  if (room.status !== 'waiting') {
    throw new Error('This session has already started or ended. You cannot join now.');
  }
  
  // Check if already a member
  const { data: existingMember } = await supabase
    .from('room_members')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (existingMember) {
    // Already a member, just return room
    return room;
  }
  
  // Check room capacity (max 10 members)
  const { count } = await supabase
    .from('room_members')
    .select('id', { count: 'exact', head: true })
    .eq('room_id', room.id);
  
  if (count && count >= 10) {
    throw new Error('This room is full (maximum 10 members). Please try another room.');
  }
  
  // Get user's username
  const { data: { user } } = await supabase.auth.getUser();
  const memberUsername = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  
  // Add user to room WITH username
  const { error } = await supabase
    .from('room_members')
    .insert({
      room_id: room.id,
      user_id: userId,
      username: memberUsername,
    });
  
  if (error) {
    throw new Error(`Failed to join room: ${error.message}`);
  }
  
  return room;
}

/**
 * Leave a room (remove member)
 * @param roomId - Room UUID
 * @param userId - User ID of the member leaving
 */
export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId);
  
  if (error) {
    throw new Error(`Failed to leave room: ${error.message}`);
  }
}

/**
 * Get all members of a room with user information
 * @param roomId - Room UUID
 * @returns Array of room members with usernames
 */
export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  // Get room members with username from database
  const { data: members, error: membersError } = await supabase
    .from('room_members')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });
  
  if (membersError) {
    return [];
  }

  if (!members || members.length === 0) {
    return [];
  }

  // Get current user to add "(You)" suffix
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Map members with usernames from database
  const membersWithInfo = members.map((member) => ({
    id: member.id,
    room_id: member.room_id,
    user_id: member.user_id,
    assigned_slide_start: member.assigned_slide_start,
    assigned_slide_end: member.assigned_slide_end,
    turn_order: member.turn_order,
    joined_at: member.joined_at,
    // Use username from database, fallback to User if not set
    username: member.user_id === currentUser?.id 
      ? `${member.username || 'You'} (You)`
      : (member.username || 'User'),
    email: member.user_id === currentUser?.id ? currentUser?.email : undefined,
  }));
  
  return membersWithInfo as RoomMember[];
}

/**
 * Update room configuration
 * @param roomId - Room UUID
 * @param updates - Partial room object with fields to update
 * @returns Updated room object
 */
export async function updateRoom(
  roomId: string,
  updates: Partial<Omit<Room, 'id' | 'code' | 'created_at' | 'updated_at'>>
): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', roomId)
    .select()
    .single();
  
  if (error || !data) {
    throw new Error(`Failed to update room: ${error?.message || 'Unknown error'}`);
  }
  
  return data;
}

/**
 * Update member assignments (slide ranges and turn order)
 * @param memberId - Room member UUID
 * @param slideStart - Starting slide number
 * @param slideEnd - Ending slide number
 * @param turnOrder - Turn order position
 */
export async function updateMemberAssignment(
  memberId: string,
  slideStart: number,
  slideEnd: number,
  turnOrder: number
): Promise<void> {
  const { error } = await supabase
    .from('room_members')
    .update({
      assigned_slide_start: slideStart,
      assigned_slide_end: slideEnd,
      turn_order: turnOrder,
    })
    .eq('id', memberId);
  
  if (error) {
    throw new Error(`Failed to update member assignment: ${error.message}`);
  }
}

/**
 * Save session result for a member
 * @param roomId - Room UUID
 * @param userId - User ID
 * @param sessionData - Session result data
 */
export async function saveSessionResult(
  roomId: string,
  userId: string,
  sessionData: {
    transcript: string;
    filler_word_count: number;
    filler_breakdown: Record<string, number>;
    long_pauses: number;
    actual_duration_seconds: number;
    word_count: number;
    wpm: number;
    overall_score: number;
    aspects: any[];
    summary?: string;
    strengths?: string[];
    improvements?: string[];
  }
): Promise<void> {
  const { error } = await supabase
    .from('room_sessions')
    .upsert({
      room_id: roomId,
      user_id: userId,
      ...sessionData,
    }, {
      onConflict: 'room_id,user_id'
    });
  
  if (error) {
    throw new Error(`Failed to save session result: ${error.message}`);
  }
}

/**
 * Get all session results for a room
 * @param roomId - Room UUID
 * @returns Array of session results with user info
 */
export async function getRoomSessions(roomId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('room_sessions')
    .select(`
      *,
      user:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('room_id', roomId)
    .order('overall_score', { ascending: false });
  
  if (error) {
    return [];
  }
  
  return (data || []).map((session: any) => ({
    ...session,
    username: session.user?.raw_user_meta_data?.username || session.user?.email?.split('@')[0] || 'Unknown',
  }));
}

/**
 * Update current slide in room (for real-time sync)
 * @param roomId - Room UUID
 * @param slideNumber - Current slide number
 */
export async function updateCurrentSlide(
  roomId: string,
  slideNumber: number
): Promise<void> {
  try {
    
    const { data: _data, error } = await supabase
      .from('rooms')
      .update({ current_slide: slideNumber })
      .eq('id', roomId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
  } catch (err: any) {
    throw new Error(`Failed to update slide: ${err.message}`);
  }
}

/**
 * Move to next presenter and reset slide to their assigned start
 * @param roomId - Room UUID
 * @param nextPresenterId - User ID of next presenter
 * @param startSlide - Starting slide for next presenter
 */
export async function moveToNextPresenter(
  roomId: string,
  nextPresenterId: string,
  startSlide: number
): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({ 
      active_presenter_id: nextPresenterId,
      current_slide: startSlide
    })
    .eq('id', roomId);
  
  if (error) {
    throw new Error(`Failed to move to next presenter: ${error.message}`);
  }
}
