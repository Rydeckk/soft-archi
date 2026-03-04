import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactECharts from "echarts-for-react";
import {
  subDays,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  format,
  eachDayOfInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ReservationService } from "@/services/reservation/ReservationService";
import { ReservationRegisterService } from "@/services/reservationRegister/ReservationRegisterService";
import { ParkingService } from "@/services/parking/ParkingService";
import type { Reservation } from "@/lib/types/api/Reservation";
import type { ReservationRegister } from "@/lib/types/api/ReservationRegister";
import type { Parking } from "@/lib/types/api/Parking";

const TOTAL_SPOTS = 60;

type Period = "day" | "week" | "month";

function getPeriodDays(period: Period) {
  const today = new Date();
  switch (period) {
    case "day":
      return eachDayOfInterval({ start: today, end: today });
    case "week":
      return eachDayOfInterval({ start: subDays(today, 6), end: today });
    case "month":
      return eachDayOfInterval({ start: subDays(today, 29), end: today });
  }
}

function isInPeriod(date: Date, period: Period): boolean {
  const now = new Date();
  const start = period === "day" ? startOfDay(now) : period === "week" ? startOfDay(subDays(now, 6)) : startOfDay(subDays(now, 29));
  return !isBefore(date, start) && !isAfter(date, endOfDay(now));
}

function reservationOverlapsDay(res: Reservation, day: Date): boolean {
  const start = startOfDay(day);
  const end = endOfDay(day);
  const resStart = new Date(res.startDate);
  const resEnd = new Date(res.endDate);
  return !isAfter(resStart, end) && !isBefore(resEnd, start);
}

