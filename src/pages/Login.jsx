import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../store/auth'

// Lignes affichées une par une, comme un vieux BIOS au démarrage
const bootLines = ['RETROVAULT BIOS v1.0', 'Vérification de la mémoire…  OK', 'Lecture des cartouches…  OK']

export default function Login() {
  const isLogged = useAuth((s) => Boolean(s.current))
  const register = useAuth((s) => s.register)
  const login = useAuth((s) => s.login)
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
      <div className="mb-6 w-full max-w-sm font-mono text-xs text-[#66bb6a]/80">
        {bootLines.map((line, i) => (
          <motion.p key={line} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.35 }}>
            {line}
          </motion.p>
        ))}
      </div>

      <motion.h1
        className="text-center font-pixel text-2xl leading-snug text-ink-strong sm:text-3xl"
        style={{ textShadow: '0 0 18px var(--glow), 3px 3px 0 #1a44c2' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, type: 'spring' }}
      >
        Retro<span className="text-accent">Vault</span>
      </motion.h1>
      <motion.p
        className="blink mt-4 font-pixel text-[0.6rem] text-accent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        PRESS START
      </motion.p>

      <motion.form
        onSubmit={handleSubmit}
        className="panel mt-8 w-full max-w-sm space-y-4 p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
      >
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-bg/60 p-1" role="tablist">
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
          <p className="rounded-md bg-[#c62828]/15 px-3 py-2 text-sm text-[#ff8a80]" role="alert">
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
    </div>
  )
}
