import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { createRoom } from "../lib/roomService";
import { useLanguage } from "../../../contexts/LanguageContext";

interface CreateRoomModalProps {
  onClose: () => void;
}

export default function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a room");
      }

      // Create room in database
      const room = await createRoom(roomName.trim(), user.id);
      
      // Navigate to waiting room with real room data
      navigate(`/practice/group/waiting/${room.id}`, {
        state: {
          roomName: room.name,
          roomCode: room.code,
          isLeader: true,
        }
      });
    } catch (err: any) {
      setError(err.message || "Failed to create room. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown/20 backdrop-blur-sm animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl shadow-brown/15 border border-warm-border overflow-hidden animate-slide-in-up">
        {/* Header */}
        <div className="relative bg-white border-b border-warm-border px-6 py-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-brown">{t('modal.createRoom.title')}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-cream-warm transition-colors text-brown-muted hover:text-brown"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Room Name Input */}
          <div>
            <label
              htmlFor="roomName"
              className="block text-sm font-bold text-brown mb-2"
            >
              {t('group.roomName')}
            </label>
            <input
              id="roomName"
              type="text"
              required
              maxLength={50}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder={t('modal.createRoom.namePlaceholder')}
              className="w-full rounded-lg border border-warm-border px-4 py-3 text-sm text-brown placeholder-brown-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 bg-cream-warm/30 transition-all"
              disabled={isCreating}
              autoFocus
            />
            <p className="mt-2 text-xs text-brown-muted">
              {t('modal.createRoom.nameHelper')}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-warm-border" />

          {/* Info */}
          <div className="text-sm text-brown-muted leading-relaxed">
            <p className="font-bold text-brown mb-1">{t('modal.createRoom.afterCreate')}</p>
            <ul className="space-y-1 text-xs">
              <li>• {t('modal.createRoom.info1')}</li>
              <li>• {t('modal.createRoom.info2')}</li>
              <li>• {t('modal.createRoom.info3')}</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 rounded-lg border border-warm-border bg-white px-4 py-2.5 text-sm font-bold text-brown transition-colors hover:bg-cream-warm disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!roomName.trim() || isCreating}
              className="flex-1 rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('modal.createRoom.creating')}</span>
                </>
              ) : (
                t('modal.createRoom.create')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
