# Olivia — site web et application (PWA)

Site du restaurant **Olivia**, Grand-Place de Tournai. Site statique généré par un petit script Node, sans framework, installable comme une application sur téléphone.

## Modifier la carte (le plus courant)

Toute la carte est dans **[src/menu.json](src/menu.json)**.

1. Modifier un plat, un prix ou une rubrique dans `src/menu.json`.
   - `"price": 8.5` → affiché « 8,50 € ». Plusieurs prix : `"prices": [["25 cl", 3], ["50 cl", 5.5]]`.
   - Plat momentanément indisponible : `"unavailable": true`.
   - Étiquettes : `"tags": ["veg"]` (végétarien), `"spicy"`, `"coeur"` (coup de cœur), `"signature"`, `"maison"`, `"belge"`, `"bio"`.
   - Les rubriques avec `"featured": true` apparaissent aussi sur l'accueil (« Les suggestions du moment »).
2. Mettre à jour la date `"updated"` en haut du fichier (elle est affichée sur la carte).
3. `git commit` puis `git push` : les tests tournent, puis le site est mis en ligne automatiquement si tout est vert.

L'application installée se met à jour seule : les pages sont toujours rechargées depuis le réseau quand il y en a, et une copie hors connexion de plus de 14 jours n'est jamais affichée (les prix changent).

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm install` puis `npx playwright install chromium` | Installation (une fois) |
| `npm run build` | Génère le site dans `dist/` |
| `npm run serve` | Aperçu local sur http://localhost:4173 |
| `npm test` | Build + tests Playwright (6 résolutions, liens, accessibilité axe, SEO, PWA, hors connexion) |
| `npm run images` | Regénère les images AVIF/WebP depuis `src/img/raw/` (après ajout de photos) |
| `npm run icons` | Regénère les icônes de l'application et l'image de partage |

## Organisation

```
build.mjs              générateur : menu.json + gabarits -> dist/
src/menu.json          la carte (seule source de vérité)
src/styles.css         tout le style (variables de couleur en tête)
src/main.js            service worker, installation, onglets de la carte
src/sw.js              service worker (réseau d'abord pour les pages)
src/static/            manifest, _headers (cache et sécurité), icônes
src/img/raw/           photos originales ; src/img/ = versions optimisées
tests/site.test.mjs    tests de bout en bout
.github/workflows/     tests puis déploiement Cloudflare Pages
```

## Hébergement : Cloudflare Pages

Choisi pour : gratuit pour ce volume (bande passante illimitée sur l'offre gratuite), CDN avec points de présence à Bruxelles et Amsterdam, HTTPS automatique, domaine personnalisé gratuit, fichier `_headers` pris en charge, historique de chaque version avec retour arrière en un clic.

### Première mise en ligne

1. Créer un compte gratuit sur https://dash.cloudflare.com/sign-up.
2. Dans ce dossier : `npx wrangler login`, puis
   `npx wrangler pages project create olivia-tournai --production-branch=main`, puis
   `npm run build && npx wrangler pages deploy dist --project-name=olivia-tournai --branch=main`.
3. Le site est en ligne sur **https://olivia-tournai.pages.dev**.

### Déploiement automatique (GitHub)

1. Créer un dépôt GitHub privé et y pousser ce dossier.
2. Cloudflare → *My Profile → API Tokens → Create Token* → modèle « Edit Cloudflare Workers » ou permission *Cloudflare Pages : Edit*.
3. GitHub → *Settings → Secrets and variables → Actions* : ajouter `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID` (visible dans le tableau de bord Cloudflare).
4. Chaque `git push` sur `main` lance les tests puis déploie. Si un test échoue, rien n'est mis en ligne.

**Revenir à une version précédente** : Cloudflare → *Workers & Pages → olivia-tournai → Deployments* → choisir une version → *Rollback to this deployment*. Ou `git revert` puis `git push`.

### Nom de domaine personnalisé

Aucun domaine existant n'a été trouvé sur l'ancien site (hébergé chez Adobe Express). Suggestions à vérifier chez un registrar (DNS Belgium liste les registrars agréés pour le `.be`), environ 10 à 15 € par an :

- `olivia-tournai.be` (recommandé : nom + ville, clair pour le référencement local)
- `oliviatournai.be`
- `olivia-grandplace.be`
- `restaurant-olivia.be`

Une fois le domaine acheté :

1. Cloudflare → *olivia-tournai → Custom domains → Set up a custom domain* → saisir `www.olivia-tournai.be`, puis répéter pour `olivia-tournai.be`.
2. **Le plus simple** : confier les DNS du domaine à Cloudflare (gratuit). Cloudflare indique deux serveurs de noms (ex. `xxx.ns.cloudflare.com`) à copier chez le registrar. Les enregistrements sont alors créés automatiquement.
3. **Si les DNS restent chez le registrar** :
   - `www` → enregistrement **CNAME** vers `olivia-tournai.pages.dev`
   - domaine nu `olivia-tournai.be` → **CNAME à la racine** (« ALIAS/ANAME/CNAME flattening ») vers `olivia-tournai.pages.dev` si le registrar le permet ; sinon redirection web du domaine nu vers `https://www.olivia-tournai.be` (Pages ne fournit pas d'adresse IP fixe pour un enregistrement **A**).
   - Garder les enregistrements **MX** existants si une adresse e-mail utilise ce domaine.
4. Le certificat HTTPS est émis automatiquement (quelques minutes).
5. Dans GitHub → *Settings → Variables*, ajouter `SITE_URL = https://www.olivia-tournai.be` pour que les liens canoniques, le sitemap et les données Schema.org utilisent le bon domaine, puis relancer un déploiement.
6. Remplacer le lien de la bio Instagram / Facebook et la fiche Google Business par la nouvelle adresse.

## Informations à compléter

Absentes de l'ancien site, donc non publiées :

- **Horaires d'ouverture** (fortement recommandé, utile aussi pour Google : champ `openingHours` dans `build.mjs`).
- Numéro exact sur la Grand-Place (l'itinéraire Google Maps cherche « Olivia, Grand-Place, 7500 Tournai »).
- Adresse e-mail éventuelle.
- Davantage de photos en haute définition (seules 3 photos de plats utilisables existaient, dont 2 en petite taille avec un texte incrusté que le site recadre).

Crédits : polices Fraunces et Instrument Sans (SIL Open Font License), icônes Lucide (ISC).
