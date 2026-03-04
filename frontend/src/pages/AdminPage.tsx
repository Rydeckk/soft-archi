import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ParkingMap } from "@/components/ParkingMap";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Users,
  Map as MapIcon,
  CalendarDays,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  XCircle,
  Zap,
  MapPin,
  Printer,
  QrCode,
} from "lucide-react";
import QRCode from "react-qr-code";
import { cn } from "@/utils/utils";
import { useAuth } from "@/hooks/useAuth";
import { useReservations } from "@/hooks/useReservations";
import type { CreateUser, User } from "@/lib/types/api/User";
import { USER_ROLE, type UserRole } from "@/lib/enums/UserRole";
import type { Parking } from "@/lib/types/api/Parking";
import { ParkingService } from "@/services/parking/ParkingService";
import { startOfDay, endOfDay, isBefore, isAfter } from "date-fns";

export function AdminPage() {
  const { users, createUser, deleteUser } = useAuth();
  const { allReservations, cancelReservation, updateReservation } = useReservations();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [parkingRefresh, setParkingRefresh] = useState(0);
  const [allParkings, setAllParkings] = useState<Parking[]>([]);

  const parkingService = useMemo(() => new ParkingService(), []);
  useEffect(() => {
    parkingService.findAll().then(setAllParkings);
  }, [parkingService]);

  // User dialog
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<CreateUser, "password">>({
    name: "",
    email: "",
    role: USER_ROLE.EMPLOYEE,
  });

  // Spot dialog
  const [selectedSpot, setSelectedSpot] = useState<Parking | null>(null);
  const [newParkingId, setNewParkingId] = useState<string>("");

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "EMPLOYEE" });
    setIsUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    await createUser({ ...formData, password: formData.email });
    setIsUserDialogOpen(false);
  };

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Inconnu";
  };

  // Find reservation for the selected spot on the selected date
  const spotReservation = selectedSpot
    ? allReservations.find(
        (r) =>
          r.parkingCode === `${selectedSpot.code}${selectedSpot.number}` &&
          !isAfter(new Date(r.startDate), endOfDay(selectedDate)) &&
          !isBefore(new Date(r.endDate), startOfDay(selectedDate)),
      )
    : undefined;

  const handleSpotSelect = (spot: Parking) => {
    setSelectedSpot(spot);
    setNewParkingId(spot.id);
  };

  const handleCancelSpotReservation = async () => {
    if (!spotReservation) return;
    await cancelReservation(spotReservation.id);
    setSelectedSpot(null);
    setParkingRefresh((n) => n + 1);
  };

  const handleUpdateSpotReservation = async () => {
    if (!spotReservation || !newParkingId) return;
    await updateReservation(spotReservation.id, newParkingId);
    setSelectedSpot(null);
    setParkingRefresh((n) => n + 1);
  };

  // Reservations shown in the tab = active ones only (endDate >= today)
  const activeReservations = allReservations.filter(
    (r) => !isBefore(r.endDate, startOfDay(new Date())),
  );

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">
          Gérez les utilisateurs, visualisez l'occupation du parking et modifiez
          les réservations.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-[800px]">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="parking" className="flex items-center gap-2">
            <MapIcon className="h-4 w-4" />
            Vue Parking
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Réservations
          </TabsTrigger>
          <TabsTrigger value="qrcodes" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Codes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Liste des Employés</h2>
            <Button onClick={handleOpenAddUser} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          </div>

          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.role === "MANAGER"
                            ? "default"
                            : u.role === "SECRETARY"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteUser(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="parking" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                État du Parking par Date
              </h2>
              <p className="text-sm text-muted-foreground">
                Cliquez sur une place pour voir et gérer sa réservation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="date-picker">Date :</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: fr })
                    ) : (
                      <span>Choisir une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <ParkingMap
            date={selectedDate}
            onSpotSelect={handleSpotSelect}
            refreshTrigger={parkingRefresh}
          />
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <h2 className="text-xl font-semibold">Réservations Actives</h2>
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeReservations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Aucune réservation trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeReservations.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">
                        {getUserName(res.userId)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {res.parkingCode}
                          </Badge>
                          {res.isElectric && (
                            <Zap className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(res.startDate, "dd/MM/yyyy")} -{" "}
                        {format(res.endDate, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            res.status === "CHECKED_IN"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {res.status === "CHECKED_IN"
                            ? "Confirmé"
                            : "En attente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive gap-2"
                          onClick={() => cancelReservation(res.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          Annuler
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="qrcodes" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">QR Codes des Places</h2>
              <p className="text-sm text-muted-foreground">
                Imprimez ces codes et placez-les sur chaque place de parking.
              </p>
            </div>
            <Button
              onClick={() => window.print()}
              className="gap-2 print:hidden"
              variant="outline"
            >
              <Printer className="h-4 w-4" />
              Imprimer tout
            </Button>
          </div>

          <style>{`
            @media print {
              body > *:not(#qr-print-area) { display: none !important; }
              #qr-print-area { display: block !important; }
              .print\\:hidden { display: none !important; }
            }
          `}</style>

          <div
            id="qr-print-area"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"
          >
            {(["A", "B", "C", "D", "E", "F"] as const).flatMap((code) =>
              Array.from({ length: 10 }, (_, i) => {
                const number = String(i + 1).padStart(2, "0");
                const spotId = `${code}${number}`;
                const isElectric = code === "A" || code === "F";
                const url = `${window.location.origin}/check-in/${spotId}`;
                return (
                  <div
                    key={spotId}
                    className="flex flex-col items-center gap-2 border rounded-lg p-3 bg-white"
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm">{spotId}</span>
                      {isElectric && (
                        <Zap className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                      )}
                    </div>
                    <QRCode value={url} size={80} />
                    <span className="text-[10px] text-muted-foreground text-center break-all">
                      check-in/{spotId}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Modifier" : "Ajouter"} un utilisateur
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'employé ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="jean.dupont@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={USER_ROLE.EMPLOYEE}>Employé</SelectItem>
                  <SelectItem value={USER_ROLE.SECRETARY}>
                    Secrétaire
                  </SelectItem>
                  <SelectItem value={USER_ROLE.MANAGER}>Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveUser}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spot Reservation Dialog */}
      <Dialog
        open={!!selectedSpot}
        onOpenChange={(open) => !open && setSelectedSpot(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Place{" "}
              {selectedSpot
                ? `${selectedSpot.code}${selectedSpot.number}`
                : ""}
              {selectedSpot?.hasElectricalTerminal && (
                <Zap className="h-4 w-4 text-emerald-500 fill-emerald-500" />
              )}
            </DialogTitle>
            <DialogDescription>
              {format(selectedDate, "EEEE dd MMMM yyyy", { locale: fr })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {spotReservation ? (
              <>
                <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Réservée par</span>
                    <span className="text-sm">
                      {getUserName(spotReservation.userId)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Période</span>
                    <span className="text-sm">
                      {format(spotReservation.startDate, "dd/MM/yyyy")} →{" "}
                      {format(spotReservation.endDate, "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Statut</span>
                    <Badge
                      variant={
                        spotReservation.status === "CHECKED_IN"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {spotReservation.status === "CHECKED_IN"
                        ? "Confirmé"
                        : "En attente"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Changer de place</Label>
                  <Select
                    value={newParkingId}
                    onValueChange={setNewParkingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une place" />
                    </SelectTrigger>
                    <SelectContent>
                      {allParkings.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.code}{p.number}
                          {p.hasElectricalTerminal ? " ⚡" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  Aucune réservation pour cette place à cette date.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {spotReservation && (
              <Button
                variant="destructive"
                className="gap-2 sm:mr-auto"
                onClick={handleCancelSpotReservation}
              >
                <XCircle className="h-4 w-4" />
                Annuler la réservation
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedSpot(null)}>
              Fermer
            </Button>
            {spotReservation && (
              <Button
                onClick={handleUpdateSpotReservation}
                disabled={newParkingId === spotReservation.parkingId}
              >
                Enregistrer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
