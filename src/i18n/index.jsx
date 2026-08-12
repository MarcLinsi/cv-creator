import { createContext, useContext } from 'react'
import fr from './fr'
import en from './en'

/**
 * Deux langues indépendantes coexistent :
 *
 *   - celle de l'interface, qui pilote la barre du haut et l'éditeur ;
 *   - celle du CV, qui ne pilote que les libellés non saisissables du document
 *     (titres de section, mention « suite »).
 *
 * Elles sont séparées parce qu'elles répondent à des besoins sans rapport :
 * on peut vouloir travailler en français sur un CV rédigé en anglais. Par
 * défaut la seconde suit la première, jusqu'à ce qu'on la fixe explicitement.
 *
 * Ajouter une langue = déposer un fichier sur le modèle de fr.js et l'ajouter
 * ici. Aucun autre fichier n'est à toucher.
 */

export const dictionaries = { fr, en }

export const DEFAULT_LOCALE = 'fr'

export const localeList = Object.entries(dictionaries).map(([code, d]) => ({
  code,
  label: d.label,
}))

export const isLocale = (code) => Object.prototype.hasOwnProperty.call(dictionaries, code)

/** Retombe sur la langue par défaut plutôt que de laisser passer un `undefined`. */
export const dictionary = (code) => dictionaries[code] ?? dictionaries[DEFAULT_LOCALE]

const UiContext = createContext(dictionaries[DEFAULT_LOCALE].ui)

export function UiLanguageProvider({ locale, children }) {
  return <UiContext.Provider value={dictionary(locale).ui}>{children}</UiContext.Provider>
}

/** Libellés de l'interface. Les libellés du CV, eux, transitent par les props
 *  des templates : ils dépendent de la langue du document, pas de celle de
 *  l'utilisateur. */
export function useUi() {
  return useContext(UiContext)
}
