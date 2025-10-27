import "../index.css";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
        <div className="navbar-left">
            <Link to="/" className="header-logo">
            <img src={logo} alt="Logo de la plateforme" />
            </Link>
        </div>

      <div className="header-actions">
        <input type="text" placeholder="Rechercher un cours..." />
        <button
          className="btn-login"
          onClick={() => navigate("/login")}
        >
          <LogIn size={18} /> Connexion
        </button>
      </div>
    </header>
  );
}

