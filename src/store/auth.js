import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hashPassword, checkPassword } from '../lib/password'

// Les comptes sont rangés par pseudo en minuscules pour éviter "Kilian" et "kilian".
const keyOf = (pseudo) => pseudo.trim().toLowerCase()

export const useAuth = create(
  persist(
    (set, get) => ({
      users: {},
      current: null,

      async register(pseudo, password) {
        const name = pseudo.trim()
        if (name.length < 3) throw new Error('Le pseudo doit faire au moins 3 caractères.')
        if (!/^[\w.-]+$/.test(name)) throw new Error('Le pseudo ne peut contenir que des lettres, chiffres, . _ et -')
        if (password.length < 6) throw new Error('Le mot de passe doit faire au moins 6 caractères.')
        if (get().users[keyOf(name)]) throw new Error('Ce pseudo est déjà pris.')

        const secret = await hashPassword(password)
        set((state) => ({
          users: { ...state.users, [keyOf(name)]: { pseudo: name, ...secret, dateCreation: new Date().toISOString() } },
          current: keyOf(name),
        }))
      },

      async login(pseudo, password) {
        const user = get().users[keyOf(pseudo)]
        // Même message dans les deux cas, pas besoin de dire si le pseudo existe
        if (!user || !(await checkPassword(password, user))) {
          throw new Error('Pseudo ou mot de passe incorrect.')
        }
        set({ current: keyOf(pseudo) })
      },

      logout() {
        set({ current: null })
      },
    }),
    { name: 'retrovault-auth' },
  ),
)

export function useCurrentUser() {
  return useAuth((state) => (state.current ? state.users[state.current] : null))
}
