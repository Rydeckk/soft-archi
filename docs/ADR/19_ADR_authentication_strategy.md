# Stratégie d'authentification : JWT stateless

## Status
Accepté

## Context
Notre application nécessite un mécanisme d'authentification pour identifier les utilisateurs et protéger les routes de l'API. Les employés se connectent avec leur email et leur mot de passe, et leurs actions sont soumises à un contrôle d'accès basé sur les rôles (EMPLOYEE, SECRETARY, MANAGER).

Deux grandes familles d'approches étaient envisageables :

1. **Sessions serveur (stateful)** : le serveur stocke l'état de session en base de données ou en mémoire (Redis). Le client envoie un identifiant de session via un cookie.
2. **Tokens JWT (stateless)** : le serveur génère un token signé contenant les informations de l'utilisateur. Le client le stocke localement et l'envoie dans chaque requête via l'en-tête `Authorization: Bearer`.

## Decision
Nous avons choisi l'authentification par **tokens JWT stateless**, implémentée via `@nestjs/passport` avec la stratégie `passport-jwt`.

Le token contient le champ `sub` (identifiant de l'utilisateur) et `role`, ce qui permet au backend de vérifier les droits sans consulter la base de données à chaque requête.

## Consequences

**Avantages :**

- **Scalabilité horizontale** : aucun état de session à synchroniser entre les instances du serveur.
- **Simplicité d'intégration** : le frontend stocke le token dans `localStorage` et l'envoie dans chaque requête via un wrapper `fetch` centralisé (`Api.ts`).
- **Autonomie du token** : le rôle est embarqué dans le token, ce qui évite une requête BDD supplémentaire pour la vérification des droits.
- **Standard ouvert** : JWT est un standard RFC 7519 largement supporté par l'écosystème Node.js.

**Inconvénients :**

- **Révocation difficile** : un token JWT valide ne peut pas être invalidé côté serveur avant son expiration sans ajouter une liste noire (blacklist), ce qui réintroduit du state. En cas de vol de token, l'attaquant dispose d'un accès jusqu'à l'expiration.
- **Taille du token** : embarquer des données dans le token augmente la taille de chaque requête HTTP par rapport à un simple cookie de session.
- **Sécurité localStorage** : le stockage dans `localStorage` expose le token à des attaques XSS, contrairement à un cookie `httpOnly`. Ce risque est acceptable dans notre contexte interne d'entreprise.
