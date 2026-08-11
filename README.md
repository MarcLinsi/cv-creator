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
- **Export PDF vectoriel** — voir ci-dessous

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
