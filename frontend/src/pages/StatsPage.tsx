import { useReservations } from "@/lib/reservations";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReChartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { subDays, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export function StatsPage() {
  const { history, reservations } = useReservations();
  const allData = [...history, ...reservations];

  // 1. Occupation sur les 7 derniers jours
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
  const occupationData = last7Days.map(day => {
    const dayReservations = allData.filter(r => isSameDay(r.from, day));
    const confirmed = dayReservations.filter(r => 
      r.status === 'CHECKED_IN' || r.status === 'COMPLETED'
    ).length;
    const pending = dayReservations.filter(r => r.status === 'PENDING').length;
    const expired = dayReservations.filter(r => r.status === 'EXPIRED').length;

    return {
      name: format(day, 'EEE dd', { locale: fr }),
      occupée: confirmed,
      en_attente: pending,
      expirée: expired,
    };
  });

  // 2. Répartition Électrique vs Standard
  const electricUsage = allData.filter(r => r.isElectric && (r.status === 'CHECKED_IN' || r.status === 'COMPLETED')).length;
  const standardUsage = allData.filter(r => !r.isElectric && (r.status === 'CHECKED_IN' || r.status === 'COMPLETED')).length;

  const pieData = [
    { name: 'Électrique', value: electricUsage },
    { name: 'Standard', value: standardUsage },
  ];
  const COLORS = ['#10b981', '#3b82f6'];

  // 3. Taux de No-Show
  const totalPlanned = allData.filter(r => 
    r.status === 'CHECKED_IN' || r.status === 'COMPLETED' || r.status === 'EXPIRED'
  ).length;
  const expiredCount = allData.filter(r => r.status === 'EXPIRED').length;
  const noShowRate = totalPlanned > 0 ? Math.round((expiredCount / totalPlanned) * 100) : 0;

  // 4. KPIs
  const totalReservations = allData.length;
  const currentMonthOccupancy = Math.round((allData.filter(r => 
    (r.status === 'CHECKED_IN' || r.status === 'COMPLETED') && 
    r.from.getMonth() === new Date().getMonth()
  ).length / (60 * 30)) * 100); // Approximation mois de 30 jours, 60 places

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Manager</h1>
        <p className="text-muted-foreground">Analyse des performances et de l'utilisation du parking.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Réservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReservations}</div>
            <p className="text-xs text-muted-foreground">(Toutes périodes confondues)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de No-Show</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{noShowRate}%</div>
            <p className="text-xs text-muted-foreground">Réservations expirées non confirmées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupation estimée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthOccupancy || 0}%</div>
            <p className="text-xs text-muted-foreground">Sur le mois en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Bornes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{electricUsage}</div>
            <p className="text-xs text-muted-foreground">Utilisations des places A/F</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Activités des 7 derniers jours</CardTitle>
            <CardDescription>
              Nombre de places occupées, expirées et en attente.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ReChartsTooltip />
                  <Legend />
                  <Bar dataKey="occupée" stackId="a" fill="#10b981" name="Confirmée" />
                  <Bar dataKey="en_attente" stackId="a" fill="#f59e0b" name="En attente" />
                  <Bar dataKey="expirée" stackId="a" fill="#ef4444" name="Expirée" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Répartition des Véhicules</CardTitle>
            <CardDescription>
              Proportion d'utilisation des bornes électriques.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReChartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Les places électriques (A et F) représentent {(electricUsage + standardUsage) > 0 ? Math.round((electricUsage / (electricUsage + standardUsage)) * 100) : 0}% de l'occupation totale.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
