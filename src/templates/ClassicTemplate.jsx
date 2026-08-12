function lines(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean)
}

function Banner({ data, accent }) {
  const { infos } = data
  const contact = [infos.email, infos.telephone, infos.ville, infos.site].filter(Boolean)
  return (
    <header
      className="shrink-0 border-b-2 px-12 pb-4 pt-10 text-center"
      style={{ borderColor: accent }}
      data-edit-id="infos"
    >
      <h1 className="text-3xl font-bold tracking-wide text-slate-900">
        {infos.prenom} {infos.nom}
      </h1>
      {infos.titre && (
        <p className="mt-1 text-sm uppercase tracking-[0.2em]" style={{ color: accent }}>
          {infos.titre}
        </p>
      )}
      {contact.length > 0 && (
        <p className="mt-2 text-[length:calc(var(--cv-fs)*11px)] text-slate-600">{contact.join('  ·  ')}</p>
      )}
    </header>
  )
}

// Pas de footer dans ce template : le bas de page reste une marge blanche,
// comme dans le rendu d'origine. Seul le bandeau est réservé à la page 1.
function Page({ pageIndex, banner, children }) {
  return (
    <div className="flex h-full min-h-full flex-col font-serif text-[length:calc(var(--cv-fs)*12px)] leading-relaxed text-slate-800">
      {pageIndex === 0 ? banner : <div className="h-10 shrink-0" />}
      <div className="cv-flow min-h-0 flex-1 overflow-hidden px-12 py-6">{children}</div>
      <div className="h-10 shrink-0" />
    </div>
  )
}

function SectionTitle({ section, accent, t, repeated, gapBefore }) {
  return (
    <h2
      className={`pb-2 text-sm font-bold uppercase tracking-[0.15em]${gapBefore ? ' pt-5' : ''}`}
      style={{ color: accent }}
    >
      {section.title}
      {repeated && <span className="ml-2 text-xs font-normal normal-case tracking-normal text-slate-400">{t.suite}</span>}
    </h2>
  )
}

function buildSections({ data, t }) {
  const sections = []

  if (data.resume) {
    sections.push({
      key: 'profil',
      title: t.profil,
      blocks: [
        {
          key: 'texte',
          node: (
            <p className="pb-2 text-justify" data-edit-id="resume">
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
              <h3 className="text-[length:calc(var(--cv-fs)*13px)] font-bold text-slate-900">
                {exp.poste}
                {exp.entreprise && <span className="font-normal italic"> — {exp.entreprise}</span>}
              </h3>
              <span className="text-[length:calc(var(--cv-fs)*11px)] text-slate-500">
                {exp.debut} – {exp.fin}
              </span>
            </div>
            {exp.lieu && <p className="text-[length:calc(var(--cv-fs)*11px)] italic text-slate-500">{exp.lieu}</p>}
          </div>
        ),
      })
      bullets.forEach((line, j) => {
        blocks.push({
          key: `${i}:b${j}`,
          node: (
            <ul
              className={`list-disc pl-5 ${j === bullets.length - 1 ? 'pb-4' : 'pb-0.5'} ${j === 0 ? 'pt-1' : ''}`}
              data-edit-id={`experiences.${i}`}
            >
              <li>{line}</li>
            </ul>
          ),
        })
      })
    })
    sections.push({ key: 'experiences', title: t.experiences, blocks })
  }

  if (data.formations.length) {
    sections.push({
      key: 'formations',
      title: t.formations,
      blocks: data.formations.map((f, i) => ({
        key: String(i),
        node: (
          <div className="flex items-baseline justify-between pb-2" data-edit-id={`formations.${i}`}>
            <span>
              <span className="font-bold">{f.diplome}</span>
              {f.etablissement && <span className="italic"> — {f.etablissement}</span>}
            </span>
            <span className="text-[length:calc(var(--cv-fs)*11px)] text-slate-500">
              {f.debut} – {f.fin}
            </span>
          </div>
        ),
      })),
    })
  }

  if (data.competences.length) {
    sections.push({
      key: 'competences',
      title: t.competences,
      blocks: [
        {
          key: 'liste',
          node: (
            <p className="pb-2" data-edit-id="competences">
              {data.competences.map((c) => c.nom).join(' · ')}
            </p>
          ),
        },
      ],
    })
  }

  if (data.langues.length) {
    sections.push({
      key: 'langues',
      title: t.langues,
      blocks: data.langues.map((l, i) => ({
        key: String(i),
        node: (
          <p className="pb-0.5" data-edit-id="langues">
            <span className="font-bold">{l.langue}</span>
            {l.niveau && ` — ${l.niveau}`}
          </p>
        ),
      })),
    })
  }

  return sections
}

export default {
  label: 'Classique',
  defaultAccent: '#1e3a5f',
  columns: 1,
  columnGap: 0,
  sectionGap: 20,
  Page,
  Banner,
  SectionTitle,
  buildSections,
}
