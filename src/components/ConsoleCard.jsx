import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getConsole } from '../lib/consoles'
import ConsoleArt from './ConsoleArt'

export default function ConsoleCard({ entry, gameCount }) {
  const console = getConsole(entry.consoleId)
  if (!console) return null

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Link
        to={`/console/${entry.id}`}
        draggable={false}
        className="group panel block overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-accent/60"
      >
        <div className="overflow-hidden">
          <ConsoleArt console={console} className="aspect-[5/3] transition duration-300 group-hover:scale-105" />
        </div>
        <div className="p-3">
          <h3 className="truncate font-semibold text-ink-strong">{console.nom}</h3>
          <p className="truncate text-xs text-muted">
            {entry.modele}
            {entry.edition && ` · ${entry.edition}`}
          </p>
          <p className="mt-2 label">
            {gameCount} {gameCount > 1 ? 'jeux' : 'jeu'}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
