import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Exam } from '../exams/exam.entity';
import { Question } from '../exams/question.entity';
import { SEED_EXAMS, SeedExam } from './seed-data';

interface PracticeExamsFile {
  exams: SeedExam[];
}

function loadAllExams(): SeedExam[] {
  const jsonPath = path.join(__dirname, 'practice-exams.json');
  const practiceExams: SeedExam[] = fs.existsSync(jsonPath)
    ? (JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as PracticeExamsFile).exams
    : [];

  const merged = [...practiceExams, ...SEED_EXAMS];
  merged.sort((a, b) => a.id - b.id);
  return merged;
}

async function seed() {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: 'quiz.sqlite',
    entities: [Exam, Question],
    synchronize: true,
  });

  await dataSource.initialize();

  const examRepo = dataSource.getRepository(Exam);
  const questionRepo = dataSource.getRepository(Question);

  await questionRepo.clear();
  await examRepo.clear();

  const allExams = loadAllExams();

  for (const seedExam of allExams) {
    const exam = examRepo.create({
      id: seedExam.id,
      title: seedExam.title,
      description: seedExam.description,
    });
    const savedExam = await examRepo.save(exam);

    for (const seedQuestion of seedExam.questions) {
      const question = questionRepo.create({
        examId: savedExam.id,
        text: seedQuestion.text,
        options: seedQuestion.options,
        correctIndexes: seedQuestion.correctIndexes,
        explanation: seedQuestion.explanation ?? null,
      });
      await questionRepo.save(question);
    }
  }

  const exams = await examRepo.find({ relations: ['questions'], order: { id: 'ASC' } });
  console.log('Seeded exams:');
  for (const exam of exams) {
    console.log(`  Exam ${exam.id}: ${exam.title} (${exam.questions.length} questions)`);
  }
  console.log(`Total: ${exams.length} exams, ${exams.reduce((n, e) => n + e.questions.length, 0)} questions`);

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
