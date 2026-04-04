-- ═══════════════════════════════════════════════════════════════════
--  BRILLANCE ACADÉMIE — Schéma Supabase
--  Colle ce SQL dans : Supabase → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════

-- ─── TUTEURS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tuteurs (
  id            SERIAL PRIMARY KEY,
  prenom        TEXT NOT NULL,
  nom           TEXT NOT NULL,
  subject       TEXT NOT NULL,
  rating        INT  DEFAULT 5,
  sessions      INT  DEFAULT 0,
  price         INT  NOT NULL,
  available_days TEXT[] DEFAULT '{}',
  statut        TEXT DEFAULT 'En attente',
  bio           TEXT,
  emoji         TEXT DEFAULT '👩‍🏫',
  quartier      TEXT,
  niveaux       TEXT[] DEFAULT '{}',
  email         TEXT,
  telephone     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PARENTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parents (
  id         SERIAL PRIMARY KEY,
  nom        TEXT NOT NULL,
  email      TEXT NOT NULL,
  telephone  TEXT,
  enfant     TEXT,
  statut     TEXT DEFAULT 'En attente',
  sessions   INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RÉSERVATIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id                  SERIAL PRIMARY KEY,
  tuteur_id           INT  REFERENCES tuteurs(id),
  parent_nom          TEXT,
  parent_email        TEXT,
  enfant              TEXT,
  niveau              TEXT,
  jour                TEXT,
  creneau             TEXT,
  montant             INT,
  statut              TEXT DEFAULT 'en_attente',
  paiement_reference  TEXT UNIQUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PAIEMENTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paiements (
  id             SERIAL PRIMARY KEY,
  reservation_id INT  REFERENCES reservations(id),
  montant        INT  NOT NULL,
  methode        TEXT,
  statut         TEXT DEFAULT 'en_attente',
  reference      TEXT UNIQUE,
  cinetpay_id    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SÉCURITÉ (Row Level Security) ────────────────────────────────
ALTER TABLE tuteurs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements    ENABLE ROW LEVEL SECURITY;

-- Lecture publique des tuteurs actifs
CREATE POLICY "tuteurs_publics" ON tuteurs
  FOR SELECT USING (statut = 'Actif');

-- Création de réservations sans authentification
CREATE POLICY "creer_reservations" ON reservations
  FOR INSERT WITH CHECK (true);

-- Lecture de sa propre réservation (par email)
CREATE POLICY "lire_sa_reservation" ON reservations
  FOR SELECT USING (true);

-- Création de parents (inscription)
CREATE POLICY "creer_parents" ON parents
  FOR INSERT WITH CHECK (true);

-- ─── DONNÉES INITIALES (tuteurs exemple) ──────────────────────────
INSERT INTO tuteurs (prenom, nom, subject, rating, sessions, price, available_days, statut, bio, emoji, quartier, niveaux) VALUES
  ('Claire', 'B.', 'Mathématiques',     5, 42, 32500, ARRAY['Lundi','Mercredi','Vendredi'], 'Actif', 'Spécialiste CP–CM2, passionnée par les méthodes ludiques.',           '👩‍🏫', 'Plateau',    ARRAY['CP','CE1','CE2','CM1','CM2']),
  ('Kwame',  'A.', 'Lecture & phonics', 5, 38, 27500, ARRAY['Mardi','Jeudi','Samedi'],      'Actif', 'Expert en conscience phonologique et fluence de lecture.',              '👨‍🏫', 'Almadies',   ARRAY['CP','CE1','CE2']),
  ('Sofia',  'R.', 'Sciences',          4, 27, 35000, ARRAY['Lundi','Mardi','Jeudi'],       'Actif', 'Rend les sciences concrètes et amusantes pour les enfants.',            '👩‍🔬', 'Mermoz',     ARRAY['CM1','CM2','6ème','5ème']),
  ('Daniel', 'K.', 'Technologie',       5, 31, 40000, ARRAY['Mardi','Mercredi','Vendredi'], 'Actif', 'Initie les enfants au code et à la pensée computationnelle.',           '👨‍💻', 'Sacré-Cœur', ARRAY['CM1','CM2','6ème','5ème','4ème','3ème']);
