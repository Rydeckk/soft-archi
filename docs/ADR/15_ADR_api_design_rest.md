# Design de l'API : REST

## Status
Accepté

## Context
Le frontend communique avec le backend pour lire et modifier les données (réservations, parkings, utilisateurs, check-ins). Nous devons choisir le style d'API exposé par le backend NestJS.

Les alternatives envisagées étaient :

1. **REST (Representational State Transfer)** : architecture standard basée sur HTTP avec des ressources nommées et des verbes HTTP (GET, POST, PATCH, DELETE).
2. **GraphQL** : langage de requête permettant au client de spécifier exactement les champs qu'il veut récupérer, avec un seul endpoint.
3. **tRPC** : appels de procédures distantes typés de bout en bout, sans schéma intermédiaire, spécifique à l'écosystème TypeScript.

## Decision
Nous avons choisi l'architecture **REST**.

Les ressources sont organisées en routes claires : `/auth`, `/users`, `/parkings`, `/reservations`, `/reservation-register`. L'authentification est portée par un header `Authorization: Bearer <token>`.

## Consequences

**Avantages :**

- **Universalité** : REST est un standard HTTP compris par tous les outils (navigateurs, Postman, cURL, tests E2E), sans client dédié.
- **Compatibilité NestJS** : NestJS est nativement orienté REST avec ses décorateurs `@Get()`, `@Post()`, etc. L'implémentation est directe.
- **Testabilité** : les endpoints REST se testent facilement avec `supertest` en E2E ou `fetch` dans les tests d'intégration.
- **Lisibilité des URLs** : les routes sont auto-documentées par leur structure (`GET /reservations`, `DELETE /reservations/:id`).

**Inconvénients :**

- **Over-fetching potentiel** : certaines réponses incluent plus de données que nécessaire (ex : `findAll` retourne toutes les réservations alors que le frontend n'en affiche qu'une partie). GraphQL aurait résolu ce problème.
- **Multiples round-trips** : pour enrichir les données (ex : joindre le nom d'utilisateur à une réservation), le frontend doit parfois faire plusieurs appels successifs, là où GraphQL permettrait de tout récupérer en une requête.
- **Pas de typage bout-en-bout natif** : contrairement à tRPC, les types de l'API ne sont pas automatiquement partagés avec le frontend. Nous compensons avec un dossier `lib/types/api/` partagé entre les services.
