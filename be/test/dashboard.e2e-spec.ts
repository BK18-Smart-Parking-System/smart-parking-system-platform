import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DashboardController } from '../src/dashboard/dashboard.controller';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { ReportsService } from '../src/dashboard/reports.service';

describe('DashboardController (e2e)', () => {
  let app: INestApplication;

  const dashboardServiceMock = {
    getAdminDashboard: jest.fn(),
    getOperatorDashboard: jest.fn(),
    getStaffDashboard: jest.fn(),
  };

  const reportsServiceMock = {
    getReportsOverview: jest.fn(),
    getDetailedReports: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: dashboardServiceMock,
        },
        {
          provide: ReportsService,
          useValue: reportsServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /dashboard/admin - should return admin dashboard data', async () => {
    dashboardServiceMock.getAdminDashboard.mockResolvedValue({ stats: { totalUsers: 10 } });

    const res = await request(app.getHttpServer()).get('/dashboard/admin').expect(200);

    expect(res.body).toEqual({ stats: { totalUsers: 10 } });
  });

  it('GET /dashboard/operator - should return operator dashboard data', async () => {
    dashboardServiceMock.getOperatorDashboard.mockResolvedValue({ queue: [] });

    const res = await request(app.getHttpServer()).get('/dashboard/operator').expect(200);

    expect(res.body).toEqual({ queue: [] });
  });

  it('GET /dashboard/staff - should return staff dashboard data', async () => {
    dashboardServiceMock.getStaffDashboard.mockResolvedValue({ tasks: [] });

    const res = await request(app.getHttpServer()).get('/dashboard/staff').expect(200);

    expect(res.body).toEqual({ tasks: [] });
  });

  it('GET /dashboard/reports/overview - should return reports overview', async () => {
    reportsServiceMock.getReportsOverview.mockResolvedValue({ monthlyRevenue: [] });

    const res = await request(app.getHttpServer())
      .get('/dashboard/reports/overview')
      .expect(200);

    expect(res.body).toEqual({ monthlyRevenue: [] });
  });

  it('GET /dashboard/reports/detailed - should return detailed reports', async () => {
    reportsServiceMock.getDetailedReports.mockResolvedValue({ dailyStatistics: [] });

    const res = await request(app.getHttpServer())
      .get('/dashboard/reports/detailed')
      .expect(200);

    expect(res.body).toEqual({ dailyStatistics: [] });
  });
});