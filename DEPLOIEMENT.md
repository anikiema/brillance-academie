# 🚀 Guide de déploiement — Brillance Académie

Suis ces étapes dans l'ordre. Environ 45 minutes au total.

---

## ÉTAPE 1 — Supabase (Base de données)

### 1.1 Créer un compte
Va sur https://supabase.com → "Start for free" → connecte-toi avec GitHub ou email.

### 1.2 Créer un projet
- Clique "New project"
- Nom : `brillance-academie`
- Mot de passe base de données : génère-en un fort et note-le
- Région : choisir **West EU** (le plus proche d'Afrique de l'Ouest)

### 1.3 Créer les tables
- Va dans ton projet → **SQL Editor** → "New query"
- Copie-colle tout le contenu du fichier `supabase/schema.sql`
- Clique **Run**
- ✅ Tes tables sont créées avec les premiers tuteurs

### 1.4 Récupérer tes clés
Va dans **Settings → API** :
- Copie `Project URL` → c'est ton `VITE_SUPABASE_URL`
- Copie `anon public` → c'est ton `VITE_SUPABASE_ANON_KEY`
- Copie `service_role` → c'est ton `SUPABASE_SERVICE_KEY` (garde-le secret !)

---

## ÉTAPE 2 — CinetPay (Paiements)

### 2.1 Créer un compte business
Va sur https://cinetpay.com → "Créer un compte" → type **Business**.

Documents requis :
- IFU (Identifiant Financier Unique) de ton entreprise au Burkina
- Ou CNI + justificatif d'activité pour un compte individuel

### 2.2 Créer une application
- Tableau de bord CinetPay → **Mes applications** → "Nouvelle application"
- Nom : `Brillance Académie`
- Site web : `https://brillanceacademie.bf`
- Note ton **Site ID** et ta **Clé API secrète**

### 2.3 Configurer les URLs de retour
Dans les paramètres de l'application :
- Return URL : `https://brillanceacademie.bf/confirmation`
- Notify URL : `https://brillanceacademie.bf/api/cinetpay-webhook`

---

## ÉTAPE 3 — GitHub (Héberger le code)

```bash
# Dans ton terminal, depuis le dossier brillance-academie/
git init
git add .
git commit -m "🚀 Brillance Académie — déploiement initial"

# Crée un dépôt sur https://github.com/new
# Puis connecte et pousse :
git remote add origin https://github.com/TON_USERNAME/brillance-academie.git
git push -u origin main
```

---

## ÉTAPE 4 — Vercel (Mise en ligne)

### 4.1 Connecter le projet
- Va sur https://vercel.com → "New Project"
- Importe ton dépôt GitHub `brillance-academie`
- Framework : **Vite** (détecté automatiquement)
- Clique "Deploy"

### 4.2 Ajouter les variables d'environnement
Dans Vercel → ton projet → **Settings → Environment Variables** :

| Nom | Valeur |
|-----|--------|
| `VITE_SUPABASE_URL` | https://xxxx.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | eyJ... (clé anon) |
| `SUPABASE_SERVICE_KEY` | eyJ... (clé service) |
| `VITE_CINETPAY_SITE_ID` | 123456789 |
| `CINETPAY_API_KEY` | ta_cle_secrete |
| `APP_URL` | https://brillanceacademie.bf |

Après avoir ajouté les variables → **Redeploy**.

---

## ÉTAPE 5 — Domaine .bf

### 5.1 Acheter le domaine
Va sur https://nindohost.bf → cherche `brillanceacademie.bf` → acheter (~1 600 FCFA/an).

### 5.2 Connecter à Vercel
- Vercel → Settings → **Domains** → "Add" → tape `brillanceacademie.bf`
- Vercel te donnera des enregistrements DNS à configurer
- Va sur Nindohost → Gestion DNS → ajoute les enregistrements :
  - Type `A` → `76.76.21.21`
  - Type `CNAME` → `www` → `cname.vercel-dns.com`
- Attendre 10–30 minutes pour la propagation

---

## ÉTAPE 6 — Vérification finale

Checklist :
- [ ] https://brillanceacademie.bf s'ouvre
- [ ] Les tuteurs s'affichent (chargés depuis Supabase)
- [ ] La réservation s'enregistre dans Supabase (table `reservations`)
- [ ] Le bouton "Payer" redirige vers CinetPay
- [ ] Après paiement, la page confirmation s'affiche
- [ ] Le webhook CinetPay met à jour le statut dans Supabase
- [ ] L'admin fonctionne à l'URL `/` avec le bouton ⚙

---

## En cas de problème

- **Supabase** : Vérifie que RLS est bien activé et que les politiques sont créées
- **CinetPay** : En mode test, utilise les numéros de test fournis par CinetPay
- **Vercel** : Vérifie les logs dans Vercel → Functions → cinetpay-webhook

---

## Support

- Supabase docs : https://supabase.com/docs
- CinetPay docs : https://docs.cinetpay.com
- Vercel docs : https://vercel.com/docs
