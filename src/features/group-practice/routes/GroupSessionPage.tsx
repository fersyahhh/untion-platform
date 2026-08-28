import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  MessageSquare,
  Users,
  Crown,
  Loader2,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  createDeepgramSocket,
  countFillerWords,
  countLongPauses,
} from "../../../lib/deepgram";
import { supabase } from "../../../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  getRoomById,
  getRoomMembers,
  updateCurrentSlide,
  saveSessionResult,
  moveToNextPresenter,
  updateRoom,
} from "../lib/roomService";
import { subscribeToRoom } from "../lib/realtimeService";
import type { Room, RoomMember } from "../types";
import {
  evaluatePresentation,
  type EvaluationInput,
  type EvaluationResult,
} from "../../../lib/groq";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function GroupSessionPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  // State for room data
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time channel
  const [, setRoomChannel] = useState<RealtimeChannel | null>(null);

  // Session state
  const [isRecording, setIsRecording] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [finalParts, setFinalParts] = useState<string[]>([]);
  const [interimText, setInterimText] = useState("");

  // Refs
  const deepgramRef = useRef<ReturnType<typeof createDeepgramSocket> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timestampsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 800, scale: 1 });

  // Computed values
  const currentPresenter = members.find((m) => m.user_id === room?.active_presenter_id);
  const isMyTurn = currentPresenter?.user_id === currentUserId;
  const myAssignment = members.find((m) => m.user_id === currentUserId);
  const canControlSlide = isMyTurn && myAssignment;

  const fullTranscript = finalParts.join(" ") + (interimText ? " " + interimText : "");

  // Load room data from database
  useEffect(() => {
    const loadSessionData = async () => {
      if (!roomId) {
        navigate("/practice/group");
        return;
      }

      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Not authenticated");
        }
        setCurrentUserId(user.id);

        // Load room
        const roomData = await getRoomById(roomId);
        if (!roomData) {
          throw new Error("Room not found");
        }
        setRoom(roomData);
        setCurrentSlide(roomData.current_slide || 1);
        setNumPages(roomData.total_slides || 1);
        setTimeLeft((roomData.duration_minutes || 5) * 60);

        // Load members (sorted by turn_order)
        const membersData = await getRoomMembers(roomId);
        const sortedMembers = membersData.sort((a, b) => (a.turn_order || 0) - (b.turn_order || 0));
        setMembers(sortedMembers);

        setLoading(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to load session");
        navigate("/practice/group");
      }
    };

    loadSessionData();
  }, [roomId, navigate]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!roomId) return;


    const rChannel = subscribeToRoom(roomId, (updatedRoom) => {
      
      setRoom((_prevRoom) => {
        return updatedRoom;
      });

      // CRITICAL: Sync slide changes immediately for all users
      const newSlide = updatedRoom.current_slide || 1;
      setCurrentSlide(newSlide);

      // Navigate to result page when session completes
      if (updatedRoom.status === "completed") {
        navigate(`/practice/group/result/${roomId}`);
      }
    });

    setRoomChannel(rChannel);

    return () => {
      rChannel?.unsubscribe();
    };
  }, [roomId, navigate]);

  // Calculate PDF size based on available space
  useEffect(() => {
    const calculatePdfSize = () => {
      const windowWidth = window.innerWidth;
      const container = containerRef.current;
      
      let targetWidth;
      
      // Mobile: smaller width to prevent cutoff
      if (windowWidth < 768) {
        targetWidth = Math.min(windowWidth * 0.85, 400);
      }
      // Tablet
      else if (windowWidth < 1024) {
        targetWidth = Math.min(windowWidth * 0.70, 700);
      }
      // Desktop: use more space since transcript is on the side
      else {
        const availableWidth = container?.clientWidth || windowWidth * 0.75;
        targetWidth = Math.min(availableWidth * 0.90, 1100);
      }

      setPdfDimensions({ width: targetWidth, scale: 1 });
    };

    calculatePdfSize();
    window.addEventListener('resize', calculatePdfSize);
    
    const container = containerRef.current;
    if (container) {
      const observer = new ResizeObserver(calculatePdfSize);
      observer.observe(container);
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', calculatePdfSize);
      };
    }

    return () => window.removeEventListener('resize', calculatePdfSize);
  }, []);

  // Timer management
  useEffect(() => {
    if (!isMyTurn) return;

    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinishTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isMyTurn]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSlideChange = async (newSlide: number) => {
    if (!canControlSlide || !roomId || !myAssignment) {
      toast.error("Tidak bisa mengubah slide. Pastikan ini giliran Anda.");
      return;
    }

    // Validate slide range
    const minSlide = myAssignment.assigned_slide_start || 1;
    const maxSlide = myAssignment.assigned_slide_end || numPages;

    if (newSlide < minSlide || newSlide > maxSlide) {
      toast.warning(`Slide ${newSlide} di luar range Anda (${minSlide}-${maxSlide})`);
      return;
    }
    
    // Update local state immediately for responsive UX
    setCurrentSlide(newSlide);

    // Broadcast slide change to database (which triggers real-time update to all clients)
    try {
      await updateCurrentSlide(roomId, newSlide);
    } catch (err: any) {
      toast.error(`Gagal mengubah slide: ${err.message}\n\nPastikan Anda adalah presenter yang aktif.`);
      // Revert local state
      setCurrentSlide(currentSlide);
    }
  };

  const handleFinishTurn = useCallback(async () => {
    if (finishedRef.current || !isMyTurn || !roomId || !currentUserId || !room) {
      return;
    }
    
    finishedRef.current = true;

    // Stop recording
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    deepgramRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);

    const actualDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
    const transcript = finalParts.join(" ") + (interimText ? " " + interimText : "");
    const hasTranscript = transcript.trim().length > 0;
    const fillerData = hasTranscript
      ? countFillerWords(transcript)
      : { total: 0, breakdown: {} };
    const longPauses = hasTranscript ? countLongPauses(timestampsRef.current) : 0;
    const words = hasTranscript ? transcript.trim().split(/\s+/).length : 0;
    const wpm = actualDuration > 0 ? Math.round((words / actualDuration) * 60) : 0;

    try {
      
      // AI Evaluation
      let evaluationResult: EvaluationResult;
      
      if (hasTranscript) {
        // Show analyzing toast
        const analyzingToast = toast.loading("Analyzing your presentation...");
        
        try {
          const evaluationInput: EvaluationInput = {
            transcript: transcript.trim(),
            description: "Group practice presentation session", // Generic description for group
            targetDurationMinutes: room.duration_minutes || 5,
            actualDurationSeconds: actualDuration,
            fillerWordCount: fillerData.total,
            fillerBreakdown: fillerData.breakdown,
            longPauses: longPauses,
            totalSlides: myAssignment?.assigned_slide_end && myAssignment?.assigned_slide_start 
              ? (myAssignment.assigned_slide_end - myAssignment.assigned_slide_start + 1)
              : (room.total_slides || 1),
          };
          
          evaluationResult = await evaluatePresentation(evaluationInput);
          
          toast.dismiss(analyzingToast);
          toast.success("Presentation analyzed successfully!");
        } catch (evalError: any) {
          toast.dismiss(analyzingToast);
          toast.error("AI evaluation failed, using default feedback");
          
          // Fallback to default result if AI fails
          evaluationResult = {
            overallScore: 70,
            aspects: [
              {
                name: "Content Accuracy",
                score: 18,
                maxScore: 25,
                feedback: "Could not evaluate due to AI service error. Please try again.",
              },
              {
                name: "Structure & Flow",
                score: 11,
                maxScore: 15,
                feedback: "Evaluation unavailable.",
              },
              {
                name: "Vocabulary & Terminology",
                score: 11,
                maxScore: 15,
                feedback: "Evaluation unavailable.",
              },
              {
                name: "Filler Words Management",
                score: 10,
                maxScore: 15,
                feedback: `You used ${fillerData.total} filler words.`,
              },
              {
                name: "Pacing & Time",
                score: 10,
                maxScore: 15,
                feedback: `Your speaking pace was ${wpm} words per minute.`,
              },
              {
                name: "Clarity & Coherence",
                score: 10,
                maxScore: 15,
                feedback: "Evaluation unavailable.",
              },
            ],
            summary: "Presentation completed. AI evaluation temporarily unavailable.",
            strengths: [
              "Completed the presentation successfully",
              `Duration: ${Math.floor(actualDuration / 60)}:${(actualDuration % 60).toString().padStart(2, '0')}`,
            ],
            improvements: [
              "AI evaluation service is temporarily unavailable",
              "Please contact support if this persists",
            ],
            wordCount: words,
            wpm: wpm,
          };
        }
      } else {
        // No transcript case
        evaluationResult = {
          overallScore: 0,
          aspects: [
            {
              name: "Content Accuracy",
              score: 0,
              maxScore: 25,
              feedback: "No content was delivered. Please try again and make sure your microphone is active when speaking.",
            },
            {
              name: "Structure & Flow",
              score: 0,
              maxScore: 15,
              feedback: "Cannot evaluate structure because there is no transcript.",
            },
            {
              name: "Vocabulary & Terminology",
              score: 0,
              maxScore: 15,
              feedback: "Cannot evaluate vocabulary without recorded speech.",
            },
            {
              name: "Filler Words Management",
              score: 0,
              maxScore: 15,
              feedback: "No filler words were detected because no speech was recorded.",
            },
            {
              name: "Pacing & Time",
              score: 0,
              maxScore: 15,
              feedback: "Cannot evaluate pacing without any recorded content.",
            },
            {
              name: "Clarity & Coherence",
              score: 0,
              maxScore: 15,
              feedback: "Cannot evaluate clarity without speech data.",
            },
          ],
          summary: "The presentation session did not produce a transcript. Make sure your microphone is connected and you have granted microphone access permissions when speaking.",
          strengths: [
            "You completed the presentation session",
          ],
          improvements: [
            "Ensure your microphone is connected and working",
            "Grant microphone permissions to the browser",
            "Speak clearly and loud enough for the microphone to detect",
            "Check if the recording indicator (pulsing mic) is active while speaking",
          ],
          wordCount: 0,
          wpm: 0,
        };
      }

      
      // Save session result to database with AI evaluation
      await saveSessionResult(roomId, currentUserId, {
        transcript: hasTranscript ? transcript.trim() : "No transcript recorded. Microphone may not have been active or no speech was detected.",
        filler_word_count: fillerData.total,
        filler_breakdown: fillerData.breakdown,
        long_pauses: longPauses,
        actual_duration_seconds: actualDuration,
        word_count: evaluationResult.wordCount,
        wpm: evaluationResult.wpm,
        overall_score: evaluationResult.overallScore,
        aspects: evaluationResult.aspects,
        summary: evaluationResult.summary,
        strengths: evaluationResult.strengths,
        improvements: evaluationResult.improvements,
      });


      // Find next presenter
      const currentIndex = members.findIndex((m) => m.user_id === currentUserId);
      const nextIndex = currentIndex + 1;


      if (nextIndex >= members.length) {
        // All members finished, complete session
        await updateRoom(roomId, { status: "completed" });
        // Real-time will trigger navigation to result page
      } else {
        // Move to next presenter
        const nextPresenter = members[nextIndex];
        const nextStartSlide = nextPresenter.assigned_slide_start || 1;

        await moveToNextPresenter(roomId, nextPresenter.user_id, nextStartSlide);

        // Reset state for watching next presenter
        setTimeLeft((room.duration_minutes || 5) * 60);
        setFinalParts([]);
        setInterimText("");
        timestampsRef.current = [];
        finishedRef.current = false;
        startTimeRef.current = Date.now();
      }
    } catch (err: any) {
      toast.error(`Failed to save results: ${err.message}`);
      finishedRef.current = false;
    }
  }, [
    isMyTurn,
    roomId,
    currentUserId,
    room,
    finalParts,
    interimText,
    members,
  ]);

  const startRecording = useCallback(async () => {
    if (!isMyTurn) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const dgSocket = createDeepgramSocket({
        onTranscript: (text, isFinal) => {
          timestampsRef.current.push(Date.now());
          if (isFinal) {
            setFinalParts((prev) => [...prev, text]);
            setInterimText("");
          } else {
            setInterimText(text);
          }
        },
        onError: (_err) => {
        },
      });
      deepgramRef.current = dgSocket;

      await new Promise<void>((resolve) => {
        const checkReady = setInterval(() => {
          if (dgSocket.socket.readyState === WebSocket.OPEN) {
            clearInterval(checkReady);
            resolve();
          }
        }, 100);
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          dgSocket.sendAudio(event.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access is required.");
    }
  }, [isMyTurn]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    deepgramRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
    setInterimText("");
  }, []);

  const toggleRecording = () => {
    if (!isMyTurn) {
      toast.warning("Bukan giliran Anda untuk berbicara!");
      return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;

    const confirm = window.confirm(
      "Apakah Anda yakin ingin keluar? Progres Anda akan hilang."
    );
    if (!confirm) return;

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    navigate("/practice/group");
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center font-body">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-teal animate-spin mx-auto mb-4" />
          <p className="text-brown-muted">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  // If no PDF or room, redirect
  if (!room || !room.pdf_url) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center font-body">
        <div className="text-center">
          <p className="text-brown-muted mb-4">Tidak ada presentasi yang dimuat.</p>
          <button
            onClick={() => navigate("/practice/group")}
            className="text-teal font-bold hover:underline"
          >
            Kembali ke Group Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-cream font-body flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 sm:h-14 bg-white border-b border-warm-border px-3 sm:px-4 lg:px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 truncate min-w-0 flex-1">
          <button
            onClick={handleLeaveRoom}
            className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-brown/5 text-brown transition-colors shrink-0"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="h-3 w-px sm:h-4 sm:w-px bg-warm-border shrink-0" />
          <span className="font-display font-bold text-brown truncate text-xs sm:text-sm lg:text-base">
            {room.name}
          </span>
          <span className="hidden md:inline-flex rounded-full bg-cream-warm px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-semibold text-brown-muted border border-warm-border shrink-0">
            Group Mode
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 shrink-0">
          <div
            className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold ${
              timeLeft < 60 ? "text-red-500 animate-pulse" : "text-brown-muted"
            }`}
          >
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="w-10 sm:w-12">{formatTime(timeLeft)}</span>
          </div>
          {isMyTurn && (
            <button
              onClick={handleFinishTurn}
              className="rounded-full bg-brown px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-brown-light hover:shadow-lg transition-all active:scale-95"
            >
              Selesai
            </button>
          )}
        </div>
      </header>

      {/* Turn Indicator Banner */}
      <div
        className={`py-2 sm:py-3 px-3 sm:px-6 text-center font-bold text-xs sm:text-sm ${
          isMyTurn
            ? "bg-teal text-white"
            : "bg-cream-warm text-brown-muted border-b border-warm-border"
        }`}
      >
        {isMyTurn ? (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <Crown className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">
              Giliran Anda! Slide {myAssignment?.assigned_slide_start}-
              {myAssignment?.assigned_slide_end}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">
              Giliran: <strong>{currentPresenter?.username}</strong> sedang presentasi
              <span className="hidden xs:inline">
                {" "}(Slide {currentPresenter?.assigned_slide_start}-
                {currentPresenter?.assigned_slide_end})
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Main Workspace - Responsive split layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* PDF Area - Takes remaining space after transcript */}
        <div className="flex-1 flex flex-col bg-gray-50 relative overflow-hidden min-h-0 lg:min-w-0">
          {/* PDF Viewer Container - full available space */}
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center relative overflow-auto bg-gray-100 p-2"
          >
            <Document
              file={room.pdf_url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
                </div>
              }
            >
              <Page
                pageNumber={currentSlide}
                width={pdfDimensions.width}
                scale={pdfDimensions.scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
              />
            </Document>

            {/* Slide Counter Overlay */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-warm-border px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-brown-muted shadow-sm">
              Slide {currentSlide} of {numPages}
            </div>
          </div>

          {/* Controls & Mic — compact bar at bottom */}
          <div className="h-16 bg-white border-t border-warm-border flex items-center justify-between px-4 sm:px-8 shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 w-1/3">
              <button
                onClick={() =>
                  handleSlideChange(Math.max(myAssignment?.assigned_slide_start || 1, currentSlide - 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-warm-border text-brown hover:bg-cream-warm transition-colors disabled:opacity-50"
                disabled={
                  !canControlSlide ||
                  currentSlide <= (myAssignment?.assigned_slide_start || 1)
                }
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  handleSlideChange(Math.min(myAssignment?.assigned_slide_end || numPages, currentSlide + 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-warm-border text-brown hover:bg-cream-warm transition-colors disabled:opacity-50"
                disabled={
                  !canControlSlide ||
                  currentSlide >= (myAssignment?.assigned_slide_end || numPages)
                }
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Mic Toggle */}
            <div className="flex justify-center w-1/3 relative">
              {isRecording && (
                <div className="absolute inset-0 m-auto h-14 w-14 animate-ping rounded-full bg-teal/40" />
              )}
              <button
                onClick={toggleRecording}
                disabled={!isMyTurn}
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                  isRecording
                    ? "bg-teal text-white shadow-teal/30"
                    : "bg-cream-deep text-brown shadow-brown/10 hover:bg-warm-border"
                }`}
              >
                {isRecording ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex justify-end w-1/3">
              {isRecording && (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-full w-full rounded-full bg-red-500"></span>
                  </span>
                  <span className="text-xs font-bold text-brown animate-pulse">Recording</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transcript Panel - Smaller width on desktop, collapsible on mobile */}
        <div className="w-full lg:w-72 bg-white border-t lg:border-t-0 lg:border-l border-warm-border flex flex-col shrink-0 max-h-[300px] lg:max-h-full">
          
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-2.5 bg-cream-warm/30 shrink-0 border-b border-warm-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-brown" />
                  <h3 className="font-display font-bold text-brown text-xs">
                    Live Transcript
                  </h3>
                </div>
                {isMyTurn && (
                  <span className="text-xs font-semibold text-teal bg-teal/10 px-2 py-1 rounded-full">
                    Your Turn
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="rounded-lg bg-cream p-2.5 border border-warm-border text-xs leading-relaxed text-brown shadow-inner min-h-full">
                <div className="break-words overflow-wrap-anywhere whitespace-pre-wrap hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {isMyTurn ? (
                    fullTranscript.trim() ? (
                      <>
                        <span>{fullTranscript.trim()}</span>
                        {isRecording && (
                          <span className="inline-block w-1.5 h-4 ml-1 bg-teal animate-pulse align-middle" />
                        )}
                      </>
                    ) : (
                      <span className="text-brown-muted italic">
                        {isRecording
                          ? "Listening... Start speaking."
                          : "Turn on the microphone to begin transcription."}
                      </span>
                    )
                  ) : (
                    <span className="text-brown-muted italic">
                      Waiting for {currentPresenter?.username} to present...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
