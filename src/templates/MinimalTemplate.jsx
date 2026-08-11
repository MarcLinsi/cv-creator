function lines(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean)
}

export default function MinimalTemplate({ data, accent }) {
  const { infos } = data
  const contact = [infos.email, infos.telephone, infos.ville, infos.site].filter(Boolean)

  return (
    <div className="h-full min-h-full px-12 py-12 font-sans text-[length:calc(var(--cv-fs)*12px)] leading-relaxed text-slate-700">
      <header className="mb-8" data-edit-id="infos">
        <h1 className="text-4xl font-light tracking-tight text-slate-900">
          {infos.prenom} <span className="font-semibold">{infos.nom}</span>
        </h1>
        {infos.titre && <p className="mt-1 text-sm text-slate-500">{infos.titre}</p>}
        {contact.length > 0 && (
          <p className="mt-3 text-[length:calc(var(--cv-fs)*11px)] text-slate-500">{contact.join('   /   ')}</p>
        )}
        <div className="mt-4 h-px w-full bg-slate-200" />
      </header>

      {data.resume && (
        <p data-edit-id="resume" className="mb-8 text-[length:calc(var(--cv-fs)*12.5px)] text-slate-600">
          {data.resume}
        </p>
      )}

      {data.experiences.length > 0 && (
        <Block title="Expérience">
          <div className="space-y-5">
            {data.experiences.map((exp, i) => (
              <Row key={i} period={`${exp.debut} – ${exp.fin}`} editId={`experiences.${i}`}>
                <h3 className="text-[length:calc(var(--cv-fs)*13px)] font-semibold text-slate-900">{exp.poste}</h3>
                <p className="text-[length:calc(var(--cv-fs)*11px)] text-slate-500">
                  {exp.entreprise}
                  {exp.lieu && ` · ${exp.lieu}`}
                </p>
                <ul className="mt-1 space-y-0.5 text-[length:calc(var(--cv-fs)*11.5px)] text-slate-600">
                  {lines(exp.description).map((l, j) => (
                    <li key={j} className="flex gap-2">
                      <span style={{ color: accent }}>—</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </Row>
            ))}
          </div>
        </Block>
      )}

      {data.formations.length > 0 && (
        <Block title="Formation">
          <div className="space-y-3">
            {data.formations.map((f, i) => (
              <Row key={i} period={`${f.debut} – ${f.fin}`} editId={`formations.${i}`}>
                <h3 className="text-[length:calc(var(--cv-fs)*13px)] font-semibold text-slate-900">{f.diplome}</h3>
                <p className="text-[length:calc(var(--cv-fs)*11px)] text-slate-500">
                  {f.etablissement}
                  {f.lieu && ` · ${f.lieu}`}
                </p>
              </Row>
            ))}
          </div>
        </Block>
      )}

      <div className="grid grid-cols-2 gap-10">
        {data.competences.length > 0 && (
          <Block title="Compétences" editId="competences">
            <div className="flex flex-wrap gap-1.5">
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
          </Block>
        )}
        {data.langues.length > 0 && (
          <Block title="Langues" editId="langues">
            <ul className="space-y-1 text-[length:calc(var(--cv-fs)*11.5px)]">
              {data.langues.map((l, i) => (
                <li key={i} className="flex justify-between">
                  <span className="font-medium text-slate-800">{l.langue}</span>
                  <span className="text-slate-500">{l.niveau}</span>
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>
    </div>
  )
}

function Block({ title, children, editId }) {
  return (
    <section className="mb-8" data-edit-id={editId}>
      <h2 className="mb-3 text-[length:calc(var(--cv-fs)*10px)] font-semibold uppercase tracking-[0.25em] text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ period, children, editId }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-4" data-edit-id={editId}>
      <div className="pt-0.5 text-[length:calc(var(--cv-fs)*10.5px)] text-slate-400">{period}</div>
      <div>{children}</div>
    </div>
  )
}
