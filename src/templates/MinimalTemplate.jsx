function lines(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean)
}

function Banner({ data }) {
  const { infos } = data
  const contact = [infos.email, infos.telephone, infos.ville, infos.site].filter(Boolean)
  return (
    <header className="shrink-0 px-12 pt-12" data-edit-id="infos">
      <h1 className="text-4xl font-light tracking-tight text-slate-900">
        {infos.prenom} <span className="font-semibold">{infos.nom}</span>
      </h1>
      {infos.titre && <p className="mt-1 text-sm text-slate-500">{infos.titre}</p>}
      {contact.length > 0 && (
        <p className="mt-3 text-[length:calc(var(--cv-fs)*11px)] text-slate-500">{contact.join('   /   ')}</p>
      )}
      <div className="mt-4 h-px w-full bg-slate-200" />
    </header>
  )
}

function Page({ pageIndex, banner, children }) {
  return (
    <div className="flex h-full min-h-full flex-col font-sans text-[length:calc(var(--cv-fs)*12px)] leading-relaxed text-slate-700">
      {pageIndex === 0 ? banner : <div className="h-12 shrink-0" />}
      <div className="cv-flow min-h-0 flex-1 overflow-hidden px-12 py-8">{children}</div>
      <div className="h-12 shrink-0" />
    </div>
  )
}

// Le libellé de section est aligné sur la gouttière des dates, pour conserver
// la grille 80px/1fr des lignes de contenu.
function SectionTitle({ section, t, repeated, gapBefore }) {
  return (
    <h2
      className={`pb-3 text-[length:calc(var(--cv-fs)*10px)] font-semibold uppercase tracking-[0.25em] text-slate-400${
        gapBefore ? ' pt-8' : ''
      }`}
    >
      {section.title}
      {repeated && <span className="ml-2 tracking-normal opacity-70">{t.suite}</span>}
    </h2>
  )
}

function Row({ period, children, editId, className = '' }) {
  return (
    <div className={`grid grid-cols-[80px_1fr] gap-4 ${className}`} data-edit-id={editId}>
      <div className="pt-0.5 text-[length:calc(var(--cv-fs)*10.5px)] text-slate-400">{period}</div>
      <div>{children}</div>
    </div>
  )
}

function buildSections({ data, accent, t }) {
  const sections = []

  if (data.resume) {
    sections.push({
      key: 'profil',
      title: t.profil,
      blocks: [
        {
          key: 'texte',
          node: (
            <p className="pb-8 text-[length:calc(var(--cv-fs)*12.5px)] text-slate-600" data-edit-id="resume">
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
          <Row
            period={`${exp.debut} – ${exp.fin}`}
            editId={`experiences.${i}`}
            className={bullets.length ? '' : 'pb-5'}
          >
            <h3 className="text-[length:calc(var(--cv-fs)*13px)] font-semibold text-slate-900">{exp.poste}</h3>
            <p className="text-[length:calc(var(--cv-fs)*11px)] text-slate-500">
              {exp.entreprise}
              {exp.lieu && ` · ${exp.lieu}`}
            </p>
          </Row>
        ),
      })
      bullets.forEach((line, j) => {
        blocks.push({
          key: `${i}:b${j}`,
          node: (
            // La colonne de gauche reste vide : les puces s'alignent sous le
            // contenu de la ligne d'en-tête, pas sous la période.
            <Row
              period=""
              editId={`experiences.${i}`}
              className={`${j === bullets.length - 1 ? 'pb-5' : ''} ${j === 0 ? 'pt-1' : ''}`}
            >
              <div className="flex gap-2 text-[length:calc(var(--cv-fs)*11.5px)] text-slate-600">
                <span style={{ color: accent }}>—</span>
                <span>{line}</span>
              </div>
            </Row>
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
          <Row period={`${f.debut} – ${f.fin}`} editId={`formations.${i}`} className="pb-3">
            <h3 className="text-[length:calc(var(--cv-fs)*13px)] font-semibold text-slate-900">{f.diplome}</h3>
            <p className="text-[length:calc(var(--cv-fs)*11px)] text-slate-500">
              {f.etablissement}
              {f.lieu && ` · ${f.lieu}`}
            </p>
          </Row>
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
          key: 'puces',
          node: (
            <div className="flex flex-wrap gap-1.5 pb-8" data-edit-id="competences">
              {data.competences.map((c, i) => (
                <span
                  key={i}
                  className="rounded border px-2 py-0.5 text-[length:calc(var(--cv-fs)*10.5px)]"
                  style={{ borderColor: accent, color: accent }}
                >
                  {c.nom}
                </span>
              ))}
            </div>
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
          <div
            className="flex justify-between pb-1 text-[length:calc(var(--cv-fs)*11.5px)]"
            data-edit-id="langues"
          >
            <span className="font-medium text-slate-800">{l.langue}</span>
            <span className="text-slate-500">{l.niveau}</span>
          </div>
        ),
      })),
    })
  }

  return sections
}

export default {
  label: 'Minimal',
  defaultAccent: '#0d9488',
  columns: 1,
  columnGap: 0,
  sectionGap: 32,
  Page,
  Banner,
  SectionTitle,
  buildSections,
}
