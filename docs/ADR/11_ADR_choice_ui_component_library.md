# Choix de la bibliothèque de composants UI

## Status
Accepté

## Contexte
Notre application de réservation de parking nécessite une interface utilisateur soignée et cohérente. Afin d'accélérer le développement du frontend React, nous avons besoin d'une bibliothèque de composants prêts à l'emploi (boutons, formulaires, modales, tableaux…) qui s'intègre bien avec notre stack existante (React + Tailwind CSS).

## Alternatives considérées

### Material UI (MUI)
Bibliothèque très complète basée sur le Material Design de Google. Elle offre un grand nombre de composants et une documentation riche, mais elle impose un système de style propre (emotion/styled-components) qui entre en conflit avec Tailwind CSS et génère un surpoids non négligeable dans le bundle final.

### Chakra UI
Solution accessible et bien documentée, mais dont l'intégration avec Tailwind CSS est également problématique puisqu'elle embarque son propre système de design tokens et de thème, rendant les deux approches difficiles à faire cohabiter.

### Ant Design
Orientée applications de gestion d'entreprise, Ant Design propose des composants riches et complets. Toutefois, son style visuel très marqué est difficile à personnaliser profondément et son intégration avec Tailwind CSS est limitée, ce qui aurait nécessité de renoncer à l'un des deux outils.

## Décision
Nous avons choisi d'utiliser **ShadCN UI**.

Contrairement aux bibliothèques classiques, ShadCN UI n'est pas un package installé comme dépendance : les composants sont directement copiés dans le code source du projet, ce qui nous offre un contrôle total sur leur implémentation et leur style. Chaque composant est construit sur **Radix UI** pour l'accessibilité (gestion du focus, des rôles ARIA, des interactions clavier) et stylisé avec **Tailwind CSS**, ce qui s'intègre naturellement avec notre configuration existante.

Ce choix est également cohérent avec notre choix de React comme framework frontend, et ne crée aucun conflit de système de style puisque tout repose sur Tailwind CSS.

## Conséquences
L'utilisation de ShadCN UI nous permet de disposer rapidement de composants accessibles, cohérents visuellement et entièrement personnalisables sans compromis avec notre stack Tailwind CSS. Le fait que les composants soient intégrés directement dans le projet facilite leur modification au cas par cas selon les besoins métier.

En contrepartie, la mise à jour des composants nécessite une intervention manuelle (ré-import du composant mis à jour via la CLI ShadCN), contrairement à une bibliothèque classique où un simple `pnpm update` suffit. Cette contrainte est acceptée compte tenu de la taille du projet et des gains apportés en termes de flexibilité et de cohérence de style.
