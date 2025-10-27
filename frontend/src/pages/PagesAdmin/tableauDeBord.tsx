import "../../index.css";

import { Edit, Trash2, PlusCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const contenus = [
    { titre: "Cours INF33307", statut: "Publié", date: "18/10/2025" },
    { titre: "Méthodo Agile", statut: "Brouillon", date: "15/10/2025" },
  ];

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <div className="dashboard-buttons">
          <button
            className="btn-add"
            onClick={() => navigate("/publier")}
          >
            <PlusCircle size={18} />
            Ajouter un contenu
          </button>
        </div>
      </div>

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contenus.map((c, i) => (
            <tr key={i}>
              <td>{c.titre}</td>
              <td
                className={
                  c.statut === "Publié" ? "status-published" : "status-draft"
                }
              >
                {c.statut}
              </td>
              <td>{c.date}</td>
              <td>
                <button className="btn-edit">
                  <Edit size={16} /> Modifier
                </button>
                <button className="btn-delete">
                  <Trash2 size={16} /> Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}