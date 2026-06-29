import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'degraded'] })
  status: 'ok' | 'degraded';

  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  database: 'ok' | 'error';

  @ApiProperty({ example: '2026-06-29T12:00:00.000Z' })
  timestamp: string;
}
