import { Reservation } from './Reservation';

export type CreateReservationRegister = {
  reservationId: string;
};

export type ReservationRegister = {
  id: string;
  reservationId: string;
  reservation: Reservation;
  userId: string;
  createdAt: Date;
};
