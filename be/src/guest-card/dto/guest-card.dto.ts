export class CreateGuestCardDto {
  uid!: string;
}

export class GuestCheckInResponseDto {
  message!: string;
  session!: {
    id: string;
    status: string;
    checkinTime: Date;
    licensePlateIn: string | null;
    slot: {
      id: string;
      name: string;
      sensorCode: string;
    } | null;
    zone: {
      id: string;
      code: string;
      name: string;
    } | null;
    card: {
      id: string;
      uid: string;
      isGuestCard: boolean;
    };
  };
}

export class GuestCheckOutResponseDto {
  message!: string;
  session!: {
    id: string;
    status: string;
    checkinTime: Date;
    checkoutTime: Date;
    licensePlateIn: string | null;
    licensePlateOut: string | null;
    calculatedFee: number;
    payment: {
      id: string;
      amount: number;
      method: string;
      status: string;
    } | null;
    card: {
      id: string;
      uid: string;
      isGuestCard: boolean;
    };
    slot: {
      id: string;
      name: string;
      sensorCode: string;
    } | null;
    zone: {
      id: string;
      code: string;
      name: string;
    } | null;
  };
}
