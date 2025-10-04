Feature: Consulter les contenus pédagogiques 

  Tests pour l'affichage et l'accès aux contenus pédagogiques 

  Scenario : Affichage de la liste des contenus 

    Given L'étudiant est connecté sur la plateforme 

    When Il accède à la page "Contenus pédagogiques" 

    Then Il voit une liste de contenus avec titre, description et mots clés 

    And La liste est paginée et triable par date, matière ou type 

  

  Scenario : Ouverture d'un contenu disponible 

    Given Un contenu pédagogique est disponible 

    When L'étudiant clique sur le contenu 

    Then Le contenu s'ouvre en ligne (PDF ou vidéo) 

  

  Scenario : Gestion d'un fichier corrompu ou indisponible 

    Given Un contenu est corrompu ou indisponible 

    When L'étudiant tente de l'ouvrir 

    Then Un message d'erreur clair s'affiche 