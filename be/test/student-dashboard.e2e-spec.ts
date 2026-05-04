import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PayosController } from '../src/student-dashboard/payos.controller';
import { StudentDashboardController } from '../src/student-dashboard/student-dashboard.controller';
import { StudentDashboardService } from '../src/student-dashboard/student-dashboard.service';

describe('StudentDashboardController + PayosController (e2e)', () => {
	let app: INestApplication;

	const studentDashboardServiceMock = {
		getOverview: jest.fn(),
		getPaymentInfo: jest.fn(),
		createPaymentLink: jest.fn(),
		syncPaymentStatus: jest.fn(),
		getParkingHistory: jest.fn(),
		handlePayosWebhook: jest.fn(),
	};

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [StudentDashboardController, PayosController],
			providers: [
				{
					provide: StudentDashboardService,
					useValue: studentDashboardServiceMock,
				},
			],
		})
			.compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				transform: true,
				whitelist: true,
			}),
		);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('GET /student/overview - should return overview', async () => {
		studentDashboardServiceMock.getOverview.mockResolvedValue({ student: { id: 'u1' } });

		const res = await request(app.getHttpServer())
			.get('/student/overview')
			.query({ universityId: 'SV001' })
			.expect(200);

		expect(res.body).toEqual({ student: { id: 'u1' } });
		expect(studentDashboardServiceMock.getOverview).toHaveBeenCalledWith(
			expect.objectContaining({ universityId: 'SV001' }),
		);
	});

	it('GET /student/payment-info - should return payment info', async () => {
		studentDashboardServiceMock.getPaymentInfo.mockResolvedValue({ totalAmount: 100000 });

		const res = await request(app.getHttpServer())
			.get('/student/payment-info')
			.query({ userId: '9cc3ad8f-a741-4f84-a98f-57e6fcf44a1a' })
			.expect(200);

		expect(res.body).toEqual({ totalAmount: 100000 });
	});

	it('POST /student/create-payment-link - should create payment link', async () => {
		studentDashboardServiceMock.createPaymentLink.mockResolvedValue({
			paymentId: 'pay1',
			checkoutUrl: 'https://pay.example/link',
		});

		const res = await request(app.getHttpServer())
			.post('/student/create-payment-link')
			.query({ universityId: 'SV001' })
			.send({})
			.expect(201);

		expect(res.body).toMatchObject({ paymentId: 'pay1' });
		expect(studentDashboardServiceMock.createPaymentLink).toHaveBeenCalledWith(
			expect.objectContaining({ universityId: 'SV001' }),
		);
	});

	it('POST /student/sync-payment-status - should sync payment status', async () => {
		studentDashboardServiceMock.syncPaymentStatus.mockResolvedValue({
			message: 'Đồng bộ trạng thái thanh toán hoàn tất.',
			updatedSuccess: 1,
			updatedFailed: 0,
		});

		const res = await request(app.getHttpServer())
			.post('/student/sync-payment-status')
			.query({ universityId: 'SV001' })
			.send({})
			.expect(201);

		expect(res.body).toMatchObject({ updatedSuccess: 1, updatedFailed: 0 });
	});

	it('GET /student/parking-history - should parse pagination query', async () => {
		studentDashboardServiceMock.getParkingHistory.mockResolvedValue({ items: [], total: 0 });

		const res = await request(app.getHttpServer())
			.get('/student/parking-history')
			.query({ universityId: 'SV001', page: '2', pageSize: '5' })
			.expect(200);

		expect(res.body).toEqual({ items: [], total: 0 });
		expect(studentDashboardServiceMock.getParkingHistory).toHaveBeenCalledWith(
			expect.objectContaining({ universityId: 'SV001', page: 2, pageSize: 5 }),
		);
	});

	it('GET /student/parking-history - should fail with invalid UUID format', async () => {
		await request(app.getHttpServer())
			.get('/student/parking-history')
			.query({ userId: 'invalid-uuid' })
			.expect(400);
	});

	it('POST /payos/webhook - should handle webhook', async () => {
		studentDashboardServiceMock.handlePayosWebhook.mockResolvedValue({
			received: true,
			updated: true,
		});

		const res = await request(app.getHttpServer())
			.post('/payos/webhook')
			.send({
				code: '00',
				data: { orderCode: 123456 },
			})
			.expect(200);

		expect(res.body).toMatchObject({
			received: true,
			updated: true,
		});
		expect(studentDashboardServiceMock.handlePayosWebhook).toHaveBeenCalledWith({
			code: '00',
			data: { orderCode: 123456 },
		});
	});
});
