import { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Zap, Car, CheckCircle2, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useReservations } from "@/lib/reservations";

export type SpotStatus = 'available' | 'reserved' | 'occupied';

export interface ParkingSpot {
  id: string; // e.g., "A01"
  row: string; // A-F
  number: number; // 1-10
  status: SpotStatus;
  isElectric: boolean;
}

interface ParkingMapProps {
  onSpotSelect?: (spot: ParkingSpot) => void;
  selectedSpotId?: string;
  className?: string;
  date?: Date;
  showOnlyElectric?: boolean;
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1);

export function ParkingMap({ onSpotSelect, selectedSpotId, className, date = new Date(), showOnlyElectric = false }: ParkingMapProps) {
  const { getReservationBySpot } = useReservations();

  const spots = useMemo(() => {
    const allSpots = ROWS.flatMap(row => 
      NUMBERS.map(num => {
        const id = `${row}${num.toString().padStart(2, '0')}`;
        const isElectric = row === 'A' || row === 'F';
        const reservation = getReservationBySpot(id, date);
        
        let status: SpotStatus = 'available';
        if (reservation) {
          status = reservation.status === 'CHECKED_IN' ? 'occupied' : 'reserved';
        }

        return {
          id,
          row,
          number: num,
          status,
          isElectric,
        };
      })
    );

    if (showOnlyElectric) {
      return allSpots.filter(spot => spot.isElectric);
    }
    return allSpots;
  }, [getReservationBySpot, date, showOnlyElectric]);

  const getSpotColor = (spot: ParkingSpot) => {
    if (spot.id === selectedSpotId) return "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2";
    if (spot.status === 'reserved') return "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300 shadow-inner shadow-blue-400/20";
    if (spot.status === 'occupied') return "bg-red-100 border-red-200 text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-300";
    if (spot.isElectric) return "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-400";
    return "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-800";
  };

  const getStatusLabel = (status: SpotStatus) => {
    switch(status) {
      case 'available': return 'Disponible';
      case 'reserved': return 'Réservé';
      case 'occupied': return 'Occupé';
      default: return status;
    }
  }

  return (
    <div className={cn("w-full overflow-x-auto p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border", className)}>
      <TooltipProvider>
        <div className="grid grid-cols-10 gap-2 min-w-[700px]">
          {spots.map((spot) => (
            <Tooltip key={spot.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSpotSelect?.(spot)}
                  className={cn(
                    "relative h-16 w-full flex flex-col items-center justify-center border-2 rounded-lg transition-all duration-200 group overflow-hidden",
                    getSpotColor(spot)
                  )}
                >
                  <span className="text-xs font-bold mb-1">{spot.id}</span>
                  {spot.isElectric && <Zap className="h-4 w-4 absolute top-1 right-1 opacity-40 group-hover:opacity-100 transition-opacity" />}
                  {spot.status === 'reserved' && <Clock className="h-4 w-4" />}
                  {spot.status === 'occupied' && <CheckCircle2 className="h-4 w-4" />}
                  {spot.status === 'available' && !spot.isElectric && <Car className="h-4 w-4 opacity-20" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm font-medium">
                  Place {spot.id} {spot.isElectric && "(Électrique)"}
                  <br />
                  <span className="text-xs font-normal text-muted-foreground capitalize">État: {getStatusLabel(spot.status)}</span>
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
