import catalog from '../data/consoles.json'

export { catalog }

const byId = Object.fromEntries(catalog.map((c) => [c.id, c]))

export function getConsole(id) {
  return byId[id] ?? null
}

export const FABRICANTS = [...new Set(catalog.map((c) => c.fabricant))]
