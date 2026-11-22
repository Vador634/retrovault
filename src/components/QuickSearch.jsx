import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMyCollection } from '../store/collection'
import { getConsole } from '../lib/consoles'
import { matches, isComplete, FORMATS } from '../lib/games'
import { Badge } from './Badges'
import Icon from './Icon'

/**
 * "Je l'ai déjà ?" : recherche instantanée dans MA collection, pensée pour
 * vérifier en magasin qu'on ne va pas acheter un doublon. Aucun appel réseau.
 */
export default function QuickSearch() {
  const { consoles, jeux } = useMyCollection()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const navigate = useNavigate()

  const results = useMemo(
    () =>
      jeux
        .filter((j) => matches(j.titre, query))
        // les jeux possédés d'abord, la wishlist ensuite
        .sort((a, b) => (a.statut === b.statut ? a.titre.localeCompare(b.titre) : a.statut === 'possede' ? -1 : 1))
        .slice(0, 8),
    [jeux, query],
  )

  useEffect(() => {
    const onClick = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onClick)
    return () => document.removeEventListener('pointerdown', onClick)
  }, [])

  function openGame(game) {
    const entry = consoles.find((c) => c.consoleId === game.consoleId)
    if (!entry) return
    setOpen(false)
    setQuery('')
    navigate(`/console/${entry.id}?jeu=${game.id}`)
  }

  const showPanel = open && query.trim().length >= 2

  return (
    <div ref={boxRef} className="relative w-full">
      <label className="relative block">
        <span className="sr-only">Je l'ai déjà ?</span>
        <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          className="input !rounded-full !py-2.5 !pl-10"
          placeholder="Je l'ai déjà ? Tape un titre…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
            if (e.key === 'Enter' && results[0]) openGame(results[0])
          }}
        />
      </label>

      {showPanel && (
        <div className="panel absolute left-0 right-0 top-full z-40 mt-2 max-h-[60vh] overflow-y-auto p-2 shadow-2xl">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm">
              <span className="block text-base font-semibold text-[#66bb6a]">Pas dans ta collection</span>
              <span className="text-muted">Ni possédé ni en wishlist : tu peux l'acheter sans risque de doublon.</span>
            </p>
          ) : (
            <ul>
              {results.map((game) => {
                const console = getConsole(game.consoleId)
                const wanted = game.statut === 'recherche'
                return (
                  <li key={game.id}>
                    <button
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-panel-2/60"
                      onClick={() => openGame(game)}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg ${
                          wanted ? 'bg-[#b8860b]/25' : 'bg-[#2e7d32]/30'
                        }`}
                      >
                        {wanted ? '⭐' : '✔'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink-strong">{game.titre}</span>
                        <span className="block text-xs text-muted">
                          {wanted
                            ? `Dans ta wishlist · ${console?.nom}`
                            : `${console?.nom} · ${FORMATS[game.format]?.court} · ${game.etat}`}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        {game.region && <Badge kind={game.region}>{game.region}</Badge>}
                        {!wanted && (
                          <Badge kind={isComplete(game) ? 'complet' : 'incomplet'}>
                            {isComplete(game) ? 'Complet' : 'Incomplet'}
                          </Badge>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
