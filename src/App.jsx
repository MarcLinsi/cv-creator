import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Editor from './components/Editor'
import { sampleResume } from './data/resume'
import { templates, templateKeys } from './templates'

const ACCENTS = ['#86c06a', '#4f46e5', '#0d9488', '#dc2626', '#1e3a5f', '#7c3aed', '#ea580c', '#0f172a']
const PAGE_WIDTH_PX = 794 // 210mm @ 96dpi
const PAGE_HEIGHT_PX = 1123 // 297mm @ 96dpi
const PAGE_GAP_PX = 24 // visual gap between page sheets in the preview

export default function App() {
  const [data, setData] = useState(sampleResume)
  const [templateKey, setTemplateKey] = useState('vert')
  const [accent, setAccent] = useState(templates.vert.defaultAccent)
  const [scale, setScale] = useState(1)
  const [focusTarget, setFocusTarget] = useState(null)
  const [appearance, setAppearance] = useState({ font: 'auto', scale: 1 })
  const [pageCount, setPageCount] = useState(1)

  const measureRef = useRef(null)
  const previewWrapRef = useRef(null)
  const hlRef = useRef(null)

  // --- Click-to-edit: highlight on hover, focus matching editor section on click ---
  const setHighlight = (el) => {
    if (hlRef.current === el) return
    if (hlRef.current) hlRef.current.classList.remove('cv-hl')
    hlRef.current = el
    if (el) el.classList.add('cv-hl')
  }
  const handlePreviewOver = (e) => setHighlight(e.target.closest('[data-edit-id]'))
  const handlePreviewLeave = () => setHighlight(null)
  const handlePreviewClick = (e) => {
    const el = e.target.closest('[data-edit-id]')
    if (el) setFocusTarget({ id: el.dataset.editId, nonce: Date.now() })
  }

  const { Component } = templates[templateKey]

  // Switch template -> apply its default accent
  const chooseTemplate = (key) => {
    setTemplateKey(key)
    setAccent(templates[key].defaultAccent)
  }

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

  // Measure the natural content height (rendered off-screen at A4 width) and
  // derive how many A4 pages are needed. A ResizeObserver keeps it correct even
  // when the layout reflows late (e.g. CSS multi-column balancing settles after
  // the initial commit, or web fonts finish loading).
  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    const measure = () =>
      setPageCount(Math.max(1, Math.ceil(el.offsetHeight / PAGE_HEIGHT_PX)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [data, appearance, templateKey])

  // Le PDF est produit par le moteur d'impression du navigateur, pas par une
  // capture raster : le texte reste du texte, les SVG restent vectoriels et les
  // polices sont embarquées. C'est aussi le même moteur que celui qui dessine
  // l'aperçu, donc le rendu ne peut pas diverger.
  //
  // On imprime la sonde de mesure (`cv-print-source`) : c'est le document
  // complet en un seul exemplaire à hauteur naturelle. Les feuilles de l'aperçu
  // sont, elles, N copies fenêtrées du même contenu — les imprimer ferait N fois
  // le texte dans le PDF. La pagination est laissée à `@page` + aux règles
  // `break-inside-avoid` déjà portées par les templates.
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

  return (
    <>
    <div className="app-shell flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-600">CV-Gen</span>
          <span className="text-xs text-slate-400">générateur de CV</span>
        </div>

        <div className="flex items-center gap-4">
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

          <button
            onClick={exportPdf}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Télécharger le PDF
          </button>
        </div>
      </header>

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
          />
        </div>

        {/* Preview */}
        <div ref={previewWrapRef} className="flex-1 overflow-auto bg-slate-200 p-6">
          <div
            style={{
              width: PAGE_WIDTH_PX * scale,
              height:
                (pageCount * PAGE_HEIGHT_PX + (pageCount - 1) * PAGE_GAP_PX) * scale,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: PAGE_WIDTH_PX,
                display: 'flex',
                flexDirection: 'column',
                gap: PAGE_GAP_PX,
              }}
            >
              {Array.from({ length: pageCount }).map((_, i) => (
                <div
                  key={i}
                  className="cv-page shadow-xl"
                  data-font={appearance.font}
                  style={{ '--cv-accent': accent, '--cv-fs': appearance.scale }}
                  onMouseOver={handlePreviewOver}
                  onMouseLeave={handlePreviewLeave}
                  onClick={handlePreviewClick}
                >
                  <div
                    style={{
                      height: pageCount * PAGE_HEIGHT_PX,
                      transform: `translateY(${-i * PAGE_HEIGHT_PX}px)`,
                    }}
                  >
                    <Component data={data} accent={accent} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>

      {/* Off-screen probe: renders the content at natural A4 width and height so
          we can measure how many A4 pages it spans. C'est aussi la source du PDF
          (voir exportPdf et les règles @media print) : un seul exemplaire du
          document, que le navigateur pagine lui-même. Il est volontairement hors
          de .app-shell, que l'impression masque entièrement. */}
      <div
        ref={measureRef}
        aria-hidden
        className="cv-page cv-print-source"
        data-font={appearance.font}
        style={{
          position: 'absolute',
          left: -99999,
          top: 0,
          height: 'auto',
          overflow: 'visible',
          boxShadow: 'none',
          pointerEvents: 'none',
          '--cv-accent': accent,
          '--cv-fs': appearance.scale,
        }}
      >
        <Component data={data} accent={accent} />
      </div>
    </>
  )
}
