import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  isSameDay,
  startOfToday,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { ReservationService } from "@/services/reservation/ReservationService";
import { ReservationRegisterService } from "@/services/reservationRegister/ReservationRegisterService";
import { ParkingService } from "@/services/parking/ParkingService";
import type { Parking } from "@/lib/types/api/Parking";
import type { Reservation } from "@/lib/types/api/Reservation";
import type { ReservationRegister } from "@/lib/types/api/ReservationRegister";
import { toast } from "sonner";
import { ApiException } from "@/services/api/ApiException";

type ReservationStatus = "PENDING" | "CHECKED_IN" | "EXPIRED";

export type EnrichedReservation = {
  id: string;
  userId: string;
  parkingId: string;
  parkingCode: string;
  startDate: Date;
  endDate: Date;
  isElectric: boolean;
  status: ReservationStatus;
  createdAt: Date;
  checkInId?: string;
};

interface ReservationContextType {
  reservations: EnrichedReservation[];
  history: EnrichedReservation[];
  allReservations: EnrichedReservation[];
  isLoading: boolean;
  addReservation: (
    parkingId: string,
    startDate: Date,
    endDate: Date,
  ) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  updateReservation: (id: string, parkingId: string) => Promise<void>;
  checkIn: (reservationId: string) => Promise<void>;
  checkInBySpot: (parkingCode: string) => Promise<void>;
  getReservationBySpot: (
    parkingCode: string,
    date?: Date,
  ) => EnrichedReservation | undefined;
  getReservationsByDate: (date: Date) => EnrichedReservation[];
}

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined,
);

function buildEnrichedReservation(
  res: Reservation,
  parkings: Parking[],
  registers: ReservationRegister[],
): EnrichedReservation {
  const parking = parkings.find((p) => p.id === res.parkingId);
  const parkingCode = parking
    ? `${parking.code}${parking.number}`
    : res.parkingId;
  const isElectric = parking?.hasElectricalTerminal ?? false;
  const checkIn = registers.find((r) => r.reservationId === res.id);

  const startDate = new Date(res.startDate);
  const endDate = new Date(res.endDate);
  const today = startOfToday();

  let status: ReservationStatus;
  if (checkIn) {
    status = "CHECKED_IN";
  } else if (isBefore(endDate, today)) {
    status = "EXPIRED";
  } else {
    status = "PENDING";
  }

  return {
    id: res.id,
    userId: res.userId,
    parkingId: res.parkingId,
    parkingCode,
    startDate,
    endDate,
    isElectric,
    status,
    createdAt: new Date(res.createdAt),
    checkInId: checkIn?.id,
  };
}

const ReservationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [allReservations, setAllReservations] = useState<EnrichedReservation[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const reservationService = useMemo(() => new ReservationService(), []);
  const reservationRegisterService = useMemo(
    () => new ReservationRegisterService(),
    [],
  );
  const parkingService = useMemo(() => new ParkingService(), []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [rawReservations, registers, parkings] = await Promise.all([
        reservationService.findAll(),
        reservationRegisterService.findAll(),
        parkingService.findAll(),
      ]);
      const enriched = rawReservations.map((res) =>
        buildEnrichedReservation(res, parkings, registers),
      );
      setAllReservations(enriched);
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, reservationService, reservationRegisterService, parkingService]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const today = startOfToday();
  const myReservations = allReservations.filter((r) => r.userId === user?.id);
  const reservations = myReservations.filter((r) => !isBefore(r.endDate, today));
  const history = myReservations.filter((r) => isBefore(r.endDate, today));

  const addReservation = async (
    parkingId: string,
    startDate: Date,
    endDate: Date,
  ) => {
    try {
      await reservationService.create({ parkingId, startDate, endDate });
      await fetchData();
      toast.success("Réservation créée avec succès");
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      }
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      await reservationService.deleteOne(id);
      setAllReservations((prev) => prev.filter((r) => r.id !== id));
      toast.success("Réservation annulée");
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      }
    }
  };

  const updateReservation = async (id: string, parkingId: string) => {
    try {
      await reservationService.updateOne(id, { parkingId });
      await fetchData();
      toast.success("Réservation mise à jour");
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      }
    }
  };

  const checkIn = async (reservationId: string) => {
    try {
      await reservationRegisterService.create({ reservationId });
      await fetchData();
      toast.success("Check-in effectué avec succès");
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      }
    }
  };

  const checkInBySpot = async (parkingCode: string) => {
    const now = new Date();
    const res = allReservations.find(
      (r) =>
        r.parkingCode === parkingCode &&
        !isBefore(now, startOfDay(r.startDate)) &&
        !isAfter(now, endOfDay(r.endDate)) &&
        r.status === "PENDING",
    );
    if (res) {
      await checkIn(res.id);
    }
  };

  const getReservationBySpot = (
    parkingCode: string,
    date: Date = new Date(),
  ) => {
    return allReservations.find(
      (r) =>
        r.parkingCode === parkingCode &&
        !isBefore(date, startOfDay(r.startDate)) &&
        !isAfter(date, endOfDay(r.endDate)),
    );
  };

  const getReservationsByDate = (date: Date) => {
    return allReservations.filter(
      (r) =>
        !isBefore(date, startOfDay(r.startDate)) &&
        !isAfter(date, endOfDay(r.endDate)),
    );
  };

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        history,
        allReservations,
        isLoading,
        addReservation,
        cancelReservation,
        updateReservation,
        checkIn,
        checkInBySpot,
        getReservationBySpot,
        getReservationsByDate,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export { ReservationContext, ReservationProvider };
