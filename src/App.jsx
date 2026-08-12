import { useEffect, useMemo, useRef, useState } from 'react'
import Editor from './components/Editor'
import LanguageMenu from './components/LanguageMenu'
import ResumeMeasurer from './components/ResumeMeasurer'
import ResumePages from './components/ResumePages'
import { paginate } from './lib/paginate'
import { downloadResume, parseResumeFile } from './lib/resumeFile'
import { chargerBrouillon, enregistrerBrouillon } from './lib/storage'
import { sampleResume } from './data/resume'
import { templates, templateKeys } from './templates'
import { DEFAULT_LOCALE, dictionary, isLocale, localeList, UiLanguageProvider } from './i18n'

const ACCENTS = ['#86c06a', '#4f46e5', '#0d9488', '#dc2626', '#1e3a5f', '#7c3aed', '#ea580c', '#0f172a']

// La géométrie des pages s'exprime en millimètres, jamais en pixels arrondis :
// 297mm valent 1122.52px et non 1123, et cette demi-unité par page finit par
// dépasser le papier — un dépassement d'1px suffit à faire sortir une page
// blanche supplémentaire du PDF. Les constantes en px ne servent qu'aux calculs
// de mise à l'échelle, où la précision décimale est conservée.
const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297
const MM_TO_PX = 96 / 25.4
const PAGE_WIDTH_PX = PAGE_WIDTH_MM * MM_TO_PX // 793.70
const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX // 1122.52
const PAGE_GAP_PX = 24 // visual gap between page sheets in the preview

// Le brouillon est relu une seule fois, au chargement du module : trois
// initialiseurs d'état séparés reliraient le localStorage trois fois, avec le
// risque qu'ils divergent.
const BROUILLON = (() => {
  const b = chargerBrouillon()
  const key = b && templates[b.settings.templateKey] ? b.settings.templateKey : 'vert'
  return {
    data: b?.resume ?? sampleResume,
    templateKey: key,
    accent: b?.settings.accent || templates[key].defaultAccent,
    appearance: b?.settings.appearance ?? { font: 'auto', scale: 1 },
    uiLang: isLocale(b?.settings.uiLang) ? b.settings.uiLang : DEFAULT_LOCALE,
    cvLang: isLocale(b?.settings.cvLang) ? b.settings.cvLang : null,
  }
})()

