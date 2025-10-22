import { useParams,useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function DetailCours() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Simulation d'un cours — à remplacer plus tard par une vraie requête GraphQL
  const cours = {
    titre: "Introduction à la gestion de projet",
    description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet cum corporis, dignissimos quidem perspiciatis, tempore possimus natus excepturi fuga repellendus dolores qui fugiat mollitia, illum repudiandae placeat nihil voluptatibus eaque.",
    contenu: [

    ],
    fichier: "/fichiers/INF33307_NotesCours.pdf", // chemin du fichier (local ou serveur)
  };


  return (
    <div className="detail-container">
        {/* Flèche retour */}
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Retour
      </button>
      <h1>{cours.titre}</h1>
      <p className="cours-description">{cours.description}</p>


      <div className="cours-sections">
        <h2>Contenu du cours</h2>
        <ul>
          {cours.contenu.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Bouton de téléchargement */}
      <button className="btn-download" >
        Télécharger le cours
      </button>
    </div>
  );
}
