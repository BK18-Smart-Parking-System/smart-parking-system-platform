import { Module } from '@nestjs/common';
import { StudentDashboardController } from './student-dashboard.controller';
import { StudentDashboardService } from './student-dashboard.service';
import { PayosService } from './payos.service';

@Module({
  controllers: [StudentDashboardController],
  providers: [StudentDashboardService, PayosService],
})
export class StudentDashboardModule {}
