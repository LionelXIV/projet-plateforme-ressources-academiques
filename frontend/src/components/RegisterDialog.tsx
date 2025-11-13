import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { registerUser } from "../lib/api";

interface RegisterDialogProps {
  onRegister?: () => void;
}

export default function RegisterDialog({ onRegister }: RegisterDialogProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const close = () => {
    setIsOpen(false);
    if (onRegister) onRegister();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Nom d'utilisateur et mot de passe requis.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSubmitting(true);
    try {
      const resp = await registerUser(username.trim(), password, email.trim() || undefined);
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(body.error || body.detail || "Erreur lors de l'inscription.");
        return;
      }
      setSuccess("Inscription réussie. Connectez-vous.");
      setTimeout(close, 900);
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle>Créer un compte</DialogTitle>
          </div>
          <DialogDescription>Créez un compte simple pour gérer vos cours</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reg-username">Nom d'utilisateur</Label>
            <Input id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email">Email (optionnel)</Label>
            <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password">Mot de passe</Label>
            <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-confirm">Confirmer le mot de passe</Label>
            <Input id="reg-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>

          {error && <div className="bg-red-50 p-3 rounded-lg border border-red-200"><p className="text-sm text-red-800">{error}</p></div>}
          {success && <div className="bg-green-50 p-3 rounded-lg border border-green-200"><p className="text-sm text-green-800">{success}</p></div>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={close} disabled={submitting}>Annuler</Button>
            <Button type="submit" className="flex-1 bg-blue-600 text-white" disabled={submitting}>{submitting ? "En cours..." : "S'inscrire"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}