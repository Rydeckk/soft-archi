import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ParkingMap } from "@/components/ParkingMap";
import { ReservationDialog } from "@/components/ReservationDialog";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  History,
  ShieldCheck,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { HoverEffect } from "@/components/aceternity/HoverEffect";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReservations } from "@/hooks/useReservations";
import type { Parking } from "@/lib/types/api/Parking";

export function DashboardPage() {
  const { user } = useAuth();
  const { reservations, addReservation } = useReservations();
  const [selectedSpot, setSelectedSpot] = useState<Parking | null>(null);
  const [showOnlyElectric, setShowOnlyElectric] = useState(false);
  const navigate = useNavigate();

  const handleReservation = (data: {
    spotId: string;
    dateRange: { from: Date; to: Date };
    isElectric: boolean;
  }) => {
    addReservation({
      spotId: data.spotId,
      from: data.dateRange.from,
      to: data.dateRange.to,
      isElectric: data.isElectric,
    });
    setSelectedSpot(null);
  };

  const today = new Date();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.name}. Gérez vos réservations de parking.
          </p>
        </div>
        <ReservationDialog
          selectedSpot={selectedSpot}
          onReserved={handleReservation}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Plan du Parking</CardTitle>
                <CardDescription>
                  Sélectionnez une place pour réserver
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowOnlyElectric(!showOnlyElectric)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    showOnlyElectric
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <Zap className="h-3 w-3" />
                  Places Électriques
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <ParkingMap
                selectedSpotId={selectedSpot?.id}
                onSpotSelect={(spot) => setSelectedSpot(spot)}
                showOnlyElectric={showOnlyElectric}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mes Réservations</CardTitle>
              <CardDescription>Vos prochains stationnements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reservations.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Aucune réservation active
                  </p>
                </div>
              ) : (
                reservations.map((res) => {
                  const isToday = isSameDay(res.from, today);
                  return (
                    <div
                      key={res.id}
                      className="flex flex-col gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center h-12 w-12 rounded bg-primary/10 text-primary shrink-0">
                          <span className="text-lg font-bold">
                            {res.spotId}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {res.status === "PENDING" && (
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase px-1 border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                              >
                                En attente
                              </Badge>
                            )}
                            {res.status === "CHECKED_IN" && (
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase px-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              >
                                Confirmé
                              </Badge>
                            )}
                            {res.isElectric && (
                              <Zap className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>
                              {format(res.from, "dd MMM", { locale: fr })} -{" "}
                              {format(res.to, "dd MMM", { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>Rangée {res.spotId[0]}</span>
                          </div>
                        </div>
                      </div>

                      {isToday && res.status === "PENDING" && (
                        <div className="flex items-center gap-1.5 text-[10px] text-orange-600 dark:text-orange-400 font-medium px-1">
                          <Clock className="h-3 w-3" />
                          Scanner le QR code sur place avant 11h00
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Rappel Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                N'oubliez pas de scanner le QR Code sur place avant 11h00 pour
                confirmer votre présence, sinon votre place sera remise en
                disponibilité.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-2">Actions rapides</h2>
        <HoverEffect
          items={[
            {
              title: "Historique",
              description:
                "Consultez vos réservations passées et les statistiques de vos stationnements.",
              icon: <History className="h-6 w-6" />,
              onClick: () => navigate("/history"),
            },
            {
              title: "Règles d'Usage",
              description:
                "Rappels sur les limites de durée (5 jours) et le check-in avant 11h.",
              icon: <ShieldCheck className="h-6 w-6" />,
              onClick: () =>
                alert(
                  "Check-in obligatoire avant 11h. Durée max : 5j (Employé) / 30j (Manager).",
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}
