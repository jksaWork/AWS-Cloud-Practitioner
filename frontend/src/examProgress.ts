import { isExamCompleted } from './completion';

const STORAGE_KEY = 'aws-quiz-exam-progress';

export interface ExamProgress {
  examId: number;
  current: number;
  answers: number[][];
  revealed: boolean;
  selected: number[];
  updatedAt: number;
}

function readAll(): Record<string, ExamProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ExamProgress>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, ExamProgress>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getExamProgress(examId: number): ExamProgress | null {
  const all = readAll();
  return all[String(examId)] ?? null;
}

export function saveExamProgress(progress: ExamProgress): void {
  if (isExamCompleted(progress.examId)) return;

  const all = readAll();
  all[String(progress.examId)] = { ...progress, updatedAt: Date.now() };
  writeAll(all);
}

export function clearExamProgress(examId: number): void {
  const all = readAll();
  delete all[String(examId)];
  writeAll(all);
}

export function getInProgressExams(): ExamProgress[] {
  return Object.values(readAll())
    .filter((p) => !isExamCompleted(p.examId))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getMostRecentInProgress(): ExamProgress | null {
  const list = getInProgressExams();
  return list[0] ?? null;
}

export function isExamInProgress(examId: number): boolean {
  if (isExamCompleted(examId)) return false;
  return getExamProgress(examId) !== null;
}
