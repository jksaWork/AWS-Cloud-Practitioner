import { Injectable } from '@nestjs/common';
import { isExamDataAvailable } from '../exams/exams.data';
import { HealthResponseDto } from './health.dto';

@Injectable()
export class HealthService {
  check(): HealthResponseDto {
    const database: HealthResponseDto['database'] = isExamDataAvailable() ? 'ok' : 'error';

    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
