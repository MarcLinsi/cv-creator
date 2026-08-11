import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { emptyExperience, emptyEducation, emptyCompetence } from '../data/resume'

const RegistryContext = createContext(null)

function Field({ label, value, onChange, type = 'text', textarea = false, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {textarea ? (
        <textarea
          className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={4}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  )
}

function Section({ title, children, onAdd, addLabel, editId }) {
  const register = useContext(RegistryContext)
  return (
    <section ref={editId && register ? register(editId) : undefined} className="border-b border-slate-200 pb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
          >
            + {addLabel}
          </button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function RepeatableCard({ children, onRemove, editId }) {
  const register = useContext(RegistryContext)
  return (
    <div
      ref={editId && register ? register(editId) : undefined}
      className="relative rounded-lg border border-slate-200 bg-slate-50 p-3"
    >
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 text-xs text-slate-400 hover:text-red-500"
        aria-label="Supprimer"
      >
        ✕
      </button>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

const FONTS = [
  { key: 'auto', label: 'Auto' },
  { key: 'sans', label: 'Sans' },
  { key: 'serif', label: 'Serif' },
  { key: 'mono', label: 'Mono' },
]
const SIZES = [
  { key: 0.9, label: 'Compact' },
  { key: 1, label: 'Normal' },
  { key: 1.1, label: 'Grand' },
]

function AppearancePanel({ appearance, setAppearance, accent, setAccent, accents }) {
  const [open, setOpen] = useState(false)
  return (
    <section className="rounded-lg border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Apparence
        </span>
        <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-slate-200 px-3 py-3">
          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Police</span>
            <div className="flex gap-1.5">
              {FONTS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setAppearance((a) => ({ ...a, font: f.key }))}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition ${
                    appearance.font === f.key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Taille du texte</span>
            <div className="flex gap-1.5">
              {SIZES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setAppearance((a) => ({ ...a, scale: s.key }))}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition ${
                    appearance.scale === s.key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Couleur d'accent</span>
            <div className="flex flex-wrap gap-2">
              {accents.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  className={`h-6 w-6 rounded-full ring-2 ring-offset-1 transition ${
                    accent === c ? 'ring-slate-400' : 'ring-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Couleur ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default function Editor({ data, setData, focusTarget, appearance, setAppearance, accent, setAccent, accents }) {
  const refs = useRef({})
  const register = useCallback(
    (id) => (node) => {
      if (node) refs.current[id] = node
      else delete refs.current[id]
    },
    [],
  )

  // When a preview element is clicked, scroll to + flash its editor section
  useEffect(() => {
    if (!focusTarget?.id) return
    const node = refs.current[focusTarget.id]
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const input = node.querySelector('input:not([type="file"]):not([type="range"]), textarea')
    if (input) input.focus({ preventScroll: true })
    node.classList.add('edit-flash')
    const t = setTimeout(() => node.classList.remove('edit-flash'), 1300)
    return () => {
      clearTimeout(t)
      node.classList.remove('edit-flash')
    }
  }, [focusTarget])

  const setInfos = (key, value) =>
    setData((d) => ({ ...d, infos: { ...d.infos, [key]: value } }))

  const setExperience = (i, key, value) =>
    setData((d) => {
      const experiences = [...d.experiences]
      experiences[i] = { ...experiences[i], [key]: value }
      return { ...d, experiences }
    })

  const setFormation = (i, key, value) =>
    setData((d) => {
      const formations = [...d.formations]
      formations[i] = { ...formations[i], [key]: value }
      return { ...d, formations }
    })

  const handlePhoto = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setInfos('photo', reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <RegistryContext.Provider value={register}>
      <div className="space-y-6">
      <AppearancePanel
        appearance={appearance}
        setAppearance={setAppearance}
        accent={accent}
        setAccent={setAccent}
        accents={accents}
      />
      <Section title="Informations personnelles" editId="infos">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom" value={data.infos.prenom} onChange={(v) => setInfos('prenom', v)} />
          <Field label="Nom" value={data.infos.nom} onChange={(v) => setInfos('nom', v)} />
        </div>
        <Field label="Titre / Poste" value={data.infos.titre} onChange={(v) => setInfos('titre', v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" type="email" value={data.infos.email} onChange={(v) => setInfos('email', v)} />
          <Field label="Téléphone" value={data.infos.telephone} onChange={(v) => setInfos('telephone', v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ville" value={data.infos.ville} onChange={(v) => setInfos('ville', v)} />
          <Field label="Site / LinkedIn" value={data.infos.site} onChange={(v) => setInfos('site', v)} />
        </div>
        <Field label="Adresse" value={data.infos.adresse} onChange={(v) => setInfos('adresse', v)} />
        <Field
          label="Date de naissance"
          value={data.infos.dateNaissance}
          onChange={(v) => setInfos('dateNaissance', v)}
          placeholder="01.01.1990"
        />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Photo (optionnel)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
            className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
          />
          {data.infos.photo && (
            <button
              type="button"
              onClick={() => setInfos('photo', '')}
              className="mt-1 text-xs text-slate-400 hover:text-red-500"
            >
              Retirer la photo
            </button>
          )}
        </label>
      </Section>

      <Section title="Résumé" editId="resume">
        <Field
          label="Présentation"
          textarea
          value={data.resume}
          onChange={(v) => setData((d) => ({ ...d, resume: v }))}
          placeholder="Quelques phrases qui vous présentent…"
        />
      </Section>

      <Section
        title="Expériences"
        addLabel="Ajouter"
        onAdd={() => setData((d) => ({ ...d, experiences: [...d.experiences, { ...emptyExperience }] }))}
      >
        {data.experiences.map((exp, i) => (
          <RepeatableCard
            key={i}
            editId={`experiences.${i}`}
            onRemove={() =>
              setData((d) => ({ ...d, experiences: d.experiences.filter((_, j) => j !== i) }))
            }
          >
            <Field label="Poste" value={exp.poste} onChange={(v) => setExperience(i, 'poste', v)} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Entreprise" value={exp.entreprise} onChange={(v) => setExperience(i, 'entreprise', v)} />
              <Field label="Lieu" value={exp.lieu} onChange={(v) => setExperience(i, 'lieu', v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Début" value={exp.debut} onChange={(v) => setExperience(i, 'debut', v)} placeholder="2022" />
              <Field label="Fin" value={exp.fin} onChange={(v) => setExperience(i, 'fin', v)} placeholder="Présent" />
            </div>
            <Field
              label="Description (une ligne par point)"
              textarea
              value={exp.description}
              onChange={(v) => setExperience(i, 'description', v)}
            />
          </RepeatableCard>
        ))}
      </Section>

      <Section
        title="Formation"
        addLabel="Ajouter"
        onAdd={() => setData((d) => ({ ...d, formations: [...d.formations, { ...emptyEducation }] }))}
      >
        {data.formations.map((f, i) => (
          <RepeatableCard
            key={i}
            editId={`formations.${i}`}
            onRemove={() =>
              setData((d) => ({ ...d, formations: d.formations.filter((_, j) => j !== i) }))
            }
          >
            <Field label="Diplôme" value={f.diplome} onChange={(v) => setFormation(i, 'diplome', v)} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Établissement" value={f.etablissement} onChange={(v) => setFormation(i, 'etablissement', v)} />
              <Field label="Lieu" value={f.lieu} onChange={(v) => setFormation(i, 'lieu', v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Début" value={f.debut} onChange={(v) => setFormation(i, 'debut', v)} />
              <Field label="Fin" value={f.fin} onChange={(v) => setFormation(i, 'fin', v)} />
            </div>
          </RepeatableCard>
        ))}
      </Section>

      <Section
        title="Compétences"
        addLabel="Ajouter"
        editId="competences"
        onAdd={() =>
          setData((d) => ({ ...d, competences: [...d.competences, { ...emptyCompetence }] }))
        }
      >
        {data.competences.map((c, i) => (
          <RepeatableCard
            key={i}
            editId={`competences.${i}`}
            onRemove={() =>
              setData((d) => ({ ...d, competences: d.competences.filter((_, j) => j !== i) }))
            }
          >
            <Field
              label="Compétence"
              value={c.nom}
              onChange={(v) =>
                setData((d) => {
                  const competences = [...d.competences]
                  competences[i] = { ...competences[i], nom: v }
                  return { ...d, competences }
                })
              }
            />
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Niveau — {c.niveau}%
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={c.niveau}
                onChange={(e) =>
                  setData((d) => {
                    const competences = [...d.competences]
                    competences[i] = { ...competences[i], niveau: Number(e.target.value) }
                    return { ...d, competences }
                  })
                }
                className="w-full accent-indigo-600"
              />
            </label>
          </RepeatableCard>
        ))}
      </Section>

      <Section
        title="Langues"
        addLabel="Ajouter"
        editId="langues"
        onAdd={() => setData((d) => ({ ...d, langues: [...d.langues, { langue: '', niveau: '' }] }))}
      >
        {data.langues.map((l, i) => (
          <RepeatableCard
            key={i}
            editId={`langues.${i}`}
            onRemove={() => setData((d) => ({ ...d, langues: d.langues.filter((_, j) => j !== i) }))}
          >
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Langue"
                value={l.langue}
                onChange={(v) =>
                  setData((d) => {
                    const langues = [...d.langues]
                    langues[i] = { ...langues[i], langue: v }
                    return { ...d, langues }
                  })
                }
              />
              <Field
                label="Niveau"
                value={l.niveau}
                onChange={(v) =>
                  setData((d) => {
                    const langues = [...d.langues]
                    langues[i] = { ...langues[i], niveau: v }
                    return { ...d, langues }
                  })
                }
              />
            </div>
          </RepeatableCard>
        ))}
      </Section>
      </div>
    </RegistryContext.Provider>
  )
}
