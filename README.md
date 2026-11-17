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

## Versions

Numéro unique dans `package.json` (SemVer `MAJEUR.MINEUR.CORRECTIF`), détaillé dans [CHANGELOG.md](CHANGELOG.md). À chaque évolution :

1. Mettre à jour `version` dans `package.json` et ajouter l'entrée correspondante en tête de `CHANGELOG.md` (un test vérifie que les deux concordent).
2. `git commit`, puis `git tag -a vX.Y.Z -m "…"`.
3. `git push` (les tags partent avec, grâce à `push.followTags`). Le déploiement Cloudflare porte le tag `vX.Y.Z`.

Le numéro s'affiche en bas de chaque page. Pour revenir à une version : Cloudflare → *Deployments* (chaque version y est étiquetée), ou `npx wrangler rollback`.

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

## Hébergement : Cloudflare (Pages, désormais intégré à Workers)

**En ligne : https://olivia-tournai.recrox.workers.dev**

Choisi pour : gratuit pour un site vitrine (les fichiers statiques sont servis sans limite de requêtes sur l'offre gratuite), CDN mondial avec des points de présence en Belgique et aux Pays-Bas, HTTPS automatique, compression Brotli, domaine personnalisé sans surcoût, fichier `_headers` pris en charge, historique des versions avec retour arrière.
Comparé à Netlify et Vercel (offres gratuites limitées en bande passante ou réservées à un usage non commercial) et à OVHcloud (hébergement payant, déploiement manuel par FTP, pas de CDN par défaut), c'est l'option la plus simple et la moins chère pour ce site.

Configuration : [wrangler.jsonc](wrangler.jsonc) (sert `dist/`, page 404 personnalisée) et [src/static/_headers](src/static/_headers) (cache et sécurité).

### Mettre en ligne depuis ce poste

```
npx wrangler login        # une fois
npm test                  # build + tests
npx wrangler deploy       # publie dist/
```

### Déploiement automatique (GitHub)

1. Créer un dépôt GitHub **privé** et y pousser ce dossier (`git remote add origin …` puis `git push -u origin main`).
2. Cloudflare → *My Profile → API Tokens → Create Token* → modèle **Edit Cloudflare Workers**.
3. GitHub → *Settings → Secrets and variables → Actions* : ajouter `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID` (identifiant visible dans le tableau de bord Cloudflare, colonne de droite).
4. Chaque `git push` sur `main` lance les tests ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) puis déploie. Si un test échoue, rien n'est mis en ligne.

**Revenir à une version précédente** : `npx wrangler rollback`, ou Cloudflare → *Workers & Pages → olivia-tournai → Deployments* → choisir une version → *Rollback*. Ou `git revert` puis `git push`.

### Nom de domaine personnalisé

Aucun domaine existant n'a été trouvé (l'ancien site est une page Adobe Express sans domaine propre). Suggestions à vérifier chez un registrar agréé `.be` (liste sur dnsbelgium.be), environ 10 à 15 € par an :

- `olivia-tournai.be` (recommandé : nom + ville, clair pour le référencement local)
- `oliviatournai.be`
- `olivia-grandplace.be`
- `restaurant-olivia.be`

Une fois le domaine acheté :

1. Cloudflare → *Add a domain* → saisir `olivia-tournai.be` → offre **Free**.
2. Cloudflare affiche deux **serveurs de noms** (ex. `xxx.ns.cloudflare.com`). Chez le registrar, remplacer les serveurs de noms du domaine par ces deux-là. Cloudflare importe les enregistrements existants : vérifier que les **MX** (e-mail) éventuels sont conservés. Propagation : de quelques minutes à 24 h.
   - Un simple CNAME chez le registrar ne suffit pas : les domaines personnalisés de Cloudflare Workers exigent que les DNS soient gérés par Cloudflare. Aucun enregistrement **A** n'est à créer à la main.
3. *Workers & Pages → olivia-tournai → Settings → Domains & Routes → Add → Custom domain* : ajouter `olivia-tournai.be`, puis `www.olivia-tournai.be`. Cloudflare crée les enregistrements DNS et le certificat HTTPS automatiquement.
4. Dans le domaine : *SSL/TLS → Edge Certificates → Always Use HTTPS* : activé.
5. Mettre à jour l'adresse du site : `SITE_URL` dans [build.mjs](build.mjs) (ou variable GitHub `SITE_URL`), puis redéployer. Les liens canoniques, le sitemap et Schema.org utiliseront le nouveau domaine.
6. Mettre le nouveau lien dans la bio Instagram et Facebook, et sur la fiche Google Business Profile.

## Informations à compléter

Absentes de l'ancien site, donc non publiées :

- **Horaires d'ouverture** (fortement recommandé, utile aussi pour Google : champ `openingHours` dans `build.mjs`).
- Numéro exact sur la Grand-Place (l'itinéraire Google Maps cherche « Olivia, Grand-Place, 7500 Tournai »).
- Adresse e-mail éventuelle.
- Davantage de photos en haute définition (seules 3 photos de plats utilisables existaient, dont 2 en petite taille avec un texte incrusté que le site recadre).

Crédits : polices Fraunces et Instrument Sans (SIL Open Font License), icônes Lucide (ISC).
