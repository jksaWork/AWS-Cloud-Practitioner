import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, BookOpen, RotateCcw, LayoutGrid, Trophy, Star, TrendingUp, Copy, Check } from 'lucide-react';
import { fetchExam } from '../api';
import { copyQuestionsToClipboard } from '../copyQuestions';

const FONT = "'Plus Jakarta Sans', sans-serif";

interface ScoreState {
  score: number;
  total: number;
  examId: number;
  examTitle: string;
  isReview?: boolean;
}

function getGrade(pct: number) {
  if (pct >= 90) return { label: 'A+', message: 'Outstanding!', sub: "You've mastered this topic.", color: 'text-emerald-600', ring: 'ring-emerald-200', stars: 3 };
  if (pct >= 75) return { label: 'B+', message: 'Well done!', sub: 'Solid understanding overall.', color: 'text-blue-600', ring: 'ring-blue-200', stars: 2 };
  if (pct >= 60) return { label: 'C', message: 'Good effort.', sub: 'A few areas to review.', color: 'text-amber-600', ring: 'ring-amber-200', stars: 2 };
  if (pct >= 40) return { label: 'D', message: 'Keep going.', sub: 'More practice will help.', color: 'text-orange-600', ring: 'ring-orange-200', stars: 1 };
  return { label: 'F', message: "Don't give up!", sub: 'Review the material and retry.', color: 'text-red-600', ring: 'ring-red-200', stars: 1 };
}

export default function Score() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ScoreState | null;
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    if (!state) {
      navigate('/dashboard', { replace: true });
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const { score, total, examId, examTitle, isReview } = state;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const grade = getGrade(pct);
  const circumference = 2 * Math.PI * 52;

  async function handleCopyQuestions() {
    if (!state) return;
    setCopyError(null);
    try {
      const exam = await fetchExam(state.examId);
      await copyQuestionsToClipboard(exam.title, exam.questions);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Could not copy questions. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F4F8]" style={{ fontFamily: FONT }}>
      <header className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">AWS Quiz App</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{examTitle}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-5">
          <div
            className="h-2"
            style={{ background: 'linear-gradient(90deg, #0056D2, #00A0DC)' }}
          />

          <div className="p-8 flex flex-col items-center text-center">
            <div className="flex gap-1 mb-5">
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  className={`w-7 h-7 transition-all ${i <= grade.stars ? 'text-amber-400 fill-amber-400' : 'text-muted fill-muted'}`}
                />
              ))}
            </div>

            <div className={`relative mb-6 p-1.5 rounded-full ring-8 ${grade.ring}`}>
              <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
                <circle cx="64" cy="64" r="52" fill="none" stroke="#EEF0F4" strokeWidth="10" />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  fill="none"
                  stroke="#0056D2"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct / 100)}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold ${grade.color}`}>{pct}%</span>
                <span className={`text-xs font-bold ${grade.color}`}>{grade.label}</span>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-foreground mb-1">
              {isReview ? 'Review complete' : grade.message}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {isReview ? 'You finished reviewing this exam.' : grade.sub}
            </p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
              {[
                { icon: CheckCircle2, value: score, label: 'Correct', color: 'text-green-600', bg: 'bg-green-50' },
                { icon: XCircle, value: total - score, label: 'Incorrect', color: 'text-red-500', bg: 'bg-red-50' },
                { icon: TrendingUp, value: `${pct}%`, label: 'Score', color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map(({ icon: Icon, value, label, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-3 flex flex-col items-center gap-1`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className={`text-xl font-extrabold ${color}`}>{value}</span>
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {pct >= 75 && !isReview && (
          <div
            className="rounded-2xl p-5 flex items-center gap-4 mb-5 border border-amber-200"
            style={{ background: 'linear-gradient(135deg, #FFF8E1, #FFF3CD)' }}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">Certificate Earned!</p>
              <p className="text-amber-700 text-xs mt-0.5">
                You&apos;ve scored above 75% on {examTitle}. Download your certificate.
              </p>
            </div>
            <button
              type="button"
              className="ml-auto flex-shrink-0 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors"
            >
              Download
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={handleCopyQuestions}
            className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-border text-foreground rounded-xl font-bold text-sm hover:bg-[#F3F4F8] active:scale-[0.97] transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Q&A'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/quiz/${examId}?retry=1`)}
            className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-primary text-primary rounded-xl font-bold text-sm hover:bg-blue-50 active:scale-[0.97] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Retry exam
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(135deg, #0056D2, #0041A8)' }}
          >
            <LayoutGrid className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        {copyError && (
          <p className="mt-4 text-sm text-red-600 text-center">{copyError}</p>
        )}
      </main>
    </div>
  );
}
