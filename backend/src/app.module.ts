import { Module } from '@nestjs/common';
import { ExamsModule } from './exams/exams.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ExamsModule, HealthModule],
})
export class AppModule {}
