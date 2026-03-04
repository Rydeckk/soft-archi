# Choix de l'architecture globale

## Status
Accepté

## Contexte
Notre projet est une application de réservation de parking à taille humaine. Elle permet à des utilisateurs de consulter les places disponibles d'un parking et d'effectuer des réservations. L'application se compose d'un frontend, d'un backend REST et d'une base de données. L'équipe de développement est de petite taille et les besoins fonctionnels sont clairement définis et délimités.

## Alternatives considérées
Une architecture microservices aurait consisté à découper l'application en services indépendants (gestion des utilisateurs, gestion des places, gestion des réservations, notifications…), chacun déployé et maintenu séparément. Cette approche offre une scalabilité fine et une isolation des pannes, mais elle introduit une complexité opérationnelle importante : orchestration des services, communication inter-services, gestion distribuée des données et des transactions, ainsi qu'une infrastructure de déploiement plus lourde.

## Décision
Nous avons choisi une architecture monolithe, car cela est plus simple à mettre en place pour un petit projet. En effet, nous avons un seul parking à gérer, ce qui signifie que le périmètre fonctionnel est restreint et ne justifie pas un découpage en services indépendants. Nous n'avons pas besoin d'une scalabilité horizontale poussée, les charges attendues restant modestes. Enfin, l'équipe de développement est plus à l'aise avec une architecture en monolithe, ce qui garantit une meilleure productivité et réduit les risques d'erreurs liées à la gestion d'un système distribué.

Le backend NestJS regroupe ainsi l'ensemble des modules fonctionnels (réservations, places, utilisateurs) au sein d'une même application, partageant une base de données PostgreSQL unique.

## Conséquences
Ce choix nous permet de construire notre application rapidement et simplement sans grandes difficultés. Le déploiement est facilité par l'utilisation de Docker et Docker Compose, qui permettent de lancer l'ensemble de la stack (frontend, backend, base de données) en une seule commande.

En contrepartie, si le projet venait à évoluer vers plusieurs parkings ou à nécessiter une forte montée en charge, une migration vers une architecture plus distribuée serait à envisager. Cette dette architecturale est acceptée et documentée, le contexte actuel ne justifiant pas cet investissement.