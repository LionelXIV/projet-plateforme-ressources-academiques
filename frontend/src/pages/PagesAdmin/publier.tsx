import "../../index.css";

import { useNavigate } from "react-router-dom";

export default function Publish() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Publier un contenu</h1>
      <form className="form">
        <label>Titre</label>
        <input type="text" placeholder="Ex : Introduction à l’algorithmique" />

        <label>Description</label>
        <textarea placeholder="Brève description du contenu..."></textarea>

        <label>Mots-clés</label>
        <input type="text" placeholder="#UQAR #Informatique #Cours" />

        <label>Fichier</label>
        <input type="file" />

        <div className="form-buttons">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/dashboard")}
          >
            Annuler
          </button>
          <button type="submit" className="btn-publish">
            Publier
          </button>
        </div>
      </form>
    </div>
  );
}