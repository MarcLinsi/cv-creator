import { normalizeResume, normalizeSettings } from './resumeFile'

/**
 * Persistance locale du CV en cours.
 *
 * Rien ne sort du navigateur : c'est le même localStorage qu'un brouillon de
 * formulaire, pas une synchronisation. L'objectif est qu'un rafraîchissement de
 * page, ou la fermeture de l'onglet, ne fasse pas perdre la saisie.
 */

const CLE = 'cv-gen:brouillon'

export function chargerBrouillon() {
  let texte
  try {
    texte = localStorage.getItem(CLE)
  } catch {
    // Navigation privée, stockage désactivé par la politique du navigateur :
    // l'application doit continuer à fonctionner sans persistance.
    return null
  }
  if (!texte) return null
  try {
    const brut = JSON.parse(texte)
    return {
      resume: normalizeResume(brut?.resume),
      settings: normalizeSettings(brut?.settings),
    }
  } catch {
    // Brouillon corrompu : on l'ignore plutôt que de bloquer le démarrage.
    return null
  }
}

/**
 * @returns {null|string} null si tout va bien, sinon un message affichable.
 */
export function enregistrerBrouillon(resume, settings) {
  try {
    localStorage.setItem(CLE, JSON.stringify({ resume, settings }))
    return null
  } catch (err) {
    // Le quota (~5 Mo) se dépasse en pratique avec une photo en base64 : c'est
    // le seul champ qui puisse peser autant.
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      return "Sauvegarde automatique impossible : le CV dépasse la capacité du navigateur, probablement à cause de la photo. Pense à exporter le fichier JSON."
    }
    return null
  }
}
