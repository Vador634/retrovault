// Classes écrites en entier, sinon Tailwind ne les détecte pas
const layouts = {
  auto: 'flex flex-wrap',
  2: 'grid grid-cols-2',
  3: 'grid grid-cols-3',
  4: 'grid grid-cols-2 sm:grid-cols-4',
}

// Boutons à choix unique (plus pratiques qu'un <select> au doigt)
export default function ChoiceGroup({ label, options, value, onChange, columns = 'auto' }) {
  const grid = layouts[columns]

  return (
    <fieldset>
      {label && <legend className="mb-1.5 text-sm font-medium">{label}</legend>}
      <div className={`${grid} gap-1.5`}>
        {options.map((option) => {
          const { value: optionValue, label: optionLabel } =
            typeof option === 'string' ? { value: option, label: option } : option
          const active = value === optionValue
          return (
            <button
              key={optionValue}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(optionValue)}
              className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'border-accent bg-accent/15 text-ink-strong'
                  : 'border-line bg-bg/40 text-ink hover:border-accent/40'
              }`}
            >
              {optionLabel}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
