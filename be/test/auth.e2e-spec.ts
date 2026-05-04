import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { Role } from '../generated/prisma';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController (e2e)', () => {
	let app: INestApplication;

	const authServiceMock = {
		refreshToken: jest.fn(),
		register: jest.fn(),
		login: jest.fn(),
	};

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: authServiceMock,
				},
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.use(cookieParser());
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

	it('POST /auth/register - should register user', async () => {
		authServiceMock.register.mockResolvedValue({
			id: 'u1',
			username: 'student1',
			message: 'Đăng ký thành công',
		});

		const body = {
			username: 'student1',
			email: 'student1@example.com',
			password: 'password123',
			fullName: 'Student One',
			role: Role.STUDENT,
		};

		const res = await request(app.getHttpServer()).post('/auth/register').send(body).expect(201);

		expect(res.body).toMatchObject({
			id: 'u1',
			username: 'student1',
			message: 'Đăng ký thành công',
		});
		expect(authServiceMock.register).toHaveBeenCalledWith(expect.objectContaining(body));
	});

	it('POST /auth/register - should fail validation with short username', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send({
				username: 'abc',
				email: 'student1@example.com',
				password: 'password123',
				fullName: 'Student One',
				role: Role.STUDENT,
			})
			.expect(400);
	});

	it('POST /auth/login - should login successfully', async () => {
		authServiceMock.login.mockResolvedValue({
			access_token: 'token123',
			user: {
				id: 'u1',
				fullName: 'Student One',
				role: Role.STUDENT,
			},
		});

		const body = {
			username: 'student1',
			password: 'password123',
		};

		const res = await request(app.getHttpServer()).post('/auth/login').send(body).expect(200);

		expect(res.body).toMatchObject({
			access_token: 'token123',
			user: expect.objectContaining({ id: 'u1' }),
		});
		expect(authServiceMock.login).toHaveBeenCalled();
	});

	it('POST /auth/refresh - should refresh token from cookie', async () => {
		authServiceMock.refreshToken.mockImplementation((token: string) => {
			if (!token) {
				throw new UnauthorizedException('Không có refresh token');
			}
			return { access_token: 'new-access-token' };
		});

		const res = await request(app.getHttpServer())
			.post('/auth/refresh')
			.set('Cookie', ['refreshToken=refresh-token-1'])
			.expect(201);

		expect(res.body).toEqual({ access_token: 'new-access-token' });
		expect(authServiceMock.refreshToken).toHaveBeenCalledWith('refresh-token-1');
	});

	it('POST /auth/refresh - should fail without cookie', async () => {
		await request(app.getHttpServer()).post('/auth/refresh').expect(401);
	});

	it('POST /auth/logout - should clear refresh token cookie', async () => {
		const res = await request(app.getHttpServer()).post('/auth/logout').expect(201);

		expect(res.body).toEqual({ message: 'Đăng xuất thành công' });
		expect(res.headers['set-cookie']).toBeDefined();
	});
});
