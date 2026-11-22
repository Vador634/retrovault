// Tout ce qui sert à décrire / afficher un exemplaire de jeu.

export const REGIONS = ['PAL', 'NTSC-U', 'NTSC-J']

export const FORMATS = {
  cib: { label: 'En boîte (CIB)', court: 'CIB' },
  loose: { label: 'Loose', court: 'Loose' },
  blister: { label: 'Neuf sous blister', court: 'Blister' },
}

export const ETATS = ['Excellent', 'Bon', 'Moyen', 'Abîmé']

// Ce qu'on coche automatiquement quand on choisit un format
export const CONTENU_PAR_FORMAT = {
  cib: { boite: true, notice: true, jeu: true },
  loose: { boite: false, notice: false, jeu: true },
  blister: { boite: true, notice: true, jeu: true },
}

export function isComplete(jeu) {
  const { boite, notice, jeu: support } = jeu.contenu ?? {}
  return Boolean(boite && notice && support)
}

export function releaseYear(date) {
  return date ? Number(date.slice(0, 4)) : null
}

export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '—'
  return Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Les notes sont toujours stockées sur 10, l'affichage s'adapte au réglage. */
export function displayNote(note, scale) {
  if (note === null || note === undefined) return null
  const value = scale === 5 ? note / 2 : note
  return `${Number.isInteger(value) ? value : value.toFixed(1)}/${scale}`
}

// "Pokémon Rouge" -> "pokemon rouge", pour chercher sans se soucier des accents
export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function matches(title, query) {
  const words = normalize(query).split(' ').filter(Boolean)
  if (!words.length) return false
  const target = normalize(title)
  return words.every((word) => target.includes(word))
}
