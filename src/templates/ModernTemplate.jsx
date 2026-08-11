function lines(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean)
}

export default function ModernTemplate({ data, accent }) {
  const { infos } = data
  return (
    <div className="flex h-full min-h-full font-sans text-[length:calc(var(--cv-fs)*12px)] leading-relaxed text-slate-700">
      {/* Sidebar */}
      <aside className="w-[34%] p-6 text-white" style={{ backgroundColor: accent }}>
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
        <p data-edit-id="infos" className="mt-1 text-sm text-white/80">{infos.titre}</p>

        <div data-edit-id="infos" className="mt-6 space-y-1.5 text-[length:calc(var(--cv-fs)*11px)] text-white/90">
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
                <li key={i} className="text-[length:calc(var(--cv-fs)*11px)] text-white/90">• {c.nom}</li>
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

      {/* Main */}
      <main className="flex-1 p-7">
        {data.resume && (
          <section className="mb-6" data-edit-id="resume">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide" style={{ color: accent }}>
              Profil
            </h2>
            <p className="text-[length:calc(var(--cv-fs)*12px)]">{data.resume}</p>
          </section>
        )}

        {data.experiences.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: accent }}>
              Expériences
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp, i) => (
                <div key={i} data-edit-id={`experiences.${i}`}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-[length:calc(var(--cv-fs)*13px)] font-semibold text-slate-800">{exp.poste}</h3>
                    <span className="text-[length:calc(var(--cv-fs)*11px)] text-slate-500">
                      {exp.debut} – {exp.fin}
                    </span>
                  </div>
                  <p className="text-[length:calc(var(--cv-fs)*11px)] font-medium" style={{ color: accent }}>
                    {exp.entreprise}
                    {exp.lieu && ` · ${exp.lieu}`}
                  </p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[length:calc(var(--cv-fs)*11.5px)]">
                    {lines(exp.description).map((l, j) => (
                      <li key={j}>{l}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.formations.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: accent }}>
              Formation
            </h2>
            <div className="space-y-3">
              {data.formations.map((f, i) => (
                <div key={i} data-edit-id={`formations.${i}`}>
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
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
