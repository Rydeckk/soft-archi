import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { BackgroundBeams } from "@/components/aceternity/BackgroundBeams";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate("/");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-950 p-4 overflow-hidden">
      <BackgroundBeams className="opacity-40" />
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-slate-800 bg-slate-900/50 backdrop-blur-sm text-slate-100">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]">
            <Calendar className="text-primary-foreground h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-center text-white">
            Connexion
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Entrez vos identifiants pour accéder à votre espace
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              type="submit"
            >
              Se connecter
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
