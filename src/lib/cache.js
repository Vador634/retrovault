// Petit cache dans le localStorage avec une date d'expiration.
// Sert surtout à ne pas redemander à RAWG des infos qui ne bougent pas
// (liste des plateformes, genres, fiche détaillée d'un jeu).

const PREFIX = 'rv-cache:'

export const DAY = 24 * 60 * 60 * 1000

export function readCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const { expires, value } = JSON.parse(raw)
    if (Date.now() > expires) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return value
  } catch {
    return null
  }
}

export function writeCache(key, value, ttl) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ expires: Date.now() + ttl, value }))
  } catch {
    // localStorage plein : tant pis, on refera la requête la prochaine fois
  }
}
