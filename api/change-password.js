import { hashPassword, createSupabaseClient, getAuthSalt, handleCors } from './_supabaseAuth.js'

export default async function handler(req, res) {
  if (!handleCors(req, res)) return

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { role, id, currentPassword, newPassword } = req.body || {}
  if (!role || !id || !currentPassword || !newPassword)
    return res.status(400).json({ error: 'Champs manquants (role, id, currentPassword, newPassword)' })
  if (role !== 'parent' && role !== 'tuteur')
    return res.status(400).json({ error: 'role doit être "parent" ou "tuteur"' })

  let salt, supabase
  try {
    salt = getAuthSalt()
    supabase = createSupabaseClient()
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }

  const table = role === 'tuteur' ? 'tuteurs' : 'parents'

  // Vérification du mot de passe actuel (obligatoire)
  const currentHash = hashPassword(currentPassword, salt)
  const { data: user } = await supabase
    .from(table)
    .select('password_hash')
    .eq('id', id)
    .maybeSingle()
  if (!user || user.password_hash !== currentHash)
    return res.status(401).json({ error: 'Mot de passe actuel incorrect' })

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
