Feature: Recherche de contenus pédagogiques 

  Tests pour la recherche par mots-clés 

  

  Scenario : Recherche avec résultats pertinents 

    Given L'étudiant est connecté sur la plateforme 

    And Des contenus existent dans la base de données 

    When L'étudiant saisit un ou plusieurs mots-clés dans le moteur de recherche 

    Then Seuls les contenus pertinents sont affichés 

    And Chaque résultat montre titre, description et mots clés 

  

  Scenario : Recherche sans résultat 

    Given L'étudiant est connecté sur la plateforme 

    And Aucun contenu ne correspond aux mots-clés saisis 

    When L'étudiant effectue la recherche 

    Then Le message "Aucun contenu trouvé" s'affiche 