import { clearExamProgress } from './examProgress';
import { getCurrentUser } from './user';

const LEGACY_KEY = 'aws-quiz-completed-exams';

export interface ExamAttempt {
  examId: number;
  score: number;
  total: number;
  pct: number;
  completedAt: number;
}

interface UserQuizData {
  completedExamIds: number[];
  attempts: ExamAttempt[];
}

function userDataKey(username: string): string {
  return `aws-quiz-user-data:${username}`;
}

function readUserData(): UserQuizData {
  const user = getCurrentUser();
  if (!user) return { completedExamIds: [], attempts: [] };

  try {
    const raw = localStorage.getItem(userDataKey(user));
    if (!raw) return migrateLegacyData();
    const parsed = JSON.parse(raw) as UserQuizData;
    return {
      completedExamIds: Array.isArray(parsed.completedExamIds) ? parsed.completedExamIds : [],
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
    };
  } catch {
    return { completedExamIds: [], attempts: [] };
  }
}

function migrateLegacyData(): UserQuizData {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    const legacyIds = raw ? (JSON.parse(raw) as number[]) : [];
    const data: UserQuizData = {
      completedExamIds: Array.isArray(legacyIds) ? legacyIds : [],
      attempts: [],
    };
    if (data.completedExamIds.length > 0) {
      writeUserData(data);
    }
    return data;
  } catch {
    return { completedExamIds: [], attempts: [] };
  }
}

function writeUserData(data: UserQuizData): void {
  const user = getCurrentUser();
  if (!user) return;
  localStorage.setItem(userDataKey(user), JSON.stringify(data));
}

function getBestPctByExam(attempts: ExamAttempt[]): Map<number, number> {
  const best = new Map<number, number>();
  for (const attempt of attempts) {
    const current = best.get(attempt.examId) ?? 0;
    if (attempt.pct > current) {
      best.set(attempt.examId, attempt.pct);
    }
  }
  return best;
}

export function isExamCompleted(examId: number): boolean {
  return readUserData().completedExamIds.includes(examId);
}

export function markExamCompleted(examId: number, score: number, total: number): void {
  const user = getCurrentUser();
  if (!user) return;

  const data = readUserData();
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  if (!data.completedExamIds.includes(examId)) {
    data.completedExamIds.push(examId);
  }

  data.attempts.push({
    examId,
    score,
    total,
    pct,
    completedAt: Date.now(),
  });

  writeUserData(data);
  clearExamProgress(examId);
}

export function getCompletedExams(): number[] {
  return readUserData().completedExamIds;
}

export function getExamAttempts(examId: number): ExamAttempt[] {
  return readUserData().attempts.filter((a) => a.examId === examId);
}

export function getBestExamScore(examId: number): number | null {
  const attempts = getExamAttempts(examId);
  if (attempts.length === 0) return null;
  return Math.max(...attempts.map((a) => a.pct));
}

export function getCompletionInsight(totalExams: number) {
  const completed = readUserData().completedExamIds.length;
  const pct = totalExams > 0 ? Math.round((completed / totalExams) * 100) : 0;
  return { completed, total: totalExams, pct };
}

export function getAccuracyInsight() {
  const { attempts } = readUserData();
  const bestByExam = getBestPctByExam(attempts);

  if (bestByExam.size === 0) {
    return { accuracy: 0, examsAttempted: 0, totalAttempts: 0, latestImprovement: null as number | null };
  }

  const bestScores = [...bestByExam.values()];
  const accuracy = Math.round(bestScores.reduce((sum, pct) => sum + pct, 0) / bestScores.length);

  let latestImprovement: number | null = null;
  if (attempts.length >= 2) {
    const last = attempts[attempts.length - 1];
    const previousOnSameExam = attempts
      .slice(0, -1)
      .filter((a) => a.examId === last.examId)
      .pop();
    if (previousOnSameExam) {
      latestImprovement = last.pct - previousOnSameExam.pct;
    }
  }

  return {
    accuracy,
    examsAttempted: bestByExam.size,
    totalAttempts: attempts.length,
    latestImprovement,
  };
}

export function getRecentCompletions(limit = 5): ExamAttempt[] {
  return [...readUserData().attempts]
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, limit);
}