export default function App() {
  const [data, setData] = useState(BROUILLON.data)
  const [templateKey, setTemplateKey] = useState(BROUILLON.templateKey)
  const [accent, setAccent] = useState(BROUILLON.accent)
  const [scale, setScale] = useState(1)
  const [focusTarget, setFocusTarget] = useState(null)
  const [appearance, setAppearance] = useState(BROUILLON.appearance)
  const [metrics, setMetrics] = useState(null)
  const [notice, setNotice] = useState(null)
  const [uiLang, setUiLang] = useState(BROUILLON.uiLang)
  // `null` signifie « suit la langue du site ». C'est ce qui permet à la langue
  // du CV de suivre par défaut sans jamais s'y retrouver soudée : dès qu'on la
  // fixe, elle cesse de bouger.
  const [cvLangChoisie, setCvLangChoisie] = useState(BROUILLON.cvLang)
  const cvLang = cvLangChoisie ?? uiLang

  const ui = dictionary(uiLang).ui
  const cvT = dictionary(cvLang).cv

  const previewWrapRef = useRef(null)
  const fileInputRef = useRef(null)
  const hlRef = useRef(null)

  const template = templates[templateKey]

  // --- Click-to-edit: highlight on hover, focus matching editor section on click ---
  const setHighlight = (el) => {
    if (hlRef.current === el) return
    if (hlRef.current) hlRef.current.classList.remove('cv-hl')
    hlRef.current = el
    if (el) el.classList.add('cv-hl')
  }
  const previewHandlers = {
    onMouseOver: (e) => setHighlight(e.target.closest('[data-edit-id]')),
    onMouseLeave: () => setHighlight(null),
    onClick: (e) => {
      const el = e.target.closest('[data-edit-id]')
      if (el) setFocusTarget({ id: el.dataset.editId, nonce: Date.now() })
    },
  }

  // Switch template -> apply its default accent
  const chooseTemplate = (key) => {
    setTemplateKey(key)
    setAccent(templates[key].defaultAccent)
  }

  const sections = useMemo(
    () => template.buildSections({ data, accent, t: cvT }),
    [template, data, accent, cvT],
  )

  // Le plan de pages : c'est lui, et lui seul, que consomment l'aperçu et la
  // source du PDF. Les deux rendus ne peuvent donc pas diverger.
  const pages = useMemo(() => {
    if (!metrics) return []
    return paginate({
      sections,
      heights: metrics.heights,
      firstPageColumnHeight: metrics.firstPageColumnHeight,
      restPageColumnHeight: metrics.restPageColumnHeight,
      columns: template.columns,
      sectionGap: template.sectionGap,
    })
  }, [metrics, sections, template])

  const pageCount = Math.max(1, pages.length)

  // Fit the A4 page width into the preview column (pages stack vertically, so
  // we scale by width only and let the column scroll).
  useEffect(() => {
    const el = previewWrapRef.current
    if (!el) return
    const update = () => {
      const availW = el.clientWidth - 48
      setScale(Math.min(1, availW / PAGE_WIDTH_PX))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Sauvegarde automatique, différée : sans ce délai, chaque frappe au clavier
  // réécrirait tout le CV — photo comprise — dans le localStorage.
  const reglages = { templateKey, accent, appearance, uiLang, cvLang: cvLangChoisie }

  useEffect(() => {
    const id = setTimeout(() => {
      setNotice(enregistrerBrouillon(data, { templateKey, accent, appearance, uiLang, cvLang: cvLangChoisie }))
    }, 400)
    return () => clearTimeout(id)
  }, [data, templateKey, accent, appearance, uiLang, cvLangChoisie])

  // La langue de l'interface renseigne aussi l'attribut lang du document, dont
  // dépendent la césure et la correction orthographique des champs de saisie.
  useEffect(() => {
    document.documentElement.lang = uiLang
  }, [uiLang])

  const exporterFichier = () => downloadResume(data, reglages)

  const importerFichier = async (e) => {
    const fichier = e.target.files?.[0]
    // Réinitialiser tout de suite permet de réimporter le même fichier après
    // l'avoir corrigé : sans ça, `change` ne se déclencherait pas deux fois.
    e.target.value = ''
    if (!fichier) return
    try {
      const { resume, settings } = parseResumeFile(await fichier.text())
      setData(resume)
      if (templates[settings.templateKey]) setTemplateKey(settings.templateKey)
      if (settings.accent) setAccent(settings.accent)
      setAppearance(settings.appearance)
      if (isLocale(settings.uiLang)) setUiLang(settings.uiLang)
      // Une langue de CV absente du fichier remet le suivi automatique, ce qui
      // est bien le comportement par défaut attendu.
      setCvLangChoisie(isLocale(settings.cvLang) ? settings.cvLang : null)
      setNotice(null)
    } catch (err) {
      setNotice(err.message)
    }
  }

  // Le PDF est produit par le moteur d'impression du navigateur, pas par une
  // capture raster : le texte reste du texte, les SVG restent vectoriels et les
  // polices sont embarquées. C'est aussi le même moteur que celui qui dessine
  // l'aperçu, donc le rendu ne peut pas diverger.
  const exportPdf = () => {
    setHighlight(null)
    // Chrome et Edge dérivent le nom de fichier proposé du titre du document.
    const name = `CV_${data.infos.prenom || 'cv'}_${data.infos.nom || ''}`.trim().replace(/\s+/g, '_')
    const prevTitle = document.title
    document.title = name
    const restore = () => {
      document.title = prevTitle
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    window.print()
  }

  const pagesProps = { template, data, sections, accent, appearance, pages, t: cvT, lang: cvLang }

  return (
    // L'éditeur puise ses libellés dans ce contexte plutôt que de les recevoir
    // en props à travers toute sa hiérarchie de champs.
    <UiLanguageProvider locale={uiLang}>
      <div className="app-shell flex h-screen flex-col">
        {/* Top bar */}
        <header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-lg font-bold text-indigo-600">CV-Gen</span>
            {/* Le sous-titre est décoratif : il disparaît en premier plutôt que
                de pousser les commandes sur une ligne supplémentaire. */}
            <span className="hidden whitespace-nowrap text-xs text-slate-400 xl:inline">
              {ui.tagline}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
            {/* Template selector */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {templateKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => chooseTemplate(key)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                    templateKey === key
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {templates[key].label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                title={ui.importerTitre}
              >
                {ui.importer}
              </button>
              <button
                onClick={exporterFichier}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                title={ui.exporterTitre}
              >
                {ui.exporter}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={importerFichier}
                className="hidden"
              />
            </div>

            <LanguageMenu
              value={uiLang}
              options={localeList}
              onChange={setUiLang}
              label={ui.langueSite}
            />

            <button
              onClick={exportPdf}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              {ui.telechargerPdf}
            </button>
          </div>
        </header>

        {notice && (
          <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-sm text-amber-900">
            <span className="flex-1">{notice}</span>
            <button
              onClick={() => setNotice(null)}
              className="shrink-0 rounded px-2 font-medium text-amber-700 hover:bg-amber-100"
            >
              {ui.fermer}
            </button>
          </div>
        )}

        {/* Workspace */}
        <div className="flex min-h-0 flex-1">
          {/* Editor */}
          <div className="w-[420px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-6">
            <Editor
              data={data}
              setData={setData}
              focusTarget={focusTarget}
              appearance={appearance}
              setAppearance={setAppearance}
              accent={accent}
              setAccent={setAccent}
              accents={ACCENTS}
              locales={localeList}
              cvLangChoisie={cvLangChoisie}
              setCvLangChoisie={setCvLangChoisie}
              langueSuivieLabel={dictionary(uiLang).label}
            />
          </div>

          {/* Preview */}
          <div ref={previewWrapRef} className="flex-1 overflow-auto bg-slate-200 p-6">
            {/* `transform: scale()` ne réserve aucune place dans le flux : sans
                ce conteneur dimensionné, la zone de défilement ignorerait la
                hauteur réelle des feuilles. */}
            <div
              style={{
                width: PAGE_WIDTH_PX * scale,
                height: (pageCount * PAGE_HEIGHT_PX + (pageCount - 1) * PAGE_GAP_PX) * scale,
                margin: '0 auto',
              }}
            >
              <div
                className="cv-preview-stack"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  width: PAGE_WIDTH_PX,
                  gap: PAGE_GAP_PX,
                }}
              >
                <ResumePages {...pagesProps} interactive handlers={previewHandlers} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mesure hors écran : alimente le moteur de pagination. */}
      <ResumeMeasurer
        template={template}
        data={data}
        sections={sections}
        accent={accent}
        appearance={appearance}
        t={cvT}
        onMeasure={setMetrics}
      />

      {/* Source du PDF : les mêmes pages, à l'échelle 1, hors de .app-shell que
          l'impression masque entièrement. */}
      <div className="cv-print-source" aria-hidden>
        <ResumePages {...pagesProps} />
      </div>
    </UiLanguageProvider>
  )
}
