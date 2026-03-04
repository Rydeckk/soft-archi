# Conteneurisation et orchestration avec Docker Compose

## Status
Accepté

## Context
Notre application est composée de plusieurs services interdépendants : un backend NestJS, un frontend React servi par Nginx, un microservice mailer, une base de données PostgreSQL et un broker RabbitMQ. Nous devons définir une stratégie de déploiement et d'environnement local qui garantisse la reproductibilité entre les machines des développeurs et le déploiement en production.

Les approches envisagées étaient :

1. **Installation locale des services** : chaque développeur installe PostgreSQL et RabbitMQ directement sur sa machine.
2. **Docker Compose** : chaque service est conteneurisé et orchestré par un fichier `docker-compose.yml` à la racine.
3. **Kubernetes** : orchestration de conteneurs à l'échelle, adapté à la production à grande échelle.

## Decision
Nous avons choisi **Docker Compose** pour l'orchestration des cinq services de l'application.

Chaque service (backend, frontend, mailer, postgres, rabbitmq) possède son propre conteneur. Le frontend de production est servi via **Nginx** pour des performances optimales. Les variables d'environnement sont gérées via des fichiers `.env`.

## Consequences

**Avantages :**

- **Reproductibilité** : l'environnement est identique sur toutes les machines de développement et en production. `docker compose up --build` suffit à démarrer l'ensemble de la stack.
- **Isolation** : chaque service tourne dans son propre conteneur avec ses dépendances, évitant les conflits de versions.
- **Simplicité par rapport à Kubernetes** : Docker Compose est suffisant pour notre échelle et ne nécessite pas de cluster ni de configuration complexe.
- **Intégration CI/CD** : Docker Compose s'intègre facilement dans des pipelines CI/CD.

**Inconvénients :**

- **Pas de haute disponibilité native** : Docker Compose ne gère pas le load balancing ni le redémarrage automatique en cas de panne d'une machine hôte (contrairement à Kubernetes).
- **Overhead de build** : le build initial de toutes les images est plus lent qu'une installation directe.
- **Limites à grande échelle** : si le projet devait gérer des centaines de milliers d'utilisateurs, une migration vers Kubernetes serait nécessaire.
