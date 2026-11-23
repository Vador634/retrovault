import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const THEMES = {
  gamecube: { label: 'GameCube', barre: '#15122d' },
  xbox: { label: 'Xbox', barre: '#0a0c0a' },
  ps1: { label: 'PlayStation', barre: '#d5d3ce' },
}

// Le thème est posé directement sur <html> (data-theme), avant le rendu,
// pour que les graphiques lisent tout de suite les bonnes couleurs.
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEMES[theme].barre)
}

export const useSettings = create(
  persist(
    (set) => ({
      theme: 'gamecube',
      noteScale: 10, // 5 ou 10
      triConsoles: 'perso', // ordre de la page Mes consoles

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      setNoteScale: (noteScale) => set({ noteScale }),
      setTriConsoles: (triConsoles) => set({ triConsoles }),
    }),
    {
      name: 'retrovault-reglages',
      version: 2,
      // v1 avait "sombre" / "clair" et l'effet CRT
      migrate: (old) => ({
        noteScale: old.noteScale ?? 10,
        theme: old.theme === 'clair' ? 'ps1' : 'gamecube',
      }),
    },
  ),
)
