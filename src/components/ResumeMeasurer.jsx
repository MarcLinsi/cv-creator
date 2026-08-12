import { useEffect, useLayoutEffect, useRef } from 'react'
import { blockKey, titleKey } from '../lib/paginate'

/**
 * Mesure hors écran tout ce dont le moteur de pagination a besoin, puis remonte
 * le résultat. Rien n'est calculé de tête : les hauteurs sont relevées sur de
 * vrais cadres de page du template courant, à la largeur de colonne réelle et
 * avec la police et l'échelle de texte réelles. Une constante en dur se
 * périmerait au premier changement de template ou de taille de texte.
 *
 * Trois cadres sont montés :
 *   1. page 1 à colonne vide      -> capacité d'une colonne de la page 1
 *   2. page 2 à colonne vide      -> capacité des pages suivantes, qui diffère
 *                                    puisqu'elles ne portent pas le bandeau
 *   3. page 1 remplie             -> hauteur de chaque titre et de chaque bloc
 *
 * Les capacités se lisent sur une colonne *vide*, jamais sur la zone de flux :
 * `clientHeight` inclut le padding, et une colonne pleine s'étire au-delà de la
 * hauteur disponible. Dans les deux cas le moteur croirait avoir plus de place
 * qu'il n'y en a, et la colonne déborderait.
 */
export default function ResumeMeasurer({ template, data, sections, accent, appearance, t, onMeasure }) {
  const { Page, Banner, SectionTitle, columns, columnGap } = template
  const firstCapacityRef = useRef(null)
  const restCapacityRef = useRef(null)
  const itemRefs = useRef(new Map())
  const lastSignature = useRef('')

  const setItemRef = (key) => (el) => {
    if (el) itemRefs.current.set(key, el)
    else itemRefs.current.delete(key)
  }

  const measure = () => {
    const firstCol = firstCapacityRef.current
    const restCol = restCapacityRef.current
    if (!firstCol || !restCol) return

    const heights = {}
    itemRefs.current.forEach((el, key) => {
      heights[key] = el.getBoundingClientRect().height
    })

    const metrics = {
      firstPageColumnHeight: firstCol.clientHeight,
      restPageColumnHeight: restCol.clientHeight,
      heights,
    }

    // Sans cette garde, chaque mesure déclencherait un rendu qui déclencherait
    // une mesure : on ne remonte que ce qui a réellement bougé.
    const signature = JSON.stringify(metrics)
    if (signature === lastSignature.current) return
    lastSignature.current = signature
    onMeasure(metrics)
  }

  // La mesure est republiée dans une ref à chaque rendu pour que l'effet
  // "polices prêtes", monté une seule fois, appelle toujours la version
  // courante sans se rejouer.
  const measureRef = useRef(measure)
  useLayoutEffect(() => {
    measureRef.current = measure
    measure()
  })

  // Les polices web arrivent après le premier rendu et changent les hauteurs :
  // on remesure une fois qu'elles sont prêtes.
  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) measureRef.current()
    })
    return () => {
      cancelled = true
    }
  }, [])

  const offScreen = {
    position: 'absolute',
    left: -99999,
    top: 0,
    pointerEvents: 'none',
    boxShadow: 'none',
    '--cv-accent': accent,
    '--cv-fs': appearance.scale,
  }

  const grid = (children) => (
    <div
      className="grid h-full"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap }}
    >
      {children}
    </div>
  )

  const frame = (pageIndex, children, ref) => (
    <div className="cv-page" data-font={appearance.font} style={offScreen}>
      <Page
        data={data}
        accent={accent}
        pageIndex={pageIndex}
        pageCount={pageIndex + 1}
        t={t}
        banner={pageIndex === 0 && Banner ? <Banner data={data} accent={accent} t={t} /> : null}
      >
        {grid(
          <div ref={ref} className="cv-flow-col min-w-0">
            {children}
          </div>,
        )}
      </Page>
    </div>
  )

  return (
    <div aria-hidden className="cv-measure">
      {frame(0, null, firstCapacityRef)}
      {frame(1, null, restCapacityRef)}

      {/* Cadre de mesure du contenu : même largeur de colonne que ci-dessus, ce
          qui compte puisque la hauteur d'un bloc dépend de ses retours à la
          ligne. Il déborde de la page, sans conséquence : on ne lit que la
          hauteur de chaque élément, laquelle vient de la mise en page. */}
      {frame(
        0,
        sections.map((section) => (
          <div key={section.key}>
            <div ref={setItemRef(titleKey(section.key, false))}>
              <SectionTitle section={section} accent={accent} t={t} repeated={false} gapBefore={false} />
            </div>
            <div ref={setItemRef(titleKey(section.key, true))}>
              <SectionTitle section={section} accent={accent} t={t} repeated gapBefore={false} />
            </div>
            {section.blocks.map((block) => (
              <div key={block.key} ref={setItemRef(blockKey(section.key, block.key))}>
                {block.node}
              </div>
            ))}
          </div>
        )),
        null,
      )}
    </div>
  )
}
