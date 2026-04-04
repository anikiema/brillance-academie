// Vercel Serverless Function — reçoit les notifications de paiement CinetPay
// CinetPay appelle cette URL automatiquement après chaque paiement

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const {
    cpm_trans_id,
    cpm_result,
    cpm_trans_status,
    cpm_amount,
    cpm_site_id,
  } = req.body

  // Vérifier que c'est bien notre site
  if (String(cpm_site_id) !== String(process.env.VITE_CINETPAY_SITE_ID)) {
    return res.status(403).json({ error: 'Site ID invalide' })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY  // clé service (accès complet)
  )

  if (cpm_result === '00' && cpm_trans_status === 'ACCEPTED') {
    // Paiement accepté → mettre à jour la réservation
    await supabase
      .from('reservations')
      .update({ statut: 'confirmée' })
      .eq('paiement_reference', cpm_trans_id)

    // Enregistrer le paiement
    const { data: reservation } = await supabase
      .from('reservations')
      .select('id')
      .eq('paiement_reference', cpm_trans_id)
      .single()

    if (reservation) {
      await supabase.from('paiements').insert({
        reservation_id: reservation.id,
        montant:        Number(cpm_amount),
        statut:         'accepté',
        reference:      cpm_trans_id,
      })
    }

    console.log(`✅ Paiement confirmé : ${cpm_trans_id} — ${cpm_amount} XOF`)
  } else {
    // Paiement échoué ou annulé
    await supabase
      .from('reservations')
      .update({ statut: 'annulée' })
      .eq('paiement_reference', cpm_trans_id)

    console.log(`❌ Paiement échoué : ${cpm_trans_id} — statut: ${cpm_trans_status}`)
  }

  // CinetPay attend toujours un 200
  return res.status(200).json({ message: 'OK' })
}
