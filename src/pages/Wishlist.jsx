import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMyCollection } from '../store/collection'
import { getConsole } from '../lib/consoles'
import GameCard from '../components/GameCard'
import { EmptyState } from '../components/States'

export default function Wishlist() {
  const { consoles, jeux } = useMyCollection()
  const navigate = useNavigate()

  // Wishlist regroupée par console, dans l'ordre de "Mes consoles".
  // Si on a deux exemplaires d'une console, on ne garde que le premier.
  const groups = useMemo(() => {
    const wanted = jeux.filter((j) => j.statut === 'recherche')
    const firstOfEach = consoles.filter((c, i) => consoles.findIndex((o) => o.consoleId === c.consoleId) === i)
    return firstOfEach
      .map((entry) => ({
        entry,
        console: getConsole(entry.consoleId),
        games: wanted.filter((j) => j.consoleId === entry.consoleId).sort((a, b) => a.titre.localeCompare(b.titre)),
      }))
      .filter((g) => g.games.length > 0)
  }, [consoles, jeux])

  const total = groups.reduce((sum, g) => sum + g.games.length, 0)

  return (
    <section>
      <h1 className="font-pixel text-sm leading-relaxed text-ink-strong sm:text-base">Wishlist</h1>
      <p className="mb-5 text-sm text-muted">
        {total ? `${total} jeu${total > 1 ? 'x' : ''} à dénicher` : 'Les jeux que tu cherches encore.'}
      </p>

      {groups.length === 0 ? (
        <EmptyState title="Wishlist vide" icon="⭐">
          Depuis la page d'une console, appuie sur + et choisis « Je le recherche ». Pratique en magasin avec la recherche
          rapide !{' '}
          <Link to="/" className="text-accent underline">
            Voir mes consoles
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {groups.map(({ entry, console, games }) => (
            <div key={entry.consoleId}>
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink-strong">
                {console.nom}
                <span className="rounded-full bg-panel-2 px-2 py-0.5 text-xs text-muted">{games.length}</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} onClick={() => navigate(`/console/${entry.id}?jeu=${game.id}`)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
