import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ExamsModule } from './exams/exams.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [DatabaseModule, ExamsModule, HealthModule],
})
export class AppModule {}
