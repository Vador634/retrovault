import { useState } from 'react'

// Les photos absentes sont retenues ici pour ne pas retenter à chaque rendu
const missingPhotos = new Set()

function Silhouette({ forme }) {
  const body = 'rgba(255,255,255,0.88)'
  const detail = 'rgba(0,0,0,0.35)'

  if (forme === 'portable') {
    return (
      <g>
        <rect x="70" y="14" width="60" height="92" rx="8" fill={body} />
        <rect x="78" y="22" width="44" height="34" rx="3" fill={detail} />
        <rect x="84" y="70" width="14" height="4" fill={detail} />
        <rect x="89" y="65" width="4" height="14" fill={detail} />
        <circle cx="112" cy="68" r="4" fill={detail} />
        <circle cx="120" cy="76" r="4" fill={detail} />
        <rect x="94" y="92" width="12" height="3" rx="1.5" fill={detail} />
      </g>
    )
  }

  if (forme === 'hybride') {
    return (
      <g>
        <rect x="40" y="34" width="22" height="52" rx="10" fill={body} />
        <rect x="138" y="34" width="22" height="52" rx="10" fill={body} />
        <rect x="64" y="34" width="72" height="52" rx="4" fill={body} />
        <rect x="69" y="39" width="62" height="42" rx="2" fill={detail} />
        <circle cx="51" cy="50" r="4" fill={detail} />
        <circle cx="149" cy="70" r="4" fill={detail} />
      </g>
    )
  }

  // console de salon + manette
  return (
    <g>
      <rect x="40" y="30" width="120" height="44" rx="6" fill={body} />
      <rect x="54" y="42" width="60" height="6" rx="3" fill={detail} />
      <circle cx="134" cy="45" r="5" fill={detail} />
      <rect x="128" y="58" width="20" height="5" rx="2" fill={detail} />
      <path d="M78 84h44a12 12 0 0 1 0 24c-6 0-9-5-12-5H90c-3 0-6 5-12 5a12 12 0 0 1 0-24Z" fill={body} />
      <rect x="76" y="94" width="10" height="3" fill={detail} />
      <rect x="79.5" y="90.5" width="3" height="10" fill={detail} />
      <circle cx="118" cy="93" r="2.5" fill={detail} />
      <circle cx="124" cy="98" r="2.5" fill={detail} />
    </g>
  )
}

/**
 * Visuel d'une console : la photo perso (public/consoles/<id>.jpg) si elle
 * existe, sinon une petite illustration générée à partir de sa couleur.
 */
export default function ConsoleArt({ console, className = '' }) {
  const photo = `/consoles/${console.id}.jpg`
  const [hasPhoto, setHasPhoto] = useState(!missingPhotos.has(console.id))

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(145deg, ${console.couleur} 0%, #0e141b 130%)` }}
    >
      <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden="true">
        <Silhouette forme={console.forme} />
      </svg>
      <span className="absolute left-2 top-2 font-pixel text-[0.45rem] uppercase tracking-wider text-white/70">
        {console.fabricant}
      </span>
      <span className="absolute bottom-1.5 right-2 font-pixel text-[0.6rem] text-white/85 drop-shadow">{console.sigle}</span>

      {hasPhoto && (
        <img
          src={photo}
          alt={console.nom}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => {
            missingPhotos.add(console.id)
            setHasPhoto(false)
          }}
        />
      )}
    </div>
  )
}
