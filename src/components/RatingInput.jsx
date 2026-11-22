import { useSettings } from '../store/settings'

/**
 * Note perso. Stockée sur 10 dans tous les cas ; en mode "sur 5",
 * chaque étoile vaut 2 points. Recliquer sur la note actuelle l'efface.
 */
export default function RatingInput({ value, onChange }) {
  const scale = useSettings((s) => s.noteScale)
  const step = scale === 5 ? 2 : 1
  const current = value ? Math.round(value / step) : 0

  return (
    <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label={`Note sur ${scale}`}>
      {Array.from({ length: scale }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={current === n}
          aria-label={`${n} sur ${scale}`}
          onClick={() => onChange(current === n ? null : n * step)}
          className={`grid place-items-center rounded transition hover:scale-110 ${
            scale === 5 ? 'h-10 w-10 text-2xl' : 'h-9 w-7 text-lg'
          } ${n <= current ? 'text-[#ffc83d]' : 'text-muted/40'}`}
        >
          ★
        </button>
      ))}
      <span className="ml-1 text-sm text-muted">{current ? `${current}/${scale}` : 'Pas noté'}</span>
    </div>
  )
}
