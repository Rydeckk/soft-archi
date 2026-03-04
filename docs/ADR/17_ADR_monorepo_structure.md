# Structure du projet : monorepo

## Status
Accepté

## Context
Notre système est constitué de trois applications distinctes (backend, frontend, mailer) partageant certains types TypeScript. Nous devons décider de l'organisation des dépôts de code source.

Deux approches principales s'offraient à nous :

1. **Polyrepo** : chaque service dans un dépôt Git distinct (`soft-archi-backend`, `soft-archi-frontend`, `soft-archi-mailer`).
2. **Monorepo** : l'ensemble des services dans un seul dépôt Git avec une structure de répertoires par service.

## Decision
Nous avons choisi la structure **monorepo** avec un répertoire racine unique contenant `backend/`, `frontend/`, `mailer/` et `docs/`.

Les types partagés (modèles d'API, enums) sont organisés dans un répertoire `lib/` accessible depuis le backend et le frontend via des alias de chemin TypeScript.

## Consequences

**Avantages :**

- **Partage de types facilité** : les interfaces TypeScript de l'API (`lib/types/`, `lib/enums/`) sont directement importables depuis le backend et le frontend sans publication de package npm interne.
- **Cohérence de versionnement** : un seul `git commit` peut modifier simultanément le backend et le frontend, garantissant que les changements de contrat API restent synchronisés.
- **Outillage simplifié** : un seul `docker-compose.yml` à la racine orchestre l'ensemble. Les scripts `build.sh`, `run.sh`, `test.sh` opèrent sur tous les services depuis la racine.
- **Revue de code unifiée** : une seule pull request peut couvrir un changement de bout en bout (frontend + backend + tests).
- **Documentation centralisée** : les ADRs et diagrammes C4 dans `docs/` s'appliquent à l'ensemble du système.

**Inconvénients :**

- **Dépendances non partagées** : chaque service gère son propre `node_modules` et `package.json`. Nous n'utilisons pas de workspace manager (pnpm workspaces, Nx, Turborepo) pour mutualiser les dépendances communes, ce qui entraîne une certaine duplication.
- **Isolation des pipelines CI** : sans outil de build incrémental (Nx, Turborepo), le CI doit être configuré manuellement pour ne tester que les services affectés par un changement.
- **Droits d'accès granulaires impossibles** : dans un polyrepo, on peut donner accès à un développeur uniquement au frontend. Dans un monorepo, tout est visible par défaut.
