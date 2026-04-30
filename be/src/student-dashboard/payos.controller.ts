import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { StudentDashboardService } from './student-dashboard.service';

@Controller('payos')
export class PayosController {
  constructor(private readonly studentDashboardService: StudentDashboardService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() payload: Record<string, unknown>) {
    return this.studentDashboardService.handlePayosWebhook(payload);
  }
}
