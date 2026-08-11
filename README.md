# CV-Gen

Générateur de CV dans le navigateur : on remplit un formulaire à gauche, l'aperçu A4 se met à jour en direct à droite, et on exporte le résultat en PDF multi-pages.

Application 100 % front-end — aucun serveur, aucune donnée envoyée nulle part. Tout reste dans l'onglet.

## Fonctionnalités

- **4 templates** — Vert, Moderne, Classique, Minimal, interchangeables à tout moment sans perdre les données saisies
- **Aperçu A4 fidèle** — rendu à 794 × 1123 px (210 × 297 mm @ 96 dpi), mis à l'échelle pour tenir dans la colonne
- **Pagination automatique** — la hauteur réelle du contenu est mesurée hors écran, le nombre de feuilles A4 se recalcule à chaque modification
- **Clic pour éditer** — survoler un bloc de l'aperçu le surligne, cliquer dessus place le focus sur le champ correspondant dans l'éditeur
- **Apparence** — choix de la police, de la taille du texte et de la couleur d'accent (8 teintes, chaque template ayant la sienne par défaut)
- **Photo optionnelle** — chargée depuis le disque, encodée dans la page
- **Export PDF** — capture unique du document complet, découpée en pages A4

## Stack

React 19 · Vite · TailwindCSS 3 · html2canvas + jsPDF pour l'export

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
  App.jsx                 Layout, pagination A4, export PDF
  components/Editor.jsx   Formulaire d'édition (infos, expériences, formations, compétences, langues)
  data/resume.js          Forme du modèle de CV + jeu de données d'exemple
  templates/              Un composant par template, plus l'index qui les enregistre
  index.css               Styles de la page CV et variables d'accent
```

### Ajouter un template

Créer un composant dans `src/templates/` qui reçoit `{ data, accent }` et rend le CV, puis l'enregistrer dans `src/templates/index.js` :

```js
export const templates = {
  // …
  monTemplate: { label: 'Mon template', Component: MonTemplate, defaultAccent: '#0d9488' },
}
```

Il apparaît automatiquement dans le sélecteur de la barre du haut.

Pour que le clic-pour-éditer fonctionne, marquer les blocs du template avec `data-edit-id` correspondant aux identifiants de champs utilisés par l'éditeur.

## Données

`src/data/resume.js` contient un CV d'exemple fictif qui sert d'état initial. Les champs sont en français (`prenom`, `poste`, `entreprise`, `competences`…) et tous les templates consomment cette même forme.

## Licence

[MIT](LICENSE)
