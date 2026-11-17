// Static site generator for Olivia: src/ -> dist/. No dependencies.
// Content lives in src/menu.json; edit it and run `npm run build`.
import fs from 'node:fs';
import crypto from 'node:crypto';

const SITE = (process.env.SITE_URL || 'https://olivia-tournai.recrox.workers.dev').replace(/\/$/, '');
const PHONE = { display: '069 81 73 20', tel: '+3269817320', intl: '+32 69 81 73 20' };
const ADDRESS = { street: 'Grand-Place', city: 'Tournai', zip: '7500', country: 'BE' };
const MAPS = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Olivia, Grand-Place, 7500 Tournai');
const ROUTE = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Olivia, Grand-Place, 7500 Tournai');
const SOCIAL = {
  instagram: 'https://www.instagram.com/olivia_boire.et.manger/',
  facebook: 'https://www.facebook.com/profile.php?id=61550775921543',
};

const menu = JSON.parse(fs.readFileSync('src/menu.json', 'utf8'));
const sizes = JSON.parse(fs.readFileSync('src/img/sizes.json', 'utf8'));

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const euro = n => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',')) + ' €';
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
const longDate = iso => new Date(iso + 'T12:00:00').toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' });
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Lucide icons (ISC), 1.5 stroke, inherit color.
const ICONS = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  route: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
};
const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// The signature: a small watercolour splash, borrowed from Olivia's portrait.
const splash = `<svg class="splash" viewBox="0 0 20 20" aria-hidden="true"><path d="M10.6 2.2c2.7.3 5.6 1.9 6.6 4.6.9 2.5-.2 4.6.6 6.6.5 1.4-.8 3.4-2.9 4.2-2.4.9-4.1-.4-6.4.1-2 .4-4.4-.6-5.5-2.7C1.8 12.7 3.4 11 2.8 8.7 2.2 6.3 4 3.6 6.4 2.7c1.5-.6 2.8-.6 4.2-.5Z"/></svg>`;

