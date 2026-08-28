import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Trophy,
  Medal,
  Award,
  Clock,
  MessageSquare,
  Users,
  Home,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Download,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { exportEvaluationToPDF } from "../../../lib/pdfExport";
import logoUntion from "../../../assets/icon-untion.png";

interface Aspect {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

interface SessionResult {
  userId: string;
  username: string;
  transcript: string;
  fillerWordCount: number;
  longPauses: number;
  actualDurationSeconds: number;
  overallScore: number;
  wordCount: number;
  wpm: number;
  aspects: Aspect[];
  summary: string;
  strengths: string[];
  improvements: string[];
}

export default function GroupResultPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch all session results
        const { data: sessionData, error: sessionError } = await supabase
          .from("room_sessions")
          .select("*")
          .eq("room_id", roomId);

        if (sessionError) throw sessionError;

        // Fetch room members WITH usernames
        const { data: members, error: membersError } = await supabase
          .from("room_members")
          .select("user_id, id, username")
          .eq("room_id", roomId);

        if (membersError) throw membersError;

        // Get current user to check if any session is theirs
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        // Map sessions with usernames from room_members table
        const sessionsWithUsernames: SessionResult[] = sessionData.map((session: any) => {
          const isCurrentUser = session.user_id === currentUser?.id;
          
          // Find member in room_members to get username
          const member = members?.find((m: any) => m.user_id === session.user_id);
          
          let username = "Unknown User";
          if (isCurrentUser && currentUser) {
            // Current user - use their username without (You) suffix
            username = member?.username || currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || "You";
          } else {
            // Other users - use username from room_members
            username = member?.username || "User";
          }
          
          return {
            userId: session.user_id,
            username,
            transcript: session.transcript || "",
            fillerWordCount: session.filler_word_count || 0,
            longPauses: session.long_pauses || 0,
            actualDurationSeconds: session.actual_duration_seconds || 0,
            overallScore: session.overall_score || 0,
            wordCount: session.word_count || 0,
            wpm: session.wpm || 0,
            aspects: session.aspects || [],
            summary: session.summary || "No summary available",
            strengths: session.strengths || [],
            improvements: session.improvements || [],
          };
        });

