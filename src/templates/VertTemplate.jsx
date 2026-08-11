import { useMemo } from 'react'

function lines(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean)
}

const PALETTE = ['#d9eece', '#cde7bb', '#c3e1ac', '#e2f1d7', '#d0e9c2']

// Génère un champ de triangles "low-poly" déterministe pour les bandeaux.
function usePolygons(w, h, cols, rows, seed) {
  return useMemo(() => {
    let s = seed
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
    const grid = []
    for (let r = 0; r <= rows; r++) {
      const row = []
      for (let c = 0; c <= cols; c++) {
        const jx = c === 0 || c === cols ? 0 : (rnd() - 0.5) * (w / cols) * 0.7
        const jy = r === 0 || r === rows ? 0 : (rnd() - 0.5) * (h / rows) * 0.7
        row.push([(c * w) / cols + jx, (r * h) / rows + jy])
      }
      grid.push(row)
    }
    const tris = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const a = grid[r][c]
        const b = grid[r][c + 1]
        const d = grid[r + 1][c]
        const e = grid[r + 1][c + 1]
        tris.push({ p: [a, b, e], fill: PALETTE[Math.floor(rnd() * PALETTE.length)] })
        tris.push({ p: [a, e, d], fill: PALETTE[Math.floor(rnd() * PALETTE.length)] })
      }
    }
    return tris
  }, [w, h, cols, rows, seed])
}

function PolygonBg({ seed }) {
  const W = 600
  const H = 200
  const tris = usePolygons(W, H, 9, 4, seed)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <rect width={W} height={H} fill="#d4ebc5" />
      {tris.map((t, i) => (
        <polygon key={i} points={t.p.map((pt) => pt.join(',')).join(' ')} fill={t.fill} />
      ))}
    </svg>
  )
}

const Icon = ({ d, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {d}
  </svg>
)

const briefcase = (
  <>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 12h18" />
  </>
)
const cap = (
  <>
    <path d="M12 4 2 9l10 5 10-5-10-5Z" />
    <path d="M6 11v4c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-4" />
  </>
)
const beaker = (
  <>
    <path d="M9 3h6" />
    <path d="M10 3v6l-5 9a1.8 1.8 0 0 0 1.6 2.8h10.8A1.8 1.8 0 0 0 19 18l-5-9V3" />
    <path d="M7.5 14h9" />
  </>
)

function SectionTitle({ icon, children, className = '' }) {
  return (
    <h2
      className={`mb-3 flex items-center gap-2 text-[length:calc(var(--cv-fs)*15px)] font-bold text-slate-900 ${className}`}
    >
      <span className="text-slate-700">
        <Icon d={icon} className="h-4 w-4" />
      </span>
      {children}
    </h2>
  )
}

function Bullets({ items, accent }) {
  return (
    <ul className="mt-1.5 space-y-1">
      {items.map((l, i) => (
        <li key={i} className="flex gap-2 text-[length:calc(var(--cv-fs)*11px)] leading-snug text-slate-700">
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: accent }}
          />
          <span>{l}</span>
        </li>
      ))}
    </ul>
  )
}

function ExperienceItem({ exp, accent, editId }) {
  return (
    <div className="mb-4" data-edit-id={editId}>
      <p className="text-[length:calc(var(--cv-fs)*9.5px)] font-medium uppercase tracking-wider text-slate-400">
        {exp.debut} – {exp.fin}
        {exp.lieu && <span className="ml-2 text-slate-400">{exp.lieu}</span>}
      </p>
      <h3 className="mt-0.5 text-[length:calc(var(--cv-fs)*12.5px)] font-bold leading-tight text-slate-900">{exp.poste}</h3>
      {exp.entreprise && (
        <p className="text-[length:calc(var(--cv-fs)*11.5px)] font-bold text-slate-800">{exp.entreprise}</p>
      )}
      <Bullets items={lines(exp.description)} accent={accent} />
    </div>
  )
}

