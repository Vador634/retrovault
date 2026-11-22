import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Le thème est posé directement sur <html> (data-theme), avant le rendu,
// pour que les graphiques lisent tout de suite les bonnes couleurs.
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'clair' ? '#e7edf3' : '#171a21')
}

export const useSettings = create(
  persist(
    (set) => ({
      theme: 'sombre', // 'sombre' | 'clair'
      crt: true,
      noteScale: 10, // 5 ou 10

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      setCrt: (crt) => set({ crt }),
      setNoteScale: (noteScale) => set({ noteScale }),
    }),
    { name: 'retrovault-reglages' },
  ),
)
