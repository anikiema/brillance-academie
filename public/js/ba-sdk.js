/**
 * ba-sdk.js — Brillance Académie SDK
 * Chemins TOUJOURS relatifs — fonctionne en local, staging et production sans modification.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ─── Supabase client ─────────────────────────────────────────────────────────
export const supabase = createClient(
  'https://cslhpanzdgmlicnenlhk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbGhwYW56ZGdtbGljbmVubGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzIzMDYsImV4cCI6MjA5MDg0ODMwNn0.fXHzUHPMAHzZ5zPcrKdtxuXrDpHJ_vhygTYwWrYq894'
);

// ─── Session ──────────────────────────────────────────────────────────────────
const SESSION_KEY = 'ba_session';
export const getSession  = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } };
export const setSession  = (d) => d ? localStorage.setItem(SESSION_KEY, JSON.stringify(d)) : localStorage.removeItem(SESSION_KEY);
export const clearSession = () => localStorage.removeItem(SESSION_KEY);

// ─── Portails privés (React SPA à /app) ──────────────────────────────────────
// Toujours relatif — marche en local ET en production sans aucune condition.
export const portalURL = (hash) => `/app#/${hash}`;

// ─── Injection nav ───────────────────────────────────────────────────────────
export function initNavAuth() {
  const session = getSession();
  const cta = document.getElementById('nav-cta');
  if (!cta) return;

  if (session) {
    const label = session.role === 'parent'  ? `👤 ${session.prenom || 'Mon Espace'}`
                : session.role === 'tuteur'  ? `🎓 Mon Espace`
                : `🛡️ Admin`;
    const dest  = session.role === 'parent'  ? portalURL('espace-parent')
                : session.role === 'tuteur'  ? portalURL('espace-tuteur')
                : portalURL('admin');

    cta.textContent = label;
    cta.href = dest;
    cta.style.background = 'linear-gradient(135deg,#10b981,#059669)';

    const logout = document.createElement('button');
    logout.textContent = 'Déconnexion';
    logout.style.cssText = 'margin-left:8px;padding:8px 14px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;font-size:13px;cursor:pointer;font-weight:500;white-space:nowrap;';
    logout.addEventListener('click', () => { clearSession(); window.location.reload(); });
    cta.parentNode.insertBefore(logout, cta.nextSibling);
  } else {
    cta.textContent = 'Connexion';
    cta.href = '/connexion.html';
  }
}

// ─── Données Supabase ─────────────────────────────────────────────────────────
export async function getTuteurs() {
  const { data, error } = await supabase
    .from('tuteurs').select('*').eq('statut', 'Actif').order('sessions', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAvis() {
  const { data, error } = await supabase
    .from('avis').select('*').eq('statut', 'approuvé').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTuteurById(id) {
  const { data, error } = await supabase.from('tuteurs').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function creerReservation(params) {
  const { data, error } = await supabase.from('reservations').insert([params]).select().single();
  if (error) throw error;
  return data;
}

export async function ajouterCandidatureTuteur(form) {
  const { data, error } = await supabase
    .from('tuteurs').insert([{ ...form, statut: 'En attente', sessions: 0 }]).select().single();
  if (error) throw error;
  return data;
}

export async function ajouterAvis(avis) {
  const { data, error } = await supabase
    .from('avis').insert([{ ...avis, statut: 'en_attente' }]).select().single();
  if (error) throw error;
  return data;
}

// ─── Email (fonction serverless Vercel — chemin relatif) ────────────────────
export async function sendEmail({ to, subject, html }) {
  const res = await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html }),
  });
  if (!res.ok) throw new Error('Erreur envoi email');
  return res.json();
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = '22677166565';
export function openWhatsApp(message) {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message || '')}`, '_blank');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export async function hashPassword(password) {
  const data = new TextEncoder().encode(password + 'brillance_salt_2025');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const fmt = (n) => Number(n).toLocaleString('fr-FR') + ' FCFA';

export const MATIERES_EMOJI = {
  'Mathématiques':    '🔢',
  'Lecture & phonics':'📖',
  'Écriture':         '✏️',
  'Sciences':         '🔬',
  'Histoire & Géo':   '🌍',
  'Langues':          '💬',
  'Arts & Musique':   '🎨',
  'Technologie':      '💻',
};
