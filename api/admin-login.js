// api/admin-login.js — Vérification du mot de passe admin côté serveur uniquement.
// Le mot de passe n'est JAMAIS exposé dans le bundle frontend.
// Env var requise : ADMIN_PASSWORD (à définir dans Vercel → Settings → Env Vars)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  const { password } = req.body || {}
  if (!password) return res.status(400).json({ error: 'Mot de passe manquant' })

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return res.status(500).json({ error: 'ADMIN_PASSWORD non configuré' })

  if (password !== adminPassword) {
    // Délai anti-brute-force
    await new Promise(r => setTimeout(r, 800))
    return res.status(401).json({ error: 'Mot de passe incorrect' })
  }

  return res.status(200).json({ ok: true })
}
