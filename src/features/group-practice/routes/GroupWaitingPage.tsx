import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Users, Copy, CheckCircle, Crown, Play, FileText, X, Loader2, Lightbulb } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { getRoomById, getRoomMembers, updateRoom, leaveRoom } from "../lib/roomService";
import { subscribeToRoom, subscribeToRoomMembers } from "../lib/realtimeService";
import type { Room, RoomMember } from "../types";
import UploadPdfModal from "../components/UploadPdfModal";
import SlideAssignmentPanel from "../components/SlideAssignmentPanel";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function GroupWaitingPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Get initial data from navigation state (for smooth transition)
  const initialIsLeader = location.state?.isLeader || false;

  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState(initialIsLeader);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState<{
    file: File;
    duration: number;
    totalSlides: number;
  } | null>(null);

  // Load initial data
  useEffect(() => {
    if (roomId) {
      loadRoomData();
    }
  }, [roomId]); // Only depend on roomId

  // Setup real-time subscriptions
  useEffect(() => {
    if (!roomId || !room) {
      return;
    }


    // Subscribe to room updates
    const rChannel = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      
      // Auto-navigate when session starts
      if (updatedRoom.status === 'in_progress') {
        navigate(`/practice/group/session/${roomId}`, {
          state: { room: updatedRoom }
        });
      }
    });

    // Subscribe to member changes
    const mChannel = subscribeToRoomMembers(roomId, {
      onInsert: async (_member) => {
        // Reload members to get user info
        const updatedMembers = await getRoomMembers(roomId);
        setMembers(updatedMembers);
      },
      onUpdate: async (_member) => {
        // Reload members
        const updatedMembers = await getRoomMembers(roomId);
        setMembers(updatedMembers);
      },
      onDelete: async (_deletedMemberId) => {
        // Reload all members from database to ensure consistency
        const updatedMembers = await getRoomMembers(roomId);
        setMembers(updatedMembers);
      },
    });

    // Cleanup on unmount
    return () => {
      rChannel?.unsubscribe();
      mChannel?.unsubscribe();
    };
  }, [roomId, room, navigate]);

  const loadRoomData = async () => {
    if (!roomId) {
      setError("Room ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in");
      }
      setCurrentUserId(user.id);

      // Load room data
      const roomData = await getRoomById(roomId);
      if (!roomData) {
        throw new Error("Room not found");
      }

      setRoom(roomData);
      setIsLeader(roomData.leader_id === user.id);

      // Load members
      const membersData = await getRoomMembers(roomId);
      setMembers(membersData);

      // Check if PDF already uploaded
      if (roomData.pdf_url && roomData.total_slides) {
        // Simulate uploaded state for UI (we don't have the actual File object)
        setUploadedPdf({
          file: new File([], roomData.pdf_file_name || "presentation.pdf"),
          duration: roomData.duration_minutes || 5,
          totalSlides: roomData.total_slides,
        });
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load room data");
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId || !currentUserId) return;

    try {
      await leaveRoom(roomId, currentUserId);
      navigate('/practice/group');
    } catch (err: any) {
      toast.error(err.message || "Failed to leave room");
    }
  };

  const handleUploadPdf = async (file: File, duration: number, totalSlides: number) => {
    if (!roomId || !isLeader) {
      return;
    }

    setIsUploadModalOpen(false);
    
    try {
      // Show uploading state
      setUploadedPdf({
        file,
        duration,
        totalSlides,
      });

      // Upload PDF to Supabase Storage
      const { uploadPdf: uploadPdfToStorage } = await import("../lib/storageService");
      const pdfUrl = await uploadPdfToStorage(roomId, file);

      // Update room with PDF info
      await updateRoom(roomId, {
        pdf_url: pdfUrl,
        pdf_file_name: file.name,
        total_slides: totalSlides,
        duration_minutes: duration,
      });

    } catch (err: any) {
      toast.error(`Failed to upload PDF: ${err.message || err}`);
      setUploadedPdf(null);
    }
  };

  const handleStartSession = async () => {
    if (!roomId || !room || !isLeader) return;

    try {
      // Get first presenter's starting slide
      const firstPresenter = members[0];
      const startSlide = firstPresenter?.assigned_slide_start || 1;

      // Update room status to in_progress
      await updateRoom(roomId, {
        status: 'in_progress',
        active_presenter_id: firstPresenter?.user_id || null,
        current_slide: startSlide,
      });

      // Real-time subscription will auto-navigate all members
    } catch (err: any) {
      toast.error(err.message || "Failed to start session");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream font-body flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-teal animate-spin mx-auto mb-4" />
          <p className="text-brown-muted">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <div className="min-h-screen bg-cream font-body flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-warm-border p-8 max-w-md w-full text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="font-display text-xl font-bold text-brown mb-2">
            {t('common.error')}
          </h2>
          <p className="text-brown-muted mb-6">
            {error || t('common.error')}
          </p>
          <button
            onClick={() => navigate('/practice/group')}
            className="rounded-full bg-teal text-white px-6 py-3 font-bold hover:bg-teal-light transition-all"
          >
            {t('group.leaveRoom')}
          </button>
        </div>
      </div>
    );
  }

  // Helper: Get time ago string
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <div className="min-h-screen bg-cream font-body flex flex-col">
      {/* Navbar */}
      <nav className="h-16 sm:h-20 border-b border-warm-border bg-white/50 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={handleLeaveRoom}
            className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-brown/5 text-brown transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-base sm:text-lg font-bold text-brown truncate">
              {room.name}
            </h1>
            <p className="text-xs text-brown-muted truncate">
              {isLeader ? t('group.leaderControls') : t('group.waitingForLeader')}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLeaveRoom}
          className="rounded-full border-2 border-warm-border bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-brown hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shrink-0 ml-2"
        >
          <span className="hidden xs:inline">{t('group.leaveRoom')}</span>
          <span className="xs:hidden">{t('group.leaveRoom')}</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Room Code Card */}
          <div className="bg-teal rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-md mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="text-center sm:text-left w-full sm:w-auto">
                <p className="text-white/70 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
                  {t('group.roomCode')}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
                  <div className="font-display text-4xl sm:text-5xl font-bold tracking-widest">
                    {room.code}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-xs sm:text-sm font-bold">{t('group.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-xs sm:text-sm font-bold">{t('group.copy')}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-white/70 text-xs sm:text-sm mt-2 sm:mt-3">
                  {t('group.shareCode')}
                </p>
              </div>
              
              <div className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 rounded-lg border border-white/20">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-bold text-sm sm:text-base">{members.length} {t('group.members')}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Members List */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-warm-border shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-brown flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
                    {t('group.teamMembers')}
                  </h2>
                  <span className="text-xs sm:text-sm text-brown-muted">
                    {members.length} / 10
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {members.map((member) => {
                    const memberIsLeader = member.user_id === room.leader_id;
                    const timeAgo = getTimeAgo(member.joined_at);
                    
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-cream-warm/50 border border-warm-border transition-all hover:shadow-md"
                      >
                        {/* Avatar */}
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal to-teal-light text-white font-bold text-sm sm:text-base shrink-0">
                          {(member.username || 'U').charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm sm:text-base text-brown truncate">
                              {member.username || 'User'}
                              {member.user_id === currentUserId && (
                                <span className="text-xs text-brown-muted ml-1">(You)</span>
                              )}
                            </p>
                            {memberIsLeader && (
                              <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-teal/10 rounded-full">
                                <Crown className="h-3 w-3 text-teal" />
                                <span className="text-xs font-bold text-teal">Leader</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-brown-muted">{timeAgo}</p>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-green-600 font-bold hidden xs:inline">Ready</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slide Assignment Panel - Only show after PDF upload */}
              {isLeader && uploadedPdf && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-warm-border shadow-sm p-4 sm:p-6">
                  <SlideAssignmentPanel
                    members={members}
                    totalSlides={uploadedPdf.totalSlides}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Leader Controls or Waiting Message */}
              {isLeader ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-warm-border shadow-sm p-4 sm:p-6">
                  <h3 className="font-display text-base sm:text-lg font-bold text-brown mb-4">
                    {t('group.leaderControls')}
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {/* PDF Status or Upload Button */}
                    {uploadedPdf ? (
                      <div className="p-3 sm:p-4 bg-teal/5 border border-teal/20 rounded-xl">
                        <div className="flex items-start gap-3">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-teal shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-brown text-xs sm:text-sm truncate">
                              {uploadedPdf.file.name}
                            </p>
                            <p className="text-xs text-brown-muted mt-1">
                              {uploadedPdf.totalSlides} slides • {uploadedPdf.duration} min/member
                            </p>
                          </div>
                          <button
                            onClick={() => setUploadedPdf(null)}
                            className="text-brown-muted hover:text-brown shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cream-warm border-2 border-dashed border-warm-border text-brown font-bold hover:bg-cream-deep transition-all text-sm sm:text-base"
                      >
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        {t('group.uploadPDF')}
                      </button>
                    )}

                    {/* Start Session Button */}
                    <button
                      onClick={handleStartSession}
                      disabled={members.length < 2 || !uploadedPdf}
                      className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-6 rounded-full bg-teal text-white font-bold shadow-md hover:bg-teal-light hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                      {t('group.startSession')}
                    </button>
                    
                    {!uploadedPdf && (
                      <p className="text-xs text-brown-muted text-center">
                        {t('modal.uploadPDF.tip1')}
                      </p>
                    )}
                    {uploadedPdf && members.length < 2 && (
                      <p className="text-xs text-brown-muted text-center">
                        {t('modal.createRoom.info1')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-warm-border shadow-sm p-4 sm:p-6">
                  <div className="text-center">
                    <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-teal/10 mb-4">
                      <Users className="h-7 w-7 sm:h-8 sm:w-8 text-teal" />
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-brown mb-2">
                      {t('group.waitingForLeader')}
                    </h3>
                    <p className="text-xs sm:text-sm text-brown-muted leading-relaxed">
                      {t('modal.joinRoom.info2')}
                    </p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-cream-warm border border-warm-border rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                <div className="flex items-start gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                  <h4 className="font-bold text-brown text-xs sm:text-sm">
                    {t('group.nextSteps')}
                  </h4>
                </div>
                <ol className="space-y-2 text-xs text-brown-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-teal font-bold shrink-0">1.</span>
                    <span>{t('group.step1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal font-bold shrink-0">2.</span>
                    <span>{t('group.step2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal font-bold shrink-0">3.</span>
                    <span>{t('group.step3')}</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upload PDF Modal */}
      <UploadPdfModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadPdf}
      />
    </div>
  );
}