export function StatsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [registers, setRegisters] = useState<ReservationRegister[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);

  const reservationService = useMemo(() => new ReservationService(), []);
  const registerService = useMemo(() => new ReservationRegisterService(), []);
  const parkingService = useMemo(() => new ParkingService(), []);

  useEffect(() => {
    Promise.all([
      reservationService.findAll(),
      registerService.findAll(),
      parkingService.findAll(),
    ]).then(([res, reg, park]) => {
      setReservations(res);
      setRegisters(reg);
      setParkings(park);
    });
  }, [reservationService, registerService, parkingService]);

  const days = getPeriodDays(period);

  // --- KPI computations ---

  // 1. Personnes utilisant le parking (unique users with active reservation in period)
  const activeUsersInPeriod = useMemo(() => {
    const userIds = new Set(
      reservations
        .filter((res) => {
          const start = new Date(res.startDate);
          const end = new Date(res.endDate);
          const periodStart = period === "day"
            ? startOfDay(new Date())
            : period === "week"
              ? startOfDay(subDays(new Date(), 6))
              : startOfDay(subDays(new Date(), 29));
          const periodEnd = endOfDay(new Date());
          return !isAfter(start, periodEnd) && !isBefore(end, periodStart);
        })
        .map((r) => r.userId),
    );
    return userIds.size;
  }, [reservations, period]);

  // 2. Taux d'occupation moyen (avg % spots used per day over period)
  const avgOccupancy = useMemo(() => {
    if (days.length === 0) return 0;
    const rates = days.map((day) => {
      const active = reservations.filter((res) => reservationOverlapsDay(res, day)).length;
      return (active / TOTAL_SPOTS) * 100;
    });
    return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
  }, [reservations, days]);

  // 3. No-show proportion (expired reservations without check-in in period)
  const noShowRate = useMemo(() => {
    const periodStart =
      period === "day"
        ? startOfDay(new Date())
        : period === "week"
          ? startOfDay(subDays(new Date(), 6))
          : startOfDay(subDays(new Date(), 29));
    const now = new Date();

    const completed = reservations.filter((res) => {
      const end = new Date(res.endDate);
      return !isAfter(new Date(res.startDate), endOfDay(now)) && !isBefore(end, periodStart);
    });

    if (completed.length === 0) return 0;

    const checkedInIds = new Set(registers.map((r) => r.reservationId));
    const noShows = completed.filter((res) => !checkedInIds.has(res.id));
    return Math.round((noShows.length / completed.length) * 100);
  }, [reservations, registers, period]);

  // 4. Proportion places électriques (electric spots / total)
  const electricProportion = useMemo(() => {
    const electricSpots = parkings.filter((p) => p.hasElectricalTerminal).length;
    return parkings.length > 0
      ? Math.round((electricSpots / parkings.length) * 100)
      : 0;
  }, [parkings]);

  // --- Chart data ---

  // Occupation par jour
  const occupationChartOption = useMemo(() => {
    const labels = days.map((d) =>
      period === "day"
        ? format(d, "HH:mm", { locale: fr })
        : period === "month"
          ? format(d, "dd/MM", { locale: fr })
          : format(d, "EEE dd", { locale: fr }),
    );

    const checkedInData = days.map((day) =>
      reservations.filter((res) => {
        const reg = registers.find((r) => r.reservationId === res.id);
        return reg && reservationOverlapsDay(res, day);
      }).length,
    );

    const pendingData = days.map((day) =>
      reservations.filter((res) => {
        const reg = registers.find((r) => r.reservationId === res.id);
        return !reg && reservationOverlapsDay(res, day) && !isBefore(new Date(res.endDate), startOfDay(day));
      }).length,
    );

    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { data: ["Confirmé", "En attente"], bottom: 0 },
      grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
      xAxis: { type: "category", data: labels },
      yAxis: { type: "value", name: "Places" },
      series: [
        {
          name: "Confirmé",
          type: "bar",
          stack: "total",
          data: checkedInData,
          itemStyle: { color: "#10b981" },
        },
        {
          name: "En attente",
          type: "bar",
          stack: "total",
          data: pendingData,
          itemStyle: { color: "#f59e0b" },
        },
      ],
    };
  }, [days, reservations, registers, period]);

  // No-show donut
  const noShowChartOption = useMemo(() => ({
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } },
        data: [
          { value: noShowRate, name: "No-show", itemStyle: { color: "#ef4444" } },
          { value: 100 - noShowRate, name: "Utilisé", itemStyle: { color: "#10b981" } },
        ],
      },
    ],
  }), [noShowRate]);

  // Electric proportion donut
  const electricChartOption = useMemo(() => {
    const electricSpots = parkings.filter((p) => p.hasElectricalTerminal).length;
    const standardSpots = parkings.length - electricSpots;
    return {
      tooltip: { trigger: "item" },
      series: [
        {
          type: "pie",
          radius: ["50%", "70%"],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } },
          data: [
            { value: electricSpots, name: "Électrique", itemStyle: { color: "#10b981" } },
            { value: standardSpots, name: "Standard", itemStyle: { color: "#3b82f6" } },
          ],
        },
      ],
    };
  }, [parkings]);

  const periods: { label: string; value: Period }[] = [
    { label: "Jour", value: "day" },
    { label: "Semaine", value: "week" },
    { label: "Mois", value: "month" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tableau de bord Manager
          </h1>
          <p className="text-muted-foreground">
            Analyse des performances et de l'utilisation du parking.
          </p>
        </div>
        <div className="flex gap-2">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Personnes utilisant le parking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeUsersInPeriod}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Utilisateurs uniques sur la période
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux d'occupation moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgOccupancy}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Moyenne sur {days.length} jour{days.length > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de no-show
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{noShowRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Réservations sans check-in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Places électriques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {electricProportion}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {parkings.filter((p) => p.hasElectricalTerminal).length} /{" "}
              {parkings.length} places équipées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Occupation du parking</CardTitle>
            <CardDescription>
              Nombre de places réservées par jour sur la période sélectionnée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={occupationChartOption} style={{ height: 320 }} />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>No-shows</CardTitle>
            <CardDescription>
              Proportion de réservations sans check-in effectué.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <ReactECharts option={noShowChartOption} style={{ height: 200, width: "100%" }} />
            <div className="flex gap-6 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                No-show ({noShowRate}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                Utilisé ({100 - noShowRate}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Répartition des places</CardTitle>
          <CardDescription>
            Proportion des places équipées de bornes électriques (rangées A et F).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <ReactECharts option={electricChartOption} style={{ height: 220, width: 220 }} />
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded bg-emerald-500 inline-block shrink-0" />
              <div>
                <div className="font-medium">Places électriques</div>
                <div className="text-muted-foreground">
                  {parkings.filter((p) => p.hasElectricalTerminal).length} places — rangées A et F
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded bg-blue-500 inline-block shrink-0" />
              <div>
                <div className="font-medium">Places standard</div>
                <div className="text-muted-foreground">
                  {parkings.filter((p) => !p.hasElectricalTerminal).length} places — rangées B à E
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
