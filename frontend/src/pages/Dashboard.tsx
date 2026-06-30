import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Target,
  TrendingUp,
  ChevronRight,
  Award,
  BarChart3,
} from 'lucide-react';
import { fetchExams } from '../api';
import {
  getCompletionInsight,
  getAccuracyInsight,
  getRecentCompletions,
  getBestExamScore,
} from '../completion';
import { getCurrentUser, getUserInitials } from '../user';
import type { ExamSummary } from '../types';

const FONT = "'Plus Jakarta Sans', sans-serif";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser() ?? 'Learner';
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams()
      .then(setExams)
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, []);

  const completion = getCompletionInsight(exams.length);
  const accuracy = getAccuracyInsight();
  const recent = getRecentCompletions(5);

  function examTitle(examId: number): string {
    return exams.find((e) => e.id === examId)?.title ?? `Exam ${examId}`;
  }

  return (
    <div style={{ fontFamily: FONT }}>
      <header className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-foreground">AWS Quiz App</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {getUserInitials(user)}
          </div>
        </div>
      </header>

      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0056D2 0%, #001A5E 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
          <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-2">Your dashboard</p>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user}</h1>
          <p className="text-blue-200/80 text-sm">Track your progress and keep improving.</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Completion
              </span>
            </div>
            <p className="text-3xl font-extrabold text-foreground mb-1">
              {completion.completed}
              <span className="text-lg font-semibold text-muted-foreground"> / {completion.total || '—'}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">Exams completed</p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${completion.pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">{completion.pct}% of all exams</p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary bg-blue-50 px-2.5 py-1 rounded-full">
                Accuracy
              </span>
            </div>
            <p className="text-3xl font-extrabold text-foreground mb-1">
              {accuracy.examsAttempted > 0 ? `${accuracy.accuracy}%` : '—'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Average best score per exam
            </p>
            {accuracy.latestImprovement !== null && accuracy.latestImprovement > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                <TrendingUp className="w-3.5 h-3.5" />
                +{accuracy.latestImprovement}% on your last retake
              </div>
            )}
            {accuracy.examsAttempted === 0 && (
              <p className="text-xs text-muted-foreground">Complete an exam to see your accuracy.</p>
            )}
            {accuracy.examsAttempted > 0 && accuracy.latestImprovement !== null && accuracy.latestImprovement <= 0 && (
              <p className="text-xs text-muted-foreground">
                {accuracy.totalAttempts} attempt{accuracy.totalAttempts !== 1 ? 's' : ''} across {accuracy.examsAttempted} exam{accuracy.examsAttempted !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-foreground text-sm">Recent activity</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/exams')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Browse exams
            </button>
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground text-center py-10">Loading…</p>
          )}

          {!loading && recent.length === 0 && (
            <div className="text-center py-10 px-6">
              <Award className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">No exams completed yet</p>
              <p className="text-xs text-muted-foreground mb-4">Start your first exam to track progress here.</p>
              <button
                type="button"
                onClick={() => navigate('/exams')}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold"
              >
                Start learning
              </button>
            </div>
          )}

          {!loading && recent.length > 0 && (
            <ul className="divide-y divide-border">
              {recent.map((attempt) => {
                const best = getBestExamScore(attempt.examId);
                return (
                  <li key={attempt.completedAt}>
                    <button
                      type="button"
                      onClick={() => navigate(`/quiz/${attempt.examId}`)}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[#F3F4F8]/80 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-extrabold text-primary">{attempt.pct}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {examTitle(attempt.examId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.score}/{attempt.total} correct
                          {best !== null && best > attempt.pct && (
                            <span className="text-emerald-600 font-medium"> · Best: {best}%</span>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
