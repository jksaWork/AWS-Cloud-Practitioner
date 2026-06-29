import { Injectable, NotFoundException } from '@nestjs/common';
import { loadExams } from './exams.data';

@Injectable()
export class ExamsService {
  findAll() {
    return loadExams().map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      questionCount: exam.questions.length,
    }));
  }

  findOne(id: number) {
    const exam = loadExams().find((e) => e.id === id);

    if (!exam) {
      throw new NotFoundException(`Exam with id ${id} not found`);
    }

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      questions: exam.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctIndexes: q.correctIndexes,
        explanation: q.explanation,
      })),
    };
  }
}
