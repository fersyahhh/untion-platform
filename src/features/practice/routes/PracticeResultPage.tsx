import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  MessageSquare,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  evaluatePresentation,
  type EvaluationResult,
  type EvaluationInput,
} from "../../../lib/groq";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../contexts/LanguageContext";
import logoUntion from "../../../assets/icon-untion.png";

export default function PracticeResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [username, setUsername] = useState("User");
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.username)
        setUsername(user.user_metadata.username);
    });
  }, []);

  useEffect(() => {
    const input = location.state as EvaluationInput;

    if (!input || !input.transcript) {
      // Missing data, user probably navigated directly to /practice/result
      navigate("/practice/solo");
      return;
    }

    // Check if transcript is the "no transcript" message
    const isEmptySession = input.transcript.startsWith(t('practice.solo.session.noRecording'));
    
    if (isEmptySession) {
      // Create a zero-score result for empty session
      const emptyResult: EvaluationResult = {
        overallScore: 0,
        aspects: [
          {
            name: t('practice.solo.result.contentAccuracy'),
            score: 0,
            maxScore: 25,
            feedback: t('practice.solo.result.noContent'),
          },
          {
            name: t('practice.solo.result.structureFlow'),
            score: 0,
            maxScore: 15,
            feedback: t('practice.solo.result.structureCannotEvaluate'),
          },
          {
            name: t('practice.solo.result.vocabulary'),
            score: 0,
            maxScore: 15,
            feedback: t('practice.solo.result.vocabularyCannotEvaluate'),
          },
          {
            name: t('practice.solo.result.fillerWordsAspect'),
            score: 0,
            maxScore: 15,
            feedback: t('practice.solo.result.fillerWordsNotDetected'),
          },
          {
            name: t('practice.solo.result.pacingTime'),
            score: 0,
            maxScore: 15,
            feedback: t('practice.solo.result.pacingCannotEvaluate'),
          },
          {
            name: t('practice.solo.result.clarity'),
            score: 0,
            maxScore: 15,
            feedback: t('practice.solo.result.clarityCannotEvaluate'),
          },
        ],
        summary: t('practice.solo.result.emptySession'),
        strengths: [t('practice.solo.result.tried')],
        improvements: [
          t('practice.solo.result.improvementMic1'),
          t('practice.solo.result.improvementMic2'),
          t('practice.solo.result.improvementMic3'),
        ],
        wordCount: 0,
        wpm: 0,
      };
      setResult(emptyResult);
      return;
    }

    evaluatePresentation(input)
      .then((data) => setResult(data))
      .catch((err: any) => {
        toast.error(err.message || t('practice.solo.result.failedMsg'));
        // Redirect back to setup after error
        setTimeout(() => navigate("/practice/solo"), 2000);
      });
  }, [location.state, navigate, t]);

  if (!result) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center font-body p-6">
        <Loader2 className="h-16 w-16 text-teal animate-spin mb-6" />
        <h2 className="font-display text-3xl font-bold text-brown mb-2">
          {t('practice.solo.result.analyzing')}
        </h2>
        <p className="text-brown-muted">
          {t('practice.solo.result.scoring')}
        </p>
      </div>
    );
  }

  const { targetDurationMinutes, actualDurationSeconds } =
    location.state as EvaluationInput;
  const durationFormatted = `${Math.floor(actualDurationSeconds / 60)
    .toString()
    .padStart(
      2,
      "0",
    )}:${(actualDurationSeconds % 60).toString().padStart(2, "0")}`;
  const targetFormatted = `${targetDurationMinutes.toString().padStart(2, "0")}:00`;

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
          ← {t('practice.solo.result.backToDashboard')}
        </Link>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section - Clean & Professional */}
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-brown">
              {username}
            </h1>
            <span className="text-brown-muted text-lg">— Practice Complete</span>
          </div>
          <p className="text-brown-muted text-base sm:text-lg max-w-2xl leading-relaxed">
            {result.summary}
          </p>
        </div>

        {/* Score Display - Minimalist */}
        <div className="bg-white rounded-2xl border border-warm-border shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brown-muted uppercase tracking-wide mb-2">
                {t('practice.solo.result.overallScore')}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-6xl sm:text-7xl font-bold text-brown">
                  {result.overallScore}
                </span>
                <span className="text-3xl font-bold text-brown-muted">/100</span>
              </div>
            </div>
            {/* Score Badge */}
            <div className="hidden sm:block">
              <div className={`px-6 py-3 rounded-full font-bold text-sm ${
                result.overallScore >= 85 ? 'bg-teal/10 text-teal' :
                result.overallScore >= 70 ? 'bg-blue-50 text-blue-600' :
                result.overallScore >= 60 ? 'bg-yellow-50 text-yellow-600' :
                'bg-red-50 text-red-600'
              }`}>
                {result.overallScore >= 85 ? 'Excellent' :
                 result.overallScore >= 70 ? 'Good' :
                 result.overallScore >= 60 ? 'Fair' : 'Needs Improvement'}
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
                {t('practice.solo.result.duration')}
              </p>
            </div>
            <p className="text-2xl font-bold text-brown">
              {durationFormatted}
            </p>
            <p className="text-sm text-brown-muted mt-1">
              Target: {targetFormatted}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-warm-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-brown-muted" />
              <p className="text-xs font-semibold text-brown-muted uppercase tracking-wide">
                {t('practice.solo.result.pacing')}
              </p>
            </div>
            <p className="text-2xl font-bold text-brown">
              {result.wpm}
            </p>
            <p className="text-sm text-brown-muted mt-1">
              {t('practice.solo.result.wpm')}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-warm-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="h-5 w-5 text-brown-muted" />
              <p className="text-xs font-semibold text-brown-muted uppercase tracking-wide">
                {t('practice.solo.result.fillerWords')}
              </p>
            </div>
            <p className="text-2xl font-bold text-brown">
              {(location.state as EvaluationInput).fillerWordCount}
            </p>
            <p className="text-sm text-brown-muted mt-1">
              {t('practice.solo.result.times')}
            </p>
          </div>
        </div>

        {/* Detailed Feedback - Modern Layout */}
        <div className="space-y-6">
          {/* Rubric Breakdown */}
          <div className="bg-white rounded-2xl border border-warm-border p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-brown mb-1">
                Performance Breakdown
              </h2>
              <p className="text-brown-muted text-sm">
                {t('practice.solo.result.rubricDesc')}
              </p>
            </div>

            <div className="space-y-3">
              {result.aspects.map((aspect, i) => {
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

          {/* Key Insights - Two Column */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Strengths */}
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
                {result.strengths.map((str, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="text-teal font-bold shrink-0 mt-0.5">✓</span>
                    <span className="text-sm text-brown leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
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
                {result.improvements.map((imp, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="text-orange-600 font-bold shrink-0 mt-0.5">→</span>
                    <span className="text-sm text-brown leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-10 flex justify-center pb-8">
          <Link
            to="/practice/solo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brown text-cream rounded-xl font-semibold hover:bg-brown/90 transition-colors shadow-lg shadow-brown/10"
          >
            <RefreshCw className="h-5 w-5" />
            Practice Again
          </Link>
        </div>
      </main>
    </div>
  );
}
