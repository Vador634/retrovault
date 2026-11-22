import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth, useCurrentUser } from '../store/auth'
import { useToasts } from '../store/toast'
import QuickSearch from './QuickSearch'
import Icon from './Icon'

const links = [
  { to: '/', label: 'Mes consoles', icon: 'consoles', end: true },
  { to: '/statistiques', label: 'Stats', icon: 'stats' },
  { to: '/wishlist', label: 'Wishlist', icon: 'star' },
  { to: '/reglages', label: 'Réglages', icon: 'settings' },
]

function Logo() {
  return (
    <NavLink to="/" className="shrink-0 font-pixel text-[0.7rem] leading-none text-ink-strong sm:text-sm">
      Retro<span className="text-accent">Vault</span>
    </NavLink>
  )
}

function Toasts() {
  const list = useToasts((s) => s.list)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${
              t.type === 'erreur' ? 'bg-[#a3262a] text-white' : 'bg-accent text-[#0e1620]'
            }`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function Layout() {
  const user = useCurrentUser()
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/connexion')
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                    isActive ? 'text-accent' : 'text-ink hover:text-ink-strong'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <span className="ml-auto text-xs text-muted md:hidden">
            Salut <strong className="text-ink">{user?.pseudo}</strong>
          </span>

          {/* Sur mobile la recherche passe sur sa propre ligne, bien visible */}
          <div className="order-last w-full md:order-none md:ml-auto md:w-72">
            <QuickSearch />
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost hidden !min-h-0 !py-2 text-sm md:inline-flex"
            title={`Déconnexion (${user?.pseudo})`}
          >
            <Icon name="logout" size={18} />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 md:pb-10">
        <Outlet />
      </main>

      <footer className="mx-auto mb-24 w-full max-w-6xl px-4 py-6 text-center text-xs text-muted md:mb-0">
        Données des jeux fournies par{' '}
        <a href="https://rawg.io" target="_blank" rel="noreferrer" className="text-accent hover:underline">
          RAWG.io
        </a>
        . Collection enregistrée sur cet appareil.
      </footer>

      {/* Barre de navigation du bas, sur téléphone */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-semibold ${
                  isActive ? 'text-accent' : 'text-muted'
                }`
              }
            >
              <Icon name={link.icon} size={22} />
              {link.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-semibold text-muted">
            <Icon name="logout" size={22} />
            Quitter
          </button>
        </div>
      </nav>

      <Toasts />
    </div>
  )
}
