import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  Search,
  Award,
  Beaker,
  Globe,
  Calculator,
  Layers,
  BookMarked,
  Cloud,
  WifiOff,
  Download,
  CheckCircle2,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';
import { fetchExams, syncExamCache, API_BASE } from '../api';
import { getCachedExamIds, getCacheSize } from '../examCache';
import { isExamCompleted } from '../completion';
import {
  getMostRecentInProgress,
  getExamProgress,
} from '../examProgress';
import type { ExamSummary } from '../types';

const FONT = "'Plus Jakarta Sans', sans-serif";

const EXAM_VISUALS: { icon: LucideIcon; color: string }[] = [
  { icon: Globe, color: 'from-violet-500 to-purple-700' },
  { icon: Beaker, color: 'from-emerald-400 to-teal-600' },
  { icon: BookMarked, color: 'from-amber-400 to-orange-500' },
  { icon: Cloud, color: 'from-sky-400 to-blue-600' },
  { icon: Calculator, color: 'from-rose-400 to-red-600' },
  { icon: Layers, color: 'from-fuchsia-400 to-pink-600' },
];

function getExamVisual(index: number) {
  return EXAM_VISUALS[index % EXAM_VISUALS.length];
}

export default function Exams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cachedIds, setCachedIds] = useState<number[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  async function refreshCachedIds() {
    const ids = await getCachedExamIds();
    setCachedIds(ids);
  }

  useEffect(() => {
    fetchExams()
      .then(setExams)
      .catch((err: Error) => setError(err.message))
      .finally(() => {
        setLoading(false);
        refreshCachedIds();
      });
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncExamCache(API_BASE).then(refreshCachedIds).catch(() => {});
      fetchExams().then(setExams).catch(() => {});
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const filtered = exams.filter((exam) =>
    exam.title.toLowerCase().includes(search.toLowerCase()),
  );

  const continueExam = getMostRecentInProgress();
  const continueExamMeta = continueExam
    ? exams.find((e) => e.id === continueExam.examId)
    : null;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: FONT }}>
      <header className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-foreground">AWS Quiz App</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              AWS
            </div>
          </div>
        </div>
      </header>

      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0056D2 0%, #001A5E 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
          <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-3">Explore Exams</p>
          <h1 className="text-4xl font-bold text-white mb-2">What do you want to learn?</h1>
          <p className="text-blue-200/80 text-sm mb-7 max-w-md">
            Choose an AWS certification exam to test your knowledge. Each exam is auto-graded with instant feedback.
          </p>

          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams…"
              className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-lg"
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> exams
          </p>
          <div className="flex items-center gap-2">
            {cachedIds.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                <Download className="w-3.5 h-3.5" />
                {cachedIds.length}/{getCacheSize()} ready offline
              </div>
            )}
            {isOffline && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <WifiOff className="w-3.5 h-3.5" />
                Offline mode
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white border border-border rounded-lg px-3 py-1.5">
              <Award className="w-3.5 h-3.5" />
              Certificate on completion
            </div>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground text-center py-12">Loading exams…</p>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && continueExam && continueExamMeta && (
          <button
            type="button"
            onClick={() => navigate(`/quiz/${continueExam.examId}`)}
            className="w-full mb-6 rounded-2xl border-2 border-primary bg-blue-50/80 hover:bg-blue-50 p-5 flex items-center gap-4 text-left transition-all hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-0.5">Continue exam</p>
              <p className="font-bold text-foreground truncate">{continueExamMeta.title}</p>
              <p className="text-sm text-muted-foreground">
                Question {continueExam.current + 1} of {continueExamMeta.questionCount}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
          </button>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">No exams found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((exam, index) => {
            const { icon: Icon, color } = getExamVisual(index);
            const completed = isExamCompleted(exam.id);
            const progress = getExamProgress(exam.id);
            const inProgress = !completed && progress !== null;
            const isCachedOffline = cachedIds.includes(exam.id);
            const isContinueTarget = continueExam?.examId === exam.id;

            return (
              <div
                key={exam.id}
                className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-250 cursor-pointer flex flex-col border-2 ${
                  completed
                    ? 'border-green-200'
                    : isContinueTarget
                      ? 'border-primary ring-2 ring-primary/20'
                      : inProgress
                        ? 'border-blue-200'
                        : 'border-border'
                }`}
                onClick={() => navigate(`/quiz/${exam.id}`)}
              >
                <div className={`h-28 bg-gradient-to-br ${color} relative flex items-end p-4`}>
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {completed && (
                    <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {completed && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-green-100 text-green-700 border-green-200">
                        Completed
                      </span>
                    )}
                    {inProgress && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-blue-100 text-blue-700 border-blue-200">
                        In progress · Q{progress.current + 1}
                      </span>
                    )}
                    {!completed && !inProgress && isCachedOffline && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-white/90 text-emerald-700 border-emerald-200">
                        Offline ready
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Exam {exam.id}
                  </p>
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                    {exam.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {exam.questionCount} Qs
                      </span>
                      {completed && (
                        <span className="text-green-600 font-semibold">Review anytime</span>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <ChevronRight className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
