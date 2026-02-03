# Choix du gestionnaire de paquets

## Status
Accepté

## Context
Pour gérer les dépendances Node.js de notre projet monorepo (frontend et backend), nous devons choisir un
gestionnaire de paquets performant et fiable.

## Alternative
Les principales alternatives étaient npm, le gestionnaire historique livré avec Node.js qui reste la référence
standard, et yarn, qui a popularisé le fichier lock et les workspaces. Bun était également une option moderne,
mais encore jeune et potentiellement instable pour un projet en production.

## Decision
Nous avons choisi d'utiliser **pnpm**.
Cette décision est portée par le fait que l'équipe a déjà l'habitude d'utiliser pnpm et apprécie sa rapidité
d'installation grâce à son système de liens symboliques qui évite la duplication des dépendances.
De plus, pnpm gère nativement les workspaces pour les monorepos et consomme significativement moins d'espace
disque que npm ou yarn.

## Consequences
Ce choix nous permet de bénéficier d'installations plus rapides et d'une meilleure gestion de l'espace disque,
particulièrement utile sur les machines de développement qui hébergent plusieurs projets.
La compatibilité avec l'écosystème npm est totale.
Cependant, certains outils ou scripts peuvent occasionnellement nécessiter des ajustements pour fonctionner
correctement avec la structure de node_modules spécifique à pnpm, bien que ce cas soit de plus en plus rare.