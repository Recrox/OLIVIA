# Journal des versions

Toutes les évolutions du site d'Olivia. Numérotation [SemVer](https://semver.org/lang/fr/) : `MAJEUR.MINEUR.CORRECTIF`.

- **MAJEUR** : refonte, changement d'adresse du site ou de structure des pages.
- **MINEUR** : nouvelle fonctionnalité ou nouvelle section.
- **CORRECTIF** : correction, mise à jour de la carte ou des prix, réglage technique.

La version affichée en bas du site, le tag Git `vX.Y.Z` et la version Cloudflare portent le même numéro.

## [1.5.0] - 2026-11-17
### Ajouté
- Thème sombre, désactivé par défaut : icône lune/soleil dans l'en-tête, choix mémorisé sur l'appareil, appliqué avant l'affichage (pas de flash blanc).
- Le portrait d'Olivia s'affiche en médaillon rond sur fond sombre.
### Modifié
- Sur les plus petits téléphones (moins de 400 px), le bouton d'installation n'affiche que son icône.

## [1.4.0] - 2026-11-17
### Ajouté
- Système de versions : numéro dans `package.json`, affiché en pied de page, inscrit dans le cache hors connexion et dans chaque déploiement Cloudflare (`--tag`), tags Git et ce journal.

## [1.3.0] - 2026-11-17
### Ajouté
- Plan Google Maps intégré dans « Infos pratiques », chargé au toucher (pas de cookies Google sans action du visiteur).
### Modifié
- Politique de sécurité (CSP) : autorise l'intégration de Google Maps.

## [1.2.0] - 2026-11-17
### Ajouté
- Bouton « Installer l'app » dans l'en-tête (Android, Chrome et Edge) ; instructions sur iPhone et iPad.
### Corrigé
- Débordement des tuiles de rubriques sur l'accueil en 320 px ; tests en 320 px ajoutés.

## [1.1.1] - 2026-11-17
### Corrigé
- Intégration continue : runner Ubuntu 24.04 (Ubuntu 26.04 non pris en charge par Playwright 1.56).

## [1.1.0] - 2026-11-17
### Modifié
- Carte en onglets : une rubrique à la fois, sous-rubriques dépliables, glisser à gauche ou à droite pour changer de rubrique.
- Onglets de la carte sur une seule ligne sur téléphone.
- Accueil plus compact : tuiles de rubriques, suggestions en carrousel sur téléphone, en deux colonnes sur ordinateur.

## [1.0.0] - 2026-11-17
### Ajouté
- Refonte complète du site : accueil, carte complète (261 articles), page hors connexion, page 404.
- Application installable (PWA) avec mode hors connexion limité à 14 jours pour ne pas afficher de prix périmés.
- Référencement : Schema.org Restaurant et Menu, Open Graph, sitemap.
- Tests Playwright (résolutions, liens, accessibilité, PWA) et déploiement Cloudflare automatisé.

[1.5.0]: https://github.com/Recrox/OLIVIA/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Recrox/OLIVIA/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Recrox/OLIVIA/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Recrox/OLIVIA/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/Recrox/OLIVIA/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Recrox/OLIVIA/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Recrox/OLIVIA/releases/tag/v1.0.0