const picture = (name, alt, { sizesAttr = '100vw', eager = false, cls = '' } = {}) => {
  const s = sizes[name];
  const set = ext => s.widths.map(w => `/img/${name}-${w}.${ext} ${Math.min(w, s.w)}w`).join(', ');
  const largest = s.widths.at(-1);
  return `<picture class="${cls}"><source type="image/avif" srcset="${set('avif')}" sizes="${sizesAttr}"><img src="/img/${name}-${largest}.webp" srcset="${set('webp')}" sizes="${sizesAttr}" width="${s.w}" height="${s.h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
};

// ---------- assets (content-hashed) ----------
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/assets', { recursive: true });
const css = fs.readFileSync('src/styles.css', 'utf8');
const js = fs.readFileSync('src/main.js', 'utf8');
const cssFile = `/assets/styles.${hash(css)}.css`;
const jsFile = `/assets/main.${hash(js)}.js`;
fs.writeFileSync('dist' + cssFile, css);
fs.writeFileSync('dist' + jsFile, js);
fs.cpSync('src/img', 'dist/img', { recursive: true, filter: p => !/raw|sizes\.json/.test(p) });
fs.cpSync('src/fonts', 'dist/fonts', { recursive: true });
fs.cpSync('src/static', 'dist', { recursive: true });

// ---------- layout ----------
const restaurantLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Olivia',
  description: 'Restaurant et bar à tapas sur la Grand-Place de Tournai : planches à partager, pâtes, burgers, bières belges et cocktails.',
  url: SITE + '/',
  image: SITE + '/img/og-olivia.jpg',
  telephone: PHONE.intl,
  address: { '@type': 'PostalAddress', streetAddress: ADDRESS.street, addressLocality: ADDRESS.city, postalCode: ADDRESS.zip, addressCountry: ADDRESS.country },
  hasMenu: SITE + '/carte/',
  servesCuisine: ['Tapas', 'Pâtes', 'Burgers', 'Grillades'],
  acceptsReservations: 'True',
  priceRange: '€€',
  sameAs: [SOCIAL.instagram, SOCIAL.facebook],
};

const page = ({ path, title, description, body, ld = [], bodyClass = '' }) => `<!doctype html>
<html lang="fr-BE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${path}">
<meta name="theme-color" content="#f6f1e8">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
<link rel="icon" type="image/svg+xml" href="/icons/favicon.svg">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Olivia">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta property="og:type" content="restaurant.restaurant">
<meta property="og:locale" content="fr_BE">
<meta property="og:site_name" content="Olivia">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}/img/og-olivia.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/fonts/instrument-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${cssFile}">
<script src="${jsFile}" defer></script>
${[restaurantLd, ...ld].map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>
<body class="${bodyClass}">
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="wordmark" href="/" aria-label="Olivia, accueil">Olivia</a>
    <nav class="main-nav" aria-label="Navigation principale">
      <a href="/carte/"${path === '/carte/' ? ' aria-current="page"' : ''}>La carte</a>
      <a href="/#infos" class="hide-sm">Infos pratiques</a>
    </nav>
    <a class="btn btn-primary btn-sm hide-sm" href="tel:${PHONE.tel}">${icon('phone')}Réserver</a>
  </div>
</header>
<main id="contenu">
${body}
</main>
${footer()}
<nav class="action-bar" aria-label="Actions rapides">
  <a href="tel:${PHONE.tel}">${icon('phone')}<span>Réserver</span></a>
  <a href="/carte/">${icon('book')}<span>La carte</span></a>
  <a href="${ROUTE}" rel="noopener" target="_blank">${icon('route')}<span>Itinéraire</span></a>
</nav>
<div class="toast" role="status" aria-live="polite" hidden></div>
</body>
</html>
`;

function footer() {
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <p class="wordmark wordmark-lg">Olivia</p>
      <p class="muted">Boire et manger sur la Grand-Place de Tournai</p>
    </div>
    <div>
      <h2 class="footer-title">Nous trouver</h2>
      <address>
        <a href="${MAPS}" rel="noopener" target="_blank">${ADDRESS.street}<br>${ADDRESS.zip} ${ADDRESS.city}, Belgique</a><br>
        <a href="tel:${PHONE.tel}">${PHONE.display}</a>
      </address>
    </div>
    <div>
      <h2 class="footer-title">Nous suivre</h2>
      <ul class="plain">
        <li><a href="${SOCIAL.instagram}" rel="noopener" target="_blank">${icon('instagram')}Instagram</a></li>
        <li><a href="${SOCIAL.facebook}" rel="noopener" target="_blank">${icon('facebook')}Facebook</a></li>
      </ul>
    </div>
    <div class="install" hidden>
      <h2 class="footer-title">Application</h2>
      <button class="btn btn-ghost btn-sm" type="button" data-install>${icon('download')}Installer Olivia</button>
      <p class="muted ios-hint" hidden>Sur iPhone : touchez Partager puis « Sur l'écran d'accueil »</p>
    </div>
  </div>
  <div class="wrap footer-base muted">
    <p>Pour toute information sur les allergènes, adressez-vous au personnel. La composition de nos produits peut varier d'un jour à l'autre.</p>
    <p>© ${new Date().getFullYear()} Olivia, Tournai</p>
  </div>
</footer>`;
}

// ---------- menu rendering ----------
const tagHtml = tags => {
  if (!tags?.length) return '';
  return `<span class="tags">${tags.map(t => {
    const label = esc(menu.tagLabels[t]);
    if (t === 'veg') return `<span class="tag">${icon('leaf', 'icon icon-sm')}${label}</span>`;
    if (t === 'spicy') return `<span class="tag">${icon('flame', 'icon icon-sm')}${label}</span>`;
    if (t === 'coeur' || t === 'signature') return `<span class="tag tag-mark">${splash}${label}</span>`;
    return `<span class="tag">${label}</span>`;
  }).join('')}</span>`;
};

const priceHtml = item => {
  if (item.prices) return `<dl class="dish-prices">${item.prices.map(([l, p]) => `<div><dt>${esc(l)}</dt><dd>${euro(p)}</dd></div>`).join('')}</dl>`;
  if (item.price != null) return `<p class="dish-price">${euro(item.price)}</p>`;
  return '';
};

