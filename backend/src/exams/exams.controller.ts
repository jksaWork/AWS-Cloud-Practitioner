import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { ExamDetailDto, ExamSummaryDto } from './exams.dto';

@ApiTags('exams')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @ApiOperation({ summary: 'List all exams' })
  @ApiOkResponse({ type: [ExamSummaryDto] })
  findAll() {
    return this.examsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam by id with questions' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: ExamDetailDto })
  @ApiNotFoundResponse({ description: 'Exam not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.findOne(id);
  }
}
