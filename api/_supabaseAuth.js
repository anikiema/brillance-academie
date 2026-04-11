import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// ─── Hash ────────────────────────────────────────────────────────────────────
export function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex')
}

// ─── Supabase client ─────────────────────────────────────────────────────────
export function createSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('SUPABASE_URL ou SUPABASE_ANON_KEY non configuré')
  return createClient(url, key)
}

// ─── Salt ────────────────────────────────────────────────────────────────────
export function getAuthSalt() {
  const salt = process.env.AUTH_SALT
  if (!salt) throw new Error('AUTH_SALT non configuré')
  return salt
}

// ─── CORS ────────────────────────────────────────────────────────────────────
// Env var ALLOWED_ORIGIN : origines autorisées, séparées par des virgules.
// Exemple : https://brillianceacademie.com,https://preview.vercel.app
//
// Retourne false si la requête est une pré-requête OPTIONS (le handler doit
// s'arrêter immédiatement). Retourne true si le handler peut continuer.
export function handleCors(req, res) {
  const allowedRaw = process.env.ALLOWED_ORIGIN || 'https://brillianceacademie.com'
  const allowed = allowedRaw.split(',').map(o => o.trim()).filter(Boolean)
  const origin = req.headers.origin

  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    const blocked = origin && !allowed.includes(origin)
    res.status(blocked ? 403 : 200).end()
    return false
  }
  return true
}
