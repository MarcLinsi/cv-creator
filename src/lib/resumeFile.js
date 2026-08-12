import { emptyInfos } from '../data/resume'

/**
 * Lecture et écriture du fichier de sauvegarde.
 *
 * Un fichier importé est une entrée non fiable : il a pu être édité à la main,
 * tronqué, ou produit par une version antérieure. Tout ce qui entre passe donc
 * par `normalizeResume`, qui reconstruit une structure valide champ par champ
 * plutôt que de faire confiance à celle du fichier. L'application ne peut ainsi
 * jamais se retrouver avec `experiences` valant `null` ou `niveau` valant une
 * chaîne — deux cas qui casseraient le rendu bien plus loin, sans rapport
 * visible avec l'import.
 */

export const FILE_FORMAT = 'cv-gen'
export const FILE_VERSION = 1

const POLICES = ['auto', 'sans', 'serif', 'mono']

/** N'accepte que des primitives textuelles : `String({})` donnerait "[object Object]". */
const texte = (v) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '')

const liste = (v) => (Array.isArray(v) ? v : [])

const nombre = (v, defaut, min, max) => {
  const n = typeof v === 'number' ? v : Number.parseFloat(v)
  if (!Number.isFinite(n)) return defaut
  return Math.min(max, Math.max(min, n))
}

/**
 * La photo atterrit dans un `src` d'image. On n'accepte que des sources inertes
 * — data-URI d'image ou URL http(s) — pour qu'un fichier bricolé ne puisse pas
 * y glisser autre chose.
 */
const photo = (v) => {
  const s = texte(v)
  return /^data:image\/[a-z0-9.+-]+;/i.test(s) || /^https?:\/\//i.test(s) ? s : ''
}

export function normalizeResume(brut) {
  const o = brut && typeof brut === 'object' ? brut : {}
  const infos = o.infos && typeof o.infos === 'object' ? o.infos : {}

  return {
    infos: {
      ...emptyInfos,
      ...Object.fromEntries(Object.keys(emptyInfos).map((k) => [k, texte(infos[k])])),
      photo: photo(infos.photo),
    },
    resume: texte(o.resume),
    experiences: liste(o.experiences).map((e) => ({
      poste: texte(e?.poste),
      entreprise: texte(e?.entreprise),
      lieu: texte(e?.lieu),
      debut: texte(e?.debut),
      fin: texte(e?.fin),
      description: texte(e?.description),
    })),
    formations: liste(o.formations).map((f) => ({
      diplome: texte(f?.diplome),
      etablissement: texte(f?.etablissement),
      lieu: texte(f?.lieu),
      debut: texte(f?.debut),
      fin: texte(f?.fin),
    })),
    competences: liste(o.competences).map((c) => ({
      nom: texte(c?.nom),
      niveau: nombre(c?.niveau, 80, 0, 100),
    })),
    softSkills: liste(o.softSkills).map((s) => ({ nom: texte(s?.nom) })),
    technos: liste(o.technos).map((t) => ({
      categorie: texte(t?.categorie),
      items: texte(t?.items),
    })),
    langues: liste(o.langues).map((l) => ({
      langue: texte(l?.langue),
      niveau: texte(l?.niveau),
    })),
  }
}

/**
 * Réglages d'apparence. `templateKey` n'est pas validé ici : seul l'appelant
 * connaît les templates existants, et ce module ne doit pas en dépendre.
 */
export function normalizeSettings(brut) {
  const o = brut && typeof brut === 'object' ? brut : {}
  const app = o.appearance && typeof o.appearance === 'object' ? o.appearance : {}
  const accent = texte(o.accent)
  return {
    templateKey: texte(o.templateKey),
    accent: /^#[0-9a-f]{3,8}$/i.test(accent) ? accent : '',
    uiLang: texte(o.uiLang),
    // `null` a un sens précis ici : la langue du CV suit celle du site. Il faut
    // donc le distinguer d'une langue absente, d'où le passage par undefined.
    cvLang: o.cvLang == null ? null : texte(o.cvLang),
    appearance: {
      font: POLICES.includes(app.font) ? app.font : 'auto',
      scale: nombre(app.scale, 1, 0.5, 2),
    },
  }
}

export function serialize(data, settings) {
  return JSON.stringify(
    { format: FILE_FORMAT, version: FILE_VERSION, settings, resume: data },
    null,
    2,
  )
}

/**
 * @throws {Error} message destiné à être affiché tel quel à l'utilisateur
 */
export function parseResumeFile(texteFichier) {
  let brut
  try {
    brut = JSON.parse(texteFichier)
  } catch {
    throw new Error("Ce fichier n'est pas du JSON valide.")
  }
  if (!brut || typeof brut !== 'object') {
    throw new Error('Ce fichier ne contient pas de CV.')
  }
  // Les sauvegardes portent une enveloppe, mais on accepte aussi un objet de CV
  // nu : c'est ce qu'on obtient en copiant `sampleResume` à la main, et le
  // refuser n'apporterait rien.
  //
  // `resume` désigne deux choses selon le niveau — le CV dans l'enveloppe, le
  // texte de présentation dans un CV nu. On tranche donc sur son type, et non
  // sur sa présence : sinon un CV nu dont la présentation est absente ou nulle
  // serait pris pour une enveloppe vide et rejeté à tort.
  const enveloppe =
    brut.format === FILE_FORMAT || (brut.resume !== null && typeof brut.resume === 'object')
  const corps = enveloppe ? brut.resume : brut
  if (!corps || typeof corps !== 'object') {
    throw new Error('Ce fichier ne contient pas de CV.')
  }
  if (enveloppe && typeof brut.version === 'number' && brut.version > FILE_VERSION) {
    throw new Error(
      `Ce fichier vient d'une version plus récente de l'application (format ${brut.version}).`,
    )
  }
  return {
    resume: normalizeResume(corps),
    settings: normalizeSettings(enveloppe ? brut.settings : null),
  }
}

/** Nom de fichier sûr, dérivé de l'identité saisie. */
export function fileName(data) {
  const base = `CV_${data.infos.prenom || ''}_${data.infos.nom || ''}`
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]/g, '')
  return `${base || 'CV'}.json`
}

export function downloadResume(data, settings) {
  const blob = new Blob([serialize(data, settings)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName(data)
  a.click()
  // Sans révocation, le blob resterait en mémoire jusqu'au rechargement de la
  // page — et une photo en base64 pèse lourd.
  URL.revokeObjectURL(url)
}
