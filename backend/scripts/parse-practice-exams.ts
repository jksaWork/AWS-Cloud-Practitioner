import * as fs from 'fs';
import * as path from 'path';

interface ParsedQuestion {
  text: string;
  options: string[];
  correctIndexes: number[];
  explanation: string | null;
}

interface ParsedExam {
  id: number;
  title: string;
  description: string;
  questions: ParsedQuestion[];
}

const LETTER_TO_INDEX: Record<string, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
};

function practiceExamNumberToDbId(examNumber: number): number {
  if (examNumber <= 2) return examNumber;
  if (examNumber <= 12) return examNumber + 1; // 3→4, 12→13 (skip id 3)
  return examNumber + 2; // 13→15, 23→25 (skip id 14)
}

function normalizeText(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAnswerLetters(line: string): number[] {
  const match = line.match(/Correct\s+[Aa]nswer:\s*([A-E](?:\s*,\s*[A-E])*)/i);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((l) => l.trim().toUpperCase())
    .filter((l) => l in LETTER_TO_INDEX)
    .map((l) => LETTER_TO_INDEX[l]);
}

function parseExplanation(detailsContent: string, answerLineIndex: number): string | null {
  const lines = detailsContent.split('\n');
  const afterAnswer = lines.slice(answerLineIndex + 1);
  const parts: string[] = [];

  let inExplanation = false;
  for (const line of afterAnswer) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (parts.length > 0) parts.push('');
      continue;
    }
    if (/^Explanation:/i.test(trimmed)) {
      inExplanation = true;
      const rest = trimmed.replace(/^Explanation:\s*/i, '').trim();
      if (rest) parts.push(rest);
      continue;
    }
    if (/^Reference:/i.test(trimmed)) {
      const rest = trimmed.replace(/^Reference:\s*/i, '').trim();
      parts.push(`Reference: ${rest}`);
      continue;
    }
    if (inExplanation || trimmed.startsWith('-') || trimmed.startsWith('Reference:')) {
      inExplanation = true;
      parts.push(trimmed);
    }
  }

  const explanation = parts.join('\n').trim();
  return explanation || null;
}

function parseQuestionBlock(block: string): ParsedQuestion | null {
  const lines = block.split('\n');
  const questionLines: string[] = [];
  const options: string[] = [];
  let detailsContent = '';
  let inDetails = false;

  for (const line of lines) {
    if (/^\s*<details/i.test(line)) {
      inDetails = true;
      continue;
    }
    if (/^\s*<\/details>/i.test(line)) {
      inDetails = false;
      continue;
    }
    if (inDetails) {
      detailsContent += line + '\n';
      continue;
    }
    const optionMatch = line.match(/^\s*-\s*([A-E])\.\s*(.+)$/);
    if (optionMatch) {
      options.push(optionMatch[2].trim());
      continue;
    }
    const stripped = line.replace(/^\d+\.\s*/, '').trim();
    if (stripped && !optionMatch) {
      questionLines.push(stripped);
    }
  }

  const text = normalizeText(questionLines.join(' '));
  if (!text || options.length === 0) return null;

  const detailsLines = detailsContent.split('\n');
  let correctIndexes: number[] = [];
  let answerLineIndex = -1;

  for (let i = 0; i < detailsLines.length; i++) {
    const indexes = parseAnswerLetters(detailsLines[i]);
    if (indexes.length > 0) {
      correctIndexes = indexes;
      answerLineIndex = i;
      break;
    }
  }

  const explanation =
    answerLineIndex >= 0 ? parseExplanation(detailsContent, answerLineIndex) : null;

  return {
    text,
    options,
    correctIndexes,
    explanation,
  };
}

function parseExamFile(filePath: string, examNumber: number): ParsedExam {
  const content = fs.readFileSync(filePath, 'utf-8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : `Practice Exam ${examNumber}`;

  const bodyStart = content.indexOf('\n', content.indexOf('#'));
  const body = bodyStart >= 0 ? content.slice(bodyStart) : content;

  const blocks = body.split(/(?=^\d+\.\s)/m).filter((b) => /^\d+\.\s/.test(b.trim()));

  const questions: ParsedQuestion[] = [];
  for (const block of blocks) {
    const q = parseQuestionBlock(block);
    if (q) questions.push(q);
  }

  return {
    id: practiceExamNumberToDbId(examNumber),
    title,
    description: 'AWS Cloud Practitioner practice questions',
    questions,
  };
}

function main() {
  const repoRoot = path.resolve(__dirname, '../..');
  const practiceDir = path.join(
    repoRoot,
    'AWS-Certified-Cloud-Practitioner-Notes-master',
    'practice-exam',
  );
  const outputPath = path.join(__dirname, '../src/seed/practice-exams.json');

  const exams: ParsedExam[] = [];
  let totalQuestions = 0;
  let multiSelectCount = 0;
  let missingAnswers = 0;

  for (let n = 1; n <= 23; n++) {
    const filePath = path.join(practiceDir, `practice-exam-${n}.md`);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing file: ${filePath}`);
      process.exit(1);
    }
    const exam = parseExamFile(filePath, n);
    exams.push(exam);
    totalQuestions += exam.questions.length;

    for (const q of exam.questions) {
      if (q.correctIndexes.length === 0) missingAnswers++;
      if (q.correctIndexes.length > 1) multiSelectCount++;
    }

    console.log(
      `  practice-exam-${n}.md → exam id ${exam.id}: ${exam.questions.length} questions`,
    );
  }

  const output = { exams };
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log('\nSummary:');
  console.log(`  Exams parsed: ${exams.length}`);
  console.log(`  Total questions: ${totalQuestions}`);
  console.log(`  Multi-select questions: ${multiSelectCount}`);
  console.log(`  Missing answers: ${missingAnswers}`);
  console.log(`  Output: ${outputPath}`);

  if (missingAnswers > 0) {
    process.exit(1);
  }
}

main();
