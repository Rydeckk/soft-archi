import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import type { Role } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { BackgroundBeams } from '@/components/aceternity/BackgroundBeams';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('EMPLOYEE');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    navigate('/');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-950 p-4 overflow-hidden">
      <BackgroundBeams className="opacity-40" />
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-slate-800 bg-slate-900/50 backdrop-blur-sm text-slate-100">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]">
            <Calendar className="text-primary-foreground h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-center text-white">Connexion</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Entrez vos identifiants pour accéder à votre espace
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role" className="text-slate-200">Rôle (Simulation)</Label>
              <select 
                id="role"
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="EMPLOYEE">Employé</option>
                <option value="SECRETARY">Secrétaire</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" type="submit">Se connecter</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
