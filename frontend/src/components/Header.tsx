import { useState } from "react";
import { GraduationCap, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import LoginDialog from "./LoginDialog";

interface HeaderProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({ isLoggedIn, onLogin, onLogout }: HeaderProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleLogin = () => {
    onLogin();
    setIsLoginDialogOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl">UQAR - Ressources Académiques</h1>
              <p className="text-blue-100 text-sm">Partageons le savoir, développons l'avenir 🌍</p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button
                onClick={onLogout}
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-md"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Déconnexion
              </Button>
            ) : (
              <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-md">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Connexion Admin</span>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <LoginDialog onLogin={handleLogin} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
