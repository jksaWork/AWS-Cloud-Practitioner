import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './exam.entity';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
  ) {}

  async findAll() {
    const exams = await this.examRepository.find({
      relations: ['questions'],
      order: { id: 'ASC' },
    });

    return exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      questionCount: exam.questions?.length ?? 0,
    }));
  }

  async findOne(id: number) {
    const exam = await this.examRepository.findOne({
      where: { id },
      relations: ['questions'],
    });

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
