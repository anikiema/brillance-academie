import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// ─── Changement de mot de passe côté serveur ──────────────────────────────────
// Env vars requises :
//   AUTH_SALT          — même sel que api/login.js
//   SUPABASE_URL
//   SUPABASE_ANON_KEY

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { role, id, currentPassword, newPassword } = req.body || {}
  if (!role || !id || !newPassword)
    return res.status(400).json({ error: 'Champs manquants (role, id, newPassword)' })
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

  // Vérifie le mot de passe actuel si fourni
  if (currentPassword) {
    const currentHash = hashPassword(currentPassword, salt)
    const { data: user } = await supabase
      .from(table)
      .select('password_hash')
      .eq('id', id)
      .maybeSingle()
    if (!user || user.password_hash !== currentHash)
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' })
  }

  const newHash = hashPassword(newPassword, salt)
  const { error } = await supabase
    .from(table)
    .update({ password_hash: newHash })
    .eq('id', id)

  if (error) {
    console.error('[change-password] Supabase error:', error)
    return res.status(500).json({ error: 'Erreur base de données' })
  }

  return res.status(200).json({ ok: true })
}
