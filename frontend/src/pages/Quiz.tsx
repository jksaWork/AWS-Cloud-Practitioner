import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle2, XCircle, ChevronRight, Flag, Copy, Check } from 'lucide-react';
import { fetchExam, API_BASE } from '../api';
import { markExamCompleted, isExamCompleted } from '../completion';
import { rotateCacheAfterCompletion } from '../examCache';
import { getExamProgress, saveExamProgress } from '../examProgress';
import { copyQuestionsToClipboard, arraysEqual } from '../copyQuestions';
import type { Question } from '../types';

const FONT = "'Plus Jakarta Sans', sans-serif";
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

function isMultiSelect(question: Question): boolean {
  return question.correctIndexes.length > 1;
}

function formatCorrectAnswerText(question: Question): string {
  const labels = question.correctIndexes.map((idx) => OPTION_LABELS[idx] ?? String(idx + 1));
  const texts = question.correctIndexes.map((idx) => question.options[idx]);
  if (labels.length === 1) return `"${texts[0]}"`;
  return labels.map((label, i) => `${label}) ${texts[i]}`).join(', ');
}

function emptyAnswers(count: number): number[][] {
  return Array(count).fill(null).map(() => []);
}

export default function Quiz() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const numericExamId = Number(examId);

  const [examTitle, setExamTitle] = useState('Quiz');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!examId || Number.isNaN(numericExamId)) {
      setError('Invalid exam id');
      setLoading(false);
      return;
    }

    fetchExam(numericExamId)
      .then((data) => {
        setExamTitle(data.title);
        setQuestions(data.questions);

        const completed = isExamCompleted(numericExamId);
        setIsReviewMode(completed);

        if (completed) {
          setAnswers(emptyAnswers(data.questions.length));
          setCurrent(0);
          setSelected([]);
          setRevealed(false);
          return;
        }

        const saved = getExamProgress(numericExamId);
        if (saved && saved.answers.length === data.questions.length) {
          const idx = Math.min(saved.current, data.questions.length - 1);
          setAnswers(saved.answers);
          setCurrent(idx);
          setRevealed(saved.revealed);
          setSelected(
            saved.revealed
              ? (saved.answers[idx]?.length ? saved.answers[idx] : saved.selected)
              : saved.selected,
          );
        } else {
          setAnswers(emptyAnswers(data.questions.length));
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [examId, numericExamId]);

  const persistProgress = useCallback(() => {
    if (loading || questions.length === 0 || isReviewMode) return;
    saveExamProgress({
      examId: numericExamId,
      current,
      answers,
      revealed,
      selected,
      updatedAt: Date.now(),
    });
  }, [loading, questions.length, isReviewMode, numericExamId, current, answers, revealed, selected]);

  useEffect(() => {
    persistProgress();
  }, [persistProgress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F8] flex items-center justify-center" style={{ fontFamily: FONT }}>
        <p className="text-sm text-muted-foreground">Loading exam…</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F4F8] flex flex-col items-center justify-center gap-4 px-6" style={{ fontFamily: FONT }}>
        <p className="text-sm text-red-600">{error ?? 'This exam has no questions.'}</p>
        <button
          type="button"
          onClick={() => navigate('/exams')}
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold"
        >
          Back to exams
        </button>
      </div>
    );
  }

  const question = questions[current];
  const multi = isMultiSelect(question);
  const requiredCount = question.correctIndexes.length;
  const progressPct = ((current + (revealed ? 1 : 0)) / questions.length) * 100;
  const isLast = current + 1 === questions.length;
  const isCorrect = revealed && arraysEqual(selected, question.correctIndexes);

  function handleOptionClick(idx: number) {
    if (revealed) return;
    if (multi) {
      setSelected((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
      );
    } else {
      setSelected([idx]);
    }
  }

  function canConfirm(): boolean {
    if (multi) return selected.length === requiredCount;
    return selected.length === 1;
  }

  function handleConfirm() {
    if (!canConfirm()) return;
    const next = [...answers];
    next[current] = [...selected];
    setAnswers(next);
    setRevealed(true);
  }

  async function handleCopyQuestions() {
    try {
      await copyQuestionsToClipboard(examTitle, questions);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to clipboard.');
    }
  }

  function handleNext() {
    if (isLast) {
      const finalAnswers = [...answers.slice(0, current), selected];
      const score = finalAnswers.filter((a, i) =>
        arraysEqual(a, questions[i].correctIndexes),
      ).length;

      if (!isReviewMode) {
        markExamCompleted(numericExamId);
        rotateCacheAfterCompletion(numericExamId, API_BASE).catch(() => {});
      }

      navigate('/score', {
        state: {
          score,
          total: questions.length,
          examId: numericExamId,
          examTitle,
          isReview: isReviewMode,
        },
      });
    } else {
      setCurrent(current + 1);
      const nextIdx = current + 1;
      const nextAnswers = answers;
      const alreadyAnswered = nextAnswers[nextIdx]?.length > 0;
      setSelected(alreadyAnswered ? [...nextAnswers[nextIdx]] : []);
      setRevealed(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F4F8] flex flex-col" style={{ fontFamily: FONT }}>
      <header className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">{examTitle}</span>
            {isReviewMode && (
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                Review
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{current + 1} / {questions.length}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyQuestions}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Q&A'}
            </button>
            <button
              type="button"
              onClick={() => {
                persistProgress();
                navigate('/exams');
              }}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              Exit
            </button>
          </div>
        </div>

        <div className="h-1.5 bg-muted relative">
          <div
            className="h-full bg-primary rounded-r-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-6 pb-2">
        <div className="flex gap-1.5 flex-wrap">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < current
                  ? arraysEqual(answers[i], q.correctIndexes)
                    ? 'bg-green-500 w-6'
                    : 'bg-red-400 w-6'
                  : i === current
                    ? 'bg-primary w-8'
                    : 'bg-muted w-4'
              }`}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 flex justify-center px-6 py-6">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-8 mb-4">
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-blue-50 px-3 py-1 rounded-full">
                Question {current + 1} of {questions.length}
              </span>
              {multi && (
                <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                  Select {requiredCount} answers
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-foreground leading-snug mb-8 whitespace-pre-line">
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                const isCorrectOption = question.correctIndexes.includes(idx);
                const isSelected = selected.includes(idx);
                const isWrongSelection = revealed && isSelected && !isCorrectOption;
                const isMissedCorrect = revealed && isCorrectOption && !isSelected;

                let base =
                  'w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-150 text-sm font-medium ';

                if (!revealed) {
                  base += isSelected
                    ? 'border-primary bg-blue-50 text-primary cursor-pointer'
                    : 'border-border bg-white hover:border-primary/50 hover:bg-blue-50/40 text-foreground cursor-pointer';
                } else if (isCorrectOption) {
                  base += 'border-green-400 bg-green-50 text-green-800';
                } else if (isWrongSelection) {
                  base += 'border-red-300 bg-red-50 text-red-700';
                } else {
                  base += 'border-border bg-[#FAFAFA] text-muted-foreground';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    className={base}
                    onClick={() => handleOptionClick(idx)}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                        !revealed
                          ? isSelected
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                          : isCorrectOption
                            ? 'bg-green-500 text-white'
                            : isWrongSelection
                              ? 'bg-red-400 text-white'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {OPTION_LABELS[idx]}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {revealed && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                    {revealed && isWrongSelection && (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    {revealed && isMissedCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 opacity-60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {revealed ? (
            <div className="space-y-4">
              <div
                className={`rounded-2xl px-6 py-4 flex items-center justify-between border-2 ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <p className={`text-sm font-semibold ${isCorrect ? 'text-green-800' : 'text-red-700'}`}>
                    {isCorrect
                      ? 'Correct! Well done.'
                      : `Incorrect. The answer is ${formatCorrectAnswerText(question)}.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.97] transition-all flex-shrink-0 ml-4"
                >
                  {isLast ? 'See results' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {question.explanation && (
                <div className="rounded-2xl px-6 py-4 border border-blue-200 bg-blue-50/60">
                  <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">Explanation</p>
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm()}
                className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.97] transition-all shadow-md shadow-blue-200"
              >
                Confirm answer
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
