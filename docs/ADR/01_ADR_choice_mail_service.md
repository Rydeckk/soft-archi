# Choix du service d'email

## Status
Accepté

## Context
Pour notre application, nous devons envoyer un email de confirmation à nos employés lorsqu'ils réservent une place de parking. Pour cela, vous avons le choix entre créer notre propre service de gestion des emails ou bien utiliser un service externe et si nous choisissons un service existant, il faut décider de quel service.

## Decision
Nous avons choisi d'utiliser un service externe.
Cette décision a été porté par les délais, qui font que nous ne pouvons pas utiliser un **service interne** car cela prendrait trop de temps à réaliser.

Pour notre choix de service externe, nous avions plusieurs possibilités :
- Postmark
- Mailgun
- Brevo

Nous avons donc choisi **Brevo**.

## Consequences
Ce service a l'avantage d'être une API, donc facilement intégrable avec un large choix technologique, d'offrir une grande de quantité de mail gratuit (300 mails/jour) et nous avons l'habitude d'utiliser cet outil ce qui nous permet de prototyper rapidement.
Cependant, nous allons dépendre d'un service externe, ce qui peut poser problème dans le futur, à mesure que notre système grandira, il nous faudra soit payer, soit passer sur un service interne. De plus, si ce service rencontre un problème, nous ne pourrons pas le resoudre par nous-mêmes.