# Cron job de libération des places : intégré au backend

## Status
Accepté

## Context
La règle métier impose que toute réservation dont le check-in n'est pas effectué avant 11h00 le jour de début soit automatiquement annulée, libérant ainsi la place pour d'autres utilisateurs.

Cette logique planifiée peut être implémentée de plusieurs façons :

1. **Cron intégré au backend** : utilisation du module `@nestjs/schedule` pour exécuter une tâche planifiée directement dans l'application NestJS.
2. **Cron système externe** : une tâche `cron` système (Linux/Docker) qui appelle un endpoint HTTP dédié du backend.
3. **pg_cron** : extension PostgreSQL qui exécute des requêtes SQL planifiées directement en base de données.
4. **Service dédié** : un conteneur séparé dont l'unique responsabilité est d'exécuter les tâches planifiées.

## Decision
Nous avons choisi le **cron job intégré au backend** via `@nestjs/schedule` avec le décorateur `@Cron('0 11 * * *')`.

La tâche `releaseUnconfirmedSpots()` s'exécute chaque jour à 11h00 : elle identifie les réservations dont la date de début est aujourd'hui et qui n'ont aucun `ReservationRegister` associé, puis les supprime.

## Consequences

**Avantages :**

- **Simplicité** : aucune infrastructure supplémentaire. Le cron est co-déployé avec le backend, dans le même conteneur Docker.
- **Accès direct au service Prisma** : la tâche peut utiliser le `PrismaService` injecté, sans avoir besoin d'appeler une API HTTP intermédiaire.
- **Testabilité** : la méthode `releaseUnconfirmedSpots()` est un service NestJS ordinaire, testable unitairement avec Jest.
- **Logs centralisés** : les logs du cron apparaissent dans les logs du backend, avec le même système de logging (`Logger`).

**Inconvénients :**

- **Couplage** : si le backend est redémarré pile à 11h00, la tâche pourrait être manquée. Une solution robuste utiliserait un verrou distribué ou un système de queue.
- **Instance unique** : si le backend est scalé horizontalement (plusieurs instances), chaque instance exécuterait le cron, entraînant des suppressions en doublon. Un verrou Redis ou une queue dédiée serait nécessaire dans ce cas.
- **Dépendance au fuseau horaire du serveur** : l'heure d'exécution dépend du fuseau horaire du conteneur, qui doit être configuré correctement.
