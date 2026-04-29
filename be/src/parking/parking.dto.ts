import { CardStatus, Role, SessionStatus, SlotStatus } from '../../generated/prisma';

export class ParkingSessionUserDto {
  id!: string;
  username!: string;
  fullName!: string;
  universityId!: string | null;
  role!: Role;
}

export class ParkingSessionCardDto {
  id!: string;
  uid!: string;
  status!: CardStatus;
  user!: ParkingSessionUserDto | null;
}

export class ParkingSessionZoneDto {
  id!: string;
  code!: string;
  name!: string;
}

export class ParkingSessionSlotDto {
  id!: string;
  name!: string;
  sensorCode!: string;
  status!: SlotStatus;
}

export class ParkingSessionRecordDto {
  id!: string;
  status!: SessionStatus;
  checkinTime!: Date;
  checkoutTime!: Date | null;
  licensePlateIn!: string | null;
  licensePlateOut!: string | null;
  calculatedFee!: number;
  rfidCard!: ParkingSessionCardDto;
  zone!: ParkingSessionZoneDto | null;
  slot!: ParkingSessionSlotDto | null;
}

export class ParkingSimulationResponseDto {
  message!: string;
  session!: ParkingSessionRecordDto | null;
}

export class ToggleSealSlotDto {
  slotId!: string;
}
