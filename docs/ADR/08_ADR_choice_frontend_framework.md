# Choix du framework frontend

## Status
Accepté

## Context
Pour développer l'interface utilisateur de notre application de gestion de parking, nous devons choisir un
framework frontend moderne qui facilite la création de composants interactifs et réactifs.

## Alternative
Les principales alternatives étaient Vue.js, qui offre une approche progressive et une courbe d'apprentissage
douce avec une syntaxe proche du HTML, Angular, un framework complet et structuré orienté enterprise mais plus
verbeux, et Svelte, qui compile les composants en JavaScript vanilla pour de meilleures performances, mais avec
un écosystème plus restreint.

## Decision
Nous avons choisi d'utiliser **React**.
Cette décision est portée par le fait que tous les membres de l'équipe sont déjà familiers avec React, ce qui
garantit une productivité immédiate sans phase d'apprentissage. De plus, React dispose du plus grand écosystème
de bibliothèques et composants, ce qui facilitera l'intégration de fonctionnalités futures.

## Consequences
Ce choix nous permet de bénéficier d'une large communauté, d'une documentation abondante et d'un écosystème riche
en composants réutilisables. La philosophie basée sur les composants et le flux unidirectionnel de données facilite
la maintenance et la testabilité du code.
Cependant, React nécessite souvent l'ajout de bibliothèques tierces pour des fonctionnalités courantes comme le
routing ou la gestion d'état complexe, contrairement à des frameworks plus complets comme Angular.