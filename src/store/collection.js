import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuth } from './auth'

/*
  Couche "données" de l'appli, un peu comme les DAO de mon projet PHP
  (gestion-de-collection_Projet-1), mais stockée dans le localStorage.

  Une collection par compte, rangée sous le pseudo :
    byUser = { kilian: { consoles: [...], jeux: [...] } }

  - consoles : les exemplaires possédés (on peut avoir une PS2 Fat ET une Slim)
  - jeux     : rattachés à la console du catalogue (consoleId: 'ps2') et pas
               à un exemplaire précis. statut 'possede' ou 'recherche' (wishlist)
*/

const VIDE = { consoles: [], jeux: [] }

const nouvelId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const aujourdhui = () => new Date().toISOString()

export const useCollection = create(persist(() => ({ byUser: {} }), { name: 'retrovault-collection' }))

/** Hook : la collection du compte connecté, se met à jour toute seule. */
export function useMyCollection() {
  const pseudo = useAuth((s) => s.current)
  return useCollection((s) => s.byUser[pseudo] ?? VIDE)
}

function modifier(change) {
  const pseudo = useAuth.getState().current
  if (!pseudo) return
  useCollection.setState((s) => ({
    byUser: { ...s.byUser, [pseudo]: change(s.byUser[pseudo] ?? VIDE) },
  }))
}

// ================================
// Consoles
// ================================

export function ajouterConsole(data) {
  const console = { ...data, id: nouvelId(), dateAjout: aujourdhui() }
  modifier((col) => ({ ...col, consoles: [...col.consoles, console] }))
  return console
}

export function modifierConsole(id, data) {
  modifier((col) => ({
    ...col,
    consoles: col.consoles.map((c) => (c.id === id ? { ...c, ...data } : c)),
  }))
}

/**
 * Si on retire le dernier exemplaire d'une console, ses jeux n'auraient
 * plus de page où s'afficher : on les retire avec.
 */
export function supprimerConsole(id) {
  modifier((col) => {
    const cible = col.consoles.find((c) => c.id === id)
    const consoles = col.consoles.filter((c) => c.id !== id)
    const encorePossedee = consoles.some((c) => c.consoleId === cible?.consoleId)
    return {
      consoles,
      jeux: encorePossedee ? col.jeux : col.jeux.filter((j) => j.consoleId !== cible?.consoleId),
    }
  })
}

// ================================
// Jeux
// ================================

export function ajouterJeu(data) {
  const jeu = { ...data, id: nouvelId(), dateAjout: aujourdhui() }
  modifier((col) => ({ ...col, jeux: [...col.jeux, jeu] }))
  return jeu
}

export function modifierJeu(id, data) {
  modifier((col) => ({
    ...col,
    jeux: col.jeux.map((j) => (j.id === id ? { ...j, ...data } : j)),
  }))
}

export function retirerJeu(id) {
  modifier((col) => ({ ...col, jeux: col.jeux.filter((j) => j.id !== id) }))
}

/** Nombre de jeux possédés par console : { ps2: 12, n64: 3 } */
export function countJeuxParConsole(jeux) {
  const total = {}
  for (const jeu of jeux) {
    if (jeu.statut === 'possede') total[jeu.consoleId] = (total[jeu.consoleId] ?? 0) + 1
  }
  return total
}

// ================================
// Sauvegarde (export / import JSON)
// ================================

export function remplacerCollection({ consoles, jeux }) {
  modifier(() => ({ consoles, jeux }))
}
