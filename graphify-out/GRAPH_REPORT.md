# Graph Report - OLIVIA  (2026-11-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 141 nodes · 167 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13

## God Nodes (most connected - your core abstractions)
1. `esc()` - 9 edges
2. `playwright` - 7 edges
3. `icon()` - 6 edges
4. `category()` - 6 edges
5. `scripts` - 6 edges
6. `10. HÉBERGEMENT WEB ET MISE EN PRODUCTION` - 6 edges
7. `11. MÉTHODOLOGIE DE TRAVAIL` - 6 edges
8. `UTILISATION OBLIGATOIRE DES OUTILS CLAUDE CODE` - 6 edges
9. `dish()` - 5 edges
10. `5. FONCTIONNALITÉS ET ERGONOMIE` - 5 edges

## Surprising Connections (you probably didn't know these)
- `home` --calls--> `esc()`  [EXTRACTED]
  build.mjs → build.mjs  _Bridges community 5 → community 11_
- `category()` --calls--> `groupId()`  [EXTRACTED]
  build.mjs → build.mjs  _Bridges community 13 → community 5_
- `playwright@^1.56.1` --declares--> `playwright`  [EXTRACTED]
  package.json → package.json  _Bridges community 4 → community 2_

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (24): 10.1 Choix de l'hébergement, 10.2 Configuration de l'hébergement, 10.3 Nom de domaine, 10.4 Déploiement automatisé, 10.5 Vérifications après mise en ligne, 10. HÉBERGEMENT WEB ET MISE EN PRODUCTION, 12. EXIGENCE FINALE, 1. ANALYSE DU SITE EXISTANT (+16 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (17): ADDRESS, css, featured, ICONS, js, menu, menuLd, notFound (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (7): playwright, jobs, sizes, [out, id], [out, ...pages], [out = '.shots', base = 'http://localhost:4173'], views

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (7): port, root, server, types, axeSource, PAGES, VIEWPORTS

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (13): description, devDependencies, axe-core@^4.10.3, playwright@^1.56.1, sharp@^0.34.4, engines, node, name (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.39
Nodes (8): carte, category(), dish(), esc(), euro(), picture(), priceHtml(), tagHtml()

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (6): 1. PONYTAIL, 2. GRAPHIFY, 3. AGENT SKILLS, 4. UNSLOP, Règles d'utilisation, UTILISATION OBLIGATOIRE DES OUTILS CLAUDE CODE

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (6): 11. MÉTHODOLOGIE DE TRAVAIL, PHASE 1 — AUDIT, PHASE 2 — CONCEPTION, PHASE 3 — DÉVELOPPEMENT, PHASE 4 — FINITIONS, PHASE 5 — PRODUCTION

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (6): scripts, build, icons, images, serve, test

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (3): install, note, tabs

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (5): 7.1 PONYTAIL, 7.2 GRAPHIFY, 7.3 AGENT SKILLS, 7. UTILISATION OBLIGATOIRE DES 3 OUTILS CLAUDE, Règles d'utilisation des trois outils

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (4): footer(), home, icon(), page()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playwright` connect `Community 2` to `Community 3`, `Community 4`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `category()` (e.g. with `build.mjs` and `dish()`) actually correct?**
  _`category()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Community 8` to `Community 4`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Why does `sharp` connect `Community 4` to `Community 2`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1323529411764706 - nodes in this community are weakly interconnected._