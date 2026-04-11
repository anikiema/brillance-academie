import { hashPassword, createSupabaseClient, getAuthSalt, handleCors } from './_supabaseAuth.js'

export default async function handler(req, res) {
  if (!handleCors(req, res)) return

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { role, email, password } = req.body || {}
  if (!role || !email || !password)
    return res.status(400).json({ error: 'Champs manquants (role, email, password)' })
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