        setSessions(sessionsWithUsernames);
      } catch (err: any) {
        toast.error("Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchResults();
    }
  }, [roomId]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const loadingToast = toast.loading("Generating PDF...");
    
    try {
      // Verify element exists
      const element = document.getElementById('evaluation-result');
      if (!element) {
        throw new Error("Evaluation content not found. Please refresh the page.");
      }

      await exportEvaluationToPDF(
        currentSession.username,
        'group',
        new Date().toISOString().slice(0, 10),
        (progress) => {
          if (progress === 100) {
            toast.success("PDF downloaded successfully!", { id: loadingToast });
          }
        }
      );
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to export PDF. Please try again.";
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center font-body">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-teal animate-spin mx-auto mb-4" />
          <p className="text-brown-muted">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center font-body">
        <div className="text-center">
          <p className="text-brown-muted mb-4">No session data available.</p>
          <button
            onClick={() => navigate("/practice/group")}
            className="text-teal font-bold hover:underline"
          >
            Back to Group Practice
          </button>
        </div>
      </div>
    );
  }

  // Sort by score (highest first) for ranking
  const rankedSessions = [...sessions].sort((a, b) => b.overallScore - a.overallScore);
  const currentSession = rankedSessions[selectedMemberIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream to-cream-warm font-body flex flex-col">
      {/* Header */}
      <nav className="h-20 border-b border-warm-border/50 bg-white/80 backdrop-blur-xl px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-1.5 group">
          <img 
            src={logoUntion} 
            alt="Untion Logo" 
            className="h-12 w-12 object-contain transition-all duration-200 group-hover:scale-105"
          />
          <span className="font-display text-xl font-bold text-brown">
            Untion
          </span>
        </Link>
        <Link
          to="/dashboard"
          className="text-sm font-semibold text-brown-muted hover:text-brown transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Container for PDF Export */}
        <div id="evaluation-result">
        {/* Member Selector Pills */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-brown-muted uppercase tracking-wide mb-3">
            Select Member to View Results
          </p>
          <div className="flex flex-wrap gap-2">
            {rankedSessions.map((session, index) => (
              <button
                key={session.userId}
                onClick={() => setSelectedMemberIndex(index)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  selectedMemberIndex === index
                    ? 'bg-teal text-white shadow-lg shadow-teal/20'
                    : 'bg-white border border-warm-border text-brown hover:bg-cream-warm'
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Trophy className="h-4 w-4 text-yellow-400" />}
                  {index === 1 && <Medal className="h-4 w-4 text-gray-300" />}
                  {index === 2 && <Award className="h-4 w-4 text-orange-400" />}
                  <span>{session.username}</span>
                  <span className="opacity-70">({session.overallScore})</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section - Clean & Professional */}
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-brown">
              {currentSession.username}
            </h1>
            <span className="text-brown-muted text-lg">— Practice Complete</span>
          </div>
          <p className="text-brown-muted text-base sm:text-lg max-w-2xl leading-relaxed">
            {currentSession.summary}
          </p>
        </div>

        {/* Score Display - Minimalist */}
        <div className="bg-white rounded-2xl border border-warm-border shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brown-muted uppercase tracking-wide mb-2">
                Overall Score
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-6xl sm:text-7xl font-bold text-brown">
                  {currentSession.overallScore}
                </span>
                <span className="text-3xl font-bold text-brown-muted">/100</span>
              </div>
            </div>
            {/* Score Badge */}
            <div className="hidden sm:block">
              <div className={`px-6 py-3 rounded-full font-bold text-sm ${
                currentSession.overallScore >= 85 ? 'bg-teal/10 text-teal' :
                currentSession.overallScore >= 70 ? 'bg-blue-50 text-blue-600' :
                currentSession.overallScore >= 60 ? 'bg-yellow-50 text-yellow-600' :
                'bg-red-50 text-red-600'
              }`}>
                {currentSession.overallScore >= 85 ? 'Excellent' :
                 currentSession.overallScore >= 70 ? 'Good' :
                 currentSession.overallScore >= 60 ? 'Fair' : 'Needs Improvement'}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics - Clean Grid */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="bg-white rounded-xl border border-warm-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-brown-muted" />
              <p className="text-xs font-semibold text-brown-muted uppercase tracking-wide">
                Duration
              </p>
            </div>
            <p className="text-2xl font-bold text-brown">
              {Math.floor(currentSession.actualDurationSeconds / 60)}:
              {(currentSession.actualDurationSeconds % 60).toString().padStart(2, "0")}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-warm-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-brown-muted" />
              <p className="text-xs font-semibold text-brown-muted uppercase tracking-wide">
                Pacing
              </p>
            </div>
            <p className="text-2xl font-bold text-brown">
              {currentSession.wpm}
            </p>
            <p className="text-sm text-brown-muted mt-1">
              words/min
            </p>
          </div>

          <div className="bg-white rounded-xl border border-warm-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="h-5 w-5 text-brown-muted" />
              <p className="text-xs font-semibold text-brown-muted uppercase tracking-wide">
                Filler Words
              </p>
            </div>
            <p className="text-2xl font-bold text-brown">
              {currentSession.fillerWordCount}
            </p>
            <p className="text-sm text-brown-muted mt-1">
              times
            </p>
          </div>
        </div>

        {/* Detailed Feedback - Modern Layout */}
        <div className="space-y-6">
          {/* Rubric Breakdown */}
          {currentSession.aspects && currentSession.aspects.length > 0 && (
            <div className="bg-white rounded-2xl border border-warm-border p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-brown mb-1">
                  Performance Breakdown
                </h2>
                <p className="text-brown-muted text-sm">
                  Detailed scoring across evaluation criteria
                </p>
              </div>

              <div className="space-y-3">
                {currentSession.aspects.map((aspect, i) => {
                  const percentage = (aspect.score / aspect.maxScore) * 100;
                  const isGood = percentage >= 70;
                  
                  return (
                    <div key={i} className="group">
                      {/* Aspect Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${isGood ? 'bg-teal' : 'bg-orange-500'}`} />
                          <p className="font-semibold text-brown">
                            {aspect.name}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-brown">
                          {aspect.score}/{aspect.maxScore}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-cream-warm rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full transition-all duration-500 ${isGood ? 'bg-teal' : 'bg-orange-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      {/* Feedback */}
                      <p className="text-sm text-brown-muted leading-relaxed pl-3.5">
                        {aspect.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Insights - Two Column */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Strengths */}
            {currentSession.strengths && currentSession.strengths.length > 0 && (
              <div className="bg-gradient-to-br from-teal/5 to-teal/10 rounded-2xl border border-teal/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-teal/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-teal" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-brown">
                    What Went Well
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {currentSession.strengths.map((str, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="text-teal font-bold shrink-0 mt-0.5">✓</span>
                      <span className="text-sm text-brown leading-relaxed">{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {currentSession.improvements && currentSession.improvements.length > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-200/50 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-brown">
                    Areas to Improve
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {currentSession.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="text-orange-600 font-bold shrink-0 mt-0.5">→</span>
                      <span className="text-sm text-brown leading-relaxed">{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        </div>
        {/* End PDF Export Container */}

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 pb-8">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-brown rounded-xl font-semibold hover:bg-cream-warm transition-colors shadow-md border-2 border-warm-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Save as PDF
              </>
            )}
          </button>
          
          <Link
            to="/practice/group"
            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-brown text-cream rounded-xl font-semibold hover:bg-brown/90 transition-colors shadow-lg shadow-brown/10"
          >
            <Users className="h-5 w-5" />
            New Group Session
          </Link>
          <Link
            to="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-warm-border text-brown rounded-xl font-semibold hover:bg-cream transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
