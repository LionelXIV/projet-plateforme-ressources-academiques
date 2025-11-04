import { useState, React } from "react";
import { ShieldCheck } from "lucide-react";
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface LoginDialogProps {
  onLogin: () => void;
}

export default function LoginDialog({ onLogin }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const base = import.meta.env.VITE_API_URL_LOGIN;
      const resp = await fetch(`${base}auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "Identifiants invalides");
        return;
      }
      if (data.token) {
        localStorage.setItem("jwt_token", data.token);
      }
      onLogin();
    } catch (err) {
      setError("Erreur réseau");
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <DialogTitle>Connexion Administrateur</DialogTitle>
        </div>
        <DialogDescription>
          Connectez-vous pour gérer les cours et ressources
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleLogin} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@uqar.ca"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
                
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Se connecter
        </Button>
      </form>
    </>
  );
}
