# Choix du message broker : RabbitMQ

## Status
Accepté

## Context
L'architecture requiert une file de messages entre le backend et le microservice mailer : lorsqu'une réservation est créée, un événement est publié dans une queue, et le mailer le consomme pour envoyer un email de confirmation. Nous devons choisir le broker qui supporte ce pattern publish/subscribe.

Les alternatives considérées étaient :

1. **RabbitMQ** : broker de messages traditionnel (AMQP), mature, avec une UI de management intégrée.
2. **Apache Kafka** : plateforme de streaming distribué orientée gros volumes et persistance longue durée.
3. **BullMQ** : bibliothèque de queues basée sur Redis, fonctionnant directement dans Node.js.
4. **Redis Pub/Sub** : messaging léger intégré à Redis, sans persistance des messages.

## Decision
Nous avons choisi **RabbitMQ** comme message broker.

Le backend publie sur la queue `reservation_confirmation` via le module `@nestjs/microservices` (transport RMQ). Le mailer consomme cette queue et appelle l'API Brevo.

## Consequences

**Avantages :**

- **Persistance des messages** : les messages survivent à un redémarrage du mailer grâce aux queues durables (`durable: true`). Aucun email de confirmation ne sera perdu en cas d'indisponibilité temporaire du mailer.
- **Intégration NestJS native** : `@nestjs/microservices` supporte nativement le transport RabbitMQ (AMQP), réduisant le code de configuration au minimum.
- **Interface de management** : RabbitMQ expose une UI web sur le port 15672, permettant de monitorer les queues, messages en attente et consumers en temps réel.
- **Adapté à notre charge** : RabbitMQ est largement surdimensionné pour notre volume (quelques dizaines de réservations par jour), ce qui garantit une stabilité totale.

**Inconvénients :**

- **Infrastructure additionnelle** : un service supplémentaire à déployer et maintenir par rapport à BullMQ qui utilise Redis déjà présent dans beaucoup d'architectures.
- **Surqualification** : Kafka aurait été plus adapté pour du streaming à très haut débit, mais c'est inutile à notre échelle.
- **Protocole AMQP** : légèrement plus complexe à déboguer que du Redis Pub/Sub ou une API HTTP directe.
