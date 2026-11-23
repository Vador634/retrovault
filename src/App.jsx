import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './store/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Consoles from './pages/Consoles'
import Wishlist from './pages/Wishlist'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

// Pages chargées seulement quand on les ouvre (Recharts pour les stats,
// la recherche RAWG et les pop-ups pour la page d'une console)
const Stats = lazy(() => import('./pages/Stats'))
const ConsoleGames = lazy(() => import('./pages/ConsoleGames'))

const chargement = <div className="skeleton h-64" />

function RequireAuth({ children }) {
  const isLogged = useAuth((s) => Boolean(s.current))
  const location = useLocation()
  if (!isLogged) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  return (
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
        <Route
          path="console/:entryId"
          element={
            <Suspense fallback={chargement}>
              <ConsoleGames />
            </Suspense>
          }
        />
        <Route
          path="statistiques"
          element={
            <Suspense fallback={chargement}>
              <Stats />
            </Suspense>
          }
        />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="reglages" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
