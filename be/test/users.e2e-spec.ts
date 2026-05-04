import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Role } from '../generated/prisma';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

describe('UsersController (e2e)', () => {
	let app: INestApplication;

	const usersServiceMock = {
		findUsers: jest.fn(),
		findById: jest.fn(),
		updateRole: jest.fn(),
	};

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: usersServiceMock,
				},
			],
		})
			.overrideGuard(JwtAuthGuard)
			.useValue({ canActivate: () => true })
			.overrideGuard(RolesGuard)
			.useValue({ canActivate: () => true })
			.compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('GET /users - should return all users', async () => {
		usersServiceMock.findUsers.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);

		const res = await request(app.getHttpServer()).get('/users').expect(200);

		expect(res.body).toHaveLength(2);
		expect(usersServiceMock.findUsers).toHaveBeenCalledWith(undefined);
	});

	it('GET /users?username=student1 - should filter by username', async () => {
		usersServiceMock.findUsers.mockResolvedValue({ id: 'u1', username: 'student1' });

		const res = await request(app.getHttpServer())
			.get('/users')
			.query({ username: 'student1' })
			.expect(200);

		expect(res.body).toMatchObject({ id: 'u1', username: 'student1' });
		expect(usersServiceMock.findUsers).toHaveBeenCalledWith('student1');
	});

	it('GET /users/:id - should return one user', async () => {
		usersServiceMock.findById.mockResolvedValue({ id: 'u1', universityId: 'SV001' });

		const res = await request(app.getHttpServer()).get('/users/SV001').expect(200);

		expect(res.body).toMatchObject({ id: 'u1', universityId: 'SV001' });
		expect(usersServiceMock.findById).toHaveBeenCalledWith('SV001');
	});

	it('PATCH /users/:id/role - should update role', async () => {
		usersServiceMock.updateRole.mockResolvedValue({
			id: 'u1',
			role: Role.OPERATOR,
		});

		const res = await request(app.getHttpServer())
			.patch('/users/u1/role')
			.send({ role: Role.OPERATOR })
			.expect(200);

		expect(res.body).toMatchObject({
			message: 'Cập nhật phân quyền thành công',
			user: { id: 'u1', role: Role.OPERATOR },
		});
		expect(usersServiceMock.updateRole).toHaveBeenCalledWith('u1', Role.OPERATOR);
	});

	it('DELETE /users/:id - should return delete confirmation', async () => {
		const res = await request(app.getHttpServer()).delete('/users/u1').expect(200);

		expect(res.body).toEqual({ message: 'Đã xóa user với id u1' });
	});
});
