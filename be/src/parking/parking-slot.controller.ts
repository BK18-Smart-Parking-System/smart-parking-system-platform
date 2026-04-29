import { Controller, Param, Patch } from '@nestjs/common';
import { ParkingService } from './parking.service';

@Controller('parking-slot')
export class ParkingSlotController {
  constructor(private readonly parkingService: ParkingService) {}

  @Patch(':id/seal')
  async sealSlot(@Param('id') slotId: string) {
    return this.parkingService.toggleSealSlot(slotId);
  }
}
