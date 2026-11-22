import { FORMATS, isComplete } from '../lib/games'

// Couleurs façon étiquettes de cartouches
const styles = {
  PAL: 'bg-[#1e5fbf] text-white border-[#5d93e6]',
  'NTSC-U': 'bg-[#c62828] text-white border-[#ef6a6a]',
  'NTSC-J': 'bg-white text-[#c62828] border-[#c62828]',
  complet: 'bg-[#2e7d32] text-white border-[#66bb6a]',
  incomplet: 'bg-[#ef6c00] text-white border-[#ffa040]',
  format: 'bg-[#2a3f55] text-[#c7d5e0] border-[#4a6681]',
  wish: 'bg-[#b8860b] text-white border-[#e6b84a]',
  owned: 'bg-[#66c0f4] text-[#0e1620] border-[#9fd9fa]',
}

export function Badge({ kind, children }) {
  return (
    <span
      className={`inline-flex items-center rounded-[3px] border px-1.5 py-0.5 text-[0.62rem] font-bold uppercase leading-none tracking-wide shadow-sm ${styles[kind]}`}
    >
      {children}
    </span>
  )
}

export function GameBadges({ game }) {
  if (game.statut === 'recherche') {
    return (
      <div className="flex flex-wrap gap-1">
        <Badge kind="wish">★ Recherché</Badge>
        {game.region && <Badge kind={game.region}>{game.region}</Badge>}
      </div>
    )
  }

  const complete = isComplete(game)
  return (
    <div className="flex flex-wrap gap-1">
      <Badge kind={game.region}>{game.region}</Badge>
      <Badge kind="format">{FORMATS[game.format]?.court}</Badge>
      <Badge kind={complete ? 'complet' : 'incomplet'}>{complete ? 'Complet' : 'Incomplet'}</Badge>
    </div>
  )
}
