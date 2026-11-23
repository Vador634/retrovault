import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMyCollection, countJeuxParConsole, reordonnerConsoles } from '../store/collection'
import { useCurrentUser } from '../store/auth'
import { useSettings } from '../store/settings'
import { getConsole } from '../lib/consoles'
import ConsoleCard from '../components/ConsoleCard'
import AddConsoleModal from '../components/AddConsoleModal'
import Icon from '../components/Icon'

// Les tris proposés. "perso" = l'ordre enregistré, qu'on change en glissant les cartes.
const TRIS = {
  perso: { label: 'Mon ordre' },
  marque: { label: 'Marque', compare: (a, b) => a.console.fabricant.localeCompare(b.console.fabricant) || a.console.annee - b.console.annee },
  ancienne: { label: 'Plus anciennes', compare: (a, b) => a.console.annee - b.console.annee },
  recente: { label: 'Plus récentes', compare: (a, b) => b.console.annee - a.console.annee },
  jeux: { label: 'Nombre de jeux', compare: (a, b) => b.count - a.count },
  nom: { label: 'Nom (A → Z)', compare: (a, b) => a.console.nom.localeCompare(b.console.nom) },
}

// Quand on lâche une carte, le navigateur envoie un "click" sur son lien.
// dnd-kit stoppe sa propagation mais le lien s'ouvrirait quand même :
// pendant un déplacement on annule donc ce clic au niveau de la fenêtre.
const annulerClic = (e) => e.preventDefault()
const bloquerClics = () => window.addEventListener('click', annulerClic, true)
const debloquerClics = () => setTimeout(() => window.removeEventListener('click', annulerClic, true), 100)

function SortableCard({ item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.entry.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`touch-manipulation select-none [-webkit-touch-callout:none] ${isDragging ? 'relative z-10 opacity-90 drop-shadow-2xl' : ''}`}
      {...attributes}
      {...listeners}
    >
      <ConsoleCard entry={item.entry} gameCount={item.count} />
    </div>
  )
}

function AddCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line text-muted transition hover:border-accent hover:text-accent"
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-panel-2/60 transition group-hover:scale-110">
        <Icon name="plus" size={28} />
      </span>
      <span className="text-sm font-semibold">Ajouter une console</span>
    </button>
  )
}

const grille = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4'

export default function Consoles() {
  const { consoles, jeux } = useMyCollection()
  const user = useCurrentUser()
  const tri = useSettings((s) => s.triConsoles)
  const setTri = useSettings((s) => s.setTriConsoles)
  const [adding, setAdding] = useState(false)

  const counts = useMemo(() => countJeuxParConsole(jeux), [jeux])
  const totalGames = Object.values(counts).reduce((sum, n) => sum + n, 0)

  const items = consoles
    .map((entry) => ({ entry, console: getConsole(entry.consoleId), count: counts[entry.consoleId] ?? 0 }))
    .filter((item) => item.console)
  const sorted = TRIS[tri]?.compare ? [...items].sort(TRIS[tri].compare) : items

  // Au doigt il faut rester appuyé un court instant, sinon on ne pourrait plus faire défiler la page
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }) {
    debloquerClics()
    if (!over || active.id === over.id) return
    const ids = consoles.map((c) => c.id)
    reordonnerConsoles(arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id)))
  }

  // Tri par marque : un petit titre par fabricant
  let groupes = null
  if (tri === 'marque') {
    const parMarque = {}
    for (const item of sorted) (parMarque[item.console.fabricant] ??= []).push(item)
    groupes = Object.entries(parMarque)
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Mes consoles</h1>
          <p className="text-sm text-muted">
            {consoles.length === 0
              ? `Bienvenue ${user?.pseudo} ! Commence par ajouter une console.`
              : `${consoles.length} console${consoles.length > 1 ? 's' : ''} · ${totalGames} jeu${totalGames > 1 ? 'x' : ''}`}
          </p>
        </div>

        {consoles.length > 1 && (
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
        )}
      </div>

      {tri === 'perso' && consoles.length > 1 && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-muted">
          <Icon name="move" size={14} />
          <span className="hidden sm:inline">Fais glisser une carte pour changer l'ordre.</span>
          <span className="sm:hidden">Reste appuyé sur une carte puis fais-la glisser pour changer l'ordre.</span>
        </p>
      )}

      {groupes ? (
        <div className="space-y-6">
          {groupes.map(([fabricant, list]) => (
            <div key={fabricant}>
              <h2 className="label mb-2">{fabricant}</h2>
              <div className={grille}>
                {list.map((item) => (
                  <ConsoleCard key={item.entry.id} entry={item.entry} gameCount={item.count} />
                ))}
              </div>
            </div>
          ))}
          <div className={grille}>
            <AddCard onClick={() => setAdding(true)} />
          </div>
        </div>
      ) : tri === 'perso' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={bloquerClics}
          onDragEnd={handleDragEnd}
          onDragCancel={debloquerClics}
        >
          <SortableContext items={sorted.map((item) => item.entry.id)} strategy={rectSortingStrategy}>
            <div className={grille}>
              {sorted.map((item) => (
                <SortableCard key={item.entry.id} item={item} />
              ))}
              <AddCard onClick={() => setAdding(true)} />
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className={grille}>
          {sorted.map((item) => (
            <ConsoleCard key={item.entry.id} entry={item.entry} gameCount={item.count} />
          ))}
          <AddCard onClick={() => setAdding(true)} />
        </div>
      )}

      <AnimatePresence>{adding && <AddConsoleModal onClose={() => setAdding(false)} />}</AnimatePresence>
    </section>
  )
}
