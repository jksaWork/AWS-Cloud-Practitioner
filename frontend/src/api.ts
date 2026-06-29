import type { ExamDetail, ExamSummary } from './types';
import {
  getCachedExam,
  getCachedExamList,
  setCachedExamList,
  syncExamCache,
} from './examCache';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchExams(): Promise<ExamSummary[]> {
  try {
    const exams = await request<ExamSummary[]>('/exams');
    await setCachedExamList(exams);
    await syncExamCache(API_BASE);
    return exams;
  } catch {
    const cached = await getCachedExamList();
    if (cached && cached.length > 0) return cached;
    throw new Error('Unable to load exams. Check your connection.');
  }
}

export async function fetchExam(id: number): Promise<ExamDetail> {
  try {
    const exam = await request<ExamDetail>(`/exams/${id}`);
    return exam;
  } catch {
    const cached = await getCachedExam(id);
    if (cached) return cached;
    throw new Error('This exam is not available offline. Connect to the internet first.');
  }
}

export { syncExamCache, API_BASE };
