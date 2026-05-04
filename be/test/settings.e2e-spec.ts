import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { SettingsController } from '../src/settings/settings.controller';
import { SettingsService } from '../src/settings/settings.service';

describe('SettingsController (e2e)', () => {
  let app: INestApplication;

  const settingsServiceMock = {
    listPricingPolicies: jest.fn(),
    updatePricingPolicy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: settingsServiceMock,
        },
      ],
    }).compile();

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

  it('GET /settings/pricing-policies - should list policies', async () => {
    settingsServiceMock.listPricingPolicies.mockResolvedValue([{ id: 'p1' }]);

    const res = await request(app.getHttpServer())
      .get('/settings/pricing-policies')
      .expect(200);

    expect(res.body).toEqual([{ id: 'p1' }]);
    expect(settingsServiceMock.listPricingPolicies).toHaveBeenCalledTimes(1);
  });

  it('PUT /settings/pricing-policies/:id - should update policy', async () => {
    settingsServiceMock.updatePricingPolicy.mockResolvedValue({ id: 'p1', basePrice: 5000 });

    const body = {
      basePrice: 5000,
      pricePerHour: 3000,
    };

    const res = await request(app.getHttpServer())
      .put('/settings/pricing-policies/p1')
      .send(body)
      .expect(200);

    expect(res.body).toEqual({ id: 'p1', basePrice: 5000 });
    expect(settingsServiceMock.updatePricingPolicy).toHaveBeenCalledWith('p1',
      expect.objectContaining(body),
    );
  });

  it('PUT /settings/pricing-policies/:id - should fail validation with negative price', async () => {
    await request(app.getHttpServer())
      .put('/settings/pricing-policies/p1')
      .send({ basePrice: -100 })
      .expect(400);

    expect(settingsServiceMock.updatePricingPolicy).not.toHaveBeenCalled();
  });
});
