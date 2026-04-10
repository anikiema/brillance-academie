import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "brillance_salt_2025")
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('')
}

export async function loginParent(email, password) {
  const hash = await hashPassword(password)
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('password_hash', hash)
    .maybeSingle()
  if (error) throw error
  return data // null si mauvais mot de passe
}

export async function loginTuteur(email, password) {
  const hash = await hashPassword(password)
  const { data, error } = await supabase
    .from('tuteurs')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('password_hash', hash)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function changerMotDePasseParent(id, newPassword) {
  const hash = await hashPassword(newPassword)
  const { error } = await supabase
    .from('parents')
    .update({ password_hash: hash })
    .eq('id', id)
  if (error) throw error
}

export async function changerMotDePasseTuteur(id, newPassword) {
  const hash = await hashPassword(newPassword)
  const { error } = await supabase
    .from('tuteurs')
    .update({ password_hash: hash })
    .eq('id', id)
  if (error) throw error
}

// ─── WhatsApp notification (via /api/notify — serverless Vercel) ──────────────
function notifWA(message) {
  fetch('/api/notify', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ message: '🎓 Brillance Académie\n' + message }),
  }).catch(() => {})
}

// ─── Email (via /api/email — Resend) ─────────────────────────────────────────
// fire-and-forget : ne bloque pas l'UI
export function sendEmail({ to, subject, html }) {
  fetch('/api/email', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ to, subject, html }),
  }).catch(() => {})
}

