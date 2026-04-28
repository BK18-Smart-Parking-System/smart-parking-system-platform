import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ParkingHistoryQueryDto, StudentIdentityQueryDto } from './student-dashboard.dto';
import { StudentDashboardService } from './student-dashboard.service';

@Controller('student')
export class StudentDashboardController {
  constructor(private readonly studentDashboardService: StudentDashboardService) {}

  @Get('overview')
  async getOverview(@Query() query: StudentIdentityQueryDto) {
    return this.studentDashboardService.getOverview(query);
  }

  @Get('payment-info')
  async getPaymentInfo(@Query() query: StudentIdentityQueryDto) {
    return this.studentDashboardService.getPaymentInfo(query);
  }

  @Post('create-payment-link')
  async createPaymentLink(
    @Query() query: StudentIdentityQueryDto,
    @Body() _body: Record<string, never>,
  ) {
    return this.studentDashboardService.createPaymentLink(query);
  }

  @Get('parking-history')
  async getParkingHistory(@Query() query: ParkingHistoryQueryDto) {
    return this.studentDashboardService.getParkingHistory(query);
  }
}
