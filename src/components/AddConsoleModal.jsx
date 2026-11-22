import { useMemo, useState } from 'react'
import { catalog, getConsole } from '../lib/consoles'
import { ETATS, matches } from '../lib/games'
import { ajouterConsole, modifierConsole } from '../store/collection'
import { toast } from '../store/toast'
import Modal from './Modal'
import ConsoleArt from './ConsoleArt'
import ChoiceGroup from './ChoiceGroup'

/**
 * Ajout en 3 étapes : console -> modèle -> options.
 * Avec `entry`, la même pop-up sert à modifier un exemplaire existant.
 */
export default function AddConsoleModal({ entry, onClose }) {
  const editing = Boolean(entry)
  const [step, setStep] = useState(editing ? 'options' : 'console')
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({
    consoleId: entry?.consoleId ?? null,
    modele: entry?.modele ?? '',
    etat: entry?.etat ?? 'Bon',
    enBoite: entry?.enBoite ?? false,
    edition: entry?.edition ?? '',
    commentaire: entry?.commentaire ?? '',
  })

  const selected = form.consoleId ? getConsole(form.consoleId) : null
  const set = (changes) => setForm((f) => ({ ...f, ...changes }))

  const filtered = useMemo(
    () => (filter.trim() ? catalog.filter((c) => matches(`${c.nom} ${c.fabricant}`, filter)) : catalog),
    [filter],
  )

  function handleSave(e) {
    e.preventDefault()
    const data = { ...form, edition: form.edition.trim(), commentaire: form.commentaire.trim() }
    if (editing) {
      modifierConsole(entry.id, data)
      toast('Console mise à jour')
    } else {
      ajouterConsole(data)
      toast(`${selected.nom} ajoutée !`)
    }
    onClose()
  }

  const titles = {
    console: 'Choisis une console',
    modele: selected ? `${selected.nom} · modèle` : '',
    options: editing ? 'Modifier la console' : 'Dernières infos',
  }

  const back = !editing && step !== 'console' ? () => setStep(step === 'options' ? 'modele' : 'console') : undefined

  return (
    <Modal title={titles[step]} onClose={onClose} onBack={back} wide={step === 'console'}>
      {step === 'console' && (
        <>
          <input
            className="input mb-4"
            placeholder="Filtrer (ex. Sega, Game Boy…)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((c) => (
              <button
                key={c.id}
                className="panel overflow-hidden text-left transition hover:border-accent/60"
                onClick={() => {
                  set({ consoleId: c.id, modele: c.modeles[0] })
                  setStep('modele')
                }}
              >
                <ConsoleArt console={c} className="aspect-[5/3]" />
                <span className="block px-2.5 py-2">
                  <span className="block truncate text-sm font-semibold text-ink-strong">{c.nom}</span>
                  <span className="block text-xs text-muted">
                    {c.fabricant} · {c.annee}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted">Aucune console ne correspond.</p>}
        </>
      )}

      {step === 'modele' && selected && (
        <div className="space-y-2">
          <p className="mb-3 text-sm text-muted">Quel modèle as-tu ?</p>
          {selected.modeles.map((modele) => (
            <button
              key={modele}
              className="flex w-full items-center justify-between rounded-lg border border-line bg-bg/40 px-4 py-3.5 text-left font-medium transition hover:border-accent"
              onClick={() => {
                set({ modele })
                setStep('options')
              }}
            >
              {modele}
              <span className="text-accent">›</span>
            </button>
          ))}
        </div>
      )}

      {step === 'options' && selected && (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center gap-3">
            <ConsoleArt console={selected} className="h-14 w-24 shrink-0 rounded-md" />
            <div>
              <p className="font-semibold text-ink-strong">{selected.nom}</p>
              <p className="text-sm text-muted">{form.modele}</p>
            </div>
          </div>

          {editing && (
            <ChoiceGroup label="Modèle" options={selected.modeles} value={form.modele} onChange={(modele) => set({ modele })} />
          )}

          <ChoiceGroup label="État de la console" options={ETATS} value={form.etat} onChange={(etat) => set({ etat })} columns={4} />

          <ChoiceGroup
            label="Avec sa boîte ?"
            options={[
              { value: true, label: '📦 En boîte' },
              { value: false, label: 'Sans boîte' },
            ]}
            value={form.enBoite}
            onChange={(enBoite) => set({ enBoite })}
            columns={2}
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Couleur / édition</span>
            <input
              className="input"
              placeholder="ex. Ocean Blue, édition Pikachu…"
              value={form.edition}
              onChange={(e) => set({ edition: e.target.value })}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Commentaire</span>
            <textarea
              className="input min-h-20"
              placeholder="Achetée en brocante, lecteur un peu bruyant…"
              value={form.commentaire}
              onChange={(e) => set({ commentaire: e.target.value })}
            />
          </label>

          <button className="btn btn-primary w-full">{editing ? 'Enregistrer' : 'Ajouter à ma collection'}</button>
        </form>
      )}
    </Modal>
  )
}
