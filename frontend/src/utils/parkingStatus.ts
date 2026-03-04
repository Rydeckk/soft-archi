import type { Parking } from "@/lib/types/api/Parking";
import type { Reservation } from "@/lib/types/api/Reservation";
import type { ReservationRegister } from "@/lib/types/api/ReservationRegister";

export type SpotStatus = "available" | "reserved" | "occupied";

/**
 * Déduit le status d'une place de parking basé sur les réservations et registres
 * @param parkingId - ID du parking
 * @param date - Date à vérifier
 * @param reservations - Liste de toutes les réservations
 * @param reservationRegisters - Liste de tous les registres de réservation
 * @returns Le status de la place: "available", "reserved" ou "occupied"
 */
export function getSpotStatus(
  parkingId: string,
  date: Date,
  reservations: Reservation[],
  reservationRegisters: ReservationRegister[],
): SpotStatus {
  // Trouver les réservations pour ce parking à cette date
  const relevantReservations = reservations.filter(
    (reservation) =>
      reservation.parkingId === parkingId &&
      date >= reservation.startDate &&
      date <= reservation.endDate,
  );

  // Si pas de réservation, la place est disponible
  if (relevantReservations.length === 0) {
    return "available";
  }

  // Vérifier si une des réservations a un registre (occupée)
  const hasCheckIn = relevantReservations.some((reservation) =>
    reservationRegisters.some((reg) => reg.reservationId === reservation.id),
  );

  return hasCheckIn ? "occupied" : "reserved";
}

/**
 * Ajoute le status calculé à une liste de parkings
 */
export function enrichParkingsWithStatus(
  parkings: Parking[],
  date: Date,
  reservations: Reservation[],
  reservationRegisters: ReservationRegister[],
): (Parking & { status: SpotStatus })[] {
  return parkings.map((parking) => ({
    ...parking,
    status: getSpotStatus(parking.id, date, reservations, reservationRegisters),
  }));
}
