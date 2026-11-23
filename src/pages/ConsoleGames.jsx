import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { getConsole } from '../lib/consoles'
import { REGIONS, isComplete } from '../lib/games'
import { useMyCollection, supprimerConsole } from '../store/collection'
import { toast } from '../store/toast'
import ConsoleArt from '../components/ConsoleArt'
import GameCard from '../components/GameCard'
import SearchGameModal from '../components/SearchGameModal'
import GameDetailModal from '../components/GameDetailModal'
import AddConsoleModal from '../components/AddConsoleModal'
import { EmptyState } from '../components/States'
import Icon from '../components/Icon'

const TRIS = {
  recent: { label: 'Ajout récent', compare: (a, b) => b.dateAjout.localeCompare(a.dateAjout) },
  alpha: { label: 'A → Z', compare: (a, b) => a.titre.localeCompare(b.titre) },
  note: { label: 'Mieux notés', compare: (a, b) => (b.note ?? -1) - (a.note ?? -1) },
  annee: { label: 'Année de sortie', compare: (a, b) => (a.sortie ?? '9999').localeCompare(b.sortie ?? '9999') },
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-[var(--radius-btn)] border px-3 py-1.5 text-xs font-semibold transition ${
        active ? 'border-accent bg-accent/15 text-ink-strong' : 'border-line text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function ConsoleGames() {
  const { entryId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { consoles, jeux } = useMyCollection()

  const [tab, setTab] = useState('possede')
  const [region, setRegion] = useState('')
  const [completude, setCompletude] = useState('')
  const [tri, setTri] = useState('recent')
  const [searching, setSearching] = useState(false)
  const [editingConsole, setEditingConsole] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const entry = consoles.find((c) => c.id === entryId)
  const console = entry && getConsole(entry.consoleId)

  const gamesOfConsole = jeux.filter((j) => j.consoleId === entry?.consoleId)
  const owned = gamesOfConsole.filter((j) => j.statut === 'possede')
  const wanted = gamesOfConsole.filter((j) => j.statut === 'recherche')

  const visible = (tab === 'possede' ? owned : wanted)
    .filter((j) => {
      if (region && j.region !== region) return false
      if (tab === 'possede' && completude === 'complet' && !isComplete(j)) return false
      if (tab === 'possede' && completude === 'incomplet' && isComplete(j)) return false
      return true
    })
    .sort(TRIS[tri].compare)

  // Le jeu ouvert est dans l'URL (?jeu=...) : la recherche rapide peut l'ouvrir directement
  const openedId = searchParams.get('jeu')
  const opened = openedId && gamesOfConsole.find((j) => j.id === openedId)
  const openGame = (id) => setSearchParams(id ? { jeu: id } : {}, { replace: true })

  if (!entry || !console) {
    return (
      <EmptyState title="Console introuvable">
        Elle a peut-être été retirée de ta collection. <Link to="/" className="text-accent underline">Retour à mes consoles</Link>
      </EmptyState>
    )
  }

  const otherCopies = consoles.filter((c) => c.consoleId === console.id && c.id !== entry.id)

  function handleRemove() {
    supprimerConsole(entry.id)
    toast(`${console.nom} retirée de ta collection`)
    navigate('/')
  }

  return (
    <section>
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <Icon name="back" size={16} /> Mes consoles
      </Link>

      {/* En-tête de la console */}
      <header className="panel mb-5 overflow-hidden sm:flex">
        <ConsoleArt console={console} className="aspect-[5/3] sm:aspect-auto sm:w-64 sm:shrink-0" />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="page-title">{console.nom}</h1>
              <p className="text-sm text-muted">
                {entry.modele}
                {entry.edition && ` · ${entry.edition}`} · {entry.etat}
                {entry.enBoite && ' · en boîte'}
              </p>
            </div>
            <p className="shrink-0 text-right">
              <span className="block font-display text-2xl font-bold text-accent">{owned.length}</span>
              <span className="text-xs text-muted">{owned.length > 1 ? 'jeux' : 'jeu'}</span>
            </p>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
            {[
              ['Sortie', `${console.annee} · ${console.generation}e gén.`],
              ['Processeur', console.specs.cpu],
              ['Mémoire', console.specs.memoire],
              ['Support', console.specs.support],
              ['Jeux sortis', console.specs.jeux],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted">{label}</dt>
                <dd className="text-ink-strong">{value}</dd>
              </div>
            ))}
          </dl>

          {entry.commentaire && <p className="mt-3 text-sm italic text-muted">« {entry.commentaire} »</p>}
          {otherCopies.length > 0 && (
            <p className="mt-2 text-xs text-muted">
              Tu as aussi : {otherCopies.map((c) => c.modele).join(', ')} (les jeux sont partagés entre tes exemplaires)
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {confirmRemove ? (
              <>
                <span className="w-full text-sm">
                  Retirer cet exemplaire ?
                  {otherCopies.length === 0 && gamesOfConsole.length > 0 && ` Ses ${gamesOfConsole.length} jeux seront aussi supprimés.`}
                </span>
                <button className="btn btn-ghost !min-h-9 text-sm" onClick={() => setConfirmRemove(false)}>
                  Annuler
                </button>
                <button className="btn btn-danger !min-h-9 text-sm" onClick={handleRemove}>
                  Oui, retirer
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost !min-h-9 text-sm" onClick={() => setEditingConsole(true)}>
                  <Icon name="edit" size={16} /> Modifier
                </button>
                <button className="btn btn-ghost !min-h-9 text-sm text-[var(--danger-ink)]" onClick={() => setConfirmRemove(true)}>
                  <Icon name="trash" size={16} /> Retirer
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Onglets + filtres */}
      <div className="tab-bar mb-3 grid grid-cols-2 gap-1 rounded-lg bg-panel/70 p-1" role="tablist">
        {[
          ['possede', `Possédés (${owned.length})`],
          ['recherche', `Recherchés (${wanted.length})`],
        ].map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`rounded-md py-2 text-sm font-semibold transition ${
              tab === value ? 'bg-panel-2 text-ink-strong' : 'text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {gamesOfConsole.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
            <Chip active={!region} onClick={() => setRegion('')}>
              Toutes régions
            </Chip>
            {REGIONS.map((r) => (
              <Chip key={r} active={region === r} onClick={() => setRegion(region === r ? '' : r)}>
                {r}
              </Chip>
            ))}
            {tab === 'possede' && (
              <>
                <span className="mx-1 w-px shrink-0 bg-line" />
                <Chip active={completude === 'complet'} onClick={() => setCompletude(completude === 'complet' ? '' : 'complet')}>
                  Complets
                </Chip>
                <Chip active={completude === 'incomplet'} onClick={() => setCompletude(completude === 'incomplet' ? '' : 'incomplet')}>
                  Incomplets
                </Chip>
              </>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            Trier par
            <select className="input !w-auto !py-1.5 text-sm" value={tri} onChange={(e) => setTri(e.target.value)}>
              {Object.entries(TRIS).map(([value, t]) => (
                <option key={value} value={value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Grille : la carte "+" en premier, les jeux à côté */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
        <button
          onClick={() => setSearching(true)}
          className="group flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line text-muted transition hover:border-accent hover:text-accent"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-panel-2/60 transition group-hover:scale-110">
            <Icon name="plus" size={26} />
          </span>
          <span className="px-2 text-center text-sm font-semibold">Ajouter un jeu</span>
        </button>

        <AnimatePresence>
          {visible.map((game) => (
            <GameCard key={game.id} game={game} onClick={() => openGame(game.id)} />
          ))}
        </AnimatePresence>
      </div>

      {gamesOfConsole.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Aucun jeu ici… appuie sur <strong className="text-accent">+</strong> pour commencer ta collection {console.nom}.
        </p>
      )}
      {gamesOfConsole.length > 0 && visible.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          {tab === 'recherche' && wanted.length === 0
            ? 'Aucun jeu recherché sur cette console. Ajoute-en un avec + en choisissant « Je le recherche ».'
            : 'Aucun jeu ne correspond à ces filtres.'}
        </p>
      )}

      <AnimatePresence>
        {searching && <SearchGameModal console={console} onClose={() => setSearching(false)} />}
        {opened && <GameDetailModal key={opened.id} game={opened} console={console} onClose={() => openGame(null)} />}
        {editingConsole && <AddConsoleModal entry={entry} onClose={() => setEditingConsole(false)} />}
      </AnimatePresence>
    </section>
  )
}
