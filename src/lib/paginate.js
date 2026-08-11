/**
 * Répartition du contenu d'un CV en pages et en colonnes.
 *
 * Le principe : le contenu n'est pas un bloc qu'on étire puis qu'on découpe,
 * c'est une liste de blocs qu'on distribue. Chaque bloc n'apparaît donc qu'une
 * fois, chaque page connaît ses propres bords, et une section qui déborde
 * reprend en tête de la colonne suivante avec son titre réécrit.
 *
 * Le module ne touche pas au DOM : il reçoit des hauteurs déjà mesurées et rend
 * un plan de pages. C'est ce qui le rend testable et ce qui garantit que
 * l'aperçu et le PDF affichent exactement la même chose — ils consomment le
 * même plan.
 */

/**
 * Clé de mesure du titre d'une section. Les deux variantes sont mesurées
 * séparément : la reprise porte une mention « (suite) » qui peut la faire
 * passer sur une ligne de plus, et supposer les deux identiques suffirait à
 * faire déborder la colonne.
 */
export const titleKey = (sectionKey, repeated = false) =>
  `title:${sectionKey}:${repeated ? 'suite' : 'initial'}`

/** Clé de mesure d'un bloc. */
export const blockKey = (sectionKey, key) => `block:${sectionKey}:${key}`

/**
 * @param {object}   o
 * @param {Array}    o.sections     [{ key, title, blocks: [{ key, keepWithNext }] }]
 * @param {object}   o.heights      hauteurs mesurées, indexées par titleKey/blockKey
 * @param {number}   o.firstPageColumnHeight  hauteur utile d'une colonne, page 1
 * @param {number}   o.restPageColumnHeight   hauteur utile d'une colonne, pages suivantes
 * @param {number}   o.columns      nombre de colonnes par page
 * @param {number}   o.sectionGap   espace inséré avant une section qui n'ouvre pas la colonne
 * @returns {Array}  [{ columns: [ [item, …], … ] }]
 *                   item = { type: 'title', sectionKey, repeated, gapBefore }
 *                        | { type: 'block', sectionKey, key }
 */
export function paginate({
  sections,
  heights,
  firstPageColumnHeight,
  restPageColumnHeight,
  columns = 1,
  sectionGap = 0,
}) {
  const pages = []
  let column = null
  let capacity = 0
  let used = 0

  const heightOf = (key) => heights[key] ?? 0

  // Ouvre une colonne, en ouvrant une page si la précédente est pleine.
  const openColumn = () => {
    if (pages.length === 0 || pages[pages.length - 1].columns.length >= columns) {
      pages.push({ columns: [] })
    }
    const page = pages[pages.length - 1]
    column = []
    page.columns.push(column)
    capacity = pages.length === 1 ? firstPageColumnHeight : restPageColumnHeight
    used = 0
  }

  const columnHasTitleFor = (sectionKey) =>
    column.some((item) => item.type === 'title' && item.sectionKey === sectionKey)

  openColumn()

  for (const section of sections) {
    if (!section.blocks?.length) continue
    // Passe à true dès qu'un bloc de la section est posé : les titres suivants
    // sont alors des reprises, pas des ouvertures.
    let sectionOpened = false

    for (let i = 0; i < section.blocks.length; i++) {
      // Un bloc marqué keepWithNext ne doit pas rester seul en pied de colonne
      // (un intitulé de poste sans sa première puce, un sous-titre sans sa
      // première ligne) : on le déplace avec ce qui le suit.
      const group = [section.blocks[i]]
      while (group[group.length - 1].keepWithNext && i + group.length < section.blocks.length) {
        group.push(section.blocks[i + group.length])
      }

      const groupHeight = group.reduce((sum, b) => sum + heightOf(blockKey(section.key, b.key)), 0)
      const needsTitle = !columnHasTitleFor(section.key)
      const gapBefore = needsTitle && used > 0
      const needed =
        groupHeight +
        (needsTitle ? heightOf(titleKey(section.key, sectionOpened)) : 0) +
        (gapBefore ? sectionGap : 0)

      // On ne renvoie à la colonne suivante que si la courante a déjà servi :
      // sinon un groupe plus haut qu'une colonne boucherait indéfiniment.
      if (used > 0 && used + needed > capacity) openColumn()

      if (!columnHasTitleFor(section.key)) {
        const gap = used > 0 ? sectionGap : 0
        column.push({
          type: 'title',
          sectionKey: section.key,
          repeated: sectionOpened,
          gapBefore: gap > 0,
        })
        used += heightOf(titleKey(section.key, sectionOpened)) + gap
      }

      for (const block of group) {
        column.push({ type: 'block', sectionKey: section.key, key: block.key })
        used += heightOf(blockKey(section.key, block.key))
      }

      sectionOpened = true
      i += group.length - 1
    }
  }

  // Complète la dernière page pour que toutes aient le même nombre de colonnes.
  const last = pages[pages.length - 1]
  while (last && last.columns.length < columns) last.columns.push([])

  return pages
}
