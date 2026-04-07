import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')

// ─── WhatsApp notification (via /api/notify — serverless Vercel) ──────────────
// fire-and-forget : n'attend pas la réponse, ne bloque pas l'UI
function notifWA(message) {
  fetch('/api/notify', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ message: '🎓 Brillance Académie\n' + message }),
  }).catch(() => {})  // silencieux en cas d'erreur réseau
}

// ─── Tuteurs (public) ─────────────────────────────────────────────────────────
export async function getTuteurs() {
  const { data, error } = await supabase
    .from('tuteurs')
    .select('*')
    .eq('statut', 'Actif')
    .order('sessions', { ascending: false })
  if (error) throw error
  return data.map(t => ({
    ...t,
    availableDays:     t.available_days     || [],
    niveaux:           t.niveaux            || [],
    quartiersCouVerts: t.quartiers_couverts || [],
  }))
}

// ─── Parents ──────────────────────────────────────────────────────────────────
export async function getParents() {
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function ajouterParent(parent) {
  const { data, error } = await supabase
    .from('parents')
    .insert(parent)
    .select()
    .single()
  if (error) throw error
  notifWA(
    `👨‍👩‍👧 Nouveau parent inscrit\n` +
    `Nom : ${data.nom || '—'}\n` +
    `Email : ${data.email || '—'}\n` +
    `Enfant : ${data.enfant || '—'} · ${data.niveau || '—'}`
  )
  return data
}

export async function modifierParent(id, changes) {
  const { error } = await supabase
    .from('parents')
    .update(changes)
    .eq('id', id)
  if (error) throw error
  notifWA(
    `✏️ Parent modifié (id ${id})\n` +
    Object.entries(changes).map(([k,v]) => `${k} : ${v}`).join('\n')
  )
}

export async function supprimerParent(id) {
  const { error } = await supabase
    .from('parents')
    .delete()
    .eq('id', id)
  if (error) throw error
  notifWA(`🗑 Parent supprimé (id ${id})`)
}

export async function getParentByEmail(email) {
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getReservationCountByEmail(email) {
  const { count, error } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('parent_email', email.toLowerCase().trim())
  if (error) return 0
  return count || 0
}

// ─── Réservations ─────────────────────────────────────────────────────────────
export async function getReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function creerReservation({ tuteurId, parentNom, parentEmail, enfant, niveau, jour, creneau, montant }) {
  const ref = 'BA-' + Date.now()
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      tuteur_id:           tuteurId,
      parent_nom:          parentNom,
      parent_email:        parentEmail,
      enfant,
      niveau,
      jour,
      creneau,
      montant,
      statut:              'en_attente',
      paiement_reference:  ref,
    })
    .select()
    .single()
  if (error) throw error
  notifWA(
    `📅 Nouvelle réservation !\n` +
    `Parent : ${parentNom} (${parentEmail})\n` +
    `Enfant : ${enfant} · ${niveau}\n` +
    `Créneau : ${jour} à ${creneau}\n` +
    `Montant : ${montant ? montant.toLocaleString('fr-FR') + ' FCFA' : '—'}\n` +
    `Réf : ${ref}`
  )
  return { reservation: data, ref }
}

export async function confirmerReservation(ref) {
  const { error } = await supabase
    .from('reservations')
    .update({ statut: 'confirmée' })
    .eq('paiement_reference', ref)
  if (error) throw error
  notifWA(`✅ Réservation confirmée — Réf : ${ref}`)
}

export async function changerStatutReservation(id, statut) {
  const { error } = await supabase
    .from('reservations')
    .update({ statut })
    .eq('id', id)
  if (error) throw error
  const emojis = { confirmée:'✅', annulée:'❌', en_attente:'⏳' }
  notifWA(`${emojis[statut]||'🔄'} Réservation #${id} → ${statut}`)
}

