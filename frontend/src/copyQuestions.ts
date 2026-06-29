import type { Question } from './types';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

function formatCorrectAnswer(question: Question): string {
  const labels = question.correctIndexes.map(
    (idx) => OPTION_LABELS[idx] ?? String(idx + 1),
  );
  const texts = question.correctIndexes.map((idx) => question.options[idx]);
  if (labels.length === 1) {
    return `${labels[0]}) ${texts[0]}`;
  }
  return labels.map((label, i) => `${label}) ${texts[i]}`).join(', ');
}

export function formatQuestionsForCopy(examTitle: string, questions: Question[]): string {
  const lines: string[] = [
    examTitle,
    '='.repeat(Math.min(examTitle.length, 60)),
    '',
  ];

  questions.forEach((question, index) => {
    lines.push(`Question ${index + 1}:`);
    lines.push(question.text);
    lines.push('');

    question.options.forEach((option, optionIndex) => {
      const label = OPTION_LABELS[optionIndex] ?? String(optionIndex + 1);
      lines.push(`${label}) ${option}`);
    });

    lines.push(`Answer: ${formatCorrectAnswer(question)}`);
    if (question.explanation) {
      lines.push(`Explanation: ${question.explanation}`);
    }
    lines.push('');
  });

  return lines.join('\n').trim();
}

export async function copyQuestionsToClipboard(
  examTitle: string,
  questions: Question[],
): Promise<void> {
  await navigator.clipboard.writeText(formatQuestionsForCopy(examTitle, questions));
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((val, i) => val === sortedB[i]);
}

export { arraysEqual };
