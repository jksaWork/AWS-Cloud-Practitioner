export interface ExamSummary {
  id: number;
  title: string;
  description: string;
  questionCount: number;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndexes: number[];
  explanation: string | null;
}

export interface ExamDetail {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export type AnswersMap = Record<number, number[]>;
