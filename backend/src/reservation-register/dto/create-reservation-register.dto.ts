import { IsUUID } from 'class-validator';
import { CreateReservationRegister } from 'lib/types/api/ReservationRegister';

export class CreateReservationRegisterDto implements CreateReservationRegister {
  @IsUUID()
  reservationId!: string;
}
