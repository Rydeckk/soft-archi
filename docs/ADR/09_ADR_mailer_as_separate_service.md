# Mailer comme service indépendant via message queue

## Status
Accepté

## Context
La consigne stipule explicitement que *"lorsqu'une personne effectue une réservation, un message doit être envoyé à une file d'attente afin d'être traité par **une autre application** qui enverra un e-mail de confirmation"*.

Deux approches étaient envisageables pour répondre à ce besoin :

1. **Appel direct** : le backend appelle l'API Brevo directement depuis le service de réservation, sans intermédiaire.
2. **Service découplé via message queue** : le backend publie un message dans RabbitMQ, et un microservice `mailer` indépendant consomme ce message et appelle Brevo.

## Decision
Nous avons choisi l'approche **service découplé via RabbitMQ**, avec le service `mailer` déployé comme application séparée en dehors du backend.

Cette architecture respecte le principe de **responsabilité unique** : le backend gère les réservations, le mailer gère les notifications. Chaque service peut évoluer, être redéployé ou remplacé sans impacter l'autre.

## Consequences

**Avantages :**

- **Résilience** : si le service mailer est temporairement indisponible, les messages s'accumulent dans la queue RabbitMQ et sont traités dès son redémarrage. Une panne du mailer ne bloque pas les réservations.
- **Découplage** : le backend n'a aucune connaissance de la façon dont les emails sont envoyés. Le mailer pourrait être remplacé par un autre outil (SendGrid, AWS SES, etc.) sans toucher au backend.
- **Scalabilité indépendante** : si le volume d'emails augmente, on peut scaler le mailer horizontalement sans toucher au backend.
- **Conformité à la consigne** : la consigne demande explicitement une architecture avec une file d'attente et une application séparée pour l'envoi d'email.

**Inconvénients :**

- **Complexité opérationnelle accrue** : un service supplémentaire à maintenir, déployer et monitorer.
- **Infrastructure additionnelle** : RabbitMQ doit être disponible, ce qui ajoute une dépendance à l'infrastructure.
- **Débogage plus difficile** : le flux email est asynchrone, les erreurs d'envoi ne remontent pas directement à l'appelant.
