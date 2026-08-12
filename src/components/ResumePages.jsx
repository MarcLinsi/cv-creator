/**
 * Rend un plan de pages produit par `paginate`.
 *
 * L'aperçu et la source du PDF montent tous les deux ce composant avec le même
 * plan : les deux rendus ne peuvent donc pas diverger. Le cadre de page, le
 * bandeau et les titres de section viennent du template ; ce composant ne
 * s'occupe que de poser les colonnes et d'y distribuer les éléments du plan.
 */
export default function ResumePages({
  template,
  data,
  sections,
  accent,
  appearance,
  pages,
  t,
  lang,
  interactive = false,
  handlers,
}) {
  const { Page, Banner, SectionTitle, columns, columnGap } = template

  // Index section -> blocs, pour retrouver en O(1) le nœud que le plan désigne.
  const index = new Map(
    sections.map((section) => [
      section.key,
      { section, blocks: new Map(section.blocks.map((b) => [b.key, b.node])) },
    ]),
  )

  return pages.map((page, pageIndex) => (
    <div
      key={pageIndex}
      className="cv-page"
      // La langue du document, distincte de celle de l'interface : c'est elle
      // qui gouverne la césure du navigateur dans le PDF.
      lang={lang}
      data-font={appearance.font}
      style={{ '--cv-accent': accent, '--cv-fs': appearance.scale }}
      onMouseOver={interactive ? handlers?.onMouseOver : undefined}
      onMouseLeave={interactive ? handlers?.onMouseLeave : undefined}
      onClick={interactive ? handlers?.onClick : undefined}
    >
      <Page
        data={data}
        accent={accent}
        t={t}
        pageIndex={pageIndex}
        pageCount={pages.length}
        banner={pageIndex === 0 && Banner ? <Banner data={data} accent={accent} t={t} /> : null}
      >
        <div
          className="grid h-full"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap }}
        >
          {page.columns.map((column, columnIndex) => (
            <div key={columnIndex} className="cv-flow-col min-w-0">
              {column.map((item, itemIndex) => {
                const entry = index.get(item.sectionKey)
                if (!entry) return null
                if (item.type === 'title') {
                  return (
                    <SectionTitle
                      key={`t${itemIndex}`}
                      section={entry.section}
                      accent={accent}
                      t={t}
                      repeated={item.repeated}
                      gapBefore={item.gapBefore}
                    />
                  )
                }
                return <div key={`b${itemIndex}`}>{entry.blocks.get(item.key)}</div>
              })}
            </div>
          ))}
        </div>
      </Page>
    </div>
  ))
}
