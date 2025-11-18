import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { getProfile, updateProfile, changePassword, UserProfile } from "../lib/api";
import { ArrowLeft, User as UserIcon, Lock } from "lucide-react";

interface ProfilePageProps {
  onBack: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProfile();
      setProfile(data);
      setEmail(data.email || "");
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const updated = await updateProfile({ email, first_name: firstName, last_name: lastName });
      setProfile(updated);
      setSuccess("Profil mis à jour avec succès");
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour du profil");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmNewPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess("Mot de passe changé avec succès");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setError(err.message || "Erreur lors du changement de mot de passe");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Chargement du profil...</p>
      </div>
    );
  }

  if (!profile && !error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Profil introuvable</CardTitle>
            <CardDescription>Impossible de charger le profil</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack}>Retour</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={onBack} className="mb-6 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Retour aux cours
      </Button>

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <UserIcon className="w-8 h-8 text-blue-600" /> Mon Profil
      </h1>

      {error && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations du profil */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Gérez vos informations de profil</CardDescription>
          </CardHeader>
          <CardContent>
            {!editMode ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Nom d'utilisateur</Label>
                  <p className="font-medium">{profile?.username}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{profile?.email || "Non renseigné"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Prénom</Label>
                  <p className="font-medium">{profile?.first_name || "Non renseigné"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nom</Label>
                  <p className="font-medium">{profile?.last_name || "Non renseigné"}</p>
                </div>
                {profile?.date_joined && (
                  <div>
                    <Label className="text-muted-foreground">Date d'inscription</Label>
                    <p className="font-medium">
                      {new Date(profile.date_joined).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
                {profile?.statistics && (
                  <div>
                    <Label className="text-muted-foreground">Statistiques</Label>
                    <p className="font-medium">
                      {profile.statistics.courses_created} cours créé{profile.statistics.courses_created > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                <Button onClick={() => setEditMode(true)} className="w-full">
                  Modifier le profil
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => {
                    setEditMode(false);
                    setEmail(profile?.email || "");
                    setFirstName(profile?.first_name || "");
                    setLastName(profile?.last_name || "");
                    setError("");
                    setSuccess("");
                  }}>Annuler</Button>
                  <Button type="submit" className="flex-1 bg-blue-600 text-white">Enregistrer</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Changement de mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
            <CardDescription>Mettez à jour votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old_password">Ancien mot de passe</Label>
                <Input
                  id="old_password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_new_password">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirm_new_password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white">Changer le mot de passe</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

