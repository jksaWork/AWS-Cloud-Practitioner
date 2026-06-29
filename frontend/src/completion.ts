import { clearExamProgress } from './examProgress';

const STORAGE_KEY = 'aws-quiz-completed-exams';

function readCompleted(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isExamCompleted(examId: number): boolean {
  return readCompleted().includes(examId);
}

export function markExamCompleted(examId: number): void {
  const completed = readCompleted();
  if (!completed.includes(examId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed, examId]));
  }
  clearExamProgress(examId);
}

export function getCompletedExams(): number[] {
  return readCompleted();
}
