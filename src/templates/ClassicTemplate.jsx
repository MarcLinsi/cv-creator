function lines(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean)
}

export default function ClassicTemplate({ data, accent }) {
  const { infos } = data
  const contact = [infos.email, infos.telephone, infos.ville, infos.site].filter(Boolean)

  return (
    <div className="h-full min-h-full px-12 py-10 font-serif text-[length:calc(var(--cv-fs)*12px)] leading-relaxed text-slate-800">
      {/* Header */}
      <header className="border-b-2 pb-4 text-center" style={{ borderColor: accent }} data-edit-id="infos">
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

      {data.resume && (
        <Section title="Profil" accent={accent} editId="resume">
          <p className="text-justify">{data.resume}</p>
        </Section>
      )}

      {data.experiences.length > 0 && (
        <Section title="Expérience professionnelle" accent={accent}>
          <div className="space-y-4">
            {data.experiences.map((exp, i) => (
              <div key={i} data-edit-id={`experiences.${i}`}>
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
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {lines(exp.description).map((l, j) => (
                    <li key={j}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.formations.length > 0 && (
        <Section title="Formation" accent={accent}>
          <div className="space-y-2">
            {data.formations.map((f, i) => (
              <div key={i} className="flex items-baseline justify-between" data-edit-id={`formations.${i}`}>
                <span>
                  <span className="font-bold">{f.diplome}</span>
                  {f.etablissement && <span className="italic"> — {f.etablissement}</span>}
                </span>
                <span className="text-[length:calc(var(--cv-fs)*11px)] text-slate-500">
                  {f.debut} – {f.fin}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid grid-cols-2 gap-8">
        {data.competences.length > 0 && (
          <Section title="Compétences" accent={accent} editId="competences">
            <p>{data.competences.map((c) => c.nom).join(' · ')}</p>
          </Section>
        )}
        {data.langues.length > 0 && (
          <Section title="Langues" accent={accent} editId="langues">
            <ul className="space-y-0.5">
              {data.langues.map((l, i) => (
                <li key={i}>
                  <span className="font-bold">{l.langue}</span>
                  {l.niveau && ` — ${l.niveau}`}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, accent, children, editId }) {
  return (
    <section className="mt-5" data-edit-id={editId}>
      <h2
        className="mb-2 text-sm font-bold uppercase tracking-[0.15em]"
        style={{ color: accent }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}