export default function VertTemplate({ data, accent }) {
  const { infos } = data
  const initials = `${infos.prenom?.[0] || ''}${infos.nom?.[0] || ''}`

  return (
    <div className="flex h-full min-h-full flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="relative flex items-center gap-6 px-10 py-8">
        <PolygonBg seed={7} />
        <div className="relative shrink-0" data-edit-id="infos">
          {infos.photo ? (
            <img
              src={infos.photo}
              alt=""
              className="h-28 w-28 rounded-full object-cover ring-4 ring-white/70"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/70 text-2xl font-bold text-slate-500 ring-4 ring-white/70">
              {initials}
            </div>
          )}
        </div>
        <div className="relative flex-1 text-center">
          <h1
            data-edit-id="infos"
            className="inline-block text-4xl font-extrabold tracking-tight text-slate-900"
          >
            {infos.prenom} {infos.nom}
          </h1>
          {infos.titre && (
            <p
              data-edit-id="infos"
              className="mt-1 text-[length:calc(var(--cv-fs)*13px)] font-semibold uppercase tracking-[0.18em]"
              style={{ color: accent }}
            >
              {infos.titre}
            </p>
          )}
          {data.resume && (
            <p
              data-edit-id="resume"
              className="mx-auto mt-3 max-w-md text-[length:calc(var(--cv-fs)*11.5px)] leading-snug text-slate-700"
            >
              {data.resume}
            </p>
          )}
        </div>
      </header>

      {/* Body — one reading stream flowing across two columns (book order):
          left column fills first, overflow continues at the top of the right
          column, then onto the next page. Each item avoids being split mid-block. */}
      <div className="min-h-0 flex-1 overflow-hidden px-10 py-7">
        <div className="columns-2 gap-8 [column-fill:_balance]">
          <SectionTitle icon={briefcase} className="break-after-avoid">
            Expériences professionnelles
          </SectionTitle>
          {data.experiences.map((exp, i) => (
            <div key={i} className="break-inside-avoid">
              <ExperienceItem exp={exp} accent={accent} editId={`experiences.${i}`} />
            </div>
          ))}

          <div className="mt-6 break-inside-avoid">
            <SectionTitle icon={cap}>Formation</SectionTitle>
            {data.formations.map((f, i) => (
              <div key={i} className="mb-4" data-edit-id={`formations.${i}`}>
                <p className="text-[length:calc(var(--cv-fs)*9.5px)] font-medium uppercase tracking-wider text-slate-400">
                  {f.debut} – {f.fin}
                  {f.lieu && <span className="ml-2">{f.lieu}</span>}
                </p>
                <h3 className="mt-0.5 text-[length:calc(var(--cv-fs)*12.5px)] font-bold text-slate-900">{f.diplome}</h3>
              </div>
            ))}
          </div>

          <div className="mt-6 break-inside-avoid">
            <SectionTitle icon={beaker}>Compétences</SectionTitle>

            {data.langues.length > 0 && (
              <div className="mb-4" data-edit-id="langues">
                <p className="mb-1.5 text-[length:calc(var(--cv-fs)*10px)] font-semibold uppercase tracking-wider text-slate-400">
                  – Langues
                </p>
                <ul className="space-y-1">
                  {data.langues.map((l, i) => (
                    <li key={i} className="flex justify-between text-[length:calc(var(--cv-fs)*11.5px)]">
                      <span className="text-slate-700">{l.langue}</span>
                      <span className="font-bold text-slate-900">{l.niveau}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.competences.length > 0 && (
              <div>
                <p className="mb-2 text-[length:calc(var(--cv-fs)*10px)] font-semibold uppercase tracking-wider text-slate-400">
                  – Hard skills
                </p>
                <ul className="space-y-2.5">
                  {data.competences.map((c, i) => (
                    <li
                      key={i}
                      data-edit-id={`competences.${i}`}
                      className="grid grid-cols-2 items-center gap-3"
                    >
                      <span className="text-[length:calc(var(--cv-fs)*11.5px)] text-slate-700">{c.nom}</span>
                      <div className="relative h-1.5 rounded-full bg-green-200">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ width: `${c.niveau}%`, backgroundColor: accent }}
                        />
                        <div
                          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-900"
                          style={{ left: `calc(${c.niveau}% - 6px)` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative mt-auto grid grid-cols-3 gap-4 px-10 py-5 text-center text-[length:calc(var(--cv-fs)*11px)] text-slate-700">
        <PolygonBg seed={42} />
        <div className="relative" data-edit-id="infos">
          {infos.dateNaissance && <p>{infos.dateNaissance}</p>}
          {infos.ville && <p>{infos.ville}</p>}
        </div>
        <div className="relative flex items-center justify-center" data-edit-id="infos">
          {infos.adresse && <p>{infos.adresse}</p>}
        </div>
        <div className="relative" data-edit-id="infos">
          {infos.telephone && <p>{infos.telephone}</p>}
          {infos.email && <p>{infos.email}</p>}
          {infos.site && <p>{infos.site}</p>}
        </div>
      </footer>
    </div>
  )
}
