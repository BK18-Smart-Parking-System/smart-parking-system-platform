import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ReportsService } from './reports.service';
import { AdminDashboardDto, OperatorDashboardDto, StaffDashboardDto } from './dto/dashboard.dto';
import { ReportsOverviewDto, DetailedReportsDto } from './dto/reports.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get('admin')
  async getAdminDashboard(): Promise<AdminDashboardDto> {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('operator')
  async getOperatorDashboard(): Promise<OperatorDashboardDto> {
    return this.dashboardService.getOperatorDashboard();
  }

  @Get('staff')
  async getStaffDashboard(): Promise<StaffDashboardDto> {
    return this.dashboardService.getStaffDashboard();
  }

  @Get('reports/overview')
  async getReportsOverview(): Promise<ReportsOverviewDto> {
    return this.reportsService.getReportsOverview();
  }

  @Get('reports/detailed')
  async getDetailedReports(): Promise<DetailedReportsDto> {
    return this.reportsService.getDetailedReports();
  }
}
