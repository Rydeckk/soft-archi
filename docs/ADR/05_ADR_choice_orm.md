# Choix de l'ORM

## Status
Accepté

## Context
Pour interagir avec notre base de données PostgreSQL depuis notre backend NestJS, nous devons choisir un ORM
qui facilite la gestion des requêtes, des migrations et du schéma de base de données.

## Alternative
Les principales alternatives étaient TypeORM, qui est l'ORM historiquement recommandé par NestJS avec une approche
basée sur les décorateurs, et Sequelize, un ORM mature pour Node.js. MikroORM était également une option intéressante,
mais moins répandue dans l'écosystème NestJS.

## Decision
Nous avons choisi d'utiliser **Prisma**.
Cette décision est portée par le fait que l'équipe maîtrise déjà Prisma et apprécie son approche schema first,
où le schéma est défini de manière déclarative dans un fichier dédié. De plus, Prisma offre un excellent support
TypeScript avec un client type safe généré automatiquement et des migrations simplifiées.

## Consequences
Ce choix nous permet de bénéficier d'une excellente expérience développeur avec l'autocomplétion et la détection
d'erreurs au moment de la compilation. Prisma Studio facilite également la visualisation et la manipulation des
données durant le développement.
Cependant, Prisma impose une structure spécifique avec son fichier schema.prisma et nécessite une génération du
client à chaque modification du schéma, ce qui ajoute une étape dans le workflow de développement.