export type CreateReservation = {
  parkingId: string;
  startDate: Date;
  endDate: Date;
};

export type UpdateReservation = CreateReservation;

export type Reservation = {
  id: string;
  userId: string;
  parkingId: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
};
