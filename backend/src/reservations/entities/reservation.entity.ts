import { Reservation } from 'lib/types/api/Reservation';

export class ReservationEntity implements Reservation {
  id!: string;

  userId!: string;

  parkingId!: string;

  startDate!: Date;

  endDate!: Date;

  createdAt!: Date;

  updatedAt!: Date;

  constructor(partial: Partial<ReservationEntity>) {
    Object.assign(this, partial);
  }
}
