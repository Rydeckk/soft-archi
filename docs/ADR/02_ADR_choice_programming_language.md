# Choix du langage

## Status
Accepté

## Context
Pour le développement de notre application (Frontend et Backend), nous devons choisir un langage de programmation. 
Pour le backend les possibilités sont très vastes et pour le frontend web les possibilités sont plus restreinte entre 
JavaScript ou TypeScript.

## Decision
Nous avons choisi d'utiliser **TypeScript** pour l'ensemble de la stack technique.
Cette décision est portée par le fait que tous les membres de l'équipe sont familiers avec ce langage,
ce qui garantit une productivité immédiate. 

De plus, TypeScript est aujourd'hui la référence pour les services web professionnels et son utilisation sur toute 
la stack permet une homogénéité entre le front et le back.

## Consequences
Ce choix permet de sécuriser le code grâce au typage statique, réduisant ainsi les bugs en production.
Il facilite également le partage de modèles de données entre l'API et l'interface utilisateur.
En revanche, cela impose une étape de compilation et une rigueur d'écriture plus importante
que le JavaScript classique, ce qui peut légèrement ralentir le développement initial au profit d'une meilleure
maintenance à long terme.
