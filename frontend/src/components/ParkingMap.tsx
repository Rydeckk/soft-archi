import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/utils";
import { Zap, Car, CheckCircle2, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParkingService } from "@/services/parking/ParkingService";
import type { Parking } from "@/lib/types/api/Parking";
import { ReservationService } from "@/services/reservation/ReservationService";
import { ReservationRegisterService } from "@/services/reservationRegister/ReservationRegisterService";
import {
  enrichParkingsWithStatus,
  type SpotStatus,
} from "@/utils/parkingStatus";
import type { Reservation } from "@/lib/types/api/Reservation";
import type { ReservationRegister } from "@/lib/types/api/ReservationRegister";

interface ParkingMapProps {
  onSpotSelect?: (spot: Parking) => void;
  selectedSpotId?: string;
  className?: string;
  date?: Date;
  showOnlyElectric?: boolean;
  refreshTrigger?: number;
}

export function ParkingMap({
  onSpotSelect,
  selectedSpotId,
  className,
  date = new Date(),
  showOnlyElectric = false,
  refreshTrigger = 0,
}: ParkingMapProps) {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [reservationsData, setReservationsData] = useState<Reservation[]>([]);
  const [reservationRegisterData, setReservationRegisterData] = useState<
    ReservationRegister[]
  >([]);
  const parkingService = useMemo(() => new ParkingService(), []);
  const reservationService = useMemo(() => new ReservationService(), []);
  const reservationRegisterService = useMemo(
    () => new ReservationRegisterService(),
    [],
  );

  const getSpotColor = (spot: Parking, status: SpotStatus) => {
    if (spot.id === selectedSpotId)
      return "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2";
    if (status === "reserved")
      return "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300 shadow-inner shadow-blue-400/20";
    if (status === "occupied")
      return "bg-red-100 border-red-200 text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-300";
    if (spot.hasElectricalTerminal)
      return "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-400";
    return "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-800";
  };

  const getStatusLabel = (status: SpotStatus) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "reserved":
        return "Réservé";
      case "occupied":
        return "Occupé";
      default:
        return status;
    }
  };

  useEffect(() => {
    const getParkings = async () => {
      const reservations = await reservationService.findAll();
      const reservationRegisters = await reservationRegisterService.findAll();
      const parkingsData = await parkingService.findAll();

      setReservationsData(reservations);
      setReservationRegisterData(reservationRegisters);
      setParkings(parkingsData);
    };
    getParkings();
  }, [parkingService, reservationService, reservationRegisterService, refreshTrigger]);

  return (
    <div
      className={cn(
        "w-full overflow-x-auto p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border",
        className,
      )}
    >
      <TooltipProvider>
        <div className="grid grid-cols-10 gap-2 min-w-[700px]">
          {enrichParkingsWithStatus(
            parkings,
            date,
            reservationsData,
            reservationRegisterData,
          )
            .filter(({ hasElectricalTerminal }) =>
              showOnlyElectric ? hasElectricalTerminal : true,
            )
            .map((spot) => (
              <Tooltip key={spot.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSpotSelect?.(spot)}
                    className={cn(
                      "relative h-16 w-full flex flex-col items-center justify-center border-2 rounded-lg transition-all duration-200 group overflow-hidden",
                      getSpotColor(spot, spot.status),
                    )}
                  >
                    <span className="text-xs font-bold mb-1">{`${spot.code}${spot.number}`}</span>
                    {spot.hasElectricalTerminal && (
                      <Zap className="h-4 w-4 absolute top-1 right-1 opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                    {spot.status === "reserved" && (
                      <Clock className="h-4 w-4" />
                    )}
                    {spot.status === "occupied" && (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {spot.status === "available" &&
                      !spot.hasElectricalTerminal && (
                        <Car className="h-4 w-4 opacity-20" />
                      )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm font-medium">
                    Place {`${spot.code}${spot.number}`}{" "}
                    {spot.hasElectricalTerminal && "(Électrique)"}
                    <br />
                    <span className="text-xs font-normal text-muted-foreground capitalize">
                      État: {getStatusLabel(spot.status)}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
        </div>
      </TooltipProvider>

      <div className="mt-8 flex flex-wrap gap-4 justify-center items-center text-sm border-t pt-6 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-50 border-2 border-slate-200 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-50 border-2 border-emerald-100 rounded"></div>
          <span>Électrique</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-200 rounded"></div>
          <span>Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded"></div>
          <span>Occupé</span>
        </div>
      </div>
    </div>
  );
}
