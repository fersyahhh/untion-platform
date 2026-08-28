import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { joinRoom } from "../lib/roomService";
import { useLanguage } from "../../../contexts/LanguageContext";

interface JoinRoomModalProps {
  onClose: () => void;
}

export default function JoinRoomModal({ onClose }: JoinRoomModalProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCodeChange = (value: string) => {
    // Only allow A-Z and 0-9, max 6 characters
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setRoomCode(cleaned);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.length !== 6) {
      setError("Kode ruang harus 6 karakter");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Anda harus login untuk bergabung dengan ruang");
      }

      // Join room in database
      const room = await joinRoom(roomCode, user.id);
      
      // Navigate to waiting room with real room data
      navigate(`/practice/group/waiting/${room.id}`, {
        state: {
          roomName: room.name,
          roomCode: room.code,
          isLeader: false,
        }
      });
    } catch (err: any) {
      setError(err.message || "Gagal bergabung dengan ruang. Periksa kode dan coba lagi.");
      setIsJoining(false);
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
          <h2 className="font-display text-lg font-bold text-brown">{t('modal.joinRoom.title')}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-cream-warm transition-colors text-brown-muted hover:text-brown"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Room Code Input */}
          <div>
            <label
              htmlFor="roomCode"
              className="block text-sm font-bold text-brown mb-2"
            >
              {t('modal.joinRoom.codeLabel')}
            </label>
            
            <input
              id="roomCode"
              type="text"
              required
              value={roomCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={t('modal.joinRoom.codePlaceholder')}
              className="w-full rounded-lg border border-warm-border px-4 py-3 text-center text-lg font-bold text-brown placeholder-brown-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 bg-cream-warm/30 transition-all tracking-wider uppercase"
              disabled={isJoining}
              maxLength={6}
              autoFocus
            />
            <div className="mt-2 text-center text-xs text-brown-muted">
              {roomCode.length}/6 {t('modal.joinRoom.codeHelper')}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-warm-border" />

          {/* Info */}
          <div className="text-sm text-brown-muted leading-relaxed">
            <p className="font-bold text-brown mb-1">{t('modal.joinRoom.afterJoin')}</p>
            <ul className="space-y-1 text-xs">
              <li>• {t('modal.joinRoom.info1')}</li>
              <li>• {t('modal.joinRoom.info2')}</li>
              <li>• {t('modal.joinRoom.info3')}</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isJoining}
              className="flex-1 rounded-lg border border-warm-border bg-white px-4 py-2.5 text-sm font-bold text-brown transition-colors hover:bg-cream-warm disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={roomCode.length !== 6 || isJoining}
              className="flex-1 rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('modal.joinRoom.joining')}</span>
                </>
              ) : (
                t('modal.joinRoom.join')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
