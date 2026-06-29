import { ApiProperty } from '@nestjs/swagger';

export class ExamSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Practice Exam 1' })
  title: string;

  @ApiProperty({ example: 'AWS Cloud Practitioner practice questions' })
  description: string;

  @ApiProperty({ example: 50 })
  questionCount: number;
}

export class QuestionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Which AWS service provides object storage?' })
  text: string;

  @ApiProperty({ example: ['Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon EBS'] })
  options: string[];

  @ApiProperty({ example: [1] })
  correctIndexes: number[];

  @ApiProperty({ example: 'Amazon S3 is object storage.', nullable: true })
  explanation: string | null;
}

export class ExamDetailDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Practice Exam 1' })
  title: string;

  @ApiProperty({ example: 'AWS Cloud Practitioner practice questions' })
  description: string;

  @ApiProperty({ type: [QuestionDto] })
  questions: QuestionDto[];
}
