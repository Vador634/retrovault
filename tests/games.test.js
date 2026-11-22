// Tests de la logique "métier" (pas d'interface) : npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isComplete, matches, normalize, displayNote, releaseYear, CONTENU_PAR_FORMAT } from '../src/lib/games.js'

test('un jeu est complet seulement avec boîte + notice + jeu', () => {
  assert.equal(isComplete({ contenu: { boite: true, notice: true, jeu: true } }), true)
  assert.equal(isComplete({ contenu: { boite: true, notice: false, jeu: true } }), false)
  assert.equal(isComplete({ contenu: CONTENU_PAR_FORMAT.loose }), false)
  assert.equal(isComplete({}), false)
})

test('le format pré-remplit le contenu', () => {
  assert.equal(isComplete({ contenu: CONTENU_PAR_FORMAT.cib }), true)
  assert.equal(isComplete({ contenu: CONTENU_PAR_FORMAT.blister }), true)
  assert.deepEqual(CONTENU_PAR_FORMAT.loose, { boite: false, notice: false, jeu: true })
})

test('la recherche ignore accents, majuscules et ponctuation', () => {
  assert.equal(normalize('Pokémon : Version Rouge !'), 'pokemon version rouge')
  assert.equal(matches('Pokémon Rouge', 'pokemon'), true)
  assert.equal(matches('Grand Theft Auto: San Andreas', 'gta'), false)
  assert.equal(matches('Grand Theft Auto: San Andreas', 'san andr'), true)
  assert.equal(matches('Ōkami', 'okami'), true)
})

test('une recherche vide ne trouve rien', () => {
  assert.equal(matches('Zelda', ''), false)
  assert.equal(matches('Zelda', '   '), false)
})

test('les notes sont stockées sur 10 et affichées sur 5 ou 10', () => {
  assert.equal(displayNote(8, 10), '8/10')
  assert.equal(displayNote(8, 5), '4/5')
  assert.equal(displayNote(7, 5), '3.5/5')
  assert.equal(displayNote(null, 10), null)
})

test("l'année est extraite de la date de sortie", () => {
  assert.equal(releaseYear('2004-10-26'), 2004)
  assert.equal(releaseYear(null), null)
})
