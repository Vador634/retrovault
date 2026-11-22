import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './store/auth'
import { useSettings } from './store/settings'
import Layout from './components/Layout'
import Login from './pages/Login'
import Consoles from './pages/Consoles'
import ConsoleGames from './pages/ConsoleGames'
import Wishlist from './pages/Wishlist'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

// Recharts est lourd : la page Stats n'est chargée que si on l'ouvre
const Stats = lazy(() => import('./pages/Stats'))

function RequireAuth({ children }) {
  const isLogged = useAuth((s) => Boolean(s.current))
  const location = useLocation()
  if (!isLogged) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  const theme = useSettings((s) => s.theme)
  const crt = useSettings((s) => s.crt)

  return (
    <>
      <Routes>
        <Route path="/connexion" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Consoles />} />
          <Route path="console/:entryId" element={<ConsoleGames />} />
          <Route
            path="statistiques"
            element={
              <Suspense fallback={<div className="skeleton h-64" />}>
                <Stats />
              </Suspense>
            }
          />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="reglages" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {crt && theme === 'sombre' && <div className="crt-overlay" aria-hidden="true" />}
    </>
  )
}
