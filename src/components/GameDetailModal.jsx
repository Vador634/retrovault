import { useEffect, useState } from 'react'
import { getGameDetails } from '../lib/rawg'
import { FORMATS, formatDate, formatPrice } from '../lib/games'
import { modifierJeu, retirerJeu } from '../store/collection'
import { toast } from '../store/toast'
import Modal from './Modal'
import GameForm from './GameForm'
import RatingInput from './RatingInput'
import { GameBadges } from './Badges'
import { Cover } from './GameCard'
import { ErrorMessage } from './States'
import Icon from './Icon'

function Info({ label, children }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm text-ink-strong">{children || '—'}</dd>
    </div>
  )
}

function RawgDetails({ rawgId }) {
  const [details, setDetails] = useState(null)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let active = true
    getGameDetails(rawgId)
      .then((d) => active && setDetails(d))
      .catch((err) => active && setError(err.message))
    return () => {
      active = false
    }
  }, [rawgId])

  if (error) return <ErrorMessage>Impossible de charger la fiche du jeu : {error}</ErrorMessage>

  if (!details) {
    return (
      <div className="space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-11/12" />
        <div className="skeleton h-3 w-2/3" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3">
        <Info label="Sortie">{formatDate(details.sortie)}</Info>
        <Info label="Genres">{details.genres.join(', ')}</Info>
        <Info label="Développeur">{details.developpeurs.join(', ')}</Info>
        <Info label="Éditeur">{details.editeurs.join(', ')}</Info>
        {details.metacritic && <Info label="Metacritic">{details.metacritic}/100</Info>}
      </dl>

      {details.resume && (
        <div>
          <p className={`whitespace-pre-line text-sm leading-relaxed ${expanded ? '' : 'line-clamp-4'}`}>{details.resume}</p>
          <button className="mt-1 text-sm font-semibold text-accent" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Réduire' : 'Lire la suite'}
          </button>
          <p className="mt-1 text-[0.65rem] text-muted">Résumé en anglais, fourni par RAWG.</p>
        </div>
      )}
    </div>
  )
}

export default function GameDetailModal({ game, console, onClose }) {
  const [mode, setMode] = useState('view') // 'view' | 'edit' | 'found'
  const [confirmDelete, setConfirmDelete] = useState(false)
  const wanted = game.statut === 'recherche'

  function handleSave(data) {
    modifierJeu(game.id, data)
    toast(mode === 'found' ? 'Bravo, un jeu de plus dans la collection !' : 'Modifications enregistrées')
    setMode('view')
  }

  function handleDelete() {
    retirerJeu(game.id)
    toast(`${game.titre} supprimé`)
    onClose()
  }

  if (mode !== 'view') {
    const initial = mode === 'found' ? { ...game, statut: 'possede' } : game
    return (
      <Modal title={mode === 'found' ? 'Je l’ai trouvé !' : `Modifier · ${game.titre}`} onClose={onClose} onBack={() => setMode('view')}>
        <GameForm initial={initial} onSubmit={handleSave} submitLabel="Enregistrer">
          <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={() => setMode('view')}>
            Annuler
          </button>
        </GameForm>
      </Modal>
    )
  }

  const footer = confirmDelete ? (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <p className="flex-1 text-sm">Supprimer définitivement « {game.titre} » ?</p>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
          Non
        </button>
        <button className="btn btn-danger" onClick={handleDelete}>
          Oui, supprimer
        </button>
      </div>
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
      {wanted && (
        <button className="btn btn-primary col-span-2" onClick={() => setMode('found')}>
          Je l'ai trouvé !
        </button>
      )}
      <button className="btn btn-ghost" onClick={() => setMode('edit')}>
        <Icon name="edit" size={18} /> Modifier
      </button>
      <button className="btn btn-ghost text-[var(--danger-ink)]" onClick={() => setConfirmDelete(true)}>
        <Icon name="trash" size={18} /> Supprimer
      </button>
    </div>
  )

  return (
    <Modal title={game.titre} onClose={onClose} footer={footer} wide>
      <div className="sm:flex sm:gap-5">
        <Cover src={game.image} title={game.titre} className="mx-auto mb-4 aspect-[3/4] w-40 shrink-0 self-start rounded-lg sm:mx-0 sm:w-48" />

        <div className="min-w-0 flex-1 space-y-5">
          <div>
            <p className="text-sm text-muted">{console.nom}</p>
            <h3 className="mb-2 text-xl font-bold text-ink-strong">{game.titre}</h3>
            <GameBadges game={game} />
          </div>

          <section className="panel space-y-4 p-4">
            <h4 className="label">{wanted ? 'Ma recherche' : 'Mon exemplaire'}</h4>

            {!wanted && (
              <>
                <dl className="grid grid-cols-2 gap-3">
                  <Info label="Format">{FORMATS[game.format]?.label}</Info>
                  <Info label="État">{game.etat}</Info>
                  <Info label="Contenu">
                    {[game.contenu.boite && 'Boîte', game.contenu.notice && 'Notice', game.contenu.jeu && 'Jeu']
                      .filter(Boolean)
                      .join(' + ')}
                  </Info>
                  <Info label="Prix payé">{formatPrice(game.prix)}</Info>
                  <Info label="Acheté le">{game.dateAchat && formatDate(game.dateAchat)}</Info>
                  <Info label="Lieu">{game.lieu}</Info>
                </dl>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted">Ma note</p>
                  {/* la note se change directement, sans passer par "Modifier" */}
                  <RatingInput value={game.note} onChange={(note) => modifierJeu(game.id, { note })} />
                </div>
              </>
            )}

            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Commentaire</p>
              <p className="whitespace-pre-line text-sm text-ink-strong">{game.commentaire || '—'}</p>
            </div>
          </section>

          <section>
            <h4 className="mb-3 label">Fiche du jeu</h4>
            <RawgDetails rawgId={game.rawgId} />
          </section>
        </div>
      </div>
    </Modal>
  )
}
