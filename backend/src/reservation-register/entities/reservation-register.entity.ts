import { Type } from 'class-transformer';
import { ReservationRegister } from 'lib/types/api/ReservationRegister';
import { ReservationEntity } from 'src/reservations/entities/reservation.entity';

export class ReservationRegisterEntity implements ReservationRegister {
  id!: string;

  reservationId!: string;

  @Type(() => ReservationEntity)
  reservation!: ReservationEntity;

  userId!: string;

  createdAt!: Date;

  constructor(partial: Partial<ReservationRegisterEntity>) {
    Object.assign(this, partial);
  }
}
