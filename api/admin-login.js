// api/admin-login.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  const { password } = req.body || {}
  if (!password) return res.status(400).json({ error: 'Mot de passe manquant' })

  const adminPassword = process.env.ADMIN_PASSWORD || 'Kayden2020@$'

  if (password !== adminPassword) {
    await new Promise(r => setTimeout(r, 600))
    return res.status(401).json({ error: 'Mot de passe incorrect' })
  }

  return res.status(200).json({ ok: true })
}
