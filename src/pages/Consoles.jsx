import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useMyCollection, countJeuxParConsole } from '../store/collection'
import { useCurrentUser } from '../store/auth'
import ConsoleCard from '../components/ConsoleCard'
import AddConsoleModal from '../components/AddConsoleModal'
import Icon from '../components/Icon'

export default function Consoles() {
  const { consoles, jeux } = useMyCollection()
  const user = useCurrentUser()
  const [adding, setAdding] = useState(false)

  const counts = useMemo(() => countJeuxParConsole(jeux), [jeux])
  const totalGames = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-pixel text-sm leading-relaxed text-ink-strong sm:text-base">Mes consoles</h1>
          <p className="text-sm text-muted">
            {consoles.length === 0
              ? `Bienvenue ${user?.pseudo} ! Commence par ajouter une console.`
              : `${consoles.length} console${consoles.length > 1 ? 's' : ''} · ${totalGames} jeu${totalGames > 1 ? 'x' : ''}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {consoles.map((entry) => (
          <ConsoleCard key={entry.id} entry={entry} gameCount={counts[entry.consoleId] ?? 0} />
        ))}

        <button
          onClick={() => setAdding(true)}
          className="group flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line text-muted transition hover:border-accent hover:text-accent hover:shadow-[0_0_24px_var(--glow)]"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-panel-2/60 transition group-hover:scale-110">
            <Icon name="plus" size={28} />
          </span>
          <span className="text-sm font-semibold">Ajouter une console</span>
        </button>
      </div>

      <AnimatePresence>{adding && <AddConsoleModal onClose={() => setAdding(false)} />}</AnimatePresence>
    </section>
  )
}
