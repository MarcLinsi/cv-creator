import ModernTemplate from './ModernTemplate'
import ClassicTemplate from './ClassicTemplate'
import MinimalTemplate from './MinimalTemplate'
import VertTemplate from './VertTemplate'

/**
 * Chaque template décrit sa page plutôt que de dessiner un document entier :
 *   columns / columnGap / sectionGap  géométrie du flux
 *   Page({ data, accent, pageIndex, pageCount, banner, children })
 *                                     cadre remonté à l'identique sur chaque
 *                                     page ; expose la zone de flux en .cv-flow
 *   Banner({ data, accent })          bandeau de tête, page 1 seulement (ou null)
 *   SectionTitle({ section, accent, repeated, gapBefore })
 *   buildSections({ data, accent })   [{ key, title, blocks: [{ key, keepWithNext, node }] }]
 *
 * C'est le moteur (src/lib/paginate.js) qui répartit les blocs ; un template ne
 * décide jamais où tombe une coupure.
 */
export const templates = {
  vert: VertTemplate,
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
}

export const templateKeys = Object.keys(templates)
