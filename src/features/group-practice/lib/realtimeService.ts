import { supabase } from "../../../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Room, RoomMember } from "../types";

/**
 * Subscribe to room changes (status, active presenter, etc.)
 * @param roomId - Room UUID
 * @param onUpdate - Callback when room is updated
 * @returns Realtime channel (call .unsubscribe() when done)
 */
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: Room) => void
): RealtimeChannel {
  
  const channel = supabase
    .channel(`room:${roomId}`, {
      config: {
        broadcast: { ack: true },
        presence: { key: roomId },
      },
    })
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        onUpdate(payload.new as Room);
      }
    )
    .subscribe((_status) => {
      // Channel subscribed
    });

  return channel;
}

/**
 * Subscribe to room members changes (join, leave, assignments)
 * @param roomId - Room UUID
 * @param onInsert - Callback when member joins
 * @param onUpdate - Callback when member is updated
 * @param onDelete - Callback when member leaves
 * @returns Realtime channel
 */
export function subscribeToRoomMembers(
  roomId: string,
  callbacks: {
    onInsert?: (member: RoomMember) => void;
    onUpdate?: (member: RoomMember) => void;
    onDelete?: (memberId: string) => void;
  }
): RealtimeChannel {
  
  const channel = supabase.channel(`room_members:${roomId}`);

  if (callbacks.onInsert) {
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "room_members",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        callbacks.onInsert!(payload.new as RoomMember);
      }
    );
  }

  if (callbacks.onUpdate) {
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "room_members",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        callbacks.onUpdate!(payload.new as RoomMember);
      }
    );
  }

  if (callbacks.onDelete) {
    channel.on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "room_members",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        // payload.old contains the deleted row data
        callbacks.onDelete!(payload.old.id || payload.old.user_id);
      }
    );
  }

  channel.subscribe((_status) => {
  });
  
  return channel;
}

/**
 * Subscribe to session results
 * @param roomId - Room UUID
 * @param onInsert - Callback when a session result is saved
 * @returns Realtime channel
 */
export function subscribeToSessions(
  roomId: string,
  onInsert: (session: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`room_sessions:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "room_sessions",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onInsert(payload.new);
      }
    )
    .subscribe();

  return channel;
}
