function lines(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean)
}

/**
 * La colonne latérale colorée fait partie du cadre : elle est donc redessinée
 * sur chaque page, et seul le contenu de la colonne principale est paginé.
 * Ses rubriques (contact, compétences, langues) restent hors du flux, comme
 * dans le rendu d'origine.
 */
function Sidebar({ data, accent, pageIndex }) {
  const { infos } = data
  return (
    <aside className="w-[34%] shrink-0 p-6 text-white" style={{ backgroundColor: accent }}>
      {pageIndex === 0 ? (
        <>
          {infos.photo && (
            <img
              src={infos.photo}
              alt=""
              className="mb-4 h-28 w-28 rounded-full object-cover ring-4 ring-white/30"
            />
          )}
          <h1 data-edit-id="infos" className="text-xl font-bold leading-tight">
            {infos.prenom} {infos.nom}
          </h1>
          <p data-edit-id="infos" className="mt-1 text-sm text-white/80">
            {infos.titre}
          </p>
        </>
      ) : (
        // Sur les pages suivantes, un rappel discret suffit : réafficher le
        // bloc d'identité complet mangerait la hauteur utile.
        <p data-edit-id="infos" className="text-sm font-bold leading-tight">
          {infos.prenom} {infos.nom}
        </p>
      )}

      <div
        data-edit-id="infos"
        className="mt-6 space-y-1.5 text-[length:calc(var(--cv-fs)*11px)] text-white/90"
      >
        {infos.email && <p>✉ {infos.email}</p>}
        {infos.telephone && <p>☎ {infos.telephone}</p>}
        {infos.ville && <p>⚲ {infos.ville}</p>}
        {infos.site && <p>🔗 {infos.site}</p>}
      </div>

      {data.competences.length > 0 && (
        <div className="mt-6" data-edit-id="competences">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider">Compétences</h2>
          <ul className="space-y-1">
            {data.competences.map((c, i) => (
              <li key={i} className="text-[length:calc(var(--cv-fs)*11px)] text-white/90">
                • {c.nom}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.langues.length > 0 && (
        <div className="mt-6" data-edit-id="langues">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider">Langues</h2>
          <ul className="space-y-1">
            {data.langues.map((l, i) => (
              <li key={i} className="text-[length:calc(var(--cv-fs)*11px)] text-white/90">
                <span className="font-medium">{l.langue}</span>
                {l.niveau && <span className="text-white/70"> — {l.niveau}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}

function Page({ data, accent, pageIndex, children }) {
  return (
    <div className="flex h-full min-h-full font-sans text-[length:calc(var(--cv-fs)*12px)] leading-relaxed text-slate-700">
      <Sidebar data={data} accent={accent} pageIndex={pageIndex} />
      <main className="cv-flow min-h-0 flex-1 overflow-hidden p-7">{children}</main>
    </div>
  )
}

function SectionTitle({ section, accent, repeated, gapBefore }) {
  return (
    <h2
      className={`pb-3 text-sm font-bold uppercase tracking-wide${gapBefore ? ' pt-6' : ''}`}
      style={{ color: accent }}
    >
      {section.title}
      {repeated && <span className="ml-2 text-xs font-normal normal-case tracking-normal opacity-60">(suite)</span>}
    </h2>
  )
}

function buildSections({ data }) {
  const sections = []

  if (data.resume) {
    sections.push({
      key: 'profil',
      title: 'Profil',
      blocks: [
        {
          key: 'texte',
          node: (
            <p className="pb-6 text-[length:calc(var(--cv-fs)*12px)]" data-edit-id="resume">
              {data.resume}
            </p>
          ),
        },
      ],
    })
  }

  if (data.experiences.length) {
    const blocks = []
    data.experiences.forEach((exp, i) => {
      const bullets = lines(exp.description)
      blocks.push({
        key: `${i}:head`,
        keepWithNext: bullets.length > 0,
        node: (
          <div className={bullets.length ? '' : 'pb-4'} data-edit-id={`experiences.${i}`}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[length:calc(var(--cv-fs)*13px)] font-semibold text-slate-800">{exp.poste}</h3>
              <span className="text-[length:calc(var(--cv-fs)*11px)] text-slate-500">
                {exp.debut} – {exp.fin}
              </span>
            </div>
            <p className="text-[length:calc(var(--cv-fs)*11px)] font-medium" style={{ color: 'var(--cv-accent)' }}>
              {exp.entreprise}
              {exp.lieu && ` · ${exp.lieu}`}
            </p>
          </div>
        ),
      })
      bullets.forEach((line, j) => {
        blocks.push({
          key: `${i}:b${j}`,
          node: (
            <ul
              className={`list-disc pl-4 text-[length:calc(var(--cv-fs)*11.5px)] ${
                j === bullets.length - 1 ? 'pb-4' : 'pb-0.5'
              } ${j === 0 ? 'pt-1' : ''}`}
              data-edit-id={`experiences.${i}`}
            >
              <li>{line}</li>
            </ul>
          ),
        })
      })
    })
    sections.push({ key: 'experiences', title: 'Expériences', blocks })
  }

  if (data.formations.length) {
    sections.push({
      key: 'formations',
      title: 'Formation',
      blocks: data.formations.map((f, i) => ({
        key: String(i),
        node: (
          <div className="pb-3" data-edit-id={`formations.${i}`}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[length:calc(var(--cv-fs)*13px)] font-semibold text-slate-800">{f.diplome}</h3>
              <span className="text-[length:calc(var(--cv-fs)*11px)] text-slate-500">
                {f.debut} – {f.fin}
              </span>
            </div>
            <p className="text-[length:calc(var(--cv-fs)*11px)] text-slate-600">
              {f.etablissement}
              {f.lieu && ` · ${f.lieu}`}
            </p>
          </div>
        ),
      })),
    })
  }

  return sections
}

export default {
  label: 'Moderne',
  defaultAccent: '#4f46e5',
  columns: 1,
  columnGap: 0,
  sectionGap: 24,
  Page,
  Banner: null,
  SectionTitle,
  buildSections,
}
