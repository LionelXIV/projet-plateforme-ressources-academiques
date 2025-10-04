Feature: Connexion pour l'admin 

  Tests pour l'accès sécurisé à l'application 

  

  Scenario : Connexion réussie 

    Given Un admin possède un compte valide 

    When Il saisit son courriel et son mot de passe corrects 

    Then Il est redirigé vers son tableau de bord 

  

  Scenario : Connexion échouée après tentatives incorrectes 

    Given Un admin possède un compte valide 

    When Il saisit un mot de passe incorrect trois fois 

    Then Son compte est temporairement bloqué 

    And Un message d'erreur clair est affiché indiquant le blocage 