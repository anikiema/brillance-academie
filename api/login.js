import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// ─── Auth serveur ─────────────────────────────────────────────────────────────
// Le sel et le hash ne sont JAMAIS exposés côté client.
// Env vars requises :
//   AUTH_SALT          — sel secret (ex: valeur de brillance_salt_2025 + entropie)
//   SUPABASE_URL       — URL Supabase (sans le préfixe VITE_)
//   SUPABASE_ANON_KEY  — clé anonyme Supabase (sans le préfixe VITE_)

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { role, email, password } = req.body || {}
  if (!role || !email || !password)
    return res.status(400).json({ error: 'Champs manquants (role, email, password)' })
  if (role !== 'parent' && role !== 'tuteur')
    return res.status(400).json({ error: 'role doit être "parent" ou "tuteur"' })

  const salt = process.env.AUTH_SALT
  if (!salt) return res.status(500).json({ error: 'AUTH_SALT non configuré' })

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey)
    return res.status(500).json({ error: 'Variables Supabase non configurées' })

  const supabase = createClient(supabaseUrl, supabaseKey)
  const table = role === 'tuteur' ? 'tuteurs' : 'parents'
  const hash = hashPassword(password, salt)

  const { data: user, error } = await supabase
    .from(table)
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('password_hash', hash)
    .maybeSingle()

  if (error) {
    console.error('[login] Supabase error:', error)
    return res.status(500).json({ error: 'Erreur base de données' })
  }
  if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' })

  // Ne jamais renvoyer le hash du mot de passe au client
  const { password_hash, ...safeUser } = user
  return res.status(200).json({ user: safeUser })
}
