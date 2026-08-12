import { useEffect, useRef, useState } from 'react'

/**
 * Sélecteur de langue de l'interface, en menu déroulant : le code à deux
 * lettres tient dans la barre du haut là où un libellé complet la ferait
 * déborder, et la liste ouverte donne quand même les noms en entier.
 */
export default function LanguageMenu({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  // Un menu qui ne se referme ni au clic à côté ni à Échap est le premier
  // reproche qu'on fait à un déroulant maison.
  useEffect(() => {
    if (!open) return
    const surClic = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    const surTouche = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', surClic)
    document.addEventListener('keydown', surTouche)
    return () => {
      document.removeEventListener('mousedown', surClic)
      document.removeEventListener('keydown', surTouche)
    }
  }, [open])

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
        </svg>
        <span className="uppercase">{value}</span>
        <span className={`text-xs text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1 min-w-[9rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {options.map((o) => (
            <li key={o.code}>
              <button
                type="button"
                role="option"
                aria-selected={o.code === value}
                onClick={() => {
                  onChange(o.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm transition hover:bg-slate-50 ${
                  o.code === value ? 'font-semibold text-indigo-600' : 'text-slate-700'
                }`}
              >
                {o.label}
                <span className="text-xs uppercase text-slate-400">{o.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