// ─── Avis ─────────────────────────────────────────────────────────────────────
export async function getAvis() {
  const { data, error } = await supabase
    .from('avis')
    .select('*')
    .eq('statut', 'approuvé')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getTousAvis() {
  const { data, error } = await supabase
    .from('avis')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function ajouterAvis({ auteur, ville, commentaire, note, type }) {
  const { error } = await supabase
    .from('avis')
    .insert({ auteur, ville, commentaire, note, type, statut: 'en_attente' })
  if (error) throw error
  notifWA(
    `⭐ Nouvel avis (${type}) à modérer\n` +
    `De : ${auteur} — ${ville}\n` +
    `Note : ${'★'.repeat(note)}\n` +
    `« ${commentaire.slice(0, 100)}${commentaire.length > 100 ? '…' : ''} »`
  )
}

export async function changerStatutAvis(id, statut) {
  const { error } = await supabase
    .from('avis')
    .update({ statut })
    .eq('id', id)
  if (error) throw error
  notifWA(`${statut === 'approuvé' ? '✅' : '🗑'} Avis #${id} → ${statut}`)
}

export async function supprimerAvis(id) {
  const { error } = await supabase
    .from('avis')
    .delete()
    .eq('id', id)
  if (error) throw error
  notifWA(`🗑 Avis #${id} supprimé`)
}

// ─── Tuteurs (admin) ───────────────────────────────────────────────────────────
export async function getTousTuteurs() {
  const { data, error } = await supabase
    .from('tuteurs')
    .select('*')
    .order('sessions', { ascending: false })
  if (error) throw error
  return data.map(t => ({
    ...t,
    availableDays:     t.available_days      || [],
    niveaux:           t.niveaux             || [],
    quartiersCouVerts: t.quartiers_couverts  || [],
  }))
}

export async function ajouterTuteur(tuteur) {
  const { data, error } = await supabase
    .from('tuteurs')
    .insert({
      prenom:             tuteur.prenom || tuteur.name || "",
      nom:                tuteur.nom   || "",
      email:              tuteur.email || "",
      tel:                tuteur.tel   || "",
      subject:            tuteur.subject,
      price:              tuteur.price || 27500,
      statut:             tuteur.statut || "En attente",
      sessions:           0,
      rating:             5,
      emoji:              tuteur.emoji || "👩‍🏫",
      bio:                tuteur.bio   || "",
      quartier:           tuteur.quartier || "",
      niveaux:            tuteur.niveaux  || [],
      available_days:     tuteur.availableDays || [],
      quartiers_couverts: tuteur.quartiersCouVerts || [],
    })
    .select()
    .single()
  if (error) throw error
  notifWA(
    `📖 Nouveau tuteur inscrit\n` +
    `Nom : ${data.prenom || ''} ${data.nom || ''}\n` +
    `Matière(s) : ${data.subject || '—'}\n` +
    `Email : ${data.email || '—'}\n` +
    `Tél : ${data.tel || '—'}\n` +
    `Statut : ${data.statut}`
  )
  return {
    ...data,
    availableDays:     data.available_days     || [],
    niveaux:           data.niveaux            || [],
    quartiersCouVerts: data.quartiers_couverts || [],
  }
}

export async function modifierTuteur(id, changes) {
  const update = {
    prenom:  changes.prenom || changes.name || "",
    subject: changes.subject,
    price:   changes.price,
    statut:  changes.statut,
  };
  if (changes.email         !== undefined) update.email             = changes.email;
  if (changes.tel           !== undefined) update.tel               = changes.tel;
  if (changes.bio           !== undefined) update.bio               = changes.bio;
  if (changes.niveaux       !== undefined) update.niveaux           = changes.niveaux;
  if (changes.availableDays !== undefined) update.available_days    = changes.availableDays;
  if (changes.quartiersCouVerts !== undefined)
    update.quartiers_couverts = changes.quartiersCouVerts;
  const { error } = await supabase
    .from('tuteurs')
    .update(update)
    .eq('id', id)
  if (error) throw error
  // Notification uniquement pour les changements importants (statut, suppression, etc.)
  if (changes.statut) {
    const emojis = { Actif:'✅', Inactif:'⏸', 'En attente':'⏳' }
    notifWA(
      `${emojis[changes.statut]||'✏️'} Tuteur #${id} → statut : ${changes.statut}\n` +
      `Nom : ${changes.prenom || changes.name || '—'}`
    )
  }
}

export async function supprimerTuteur(id) {
  const { error } = await supabase
    .from('tuteurs')
    .delete()
    .eq('id', id)
  if (error) throw error
  notifWA(`🗑 Tuteur #${id} supprimé de la base`)
}

// ─── Écoles partenaires ───────────────────────────────────────────────────────
export async function getEcoles() {
  const { data, error } = await supabase
    .from('ecoles_partenaires')
    .select('*')
    .order('nom', { ascending: true })
  if (error) throw error
  return data
}

export async function ajouterEcole({ nom, quartier, type }) {
  const { data, error } = await supabase
    .from('ecoles_partenaires')
    .insert({ nom, quartier: quartier || '', type: type || 'École' })
    .select()
    .single()
  if (error) throw error
  notifWA(`🏫 Nouvelle école partenaire : ${nom} · ${quartier}`)
  return data
}

export async function modifierEcole(id, changes) {
  const { error } = await supabase
    .from('ecoles_partenaires')
    .update(changes)
    .eq('id', id)
  if (error) throw error
}

export async function supprimerEcole(id) {
  const { error } = await supabase
    .from('ecoles_partenaires')
    .delete()
    .eq('id', id)
  if (error) throw error
}
