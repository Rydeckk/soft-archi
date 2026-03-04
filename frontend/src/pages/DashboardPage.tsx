import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  XCircle,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import QRCode from "react-qr-code";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { HoverEffect } from "@/components/aceternity/HoverEffect";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReservations } from "@/hooks/useReservations";
import type { EnrichedReservation } from "@/contexts/ReservationsContext";
import type { Parking } from "@/lib/types/api/Parking";

function CheckInDialog({
  reservation,
  onCheckIn,
}: {
  reservation: EnrichedReservation;
  onCheckIn: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkInUrl = `${window.location.origin}/check-in/${reservation.parkingCode}`;

  const handleCheckIn = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    await onCheckIn();
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex items-center gap-1.5 text-[10px] text-primary font-medium px-1 hover:underline"
      >
        <QrCode className="h-3 w-3" />
        Voir le QR code / Check-in
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Check-in — Place {reservation.parkingCode}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-2">
            <div className="bg-white p-4 rounded-xl border">
              <QRCode value={checkInUrl} size={160} />
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Scannez ce code sur place, ou cliquez sur le bouton ci-dessous
              pour confirmer votre présence.
            </p>

            <Button
              className="w-full gap-2"
              onClick={handleCheckIn}
              disabled={loading}
            >
              <CheckCircle2 className="h-4 w-4" />
              {loading ? "Enregistrement..." : "Enregistrer ma présence"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { reservations, addReservation, cancelReservation, checkIn } =
    useReservations();
  const [selectedSpot, setSelectedSpot] = useState<Parking | null>(null);
  const [showOnlyElectric, setShowOnlyElectric] = useState(false);
  const [mapRefresh, setMapRefresh] = useState(0);
  const navigate = useNavigate();

  const handleReservation = async (data: {
    parkingId: string;
    dateRange: { from: Date; to: Date };
  }) => {
    await addReservation(data.parkingId, data.dateRange.from, data.dateRange.to);
    setSelectedSpot(null);
    setMapRefresh((n) => n + 1);
  };

  const handleCancel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await cancelReservation(id);
    setMapRefresh((n) => n + 1);
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
                refreshTrigger={mapRefresh}
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
                  const isToday =
                    isSameDay(res.startDate, today) ||
                    (res.startDate <= today && res.endDate >= today);
                  return (
                    <div
                      key={res.id}
                      className="flex flex-col gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center h-12 w-12 rounded bg-primary/10 text-primary shrink-0">
                          <span className="text-lg font-bold">
                            {res.parkingCode}
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
                              {format(res.startDate, "dd MMM", { locale: fr })}{" "}
                              -{" "}
                              {format(res.endDate, "dd MMM", { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>Rangée {res.parkingCode[0]}</span>
                          </div>
                        </div>
                      </div>

                      {isToday && res.status === "PENDING" && (
                        <>
                          <div className="flex items-center gap-1.5 text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                            <Clock className="h-3 w-3" />
                            Check-in requis avant 11h00
                          </div>
                          <CheckInDialog
                            reservation={res}
                            onCheckIn={async () => {
                              await checkIn(res.id);
                              setMapRefresh((n) => n + 1);
                            }}
                          />
                        </>
                      )}

                      <button
                        onClick={(e) => handleCancel(e, res.id)}
                        className="flex items-center gap-1 text-[10px] text-destructive/70 hover:text-destructive transition-colors"
                      >
                        <XCircle className="h-3 w-3" />
                        Annuler la réservation
                      </button>
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