// ── Templates HTML emails ────────────────────────────────────────────────────
const emailBase = (contenu) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);}
  .header{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 36px;text-align:center;}
  .header h1{color:#fff;font-size:22px;margin:0;font-weight:800;letter-spacing:-0.5px;}
  .header p{color:#c4b5fd;font-size:13px;margin:6px 0 0;}
  .body{padding:32px 36px;}
  .body p{color:#374151;font-size:15px;line-height:1.7;margin:0 0 14px;}
  .highlight{background:#f5f3ff;border-left:4px solid #4f46e5;padding:16px 20px;border-radius:0 10px 10px 0;margin:20px 0;}
  .highlight p{margin:4px 0;font-size:14px;color:#374151;}
  .highlight strong{color:#4f46e5;}
  .btn{display:inline-block;background:#4f46e5;color:#fff;padding:13px 28px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;margin:20px 0;}
  .footer{background:#f9fafb;padding:20px 36px;text-align:center;border-top:1px solid #f3f4f6;}
  .footer p{color:#9ca3af;font-size:12px;margin:0;}
</style></head>
<body><div class="wrap">
  <div class="header">
    <h1>🎓 Brillance Académie</h1>
    <p>Tutorat à domicile · Ouagadougou</p>
  </div>
  <div class="body">${contenu}</div>
  <div class="footer"><p>© ${new Date().getFullYear()} Brillance Académie · Ouagadougou, Burkina Faso<br/>contact@brillanceacademie.com</p></div>
</div></body></html>`

export const emailTemplates = {

  bienvenue_parent: ({ nom, enfant, niveau }) => ({
    subject: "Bienvenue sur Brillance Académie ! 🎓",
    html: emailBase(`
      <p>Bonjour <strong>${nom}</strong>,</p>
      <p>Votre inscription sur <strong>Brillance Académie</strong> est confirmée. Bienvenue dans la famille !</p>
      <div class="highlight">
        <p>👧 <strong>Élève :</strong> ${enfant}</p>
        <p>📚 <strong>Niveau :</strong> ${niveau}</p>
        <p>⏱️ <strong>Prochaine étape :</strong> Nous vous trouvons un tuteur sous 24h</p>
      </div>
      <p>Notre équipe va examiner votre demande et sélectionner le tuteur le plus adapté au niveau et au programme de votre enfant.</p>
      <a href="https://brillanceacademie.com" class="btn">Voir les tuteurs disponibles →</a>
      <p style="font-size:13px;color:#9ca3af;">Une question ? Répondez à cet email ou contactez-nous sur WhatsApp.</p>
    `)
  }),

  candidature_tuteur: ({ prenom, nom, matieres, tarif }) => ({
    subject: "Candidature reçue — Brillance Académie 📩",
    html: emailBase(`
      <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
      <p>Votre candidature en tant que tuteur a bien été reçue. Merci de rejoindre notre réseau !</p>
      <div class="highlight">
        <p>📚 <strong>Matières :</strong> ${matieres}</p>
        <p>💰 <strong>Tarif :</strong> ${Number(tarif).toLocaleString('fr-FR')} FCFA/h</p>
        <p>⏱️ <strong>Délai d'examen :</strong> 48h maximum</p>
      </div>
      <p>Notre équipe va examiner votre profil. Vous recevrez un email de confirmation une fois votre profil approuvé et mis en ligne.</p>
      <p style="font-size:13px;color:#9ca3af;">En cas de question, répondez directement à cet email.</p>
    `)
  }),

  tuteur_approuve: ({ prenom, nom }) => ({
    subject: "🎉 Votre profil est en ligne — Brillance Académie",
    html: emailBase(`
      <p>Félicitations <strong>${prenom} ${nom}</strong> !</p>
      <p>Votre profil tuteur a été <strong style="color:#16a34a;">approuvé</strong> et est maintenant visible par toutes les familles sur Brillance Académie.</p>
      <div class="highlight">
        <p>✅ Profil actif et visible</p>
        <p>📱 Les parents peuvent désormais réserver une séance avec vous</p>
        <p>💬 Vous serez contacté par WhatsApp avant chaque séance</p>
      </div>
      <a href="https://brillanceacademie.com" class="btn">Voir mon profil →</a>
      <p style="font-size:13px;color:#9ca3af;">Bienvenue dans l'équipe Brillance Académie !</p>
    `)
  }),

  reservation_confirmee: ({ parentNom, tuteurPrenom, tuteurNom, matiere, jour, creneau, montant }) => ({
    subject: `Séance confirmée avec ${tuteurPrenom} ${tuteurNom} ✅`,
    html: emailBase(`
      <p>Bonjour <strong>${parentNom}</strong>,</p>
      <p>Votre paiement a été accepté. La séance est confirmée !</p>
      <div class="highlight">
        <p>👩‍🏫 <strong>Tuteur :</strong> ${tuteurPrenom} ${tuteurNom}</p>
        <p>📚 <strong>Matière :</strong> ${matiere}</p>
        <p>📅 <strong>Jour & heure :</strong> ${jour} à ${creneau}</p>
        <p>💳 <strong>Montant payé :</strong> ${Number(montant).toLocaleString('fr-FR')} FCFA</p>
      </div>
      <p>Votre tuteur vous contactera par WhatsApp dans les 24h pour confirmer les détails.</p>
      <p style="font-size:13px;color:#9ca3af;"><strong>Rappel :</strong> Première séance non satisfaisante ? On vous rembourse intégralement.</p>
    `)
  }),
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

export async function upsertParent({ nom, sexe, email, enfant, niveau, password_hash }) {
  if (!email) return null
  const emailClean = email.toLowerCase().trim()
  // Check if parent already exists
  const { data: existing } = await supabase.from('parents').select('*').eq('email', emailClean).maybeSingle()
  if (existing) {
    // Update only if new fields provided; don't overwrite password if already set
    const updates = {}
    if (nom && !existing.nom) updates.nom = nom
    if (sexe && !existing.sexe) updates.sexe = sexe
    if (enfant && !existing.enfant) updates.enfant = enfant
    if (niveau && !existing.niveau) updates.niveau = niveau
    if (password_hash && !existing.password_hash) updates.password_hash = password_hash
    if (Object.keys(updates).length > 0) {
      await supabase.from('parents').update(updates).eq('id', existing.id)
    }
    return existing
  }
  // Create new parent
  const { data, error } = await supabase.from('parents').insert({
    nom, sexe, email: emailClean, enfant, niveau, password_hash
  }).select().single()
  if (error) throw error
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

export async function getReservationsByParentEmail(email) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('parent_email', email.toLowerCase().trim())
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
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

export async function creerReservation(params) {
  // Accept both camelCase (legacy) and snake_case (current) param styles
  const tuteur_id   = params.tuteur_id   || params.tuteurId
  const parent_nom  = params.parent_nom  || params.parentNom   || ""
  const parent_sexe = params.parent_sexe || params.parentSexe  || ""
  const parent_email= params.parent_email|| params.parentEmail  || ""
  const parent_password_hash = params.parent_password_hash || null
  const { enfant, niveau, jour, creneau } = params
  let montant = params.montant
  const tuteur_price = params.tuteur_price || params.tuteurPrice || 0
  const duree = params.duree || 1
  const paiement_mode      = params.paiement_mode || params.paiementMode || ""
  const paiement_reference = params.paiement_reference || params.paiementReference || ('BA-' + Date.now())
  const statut             = params.statut || 'en_attente'
  const tuteur_nom         = params.tuteur_nom || params.tuteurNom || ""

  // ── Server-side first-session enforcement ──
  // Recompute montant if the email already has prior reservations: no discount.
  let isFirstSession = true
  if (parent_email) {
    try {
      const { count } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('parent_email', parent_email.toLowerCase().trim())
      if ((count || 0) > 0) isFirstSession = false
    } catch(e) { console.warn('first-session check failed:', e) }
  }
  if (!isFirstSession && tuteur_price > 0) {
    // Returning customer: full price, no 20% discount.
    montant = Math.round(tuteur_price * duree)
  }

  // Upsert parent record (create if new, update if needed)
  if (parent_email) {
    try {
      await upsertParent({
        nom: parent_nom,
        sexe: parent_sexe,
        email: parent_email,
        enfant,
        niveau,
        password_hash: parent_password_hash,
      })
    } catch(e) { console.warn('upsertParent error:', e) }
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      tuteur_id,
      tuteur_nom,
      parent_nom,
      parent_email: parent_email ? parent_email.toLowerCase().trim() : "",
      enfant,
      niveau,
      jour,
      creneau,
      montant,
      statut,
      paiement_mode,
      paiement_reference,
    })
    .select()
    .single()
  if (error) throw error
  notifWA(
    `📅 Nouvelle réservation !\n` +
    `Parent : ${parent_nom} (${parent_email})\n` +
    `Enfant : ${enfant} · ${niveau}\n` +
    `Créneau : ${jour} à ${creneau}\n` +
    `Montant : ${montant ? montant.toLocaleString('fr-FR') + ' FCFA' : '—'}\n` +
    `Réf : ${paiement_reference}`
  )
  return { reservation: data, ref: paiement_reference }
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
      sexe:               tuteur.sexe  || "",
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
  if (changes.sexe          !== undefined) update.sexe              = changes.sexe;
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

export async function getTuteurByEmail(email) {
  const { data, error } = await supabase
    .from('tuteurs')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getReservationsByTuteurId(tuteurId) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('tuteur_id', tuteurId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
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

// ─── LOOKUP RÉFÉRENCE ─────────────────────────────────────────────────────────
// Recherche instantanée par référence BA-XXXXXX
export async function getReservationByRef(ref) {
  const { data, error } = await supabase
    .from('v_reservations_lookup')
    .select('*')
    .ilike('reference', ref.trim())
    .limit(1)
    .single()
  if (error) throw error
  return data
}

// Recherche dans les réservations (admin) par ref, nom parent ou nom tuteur
export async function searchReservations(query) {
  const q = query.trim()
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .or(`paiement_reference.ilike.%${q}%,parent_nom.ilike.%${q}%,tuteur_nom.ilike.%${q}%,parent_email.ilike.%${q}%`)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}

// ─── COMPTEUR DE VISITEURS ────────────────────────────────────────────────────
// Enregistre une visite (une fois par jour par navigateur via localStorage)
export async function enregistrerVisite() {
  const cle = 'ba_visite_' + new Date().toISOString().slice(0, 10); // ex: ba_visite_2026-04-07
  if (localStorage.getItem(cle)) return; // déjà compté aujourd'hui
  localStorage.setItem(cle, '1');
  await supabase.from('page_views').insert([{
    page: 'accueil',
    user_agent: navigator.userAgent.slice(0, 200),
  }]).catch(() => {});
}

// Récupère les stats de visites pour l'admin
export async function getVisiteStats() {
  const { data, error } = await supabase
    .from('page_views')
    .select('id, created_at')
    .order('created_at', { ascending: false });
  if (error) return { total: 0, aujourd_hui: 0, cette_semaine: 0, ce_mois: 0 };
  const now = new Date();
  const today      = now.toISOString().slice(0, 10);
  const weekAgo    = new Date(now - 7  * 86400000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return {
    total:          data.length,
    aujourd_hui:    data.filter(r => r.created_at?.slice(0,10) === today).length,
    cette_semaine:  data.filter(r => r.created_at >= weekAgo).length,
    ce_mois:        data.filter(r => r.created_at >= monthStart).length,
  };
}
