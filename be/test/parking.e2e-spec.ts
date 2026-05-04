import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ParkingController } from '../src/parking/parking.controller';
import { ParkingSlotController } from '../src/parking/parking-slot.controller';
import { ParkingService } from '../src/parking/parking.service';

describe('ParkingController + ParkingSlotController (e2e)', () => {
  let app: INestApplication;

  const parkingServiceMock = {
    getSessions: jest.fn(),
    getZonesWithSlots: jest.fn(),
    simulateRandomCheckIn: jest.fn(),
    simulateRandomCheckOut: jest.fn(),
    toggleSealSlot: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ParkingController, ParkingSlotController],
      providers: [
        {
          provide: ParkingService,
          useValue: parkingServiceMock,
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

  it('GET /parking/sessions - should return parking sessions', async () => {
    parkingServiceMock.getSessions.mockResolvedValue([{ id: 'ps1' }]);

    const res = await request(app.getHttpServer()).get('/parking/sessions').expect(200);

    expect(res.body).toEqual([{ id: 'ps1' }]);
    expect(parkingServiceMock.getSessions).toHaveBeenCalledTimes(1);
  });

  it('GET /parking/zones-with-slots - should return zones with slots', async () => {
    parkingServiceMock.getZonesWithSlots.mockResolvedValue([{ id: 'z1', slots: [] }]);

    const res = await request(app.getHttpServer()).get('/parking/zones-with-slots').expect(200);

    expect(res.body).toEqual([{ id: 'z1', slots: [] }]);
  });

  it('POST /parking/simulate/random-check-in - should simulate check-in', async () => {
    parkingServiceMock.simulateRandomCheckIn.mockResolvedValue({ message: 'check-in simulated' });

    const res = await request(app.getHttpServer())
      .post('/parking/simulate/random-check-in')
      .expect(201);

    expect(res.body).toEqual({ message: 'check-in simulated' });
  });

  it('POST /parking/simulate/random-check-out - should simulate check-out', async () => {
    parkingServiceMock.simulateRandomCheckOut.mockResolvedValue({ message: 'check-out simulated' });

    const res = await request(app.getHttpServer())
      .post('/parking/simulate/random-check-out')
      .expect(201);

    expect(res.body).toEqual({ message: 'check-out simulated' });
  });

  it('POST /parking/slots/toggle-seal - should toggle by body slotId', async () => {
    parkingServiceMock.toggleSealSlot.mockResolvedValue({ id: 'slot-1', sealed: true });

    const res = await request(app.getHttpServer())
      .post('/parking/slots/toggle-seal')
      .send({ slotId: 'slot-1' })
      .expect(201);

    expect(res.body).toEqual({ id: 'slot-1', sealed: true });
    expect(parkingServiceMock.toggleSealSlot).toHaveBeenCalledWith('slot-1');
  });

  it('PATCH /parking/slots/:id/seal - should toggle by route id', async () => {
    parkingServiceMock.toggleSealSlot.mockResolvedValue({ id: 'slot-2', sealed: false });

    const res = await request(app.getHttpServer())
      .patch('/parking/slots/slot-2/seal')
      .expect(200);

    expect(res.body).toEqual({ id: 'slot-2', sealed: false });
    expect(parkingServiceMock.toggleSealSlot).toHaveBeenCalledWith('slot-2');
  });

  it('PATCH /parking-slot/:id/seal - should toggle via parking-slot controller', async () => {
    parkingServiceMock.toggleSealSlot.mockResolvedValue({ id: 'slot-3', sealed: true });

    const res = await request(app.getHttpServer())
      .patch('/parking-slot/slot-3/seal')
      .expect(200);

    expect(res.body).toEqual({ id: 'slot-3', sealed: true });
    expect(parkingServiceMock.toggleSealSlot).toHaveBeenCalledWith('slot-3');
  });
});
