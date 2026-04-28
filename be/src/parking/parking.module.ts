import { Module } from '@nestjs/common';
import { ParkingController } from './parking.controller';
import { ParkingSlotController } from './parking-slot.controller';
import { ParkingService } from './parking.service';

@Module({
  controllers: [ParkingController, ParkingSlotController],
  providers: [ParkingService],
})
export class ParkingModule {}
