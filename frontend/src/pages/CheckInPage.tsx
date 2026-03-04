import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { useReservations } from "@/hooks/useReservations";

export function CheckInPage() {
  const { spotId } = useParams<{ spotId: string }>();
  const { getReservationBySpot, checkIn } = useReservations();

  const reservation = spotId ? getReservationBySpot(spotId) : undefined;

  const handleCheckIn = () => {
    if (reservation) {
      checkIn(reservation.id);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Retour au tableau de bord
        </Link>

        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check-in Place {spotId}</CardTitle>
            <CardDescription>
              Confirmation de votre présence sur place
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!reservation ? (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-destructive">
                    Aucune réservation trouvée
                  </p>
                  <p className="text-destructive/80 mt-1">
                    Vous n'avez pas de réservation active pour la place {spotId}{" "}
                    aujourd'hui.
                  </p>
                </div>
              </div>
            ) : reservation.status === "CHECKED_IN" ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl flex flex-col items-center gap-4 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center rounded-full animate-bounce">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    Check-in réussi !
                  </p>
                  <p className="text-emerald-600/80 dark:text-emerald-400/80 text-sm">
                    Votre présence est confirmée. Bon stationnement !
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sparkles className="h-4 w-4" />
                  Place {spotId} verrouillée
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium">
                      Détails de la réservation
                    </span>
                    <Badge>Active</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(reservation.from, "EEEE dd MMMM", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Place {reservation.spotId} - Rangée{" "}
                        {reservation.spotId[0]}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full py-6 text-lg gap-2 shadow-lg"
                  onClick={handleCheckIn}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Confirmer ma présence
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t pt-6">
            {!reservation && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Réserver cette place</Link>
              </Button>
            )}
            <p className="text-[10px] text-center text-muted-foreground">
              Le check-in doit être effectué avant 11h00. Passé ce délai, la
              place est remise en disponibilité pour la journée.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
