import { readCache, writeCache, DAY } from './cache'

const API_URL = 'https://api.rawg.io/api'
const API_KEY = import.meta.env.VITE_RAWG_KEY

export const hasApiKey = Boolean(API_KEY)

// Les recherches sont gardées en mémoire le temps de la session,
// ça évite de refaire la même requête quand on revient en arrière.
const searchCache = new Map()

async function request(path, params = {}, signal) {
  if (!API_KEY) {
    throw new Error("Clé RAWG manquante : ajoute VITE_RAWG_KEY dans le fichier .env puis relance l'appli.")
  }

  const url = new URL(API_URL + path)
  url.searchParams.set('key', API_KEY)
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(name, value)
  }

  let res
  try {
    res = await fetch(url, { signal })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error('Impossible de joindre RAWG. Vérifie ta connexion internet.')
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error('La clé RAWG est refusée. Vérifie la valeur de VITE_RAWG_KEY dans le .env.')
  }
  if (res.status === 404) throw new Error("Ce jeu n'existe pas (ou plus) sur RAWG.")
  if (res.status === 429) throw new Error('Trop de requêtes envoyées à RAWG, attends quelques secondes.')
  if (!res.ok) throw new Error(`RAWG a renvoyé une erreur (${res.status}). Réessaie dans un instant.`)

  return res.json()
}

export async function getGenres() {
  const cached = readCache('genres')
  if (cached) return cached
  const data = await request('/genres', { page_size: 40 })
  const genres = data.results
    .map((g) => ({ slug: g.slug, nom: g.name }))
    .sort((a, b) => a.nom.localeCompare(b.nom))
  writeCache('genres', genres, 30 * DAY)
  return genres
}

// On ne garde que ce dont l'appli a besoin, avec des noms en français.
function toGame(raw) {
  return {
    rawgId: raw.id,
    titre: raw.name,
    image: raw.background_image ?? null,
    sortie: raw.released ?? null,
    genres: (raw.genres ?? []).map((g) => g.name),
    noteRawg: raw.rating || null,
  }
}

/**
 * Liste les jeux d'une console. Sans texte de recherche on affiche
 * les plus populaires, ce qui permet aussi de "découvrir" le catalogue.
 */
export async function searchGames({ console, query = '', genre = '', year = '', page = 1 }, signal) {
  const params = {
    // l'ID de plateforme RAWG est noté dans consoles.json
    platforms: console.rawgId,
    page,
    page_size: 20,
    genres: genre,
    dates: year ? `${year}-01-01,${year}-12-31` : '',
  }

  const trimmed = query.trim()
  if (trimmed) {
    params.search = trimmed
    params.search_precise = 'true'
  } else {
    params.ordering = '-added'
  }

  const cacheKey = JSON.stringify(params)
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey)

  const data = await request('/games', params, signal)
  const result = {
    games: data.results.map(toGame),
    total: data.count,
    hasMore: Boolean(data.next),
  }
  searchCache.set(cacheKey, result)
  return result
}

export async function getGameDetails(rawgId) {
  const cached = readCache(`game:${rawgId}`)
  if (cached) return cached

  const raw = await request(`/games/${rawgId}`)
  const details = {
    ...toGame(raw),
    resume: raw.description_raw?.trim() || '',
    developpeurs: (raw.developers ?? []).map((d) => d.name),
    editeurs: (raw.publishers ?? []).map((p) => p.name),
    plateformes: (raw.platforms ?? []).map((p) => p.platform.name),
    metacritic: raw.metacritic ?? null,
    imageAlt: raw.background_image_additional ?? null,
  }
  writeCache(`game:${rawgId}`, details, 7 * DAY)
  return details
}

/**
 * RAWG sait redimensionner ses images à la volée, on en profite pour
 * ne pas charger des visuels de 2 Mo dans une grille de vignettes.
 */
export function thumbnail(url, width = 420) {
  if (!url || !url.includes('media.rawg.io/media/')) return url
  if (url.includes('/media/resize/') || url.includes('/media/crop/')) return url
  return url.replace('/media/', `/media/resize/${width}/-/`)
}
