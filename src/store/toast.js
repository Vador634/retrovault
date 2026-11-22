import { create } from 'zustand'

// Petites notifications en bas de l'écran ("Jeu ajouté !")
export const useToasts = create(() => ({ list: [] }))

let counter = 0

export function toast(message, type = 'ok') {
  const id = ++counter
  useToasts.setState((s) => ({ list: [...s.list, { id, message, type }] }))
  setTimeout(() => {
    useToasts.setState((s) => ({ list: s.list.filter((t) => t.id !== id) }))
  }, 2800)
}
