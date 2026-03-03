import { CreateReservationRegister } from 'lib/types/api/ReservationRegister';

export class CreateReservationRegisterDto implements CreateReservationRegister {
  reservationId!: string;
}
