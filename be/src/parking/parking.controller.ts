import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ParkingService } from './parking.service';
import { ToggleSealSlotDto } from './parking.dto';

@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Get('sessions')
  async getSessions() {
    return this.parkingService.getSessions();
  }

  @Get('zones-with-slots')
  async getZonesWithSlots() {
    return this.parkingService.getZonesWithSlots();
  }

  @Post('simulate/random-check-in')
  async simulateRandomCheckIn() {
    return this.parkingService.simulateRandomCheckIn();
  }

  @Post('simulate/random-check-out')
  async simulateRandomCheckOut() {
    return this.parkingService.simulateRandomCheckOut();
  }

  @Post('slots/toggle-seal')
  async toggleSealSlot(@Body() body: ToggleSealSlotDto) {
    return this.parkingService.toggleSealSlot(body.slotId);
  }

  @Patch('slots/:id/seal')
  async sealSlot(@Param('id') slotId: string) {
    return this.parkingService.toggleSealSlot(slotId);
  }
}
