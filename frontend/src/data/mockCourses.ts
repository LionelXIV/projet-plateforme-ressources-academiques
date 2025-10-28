import { Course } from "../types";

export const mockCourses: Course[] = [
  {
    id: 1,
    title: "Développement Web Complet 2025",
    description: "Apprenez HTML, CSS, JavaScript, React et Node.js de zéro à expert",
    fullDescription: "Ce cours complet vous guidera à travers tous les aspects du développement web moderne. Vous commencerez par les fondamentaux HTML et CSS, puis progresserez vers JavaScript, React et Node.js. À la fin de ce cours, vous serez capable de créer des applications web complètes, du frontend au backend. Nous couvrirons également les bonnes pratiques, les tests, le déploiement et l'optimisation des performances.",
    instructor: "Marie Dupont",
    category: "Développement",
    level: "Débutant",
    students: 1250,
    image: "https://images.unsplash.com/photo-1565229284535-2cbbe3049123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGluZ3xlbnwxfHx8fDE3NjE1MTUzNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    publishedAt: "Il y a 2 heures",
    documents: [
      { id: 1, name: "Guide de démarrage.pdf", type: "PDF", size: "2.5 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 2, name: "Code source - Projet 1.zip", type: "ZIP", size: "15.3 MB", url: "https://example.com/code.zip" },
      { id: 3, name: "Cheat Sheet HTML-CSS.pdf", type: "PDF", size: "1.2 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 4, name: "Diagramme architecture.png", type: "Image", size: "0.5 MB", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800" },
      { id: 5, name: "Ressources complémentaires.pdf", type: "PDF", size: "3.8 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
    ]
  },
  {
    id: 2,
    title: "Marketing Digital Avancé",
    description: "Maîtrisez les stratégies de marketing digital, SEO, publicité en ligne et analytics",
    fullDescription: "Plongez dans le monde du marketing digital avec ce cours avancé qui couvre toutes les facettes de la promotion en ligne. Apprenez à créer des campagnes publicitaires efficaces sur Google Ads et les réseaux sociaux, optimisez votre présence SEO, et maîtrisez l'art de l'analyse de données pour prendre des décisions éclairées. Ce cours inclut des études de cas réels et des exercices pratiques.",
    instructor: "Jean Martin",
    category: "Marketing",
    level: "Intermédiaire",
    students: 890,
    image: "https://images.unsplash.com/photo-1571677246347-5040036b95cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBkaWdpdGFsfGVufDF8fHx8MTc2MTUyNzkzNXww&ixlib=rb-4.1.0&q=80&w=1080",
    publishedAt: "Il y a 5 heures",
    documents: [
      { id: 1, name: "Stratégie Marketing 2025.pdf", type: "PDF", size: "4.2 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 2, name: "Templates de campagnes.zip", type: "ZIP", size: "8.7 MB", url: "https://example.com/templates.zip" },
      { id: 3, name: "Guide SEO complet.pdf", type: "PDF", size: "5.1 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
    ]
  },
  {
    id: 3,
    title: "Design UI/UX avec Figma",
    description: "Créez des interfaces utilisateur modernes et des expériences exceptionnelles",
    fullDescription: "Maîtrisez l'art du design d'interfaces et d'expériences utilisateur avec Figma, l'outil de design collaboratif le plus populaire. Ce cours vous enseignera les principes fondamentaux du design UI/UX, de la recherche utilisateur à la création de prototypes interactifs. Vous apprendrez à créer des systèmes de design cohérents et à collaborer efficacement avec les développeurs.",
    instructor: "Sophie Bernard",
    category: "Design",
    level: "Débutant",
    students: 2100,
    image: "https://images.unsplash.com/photo-1664520132859-727fc515fc8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjcmVhdGl2ZXxlbnwxfHx8fDE3NjE1MDA5NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    publishedAt: "Il y a 1 jour",
    documents: [
      { id: 1, name: "Principes de design.pdf", type: "PDF", size: "3.6 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 2, name: "Fichiers Figma - Templates.fig", type: "FIG", size: "12.4 MB", url: "https://example.com/template.fig" },
      { id: 3, name: "Palette de couleurs.pdf", type: "PDF", size: "0.8 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 4, name: "Iconographie.zip", type: "ZIP", size: "25.1 MB", url: "https://example.com/icons.zip" }
    ]
  },
  {
    id: 4,
    title: "Management d'Équipe",
    description: "Développez vos compétences en leadership et gestion d'équipe",
    fullDescription: "Transformez-vous en un leader efficace grâce à ce cours complet sur le management d'équipe. Apprenez à motiver vos collaborateurs, gérer les conflits, déléguer efficacement et créer une culture d'équipe positive. Ce cours combine théorie du management moderne et cas pratiques tirés d'expériences réelles en entreprise.",
    instructor: "Pierre Dubois",
    category: "Business",
    level: "Avancé",
    students: 650,
    image: "https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzYxNTQzODMxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    publishedAt: "Il y a 2 jours",
    documents: [
      { id: 1, name: "Guide du leader.pdf", type: "PDF", size: "6.3 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 2, name: "Études de cas.pdf", type: "PDF", size: "4.9 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 3, name: "Templates de réunions.docx", type: "DOCX", size: "1.5 MB", url: "https://example.com/template.docx" }
    ]
  },
  {
    id: 5,
    title: "Anglais pour les Affaires",
    description: "Perfectionnez votre anglais professionnel et communication en entreprise",
    fullDescription: "Améliorez votre anglais professionnel pour exceller dans le monde des affaires international. Ce cours couvre le vocabulaire business essentiel, la rédaction d'emails professionnels, les présentations, les négociations et la communication interculturelle. Avec des exercices pratiques et des simulations de situations réelles.",
    instructor: "Emma Wilson",
    category: "Langues",
    level: "Intermédiaire",
    students: 1500,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2MTUyNDI1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    publishedAt: "Il y a 3 jours",
    documents: [
      { id: 1, name: "Vocabulaire Business.pdf", type: "PDF", size: "2.1 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 2, name: "Exercices audio.zip", type: "ZIP", size: "45.6 MB", url: "https://example.com/audio.zip" },
      { id: 3, name: "Templates emails.pdf", type: "PDF", size: "1.8 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
    ]
  },
  {
    id: 6,
    title: "Formation E-learning Complète",
    description: "Créez et vendez vos propres formations en ligne avec succès",
    fullDescription: "Découvrez comment créer, lancer et monétiser vos propres formations en ligne. Ce cours vous guide à travers toutes les étapes : de la conception pédagogique à la promotion, en passant par la création de contenu vidéo et l'utilisation des plateformes de formation. Parfait pour les experts qui veulent partager leur savoir.",
    instructor: "Lucas Petit",
    category: "Business",
    level: "Débutant",
    students: 980,
    image: "https://images.unsplash.com/photo-1588912914078-2fe5224fd8b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBjb3Vyc2UlMjBlZHVjYXRpb258ZW58MXx8fHwxNzYxNjE2NDIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    publishedAt: "Il y a 1 semaine",
    documents: [
      { id: 1, name: "Plan de cours type.pdf", type: "PDF", size: "2.7 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 2, name: "Checklist de lancement.pdf", type: "PDF", size: "0.9 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 3, name: "Scripts vidéo templates.docx", type: "DOCX", size: "2.2 MB", url: "https://example.com/scripts.docx" },
      { id: 4, name: "Stratégie marketing.pdf", type: "PDF", size: "3.4 MB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
    ]
  }
];
