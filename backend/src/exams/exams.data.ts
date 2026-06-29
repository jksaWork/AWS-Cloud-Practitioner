import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SEED_EXAMS, SeedExam, SeedQuestion } from '../seed/seed-data';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndexes: number[];
  explanation: string | null;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

interface PracticeExamsFile {
  exams: SeedExam[];
}

function practiceExamsPath(): string {
  return join(__dirname, '..', 'seed', 'practice-exams.json');
}

function assignQuestionIds(questions: SeedQuestion[]): Question[] {
  return questions.map((q, index) => ({
    id: index + 1,
    text: q.text,
    options: q.options,
    correctIndexes: q.correctIndexes,
    explanation: q.explanation ?? null,
  }));
}

function loadRawExams(): SeedExam[] {
  const jsonPath = practiceExamsPath();
  if (!existsSync(jsonPath)) {
    throw new Error(`Exam data file not found: ${jsonPath}`);
  }

  const practiceExams = (JSON.parse(readFileSync(jsonPath, 'utf-8')) as PracticeExamsFile).exams;
  const merged = [...practiceExams, ...SEED_EXAMS];
  merged.sort((a, b) => a.id - b.id);
  return merged;
}

let cachedExams: Exam[] | null = null;

export function loadExams(): Exam[] {
  if (cachedExams) return cachedExams;

  cachedExams = loadRawExams().map((exam) => ({
    id: exam.id,
    title: exam.title,
    description: exam.description,
    questions: assignQuestionIds(exam.questions),
  }));

  return cachedExams;
}

export function isExamDataAvailable(): boolean {
  try {
    loadExams();
    return true;
  } catch {
    return false;
  }
}
