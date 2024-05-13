# Digitale-Tweeling-Platform
De front-end van de Digitale Tweeling Platform

## Beschrijving
Het Digitale Tweeling Platform, ontwikkeld door Analyze in samenwerking met Gemeente Alkmaar, is gericht op het verbeteren van de algehele kwaliteit van leven in stedelijke gebieden. Het maakt gebruik van digitale technologieën om efficiënter beheer en planning van stedelijke omgevingen mogelijk te maken. Door gegevens te verzamelen en te analyseren over aspecten zoals luchtkwaliteit, geluidbelasting, wegennetwerk, leefomgeving, en hittestress, streeft het platform ernaar om de leefbaarheid in de stad te verbeteren. Het maakt onder andere gebruik van voorspellingsmodellen op basis van deep learning voor verkeersdrukte en het meten van luchtkwaliteit, en het bevordert de participatie van inwoners binnen de smart city omgeving​​.

Het platform van Gemeente Alkmaar, dat wordt omschreven als een exacte virtuele kopie van de werkelijkheid, omvat alle straten, gebouwen, bomen, fietspaden, laadpalen, en meer. Het doel is om op termijn analyses mogelijk te maken die belangrijk zijn voor de stad, zoals het in kaart brengen van verkeersstromen en het ontwikkelen van beleid op basis van deze inzichten. De eerste fase van de Digitale Tweeling is al voltooid en biedt kaarten met onder andere parkeervlakken, laadpalen, en deelauto's. Het platform streeft ernaar om meer gegevens toe te voegen om de duurzaamheidsdoelstellingen van de stad, zoals het verminderen van CO2-uitstoot, te ondersteunen​​.

Analyze heeft in 2023 samengewerkt met partners en gezamenlijke opdrachtgevers om het digital twin platform uit te breiden, waardoor andere gemeenten in Nederland gemakkelijk kunnen aansluiten. Dit initiatief, met de Digitale Tweeling van Alkmaar als basis, heeft al geleid tot de aansluiting van vijf andere gemeenten​​.

Dit project illustreert de toewijding van Gemeente Alkmaar en Analyze aan het bevorderen van een datagedreven aanpak voor stedelijk beheer en planning, met als uiteindelijke doel het verbeteren van de kwaliteit van leven voor haar inwoners.

## Inhoud
Deze repository bestaat uit twee mappen. `Shared` bevat de gedeelde code die hergebruikt wordt in diverse Digitale Tweeling use-cases en instances. De gedeelde code is uit te breiden en te configureren om tot een specifieke use-case te komen, de map `.example` bevat daar een voorbeeld van.

## Setup
Het Digitale Tweeling platform is ontworpen om binnen Azure te draaien en maakt gebruikt van Azure RBAC om toegang te krijgen tot een Azure Maps licentie en (desgewenst) data in storage accounts. Kaartdata wordt op basis van metadata rechtstreeks uit de bron opgevraagd.
| env_name    | datatype | description                 |
|-------------|----------|-----------------------------|
| AzureMapsClientId | string   | Azure maps subscription Client ID |
| build_id       | string  | Build ID |
| Geoserver_Auth    | string   | Auth header voor Geoserver |
| subscription_id    | string   | Azure SubscriptionID |

## Contact

Voor vragen over het bouwlogistiek dashboard en implementatie kunt u contact opnemen met:
- Wouter Huijzendveld
- 06 – 10 39 59 35
- email : info@analyze.nl
- of via de website [analyze.nl](https://analyze.nl)


## Licentie

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.txt)
