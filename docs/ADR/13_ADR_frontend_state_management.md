# Gestion de l'état frontend : Context API

## Status
Accepté

## Context
Le frontend React nécessite un mécanisme de gestion d'état partagé entre composants : session utilisateur, liste des réservations, check-ins et liste des utilisateurs. Ces données doivent être accessibles depuis plusieurs pages sans prop drilling.

Les alternatives envisagées étaient :

1. **Context API (React natif)** : mécanisme intégré à React, sans dépendance externe.
2. **Redux Toolkit** : bibliothèque de gestion d'état globale avec un store centralisé, actions et reducers.
3. **Zustand** : bibliothèque légère avec une API minimaliste basée sur des hooks.
4. **TanStack Query** : bibliothèque orientée synchronisation des données serveur avec cache automatique.

## Decision
Nous avons choisi la **Context API native de React**, organisée en deux contextes distincts :

- `AuthContext` : session utilisateur, liste des utilisateurs, login/logout, CRUD utilisateurs.
- `ReservationsContext` : réservations, check-ins, données enrichies (parkingCode, statut, etc.).

Ces contextes sont exposés via des hooks personnalisés `useAuth()` et `useReservations()`.

## Consequences

**Avantages :**

- **Zéro dépendance externe** : pas de bibliothèque tierce à maintenir ou mettre à jour.
- **Simplicité** : la surface de données partagées est limitée (deux entités principales), ce qui ne justifie pas la complexité de Redux.
- **Cohérence avec React moderne** : l'API Context est le pattern recommandé par React pour les applications de taille modeste.
- **Facilité de test** : les contextes peuvent être mockés simplement dans les tests unitaires.

**Inconvénients :**

- **Re-renders potentiels** : une mise à jour dans un Context déclenche un re-render de tous les composants consommateurs, même si seule une partie des données a changé. À l'échelle actuelle, cet impact est négligeable.
- **Pas de devtools dédiés** : contrairement à Redux DevTools, le débogage d'un Context require davantage de `console.log` manuels.
- **Scalabilité limitée** : si l'application devait gérer des dizaines d'entités différentes avec des règles de cache complexes, TanStack Query ou Redux Toolkit seraient plus adaptés.
