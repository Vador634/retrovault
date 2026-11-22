import { useRef, useState } from 'react'
import { useSettings } from '../store/settings'
import { useCurrentUser } from '../store/auth'
import { useMyCollection, remplacerCollection } from '../store/collection'
import { getConsole } from '../lib/consoles'
import { toast } from '../store/toast'
import ChoiceGroup from '../components/ChoiceGroup'

const FORMAT_EXPORT = 'retrovault'

function exportCollection(pseudo, collection) {
  const data = {
    app: FORMAT_EXPORT,
    version: 1,
    pseudo,
    dateExport: new Date().toISOString(),
    consoles: collection.consoles,
    jeux: collection.jeux,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `retrovault-${pseudo}-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// Vérifie qu'un fichier importé ressemble bien à une sauvegarde RetroVault
function readBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("Ce fichier n'est pas un JSON valide.")
  }
  if (data.app !== FORMAT_EXPORT || !Array.isArray(data.consoles) || !Array.isArray(data.jeux)) {
    throw new Error("Ce fichier n'est pas une sauvegarde RetroVault.")
  }
  const unknown = data.consoles.find((c) => !getConsole(c.consoleId))
  if (unknown) throw new Error(`Console inconnue dans la sauvegarde : « ${unknown.consoleId} ».`)
  return data
}

export default function Settings() {
  const { theme, crt, noteScale, setTheme, toggleCrt, setNoteScale } = useSettings()
  const user = useCurrentUser()
  const collection = useMyCollection()
  const fileInput = useRef(null)
  const [pending, setPending] = useState(null)
  const [importError, setImportError] = useState('')

  async function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = '' // pour pouvoir re-choisir le même fichier
    if (!file) return
    setImportError('')
    try {
      setPending(readBackup(await file.text()))
    } catch (err) {
      setImportError(err.message)
    }
  }

  function confirmImport() {
    remplacerCollection(pending)
    toast(`Collection restaurée : ${pending.consoles.length} consoles, ${pending.jeux.length} jeux`)
    setPending(null)
  }

  return (
    <section className="mx-auto max-w-xl space-y-5">
      <h1 className="font-pixel text-sm leading-relaxed text-ink-strong sm:text-base">Réglages</h1>

      <div className="panel space-y-5 p-4">
        <h2 className="font-semibold text-ink-strong">Affichage</h2>
        <ChoiceGroup
          label="Thème"
          options={[
            { value: 'sombre', label: '🌙 Sombre' },
            { value: 'clair', label: '☀️ Clair' },
          ]}
          value={theme}
          onChange={setTheme}
          columns={2}
        />
        <ChoiceGroup
          label="Effet écran CRT (thème sombre)"
          options={[
            { value: true, label: 'Activé' },
            { value: false, label: 'Désactivé' },
          ]}
          value={crt}
          onChange={(value) => value !== crt && toggleCrt()}
          columns={2}
        />
        <ChoiceGroup
          label="Noter les jeux…"
          options={[
            { value: 5, label: 'sur 5 ★' },
            { value: 10, label: 'sur 10' },
          ]}
          value={noteScale}
          onChange={setNoteScale}
          columns={2}
        />
      </div>

      <div className="panel space-y-3 p-4">
        <h2 className="font-semibold text-ink-strong">Sauvegarde</h2>
        <p className="text-sm text-muted">
          Ta collection est enregistrée dans ce navigateur. Exporte-la de temps en temps pour ne rien perdre, ou pour la
          transférer sur un autre appareil.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-primary" onClick={() => exportCollection(user.pseudo, collection)}>
            Exporter (JSON)
          </button>
          <button className="btn btn-ghost" onClick={() => fileInput.current.click()}>
            Importer
          </button>
        </div>
        <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />

        {importError && <p className="text-sm text-[#ff8a80]">{importError}</p>}

        {pending && (
          <div className="rounded-lg border border-[#ef6c00]/50 bg-[#ef6c00]/10 p-3 text-sm">
            <p>
              Sauvegarde du {new Date(pending.dateExport).toLocaleDateString('fr-FR')} : {pending.consoles.length} consoles et{' '}
              {pending.jeux.length} jeux. Elle va <strong>remplacer</strong> ta collection actuelle ({collection.consoles.length}{' '}
              consoles, {collection.jeux.length} jeux).
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="btn btn-ghost" onClick={() => setPending(null)}>
                Annuler
              </button>
              <button className="btn btn-danger" onClick={confirmImport}>
                Remplacer
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted">Connecté en tant que {user?.pseudo}</p>
    </section>
  )
}