const dish = item => `<li class="dish${item.unavailable ? ' is-off' : ''}">
  <div class="dish-main">
    <p class="dish-name">${esc(item.name)}</p>
    ${item.desc ? `<p class="dish-desc">${esc(item.desc)}</p>` : ''}
    ${tagHtml(item.tags)}
    ${item.unavailable ? '<p class="dish-off">Temporairement indisponible</p>' : ''}
  </div>
  ${priceHtml(item)}
</li>`;

const groupId = (cat, g) => g.id || `${cat.id}-${slug(g.title)}`;

const category = (cat, index) => `<section class="cat" id="${cat.id}" aria-labelledby="${cat.id}-title">
  <header class="cat-head${cat.image ? ' has-img' : ''}">
    <div>
      <h2 class="display-2" id="${cat.id}-title">${esc(cat.title)}</h2>
      <p class="lead">${esc(cat.summary)}</p>
    </div>
    ${cat.image ? picture(cat.image.src, cat.image.alt, { sizesAttr: '(min-width: 720px) 400px, 100vw', cls: 'cat-img', eager: index === 0 }) : ''}
  </header>
  ${cat.groups.length > 3 ? `<nav class="chips" aria-label="${esc(cat.title)} : rubriques">${cat.groups.map(g => `<a href="#${groupId(cat, g)}">${esc(g.title)}</a>`).join('')}</nav>` : ''}
  <div class="groups">
    ${cat.groups.map(g => `<section class="group${g.featured ? ' is-featured' : ''}" id="${groupId(cat, g)}">
      <h3 class="group-title">${esc(g.title)}</h3>
      ${g.note ? `<p class="group-note">${esc(g.note)}</p>` : ''}
      <ul class="dishes">${g.items.map(dish).join('')}</ul>
    </section>`).join('\n')}
    ${cat.seeAlso ? `<p class="see-also"><a class="link-arrow" href="${cat.seeAlso.href}">${esc(cat.seeAlso.label)}${icon('arrow')}</a></p>` : ''}
  </div>
</section>`;

// ---------- pages ----------
const featured = menu.categories.flatMap(c => c.groups.filter(g => g.featured).flatMap(g => g.items.map(i => ({ ...i, cat: c.title }))));
const spritz = menu.categories.find(c => c.id === 'boissons').groups.flatMap(g => g.items).find(i => i.name === "Le Spritz d'Olivia");

