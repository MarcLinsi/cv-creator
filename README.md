# CV-Gen

Générateur de CV dans le navigateur : on remplit un formulaire à gauche, l'aperçu A4 se met à jour en direct à droite, et on exporte le résultat en PDF multi-pages.

Application 100 % front-end — aucun serveur, aucune donnée envoyée nulle part. Tout reste dans l'onglet.

## Fonctionnalités

- **4 templates** — Vert, Moderne, Classique, Minimal, interchangeables à tout moment sans perdre les données saisies
- **Aperçu A4 fidèle** — pages composées à 210 × 297 mm, mises à l'échelle pour tenir dans la colonne
- **Pagination réelle** — voir ci-dessous : chaque page a son cadre, et une section qui déborde reprend page suivante avec son titre réécrit
- **Clic pour éditer** — survoler un bloc de l'aperçu le surligne, cliquer dessus place le focus sur le champ correspondant dans l'éditeur
- **Apparence** — choix de la police, de la taille du texte et de la couleur d'accent (8 teintes, chaque template ayant la sienne par défaut)
- **Photo optionnelle** — chargée depuis le disque, encodée dans la page
- **Deux langues indépendantes** — voir ci-dessous
- **Sauvegarde et import** — voir ci-dessous
- **Export PDF vectoriel** — voir ci-dessous

## Langues

Deux langues coexistent, et elles sont **indépendantes** :

- **la langue du site** pilote la barre du haut et l'éditeur. Elle se règle par le menu déroulant à côté de « Télécharger le PDF » ;
- **la langue du CV** ne pilote que les libellés non saisissables du document — titres de section, mention « (suite) », rubriques de la colonne latérale du template Moderne. Elle se règle dans le panneau **Apparence**, avec la police et la couleur, parce que c'est un réglage du document et non de l'application.

Le contenu saisi n'est jamais traduit : changer de langue ne touche qu'aux libellés que l'utilisateur ne peut pas modifier.

Par défaut la langue du CV **suit** celle du site. Ce suivi est un état à part entière (`cvLang: null`), distinct d'un choix explicite : tant qu'on n'a rien fixé, changer la langue du site emmène le CV avec elle ; dès qu'on fixe la langue du CV, elle ne bouge plus. On peut donc travailler en français sur un CV rédigé en anglais, et l'inverse.

La langue du site renseigne `<html lang>` — dont dépendent la césure et la correction orthographique des champs — et celle du CV renseigne le `lang` de chaque page A4, dont dépend la césure dans le PDF.

### Ajouter une langue

Copier [`src/i18n/fr.js`](src/i18n/fr.js), traduire, puis déclarer le fichier dans [`src/i18n/index.jsx`](src/i18n/index.jsx) :

```js
export const dictionaries = { fr, en, es }
```

Aucun autre fichier n'est à toucher : les sélecteurs se remplissent depuis ce registre. Chaque dictionnaire sépare `ui` (interface) de `cv` (document) — c'est cette séparation qui rend les deux langues indépendantes.

## Sauvegarde et import

**Sauvegarde automatique.** Le CV en cours est conservé dans le `localStorage` et rechargé à la visite suivante — template, couleur d'accent et réglages de texte compris. L'écriture est différée, sinon chaque frappe réécrirait tout le CV, photo comprise. Rien ne sort du navigateur.

**Export.** « Exporter » produit un `.json` nommé d'après l'identité saisie. Le fichier contient le modèle de données complet, photo incluse : le réimport est fidèle, sans perte.

**Import.** « Importer » accepte ce fichier, mais aussi un objet de CV nu — ce qu'on obtient en recopiant `sampleResume` à la main.

Un fichier importé est traité comme une entrée non fiable : il a pu être édité, tronqué, ou produit par une version antérieure. Tout passe donc par `normalizeResume` ([`src/lib/resumeFile.js`](src/lib/resumeFile.js)), qui **reconstruit** la structure champ par champ au lieu de faire confiance à celle du fichier. Concrètement :

| Entrée | Résultat |
| --- | --- |
| `experiences: "pas un tableau"` | `[]` |
| `prenom: { objet: 1 }` | `""`, et non `"[object Object]"` |
| `niveau: "beaucoup"` / `9999` | `80` (défaut) / `100` (borné) |
| `photo: "javascript:…"` | rejetée — seuls les data-URI d'image et les URL http(s) sont acceptés |
| `version` supérieure à la connue | refus explicite plutôt que dégradation silencieuse |

Sans ça, une valeur aberrante ne casserait pas l'import mais le rendu, bien plus loin et sans rapport visible avec sa cause.

Le format choisi est le JSON et non le CSV : le modèle est imbriqué et hétérogène — un objet `infos`, quatre listes aux colonnes différentes, des descriptions multi-lignes et une photo en base64. Aucune de ces formes ne tient dans un tableau plat sans perte ou sans rendre le fichier inmanipulable en tableur.

## Export PDF

Le PDF est produit par le moteur d'impression du navigateur (`@page` + `window.print()`), pas par une capture raster. Concrètement :

- le texte reste du **texte** — sélectionnable, cherchable, lisible par les robots ATS
- les icônes et le fond triangulé restent **vectoriels**, nets à n'importe quel zoom
- les polices sont **embarquées** dans le fichier
- le rendu ne peut pas diverger de l'aperçu, puisque c'est le même moteur qui dessine les deux

Chaque page A4 étant déjà composée dans le DOM, le navigateur n'a rien à fragmenter : il lui suffit de changer de feuille entre deux pages.

Au clic sur « Télécharger le PDF », la boîte de dialogue d'impression s'ouvre : choisir **« Enregistrer au format PDF »** comme destination. Le nom de fichier proposé (`CV_Prenom_Nom`) vient du titre du document, que l'app ajuste le temps de l'impression.

