import { useReservations } from '@/lib/reservations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Zap, MapPin, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function HistoryPage() {
  const { history, reservations } = useReservations();

  // Combine active and past for a full view, or just past
  const allHistory = [...history].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Terminé</Badge>;
      case 'EXPIRED':
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><Clock className="h-3 w-3 mr-1" /> Expiré</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200"><XCircle className="h-3 w-3 mr-1" /> Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
        <p className="text-muted-foreground">
          Consultez l'historique de vos réservations passées et présentes.
        </p>
      </div>

      <div className="grid gap-4">
        {reservations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Réservations en cours
            </h2>
            {reservations.map(res => (
              <Card key={res.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {res.spotId}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Place {res.spotId}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(res.from, "dd MMM", { locale: fr })} - {format(res.to, "dd MMM", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {res.isElectric && <Zap className="h-4 w-4 text-emerald-500 fill-emerald-500" />}
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            Archives
          </h2>
          {allHistory.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>Aucun historique disponible pour le moment.</p>
              </CardContent>
            </Card>
          ) : (
            allHistory.map(res => (
              <Card key={res.id} className="opacity-80">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center font-bold text-muted-foreground">
                      {res.spotId}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Place {res.spotId}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(res.from, "dd MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(res.status)}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-2 w-2" /> Rangée {res.spotId[0]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
