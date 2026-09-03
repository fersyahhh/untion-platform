import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  createDeepgramSocket,
  countFillerWords,
  countLongPauses,
} from "../../../lib/deepgram";
import { useLanguage } from "../../../contexts/LanguageContext";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function PracticeSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { pdfUrl, description, duration: durationMinutes, fileName } =
    location.state || {};

  const [isRecording, setIsRecording] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(1);
  const [timeLeft, setTimeLeft] = useState((durationMinutes || 5) * 60);
  const [finalParts, setFinalParts] = useState<string[]>([]);
  const [interimText, setInterimText] = useState("");

  // Refs
  const deepgramRef = useRef<ReturnType<typeof createDeepgramSocket> | null>(
    null,
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timestampsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const finishedRef = useRef(false);

  // Observe container width for PDF scaling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // DON'T cleanup blob URL during session!
  // The URL is needed throughout the entire session.
  // Browser will clean it up automatically when page closes.
  // Premature cleanup causes "Failed to load PDF" errors.
  
  const fullTranscript = finalParts.join(" ") + (interimText ? " " + interimText : "");

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate duration before stopping to get accurate speaking time
    const endTime = Date.now();
    const actualDuration = Math.round((endTime - startTimeRef.current) / 1000);
    
    mediaRecorderRef.current?.stop();
    deepgramRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    const transcript = finalParts.join(" ") + (interimText ? " " + interimText : "");
    
    // Handle empty transcript - set all metrics to 0
    const hasTranscript = transcript.trim().length > 0;
    const fillerData = hasTranscript ? countFillerWords(transcript) : { total: 0, breakdown: {} };
    const longPauses = hasTranscript ? countLongPauses(timestampsRef.current) : 0;

    // Note: We DON'T revoke pdfUrl here anymore!
    // It will be cleaned up automatically when component unmounts

    navigate("/practice/result", {
      state: {
        transcript: hasTranscript ? transcript.trim() : t('practice.solo.session.noRecording'),
        description,
        targetDurationMinutes: durationMinutes || 5,
        actualDurationSeconds: actualDuration,
        fillerWordCount: fillerData.total,
        fillerBreakdown: fillerData.breakdown,
        longPauses,
        totalSlides,
        fileName,
      },
    });
  }, [finalParts, interimText, description, durationMinutes, totalSlides, navigate, fileName, pdfUrl, t]);

  // Timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleFinish]);

  const startRecording = useCallback(async () => {
    try {
      
      // Request high-quality audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,           // Mono audio (sufficient for speech)
          sampleRate: 16000,         // 16kHz sample rate (standard for speech recognition)
          echoCancellation: true,    // Reduce echo
          noiseSuppression: true,    // Reduce background noise
          autoGainControl: true,     // Normalize volume
        } 
      });
      streamRef.current = stream;

      const dgSocket = createDeepgramSocket({
        onTranscript: (text, isFinal) => {
          const now = Date.now();
          timestampsRef.current.push(now);
          
          if (isFinal) {
            setFinalParts((prev) => [...prev, text]);
            setInterimText("");
          } else {
            // Throttle interim updates to reduce re-renders
            setInterimText(text);
          }
        },
        onError: (_err) => {
          // Silent error - don't interrupt user experience
          // Error is logged to console for debugging
        },
        onClose: () => {
          
          // Only notify if recording is still active
          if (isRecording) {
          }
        }
      });
      deepgramRef.current = dgSocket;

      // Wait for socket to open with timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Deepgram connection timeout'));
        }, 10000); // 10 second timeout

        const checkReady = setInterval(() => {
          if (dgSocket.socket.readyState === WebSocket.OPEN) {
            clearInterval(checkReady);
            clearTimeout(timeout);
            resolve();
          } else if (dgSocket.socket.readyState === WebSocket.CLOSED) {
            clearInterval(checkReady);
            clearTimeout(timeout);
            reject(new Error('Deepgram connection failed'));
          }
        }, 100);
      });

      // Setup MediaRecorder with optimal settings and browser compatibility
      let mimeType = "audio/webm";
      
      // Detect best available codec
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else {
        mimeType = ""; // Let browser choose
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128000, // 128kbps for good quality
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          dgSocket.sendAudio(event.data);
        }
      };

      mediaRecorder.onerror = (_event: Event) => {
      };

      // Start recording with 250ms chunks (balance between latency and performance)
      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err: any) {
      
      // Simplified error messages - no overwhelming details
      let errorMessage = "Gagal memulai recording.";
      
      if (err.message?.includes('Deepgram')) {
        errorMessage = "Tidak dapat terhubung ke layanan transkripsi.\n\nRecording tetap bisa dimulai, tapi transkripsi mungkin tidak tersedia.\n\nLanjutkan?";
      } else if (err.name === 'NotAllowedError') {
        errorMessage = "Akses microphone ditolak.\n\nSilakan allow microphone access dan coba lagi.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "Microphone tidak ditemukan.\n\nPastikan microphone terhubung dengan benar.";
      }
      
      toast.error(errorMessage);
    }
  }, []);

  const stopRecording = useCallback(() => {
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (deepgramRef.current) {
      deepgramRef.current.close();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
    
    setIsRecording(false);
    setInterimText("");
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalSlides(numPages);
  };

  // If no state was passed, redirect
  if (!pdfUrl) {
    return (
      <div className="h-screen bg-cream flex items-center justify-center font-body">
        <div className="text-center">
          <p className="text-brown-muted mb-4">{t('practice.solo.session.noPresentation')}</p>
          <Link
            to="/practice/solo"
            className="text-teal font-bold hover:underline"
          >
            {t('practice.solo.session.goToSetup')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-cream font-body flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 sm:h-16 bg-white border-b border-warm-border px-3 sm:px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2 sm:gap-4 truncate min-w-0">
          <button
            onClick={handleFinish}
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-brown/5 text-brown transition-colors shrink-0"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="h-4 w-px bg-warm-border shrink-0 hidden sm:block" />
          <span className="font-display font-bold text-brown truncate text-xs sm:text-base">
            {fileName || "Presentation"}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <div
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-brown-muted"}`}
          >
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="w-10 sm:w-12">{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={handleFinish}
            className="rounded-full bg-brown px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-md hover:bg-brown-light hover:shadow-lg transition-all active:scale-95"
          >
            {t('practice.solo.session.finish')}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* PDF Slide Area */}
        <div className="flex-1 flex flex-col bg-cream relative overflow-hidden">
          {/* PDF Viewer */}
          <div
            ref={containerRef}
            className="flex-1 bg-white flex items-center justify-center relative overflow-hidden p-2 sm:p-4"
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                  <p className="text-brown-muted text-center mb-2">Failed to load PDF file</p>
                  <p className="text-xs text-brown-muted text-center mb-4">
                    File mungkin corrupt atau format tidak didukung
                  </p>
                  <Link
                    to="/practice/solo"
                    className="text-teal font-bold hover:underline text-sm"
                  >
                    ← Kembali ke Setup
                  </Link>
                </div>
              }
            >
              <Page
                pageNumber={currentSlide}
                width={containerWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>

            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/90 backdrop-blur-sm border border-warm-border px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold text-brown-muted shadow-sm">
              {currentSlide}/{totalSlides}
            </div>
          </div>

          {/* Controls & Mic — responsive centered layout */}
          <div className="h-14 sm:h-16 bg-white border-t border-warm-border flex items-center justify-center px-2 sm:px-4 shrink-0 relative">
            {/* Left: Slide Navigation */}
            <div className="absolute left-2 sm:left-4 flex items-center gap-1">
              <button
                onClick={() =>
                  setCurrentSlide(Math.max(1, currentSlide - 1))
                }
                className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-warm-border text-brown hover:bg-cream-warm transition-colors disabled:opacity-50"
                disabled={currentSlide === 1}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentSlide(Math.min(totalSlides, currentSlide + 1))
                }
                className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-warm-border text-brown hover:bg-cream-warm transition-colors disabled:opacity-50"
                disabled={currentSlide === totalSlides}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Center: Mic Toggle */}
            <div className="flex items-center justify-center relative">
              {isRecording && (
                <div className="absolute inset-0 m-auto h-12 w-12 sm:h-14 sm:w-14 animate-ping rounded-full bg-teal/40" />
              )}
              <button
                onClick={toggleRecording}
                className={`relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isRecording
                    ? "bg-teal text-white shadow-teal/30"
                    : "bg-cream-deep text-brown shadow-brown/10 hover:bg-warm-border"
                }`}
              >
                {isRecording ? (
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <MicOff className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>

            {/* Right: Recording Indicator */}
            <div className="absolute right-2 sm:right-4 flex items-center">
              {isRecording && (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-full w-full rounded-full bg-red-500"></span>
                  </span>
                  <span className="hidden sm:inline text-xs font-bold text-brown animate-pulse">
                    {t('practice.solo.session.recording')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Transcript Panel */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-warm-border flex flex-col shrink-0 h-48 sm:h-64 lg:h-full">
          
          {/* Live Transcript */}
          <div className="h-full flex flex-col">
            <div className="p-2 sm:p-3 bg-cream-warm/30 shrink-0 border-b border-warm-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brown" />
                <h3 className="font-display font-bold text-brown text-xs sm:text-sm">
                  {t('practice.solo.session.liveTranscript')}
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <div className="rounded-lg bg-cream p-2 sm:p-3 border border-warm-border text-xs sm:text-sm leading-relaxed text-brown shadow-inner min-h-full">
                <div className="break-words overflow-wrap-anywhere whitespace-pre-wrap hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {fullTranscript.trim() ? (
                    <>
                      <span>{fullTranscript.trim()}</span>
                      {isRecording && (
                        <span className="inline-block w-1.5 h-3 sm:h-4 ml-1 bg-teal animate-pulse align-middle" />
                      )}
                    </>
                  ) : (
                    <span className="text-brown-muted italic">
                      {isRecording
                        ? t('practice.solo.session.listening')
                        : t('practice.solo.session.turnOn')}
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
