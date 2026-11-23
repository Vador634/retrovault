import { useState } from 'react'

/**
 * Photo de la console (public/consoles/<id>.webp, photos d'Evan Amos sur Wikimedia Commons).
 * Les photos sont sur fond blanc : avec mix-blend-mode multiply, le blanc prend
 * la couleur du dégradé derrière et la console a l'air posée dessus.
 * Si l'image ne charge pas, on affiche juste le sigle.
 */
export default function ConsoleArt({ console, className = '' }) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{ background: `radial-gradient(circle at 50% 40%, #ffffff 0%, #e4e2ec 55%, ${console.couleur}55 140%)` }}
    >
      {failed ? (
        <span className="font-display text-2xl font-bold text-black/40">{console.sigle}</span>
      ) : (
        <img
          src={`${import.meta.env.BASE_URL}consoles/${console.id}.webp`}
          alt={console.nom}
          draggable={false}
          loading="lazy"
          className="absolute inset-0 m-auto h-[84%] w-[88%] object-contain mix-blend-multiply"
          onError={() => setFailed(true)}
        />
      )}
      <span
        className="absolute bottom-0 left-0 h-1 w-full"
        style={{ background: console.couleur }}
        aria-hidden="true"
      />
    </div>
  )
}
