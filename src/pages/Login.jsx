import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../store/auth'
import { useSettings, THEMES } from '../store/settings'
import Logo from '../components/Logo'

export default function Login() {
  const isLogged = useAuth((s) => Boolean(s.current))
  const register = useAuth((s) => s.register)
  const login = useAuth((s) => s.login)
  const { theme, setTheme } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState('connexion')
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isLogged) return <Navigate to={location.state?.from ?? '/'} replace />

  const isSignup = mode === 'inscription'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (isSignup && password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      if (isSignup) await register(pseudo, password)
      else await login(pseudo, password)
      navigate(location.state?.from ?? '/', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  function switchMode(next) {
    setMode(next)
    setError('')
    setConfirm('')
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-10">
      <motion.h1 key={theme} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Logo big />
      </motion.h1>
      <motion.span
        key={'bande-' + theme}
        className="theme-stripe mt-4 block w-48"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        aria-hidden="true"
      />
      <p className="mt-3 text-center text-sm text-muted">Ta collection de consoles et de jeux rétro</p>

      <motion.form
        onSubmit={handleSubmit}
        className="panel mt-8 w-full max-w-sm space-y-4 p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="tab-bar grid grid-cols-2 gap-1 rounded-lg bg-bg/60 p-1" role="tablist">
          {[
            ['connexion', 'Connexion'],
            ['inscription', 'Inscription'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => switchMode(value)}
              className={`rounded-md py-2 text-sm font-semibold transition ${
                mode === value ? 'bg-panel-2 text-ink-strong' : 'text-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Pseudo</span>
          <input
            className="input"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Mot de passe</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
          />
        </label>

        {isSignup && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Confirme le mot de passe</span>
            <input
              className="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
        )}

        {error && (
          <p className="rounded-md bg-[#c62828]/15 px-3 py-2 text-sm text-[var(--danger-ink)]" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Chargement…' : isSignup ? 'Créer mon compte' : 'Se connecter'}
        </button>

        <p className="text-center text-xs text-muted">
          Ton compte et ta collection restent enregistrés sur cet appareil.
        </p>
      </motion.form>

      <div className="mt-6 flex items-center gap-1 text-xs text-muted">
        Thème :
        {Object.entries(THEMES).map(([value, t]) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`rounded-md px-2 py-1 font-semibold transition ${theme === value ? 'text-accent' : 'hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