const home = page({
  path: '/',
  title: 'Olivia · Restaurant et tapas sur la Grand-Place de Tournai',
  description: "Planches à partager, pâtes, burgers et desserts maison, bières belges et spritz, au cœur de la Grand-Place de Tournai. Réservations au 069 81 73 20.",
  bodyClass: 'home',
  body: `
<section class="hero wrap">
  <div class="hero-text">
    <p class="kicker">${icon('pin', 'icon icon-sm')}Grand-Place · Tournai</p>
    <h1 class="display-1">Tapas, pâtes et spritz au cœur de la Grand-Place</h1>
    <p class="lead">Planches à partager, cuisine faite maison et une belle carte de bières belges, de vins et de cocktails.</p>
    <div class="actions">
      <a class="btn btn-primary" href="tel:${PHONE.tel}">${icon('phone')}Réserver au ${PHONE.display}</a>
      <a class="btn btn-ghost" href="/carte/">Découvrir la carte</a>
    </div>
  </div>
  <div class="hero-art">
    ${picture('olivia-aquarelle', "Portrait d'Olivia à l'aquarelle, éclats de couleurs", { sizesAttr: '(min-width: 1024px) 46vw, 90vw', eager: true })}
  </div>
</section>

<figure class="band">
  ${picture('planchette', 'Planchette de charcuteries italiennes, fromages, raisins et noix sur une planche en bois', { sizesAttr: '100vw' })}
  <figcaption class="wrap muted">Nos petites planchettes, à partager dès l'apéritif</figcaption>
</figure>

<section class="section wrap carte-index" aria-labelledby="carte-title">
  <div class="carte-index-intro">
    <h2 class="display-2" id="carte-title">La carte</h2>
    <p class="lead">Cinq rubriques, de l'apéritif au dessert. Les prix sont indiqués en euros.</p>
    ${picture('planche-italienne', 'Planche italienne à partager', { sizesAttr: '(min-width: 1024px) 34vw, 100vw', cls: 'rounded' })}
  </div>
  <ol class="index-list">
    ${menu.categories.map((c, i) => `<li><a href="/carte/#${c.id}">
      <span class="index-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="index-body"><span class="index-title">${esc(c.title)}</span><span class="index-sum">${esc(c.summary)}</span></span>
      ${icon('arrow')}
    </a></li>`).join('')}
  </ol>
</section>

<section class="section night" aria-labelledby="sugg-title">
  <div class="wrap night-grid">
    <div>
      <h2 class="display-2" id="sugg-title">Les suggestions du moment</h2>
      <p class="lead">En plus de la carte, les propositions du chef en ce moment.</p>
      <ul class="dishes dishes-night">${featured.map(dish).join('')}</ul>
      <a class="link-arrow" href="/carte/">Toute la carte${icon('arrow')}</a>
    </div>
    ${picture('pluma-iberico', 'Pluma iberico, sauce tomatée-chorizo et poêlée de légumes', { sizesAttr: '(min-width: 1024px) 40vw, 100vw', cls: 'rounded night-img' })}
  </div>
</section>

<section class="section wrap bar" aria-labelledby="bar-title">
  <div class="bar-feature">
    <p class="kicker">${splash}Signature d'Olivia</p>
    <h2 class="display-2" id="bar-title">${esc(spritz.name)}</h2>
    <p class="lead">${esc(spritz.desc)}.</p>
    <p class="bar-price">${euro(spritz.price)}</p>
  </div>
  <div class="bar-copy">
    <p>Au bar, des bières au fût et en bouteille dont plusieurs brassées tout près : la Saison Dupont de Tourpes, la Tournay de Templeuve, la Bonsecours Prestige de chez Caulier. Des vins au verre, des bulles belges du Domaine du Chenoy, des gin tonic et des mocktails pour tout le monde.</p>
    <a class="link-arrow" href="/carte/#boissons">Voir les boissons${icon('arrow')}</a>
  </div>
</section>

<section class="section wrap infos" id="infos" aria-labelledby="infos-title">
  <h2 class="display-2" id="infos-title">Infos pratiques</h2>
  <div class="infos-grid">
    <div class="info">
      <h3 class="info-label">Adresse</h3>
      <p class="info-value">${ADDRESS.street}<br>${ADDRESS.zip} ${ADDRESS.city}</p>
      <div class="actions">
        <a class="btn btn-primary" href="${ROUTE}" rel="noopener" target="_blank">${icon('route')}Itinéraire</a>
        <a class="btn btn-ghost" href="${MAPS}" rel="noopener" target="_blank">${icon('pin')}Google Maps</a>
      </div>
    </div>
    <div class="info">
      <h3 class="info-label">Réservations</h3>
      <p class="info-value"><a href="tel:${PHONE.tel}">${PHONE.display}</a></p>
      <p class="muted">Par téléphone uniquement</p>
    </div>
    <div class="info">
      <h3 class="info-label">Réseaux sociaux</h3>
      <ul class="plain social">
        <li><a href="${SOCIAL.instagram}" rel="noopener" target="_blank">${icon('instagram')}@olivia_boire.et.manger</a></li>
        <li><a href="${SOCIAL.facebook}" rel="noopener" target="_blank">${icon('facebook')}Olivia sur Facebook</a></li>
      </ul>
    </div>
  </div>
</section>
`,
});

const menuLd = {
  '@context': 'https://schema.org',
  '@type': 'Menu',
  name: 'La carte d\'Olivia',
  inLanguage: 'fr',
  url: SITE + '/carte/',
  hasMenuSection: menu.categories.map(c => ({
    '@type': 'MenuSection',
    name: c.title,
    hasMenuItem: c.groups.flatMap(g => g.items).filter(i => i.price != null).map(i => ({
      '@type': 'MenuItem', name: i.name, ...(i.desc && { description: i.desc }),
      offers: { '@type': 'Offer', price: i.price.toFixed(2), priceCurrency: 'EUR' },
    })),
  })),
};

