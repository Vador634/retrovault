/*
  Hash des mots de passe avec PBKDF2 (Web Crypto, intégré au navigateur).
  Ça n'a pas la prétention d'une vraie authentification serveur : tout reste
  sur l'appareil. Mais au moins le mot de passe n'est jamais stocké en clair.
*/

const ITERATIONS = 100_000

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map((byte) => parseInt(byte, 16)))
}

function ensureCrypto() {
  // crypto.subtle n'existe que sur https ou localhost
  if (!window.crypto?.subtle) {
    throw new Error("Le navigateur bloque le chiffrement ici. Ouvre l'appli via http://localhost ou en https.")
  }
}

async function derive(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  )
  return toHex(bits)
}

export async function hashPassword(password) {
  ensureCrypto()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { salt: toHex(salt), hash: await derive(password, salt) }
}

export async function checkPassword(password, { salt, hash }) {
  ensureCrypto()
  return (await derive(password, fromHex(salt))) === hash
}
