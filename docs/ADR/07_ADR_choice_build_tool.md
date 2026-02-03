# Choix de l'outil de build frontend

## Status
Accepté

## Context
Pour le développement et le build de notre application frontend React, nous devons choisir un outil qui offre
une bonne expérience développeur avec un rechargement rapide et une compilation optimisée pour la production.

## Alternative
Les principales alternatives étaient Webpack, l'outil historique le plus utilisé offrant une grande flexibilité,
mais nécessitant une configuration importante, Create React App qui abstrait webpack mais est moins flexible,
et Parcel qui propose une approche zero-config, mais avec moins de contrôle sur la configuration.

## Decision
Nous avons choisi d'utiliser **Vite**.
Cette décision est portée par le fait que l'équipe maîtrise déjà Vite et apprécie sa vitesse de démarrage
quasi-instantanée grâce à l'utilisation des modules ES natifs en développement. De plus, Vite offre un Hot
Module Replacement extrêmement rapide et une configuration simple tout en restant extensible via des plugins.

## Consequences
Ce choix nous permet de bénéficier d'une expérience de développement fluide avec des temps de rafraîchissement
quasi-instantanés, ce qui améliore significativement la productivité. Le build de production utilise Rollup pour
générer des bundles optimisés.
En revanche, certaines bibliothèques anciennes non compatibles avec les modules ES peuvent nécessiter des
configurations supplémentaires, bien que ce cas devienne de plus en plus rare avec la modernisation de l'écosystème.