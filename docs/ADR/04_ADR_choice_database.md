# Choix de la base de données

## Status
Accepté

## Context
Pour notre application de gestion de parking, nous devons stocker les données des employés, des parkings,
des réservations et l'historique associé. 
Nous devons donc choisir une solution de base de données adaptée à ces besoins, avec plusieurs possibilités
comme PostgreSQL, MySQL ou MongoDB.

## Decision
Nous avons choisi d'utiliser **PostgreSQL**.

Cette décision est portée par le fait que PostgreSQL est une base de données relationnelle robuste offrant d'excellentes
garanties ACID, essentielles pour éviter les problèmes de doubles réservations. 
Son modèle relationnel est parfaitement adapté à notre cas d'usage où les relations entre entités sont nombreuses
et clairement définies. 
De plus, PostgreSQL s'intègre parfaitement avec NestJS via des ORM comme TypeORM ou Prisma.

## Consequences
Ce choix nous permet de bénéficier d'une base de données fiable avec des garanties fortes sur l'intégrité des données.
Le système de contraintes et de transactions garantit la cohérence des réservations.

Cependant, PostgreSQL nécessite plus de ressources qu'une base de données plus légère et requiert une infrastructure
dédiée pour la production. 
De plus, le schéma de base de données étant rigide, toute modification de structure nécessitera des migrations,
ce qui impose une rigueur dans la gestion des évolutions du modèle de données.