# Graph Report - OLIVIA  (2026-11-17)

## Corpus Check
- 14 files · ~9,707 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .avif 9, (none) 2, .woff2 2)

## Summary
- 142 nodes · 173 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e438e8bb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- with
- build.mjs
- package.json
- site.test.mjs
- deploy.yml
- esc
- Olivia — site web et application (PWA)
- scripts
- main.js
- icon
- sw.js
- groupId

## God Nodes (most connected - your core abstractions)
1. `esc()` - 9 edges
2. `scripts` - 8 edges
3. `with` - 6 edges
4. `icon()` - 6 edges
5. `category()` - 6 edges
6. `playwright` - 6 edges
7. `Olivia — site web et application (PWA)` - 6 edges
8. `deploy` - 5 edges
9. `steps` - 5 edges
10. `dish()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `home` --calls--> `esc()`  [EXTRACTED]
  build.mjs → build.mjs  _Bridges community 5 → community 11_
- `category()` --calls--> `groupId()`  [EXTRACTED]
  build.mjs → build.mjs  _Bridges community 13 → community 5_

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "with"
Cohesion: 0.11
Nodes (21): if, needs, runs-on, steps, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, SITE_URL, jobs (+13 more)

### Community 1 - "build.mjs"
Cohesion: 0.09
Nodes (17): ADDRESS, css, featured, ICONS, js, menu, menuLd, notFound (+9 more)

### Community 2 - "package.json"
Cohesion: 0.08
Nodes (21): description, devDependencies, axe-core@^4.10.3, playwright@^1.56.1, sharp@^0.34.4, wrangler@^4.164.0, engines, node (+13 more)

### Community 3 - "site.test.mjs"
Cohesion: 0.15
Nodes (7): port, root, server, types, axeSource, PAGES, VIEWPORTS

### Community 4 - "deploy.yml"
Cohesion: 0.18
Nodes (9): concurrency, cancel-in-progress, group, name, on, pull_request, push, workflow_dispatch (+1 more)

### Community 5 - "esc"
Cohesion: 0.39
Nodes (8): carte, category(), dish(), esc(), euro(), picture(), priceHtml(), tagHtml()

### Community 6 - "Olivia — site web et application (PWA)"
Cohesion: 0.22
Nodes (9): Commandes, Déploiement automatique (GitHub), Hébergement : Cloudflare (Pages, désormais intégré à Workers), Informations à compléter, Mettre en ligne depuis ce poste, Modifier la carte (le plus courant), Nom de domaine personnalisé, Olivia — site web et application (PWA) (+1 more)

### Community 8 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, deploy, icons, images, preview, serve, test

### Community 9 - "main.js"
Cohesion: 0.29
Nodes (4): cats, install, note, tabs

### Community 11 - "icon"
Cohesion: 0.67
Nodes (4): footer(), home, icon(), page()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playwright` connect `package.json` to `site.test.mjs`?**
  _High betweenness centrality (0.378) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `category()` (e.g. with `build.mjs` and `dish()`) actually correct?**
  _`category()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `with` be split into smaller, more focused modules?**
  _Cohesion score 0.10952380952380952 - nodes in this community are weakly interconnected._
- **Why does `jobs` connect `with` to `deploy.yml`?**
  _High betweenness centrality (0.225) - this node is a cross-community bridge._
- **Should `build.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07956989247311828 - nodes in this community are weakly interconnected._