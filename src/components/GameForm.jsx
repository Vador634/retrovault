import { useState } from 'react'
import { REGIONS, FORMATS, ETATS, CONTENU_PAR_FORMAT, isComplete } from '../lib/games'
import ChoiceGroup from './ChoiceGroup'
import RatingInput from './RatingInput'
import { Badge } from './Badges'

export const NOUVEL_EXEMPLAIRE = {
  statut: 'possede',
  region: 'PAL',
  format: 'cib',
  contenu: CONTENU_PAR_FORMAT.cib,
  etat: 'Bon',
  prix: '',
  dateAchat: '',
  lieu: '',
  note: null,
  commentaire: '',
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition ${
        checked ? 'border-[#66bb6a] bg-[#2e7d32]/20 text-ink-strong' : 'border-line bg-bg/40 text-muted'
      }`}
    >
      <span aria-hidden="true">{checked ? '✓' : '✗'}</span>
      {label}
    </button>
  )
}

/**
 * Formulaire "mon exemplaire", utilisé à l'ajout et à la modification.
 * Ne garde que les champs de l'exemplaire, les infos RAWG sont gérées à côté.
 */
export default function GameForm({ initial, onSubmit, submitLabel = 'Ajouter', children }) {
  const [form, setForm] = useState({ ...NOUVEL_EXEMPLAIRE, ...initial })
  const set = (changes) => setForm((f) => ({ ...f, ...changes }))
  const wanted = form.statut === 'recherche'

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      ...form,
      prix: form.prix === '' ? null : Number(form.prix),
      lieu: form.lieu.trim(),
      commentaire: form.commentaire.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ChoiceGroup
        options={[
          { value: 'possede', label: '🎮 Je l’ai' },
          { value: 'recherche', label: '⭐ Je le recherche' },
        ]}
        value={form.statut}
        onChange={(statut) => set({ statut })}
        columns={2}
      />

      <ChoiceGroup
        label={wanted ? 'Région voulue' : 'Région de mon exemplaire'}
        options={REGIONS}
        value={form.region}
        onChange={(region) => set({ region })}
        columns={3}
      />

      {!wanted && (
        <>
          <ChoiceGroup
            label="Format"
            options={Object.entries(FORMATS).map(([value, f]) => ({ value, label: f.label }))}
            value={form.format}
            // changer de format pré-coche le contenu habituel
            onChange={(format) => set({ format, contenu: CONTENU_PAR_FORMAT[format] })}
          />

          <fieldset>
            <legend className="mb-1.5 flex w-full items-center justify-between text-sm font-medium">
              Contenu
              <Badge kind={isComplete(form) ? 'complet' : 'incomplet'}>{isComplete(form) ? 'Complet' : 'Incomplet'}</Badge>
            </legend>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                ['boite', 'Boîte'],
                ['notice', 'Notice'],
                ['jeu', 'Jeu'],
              ].map(([key, label]) => (
                <Toggle
                  key={key}
                  label={label}
                  checked={form.contenu[key]}
                  onChange={(checked) => set({ contenu: { ...form.contenu, [key]: checked } })}
                />
              ))}
            </div>
          </fieldset>

          <ChoiceGroup label="État général" options={ETATS} value={form.etat} onChange={(etat) => set({ etat })} columns={4} />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Prix d'achat (€)</span>
              <input
                className="input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.prix ?? ''}
                onChange={(e) => set({ prix: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Date d'achat</span>
              <input className="input" type="date" value={form.dateAchat} onChange={(e) => set({ dateAchat: e.target.value })} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Lieu d'achat</span>
            <input
              className="input"
              placeholder="Cash Converters, brocante, Leboncoin…"
              value={form.lieu}
              onChange={(e) => set({ lieu: e.target.value })}
            />
          </label>

          <div>
            <span className="mb-1 block text-sm font-medium">Ma note</span>
            <RatingInput value={form.note} onChange={(note) => set({ note })} />
          </div>
        </>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Commentaire</span>
        <textarea
          className="input min-h-20"
          placeholder={wanted ? 'Prix max, version recherchée…' : 'Ton avis, un souvenir, un défaut…'}
          value={form.commentaire}
          onChange={(e) => set({ commentaire: e.target.value })}
        />
      </label>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {children}
        <button className="btn btn-primary w-full sm:w-auto">{submitLabel}</button>
      </div>
    </form>
  )
}
