import { useSettings } from '../store/settings'

// Un logo par thème. Aucun logo officiel : juste des formes qui rappellent chaque console.

function Cube({ size }) {
  // cube vu en perspective isométrique, 3 faces de violets différents
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2 29 9.5 16 17 3 9.5Z" fill="#c9c0ff" />
      <path d="M3 9.5 16 17v13L3 22.5Z" fill="#7d6ef0" />
      <path d="M29 9.5 16 17v13l13-7.5Z" fill="#4b3fa3" />
      <path d="M16 11.5 21 14.4v5.8L16 17.3Z" fill="#15122d" opacity="0.55" />
    </svg>
  )
}

function Orb({ size }) {
  // sphère verte lumineuse
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 35% 30%, #f0ffc0 0%, #9be31d 30%, #3d8a06 70%, #143300 100%)',
        boxShadow: '0 0 14px rgba(155, 227, 29, 0.55)',
      }}
    />
  )
}

function Symbols({ size }) {
  // rond, triangle, croix, carré
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" strokeWidth="2.6" aria-hidden="true">
      <circle cx="9" cy="9" r="5" stroke="#e0484d" />
      <path d="M23 4l5.5 9.5h-11Z" stroke="#3fae8c" strokeLinejoin="round" />
      <path d="M5 19l8 8M13 19l-8 8" stroke="#4a7fe0" strokeLinecap="round" />
      <rect x="18.5" y="18.5" width="9" height="9" stroke="#d86fb6" />
    </svg>
  )
}

export default function Logo({ big = false }) {
  const theme = useSettings((s) => s.theme)
  const icon = big ? 44 : 24

  if (theme === 'xbox') {
    return (
      <span className={`inline-flex items-center gap-2.5 font-display uppercase tracking-[0.08em] ${big ? 'text-2xl sm:text-3xl' : 'text-sm'}`}>
        <Orb size={big ? 36 : 18} />
        <span className="text-ink-strong">
          Retro<span className="text-accent [text-shadow:0_0_12px_rgba(155,227,29,0.6)]">Vault</span>
        </span>
      </span>
    )
  }

  if (theme === 'ps1') {
    return (
      <span className={`inline-flex items-center gap-2 font-display font-bold uppercase tracking-[0.05em] ${big ? 'text-4xl sm:text-5xl' : 'text-xl'}`}>
        <Symbols size={icon} />
        <span className="text-ink-strong">
          Retro<span className="text-accent">Vault</span>
        </span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold lowercase ${big ? 'text-4xl sm:text-5xl' : 'text-xl'}`}>
      <Cube size={icon} />
      <span className="text-ink-strong">
        retro<span className="text-accent">vault</span>
      </span>
    </span>
  )
}
