import { useEffect, useMemo, useState } from 'react'
import { searchGames, getGenres, thumbnail } from '../lib/rawg'
import { releaseYear, FORMATS } from '../lib/games'
import { ajouterJeu, useMyCollection } from '../store/collection'
import { toast } from '../store/toast'
import Modal from './Modal'
import GameForm from './GameForm'
import { Badge } from './Badges'
import { ErrorMessage, RowSkeleton } from './States'

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/**
 * Recherche RAWG limitée à la plateforme de la console.
 * Champ vide = jeux les plus populaires de la console, pour fouiller le catalogue.
 */
export default function SearchGameModal({ console, onClose }) {
  const { jeux } = useMyCollection()
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [year, setYear] = useState('')
  const [genres, setGenres] = useState([])

  const [results, setResults] = useState([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  const [picked, setPicked] = useState(null)
  const debouncedQuery = useDebounced(query)

  // La page est liée aux critères : s'ils changent, on repart de la page 1
  const criteria = `${debouncedQuery}|${genre}|${year}`
  const [paging, setPaging] = useState({ criteria, page: 1 })
  const page = paging.criteria === criteria ? paging.page : 1

  useEffect(() => {
    getGenres().then(setGenres).catch(() => {}) // les filtres sont un plus, pas grave s'ils manquent
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')

    searchGames({ console, query: debouncedQuery, genre, year, page }, controller.signal)
      .then((data) => {
        setResults((prev) => (page === 1 ? data.games : [...prev, ...data.games]))
        setHasMore(data.hasMore)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setLoading(false)
      })

    return () => controller.abort()
  }, [console, debouncedQuery, genre, year, page, retry])

  // Ce que je possède déjà sur cette console, indexé par id RAWG
  const mine = useMemo(() => {
    const map = {}
    for (const jeu of jeux) {
      if (jeu.consoleId === console.id) (map[jeu.rawgId] ??= []).push(jeu)
    }
    return map
  }, [jeux, console.id])

  const years = useMemo(() => {
    const last = new Date().getFullYear()
    const first = console.annee - 1
    return Array.from({ length: Math.min(last, console.annee + 25) - first + 1 }, (_, i) => first + i)
  }, [console.annee])

  function handleAdd(data) {
    ajouterJeu({
      rawgId: picked.rawgId,
      consoleId: console.id,
      titre: picked.titre,
      image: picked.image,
      sortie: picked.sortie,
      genres: picked.genres,
      ...data,
    })
    toast(data.statut === 'recherche' ? `${picked.titre} ajouté à la wishlist` : `${picked.titre} ajouté !`)
    onClose()
  }

  if (picked) {
    const copies = mine[picked.rawgId] ?? []
    return (
      <Modal title={picked.titre} onClose={onClose} onBack={() => setPicked(null)}>
        <div className="mb-5 flex gap-3">
          <img src={thumbnail(picked.image, 200)} alt="" className="h-24 w-20 shrink-0 rounded-md bg-panel-2 object-cover" />
          <div className="min-w-0">
            <p className="font-semibold text-ink-strong">{picked.titre}</p>
            <p className="text-sm text-muted">
              {console.nom} · {releaseYear(picked.sortie) ?? 'date inconnue'}
            </p>
            <p className="truncate text-xs text-muted">{picked.genres.join(', ')}</p>
          </div>
        </div>

        {copies.length > 0 && (
          <p className="mb-4 rounded-lg border border-[#ef6c00]/50 bg-[#ef6c00]/10 px-3 py-2 text-sm">
            Déjà dans ta collection :{' '}
            {copies
              .map((c) => (c.statut === 'recherche' ? 'en wishlist' : `${c.region} ${FORMATS[c.format]?.court}`))
              .join(', ')}
            . Tu peux quand même ajouter un autre exemplaire.
          </p>
        )}

        <GameForm onSubmit={handleAdd} submitLabel="Ajouter à ma collection" />
      </Modal>
    )
  }

  return (
    <Modal title={`Ajouter un jeu · ${console.nom}`} onClose={onClose} wide>
      <div className="sticky -top-4 z-10 -mx-4 -mt-4 space-y-2 bg-panel px-4 pb-3 pt-4 sm:-mx-5 sm:px-5">
        <input
          className="input"
          type="search"
          autoFocus
          placeholder={`Rechercher un jeu ${console.nom}…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <select className="input !py-2 text-sm" value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Genre">
            <option value="">Tous les genres</option>
            {genres.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.nom}
              </option>
            ))}
          </select>
          <select className="input !py-2 text-sm" value={year} onChange={(e) => setYear(e.target.value)} aria-label="Année">
            <option value="">Toutes les années</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {!debouncedQuery && !loading && !error && (
          <p className="text-xs text-muted">Les jeux les plus populaires sur {console.nom}. Tape un titre pour chercher.</p>
        )}
      </div>

      {error && <ErrorMessage onRetry={() => setRetry((n) => n + 1)}>{error}</ErrorMessage>}

      <ul className="mt-2 space-y-1">
        {results.map((game) => {
          const copies = mine[game.rawgId] ?? []
          const owned = copies.some((c) => c.statut === 'possede')
          const wanted = copies.some((c) => c.statut === 'recherche')
          return (
            <li key={game.rawgId}>
              <button
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-panel-2/60"
                onClick={() => setPicked(game)}
              >
                {game.image ? (
                  <img src={thumbnail(game.image, 200)} alt="" loading="lazy" className="h-20 w-16 shrink-0 rounded-md bg-panel-2 object-cover" />
                ) : (
                  <span className="h-20 w-16 shrink-0 rounded-md bg-panel-2" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug text-ink-strong">{game.titre}</span>
                  <span className="block text-sm text-muted">{releaseYear(game.sortie) ?? 'Date inconnue'}</span>
                  <span className="block truncate text-xs text-muted">{game.genres.join(' · ')}</span>
                  <span className="mt-1 flex gap-1">
                    {owned && <Badge kind="owned">Dans ma collection</Badge>}
                    {wanted && <Badge kind="wish">★ Wishlist</Badge>}
                  </span>
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/15 text-xl text-accent">+</span>
              </button>
            </li>
          )
        })}
      </ul>

      {loading && (
        <div className="mt-2 space-y-3 p-2">
          {[0, 1, 2, 3].map((i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">
          Aucun jeu trouvé sur {console.nom}. Essaie un autre titre ou retire un filtre.
        </p>
      )}

      {!loading && hasMore && (
        <button className="btn btn-ghost mt-3 w-full" onClick={() => setPaging({ criteria, page: page + 1 })}>
          Voir plus de jeux
        </button>
      )}
    </Modal>
  )
}
