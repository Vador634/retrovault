import { motion } from 'framer-motion'
import { thumbnail } from '../lib/rawg'
import { releaseYear, displayNote } from '../lib/games'
import { useSettings } from '../store/settings'
import { GameBadges } from './Badges'

export function Cover({ src, title, className = '' }) {
  if (!src) {
    return (
      <div className={`grid place-items-center bg-panel-2 p-2 text-center font-pixel text-[0.5rem] leading-relaxed text-muted ${className}`}>
        {title}
      </div>
    )
  }
  return <img src={thumbnail(src)} alt={title} loading="lazy" className={`object-cover ${className}`} />
}

export default function GameCard({ game, onClick }) {
  const scale = useSettings((s) => s.noteScale)
  const note = displayNote(game.note, scale)

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      className="group text-left"
    >
      <div className="relative overflow-hidden rounded-lg border border-line bg-panel transition duration-200 group-hover:border-accent/60 group-hover:shadow-[0_0_20px_var(--glow)]">
        <Cover src={game.image} title={game.titre} className="aspect-[3/4] w-full transition duration-300 group-hover:scale-105" />
        {note && (
          <span className="absolute right-1.5 top-1.5 rounded bg-black/75 px-1.5 py-0.5 text-xs font-bold text-[#ffc83d]">
            ★ {note}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 pt-6">
          <GameBadges game={game} />
        </div>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-tight text-ink-strong">{game.titre}</p>
      <p className="text-xs text-muted">{releaseYear(game.sortie) ?? '—'}</p>
    </motion.button>
  )
}
