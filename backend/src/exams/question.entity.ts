import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exam } from './exam.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  examId: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'simple-json' })
  options: string[];

  @Column({ type: 'simple-json' })
  correctIndexes: number[];

  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  @ManyToOne(() => Exam, (exam) => exam.questions, { onDelete: 'CASCADE' })
  exam: Exam;
}
