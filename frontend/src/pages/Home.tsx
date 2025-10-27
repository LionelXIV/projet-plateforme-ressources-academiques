import "../index.css";
import { useNavigate } from "react-router-dom";
import { BookOpen, FolderOpen } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const ressources = [
    {
      id: 1,
      titre: "Introduction à la gestion de projet",
      description: "Support de cours pour les étudiants du programme INF33307.",
      tags: ["#UQAR", "#Qualité", "#Scrum"],
    },
    {
      id: 2,
      titre: "Méthodologie Agile",
      description: "Document de référence sur l'agilité en gestion de projet.",
      tags: ["#Agile", "#Scrum", "#Kanban"],
    },
    {
      id: 3,
      titre: "Analyse fonctionnelle",
      description: "Présentation des outils UML pour l’analyse de systèmes.",
      tags: ["#UML", "#Modélisation", "#Analyse"],
    },
  ];

  const categories = [
    { nom: "Développement web", couleur: "#0077b6" },
    { nom: "Gestion de projet", couleur: "#00a896" },
    { nom: "Analyse de systèmes", couleur: "#ffb703" },
    { nom: "Base de données", couleur: "#d62828" },
  ];

  return (
    <div className="home-page">
      {/* Section 1 — Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Partageons le savoir, <br />
            développons l’avenir 🌍
          </h1>
          <p>
            La plateforme de ressources académiques de l’UQAR met à votre disposition
            des supports de cours, guides et projets étudiants. 
            <br />Découvrez, apprenez et contribuez à une communauté d’apprentissage ouverte.
          </p>
        </div>
      </section>


      {/* Section 2 — Catégories */}
      <section className="categories">
        <h2>Explorer par catégorie</h2>
        <div className="category-grid">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="category-card"
              style={{ borderLeft: `6px solid ${cat.couleur}` }}
            >
              <FolderOpen color={cat.couleur} size={28} />
              <span>{cat.nom}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4 — Ressources récentes */}
      <section className="ressources">
        <h2>Ressources récentes</h2>
        <div className="ressource-grid">
          {ressources.map((r) => (
            <div key={r.id} className="ressource-card">
              <BookOpen size={32} color="#0077b6" />
              <h3>{r.titre}</h3>
              <p>{r.description}</p>
              <div className="tags">
                {r.tags.map((tag, i) => (
                  <span key={i}>{tag}</span>
                ))}
              </div>
              <button
                className="btn-details"
                onClick={() => navigate(`/details/${r.id}`)}
              >
                Voir détails
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5 — À propos */}
      <section className="about">
        <h2>À propos</h2>
        <p>
          Cette plateforme a été créée par des étudiants du programme
          d’informatique pour centraliser et faciliter l’accès aux ressources
          académiques. L’objectif : rendre le savoir accessible à tous, en
          encourageant la collaboration et l’apprentissage continu.
        </p>
      </section>

      {/* Section 6 — Footer */}
      <footer className="footer">
        <p>© 2025 Plateforme de Ressources Académiques – UQAR </p>
      </footer>
    </div>
  );
}
