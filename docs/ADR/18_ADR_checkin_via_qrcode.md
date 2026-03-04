# Mécanisme de check-in : QR code physique

## Status
Accepté

## Context
La règle métier impose qu'un employé confirme sa présence sur sa place de parking avant 11h00 le jour de sa réservation. Nous devons définir le mécanisme technique par lequel cette confirmation est effectuée.

Les alternatives envisagées étaient :

1. **Bouton manuel dans l'application** : l'employé clique sur "Confirmer ma présence" depuis le dashboard de l'application web.
2. **QR code physique placé sur la place** : un QR code imprimé est fixé sur chaque place. L'employé le scanne avec son smartphone, ce qui ouvre l'application et déclenche le check-in.
3. **Badge NFC/RFID** : chaque employé passe son badge devant un lecteur installé sur la place. Plus fiable mais nécessite une infrastructure hardware.
4. **Géolocalisation** : l'application vérifie que l'utilisateur se trouve physiquement à proximité de la place. Dépend de la précision GPS en parking souterrain.

## Decision
Nous avons choisi le mécanisme de **QR code physique**, avec un bouton de fallback "Confirmer ma présence" dans l'application pour les cas où le scan n'est pas possible.

Chaque place génère un QR code pointant vers l'URL `{origine}/check-in/{code}{numéro}` (ex : `/check-in/A01`). L'interface d'administration permet de générer et d'imprimer les 60 QR codes destinés à être placés physiquement sur les places.

## Consequences

**Avantages :**

- **Preuve de présence physique** : scanner le QR code sur la place garantit que l'employé est bien présent physiquement sur son emplacement, contrairement à un simple bouton dans l'application.
- **Zéro infrastructure hardware** : pas de lecteur NFC, de badge RFID ou de capteur GPS à installer. Un simple papier plastifié suffit.
- **Universalité** : tout smartphone moderne peut scanner un QR code via l'appareil photo natif, sans application dédiée.
- **Facilité de déploiement** : les QR codes sont générés depuis l'interface d'administration (`AdminPage`, onglet QR Codes) et imprimés en un clic.
- **Résilience** : si l'employé ne peut pas scanner le QR code (smartphone déchargé, etc.), le bouton dans l'application sert de fallback.

**Inconvénients :**

- **Contournement possible** : un employé mal intentionné pourrait photographier le QR code d'une autre place et faire son check-in depuis chez lui. Ce risque est considéré comme acceptable dans notre contexte de confiance interne.
- **Détérioration physique** : les QR codes imprimés peuvent se détériorer (eau, soleil, vandalisme). Des remplacements périodiques sont nécessaires.
- **Dépendance au smartphone** : un employé sans smartphone ne peut pas utiliser le QR code et doit recourir au bouton de l'application.
