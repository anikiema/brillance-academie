/**
 * ba-sdk.js — Brillance Académie Shared SDK
 * Supabase client + auth helpers for static marketing pages.
 * Loaded via <script type="module"> in every static HTML page.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ─── Supabase client ────────────────────────────────────────────────────────
export const supabase = createClient(
  'https://cslhpanzdgmlicnenlhk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbGhwYW56ZGdtbGljbmVubGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzIzMDYsImV4cCI6MjA5MDg0ODMwNn0.fXHzUHPMAHzZ5zPcrKdtxuXrDpHJ_vhygTYwWrYq894'
);

// ─── Session helpers (shared localStorage key) ──────────────────────────────
const SESSION_KEY = 'ba_session';

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

export function setSession(data) {
  if (data) localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  else localStorage.removeItem(SESSION_KEY);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── SPA URL helper ─────────────────────────────────────────────────────────
// The React SPA lives at /app (prod) or http://localhost:5173 (dev).
export const SPA_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5173'
  : '/app';

export const spaRoute = (hash) => `${SPA_BASE}#/${hash}`;

// ─── Nav auth injection ──────────────────────────────────────────────────────
/**
 * Call this on every page to update the nav CTA based on session state.
 * Replaces the default "Trouver un tuteur" button with "Mon Espace →" when logged in.
 */
export function initNavAuth() {
  const session = getSession();
  const cta = document.getElementById('nav-cta');
  if (!cta) return;

  if (session) {
    const label = session.role === 'parent'
      ? `👤 ${session.prenom || session.nom || 'Mon Espace'}`
      : session.role === 'tuteur'
        ? `🎓 Mon Espace`
        : `🛡️ Admin`;
    const href = session.role === 'parent'
      ? spaRoute('espace-parent')
      : session.role === 'tuteur'
        ? spaRoute('espace-tuteur')
        : spaRoute('admin');

    cta.textContent = label;
    cta.href = href;
    cta.style.background = 'linear-gradient(135deg,#10b981,#059669)';

    // Add logout button next to CTA
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Déconnexion';
    logoutBtn.style.cssText = 'margin-left:8px;padding:8px 14px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;font-size:13px;cursor:pointer;font-weight:500;';
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.reload();
    });
    cta.parentNode.insertBefore(logoutBtn, cta.nextSibling);
  } else {
    cta.textContent = 'Connexion';
    cta.href = spaRoute('accueil');
  }
}

// ─── Data helpers ────────────────────────────────────────────────────────────
export async function getTuteurs() {
  const { data, error } = await supabase
    .from('tuteurs')
    .select('*')
    .eq('statut', 'Actif')
    .order('sessions', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAvis() {
  const { data, error } = await supabase
    .from('avis')
    .select('*')
    .eq('statut', 'approuvé')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTuteurById(id) {
  const { data, error } = await supabase
    .from('tuteurs')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function creerReservation(params) {
  // POST via the SPA's API on Vercel — or call Supabase directly
  const { data, error } = await supabase
    .from('reservations')
    .insert([params])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function ajouterCandidatureTuteur(form) {
  const { data, error } = await supabase
    .from('tuteurs')
    .insert([{ ...form, statut: 'En attente', sessions: 0 }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function ajouterAvis(avis) {
  const { data, error } = await supabase
    .from('avis')
    .insert([{ ...avis, statut: 'en_attente' }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Email helper (calls Vercel serverless function) ─────────────────────────
export async function sendEmail({ to, subject, html }) {
  const base = window.location.hostname === 'localhost'
    ? 'http://localhost:5173'  // Vite proxies /api → Vercel functions in dev
    : '';
  const res = await fetch(`${base}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html }),
  });
  if (!res.ok) throw new Error('Email error');
  return res.json();
}

// ─── WhatsApp notification ───────────────────────────────────────────────────
export function openWhatsApp(message) {
  const encoded = encodeURIComponent(message || '');
  window.open(`https://wa.me/22677166565?text=${encoded}`, '_blank');
}

// ─── Password hash (SHA-256 + salt) — same as App.jsx ─────────────────────
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'brillance_salt_2025');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Format helpers ──────────────────────────────────────────────────────────
export const fmt = (n) => Number(n).toLocaleString('fr-FR') + ' FCFA';

export const MATIERES_EMOJI = {
  'Mathématiques': '🔢',
  'Lecture & phonics': '📖',
  'Écriture': '✏️',
  'Sciences': '🔬',
  'Histoire & Géo': '🌍',
  'Langues': '💬',
  'Arts & Musique': '🎨',
  'Technologie': '💻',
};