## Pagination

Le CV n'est pas un document qu'on étire puis qu'on découpe : c'est une liste de blocs qu'on répartit. Chaque template expose ses sections sous forme de blocs élémentaires — l'intitulé d'un poste, une puce, une ligne de langue — et le moteur les distribue en pages et en colonnes.

Ce choix est ce qui rend possible :

- **un cadre par page** — en-tête, marge haute et pied de page appartiennent à la page, pas au document, donc le pied de page est sur *toutes* les pages
- **la reprise des titres** — une section qui déborde repart en tête de la colonne suivante avec son titre réécrit, suivi de « (suite) »
- **des coupures propres** — un bloc `keepWithNext` (intitulé de poste, sous-titre) ne reste jamais orphelin en bas de colonne
- **aucune perte ni duplication** — chaque bloc est placé exactement une fois

Les hauteurs viennent d'une mesure hors écran ([`ResumeMeasurer`](src/components/ResumeMeasurer.jsx)) faite sur de vrais cadres du template courant, à la largeur de colonne réelle et avec la police et l'échelle de texte réelles — jamais de constante en dur, qui se périmerait au premier changement de template.

Deux pièges méritent d'être connus avant de toucher à un template :

- **espacer en `padding`, jamais en `margin`** : une marge fusionne avec celle de son conteneur et échappe à la mesure, si bien que le moteur croit la colonne moins remplie qu'elle ne l'est et la fait déborder ;
- **la capacité se lit sur une colonne vide** : `clientHeight` inclut le padding, et une colonne pleine s'étire au-delà de la hauteur disponible.

L'aperçu et la source du PDF consomment le **même** plan de pages ([`ResumePages`](src/components/ResumePages.jsx)) : les deux rendus ne peuvent pas diverger.

## Stack

React 19 · Vite · TailwindCSS 3 — aucune dépendance d'exécution pour le PDF

## Démarrage

```bash
npm install
npm run dev
```

L'application démarre sur http://localhost:5173.

## Docker

```bash
docker compose up --build
```

L'application est servie sur http://localhost:8080.

Sans compose :

```bash
docker build -t cv-gen . && docker run --rm -p 8080:80 cv-gen
```

L'image est construite en deux étapes. Node ne sert qu'à produire `dist/` ; l'image livrée est une `nginx:alpine` qui ne contient ni `node_modules`, ni sources, ni chaîne de build. Les fichiers de `dist/assets` portant un hash de contenu dans leur nom, ils sont mis en cache un an, tandis qu'`index.html` est explicitement exclu du cache — sinon un déploiement laisserait les navigateurs pointer vers les anciens assets.

`src/data/resume.perso.js` est exclu par le [.dockerignore](.dockerignore) : ce fichier de données personnelles n'entre ni dans le contexte de build, ni dans une image qu'on pourrait publier.

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement avec HMR |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Sert le build de production en local |
| `npm run lint` | ESLint sur tout le projet |

## Structure

```
src/
  App.jsx                        Assemblage : mesure → plan de pages → aperçu + source PDF
  lib/paginate.js                Moteur de répartition en pages et colonnes (pur, sans DOM)
  lib/resumeFile.js              Export/import JSON + normalisation défensive des entrées
  lib/storage.js                 Sauvegarde automatique dans le localStorage
  i18n/                          Un dictionnaire par langue (ui + cv) et le registre
  components/LanguageMenu.jsx    Menu déroulant de la langue du site
  components/ResumeMeasurer.jsx  Mesure hors écran des capacités et des hauteurs de blocs
  components/ResumePages.jsx     Rend un plan de pages (utilisé par l'aperçu et par le PDF)
  components/Editor.jsx          Formulaire d'édition
  data/resume.js                 Forme du modèle de CV + jeu de données d'exemple
  templates/                     Un descripteur par template, plus l'index qui les enregistre
  index.css                      Styles de la page CV, variables d'accent, règles d'impression
```

### Ajouter un template

Un template ne dessine pas un document : il décrit une page et fournit ses blocs. Créer un module dans `src/templates/` qui exporte par défaut :

```js
export default {
  label: 'Mon template',
  defaultAccent: '#0d9488',
  columns: 1,        // colonnes du flux par page
  columnGap: 0,
  sectionGap: 24,    // écart avant une section qui n'ouvre pas la colonne

  // Cadre remonté à l'identique sur CHAQUE page. Doit exposer sa zone de flux
  // avec la classe `cv-flow` — c'est là que le moteur lit la hauteur utile.
  Page: ({ data, accent, pageIndex, pageCount, banner, children }) => …,

  // Bandeau de tête, page 1 uniquement. `null` si le template n'en a pas.
  Banner: ({ data, accent }) => …,

  SectionTitle: ({ section, accent, repeated, gapBefore }) => …,

  // [{ key, title, blocks: [{ key, keepWithNext, node }] }]
  buildSections: ({ data, accent }) => …,
}
```

puis l'enregistrer dans `src/templates/index.js`. Il apparaît automatiquement dans le sélecteur de la barre du haut.

Découper `buildSections` **finement** : une puce par bloc plutôt qu'une expérience entière. C'est cette granularité qui permet au moteur de couper au bon endroit — un bloc plus haut qu'une colonne débordera, faute de pouvoir être scindé.

Pour que le clic-pour-éditer fonctionne, marquer les nœuds avec `data-edit-id` correspondant aux identifiants de champs utilisés par l'éditeur.

## Données

`src/data/resume.js` contient un CV d'exemple fictif qui sert d'état initial. Les champs sont en français (`prenom`, `poste`, `entreprise`, `competences`…) et tous les templates consomment cette même forme.

## Licence

[MIT](LICENSE)
