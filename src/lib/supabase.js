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
    availableDays: t.available_days || [],
    niveaux:       t.niveaux       || [],
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
