// Vercel Serverless Function — appelle CinetPay côté serveur
// (la clé API reste cachée, jamais exposée au navigateur)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const {
    montant, transactionId, nomClient,
    emailClient, telephoneClient, description,
  } = req.body

  if (!montant || !transactionId) {
    return res.status(400).json({ error: 'Paramètres manquants' })
  }

  try {
    const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey:                  process.env.CINETPAY_API_KEY,
        site_id:                 process.env.VITE_CINETPAY_SITE_ID,
        transaction_id:          transactionId,
        amount:                  montant,
        currency:                'XOF',
        description:             description || 'Séance Brillance Académie',
        return_url:              `${process.env.APP_URL}/confirmation`,
        notify_url:              `${process.env.APP_URL}/api/cinetpay-webhook`,
        customer_name:           nomClient   || 'Client',
        customer_email:          emailClient || '',
        customer_phone_number:   telephoneClient || '',
        customer_address:        'Ouagadougou',
        customer_city:           'Ouagadougou',
        customer_country:        'BF',
        customer_state:          'BF',
        customer_zip_code:       '00000',
      }),
    })

    const data = await response.json()

    if (data.code === '201' && data.data?.payment_url) {
      return res.status(200).json({ paymentUrl: data.data.payment_url })
    } else {
      return res.status(400).json({ error: data.message || 'Erreur CinetPay' })
    }
  } catch (err) {
    console.error('CinetPay error:', err)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}
