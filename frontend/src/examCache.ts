import type { ExamDetail, ExamSummary } from './types';
import { getCompletedExams } from './completion';

const CACHE_SIZE = 5;
const DB_NAME = 'aws-quiz-exam-cache';
const DB_VERSION = 1;
const STORE = 'cache';

const memoryExams = new Map<number, ExamDetail>();
let memoryExamList: ExamSummary[] | null = null;
let syncInProgress = false;

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function examDetailKey(id: number): string {
  return `exam-${id}`;
}

export async function getCachedExamList(): Promise<ExamSummary[] | null> {
  if (memoryExamList) return memoryExamList;
  const stored = await idbGet<ExamSummary[]>('exam-list');
  if (stored) memoryExamList = stored;
  return stored;
}

export async function setCachedExamList(exams: ExamSummary[]): Promise<void> {
  memoryExamList = exams;
  await idbSet('exam-list', exams);
}

export async function getCachedExam(id: number): Promise<ExamDetail | null> {
  const inMemory = memoryExams.get(id);
  if (inMemory) return inMemory;
  const stored = await idbGet<ExamDetail>(examDetailKey(id));
  if (stored) memoryExams.set(id, stored);
  return stored;
}

async function setCachedExam(exam: ExamDetail): Promise<void> {
  memoryExams.set(exam.id, exam);
  await idbSet(examDetailKey(exam.id), exam);
}

async function removeCachedExam(id: number): Promise<void> {
  memoryExams.delete(id);
  await idbDelete(examDetailKey(id));
}

export async function getCachedExamIds(): Promise<number[]> {
  const ids: number[] = [];
  for (const id of memoryExams.keys()) ids.push(id);
  if (ids.length > 0) return ids.sort((a, b) => a - b);

  const list = await getCachedExamList();
  if (!list) return [];

  const completed = getCompletedExams();
  const stored: number[] = [];
  for (const exam of list) {
    if (completed.includes(exam.id)) continue;
    const detail = await idbGet<ExamDetail>(examDetailKey(exam.id));
    if (detail) stored.push(exam.id);
  }
  return stored.sort((a, b) => a - b);
}

function pickNextExamIds(
  allExams: ExamSummary[],
  completed: number[],
  currentlyCached: number[],
): number[] {
  const uncompleted = allExams
    .filter((e) => !completed.includes(e.id))
    .sort((a, b) => a.id - b.id);

  const stillValid = currentlyCached.filter(
    (id) => !completed.includes(id) && uncompleted.some((e) => e.id === id),
  );

  const slotsLeft = CACHE_SIZE - stillValid.length;
  const toAdd = uncompleted
    .filter((e) => !stillValid.includes(e.id))
    .slice(0, slotsLeft)
    .map((e) => e.id);

  return [...stillValid, ...toAdd].slice(0, CACHE_SIZE);
}

async function fetchExamFromNetwork(id: number, apiBase: string): Promise<ExamDetail> {
  const response = await fetch(`${apiBase}/exams/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch exam ${id}`);
  }
  return response.json() as Promise<ExamDetail>;
}

async function fetchExamListFromNetwork(apiBase: string): Promise<ExamSummary[]> {
  const response = await fetch(`${apiBase}/exams`);
  if (!response.ok) {
    throw new Error('Failed to fetch exam list');
  }
  return response.json() as Promise<ExamSummary[]>;
}

export async function syncExamCache(apiBase: string): Promise<number[]> {
  if (syncInProgress) return getCachedExamIds();
  syncInProgress = true;

  try {
    if (!isOnline()) return getCachedExamIds();

    const exams = await fetchExamListFromNetwork(apiBase);
    await setCachedExamList(exams);

    const completed = getCompletedExams();
    const currentCached = await getCachedExamIds();
    const targetIds = pickNextExamIds(exams, completed, currentCached);

    const toRemove = currentCached.filter((id) => !targetIds.includes(id));
    for (const id of toRemove) {
      await removeCachedExam(id);
    }

    for (const id of targetIds) {
      if (memoryExams.has(id)) continue;
      const existing = await idbGet<ExamDetail>(examDetailKey(id));
      if (existing) {
        memoryExams.set(id, existing);
        continue;
      }
      const detail = await fetchExamFromNetwork(id, apiBase);
      await setCachedExam(detail);
    }

    return targetIds;
  } finally {
    syncInProgress = false;
  }
}

export async function rotateCacheAfterCompletion(
  completedExamId: number,
  apiBase: string,
): Promise<void> {
  await removeCachedExam(completedExamId);

  if (!isOnline()) return;

  let exams = await getCachedExamList();
  if (!exams) {
    exams = await fetchExamListFromNetwork(apiBase);
    await setCachedExamList(exams);
  }
  const completed = getCompletedExams();
  const currentCached = await getCachedExamIds();
  const targetIds = pickNextExamIds(exams, completed, currentCached);

  for (const id of targetIds) {
    if (memoryExams.has(id)) continue;
    const detail = await fetchExamFromNetwork(id, apiBase);
    await setCachedExam(detail);
  }
}

export function getCacheSize(): number {
  return CACHE_SIZE;
}

export function getMemoryCachedCount(): number {
  return memoryExams.size;
}
