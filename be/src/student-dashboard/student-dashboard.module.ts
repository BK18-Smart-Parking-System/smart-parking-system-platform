import { Module } from '@nestjs/common';
import { PayosController } from './payos.controller';
import { StudentDashboardController } from './student-dashboard.controller';
import { StudentDashboardService } from './student-dashboard.service';
import { PayosService } from './payos.service';

@Module({
  controllers: [StudentDashboardController, PayosController],
  providers: [StudentDashboardService, PayosService],
})
export class StudentDashboardModule {}