const carte = page({
  path: '/carte/',
  title: 'La carte · Olivia, Grand-Place de Tournai',
  description: 'La carte complète d\'Olivia à Tournai : restaurant, tapas, boissons, desserts et menu enfants, avec les prix.',
  bodyClass: 'carte',
  ld: [menuLd],
  body: `
<div class="wrap carte-top">
  <h1 class="display-1">La carte</h1>
  <p class="muted">Mise à jour le <time datetime="${menu.updated}">${longDate(menu.updated)}</time> · Prix en euros</p>
  <p class="offline-note" hidden>Vous êtes hors connexion : cette carte date de la dernière visite et les prix peuvent avoir changé.</p>
</div>
<nav class="cat-nav" aria-label="Rubriques de la carte">
  <div class="wrap cat-nav-row">${menu.categories.map(c => `<a href="#${c.id}">${esc(c.title)}</a>`).join('')}</div>
</nav>
<div class="wrap carte-body">
  ${menu.categories.map(category).join('\n')}
  <aside class="allergens">
    <h2 class="group-title">Allergènes</h2>
    <p>Pour toute demande d'information concernant les allergènes présents dans nos produits, veuillez vous adresser au personnel. La composition de nos produits peut varier d'un jour à l'autre.</p>
  </aside>
</div>
`,
});

const offline = page({
  path: '/offline/',
  title: 'Hors connexion · Olivia',
  description: 'Vous êtes hors connexion.',
  bodyClass: 'simple',
  body: `<section class="wrap simple-page">
  <h1 class="display-1">Pas de réseau pour l'instant</h1>
  <p class="lead">La page demandée n'est pas disponible hors connexion. Vous pouvez toujours nous appeler pour réserver.</p>
  <div class="actions">
    <a class="btn btn-primary" href="tel:${PHONE.tel}">${icon('phone')}${PHONE.display}</a>
    <a class="btn btn-ghost" href="/">Réessayer</a>
  </div>
  <p class="muted">${ADDRESS.street}, ${ADDRESS.zip} ${ADDRESS.city}</p>
</section>`,
});

const notFound = page({
  path: '/404',
  title: 'Page introuvable · Olivia',
  description: 'Cette page n\'existe pas.',
  bodyClass: 'simple',
  body: `<section class="wrap simple-page">
  <h1 class="display-1">Cette page n'existe pas</h1>
  <p class="lead">Elle a peut-être changé d'adresse. La carte et nos coordonnées sont toujours là.</p>
  <div class="actions">
    <a class="btn btn-primary" href="/carte/">Voir la carte</a>
    <a class="btn btn-ghost" href="/">Accueil</a>
  </div>
</section>`,
});

const write = (p, s) => { fs.mkdirSync(p.replace(/\/[^/]+$/, ''), { recursive: true }); fs.writeFileSync(p, s); };
write('dist/index.html', home);
write('dist/carte/index.html', carte);
write('dist/offline/index.html', offline.replace('<meta name="description"', '<meta name="robots" content="noindex">\n<meta name="description"'));
write('dist/404.html', notFound.replace('<meta name="description"', '<meta name="robots" content="noindex">\n<meta name="description"'));
write('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
write('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['/', '/carte/'].map(p => `  <url><loc>${SITE}${p}</loc><lastmod>${menu.updated}</lastmod></url>`).join('\n')}\n</urlset>\n`);

// Service worker: version = hash of everything it caches, so any content change ships a new cache.
const precache = ['/', '/carte/', '/offline/', cssFile, jsFile, '/fonts/fraunces.woff2', '/fonts/instrument-sans.woff2', '/icons/icon-192.png', '/manifest.webmanifest'];
const version = hash(home + carte + offline + css + js);
write('dist/sw.js', fs.readFileSync('src/sw.js', 'utf8').replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(precache)));

console.log(`built dist/ (sw ${version}, ${menu.categories.reduce((n, c) => n + c.groups.reduce((m, g) => m + g.items.length, 0), 0)} menu items) for ${SITE}`);
