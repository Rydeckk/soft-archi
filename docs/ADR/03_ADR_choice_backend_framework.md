# Choix du framework backend

## Status
Accepté

## Context
Pour le développement de notre API backend, nous devons choisir un framework qui nous permette de structurer notre
application de manière robuste et maintenable. Étant donné que nous avons choisi TypeScript comme langage de
développement, nous devons sélectionner un framework adapté parmi les options disponibles comme NestJS,
Express ou Fastify.

## Decision
Nous avons choisi d'utiliser **NestJS**.

Cette décision est portée par le fait que NestJS est spécifiquement conçu pour TypeScript et propose une architecture
modulaire qui facilite l'organisation du code et la scalabilité de l'application. 
De plus, l'équipe apprécie son approche orientée enterprise avec injection de dépendances,
qui permet une meilleure testabilité et maintenabilité du code.

## Consequences
Ce choix permet de bénéficier d'une structure de projet claire avec une séparation des responsabilités bien
définie grâce au système de modules. 
Il facilite également la collaboration en équipe et l'intégration de fonctionnalités comme la validation ou la
documentation API.

En revanche, NestJS impose une courbe d'apprentissage plus importante qu'un simple framework Express,
ce qui peut légèrement ralentir le développement initial. 
De plus, l'overhead du framework peut avoir un impact minime sur les performances,
bien que négligeable pour notre cas d'usage.