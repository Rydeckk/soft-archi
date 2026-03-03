import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import type { Role, User } from '@/lib/auth';
import { useReservations } from '@/lib/reservations';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { ParkingMap } from '@/components/ParkingMap';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Users, 
  Map as MapIcon, 
  CalendarDays, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon,
  XCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminPage() {
  const { users, createUser, updateUser, deleteUser } = useAuth();
  const { reservations, cancelReservation } = useReservations();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // User Form State
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'EMPLOYEE' as Role });

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'EMPLOYEE' });
    setIsUserDialogOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      createUser(formData);
    }
    setIsUserDialogOpen(false);
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Inconnu';
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">
          Gérez les utilisateurs, visualisez l'occupation du parking et modifiez les réservations.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
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
                      <Badge variant={u.role === 'MANAGER' ? 'default' : u.role === 'SECRETARY' ? 'secondary' : 'outline'}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditUser(u)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteUser(u.id)}>
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
            <h2 className="text-xl font-semibold">État du Parking par Date</h2>
            <div className="flex items-center gap-2">
              <Label htmlFor="date-picker">Date :</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
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

          <ParkingMap date={selectedDate} />
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <h2 className="text-xl font-semibold">Toutes les Réservations Actives</h2>
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
                {reservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Aucune réservation trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">{getUserName(res.userId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {res.spotId}
                          </Badge>
                          {res.isElectric && <Zap className="h-3 w-3 text-emerald-500 fill-emerald-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(res.from, "dd/MM/yyyy")} - {format(res.to, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={res.status === 'CHECKED_IN' ? 'default' : 'secondary'}>
                          {res.status === 'CHECKED_IN' ? 'Confirmé' : 'En attente'}
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
      </Tabs>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle>
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Ex: Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                placeholder="jean.dupont@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value as Role })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employé</SelectItem>
                  <SelectItem value="SECRETARY">Secrétaire</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveUser}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
