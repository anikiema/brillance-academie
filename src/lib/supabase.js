import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')

// ─── Tuteurs ──────────────────────────────────────────────────────────────────
export async function getTuteurs() {
  const { data, error } = await supabase
    .from('tuteurs')
    .select('*')
    .eq('statut', 'Actif')
    .order('sessions', { ascending: false })
  if (error) throw error
  // Mapper snake_case → camelCase pour compatibilité avec le code React
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
  return data
}

export async function modifierParent(id, changes) {
  const { error } = await supabase
    .from('parents')
    .update(changes)
    .eq('id', id)
  if (error) throw error
}

export async function supprimerParent(id) {
  const { error } = await supabase
    .from('parents')
    .delete()
    .eq('id', id)
  if (error) throw error
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
  return { reservation: data, ref }
}

export async function confirmerReservation(ref) {
  const { error } = await supabase
    .from('reservations')
    .update({ statut: 'confirmée' })
    .eq('paiement_reference', ref)
  if (error) throw error
}

export async function changerStatutReservation(id, statut) {
  const { error } = await supabase
    .from('reservations')
    .update({ statut })
    .eq('id', id)
  if (error) throw error
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
}

export async function changerStatutAvis(id, statut) {
  const { error } = await supabase
    .from('avis')
    .update({ statut })
    .eq('id', id)
  if (error) throw error
}

export async function supprimerAvis(id) {
  const { error } = await supabase
    .from('avis')
    .delete()
    .eq('id', id)
  if (error) throw error
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
  if (changes.quartiersCouVerts !== undefined)
    update.quartiers_couverts = changes.quartiersCouVerts;
  const { error } = await supabase
    .from('tuteurs')
    .update(update)
    .eq('id', id)
  if (error) throw error
}

export async function supprimerTuteur(id) {
  const { error } = await supabase
    .from('tuteurs')
    .delete()
    .eq('id', id)
  if (error) throw error
}
