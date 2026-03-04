import { ReservationContext } from "@/contexts/ReservationsContext";
import { useContext } from "react";

export const useReservations = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error(
      "useReservations must be used within a ReservationProvider",
    );
  }
  return context;
};
