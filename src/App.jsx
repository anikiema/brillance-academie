// Brillance Académie v1.7 — thème centralisé, conversion parent, UX tuteur
import React, { useState, useEffect, useMemo } from "react";

// ─── THEME (source unique de vérité couleurs) ─────────────────────────────────
const T = {
  primary:       "#4f46e5",  // indigo — CTA principaux
  primaryDark:   "#4338ca",  // hover primary
  primarySoft:   "#ede9fe",  // fond léger primary
  primarySofter: "#f5f3ff",  // fond très léger primary
  primaryText:   "#4f46e5",  // texte sur soft
  ink:           "#111827",  // titres
  body:          "#374151",  // texte courant
  muted:         "#6b7280",  // texte secondaire
  subtle:        "#9ca3af",  // texte très discret
  border:        "#e5e7eb",  // bordures neutres
  borderSoft:    "#f1f5f9",  // bordures très discrètes
  bg:            "#fafafa",  // fond général
  cardBg:        "#ffffff",  // fond cartes
  success:       "#10b981",  // vert : confirmations uniquement
  successSoft:   "#d1fae5",  // badge vert
  successInk:    "#065f46",  // texte sur vert
  warning:       "#f59e0b",  // jaune : étoiles, attente
  warningSoft:   "#fef3c7",  // fond attente
  warningInk:    "#92400e",  // texte attente
  danger:        "#ef4444",  // rouge : erreurs/suppression
  dangerSoft:    "#fee2e2",  // fond erreur
  dangerInk:     "#991b1b",  // texte erreur
};
import { getTuteurs, getTousTuteurs, getReservations, getParents, creerReservation, ajouterParent, modifierParent, supprimerParent, upsertParent, ajouterTuteur, modifierTuteur, supprimerTuteur, changerStatutReservation, supprimerReservation, getAvis, getTousAvis, ajouterAvis, changerStatutAvis, supprimerAvis, getParentByEmail, getReservationCountByEmail, getReservationsByParentEmail, getTuteurByEmail, getReservationsByTuteurId, getEcoles, ajouterEcole, modifierEcole, supprimerEcole, sendEmail, emailTemplates, enregistrerVisite, getVisiteStats, getReservationByRef, hashPassword, loginParent, loginTuteur, changerMotDePasseParent, changerMotDePasseTuteur } from "./lib/supabase.js";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const MATIERES = [
  { label: "Lecture & phonics",   emoji: "📖" },
  { label: "Mathématiques",       emoji: "🔢" },
  { label: "Écriture",            emoji: "✏️" },
  { label: "Sciences",            emoji: "🔬" },
  { label: "Histoire & Géo",      emoji: "🌍" },
  { label: "Langues",             emoji: "💬" },
  { label: "Arts & Musique",      emoji: "🎨" },
  { label: "Technologie",         emoji: "💻" },
];

const NIVEAUX = ["CP", "CE1", "CE2", "CM1", "CM2", "6ème", "5ème", "4ème", "3ème"];
const NIVEAUX_LIST = NIVEAUX;
const QUARTIERS_LIST = ["Ouaga 2000","Hamdalaye","Gounghin","Pissy","Patte d'Oie","Wemtenga","Karpala","Tampouy","Secteur 30","Zone du Bois"];
const JOURS   = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const CRENEAUX = ["08h00", "09h00", "10h00", "11h00", "14h00", "15h00", "16h00", "17h00"];

const TUTEURS = [
  { id:1, prenom:"Claire", nom:"B.",  subject:"Mathématiques",     rating:5, sessions:42, price:32500, availableDays:["Lundi","Mercredi","Vendredi"], statut:"Actif",     bio:"Spécialiste CP–CM2, passionnée par les méthodes ludiques.",            emoji:"👩‍🏫", quartier:"Ouaga 2000",  niveaux:["CP","CE1","CE2","CM1","CM2"] },
  { id:2, prenom:"Kwame",  nom:"A.",  subject:"Lecture & phonics", rating:5, sessions:38, price:27500, availableDays:["Mardi","Jeudi","Samedi"],      statut:"Actif",     bio:"Expert en conscience phonologique et fluence de lecture.",              emoji:"👨‍🏫", quartier:"Hamdalaye",   niveaux:["CP","CE1","CE2"] },
  { id:3, prenom:"Sofia",  nom:"R.",  subject:"Sciences",          rating:4, sessions:27, price:35000, availableDays:["Lundi","Mardi","Jeudi"],       statut:"Actif",     bio:"Rend les sciences concrètes et amusantes pour les enfants.",            emoji:"👩‍🔬", quartier:"Gounghin",    niveaux:["CM1","CM2","6ème","5ème"] },
  { id:4, prenom:"Liam",   nom:"T.",  subject:"Histoire & Géo",    rating:5, sessions:15, price:27500, availableDays:["Mercredi","Vendredi"],         statut:"Inactif",   bio:"Passionné par l'histoire de l'Afrique et du monde.",                   emoji:"👨‍🎓", quartier:"Patte d'Oie", niveaux:["6ème","5ème","4ème","3ème"] },
  { id:5, prenom:"Amara",  nom:"N.",  subject:"Arts & Musique",    rating:4, sessions:0,  price:25000, availableDays:["Lundi","Samedi"],              statut:"En attente",bio:"Artiste et musicienne, accompagne les enfants avec créativité.",        emoji:"👩‍🎨", quartier:"Wemtenga",    niveaux:["CP","CE1","CE2","CM1","CM2"] },
  { id:6, prenom:"Daniel", nom:"K.",  subject:"Technologie",       rating:5, sessions:31, price:40000, availableDays:["Mardi","Mercredi","Vendredi"], statut:"Actif",     bio:"Initie les enfants au code et à la pensée computationnelle.",           emoji:"👨‍💻", quartier:"Pissy",       niveaux:["CM1","CM2","6ème","5ème","4ème","3ème"] },
];

const fmt = n => n.toLocaleString("fr-FR") + " FCFA";

// ─── CINETPAY ────────────────────────────────────────────────────────────────
// ⚠️ Remplacer par vos identifiants CinetPay (tableau de bord → Mes paramètres → API)
const CP_API_KEY = "VOTRE_CINETPAY_API_KEY";
const CP_SITE_ID = "VOTRE_CINETPAY_SITE_ID";

const QUARTIERS = [
  "Bonheur Ville","Ouaga 2000","Hamdalaye","Gounghin","Patte d'Oie","Wemtenga",
  "Pissy","Karpala","Dassasgo","Zogona","Tampouy","Nongr-Masson","Bogodogo",
  "Baskuy","Sig-Noghin","Dapoya","Bilbalgo","Samandin","Wayalghin","Tanghin",
  "Larlé","Cissin","Koulouba","Zone du Bois","Nioko","Paul VI",
  "Secteur 22","Secteur 27","Secteur 28","Secteur 30","Autres",
];

const ECOLES_PARTENAIRES = [
  "École Primaire Privée Les Élites De Demain · Bonheur Ville",
  "École Privée La Réussite · Ouaga 2000",
  "Collège Saint-Viateur · Gounghin",
  "École Les Étoiles Brillantes · Hamdalaye",
  "Institut Sainte-Famille · Patte d'Oie",
  "École Primaire La Lumière · Wemtenga",
  "Académie Excellence · Pissy",
];

const PARENTS_INIT = [
  { id:1, nom:"Aminata Diallo",  email:"aminata@gmail.com",  telephone:"77 123 45 67", enfant:"Moussa, CM1",  statut:"Actif",     sessions:8  },
  { id:2, nom:"Ibrahima Sow",    email:"ibrahima@gmail.com", telephone:"76 234 56 78", enfant:"Fatou, CE2",   statut:"Actif",     sessions:12 },
  { id:3, nom:"Rokhaya Ndiaye",  email:"rokhaya@yahoo.fr",   telephone:"70 345 67 89", enfant:"Oumar, 6ème",  statut:"Actif",     sessions:5  },
  { id:4, nom:"Cheikh Ba",       email:"cheikh@gmail.com",   telephone:"78 456 78 90", enfant:"Aïssatou, CP", statut:"En attente",sessions:0  },
  { id:5, nom:"Ndéye Faye",      email:"ndeye@hotmail.fr",   telephone:"77 567 89 01", enfant:"Lamine, CM2",  statut:"Actif",     sessions:3  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Stars({ n }) {
  return <span>{Array.from({length:5},(_,i) => <span key={i} style={{color: i<n ? "#f59e0b" : "#e5e7eb"}}>★</span>)}</span>;
}

function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        padding: "8px 18px", borderRadius: 999, border: "1.5px solid",
        borderColor: active ? "#4f46e5" : "#e5e7eb",
        background: active ? "#eef2ff" : "#fff",
        color: active ? "#4f46e5" : "#6b7280",
        fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .15s",
        whiteSpace: "nowrap",
      }}>
      {children}
    </button>
  );
}

function Inp({ label, value, onChange, placeholder, type="text", min, max, filter, onBlur }) {
  const handleChange = (e) => {
    let v = e.target.value;
    if (filter === "tel")    v = v.replace(/[^0-9+\s\-]/g, "");
    if (filter === "number") v = v.replace(/[^0-9]/g, "");
    if (min !== undefined && v !== "" && Number(v) < min) v = String(min);
    if (max !== undefined && v !== "" && Number(v) > max) v = String(max);
    onChange(v);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <label style={{fontSize:13,fontWeight:600,color:"#374151"}}>{label}</label>
      <input type={type} value={value} onChange={handleChange} placeholder={placeholder}
        min={min} max={max} inputMode={filter==="tel"||filter==="number"?"numeric":undefined}
        style={{border:"1.5px solid #e5e7eb",borderRadius:12,padding:"11px 16px",fontSize:14,outline:"none",background:"#fafafa"}}
        onFocus={e=>e.target.style.borderColor="#4f46e5"}
        onBlur={e=>{ e.target.style.borderColor="#e5e7eb"; if (onBlur) onBlur(e.target.value); }}
      />
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <label style={{fontSize:13,fontWeight:600,color:"#374151"}}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{border:"1.5px solid #e5e7eb",borderRadius:12,padding:"11px 16px",fontSize:14,outline:"none",background:"#fafafa",cursor:"pointer"}}>
        <option value="">Choisir…</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function BadgeStatus({ s, sexe }) {
  const map = {
    "Actif":      ["#d1fae5","#065f46"],
    "Inactif":    ["#f3f4f6","#6b7280"],
    "En attente": ["#fef3c7","#92400e"],
    "Refusé":     ["#fee2e2","#991b1b"],
  };
  const [bg,fg] = map[s]||["#f3f4f6","#6b7280"];
  // Accord au féminin si sexe = "F"
  const isF = sexe === "F";
  const feminize = { "Actif":"Active", "Inactif":"Inactive", "Refusé":"Refusée" };
  const label = isF && feminize[s] ? feminize[s] : s;
  return <span style={{background:bg,color:fg,padding:"3px 10px",borderRadius:999,fontSize:12,fontWeight:700}}>{label}</span>;
}

function SexeToggle({ value, onChange, label="Sexe" }) {
  return (
    <div>
      <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>{label}</label>
      <div style={{display:"flex",gap:10}}>
        {[{k:"M",emoji:"👨",text:"Homme"},{k:"F",emoji:"👩",text:"Femme"}].map(o=>(
          <button key={o.k} type="button" onClick={()=>onChange(o.k)}
            style={{
              flex:1,padding:"11px 14px",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",
              border: value===o.k ? "2px solid #4f46e5" : "1.5px solid #e5e7eb",
              background: value===o.k ? "#ede9fe" : "#fafafa",
              color: value===o.k ? "#4f46e5" : "#6b7280",
            }}>
            <span style={{marginRight:6}}>{o.emoji}</span>{o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Steps({ labels, current }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:28}}>
      {labels.map((l,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{
            width:30,height:30,borderRadius:999,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:12,fontWeight:700,
            background: i<current?"#10b981":i===current?"#4f46e5":"#f3f4f6",
            color: i<=current?"#fff":"#9ca3af",
          }}>{i<current?"✓":i+1}</div>
          {i<labels.length-1 && <div style={{width:32,height:2,background:i<current?"#10b981":"#e5e7eb"}}/>}
        </div>
      ))}
    </div>
  );
}

function Modal({ title, sub, onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(0,0,0,.45)"}}>
      <div style={{background:"#fff",borderRadius:24,padding:36,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",position:"relative",boxShadow:"0 25px 60px rgba(0,0,0,.18)"}}>
        <button onClick={onClose} style={{position:"absolute",top:18,right:20,background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af",lineHeight:1}}>×</button>
        <p style={{fontSize:11,fontWeight:700,color:"#6366f1",textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>🎓 Brillance Académie</p>
        <h2 style={{fontSize:22,fontWeight:800,color:"#111827",margin:"0 0 4px"}}>{title}</h2>
        {sub && <p style={{fontSize:13,color:"#9ca3af",marginBottom:24}}>{sub}</p>}
        {!sub && <div style={{marginBottom:24}}/>}
        {children}
      </div>
    </div>
  );
}

function FaqItem({ q, r }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{borderBottom:"1px solid #e5e7eb",padding:"20px 0"}}>
      <button onClick={()=>setOpen(!open)}
        style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"'Inter',sans-serif"}}>
        <span style={{fontSize:16,fontWeight:700,color:"#111827"}}>{q}</span>
        <span style={{fontSize:22,color:"#4f46e5",fontWeight:300,flexShrink:0,marginLeft:16,lineHeight:1}}>{open?"−":"+"}</span>
      </button>
      {open && <p style={{fontSize:14,color:"#6b7280",lineHeight:1.8,margin:"12px 0 0",paddingRight:32}}>{r}</p>}
    </div>
  );
}

// ─── PAGE CONFIRMATION + PAIEMENT MOBILE MONEY ───────────────────────────────

const WA_ADMIN = "22677166565"; // ← numéro WhatsApp Brillance Académie

function PagePaiement({ booking, onSuccess, onBack }) {
  const { tuteur, jour, creneau, enfant, niveau, modeSeance="domicile", jitsiLink, duree=1 } = booking;
  const [method,  setMethod]  = useState("orange");
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  // Server-checked first-session flag (null = checking, true/false = checked)
  const [isFirstSession, setIsFirstSession] = useState(booking.premiereSeance !== false);

  // Recheck first-session against the DB on mount, regardless of what the booking flow set,
  // so the same email can NEVER get the −20 % twice.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!booking.parentEmail) return;
      try {
        const nb = await getReservationCountByEmail(booking.parentEmail);
        if (!cancelled) setIsFirstSession(nb === 0);
      } catch { /* keep current value */ }
    })();
    return () => { cancelled = true; };
  }, [booking.parentEmail]);

  const fullAmount  = Math.round((tuteur?.price || 27500) * duree);
  const essaiAmount = isFirstSession ? Math.round(fullAmount * 0.8) : fullAmount;
  const refNum = "BA-" + Math.random().toString(36).slice(2,8).toUpperCase();

  const METHODS = [
    { id:"orange", label:"Orange Money", num:"70 00 00 00", color:"#f97316", bg:"#fff7ed", border:"#fed7aa" },
    { id:"moov",   label:"Moov Money",   num:"65 00 00 00", color:"#0ea5e9", bg:"#e0f2fe", border:"#bae6fd" },
    { id:"coris",  label:"Coris Money",  num:"XX XX XX XX", color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
  ];
  const cur = METHODS.find(m => m.id === method) || METHODS[0];

  const S = { fontFamily:"'Tahoma','Geneva',sans-serif", color:"#111827" };

  const confirmer = async () => {
    setLoading(true);
    try {
      const pwdHash = booking.parentPassword ? await hashPassword(booking.parentPassword) : null;
      await creerReservation({
        tuteur_id:       tuteur?.id,
        tuteur_nom:      `${tuteur?.prenom||""} ${tuteur?.nom||""}`.trim(),
        tuteur_price:    tuteur?.price || 0,
        duree:           duree,
        parent_nom:      booking.parentNom   || "",
        parent_sexe:     booking.parentSexe  || "",
        parent_email:    booking.parentEmail || "",
        parent_password_hash: pwdHash,
        enfant, niveau, jour, creneau,
        montant:         essaiAmount,
        statut:          "en_attente",
        paiement_mode:   cur.label,
        paiement_reference: refNum,
      });
      if (booking.parentEmail) {
        const tpl = emailTemplates.reservation_confirmee({
          parentNom:    booking.parentNom   || "Parent",
          tuteurPrenom: tuteur?.prenom       || "",
          tuteurNom:    tuteur?.nom          || "",
          matiere:      tuteur?.subject      || "",
          jour, creneau, montant: essaiAmount,
        });
        sendEmail({ to: booking.parentEmail, ...tpl });
      }
    } catch(e) { console.error(e); }
    setLoading(false);
    setDone(true);
  };

  const ouvrirWhatsApp = () => {
    const msg = encodeURIComponent(
      `Bonjour Brillance Académie,\n\nJe souhaite confirmer ma réservation :\n- Tuteur : ${tuteur?.prenom} ${tuteur?.nom}\n- Matière : ${tuteur?.subject}\n- Jour : ${jour} à ${creneau}\n- Durée : ${duree}h\n- Élève : ${enfant} — ${niveau}\n- Mode : ${modeSeance==="enligne"?"En ligne (Jitsi)":"À domicile"}\n- Montant : ${essaiAmount.toLocaleString("fr-FR")} FCFA\n- Référence : ${refNum}${jitsiLink?"\n- Lien Jitsi : "+jitsiLink:""}\n\nJ'effectue le paiement par ${cur.label}.`
    );
    window.open(`https://wa.me/${WA_ADMIN}?text=${msg}`, "_blank");
  };

  if (done) return (
    <div style={{...S, minHeight:"100vh", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", padding:24}}>
      <div style={{maxWidth:520, width:"100%"}}>
        <div style={{textAlign:"center", marginBottom:32}}>
          <div style={{width:80, height:80, background:"#d1fae5", borderRadius:999, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto 20px", boxShadow:"0 0 0 12px #f0fdf4, 0 0 0 20px #dcfce7"}}>✅</div>
          <h2 style={{fontSize:26, fontWeight:900, margin:"0 0 8px"}}>Réservation enregistrée !</h2>
          <p style={{color:"#6b7280", fontSize:14, margin:0}}>Référence : <strong style={{color:"#4f46e5"}}>{refNum}</strong></p>
        </div>

        <div style={{background:"#fff", borderRadius:20, padding:24, marginBottom:16, boxShadow:"0 4px 20px rgba(0,0,0,.07)"}}>
          <p style={{fontWeight:700, fontSize:14, color:"#374151", margin:"0 0 16px"}}>📋 Récapitulatif</p>
          {[
            ["👩‍🏫 Tuteur",   `${tuteur?.prenom} ${tuteur?.nom} · ${tuteur?.subject}`],
            ["📅 Séance",    `${jour} à ${creneau}`],
            ["⏱ Durée",     `${duree}h`],
            ["📍 Mode",      modeSeance==="enligne"?"🌐 En ligne":"🏠 À domicile"],
            ["👧 Élève",     `${enfant} · ${niveau}`],
            ["💰 Montant",   `${essaiAmount.toLocaleString("fr-FR")} FCFA${isFirstSession?" (−20 % 1ère séance)":""}`],
            ["💳 Paiement",  cur.label],
          ].map(([k,v])=>(
            <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f9fafb", fontSize:13}}>
              <span style={{color:"#6b7280"}}>{k}</span>
              <span style={{fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Instructions paiement */}
        <div style={{background:cur.bg, border:`1.5px solid ${cur.border}`, borderRadius:16, padding:20, marginBottom:16}}>
          <p style={{fontWeight:700, fontSize:14, color:cur.color, margin:"0 0 10px"}}>📱 Comment payer par {cur.label}</p>
          {[
            `Composez *144# (Orange) ou *555# (Moov) sur votre téléphone`,
            `Sélectionnez "Transfert d'argent"`,
            `Entrez le numéro Brillance (77 16 65 65) et le montant : ${essaiAmount.toLocaleString("fr-FR")} FCFA`,
            `Mentionnez la référence ${refNum} dans le motif`,
          ].map((s,i)=>(
            <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start", marginBottom:i<3?8:0}}>
              <span style={{width:20,height:20,background:cur.color,borderRadius:999,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>{i+1}</span>
              <p style={{fontSize:13, color:"#374151", margin:0, lineHeight:1.5}}>{s}</p>
            </div>
          ))}
        </div>

        {/* Lien Jitsi si séance en ligne */}
        {jitsiLink && (
          <a href={jitsiLink} target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",padding:"14px",background:"#0ea5e9",color:"#fff",borderRadius:14,fontWeight:700,fontSize:15,textDecoration:"none",marginBottom:12,boxSizing:"border-box"}}>
            🌐 Rejoindre la salle Jitsi Meet
          </a>
        )}

        {/* Bouton WhatsApp */}
        <button onClick={ouvrirWhatsApp}
          style={{width:"100%", padding:"14px", background:"#25d366", color:"#fff", border:"none", borderRadius:14, fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:12}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Confirmer sur WhatsApp
        </button>

        <button onClick={onBack} style={{width:"100%", padding:"12px", background:"none", border:"1.5px solid #e5e7eb", borderRadius:14, fontWeight:600, fontSize:14, cursor:"pointer", color:"#6b7280"}}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );

  return (
    <div style={{...S, minHeight:"100vh", background:"#f9fafb"}}>

      {/* Header */}
      <div style={{background:"#fff", borderBottom:"1px solid #f3f4f6", padding:"0 40px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <span style={{fontWeight:900, fontSize:20, color:"#4f46e5"}}>🎓 Brillance Académie</span>
        <span style={{fontSize:13, color:"#6b7280", fontWeight:600}}>Réservation sécurisée</span>
      </div>

      <div style={{maxWidth:600, margin:"0 auto", padding:"40px 24px"}}>

        {/* Résumé */}
        <div style={{background:"#fff", borderRadius:20, padding:24, marginBottom:24, boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}>
          <div style={{display:"flex", gap:14, alignItems:"center", marginBottom:20, paddingBottom:20, borderBottom:"1px solid #f3f4f6"}}>
            <div style={{width:52, height:52, background:"#ede9fe", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28}}>{tuteur?.emoji||"👩‍🏫"}</div>
            <div style={{flex:1}}>
              <p style={{fontWeight:800, fontSize:16, margin:0}}>{tuteur?.prenom} {tuteur?.nom}</p>
              <p style={{fontSize:13, color:"#6366f1", margin:"3px 0 0", fontWeight:600}}>{tuteur?.subject}</p>
            </div>
            <div style={{textAlign:"right"}}>
              {isFirstSession && <p style={{fontSize:12, color:"#9ca3af", margin:0, textDecoration:"line-through"}}>{fmt((tuteur?.price||0)*duree)}</p>}
              <p style={{fontSize:22, fontWeight:900, color:"#4f46e5", margin:0}}>{fmt(essaiAmount)}</p>
              {isFirstSession && <span style={{fontSize:11, background:"#dcfce7", color:"#065f46", padding:"2px 8px", borderRadius:999, fontWeight:700}}>−20 % 1ère séance</span>}
            </div>
          </div>
          {[["📅 Jour & heure",`${jour} à ${creneau}`],["⏱ Durée",`${duree}h`],["👧 Élève",`${enfant} · ${niveau}`]].map(([k,v])=>(
            <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f9fafb", fontSize:14}}>
              <span style={{color:"#6b7280"}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Choix mode de paiement */}
        <p style={{fontWeight:700, fontSize:15, marginBottom:12}}>Choisissez votre moyen de paiement</p>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24}}>
          {METHODS.map(m=>(
            <button key={m.id} onClick={()=>setMethod(m.id)}
              style={{padding:"16px 10px", borderRadius:14, border:`2px solid ${method===m.id?m.color:m.border}`,
                background:method===m.id?m.bg:"#fff", cursor:"pointer", display:"flex", flexDirection:"column",
                alignItems:"center", gap:6, transition:"all .15s"}}>
              <span style={{fontWeight:900, fontSize:15, color:method===m.id?m.color:"#374151"}}>{m.label.split(" ")[0]}</span>
              <span style={{fontSize:11, color:method===m.id?m.color:"#9ca3af", fontWeight:500}}>{m.label.split(" ").slice(1).join(" ")}</span>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div style={{background:cur.bg, border:`1.5px solid ${cur.border}`, borderRadius:16, padding:20, marginBottom:24}}>
          <p style={{fontWeight:700, fontSize:14, color:cur.color, margin:"0 0 6px"}}>Comment ça marche ?</p>
          <p style={{fontSize:13, color:"#374151", margin:0, lineHeight:1.7}}>
            Cliquez sur <strong>"Confirmer la réservation"</strong>. Votre réservation sera enregistrée et vous recevrez les instructions de paiement par WhatsApp. Aucune information bancaire requise ici.
          </p>
        </div>

        <button onClick={confirmer} disabled={loading}
          style={{width:"100%", padding:"15px", borderRadius:14, border:"none", cursor:"pointer",
            fontWeight:700, fontSize:15, background:"#4f46e5", color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:12}}>
          {loading
            ? <><svg style={{width:18,height:18,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Enregistrement…</>
            : `✓ Confirmer la réservation — ${essaiAmount.toLocaleString("fr-FR")} FCFA`}
        </button>

        <button onClick={onBack} style={{display:"block", margin:"0 auto", background:"none", border:"none", color:"#9ca3af", fontSize:13, cursor:"pointer"}}>
          ← Annuler et revenir
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── INSCRIPTION PARENT ────────────────────────────────────────────────────────

function InscriptionParent({ onClose, ecolesList=[] }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ nom:"", sexe:"", email:"", tel:"", ville:"", enfant:"", age:"", niveau:"", matieres:[], objectif:"", frequence:"1 fois par semaine" });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setD(p=>({...p,[k]:v}));
  const tog = m => set("matieres", d.matieres.includes(m)?d.matieres.filter(x=>x!==m):[...d.matieres,m]);

  const ok = [d.nom&&d.sexe&&d.email&&d.tel&&d.ville, d.enfant&&d.niveau, d.matieres.length>0, true];

  const envoyer = async () => {
    setSaving(true);
    try {
      await ajouterParent({
        nom:       d.nom,
        sexe:      d.sexe,
        email:     d.email,
        telephone: d.tel,
        enfant:    `${d.enfant}${d.niveau ? ", " + d.niveau : ""}`,
        statut:    "En attente",
        sessions:  0,
      });
      // ── Email de bienvenue parent ──
      if (d.email) {
        const tpl = emailTemplates.bienvenue_parent({ nom: d.nom, enfant: d.enfant, niveau: d.niveau });
        sendEmail({ to: d.email, ...tpl });
      }
    } catch(e) { console.error(e); }
    setSaving(false);
    setStep(4);
  };

  if (step===4) return (
    <Modal title="Inscription confirmée !" onClose={onClose}>
      <div style={{textAlign:"center",padding:"24px 0"}}>
        <div style={{fontSize:52}}>🎉</div>
        <p style={{color:"#6b7280",marginTop:16,lineHeight:1.6}}>Notre équipe va vous trouver le meilleur tuteur sous 24h.<br/>Vous serez contacté par WhatsApp ou e-mail.</p>
        <button onClick={onClose} style={{marginTop:24,padding:"12px 32px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:14,cursor:"pointer"}}>Fermer</button>
      </div>
    </Modal>
  );

  const screens = [
    <>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",marginBottom:16}}>Vos informations</p>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Votre nom complet" value={d.nom} onChange={v=>set("nom",v)} placeholder=""/>
        <SexeToggle value={d.sexe} onChange={v=>set("sexe",v)}/>
        <Inp label="E-mail" value={d.email} onChange={v=>set("email",v)} placeholder="" type="email"/>
        <Inp label="Téléphone (WhatsApp)" value={d.tel} onChange={v=>set("tel",v)} placeholder="+226 70 00 00 00" type="tel" filter="tel"/>
        <Inp label="Ville" value={d.ville} onChange={v=>set("ville",v)} placeholder=""/>
      </div>
    </>,
    <>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",marginBottom:16}}>Votre enfant</p>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Prénom de l'enfant" value={d.enfant} onChange={v=>set("enfant",v)} placeholder=""/>
        <Inp label="Âge de l'enfant (4–18 ans)" value={d.age} onChange={v=>set("age",v)} placeholder="Ex : 9" type="number" filter="number" min={4} max={18}/>
        <Sel label="Niveau scolaire" value={d.niveau} onChange={v=>set("niveau",v)} options={NIVEAUX}/>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>École fréquentée (optionnel)</label>
          <select style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:12,padding:"11px 16px",fontSize:13,background:"#fafafa",outline:"none"}}>
            <option>— Choisir une école partenaire —</option>
            {ecolesList.map(e=><option key={e.id||e.nom} value={e.nom}>{e.nom}{e.quartier ? " · " + e.quartier : ""}</option>)}
            <option>Autre école</option>
          </select>
          <p style={{fontSize:11,color:"#9ca3af",marginTop:5}}>Nos tuteurs connaissent les programmes de ces écoles.</p>
        </div>
      </div>
    </>,
    <>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",marginBottom:16}}>Les besoins de {d.enfant||"votre enfant"}</p>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Matières à renforcer</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {MATIERES.map(({label})=>(
              <Pill key={label} active={d.matieres.includes(label)} onClick={()=>tog(label)}>{label}</Pill>
            ))}
          </div>
        </div>
        <Sel label="Objectif principal" value={d.objectif} onChange={v=>set("objectif",v)}
          options={["Rattrapage scolaire","Préparation aux examens","Avance sur le programme","Soutien général"]}/>
        <Sel label="Fréquence souhaitée" value={d.frequence} onChange={v=>set("frequence",v)}
          options={["1 fois par semaine","2 fois par semaine","3 fois par semaine","Week-end uniquement"]}/>
      </div>
    </>,
    <>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",marginBottom:14}}>Récapitulatif</p>
      <div style={{background:"#f5f3ff",borderRadius:16,padding:18,display:"flex",flexDirection:"column",gap:10}}>
        {[["Parent",d.nom],["Contact",`${d.tel} · ${d.email}`],["Enfant",`${d.enfant}, ${d.age} ans`],["Niveau",d.niveau],["Matières",d.matieres.join(", ")],["Objectif",d.objectif],["Fréquence",d.frequence]]
          .map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#6b7280"}}>{k}</span><span style={{fontWeight:600,color:"#111827",textAlign:"right",maxWidth:"60%"}}>{v||"—"}</span></div>)}
      </div>
      <p style={{fontSize:11,color:"#9ca3af",marginTop:10}}>Notre équipe vous contactera sous 24h.</p>
    </>,
  ];

  return (
    <Modal title="Trouver un tuteur" sub="Dites-nous ce dont votre enfant a besoin." onClose={onClose}>
      <Steps labels={["Vous","Votre enfant","Besoins","Confirmation"]} current={step}/>
      {screens[step]}
      <div style={{display:"flex",gap:10,marginTop:20}}>
        {step>0 && <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:13,border:"1.5px solid #e5e7eb",borderRadius:12,background:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>← Retour</button>}
        <button disabled={!ok[step]||saving} onClick={step===3 ? envoyer : ()=>setStep(s=>s+1)}
          style={{flex:1,padding:13,border:"none",borderRadius:12,background:ok[step]&&!saving?"#4f46e5":"#e5e7eb",color:ok[step]&&!saving?"#fff":"#9ca3af",fontWeight:700,fontSize:14,cursor:ok[step]&&!saving?"pointer":"not-allowed",transition:"background .15s"}}>
          {saving?"Envoi en cours…":step===3?"Envoyer ma demande ✓":"Continuer →"}
        </button>
      </div>
    </Modal>
  );
}

// ─── INSCRIPTION TUTEUR ────────────────────────────────────────────────────────

function InscriptionTuteur({ onClose }) {
  const [step, setStep]           = useState(0);
  const [d, setD]                 = useState({ prenom:"", nom:"", sexe:"", email:"", password:"", tel:"", ville:"", matieres:[], niveaux:[], experience:"", diplome:"", jours:[], quartiersCouVerts:[], tousQuartiers:false, tarif:5000, enLigne:false });
  const [saving, setSaving]       = useState(false);
  const set = (k,v) => setD(p=>({...p,[k]:v}));
  const tog = (k,v) => set(k, d[k].includes(v)?d[k].filter(x=>x!==v):[...d[k],v]);

  // Charger SDK CinetPay dès l'ouverture du formulaire (pas seulement au step 4)
  useEffect(() => {
    if (document.getElementById("cp-script")) return;
    const s = document.createElement("script");
    s.id = "cp-script"; s.src = "https://cdn.cinetpay.com/seamless/main.js"; s.async = true;
    document.head.appendChild(s);
  }, []);

  const ok = [
    d.prenom&&d.nom&&d.sexe&&d.email&&d.password&&d.password.length>=6&&d.tel&&d.ville,
    d.matieres.length>0&&d.niveaux.length>0&&d.experience,
    d.jours.length>0&&(d.tousQuartiers||d.quartiersCouVerts.length>0),
    true, // récap
    true, // step 4 : écran "Soumettre ma candidature"
  ];

  const envoyer = async () => {
    setSaving(true);
    try {
      const pwdHash = d.password ? await hashPassword(d.password) : null;
      await ajouterTuteur({
        prenom:            d.prenom,
        nom:               d.nom,
        sexe:              d.sexe,
        email:             d.email,
        tel:               d.tel,
        password_hash:     pwdHash,
        subject:           d.matieres.join(", ") || "Non spécifié",
        price:             d.tarif,
        statut:            "En attente",
        bio:               [d.experience && `${d.experience} d'expérience`, d.diplome].filter(Boolean).join(". "),
        niveaux:           d.niveaux,
        availableDays:     d.jours,
        quartier:          d.ville || "",
        emoji:             d.sexe === "M" ? "👨‍🏫" : "👩‍🏫",
        quartiersCouVerts: d.tousQuartiers ? QUARTIERS : d.quartiersCouVerts,
        en_ligne:          d.enLigne,
      });
      // ── Email confirmation candidature tuteur ──
      if (d.email) {
        const tpl = emailTemplates.candidature_tuteur({ prenom: d.prenom, nom: d.nom, matieres: d.matieres.join(", "), tarif: d.tarif });
        sendEmail({ to: d.email, ...tpl });
      }
      setStep(5);
    } catch(e) {
      alert("Erreur lors de l'envoi : " + e.message);
    }
    setSaving(false);
  };


  if (step===5) return (
    <Modal title="Candidature envoyée !" onClose={onClose}>
      <div style={{textAlign:"center",padding:"24px 0"}}>
        <div style={{fontSize:52}}>🎉</div>
        <p style={{color:"#6b7280",marginTop:16,lineHeight:1.6}}>Paiement confirmé. Votre profil sera examiné par notre équipe.<br/>Réponse garantie sous 48h.</p>
        <button onClick={onClose} style={{marginTop:24,padding:"12px 32px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:14,cursor:"pointer"}}>Fermer</button>
      </div>
    </Modal>
  );

  const screens = [
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",margin:0}}>Votre profil</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Inp label="Prénom" value={d.prenom} onChange={v=>set("prenom",v)} placeholder=""/>
        <Inp label="Nom" value={d.nom} onChange={v=>set("nom",v)} placeholder=""/>
      </div>
      <SexeToggle value={d.sexe} onChange={v=>set("sexe",v)}/>
      <Inp label="E-mail" value={d.email} onChange={v=>set("email",v)} placeholder="" type="email"/>
      <Inp label="Mot de passe (min. 6 caractères)" value={d.password} onChange={v=>set("password",v)} placeholder="••••••••" type="password"/>
      <Inp label="Téléphone" value={d.tel} onChange={v=>set("tel",v)} placeholder="+226 70 00 00 00" type="tel" filter="tel"/>
      <Inp label="Ville" value={d.ville} onChange={v=>set("ville",v)} placeholder=""/>
    </div>,
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",margin:0}}>Vos compétences</p>
      <div>
        <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Matières</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{MATIERES.map(({label})=><Pill key={label} active={d.matieres.includes(label)} onClick={()=>tog("matieres",label)}>{label}</Pill>)}</div>
      </div>
      <div>
        <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Niveaux enseignés</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{NIVEAUX.map(n=><Pill key={n} active={d.niveaux.includes(n)} onClick={()=>tog("niveaux",n)}>{n}</Pill>)}</div>
      </div>
      <Inp label="Années d'expérience (0–50)" value={d.experience} onChange={v=>set("experience",v)} placeholder="Ex : 3" type="number" filter="number" min={0} max={50}/>
      <Inp label="Diplôme le plus élevé" value={d.diplome} onChange={v=>set("diplome",v)} placeholder="Master Sciences de l'éducation"/>
      <div>
        <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:12}}>💰 Tarif horaire souhaité</label>
        <div style={{background:"#f5f3ff",borderRadius:14,padding:"18px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:13,color:"#6b7280"}}>1 000 FCFA</span>
            <span style={{fontSize:22,fontWeight:900,color:"#4f46e5"}}>{d.tarif.toLocaleString("fr-FR")} FCFA<span style={{fontSize:13,fontWeight:500,color:"#6b7280"}}>/h</span></span>
            <span style={{fontSize:13,color:"#6b7280"}}>15 000 FCFA</span>
          </div>
          <input type="range" min={1000} max={15000} step={1000} value={d.tarif}
            onChange={e=>set("tarif", +e.target.value)}
            style={{width:"100%",accentColor:"#4f46e5",cursor:"pointer",height:6}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,flexWrap:"wrap",gap:6}}>
            {[1000,3000,5000,8000,10000,12000,15000].map(v=>(
              <button key={v} type="button" onClick={()=>set("tarif",v)}
                style={{padding:"4px 10px",borderRadius:999,border:`1.5px solid ${d.tarif===v?"#4f46e5":"#e5e7eb"}`,background:d.tarif===v?"#4f46e5":"#fff",color:d.tarif===v?"#fff":"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {(v/1000).toLocaleString("fr-FR")}k
              </button>
            ))}
          </div>
          {/* Indication tarif moyen */}
          <div style={{marginTop:14,padding:"10px 12px",background:"#fff",borderRadius:10,border:"1px dashed #ddd6fe",fontSize:12,color:"#4f46e5",lineHeight:1.6}}>
            <strong>💡 Bon à savoir :</strong> la majorité des tuteurs sur Brillance Académie facturent entre <strong>3 000 et 8 000 FCFA/h</strong> selon leur niveau. Les débutants commencent souvent à 2 500–4 000 FCFA. Un tarif juste = plus de réservations.
          </div>
        </div>
      </div>
    </div>,
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",margin:0}}>Vos disponibilités</p>
      <div>
        <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Jours disponibles</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{JOURS.map(j=><Pill key={j} active={d.jours.includes(j)} onClick={()=>tog("jours",j)}>{j}</Pill>)}</div>
      </div>
      <div>
        <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>📍 Quartiers couverts</label>
        <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <button onClick={()=>set("tousQuartiers",!d.tousQuartiers)}
            style={{padding:"8px 16px",borderRadius:999,border:`2px solid ${d.tousQuartiers?"#4f46e5":"#e5e7eb"}`,background:d.tousQuartiers?"#ede9fe":"#f9fafb",color:d.tousQuartiers?"#4f46e5":"#374151",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            {d.tousQuartiers?"✓ Tous les quartiers de Ouaga":"Tous les quartiers"}
          </button>
          <button onClick={()=>set("enLigne",!d.enLigne)}
            style={{padding:"8px 16px",borderRadius:999,border:`2px solid ${d.enLigne?"#0ea5e9":"#e5e7eb"}`,background:d.enLigne?"#e0f2fe":"#f9fafb",color:d.enLigne?"#0284c7":"#374151",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            {d.enLigne?"🌐 En ligne activé":"🌐 Disponible en ligne"}
          </button>
        </div>
        {!d.tousQuartiers && (
          <div style={{display:"flex",flexWrap:"wrap",gap:6,maxHeight:160,overflowY:"auto",padding:4}}>
            {QUARTIERS.map(q=>(
              <Pill key={q} active={d.quartiersCouVerts.includes(q)} onClick={()=>tog("quartiersCouVerts",q)}>{q}</Pill>
            ))}
          </div>
        )}
        {!d.tousQuartiers && d.quartiersCouVerts.length===0 && (
          <p style={{fontSize:11,color:"#ef4444",margin:"4px 0 0"}}>Sélectionnez au moins un quartier ou cochez "Tous les quartiers"</p>
        )}
      </div>
    </div>,
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",margin:0}}>Récapitulatif</p>
      <div style={{background:"#f5f3ff",borderRadius:16,padding:18,display:"flex",flexDirection:"column",gap:10}}>
        {[["Nom",`${d.prenom} ${d.nom}`],["Contact",d.email],["Ville",d.ville],["Matières",d.matieres.join(", ")],["Niveaux",d.niveaux.join(", ")],["Expérience",d.experience],["Tarif",`${d.tarif.toLocaleString("fr-FR")} FCFA/h`],["Jours",d.jours.join(", ")],["Quartiers",d.tousQuartiers?"Tous les quartiers de Ouagadougou":d.quartiersCouVerts.join(", ")]]
          .map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#6b7280"}}>{k}</span><span style={{fontWeight:600,color:"#111827",textAlign:"right",maxWidth:"60%"}}>{v||"—"}</span></div>)}
      </div>
      <p style={{fontSize:11,color:"#9ca3af"}}>Réponse sous 48h après examen de votre profil.</p>
    </div>,

    /* ── STEP 4 : CONFIRMATION ENVOI LIEN ── */
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{background:"#f5f3ff",borderRadius:16,padding:24,textAlign:"center"}}>
        <p style={{fontSize:40,margin:"0 0 12px"}}>📩</p>
        <p style={{fontSize:16,fontWeight:800,color:"#4f46e5",margin:"0 0 8px"}}>Presque terminé !</p>
        <p style={{fontSize:13,color:"#6b7280",margin:0,lineHeight:1.7}}>
          Cliquez sur <strong>"Soumettre ma candidature"</strong>. Votre dossier sera examiné sous <strong>48h</strong>. Un lien de paiement des frais d'inscription vous sera envoyé directement sur votre WhatsApp et par e-mail.
        </p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[
          "📋 Votre profil est complet et prêt à être soumis",
          "⏱️ Examen de votre dossier sous 48h par notre équipe",
          "💳 Frais d'inscription : 2 000 FCFA (à régler UNIQUEMENT après validation de votre profil)",
          "✅ Une fois payés, ces frais vous donnent un accès à vie à la plateforme",
          "🔒 Aucun prélèvement automatique — rien ne vous sera débité tant que vous ne payez pas manuellement",
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"center",background:"#f9fafb",borderRadius:10,padding:"10px 14px"}}>
            <span style={{fontSize:13,color:"#374151"}}>{s}</span>
          </div>
        ))}
      </div>
    </div>,
  ];

  return (
    <Modal title="Devenir tuteur" sub="Rejoignez notre réseau et aidez des enfants à progresser." onClose={onClose}>
      <Steps labels={["Profil","Compétences","Dispo.","Récap.","Envoi"]} current={step}/>
      {screens[step]}
      <div style={{display:"flex",gap:10,marginTop:20}}>
        {step>0 && step<5 && <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:13,border:"1.5px solid #e5e7eb",borderRadius:12,background:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>← Retour</button>}
        <button disabled={!ok[step]||saving} onClick={step===4 ? envoyer : ()=>setStep(s=>s+1)}
          style={{flex:1,padding:13,border:"none",borderRadius:12,background:ok[step]&&!saving?"#4f46e5":"#e5e7eb",color:ok[step]&&!saving?"#fff":"#9ca3af",fontWeight:700,fontSize:14,cursor:ok[step]&&!saving?"pointer":"not-allowed"}}>
          {saving?"Enregistrement…":step===4?"✅ Soumettre ma candidature":step===3?"Étape suivante →":"Continuer →"}
        </button>
      </div>
    </Modal>
  );
}

// ─── SITE PUBLIC ───────────────────────────────────────────────────────────────

// ─── PAGE PROFIL TUTEUR ───────────────────────────────────────────────────────
function PageTuteur({ tuteurId, goHome, goPayment }) {
  const [tuteur, setTuteur]       = useState(null);
  const [avisTuteur, setAvisTuteur] = useState([]);
  const [showInscription, setShowInscription] = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    // Cherche d'abord dans Supabase, sinon dans les données locales
    getTuteurs()
      .then(data => {
        const t = data.find(t => String(t.id) === String(tuteurId));
        if (t) setTuteur(t);
        else setTuteur(TUTEURS.find(t => String(t.id) === String(tuteurId)) || null);
        setLoading(false);
      })
      .catch(() => {
        setTuteur(TUTEURS.find(t => String(t.id) === String(tuteurId)) || null);
        setLoading(false);
      });
    getAvis()
      .then(data => setAvisTuteur(data.filter(a => a.type === "tuteur")))
      .catch(() => {});
  }, [tuteurId]);

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}>
      <p style={{color:"#9ca3af"}}>Chargement…</p>
    </div>
  );

  if (!tuteur) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",gap:16}}>
      <p style={{fontSize:48}}>😕</p>
      <p style={{color:"#374151",fontWeight:700,fontSize:18}}>Tuteur introuvable</p>
      <button onClick={goHome} style={{padding:"10px 28px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,cursor:"pointer"}}>← Retour</button>
    </div>
  );

  const essaiPrice = Math.round(tuteur.price * 0.8);

  return (
    <div style={{minHeight:"100vh",background:"#e8ddd0",backgroundImage:"repeating-linear-gradient(transparent,transparent 27px,rgba(180,160,130,0.18) 27px,rgba(180,160,130,0.18) 28px)",fontFamily:"'Inter',sans-serif"}}>

      {/* Navbar */}
      <nav style={{background:"#ebebE2",borderBottom:"1px solid #d4d4c8",padding:"0 40px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <button onClick={goHome} style={{background:"none",border:"none",fontWeight:900,fontSize:18,color:"#22c55e",cursor:"pointer"}}>🎓 Brillance Académie</button>
        <button onClick={goHome} style={{padding:"8px 20px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:13,cursor:"pointer"}}>← Tous les tuteurs</button>
      </nav>

      <div style={{maxWidth:820,margin:"0 auto",padding:"48px 24px"}}>

        {/* Carte principale */}
        <div style={{background:"#fff",borderRadius:24,padding:36,marginBottom:24,boxShadow:"0 4px 24px rgba(0,0,0,.07)"}}>
          <div style={{display:"flex",gap:24,alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{width:90,height:90,borderRadius:999,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,flexShrink:0}}>{tuteur.emoji||"👩‍🏫"}</div>
            <div style={{flex:1,minWidth:200}}>
              <h1 style={{fontSize:26,fontWeight:900,margin:"0 0 4px",color:"#111827"}}>{tuteur.prenom} {tuteur.nom}</h1>
              <p style={{fontSize:16,color:"#6366f1",fontWeight:700,margin:"0 0 10px"}}>{tuteur.subject}</p>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:14,color:"#6b7280"}}>
                <span>📍 {tuteur.quartier||"Ouagadougou"}</span>
                <span>🎓 {tuteur.sessions} séances réalisées</span>
                <span><Stars n={tuteur.rating}/></span>
              </div>
            </div>
            <div style={{textAlign:"center",background:"#f5f3ff",borderRadius:16,padding:"16px 24px",flexShrink:0}}>
              <p style={{fontSize:12,color:"#9ca3af",margin:"0 0 4px"}}>Tarif / heure</p>
              <p style={{fontSize:28,fontWeight:900,color:"#4f46e5",margin:"0 0 4px"}}>{fmt(tuteur.price)}</p>
              <p style={{fontSize:12,color:"#10b981",fontWeight:700,margin:0}}>1ère séance −20 % → {fmt(essaiPrice)}</p>
            </div>
          </div>

          {tuteur.bio && (
            <div style={{marginTop:24,padding:"16px 20px",background:"#f8fafc",borderRadius:14,borderLeft:"4px solid #6366f1"}}>
              <p style={{fontSize:14,color:"#374151",lineHeight:1.8,margin:0}}>"{tuteur.bio}"</p>
            </div>
          )}
        </div>

        {/* Infos détaillées */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
          <div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,.05)"}}>
            <p style={{fontWeight:700,fontSize:14,color:"#111827",margin:"0 0 12px"}}>📅 Disponibilités</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {(tuteur.availableDays||[]).map(j=>(
                <span key={j} style={{padding:"5px 12px",background:"#dcfce7",color:"#065f46",borderRadius:999,fontSize:13,fontWeight:600}}>{j}</span>
              ))}
              {!(tuteur.availableDays||[]).length && <span style={{color:"#9ca3af",fontSize:13}}>Non renseigné</span>}
            </div>
          </div>
          <div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,.05)"}}>
            <p style={{fontWeight:700,fontSize:14,color:"#111827",margin:"0 0 12px"}}>📚 Niveaux enseignés</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {(tuteur.niveaux||[]).map(n=>(
                <span key={n} style={{padding:"5px 12px",background:"#ede9fe",color:"#4f46e5",borderRadius:999,fontSize:13,fontWeight:600}}>{n}</span>
              ))}
              {!(tuteur.niveaux||[]).length && <span style={{color:"#9ca3af",fontSize:13}}>Non renseigné</span>}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{background:"#fff",borderRadius:20,padding:28,marginBottom:24,boxShadow:"0 4px 24px rgba(0,0,0,.07)",textAlign:"center"}}>
          <h2 style={{fontSize:20,fontWeight:800,margin:"0 0 8px",color:"#111827"}}>Prêt à commencer ?</h2>
          <p style={{color:"#6b7280",fontSize:14,margin:"0 0 20px"}}>Réservez directement ou inscrivez-vous pour trouver le tuteur idéal.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>goPayment({tuteur,jour:tuteur.availableDays?.[0]||"À définir",creneau:"À définir",enfant:"",niveau:"",parentNom:"",parentEmail:""})}
              style={{padding:"14px 32px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:15,cursor:"pointer"}}>
              📅 Réserver avec {tuteur.prenom} →
            </button>
            <button onClick={()=>setShowInscription(true)}
              style={{padding:"14px 32px",background:"#f0fdf4",color:"#16a34a",border:"2px solid #86efac",borderRadius:999,fontWeight:700,fontSize:15,cursor:"pointer"}}>
              👨‍👩‍👧 S'inscrire comme parent
            </button>
          </div>
        </div>

        {/* Avis */}
        {avisTuteur.length > 0 && (
          <div style={{background:"#fff",borderRadius:20,padding:28,boxShadow:"0 4px 24px rgba(0,0,0,.07)"}}>
            <h2 style={{fontSize:18,fontWeight:800,margin:"0 0 20px",color:"#111827"}}>⭐ Avis des familles</h2>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {avisTuteur.slice(0,4).map((a,i)=>(
                <div key={i} style={{padding:"16px",background:"#f8fafc",borderRadius:12}}>
                  <div style={{display:"flex",gap:2,marginBottom:6}}>{Array.from({length:a.note},(_,j)=><span key={j} style={{color:"#f59e0b"}}>★</span>)}</div>
                  <p style={{fontSize:14,color:"#374151",lineHeight:1.7,margin:"0 0 8px",fontStyle:"italic"}}>« {a.commentaire} »</p>
                  <p style={{fontSize:12,fontWeight:700,color:"#111827",margin:0}}>{a.auteur} · <span style={{color:"#9ca3af",fontWeight:400}}>{a.ville}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal inscription parent */}
      {showInscription && <InscriptionParent onClose={()=>setShowInscription(false)}/>}
    </div>
  );
}

function SitePublic({ goAdmin, goPayment, goEspaceParent, goEspaceTuteur }) {
  const [modal, setModal]   = useState(null);
  const [search, setSearch] = useState("");
  const [activeM, setActiveM] = useState(null);
  const [activeQ, setActiveQ] = useState(null);
  const [activeN, setActiveN] = useState(null);
  const [activeOnline, setActiveOnline] = useState(false);
  const [tab, setTab]       = useState("parents");
  const [bookStep, setBook] = useState(0);
  const [tuteur, setTuteur] = useState(null);
  const [jour, setJour]     = useState(null);
  const [creneau, setCreneau] = useState(null);
  const [duree, setDuree]     = useState(1); // nombre d'heures
  const [modeSeance, setModeSeance] = useState("domicile"); // "domicile" | "enligne"
  const [bi, setBi]         = useState({nom:"",sexe:"",email:"",password:"",enfant:"",niveau:""});
  const [bookDone, setBookDone] = useState(false);
  // identification parent
  const [emailQ, setEmailQ]       = useState("");
  const [emailLooking, setEmailLooking] = useState(false);
  const [parentConnu, setParentConnu]   = useState(null);  // null=pas encore cherché, true/false
  const [premiereSeance, setPremiereSeance] = useState(false);
  const [avis, setAvis]         = useState([]);
  const [showAvisForm, setShowAvisForm] = useState(false);
  const [avisForm, setAvisForm] = useState({ auteur:"", ville:"", commentaire:"", note:5, type:"parent" });
  const [avisSaving, setAvisSaving] = useState(false);
  const [avisEnvoye, setAvisEnvoye] = useState(false);
  const [tuteursList, setTuteursList]       = useState(TUTEURS);
  const [loadingTuteurs, setLoadingTuteurs] = useState(true);
  const [ecolesList, setEcolesList]         = useState(ECOLES_PARTENAIRES.map(n=>({nom:n,quartier:"",type:"École"})));

  useEffect(() => {
    getAvis().then(data => setAvis(data)).catch(() => {});
    getTuteurs()
      .then(data => { if (data && data.length > 0) setTuteursList(data); })
      .catch(() => {})
      .finally(() => setLoadingTuteurs(false));
    getEcoles().then(data => { if (data && data.length > 0) setEcolesList(data); }).catch(() => {});
    enregistrerVisite();
  }, []);

  const setBI = (k,v) => setBi(p=>({...p,[k]:v}));

  const filteredTuteurs = tuteursList.filter(t => {
    if (t.statut !== "Actif") return false;
    if (activeM && !(t.subject||"").split(/,\s*/).some(s => s.trim() === activeM)) return false;
    if (activeQ) {
      const qc = t.quartiersCouVerts || [];
      if (qc.length > 0 && !qc.includes(activeQ) && !qc.includes("Tous")) return false;
      // if qc is empty, fall back to legacy quartier field
      if (qc.length === 0 && t.quartier && t.quartier !== activeQ) return false;
    }
    if (activeN && !(t.niveaux||[]).includes(activeN)) return false;
    if (activeOnline && !t.en_ligne) return false;
    if (search && !t.prenom.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hasFilters = activeM || activeQ || activeN || activeOnline || search;

  const S = { // shared styles
    page:    { fontFamily:"'Inter',sans-serif", color:"#111827", background:"#e8ddd0", backgroundImage:"repeating-linear-gradient(transparent, transparent 27px, rgba(180,160,130,0.18) 27px, rgba(180,160,130,0.18) 28px)", margin:0 },
    nav:     { position:"sticky", top:0, zIndex:100, background:"#fff", borderBottom:"1px solid #e8ddd0", padding:"0 40px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" },
    navLink: { background:"none", border:"none", color:T.body, fontSize:15, fontWeight:600, cursor:"pointer", padding:"0 4px", fontFamily:"'Inter',sans-serif" },
    btn:     { padding:"11px 26px", borderRadius:999, border:"none", fontWeight:700, fontSize:14, cursor:"pointer" },
    section: { padding:"48px 40px", maxWidth:1100, margin:"0 auto" },
    label:   { fontSize:11, fontWeight:700, color:"#6366f1", textTransform:"uppercase", letterSpacing:2, display:"block", marginBottom:10 },
    h2:      { fontSize:36, fontWeight:800, color:"#111827", margin:"0 0 14px", lineHeight:1.2 },
    sub:     { fontSize:16, color:"#6b7280", lineHeight:1.6, maxWidth:560 },
    card:    { background:"#fff", border:"none", borderRadius:20, padding:24, display:"flex", flexDirection:"column", gap:10, boxShadow:"0 2px 16px rgba(0,0,0,0.07)" },
  };

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({behavior:"smooth"});

  return (
    <div style={S.page}>
      {/* ── CSS RESPONSIVE MOBILE ── */}
      <style>{`
        html { scroll-behavior: smooth; scroll-padding-top: 80px; }
        @media (max-width: 768px) {
          .ba-nav-links { display: none !important; }
          .ba-nav-btns  { gap: 6px !important; }
          .ba-nav-btns button { padding: 8px 12px !important; font-size: 12px !important; }
          .ba-hero      { padding: 48px 20px 36px !important; }
          .ba-hero h1   { font-size: 32px !important; letter-spacing: -0.5px !important; }
          .ba-hero p    { font-size: 14px !important; }
          .ba-search    { margin: 0 16px 24px !important; }
          .ba-filters   { padding: 12px 16px !important; }
          .ba-filters > div { flex-direction: column !important; align-items: stretch !important; }
          .ba-filters select { min-width: unset !important; width: 100% !important; }
          .ba-section   { padding: 48px 16px !important; }
          .ba-grid-2    { grid-template-columns: 1fr !important; }
          .ba-grid-3    { grid-template-columns: 1fr 1fr !important; }
          .ba-grid-4    { grid-template-columns: 1fr 1fr !important; }
          .ba-tutor-cards { grid-template-columns: 1fr !important; }
          .ba-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
          .ba-footer-brand { grid-column: 1 / -1 !important; }
          .ba-how-grid  { grid-template-columns: 1fr !important; }
          .ba-guarantee { padding: 24px 20px !important; flex-direction: column !important; }
          .ba-team-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .ba-grid-3    { grid-template-columns: 1fr !important; }
          .ba-footer-grid { grid-template-columns: 1fr !important; }
          .ba-team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {modal==="parent" && <InscriptionParent onClose={()=>setModal(null)} ecolesList={ecolesList}/>}
      {modal==="tuteur" && <InscriptionTuteur onClose={()=>setModal(null)}/>}

      {/* NAV */}
      <nav style={S.nav}>
        <span style={{fontSize:18,fontWeight:800,color:T.primary,letterSpacing:"-0.5px"}}>Brillance Académie</span>
        <div className="ba-nav-btns" style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={()=>scrollTo("how")} style={{...S.btn,background:"#fff",color:T.body,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"9px 18px",fontSize:13}}>À Propos</button>
          <button onClick={()=>setModal("tuteur")} style={{...S.btn,background:"#fff",color:T.body,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"9px 18px",fontSize:13}}>Devenir tuteur</button>
          <button onClick={goEspaceParent} style={{...S.btn,background:"#fff",color:T.body,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"9px 18px",fontSize:13}}>👤 Parents</button>
          <button onClick={goEspaceTuteur} style={{...S.btn,background:"#fff",color:T.body,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"9px 18px",fontSize:13}}>👨‍🏫 Tuteurs</button>
          <button onClick={()=>setModal("parent")} style={{...S.btn,background:T.primary,color:"#fff",fontWeight:700,border:`1.5px solid ${T.primary}`,borderRadius:10,padding:"9px 18px",fontSize:13}}>Chercher un tuteur</button>
          <button onClick={goAdmin} style={{...S.btn,background:T.ink,color:"#fff",fontSize:12,padding:"9px 14px",borderRadius:10}}>⚙</button>
        </div>
      </nav>

      {/* TICKER ÉCOLES PARTENAIRES */}
      <div style={{borderBottom:"1px solid rgba(0,0,0,0.06)",background:"rgba(255,255,255,0.7)",padding:"10px 0",overflow:"hidden"}}>
        <p style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:2,textAlign:"center",margin:"0 0 8px"}}>Établissements Partenaires</p>
        <style>{`
          @keyframes ticker { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
          .ticker-track { display:flex; width:max-content; animation:ticker 28s linear infinite; }
          .ticker-track:hover { animation-play-state:paused; }
        `}</style>
        <div style={{overflow:"hidden"}}>
          <div className="ticker-track">
            {[...ecolesList,...ecolesList].map((e,i)=>(
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#fff",border:"1px solid #e8ddd0",borderRadius:999,padding:"6px 16px",fontSize:12,color:"#374151",fontWeight:600,whiteSpace:"nowrap",margin:"0 8px",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                🏫 {e.nom}{e.quartier ? " · " + e.quartier : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FILTRES — dropdowns compacts */}
      <div id="matieres" className="ba-filters" style={{borderBottom:"1px solid #d4d4c8",padding:"14px 40px",background:"rgba(255,255,255,0.65)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",gap:12,flexWrap:"wrap"}}>

          {/* Matières */}
          <div style={{position:"relative"}}>
            <select value={activeM||""} onChange={e=>setActiveM(e.target.value||null)}
              style={{appearance:"none",WebkitAppearance:"none",padding:"10px 44px 10px 14px",borderRadius:10,border:`1.5px solid ${activeM?"#4f46e5":"#e5e7eb"}`,background:activeM?"#eef2ff":"#fff",color:activeM?"#4f46e5":"#374151",fontWeight:600,fontSize:13,cursor:"pointer",outline:"none",fontFamily:"'Inter',sans-serif",minWidth:150}}>
              <option value="">📚 Toutes les matières</option>
              {MATIERES.map(({label,emoji})=><option key={label} value={label}>{emoji} {label}</option>)}
            </select>
            <span style={{position:"absolute",right:0,top:0,bottom:0,width:32,display:"flex",alignItems:"center",justifyContent:"center",background:activeM?"#4f46e5":"#f0f0f0",borderLeft:`1px solid ${activeM?"#6366f1":"#d1d5db"}`,borderRadius:"0 8px 8px 0",pointerEvents:"none",fontSize:11,color:activeM?"#fff":"#6b7280"}}>▼</span>
          </div>

          {/* Quartiers */}
          <div style={{position:"relative"}}>
            <select value={activeQ||""} onChange={e=>setActiveQ(e.target.value||null)}
              style={{appearance:"none",WebkitAppearance:"none",padding:"10px 44px 10px 14px",borderRadius:10,border:`1.5px solid ${activeQ?"#4f46e5":"#e5e7eb"}`,background:activeQ?"#eef2ff":"#fff",color:activeQ?"#4f46e5":"#374151",fontWeight:600,fontSize:13,cursor:"pointer",outline:"none",fontFamily:"'Inter',sans-serif",minWidth:160}}>
              <option value="">📍 Tous les quartiers</option>
              {QUARTIERS.map(q=><option key={q} value={q}>{q}</option>)}
            </select>
            <span style={{position:"absolute",right:0,top:0,bottom:0,width:32,display:"flex",alignItems:"center",justifyContent:"center",background:activeQ?"#4f46e5":"#f0f0f0",borderLeft:`1px solid ${activeQ?"#6366f1":"#d1d5db"}`,borderRadius:"0 8px 8px 0",pointerEvents:"none",fontSize:11,color:activeQ?"#fff":"#6b7280"}}>▼</span>
          </div>

          {/* Niveaux */}
          <div style={{position:"relative"}}>
            <select value={activeN||""} onChange={e=>setActiveN(e.target.value||null)}
              style={{appearance:"none",WebkitAppearance:"none",padding:"10px 44px 10px 14px",borderRadius:10,border:`1.5px solid ${activeN?"#4f46e5":"#e5e7eb"}`,background:activeN?"#eef2ff":"#fff",color:activeN?"#4f46e5":"#374151",fontWeight:600,fontSize:13,cursor:"pointer",outline:"none",fontFamily:"'Inter',sans-serif",minWidth:140}}>
              <option value="">🎓 Tous les niveaux</option>
              {NIVEAUX.map(n=><option key={n} value={n}>{n}</option>)}
            </select>
            <span style={{position:"absolute",right:0,top:0,bottom:0,width:32,display:"flex",alignItems:"center",justifyContent:"center",background:activeN?"#4f46e5":"#f0f0f0",borderLeft:`1px solid ${activeN?"#6366f1":"#d1d5db"}`,borderRadius:"0 8px 8px 0",pointerEvents:"none",fontSize:11,color:activeN?"#fff":"#6b7280"}}>▼</span>
          </div>

          {/* Filtre En ligne */}
          <button onClick={()=>setActiveOnline(!activeOnline)}
            style={{padding:"10px 18px",borderRadius:10,border:`1.5px solid ${activeOnline?T.primary:T.border}`,background:activeOnline?T.primarySoft:"#fff",color:activeOnline?T.primary:T.body,fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6}}>
            🌐 {activeOnline?"En ligne ✓":"En ligne"}
          </button>

          {/* Badges filtres actifs + reset */}
          {hasFilters && (
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              {activeM && <span style={{background:T.primarySoft,color:T.primary,padding:"4px 10px",borderRadius:999,fontSize:12,fontWeight:600}}>✓ {activeM}</span>}
              {activeQ && <span style={{background:T.primarySoft,color:T.primary,padding:"4px 10px",borderRadius:999,fontSize:12,fontWeight:600}}>✓ {activeQ}</span>}
              {activeN && <span style={{background:T.primarySoft,color:T.primary,padding:"4px 10px",borderRadius:999,fontSize:12,fontWeight:600}}>✓ {activeN}</span>}
              {activeOnline && <span style={{background:T.primarySoft,color:T.primary,padding:"4px 10px",borderRadius:999,fontSize:12,fontWeight:600}}>🌐 En ligne</span>}
              <button onClick={()=>{setActiveM(null);setActiveQ(null);setActiveN(null);setActiveOnline(false);setSearch("");}}
                style={{background:"none",border:"none",color:"#ef4444",fontWeight:700,fontSize:12,cursor:"pointer",padding:"4px 8px"}}>
                ✕ Effacer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* HERO */}
      <div className="ba-hero" style={{textAlign:"center",padding:"90px 40px 32px",background:"rgba(255,255,255,0.55)"}}>
        <span style={{display:"inline-block",background:T.primarySoft,color:T.primary,fontSize:13,fontWeight:600,padding:"5px 16px",borderRadius:999,marginBottom:24}}>
          Tuteurs spécialisés · CP au 3ème
        </span>
        <h1 style={{fontSize:54,fontWeight:900,color:T.ink,lineHeight:1.1,maxWidth:640,margin:"0 auto 18px",letterSpacing:"-1.5px"}}>
          Trouvez le bon tuteur<br/>pour votre enfant
        </h1>
        <p style={{fontSize:17,color:T.muted,maxWidth:520,margin:"0 auto 40px",lineHeight:1.7}}>
          Chaque tuteur sur Brillance Académie est sélectionné pour son expérience avec les jeunes élèves — phonics, maths de base, lecture, et plus encore.
        </p>
        {/* Search bar */}
        <div style={{display:"flex",maxWidth:580,margin:"0 auto 28px",background:"#fff",borderRadius:999,border:"1.5px solid #e5e7eb",overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.07)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Matière, niveau ou nom du tuteur…"
            style={{flex:1,padding:"16px 24px",border:"none",fontSize:15,outline:"none",background:"transparent",color:"#111827"}}/>
          <button onClick={()=>scrollTo("tutors")} style={{padding:"0 28px",background:"#111827",color:"#fff",border:"none",fontWeight:700,fontSize:15,cursor:"pointer",borderRadius:"0 999px 999px 0"}}>
            Rechercher
          </button>
        </div>
        {/* Trust pills */}
        <div style={{display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap",marginBottom:18}}>
          {[["✓","Tuteurs vérifiés"],["✓","Certifiés élémentaire"],["✓","-20 % sur la 1ʳᵉ séance"]].map(([icon,txt])=>(
            <span key={txt} style={{fontSize:14,color:T.body,display:"flex",alignItems:"center",gap:6}}>
              <span style={{color:T.success,fontWeight:700}}>{icon}</span>{txt}
            </span>
          ))}
        </div>
        {/* Price indicator — transparence dès l'accueil */}
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:T.primarySoft,border:`1px solid ${T.primary}22`,borderRadius:999,padding:"8px 18px",fontSize:13,color:T.primary,fontWeight:600}}>
          <span style={{fontSize:15}}>💰</span>
          À partir de <strong style={{fontSize:15}}>2 500 F CFA</strong> la séance · Payez uniquement ce que vous utilisez
        </div>
      </div>

      {/* COMMENT ÇA MARCHE */}
      <div id="how" className="ba-section" style={{background:"rgba(255,255,255,0.6)",padding:"40px 40px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <span style={S.label}>Comment ça marche</span>
            <h2 style={S.h2}>De la recherche à la première séance<br/>en moins de 24h</h2>
            <p style={{...S.sub,margin:"0 auto"}}>Un processus simple, transparent, sans surprise.</p>
          </div>

          {/* Steps timeline — un seul accent indigo, icônes pour différencier */}
          <div className="ba-how-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:24,marginBottom:56}}>
            {[
              {n:"01",icon:"📝",t:"Décrivez les besoins de votre enfant",d:"Remplissez notre formulaire en 2 minutes : matière, niveau, quartier de Ouagadougou, disponibilités. Plus c'est précis, meilleur sera le match.",tag:"2 min"},
              {n:"02",icon:"🔍",t:"On sélectionne votre tuteur",d:"Notre équipe revoit les profils et sélectionne 1 à 3 tuteurs adaptés au niveau et au programme de votre école. Chaque tuteur est vérifié et certifié.",tag:"Sous 24h"},
              {n:"03",icon:"📅",t:"Vous choisissez le créneau",d:"On vous propose des créneaux disponibles selon votre quartier. Séances à domicile ou en ligne, selon votre préférence.",tag:"Flexible"},
              {n:"04",icon:"💳",t:"Paiement sécurisé à la séance",d:"Orange Money, Moov Money, Coris Money ou carte bancaire. Aucun abonnement, aucun engagement. La première séance d'essai est à −20 %.",tag:"Sans engagement"},
              {n:"05",icon:"📊",t:"Suivi & compte-rendu",d:"Après chaque séance, vous recevez un compte-rendu par WhatsApp : points travaillés, progrès, exercices recommandés.",tag:"Après chaque séance"},
              {n:"06",icon:"🏆",t:"Résultats garantis",d:"Si vous n'êtes pas satisfait après la première séance, nous vous remboursons intégralement. Zéro risque, satisfaction garantie.",tag:"Garantie 100 %"},
            ].map(({n,icon,t,d,tag})=>{
              const isFirst = n==="01";
              return (
              <div key={n}
                onClick={isFirst ? ()=>setModal("parent") : undefined}
                style={{background:T.cardBg,borderRadius:20,padding:28,display:"flex",gap:20,alignItems:"flex-start",border:`1.5px solid ${isFirst?T.primary:T.borderSoft}`,transition:"box-shadow .2s, transform .2s",cursor:isFirst?"pointer":"default",position:"relative"}}
                onMouseOver={e=>{e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.09)"; if(isFirst) e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseOut={e=>{e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none";}}>
                {isFirst && <span style={{position:"absolute",top:14,right:14,fontSize:11,fontWeight:700,background:T.primary,color:"#fff",padding:"3px 10px",borderRadius:999}}>→ Commencer ici</span>}
                <div style={{width:52,height:52,borderRadius:16,background:T.primarySoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:10,fontWeight:800,color:T.subtle,letterSpacing:2}}>{n}</span>
                    <span style={{fontSize:11,fontWeight:700,background:T.primarySoft,color:T.primary,padding:"2px 10px",borderRadius:999}}>{tag}</span>
                  </div>
                  <h3 style={{fontSize:16,fontWeight:800,color:T.ink,margin:"0 0 8px"}}>{t}</h3>
                  <p style={{fontSize:13,color:T.muted,lineHeight:1.7,margin:0}}>{d}</p>
                </div>
              </div>
              );
            })}
          </div>

          {/* Guarantee banner */}
          <div style={{background:"linear-gradient(135deg,#374151 0%,#4b5563 100%)",borderRadius:24,padding:"36px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,flexWrap:"wrap"}}>
            <div>
              <p style={{color:"#c4b5fd",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:2,margin:"0 0 8px"}}>Notre engagement</p>
              <h3 style={{fontSize:22,fontWeight:800,color:"#f9fafb",margin:"0 0 8px"}}>Première séance non satisfaisante ? On rembourse.</h3>
              <p style={{color:"#d1d5db",fontSize:14,margin:0}}>Aucun risque pour les familles. C'est ça, la confiance Brillance Académie.</p>
            </div>
            <button onClick={()=>setModal("parent")} style={{padding:"14px 32px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:15,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
              Démarrer gratuitement →
            </button>
          </div>
        </div>
      </div>

      {/* TUTEURS */}
      <div id="tutors" style={{...S.section}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <span style={S.label}>Notre équipe</span>
          <h2 style={{...S.h2,marginBottom:0}}>
            {loadingTuteurs ? "Chargement…" : `${filteredTuteurs.length} tuteur${filteredTuteurs.length>1?"s":""} disponible${filteredTuteurs.length>1?"s":""}`}
          </h2>
        </div>

        {loadingTuteurs && (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <div style={{display:"inline-block",width:40,height:40,border:"4px solid #ede9fe",borderTopColor:"#4f46e5",borderRadius:999,animation:"spin 0.8s linear infinite"}}/>
            <p style={{fontSize:14,color:"#9ca3af",marginTop:16}}>Chargement des tuteurs…</p>
          </div>
        )}

        {!loadingTuteurs && filteredTuteurs.length===0 && (
          <div style={{textAlign:"center",padding:"60px 0",color:"#9ca3af"}}>
            <p style={{fontSize:40}}>🔍</p>
            <p style={{fontSize:16,fontWeight:600,marginTop:12}}>Aucun tuteur trouvé</p>
            <p style={{fontSize:14,marginTop:4}}>Essayez un autre terme ou matière.</p>
            <button onClick={()=>{setActiveM(null);setActiveQ(null);setActiveN(null);setActiveOnline(false);setSearch("");}}
              style={{marginTop:16,padding:"10px 24px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:14,cursor:"pointer"}}>
              Effacer les filtres
            </button>
          </div>
        )}

        <div className="ba-tutor-cards" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {!loadingTuteurs && filteredTuteurs.map(t=>{
            const isNew = t.created_at && (Date.now() - new Date(t.created_at).getTime()) < 30*24*60*60*1000;
            return (
            <div key={t.id} style={{...S.card,padding:"14px 16px",transition:"box-shadow .2s",position:"relative",display:"flex",flexDirection:"column",gap:10}}
              onMouseOver={e=>e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,.09)"}
              onMouseOut={e=>e.currentTarget.style.boxShadow="none"}>

              {/* Ligne 1 : avatar + nom/matière + badges + prix */}
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:44,height:44,borderRadius:999,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{t.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <p style={{fontWeight:800,fontSize:15,margin:0,color:"#111827"}}>{t.prenom} {t.nom}</p>
                    {t.en_ligne && <span style={{background:"#0ea5e9",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:999}}>🌐 En ligne</span>}
                    {isNew && <span style={{background:"#16a34a",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:999}}>✨ Nouveau</span>}
                  </div>
                  <p style={{fontSize:12,color:"#6366f1",fontWeight:600,margin:"2px 0 0"}}>{t.subject}</p>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <p style={{fontWeight:900,fontSize:15,margin:0,color:"#111827"}}>{fmt(t.price)}</p>
                  <p style={{fontSize:10,color:"#9ca3af",margin:0}}>/heure</p>
                </div>
              </div>

              {/* Ligne 2 : bio condensée */}
              <p style={{fontSize:12,color:"#6b7280",margin:0,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{t.bio}</p>

              {/* Ligne 3 : étoiles + séances + jours + boutons */}
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <Stars n={t.rating}/>
                <span style={{fontSize:11,color:"#9ca3af"}}>{t.sessions} séances</span>
                <span style={{flex:1}}/>
                {t.availableDays.slice(0,2).map(j=><span key={j} style={{fontSize:10,background:"#f3f4f6",padding:"2px 7px",borderRadius:999,color:"#6b7280"}}>{j}</span>)}
              </div>

              {/* Ligne 4 : boutons compacts */}
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{ setHash("tuteur/"+t.id); setHashState("tuteur/"+t.id); }}
                  style={{flex:1,padding:"8px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"#f8fafc",fontWeight:700,fontSize:12,cursor:"pointer",color:"#374151"}}>
                  👤 Profil
                </button>
                <button onClick={()=>{setTuteur(t);setBook(parentConnu!==null?2:0);scrollTo("book");}}
                  style={{flex:2,padding:"8px",borderRadius:10,border:"none",background:"#4f46e5",fontWeight:700,fontSize:12,cursor:"pointer",color:"#fff"}}
                  onMouseOver={e=>e.currentTarget.style.background="#3730a3"}
                  onMouseOut={e=>e.currentTarget.style.background="#4f46e5"}>
                  📅 Réserver →
                </button>
              </div>
            </div>
          );})}
        </div>
      </div>


      {/* AVIS */}
      <div id="avis" style={{...S.section,background:"rgba(255,255,255,0.6)",maxWidth:"none",padding:"40px 40px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24,flexWrap:"wrap",gap:16}}>
            <div><span style={S.label}>Témoignages</span><h2 style={{...S.h2,marginBottom:0}}>Ce que disent les familles</h2></div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              {[["parents","👨‍👩‍👧 Parents"],["tuteurs","📖 Tuteurs"]].map(([v,l])=>(
                <Pill key={v} active={tab===v} onClick={()=>setTab(v)}>{l}</Pill>
              ))}
              <button onClick={()=>{ setAvisForm({auteur:"",ville:"",commentaire:"",note:5,type:tab}); setShowAvisForm(true); setAvisEnvoye(false); }}
                style={{padding:"8px 18px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                ✏️ Laisser un avis
              </button>
            </div>
          </div>

          {/* Avis réels depuis Supabase */}
          {avis.filter(a=>a.type===tab).length > 0 ? (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20}}>
              {avis.filter(a=>a.type===tab).map((a,i)=>(
                <div key={i} style={{...S.card,gap:12}}>
                  <div style={{display:"flex",gap:2}}>{Array.from({length:a.note},(_,j)=><span key={j} style={{color:"#f59e0b"}}>★</span>)}</div>
                  <p style={{fontSize:14,color:"#374151",lineHeight:1.7,margin:0,fontStyle:"italic"}}>« {a.commentaire} »</p>
                  <div><p style={{fontWeight:700,fontSize:14,margin:0,color:"#111827"}}>{a.auteur}</p><p style={{fontSize:12,color:"#9ca3af",margin:"2px 0 0"}}>{a.ville}</p></div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign:"center",padding:"48px 0",color:"#9ca3af"}}>
              <p style={{fontSize:16}}>Soyez le premier à laisser un avis ! 🌟</p>
            </div>
          )}

          {/* Formulaire avis */}
          {showAvisForm && (
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}>
              <div style={{background:"#fff",borderRadius:24,padding:36,width:"100%",maxWidth:460,position:"relative"}}>
                <button onClick={()=>setShowAvisForm(false)} style={{position:"absolute",top:16,right:18,background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button>
                {avisEnvoye ? (
                  <div style={{textAlign:"center",padding:"24px 0"}}>
                    <div style={{fontSize:52}}>🎉</div>
                    <h3 style={{fontWeight:800,fontSize:20,margin:"16px 0 8px"}}>Merci pour votre avis !</h3>
                    <p style={{color:"#6b7280",fontSize:14}}>Votre témoignage sera publié après validation par notre équipe.</p>
                    <button onClick={()=>setShowAvisForm(false)} style={{marginTop:20,padding:"10px 28px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,cursor:"pointer"}}>Fermer</button>
                  </div>
                ) : (
                  <>
                    <h2 style={{fontSize:18,fontWeight:800,margin:"0 0 20px"}}>✏️ Laisser un avis</h2>
                    <div style={{display:"flex",flexDirection:"column",gap:14}}>
                      <div style={{display:"flex",gap:8}}>
                        {[["parent","👨‍👩‍👧 Parent"],["tuteur","📖 Tuteur"]].map(([v,l])=>(
                          <button key={v} onClick={()=>setAvisForm(f=>({...f,type:v}))}
                            style={{flex:1,padding:"10px",border:`2px solid ${avisForm.type===v?"#4f46e5":"#e5e7eb"}`,borderRadius:10,background:avisForm.type===v?"#f5f3ff":"#fff",fontWeight:700,fontSize:13,cursor:"pointer",color:avisForm.type===v?"#4f46e5":"#374151"}}>
                            {l}
                          </button>
                        ))}
                      </div>
                      <Inp label="Votre nom" value={avisForm.auteur} onChange={v=>setAvisForm(f=>({...f,auteur:v}))} placeholder=""/>
                      <Inp label="Ville / Quartier" value={avisForm.ville} onChange={v=>setAvisForm(f=>({...f,ville:v}))} placeholder=""/>
                      <div>
                        <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Note</label>
                        <div style={{display:"flex",gap:6}}>
                          {[1,2,3,4,5].map(n=>(
                            <button key={n} onClick={()=>setAvisForm(f=>({...f,note:n}))}
                              style={{fontSize:28,background:"none",border:"none",cursor:"pointer",color:n<=avisForm.note?"#f59e0b":"#d1d5db",padding:0}}>★</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>Votre commentaire</label>
                        <textarea value={avisForm.commentaire} onChange={e=>setAvisForm(f=>({...f,commentaire:e.target.value}))}
                          rows={4} placeholder="Partagez votre expérience avec Brillance Académie…"
                          style={{width:"100%",padding:"12px 16px",border:"1.5px solid #e5e7eb",borderRadius:12,fontSize:14,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
                      </div>
                      <button disabled={!avisForm.auteur||!avisForm.commentaire||avisSaving}
                        onClick={async()=>{
                          setAvisSaving(true);
                          try {
                            await ajouterAvis(avisForm);
                            setAvisEnvoye(true);
                          } catch(e){ alert("Erreur : "+e.message); }
                          setAvisSaving(false);
                        }}
                        style={{padding:"13px",background:avisForm.auteur&&avisForm.commentaire?"#4f46e5":"#e5e7eb",color:avisForm.auteur&&avisForm.commentaire?"#fff":"#9ca3af",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:avisForm.auteur&&avisForm.commentaire?"pointer":"not-allowed"}}>
                        {avisSaving?"Envoi en cours…":"Envoyer mon avis →"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RÉSERVATION */}
      <div id="book" style={{...S.section,paddingTop:40}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <span style={S.label}>Réservation</span>
          <h2 style={S.h2}>Réservez une séance d'essai</h2>
          <p style={S.sub}>Première séance à −20 % pour tester sans engagement.</p>
        </div>

        <div style={{maxWidth:640,margin:"0 auto"}}>
          {/* Steps : 0=Compte, 1=Tuteur, 2=Créneau, 3=Infos(si nouveau), 4=Récap */}
          <Steps labels={["Compte","Tuteur","Créneau","Confirmation"]} current={Math.min(bookStep, 3)}/>

          {/* SUCCÈS */}
          {bookDone && (
            <div style={{textAlign:"center",padding:"48px 0"}}>
              <div style={{fontSize:56}}>🎉</div>
              <h3 style={{fontSize:24,fontWeight:800,color:"#111827",marginTop:20}}>Séance confirmée !</h3>
              <p style={{color:"#6b7280",marginTop:8}}>{tuteur?.prenom} {tuteur?.nom} · {jour} à {creneau}</p>
              <button onClick={()=>{setBook(0);setTuteur(null);setJour(null);setCreneau(null);setBookDone(false);setBi({nom:"",email:"",enfant:"",niveau:""});setEmailQ("");setParentConnu(null);setPremiereSeance(false);}}
                style={{marginTop:24,padding:"12px 32px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                Nouvelle réservation
              </button>
            </div>
          )}

          {/* ÉTAPE 0 — Identification parent */}
          {!bookDone && bookStep===0 && (
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <div style={{background:"#f0fdf4",borderRadius:16,padding:24,border:"1.5px solid #bbf7d0"}}>
                <p style={{fontWeight:800,fontSize:16,color:"#111827",margin:"0 0 6px"}}>👤 Avez-vous déjà un compte ?</p>
                <p style={{fontSize:13,color:"#6b7280",margin:"0 0 16px"}}>Entrez votre email pour retrouver votre profil et pré-remplir la réservation automatiquement.</p>
                <div style={{display:"flex",gap:10}}>
                  <input value={emailQ} onChange={e=>setEmailQ(e.target.value)} type="email" placeholder="votre@email.com"
                    style={{flex:1,padding:"11px 16px",border:"1.5px solid #d1fae5",borderRadius:12,fontSize:14,outline:"none",background:"#fff"}}
                    onKeyDown={async e=>{ if(e.key==="Enter" && emailQ) { /* same as button */ }}}/>
                  <button disabled={!emailQ||emailLooking} onClick={async()=>{
                    setEmailLooking(true);
                    try {
                      const p = await getParentByEmail(emailQ);
                      const nb = await getReservationCountByEmail(emailQ);
                      if (p) {
                        setBi({ nom: p.nom||"", email: p.email||emailQ, enfant: p.enfant||"", niveau: p.niveau||"" });
                        setParentConnu(true);
                        setPremiereSeance(nb === 0);
                      } else {
                        setBi(b=>({...b, email: emailQ}));
                        setParentConnu(false);
                        setPremiereSeance(true);  // nouveau = 1ère séance
                      }
                    } catch { setParentConnu(false); setPremiereSeance(true); }
                    setEmailLooking(false);
                  }} style={{padding:"11px 20px",background:emailQ?"#4f46e5":"#e5e7eb",color:emailQ?"#fff":"#9ca3af",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:emailQ?"pointer":"not-allowed",whiteSpace:"nowrap"}}>
                    {emailLooking ? "…" : "Vérifier →"}
                  </button>
                </div>

                {/* Résultat lookup */}
                {parentConnu === true && (
                  <div style={{marginTop:14,background:"#dcfce7",borderRadius:12,padding:"12px 16px",display:"flex",gap:12,alignItems:"center"}}>
                    <span style={{fontSize:24}}>✅</span>
                    <div>
                      <p style={{fontWeight:800,fontSize:14,color:"#065f46",margin:0}}>Compte retrouvé — {bi.nom}</p>
                      <p style={{fontSize:12,color:"#16a34a",margin:"3px 0 0"}}>
                        {premiereSeance ? "🌟 Première séance — réduction de 20 % appliquée !" : `Bon retour ! Vos informations sont pré-remplies.`}
                      </p>
                    </div>
                  </div>
                )}
                {parentConnu === false && (
                  <div style={{marginTop:14,background:"#fef3c7",borderRadius:12,padding:"12px 16px",display:"flex",gap:12,alignItems:"center"}}>
                    <span style={{fontSize:24}}>👋</span>
                    <div>
                      <p style={{fontWeight:800,fontSize:14,color:"#92400e",margin:0}}>Nouveau sur Brillance Académie</p>
                      <p style={{fontSize:12,color:"#b45309",margin:"3px 0 0"}}>🌟 Première séance — réduction de 20 % automatique !</p>
                    </div>
                  </div>
                )}
              </div>

              <p style={{textAlign:"center",fontSize:13,color:"#9ca3af",margin:0}}>— ou —</p>

              <button onClick={()=>{ setParentConnu(false); setPremiereSeance(true); setBook(1); }}
                style={{padding:"13px",border:"1.5px dashed #d1d5db",borderRadius:12,background:"transparent",fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>
                Continuer sans compte →
              </button>

              {parentConnu !== null && (
                <button onClick={()=>setBook(tuteur ? 2 : 1)}
                  style={{padding:"14px",border:"none",borderRadius:12,background:"#4f46e5",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>
                  {parentConnu ? "Continuer avec mon compte →" : "Continuer & créer mon compte →"}
                </button>
              )}
            </div>
          )}

          {/* ÉTAPE 1 — Choix du tuteur (si pas encore sélectionné) */}
          {!bookDone && bookStep===1 && !tuteur && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {tuteursList.filter(t=>t.statut==="Actif").map(t=>(
                  <button key={t.id} onClick={()=>{setTuteur(t);setBook(2);}}
                    style={{...S.card,cursor:"pointer",border:"2px solid #f3f4f6",textAlign:"left",background:"#f9fafb"}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <span style={{fontSize:28}}>{t.emoji}</span>
                      <div><p style={{fontWeight:700,margin:0,fontSize:14,color:"#111827"}}>{t.prenom} {t.nom}</p><p style={{fontSize:12,color:"#6366f1",margin:"2px 0 0"}}>{t.subject}</p></div>
                      <span style={{marginLeft:"auto",fontWeight:800,fontSize:15,color:"#111827"}}>{fmt(t.price)}/h</span>
                    </div>
                    <Stars n={t.rating}/>
                  </button>
                ))}
              </div>
              <button onClick={()=>setBook(0)} style={{padding:13,border:"1.5px solid #e5e7eb",borderRadius:12,background:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>← Retour</button>
            </div>
          )}

          {/* ÉTAPE 2 — Créneau (tuteur déjà choisi → sauter étape 1) */}
          {!bookDone && bookStep>=1 && bookStep<=2 && tuteur && (
            <div>
              <div style={{background:"#f5f3ff",borderRadius:16,padding:16,display:"flex",gap:14,alignItems:"center",marginBottom:24}}>
                <span style={{fontSize:32}}>{tuteur.emoji}</span>
                <div><p style={{fontWeight:700,margin:0,color:"#111827"}}>{tuteur.prenom} {tuteur.nom}</p><p style={{fontSize:13,color:"#6366f1",margin:"2px 0 0"}}>{tuteur.subject} · {fmt(tuteur.price)}/h</p></div>
                {premiereSeance && <span style={{marginLeft:"auto",background:"#dcfce7",color:"#065f46",fontSize:11,fontWeight:800,padding:"4px 10px",borderRadius:999,whiteSpace:"nowrap"}}>🌟 −20 %</span>}
              </div>
              {/* Mode séance */}
              <p style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:10}}>Mode de la séance</p>
              <div style={{display:"flex",gap:10,marginBottom:20}}>
                <button onClick={()=>setModeSeance("domicile")}
                  style={{flex:1,padding:"12px",borderRadius:12,border:`2px solid ${modeSeance==="domicile"?"#4f46e5":"#e5e7eb"}`,background:modeSeance==="domicile"?"#eef2ff":"#fff",fontWeight:700,fontSize:13,cursor:"pointer",color:modeSeance==="domicile"?"#4f46e5":"#374151"}}>
                  🏠 À domicile
                </button>
                {tuteur?.en_ligne && (
                  <button onClick={()=>setModeSeance("enligne")}
                    style={{flex:1,padding:"12px",borderRadius:12,border:`2px solid ${modeSeance==="enligne"?"#0ea5e9":"#e5e7eb"}`,background:modeSeance==="enligne"?"#e0f2fe":"#fff",fontWeight:700,fontSize:13,cursor:"pointer",color:modeSeance==="enligne"?"#0284c7":"#374151"}}>
                    🌐 En ligne (Jitsi)
                  </button>
                )}
              </div>
              <p style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:10}}>Choisissez un jour</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
                {(tuteur.availableDays||[]).map(d=><Pill key={d} active={jour===d} onClick={()=>setJour(d)}>{d}</Pill>)}
              </div>
              {jour && <>
                <p style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:10}}>Choisissez un créneau</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
                  {CRENEAUX.map(c=><Pill key={c} active={creneau===c} onClick={()=>setCreneau(c)}>{c}</Pill>)}
                </div>
                <p style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:10}}>Durée de la séance</p>
                <div style={{display:"flex",gap:8,marginBottom:20}}>
                  {[1,2,3].map(h=>(
                    <button key={h} onClick={()=>setDuree(h)}
                      style={{flex:1,padding:"12px 0",borderRadius:12,border:`2px solid ${duree===h?"#4f46e5":"#e5e7eb"}`,background:duree===h?"#ede9fe":"#fff",color:duree===h?"#4f46e5":"#374151",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                      {h}h — {((tuteur?.price||0)*h).toLocaleString("fr-FR")} FCFA
                    </button>
                  ))}
                </div>
              </>}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>{ setBook(0); setTuteur(null); setJour(null); setCreneau(null); }} style={{flex:1,padding:13,border:"1.5px solid #e5e7eb",borderRadius:12,background:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>← Retour</button>
                <button disabled={!jour||!creneau} onClick={()=>setBook(parentConnu ? 4 : 3)}
                  style={{flex:1,padding:13,border:"none",borderRadius:12,background:jour&&creneau?"#4f46e5":"#e5e7eb",color:jour&&creneau?"#fff":"#9ca3af",fontWeight:700,fontSize:14,cursor:jour&&creneau?"pointer":"not-allowed"}}>
                  {parentConnu ? "Confirmer →" : "Continuer →"}
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Infos parent (uniquement si NOUVEAU) */}
          {!bookDone && bookStep===3 && !parentConnu && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {premiereSeance ? (
                <div style={{background:"#fef3c7",borderRadius:12,padding:"10px 16px",fontSize:13,color:"#92400e",fontWeight:600}}>
                  🌟 Première séance — réduction −20 % appliquée automatiquement !
                </div>
              ) : (
                <div style={{background:"#e0e7ff",borderRadius:12,padding:"10px 16px",fontSize:13,color:"#3730a3",fontWeight:600}}>
                  👋 Bon retour ! Tarif standard appliqué (la réduction −20 % est réservée à la 1ère séance).
                </div>
              )}
              <Inp label="Votre nom (parent)" value={bi.nom} onChange={v=>setBI("nom",v)} placeholder=""/>
              <SexeToggle value={bi.sexe} onChange={v=>setBI("sexe",v)}/>
              <Inp label="E-mail" value={bi.email} onChange={v=>setBI("email",v)} placeholder="" type="email"
                onBlur={async (val)=>{
                  if (!val || !/.+@.+\..+/.test(val)) return;
                  try {
                    const nb = await getReservationCountByEmail(val);
                    setPremiereSeance(nb === 0);
                  } catch { /* keep current */ }
                }}/>
              <Inp label="Mot de passe (optionnel — min. 6 caractères)" value={bi.password} onChange={v=>setBI("password",v)} placeholder="Laissez vide pour passer" type="password"/>
              <p style={{fontSize:11,color:T.subtle,margin:"-8px 0 0"}}>💡 Optionnel. Si renseigné, vous pourrez suivre vos réservations dans votre espace parent. Sinon, vous recevrez tout par WhatsApp.</p>
              <Inp label="Prénom de l'enfant" value={bi.enfant} onChange={v=>setBI("enfant",v)} placeholder=""/>
              <Sel label="Niveau de l'enfant" value={bi.niveau} onChange={v=>setBI("niveau",v)} options={NIVEAUX}/>
              {(() => {
                const pwdOk = !bi.password || bi.password.length >= 6;
                const canGo = bi.nom && bi.sexe && bi.email && bi.enfant && pwdOk;
                return (
                  <div style={{display:"flex",gap:10,marginTop:4}}>
                    <button onClick={()=>setBook(2)} style={{flex:1,padding:13,border:`1.5px solid ${T.border}`,borderRadius:12,background:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",color:T.muted}}>← Retour</button>
                    <button disabled={!canGo} onClick={()=>setBook(4)}
                      style={{flex:1,padding:13,border:"none",borderRadius:12,background:canGo?T.primary:T.border,color:canGo?"#fff":T.subtle,fontWeight:700,fontSize:14,cursor:canGo?"pointer":"not-allowed"}}>
                      Confirmer →
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ÉTAPE 4 — Récapitulatif + paiement */}
          {!bookDone && bookStep===4 && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {premiereSeance && (
                <div style={{background:"linear-gradient(135deg,#d1fae5,#a7f3d0)",borderRadius:14,padding:"14px 18px",display:"flex",gap:12,alignItems:"center",border:"1.5px solid #6ee7b7"}}>
                  <span style={{fontSize:28}}>🌟</span>
                  <div>
                    <p style={{fontWeight:800,fontSize:14,color:"#065f46",margin:0}}>Première séance — Réduction −20 % appliquée !</p>
                    <p style={{fontSize:12,color:"#047857",margin:"3px 0 0"}}>Bienvenue dans la famille Brillance Académie.</p>
                  </div>
                </div>
              )}
              <div style={{background:"#f5f3ff",borderRadius:16,padding:18,display:"flex",flexDirection:"column",gap:10}}>
                {[["Tuteur",`${tuteur?.prenom} ${tuteur?.nom}`],["Matière",tuteur?.subject],["Jour",jour],["Créneau",creneau],["Durée",`${duree}h`],["Parent",bi.nom],["Enfant",`${bi.enfant}${bi.niveau?" · "+bi.niveau:""}`]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:14}}><span style={{color:"#6b7280"}}>{k}</span><span style={{fontWeight:600,color:"#111827"}}>{v}</span></div>
                ))}
                <div style={{borderTop:"1.5px solid #ddd6fe",paddingTop:12,marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,color:"#6b7280"}}>{premiereSeance ? `${duree}h d'essai (−20 %)` : `Tarif ${duree}h`}</span>
                  <div style={{textAlign:"right"}}>
                    {premiereSeance && <span style={{textDecoration:"line-through",color:"#9ca3af",fontSize:13,marginRight:8}}>{fmt((tuteur?.price||0)*duree)}</span>}
                    <span style={{fontWeight:800,color:"#4f46e5",fontSize:20}}>{fmt(premiereSeance ? Math.round((tuteur?.price||0)*duree*0.8) : (tuteur?.price||0)*duree)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={()=> {
                  const ref = "BA-" + Math.random().toString(36).slice(2,8).toUpperCase();
                  const jitsiLink = modeSeance==="enligne" ? `https://meet.jit.si/Brillance-${ref}` : null;
                  goPayment({ tuteur, jour, creneau, duree, enfant:bi.enfant, niveau:bi.niveau, parentNom:bi.nom, parentSexe:bi.sexe, parentEmail:bi.email, parentPassword:bi.password, modeSeance, jitsiLink, ref });
                }}
                style={{padding:"14px 0",border:"none",borderRadius:12,background:"#4f46e5",color:"#fff",fontWeight:700,fontSize:16,cursor:"pointer"}}>
                Procéder au paiement →
              </button>
              <button onClick={()=>setBook(parentConnu ? 2 : 3)} style={{padding:13,border:"1.5px solid #e5e7eb",borderRadius:12,background:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>← Retour</button>
            </div>
          )}
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{background:"linear-gradient(180deg,#374151 0%,#4b5563 60%,#6b7280 100%)",padding:"36px 40px 40px",textAlign:"center"}}>
        <h2 style={{fontSize:32,fontWeight:900,color:"#f9fafb",margin:"0 0 10px",letterSpacing:"-0.5px"}}>Prêt à commencer ?</h2>
        <p style={{color:"#d1d5db",fontSize:14,marginBottom:24}}>Première séance gratuite. Sans engagement.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button onClick={()=>setModal("parent")} style={{padding:"12px 30px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:15,cursor:"pointer"}}>
            Trouver un tuteur
          </button>
          <button onClick={()=>setModal("tuteur")} style={{padding:"12px 30px",background:"transparent",color:"#e5e7eb",border:"2px solid #6b7280",borderRadius:999,fontWeight:700,fontSize:15,cursor:"pointer"}}>
            Devenir tuteur
          </button>
        </div>
      </div>

      {/* BOUTON WHATSAPP FLOTTANT */}
      <a href="https://wa.me/22600000000?text=Bonjour%2C%20je%20souhaite%20trouver%20un%20tuteur%20pour%20mon%20enfant."
        target="_blank" rel="noopener noreferrer"
        style={{position:"fixed",bottom:28,right:28,zIndex:999,width:56,height:56,borderRadius:999,background:"#25d366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(37,211,102,0.5)",textDecoration:"none",transition:"transform .2s"}}
        onMouseOver={e=>e.currentTarget.style.transform="scale(1.1)"}
        onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}>
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* FOOTER */}
      <footer style={{background:"linear-gradient(180deg,#6b7280 0%,#9ca3af 25%,#d1d5db 55%,#f3f4f6 80%,#ffffff 100%)",padding:"40px 40px 24px",fontFamily:"'Inter',sans-serif"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>

          {/* Grille principale */}
          <div className="ba-footer-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:40,marginBottom:48}}>

            {/* Colonne marque */}
            <div className="ba-footer-brand">
              <p style={{fontWeight:900,fontSize:20,color:"#111827",margin:"0 0 10px"}}>🎓 Brillance Académie</p>
              <p style={{fontSize:13,color:"#4b5563",lineHeight:1.8,margin:"0 0 20px",maxWidth:280}}>
                La plateforme de tutorat de référence à Ouagadougou. Des tuteurs certifiés pour les élèves du CP au 3ème.
              </p>
              {/* WhatsApp CTA */}
              <a href="https://wa.me/22600000000" target="_blank" rel="noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:8,background:"#25d366",color:"#fff",padding:"10px 18px",borderRadius:999,fontSize:13,fontWeight:700,textDecoration:"none"}}>
                <span style={{fontSize:16}}>💬</span> WhatsApp nous
              </a>
            </div>

            {/* Liens tuteurs */}
            <div>
              <p style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:2,margin:"0 0 16px"}}>Tuteurs</p>
              {["Devenir tuteur","Comment ça marche","Tarification","FAQ"].map(l=>(
                <p key={l} style={{margin:"0 0 10px"}}>
                  <button style={{background:"none",border:"none",color:"#374151",fontSize:13,cursor:"pointer",padding:0,textAlign:"left",fontFamily:"'Inter',sans-serif"}}>{l}</button>
                </p>
              ))}
            </div>

            {/* Liens parents */}
            <div>
              <p style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:2,margin:"0 0 16px"}}>Parents</p>
              {["Trouver un tuteur","S'inscrire","Matières disponibles","Nos garanties"].map(l=>(
                <p key={l} style={{margin:"0 0 10px"}}>
                  <button style={{background:"none",border:"none",color:"#374151",fontSize:13,cursor:"pointer",padding:0,textAlign:"left",fontFamily:"'Inter',sans-serif"}}>{l}</button>
                </p>
              ))}
            </div>

            {/* Contact */}
            <div>
              <p style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:2,margin:"0 0 16px"}}>Contact</p>
              {[
                {icon:"📍",txt:"Ouagadougou, Burkina Faso"},
                {icon:"📱",txt:"+226 XX XX XX XX"},
                {icon:"✉️",txt:"contact@brillanceacademie.com"},
              ].map(({icon,txt})=>(
                <p key={txt} style={{margin:"0 0 12px",display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{fontSize:14,marginTop:1}}>{icon}</span>
                  <span style={{color:"#374151",fontSize:13,lineHeight:1.5}}>{txt}</span>
                </p>
              ))}
              {/* Réseaux sociaux */}
              <div style={{display:"flex",gap:10,marginTop:8}}>
                {[{icon:"📘",label:"Facebook"},
                  {icon:"📸",label:"Instagram"},
                  {icon:"🐦",label:"X / Twitter"},
                ].map(({icon,label})=>(
                  <button key={label} title={label}
                    style={{width:34,height:34,borderRadius:8,background:"#e5e7eb",border:"none",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Séparateur */}
          <div style={{borderTop:"1px solid #d1d5db",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <p style={{color:"#6b7280",fontSize:12,margin:0}}>© {new Date().getFullYear()} Brillance Académie · Tous droits réservés</p>
            <div style={{display:"flex",gap:20}}>
              {["Confidentialité","Conditions d'utilisation","Mentions légales"].map(l=>(
                <button key={l} style={{background:"none",border:"none",color:"#475569",fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{l}</button>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:8,height:8,borderRadius:999,background:"#22c55e",display:"inline-block"}}/>
              <span style={{color:"#475569",fontSize:12}}>Plateforme en ligne · Ouagadougou</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── MINI CHART ───────────────────────────────────────────────────────────────

function MiniBarChart({ data, barColor="#4f46e5", accentColor="#6366f1" }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const W = 560; const H = 130; const BAR_W = 34; const GAP = (W - data.length * BAR_W) / (data.length + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H + 36}`} style={{width:"100%",overflow:"visible"}}>
      {data.map((d, i) => {
        const bh   = Math.round((d.v / max) * H);
        const x    = GAP + i * (BAR_W + GAP);
        const isHi = d.highlight;
        return (
          <g key={i}>
            <rect x={x} y={H - bh} width={BAR_W} height={bh} rx={5}
              fill={isHi ? accentColor : barColor} opacity={isHi ? 1 : 0.35}/>
            {isHi && (
              <text x={x + BAR_W/2} y={H - bh - 7} textAnchor="middle"
                fontSize="10" fill={accentColor} fontWeight="700">
                {(d.v/1000).toFixed(0)}k
              </text>
            )}
            <text x={x + BAR_W/2} y={H + 18} textAnchor="middle"
              fontSize="10" fill="#9ca3af">{d.l}</text>
          </g>
        );
      })}
      <line x1={0} y1={H} x2={W} y2={H} stroke="#f1f5f9" strokeWidth="1"/>
    </svg>
  );
}

const REVENUE_DATA = [
  {l:"Oct",v:820000},{l:"Nov",v:940000},{l:"Déc",v:1150000},{l:"Jan",v:1020000},
  {l:"Fév",v:1280000},{l:"Mar",v:1540000,highlight:true},
];

// ─── ADMIN ────────────────────────────────────────────────────────────────────

function Admin({ goHome }) {
  const [page, setPage]             = useState("dashboard");
  const [parents, setParents]       = useState(PARENTS_INIT);
  const [tuteurs, setTuteurs]       = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tousAvis, setTousAvis]         = useState([]);
  const [ecolesAdmin, setEcolesAdmin]   = useState([]);
  const [loadingT, setLoadingT]     = useState(true);
  const [visites, setVisites]       = useState({ total:0, aujourd_hui:0, cette_semaine:0, ce_mois:0 });
  const [search, setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setET]    = useState(null);
  const [form, setForm]        = useState({});
  const [crModal, setCrModal]  = useState(null);
  const [crData, setCrData]    = useState({ points:"", progres:"", exercices:"" });
  const [refQ, setRefQ]        = useState("");
  const [refRes, setRefRes]    = useState(null);
  const [refErr, setRefErr]    = useState("");
  const [refLoading, setRefLoading] = useState(false);
  const [parentFilter, setParentFilter] = useState("all"); // "all" | "demande" | "reservation"
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  // Emails de parents qui ont au moins une réservation directe
  const reservedEmails = useMemo(() => {
    const s = new Set();
    reservations.forEach(r => { if (r.parent_email) s.add(r.parent_email.toLowerCase().trim()); });
    return s;
  }, [reservations]);
  const parentType = (p) => (p.email && reservedEmails.has(p.email.toLowerCase().trim())) ? "reservation" : "demande";

  // Charger tuteurs, parents et réservations depuis Supabase
  useEffect(() => {
    getTousTuteurs()
      .then(data => { setTuteurs(data); setLoadingT(false); })
      .catch(() => { setTuteurs(TUTEURS); setLoadingT(false); });
    getParents()
      .then(data => { if(data?.length) setParents(data); })
      .catch(() => {});
    getReservations()
      .then(data => setReservations(data))
      .catch(() => {});
    getTousAvis()
      .then(data => setTousAvis(data))
      .catch(() => {});
    getEcoles()
      .then(data => setEcolesAdmin(data))
      .catch(() => {});
    getVisiteStats()
      .then(stats => setVisites(stats))
      .catch(() => {});
  }, []);

  // Email de confirmation via le client mail
  const envoyerEmail = (email, nom, type) => {
    const sujet = type === "tuteur"
      ? "Bienvenue dans l'équipe Brillance Académie !"
      : "Votre inscription est confirmée — Brillance Académie";
    const corps = type === "tuteur"
      ? `Bonjour ${nom},\n\nVotre candidature en tant que tuteur a été acceptée par Brillance Académie. Bienvenue dans l'équipe !\n\nNous vous contacterons très prochainement pour les prochaines étapes.\n\nCordialement,\nL'équipe Brillance Académie\nbrillanceacademie.com`
      : `Bonjour ${nom},\n\nVotre inscription sur Brillance Académie est confirmée. Nous allons vous trouver le meilleur tuteur pour votre enfant dans les 24h.\n\nN'hésitez pas à nous contacter pour toute question.\n\nCordialement,\nL'équipe Brillance Académie\nbrillanceacademie.com`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`);
  };

  const handleAjouterTuteur = async () => {
    try {
      const data = await ajouterTuteur({ ...form, prenom: form.name || form.prenom, nom: "" });
      setTuteurs(t => [...t, data]);
      setShowForm(false);
    } catch(e) { alert("Erreur Supabase : " + e.message); }
  };

  const handleModifierTuteur = async () => {
    try {
      await modifierTuteur(editTarget.id, form);
      setTuteurs(t => t.map(x => x.id === editTarget.id ? { ...x, ...form, prenom: form.name || form.prenom } : x));
      setShowForm(false);
    } catch(e) { alert("Erreur Supabase : " + e.message); }
  };

  const handleSupprimerTuteur = async (id) => {
    try {
      await supprimerTuteur(id);
      setTuteurs(tt => tt.filter(x => x.id !== id));
    } catch(e) { alert("Erreur Supabase : " + e.message); }
  };

  const S = {
    sidebar: {width:220,background:"#0f172a",minHeight:"100vh",padding:"28px 16px",display:"flex",flexDirection:"column",gap:4,flexShrink:0},
    sLink:   (active) => ({display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,border:"none",background:active?"#1e293b":"transparent",color:active?"#fff":"#64748b",fontWeight:600,fontSize:14,cursor:"pointer",textAlign:"left",width:"100%",transition:"all .15s"}),
    main:    {flex:1,background:"#f8fafc",padding:36,overflowY:"auto"},
    card:    {background:"#fff",borderRadius:16,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.06)"},
    th:      {padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #f1f5f9"},
    td:      {padding:"14px 16px",borderBottom:"1px solid #f8fafc",fontSize:14,color:"#374151"},
  };

  const MENU = [
    {id:"dashboard",    icon:"📊",label:"Tableau de bord"},
    {id:"reservations", icon:"📅",label:"Réservations"},
    {id:"parents",      icon:"👨‍👩‍👧",label:"Parents"},
    {id:"tuteurs",      icon:"📖",label:"Tuteurs"},
    {id:"avis",         icon:"⭐",label:"Avis"},
    {id:"ecoles",       icon:"🏫",label:"Écoles partenaires"},
  ];

  const lookup = async () => {
    if (!refQ.trim()) return;
    setRefLoading(true); setRefErr(""); setRefRes(null);
    try {
      const data = await getReservationByRef(refQ.trim());
      setRefRes(data);
    } catch(e) { setRefErr("Référence introuvable."); }
    setRefLoading(false);
  };

  const openAdd = (defaults) => { setET(null); setForm(defaults); setShowForm(true); };
  const openEdit = (row) => { setET(row); setForm({...row}); setShowForm(true); };

  const exportCSV = (rows, cols, filename) => {
    const header = cols.map(c=>c.label).join(",");
    const lines  = rows.map(r => cols.map(c => {
      const v = String(r[c.key] ?? "").replace(/"/g,'""');
      return `"${v}"`;
    }).join(","));
    const blob = new Blob(["\uFEFF" + [header,...lines].join("\n")], {type:"text/csv;charset=utf-8;"});
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), {href:url, download:filename});
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Inter',sans-serif"}}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{marginBottom:28,paddingLeft:14}}>
          <p style={{fontWeight:800,fontSize:16,color:"#fff",margin:0}}>🎓 Brillance</p>
          <p style={{fontSize:11,color:"#475569",marginTop:2}}>Administration</p>
          <button onClick={goHome} style={{marginTop:8,fontSize:11,color:"#94a3b8",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
            🌐 Voir le site
          </button>
        </div>
        {MENU.map(({id,icon,label})=>(
          <button key={id} onClick={()=>setPage(id)} style={S.sLink(page===id)}>
            <span>{icon}</span>{label}
          </button>
        ))}
        <div style={{flex:1}}/>
      </div>

      {/* Main */}
      <div style={S.main}>

        {/* DASHBOARD */}
        {page==="dashboard" && (
          <div>
            <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:"0 0 28px"}}>Tableau de bord</h1>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
              {(()=>{
                const confirmed = reservations.filter(r=>r.statut==="confirmée");
                const now = new Date();
                const thisMonth = confirmed.filter(r=>{
                  const d = new Date(r.created_at||r.date||0);
                  return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
                });
                const revenus = confirmed.reduce((s,r)=>s+(r.montant||0),0);
                return [{l:"Parents inscrits",v:parents.length,icon:"👨‍👩‍👧",c:"#ede9fe"},{l:"Tuteurs actifs",v:tuteurs.filter(t=>t.statut==="Actif").length,icon:"📖",c:"#dcfce7"},{l:"Séances ce mois",v:thisMonth.length||confirmed.length,icon:"📅",c:"#fef3c7"},{l:"Revenus totaux",v:revenus>0?revenus.toLocaleString("fr-FR")+" FCFA":"—",icon:"💰",c:"#fee2e2"}];
              })().map(({l,v,icon,c})=>(
                <div key={l} style={{...S.card,background:c,boxShadow:"none"}}>
                  <p style={{fontSize:24,margin:"0 0 8px"}}>{icon}</p>
                  <p style={{fontSize:32,fontWeight:900,margin:"0 0 4px",color:"#111827"}}>{v}</p>
                  <p style={{fontSize:13,color:"#6b7280",margin:0}}>{l}</p>
                </div>
              ))}
            </div>
            {/* Visiteurs */}
            <div style={{...S.card,marginBottom:16,background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div>
                  <p style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:2,margin:0}}>Trafic du site</p>
                  <p style={{fontSize:22,fontWeight:900,color:"#fff",margin:"4px 0 0"}}>{visites.total.toLocaleString("fr-FR")} visiteurs</p>
                </div>
                <span style={{fontSize:32}}>📊</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[
                  {l:"Aujourd'hui",   v:visites.aujourd_hui,  c:"#22d3ee"},
                  {l:"Cette semaine", v:visites.cette_semaine, c:"#a78bfa"},
                  {l:"Ce mois",       v:visites.ce_mois,       c:"#34d399"},
                ].map(({l,v,c})=>(
                  <div key={l} style={{background:"rgba(255,255,255,0.05)",borderRadius:12,padding:"12px 16px"}}>
                    <p style={{fontSize:24,fontWeight:900,color:c,margin:0}}>{v}</p>
                    <p style={{fontSize:12,color:"#94a3b8",margin:"4px 0 0"}}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lookup référence */}
            <div style={{...S.card,marginBottom:16}}>
              <p style={{fontSize:13,fontWeight:700,color:"#374151",margin:"0 0 10px"}}>🔍 Lookup par référence</p>
              <div style={{display:"flex",gap:8,marginBottom:refRes||refErr?12:0}}>
                <input value={refQ} onChange={e=>setRefQ(e.target.value.toUpperCase())}
                  onKeyDown={e=>e.key==="Enter"&&lookup()}
                  placeholder="BA-XXXXXX"
                  style={{flex:1,padding:"9px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,outline:"none",fontFamily:"monospace",letterSpacing:1}}/>
                <button onClick={lookup} disabled={refLoading}
                  style={{padding:"9px 20px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  {refLoading?"…":"Chercher"}
                </button>
              </div>
              {refErr && <p style={{fontSize:13,color:"#ef4444",margin:0}}>{refErr}</p>}
              {refRes && (
                <div style={{background:"#f8fafc",borderRadius:12,padding:14,display:"flex",flexDirection:"column",gap:6}}>
                  {[
                    ["📋 Référence", refRes.reference],
                    ["👩‍🏫 Tuteur",   `${refRes.tuteur_nom||""} — ${refRes.tuteur_matiere||""}`],
                    ["📱 Tel tuteur", refRes.tuteur_tel||"—"],
                    ["👨‍👩‍👧 Parent",   refRes.parent_nom],
                    ["📧 Email",      refRes.parent_email],
                    ["📱 Tel parent", refRes.parent_tel||"—"],
                    ["📅 Séance",     `${refRes.jour} à ${refRes.creneau}`],
                    ["👧 Élève",      `${refRes.enfant} · ${refRes.niveau}`],
                    ["💰 Montant",    refRes.montant ? refRes.montant.toLocaleString("fr-FR")+" FCFA" : "—"],
                    ["✅ Statut",     refRes.statut],
                  ].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,borderBottom:"1px solid #f1f5f9",paddingBottom:4}}>
                      <span style={{color:"#6b7280",flexShrink:0}}>{k}</span>
                      <span style={{fontWeight:600,color:"#111827",textAlign:"right",marginLeft:12}}>{v||"—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revenue chart */}
            <div style={{...S.card,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div>
                  <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 2px",color:"#111827"}}>Revenus mensuels</h2>
                  <p style={{fontSize:12,color:"#9ca3af",margin:0}}>6 derniers mois · FCFA</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:22,fontWeight:900,color:"#4f46e5",margin:0}}>1 540 000</p>
                  <p style={{fontSize:12,color:"#10b981",margin:0,fontWeight:600}}>▲ +20 % vs mois dernier</p>
                </div>
              </div>
              <MiniBarChart data={REVENUE_DATA}/>
            </div>

            <div style={S.card}>
              <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 16px",color:"#111827"}}>Activité récente</h2>
              {[
                {dot:"#10b981",msg:"Réservation confirmée",detail:"Moussa (CM1) × Mme Claire B. · Mercredi 15h00",time:"Il y a 8 min"},
                {dot:"#6366f1",msg:"Nouvel inscrit parent",detail:"Ndéye Faye · enfant Lamine, CM2",time:"Il y a 45 min"},
                {dot:"#3b82f6",msg:"Paiement Wave reçu",detail:"Ibrahima Sow · 27 500 FCFA",time:"Il y a 2h"},
                {dot:"#f59e0b",msg:"Candidature tuteur",detail:"Mme Amara N. · Arts & Musique",time:"Il y a 3h"},
                {dot:"#10b981",msg:"Séance complétée",detail:"M. Daniel K. × Aïssatou (CP)",time:"Il y a 5h"},
              ].map((a,i)=>(
                <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",padding:"10px 0",borderBottom:i<4?"1px solid #f8fafc":"none"}}>
                  <div style={{width:8,height:8,borderRadius:999,background:a.dot,marginTop:6,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:600,fontSize:14,margin:0,color:"#111827"}}>{a.msg}</p>
                    <p style={{fontSize:12,color:"#9ca3af",margin:"2px 0 0"}}>{a.detail}</p>
                  </div>
                  <span style={{fontSize:12,color:"#9ca3af",flexShrink:0}}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RÉSERVATIONS */}
        {page==="reservations" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
              <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:0}}>Réservations ({reservations.length})</h1>
              <button onClick={()=>exportCSV(reservations.map(r=>({
                ...r,
                date_recue: r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : "",
                heure_recue: r.created_at ? new Date(r.created_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : "",
                heures_ecoulees: r.created_at ? Math.round((Date.now()-new Date(r.created_at).getTime())/3600000) : "",
              })),[{label:"Référence",key:"paiement_reference"},{label:"Parent",key:"parent_nom"},{label:"Email",key:"parent_email"},{label:"Enfant",key:"enfant"},{label:"Niveau",key:"niveau"},{label:"Tuteur",key:"tuteur_nom"},{label:"Jour",key:"jour"},{label:"Créneau",key:"creneau"},{label:"Montant",key:"montant"},{label:"Statut",key:"statut"},{label:"Date reçue",key:"date_recue"},{label:"Heure reçue",key:"heure_recue"},{label:"Heures écoulées",key:"heures_ecoulees"}],"reservations.csv")}
                style={{padding:"10px 20px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                ⬇ Exporter CSV
              </button>
            </div>
            <div style={S.card}>
              {reservations.length === 0 ? (
                <p style={{textAlign:"center",color:"#9ca3af",padding:"40px 0"}}>Aucune réservation pour l'instant.</p>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr>
                      {["Référence","Parent","Enfant","Jour · Créneau","Montant","Statut","Reçue · SLA 24h","Action"].map(h=>(
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(r=>(
                      <tr key={r.id}>
                        <td style={S.td}><span style={{fontFamily:"monospace",fontSize:12,background:"#f1f5f9",padding:"2px 8px",borderRadius:6}}>{r.paiement_reference||"—"}</span></td>
                        <td style={S.td}><div style={{fontWeight:600}}>{r.parent_nom}</div><div style={{fontSize:12,color:"#9ca3af"}}>{r.parent_email}</div></td>
                        <td style={S.td}>{r.enfant} · {r.niveau}</td>
                        <td style={S.td}>{r.jour} · {r.creneau}</td>
                        <td style={S.td}><strong>{r.montant?.toLocaleString("fr-FR")} FCFA</strong></td>
                        <td style={S.td}>
                          <span style={{
                            padding:"3px 10px",borderRadius:999,fontSize:12,fontWeight:700,
                            background: r.statut==="confirmée"?"#dcfce7":r.statut==="en_attente"?"#fef3c7":"#fee2e2",
                            color:      r.statut==="confirmée"?"#065f46":r.statut==="en_attente"?"#92400e":"#991b1b",
                          }}>{r.statut}</span>
                        </td>
                        <td style={{...S.td,fontSize:12}}>
                          {r.created_at ? (() => {
                            const d = new Date(r.created_at);
                            const h = (Date.now() - d.getTime()) / 3600000;
                            const pending = r.statut === "en_attente";
                            const bg = !pending ? "#f1f5f9" : h < 12 ? "#dcfce7" : h < 24 ? "#fef3c7" : "#fee2e2";
                            const fg = !pending ? "#64748b" : h < 12 ? "#065f46" : h < 24 ? "#92400e" : "#991b1b";
                            const label = !pending ? "✓ traitée" : h < 1 ? `il y a ${Math.round(h*60)} min` : h < 24 ? `il y a ${Math.floor(h)}h` : `⚠ ${Math.floor(h)}h (SLA dépassé)`;
                            return (
                              <div>
                                <div style={{color:"#111827",fontWeight:600}}>{d.toLocaleDateString("fr-FR")}</div>
                                <div style={{color:"#6b7280",fontSize:11}}>{d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
                                <div style={{display:"inline-block",marginTop:4,padding:"2px 8px",borderRadius:999,fontSize:10,fontWeight:700,background:bg,color:fg}}>{label}</div>
                              </div>
                            );
                          })() : <span style={{color:"#9ca3af"}}>—</span>}
                        </td>
                        <td style={S.td}>
                          <div style={{display:"flex",flexDirection:"column",gap:4}}>
                            {r.statut==="en_attente" && (
                              <button onClick={async()=>{
                                await changerStatutReservation(r.id,"confirmée");
                                setReservations(rs=>rs.map(x=>x.id===r.id?{...x,statut:"confirmée"}:x));
                              }} style={{padding:"4px 12px",background:"#dcfce7",color:"#065f46",border:"1px solid #86efac",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                                ✓ Confirmer
                              </button>
                            )}
                            {r.statut==="confirmée" && (
                              <>
                                <button onClick={()=>{ setCrModal(r); setCrData({points:"",progres:"",exercices:""}); }}
                                  style={{padding:"4px 12px",background:"#dbeafe",color:"#1d4ed8",border:"1px solid #93c5fd",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                                  📋 Compte-rendu
                                </button>
                                <button onClick={async()=>{
                                  await changerStatutReservation(r.id,"annulée");
                                  setReservations(rs=>rs.map(x=>x.id===r.id?{...x,statut:"annulée"}:x));
                                }} style={{padding:"4px 12px",background:"#fee2e2",color:"#991b1b",border:"1px solid #fca5a5",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                                  ✗ Annuler
                                </button>
                              </>
                            )}
                            <button onClick={async()=>{
                              const ref = r.ref || `#${r.id}`;
                              if(!confirm(`⚠️ Supprimer définitivement la réservation ${ref} ?\n\nCette action est irréversible.`)) return;
                              try {
                                await supprimerReservation(r.id);
                                setReservations(rs=>rs.filter(x=>x.id!==r.id));
                              } catch(e) {
                                alert("Erreur lors de la suppression : " + (e.message || e));
                              }
                            }} style={{padding:"4px 12px",background:"#fff",color:"#991b1b",border:"1px dashed #fca5a5",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                              🗑 Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* PARENTS */}
        {page==="parents" && (() => {
          const nbDemandes = parents.filter(p=>parentType(p)==="demande").length;
          const nbReservations = parents.filter(p=>parentType(p)==="reservation").length;
          const filtered = parents
            .filter(p => parentFilter==="all" || parentType(p)===parentFilter)
            .filter(p => !search || (p.nom||"").toLowerCase().includes(search.toLowerCase()) || (p.email||"").toLowerCase().includes(search.toLowerCase()));
          return (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:0}}>Parents ({parents.length})</h1>
              <button onClick={()=>openAdd({nom:"",sexe:"",email:"",telephone:"",enfant:"",statut:"En attente"})}
                style={{padding:"10px 20px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                + Ajouter
              </button>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {[
                {k:"all",label:`Tous (${parents.length})`,bg:"#ede9fe",fg:"#4f46e5"},
                {k:"demande",label:`🔍 Demandes — à trouver un tuteur (${nbDemandes})`,bg:"#fef3c7",fg:"#92400e"},
                {k:"reservation",label:`📅 Réservations directes (${nbReservations})`,bg:"#dcfce7",fg:"#065f46"},
              ].map(b=>(
                <button key={b.k} onClick={()=>setParentFilter(b.k)}
                  style={{
                    padding:"8px 16px",borderRadius:999,fontSize:13,fontWeight:700,cursor:"pointer",
                    border: parentFilter===b.k ? `2px solid ${b.fg}` : "1.5px solid #e5e7eb",
                    background: parentFilter===b.k ? b.bg : "#fff",
                    color: parentFilter===b.k ? b.fg : "#6b7280",
                  }}>{b.label}</button>
              ))}
            </div>
            <div style={S.card}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom ou email…"
                style={{width:"100%",padding:"10px 16px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,marginBottom:16,boxSizing:"border-box",outline:"none"}}/>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Parent","Type","Enfant","Téléphone","Séances","Statut",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map(p=>{
                    const t = parentType(p);
                    return (
                    <tr key={p.id}>
                      <td style={S.td}><p style={{fontWeight:600,margin:0}}>{p.nom}</p><p style={{fontSize:12,color:"#9ca3af",margin:0}}>{p.email}</p></td>
                      <td style={S.td}>
                        {t==="reservation" ? (
                          <span style={{padding:"3px 10px",borderRadius:999,fontSize:11,fontWeight:700,background:"#dcfce7",color:"#065f46",whiteSpace:"nowrap"}}>📅 Réservation</span>
                        ) : (
                          <span style={{padding:"3px 10px",borderRadius:999,fontSize:11,fontWeight:700,background:"#fef3c7",color:"#92400e",whiteSpace:"nowrap"}}>🔍 Demande</span>
                        )}
                      </td>
                      <td style={S.td}>{p.enfant}</td>
                      <td style={S.td}>{p.telephone}</td>
                      <td style={{...S.td,fontWeight:700,color:"#4f46e5"}}>{p.sessions}</td>
                      <td style={S.td}><BadgeStatus s={p.statut} sexe={p.sexe}/></td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {p.statut==="En attente" && (
                            <button onClick={async()=>{
                              try {
                                await modifierParent(p.id,{statut:"Actif"});
                                setParents(pp=>pp.map(x=>x.id===p.id?{...x,statut:"Actif"}:x));
                                envoyerEmail(p.email, p.nom, "parent");
                              } catch(e){ alert("Erreur : "+e.message); }
                            }} style={{padding:"5px 12px",background:"#dcfce7",color:"#065f46",border:"1px solid #86efac",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              ✓ Confirmer
                            </button>
                          )}
                          <button onClick={()=>openEdit(p)} style={{padding:"5px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",color:"#374151"}}>Modifier</button>
                          <button onClick={async()=>{
                            try {
                              await supprimerParent(p.id);
                              setParents(pp=>pp.filter(x=>x.id!==p.id));
                            } catch(e){ alert("Erreur : "+e.message); }
                          }} style={{padding:"5px 12px",border:"1px solid #fee2e2",borderRadius:8,background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",color:"#ef4444"}}>Suppr.</button>
                        </div>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>

            {showForm && (
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
                <div style={{background:"#fff",borderRadius:20,padding:32,width:440,maxHeight:"90vh",overflowY:"auto",position:"relative"}}>
                  <button onClick={()=>setShowForm(false)} style={{position:"absolute",top:16,right:18,background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button>
                  <h2 style={{fontSize:18,fontWeight:800,margin:"0 0 20px",color:"#111827"}}>{editTarget?"Modifier":"Ajouter"} un parent</h2>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <Inp label="Nom complet" value={form.nom||""} onChange={v=>setF("nom",v)} placeholder="Aminata Diallo"/>
                    <SexeToggle value={form.sexe||""} onChange={v=>setF("sexe",v)}/>
                    <Inp label="E-mail" value={form.email||""} onChange={v=>setF("email",v)} placeholder="aminata@gmail.com" type="email"/>
                    <Inp label="Téléphone" value={form.telephone||""} onChange={v=>setF("telephone",v)} placeholder="+226 77 00 00 00" type="tel" filter="tel"/>
                    <Inp label="Enfant (prénom, niveau)" value={form.enfant||""} onChange={v=>setF("enfant",v)} placeholder="Moussa, CM1"/>
                    <Sel label="Statut" value={form.statut||"En attente"} onChange={v=>setF("statut",v)} options={["En attente","Actif","Inactif","Refusé"]}/>
                    <button disabled={!form.nom||!form.email} onClick={()=>{
                      if(editTarget) setParents(p=>p.map(x=>x.id===editTarget.id?{...x,...form}:x));
                      else setParents(p=>[...p,{...form,id:Date.now(),sessions:0}]);
                      setShowForm(false);
                    }} style={{padding:13,background:"#4f46e5",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",opacity:form.nom&&form.email?1:.5}}>
                      {editTarget?"Enregistrer":"Ajouter"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          );
        })()}

        {/* AVIS */}
        {page==="avis" && (
          <div>
            <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:"0 0 8px"}}>Avis</h1>
            <p style={{color:"#6b7280",fontSize:14,marginBottom:28}}>Approuvez les avis avant qu'ils apparaissent sur le site public.</p>
            <div style={S.card}>
              {tousAvis.length === 0 ? (
                <p style={{textAlign:"center",color:"#9ca3af",padding:"40px 0"}}>Aucun avis pour l'instant.</p>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr>{["Auteur","Ville","Type","Note","Commentaire","Statut","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {tousAvis.map(a=>(
                      <tr key={a.id}>
                        <td style={{...S.td,fontWeight:600}}>{a.auteur}</td>
                        <td style={S.td}>{a.ville||"—"}</td>
                        <td style={S.td}><span style={{padding:"2px 8px",borderRadius:999,fontSize:12,fontWeight:700,background:a.type==="tuteur"?"#dcfce7":"#ede9fe",color:a.type==="tuteur"?"#065f46":"#4f46e5"}}>{a.type}</span></td>
                        <td style={S.td}><span style={{color:"#f59e0b"}}>{"★".repeat(a.note)}</span></td>
                        <td style={{...S.td,maxWidth:280,fontSize:13,color:"#374151"}}>« {a.commentaire} »</td>
                        <td style={S.td}>
                          <span style={{padding:"3px 10px",borderRadius:999,fontSize:12,fontWeight:700,
                            background:a.statut==="approuvé"?"#dcfce7":"#fef3c7",
                            color:a.statut==="approuvé"?"#065f46":"#92400e"}}>
                            {a.statut}
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={{display:"flex",gap:6}}>
                            {a.statut==="en_attente" && (
                              <button onClick={async()=>{
                                await changerStatutAvis(a.id,"approuvé");
                                setTousAvis(tt=>tt.map(x=>x.id===a.id?{...x,statut:"approuvé"}:x));
                              }} style={{padding:"4px 12px",background:"#dcfce7",color:"#065f46",border:"1px solid #86efac",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                                ✓ Approuver
                              </button>
                            )}
                            <button onClick={async()=>{
                              await supprimerAvis(a.id);
                              setTousAvis(tt=>tt.filter(x=>x.id!==a.id));
                            }} style={{padding:"4px 12px",background:"#fee2e2",color:"#991b1b",border:"1px solid #fca5a5",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              🗑 Suppr.
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ÉCOLES PARTENAIRES */}
        {page==="ecoles" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:0}}>Écoles partenaires ({ecolesAdmin.length})</h1>
              <button onClick={()=>{ setET(null); setForm({nom:"",quartier:"",type:"École"}); setShowForm(true); }}
                style={{padding:"10px 20px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                + Ajouter
              </button>
            </div>
            <p style={{color:"#6b7280",fontSize:14,marginBottom:24}}>Ces établissements apparaissent dans le défilant du site et dans le formulaire d'inscription.</p>
            <div style={S.card}>
              {ecolesAdmin.length === 0 ? (
                <p style={{textAlign:"center",color:"#9ca3af",padding:"40px 0"}}>Aucun établissement pour l'instant.</p>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Nom de l'établissement","Quartier","Type",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {ecolesAdmin.map(ec=>(
                      <tr key={ec.id}>
                        <td style={{...S.td,fontWeight:600}}>🏫 {ec.nom}</td>
                        <td style={S.td}>{ec.quartier||"—"}</td>
                        <td style={S.td}>
                          <span style={{padding:"3px 10px",borderRadius:999,fontSize:12,fontWeight:700,
                            background:ec.type==="Lycée"?"#ede9fe":ec.type==="Collège"?"#dbeafe":ec.type==="Institut"?"#fef3c7":ec.type==="Académie"?"#dcfce7":"#f3f4f6",
                            color:ec.type==="Lycée"?"#5b21b6":ec.type==="Collège"?"#1e40af":ec.type==="Institut"?"#92400e":ec.type==="Académie"?"#065f46":"#374151"}}>
                            {ec.type||"École"}
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>{ setET(ec); setForm({nom:ec.nom,quartier:ec.quartier||"",type:ec.type||"École"}); setShowForm(true); }}
                              style={{padding:"5px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",color:"#374151"}}>
                              Modifier
                            </button>
                            <button onClick={async()=>{
                              if(!confirm(`Supprimer "${ec.nom}" ?`)) return;
                              try { await supprimerEcole(ec.id); setEcolesAdmin(l=>l.filter(x=>x.id!==ec.id)); }
                              catch(e){ alert("Erreur : "+e.message); }
                            }} style={{padding:"5px 12px",border:"1px solid #fee2e2",borderRadius:8,background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",color:"#ef4444"}}>
                              Suppr.
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {showForm && page==="ecoles" && (
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
                <div style={{background:"#fff",borderRadius:20,padding:32,width:420,position:"relative"}}>
                  <button onClick={()=>setShowForm(false)} style={{position:"absolute",top:16,right:18,background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button>
                  <h2 style={{fontSize:18,fontWeight:800,margin:"0 0 20px",color:"#111827"}}>{editTarget?"Modifier":"Ajouter"} un établissement</h2>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <Inp label="Nom de l'établissement" value={form.nom||""} onChange={v=>setF("nom",v)} placeholder="Ex: École Primaire Les Étoiles"/>
                    <Inp label="Quartier" value={form.quartier||""} onChange={v=>setF("quartier",v)} placeholder="Ex: Ouaga 2000"/>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      <label style={{fontSize:13,fontWeight:600,color:"#374151"}}>Type</label>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {["École","Collège","Lycée","Institut","Académie"].map(t=>(
                          <button key={t} type="button" onClick={()=>setF("type",t)}
                            style={{padding:"8px 16px",borderRadius:999,border:`1.5px solid ${form.type===t?"#4f46e5":"#e5e7eb"}`,background:form.type===t?"#eef2ff":"#fff",color:form.type===t?"#4f46e5":"#6b7280",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button disabled={!form.nom} onClick={async()=>{
                      try {
                        if(editTarget) {
                          await modifierEcole(editTarget.id, {nom:form.nom,quartier:form.quartier,type:form.type||"École"});
                          setEcolesAdmin(l=>l.map(x=>x.id===editTarget.id?{...x,...form}:x));
                        } else {
                          const data = await ajouterEcole({nom:form.nom,quartier:form.quartier||"",type:form.type||"École"});
                          setEcolesAdmin(l=>[...l, data]);
                        }
                        setShowForm(false);
                      } catch(e){ alert("Erreur : "+e.message); }
                    }} style={{padding:13,background:form.nom?"#4f46e5":"#e5e7eb",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:form.nom?"pointer":"not-allowed"}}>
                      {editTarget?"Enregistrer les modifications":"Ajouter l'établissement"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TUTEURS */}
        {page==="tuteurs" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:0}}>Tuteurs ({tuteurs.length})</h1>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>exportCSV(tuteurs,[{label:"Prénom",key:"prenom"},{label:"Nom",key:"nom"},{label:"Matière",key:"subject"},{label:"Tarif",key:"price"},{label:"Séances",key:"sessions"},{label:"Statut",key:"statut"},{label:"Quartier",key:"quartier"},{label:"Email",key:"email"}],"tuteurs.csv")}
                  style={{padding:"10px 20px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  ⬇ CSV
                </button>
                <button onClick={()=>openAdd({name:"",subject:"",email:"",statut:"En attente",price:"",jours:[],availableDays:[],quartiersCouVerts:[]})}
                  style={{padding:"10px 20px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  + Ajouter
                </button>
              </div>
            </div>
            <div style={S.card}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…"
                style={{width:"100%",padding:"10px 16px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,marginBottom:16,boxSizing:"border-box",outline:"none"}}/>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Tuteur","Matière","Tarif","Séances","Note","Statut",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {tuteurs.filter(t=>!search||t.name?.toLowerCase().includes(search.toLowerCase())||t.prenom?.toLowerCase().includes(search.toLowerCase())||t.subject?.toLowerCase().includes(search.toLowerCase())).map(t=>(
                    <tr key={t.id}>
                      <td style={S.td}><div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:24}}>{t.emoji}</span><div><p style={{fontWeight:600,margin:0}}>{t.prenom||t.name} {t.nom||""}</p><p style={{fontSize:12,color:"#9ca3af",margin:0}}>{t.email}</p></div></div></td>
                      <td style={S.td}>{t.subject}</td>
                      <td style={{...S.td,fontWeight:700,color:"#4f46e5"}}>{fmt(t.price)}/h</td>
                      <td style={{...S.td,fontWeight:700}}>{t.sessions}</td>
                      <td style={S.td}><Stars n={t.rating}/></td>
                      <td style={S.td}><BadgeStatus s={t.statut} sexe={t.sexe}/></td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {t.statut==="En attente" && (
                            <button onClick={async()=>{
                              try {
                                await modifierTuteur(t.id,{statut:"Actif"});
                                setTuteurs(tt=>tt.map(x=>x.id===t.id?{...x,statut:"Actif"}:x));
                                if(t.email) {
                                  // Email "profil approuvé" via Resend
                                  const tpl = emailTemplates.tuteur_approuve({ prenom: t.prenom||t.name, nom: t.nom||"" });
                                  sendEmail({ to: t.email, ...tpl });
                                }
                              } catch(e){ alert("Erreur : "+e.message); }
                            }} style={{padding:"5px 12px",background:"#dcfce7",color:"#065f46",border:"1px solid #86efac",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              ✓ Confirmer
                            </button>
                          )}
                          <button onClick={()=>openEdit(t)} style={{padding:"5px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",color:"#374151"}}>Modifier</button>
                          <button onClick={()=>handleSupprimerTuteur(t.id)} style={{padding:"5px 12px",border:"1px solid #fee2e2",borderRadius:8,background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",color:"#ef4444"}}>Suppr.</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showForm && (
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
                <div style={{background:"#fff",borderRadius:20,padding:32,width:440,maxHeight:"90vh",overflowY:"auto",position:"relative"}}>
                  <button onClick={()=>setShowForm(false)} style={{position:"absolute",top:16,right:18,background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button>
                  <h2 style={{fontSize:18,fontWeight:800,margin:"0 0 20px",color:"#111827"}}>{editTarget?"Modifier":"Ajouter"} un tuteur</h2>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <Inp label="Nom complet" value={form.name||form.prenom||""} onChange={v=>setF("name",v)} placeholder="Ex: Aminata Traoré"/>
                    <SexeToggle value={form.sexe||""} onChange={v=>setF("sexe",v)}/>
                    <Sel label="Matière" value={form.subject||""} onChange={v=>setF("subject",v)} options={["", ...MATIERES.map(m=>m.label)]}/>
                    <Inp label="E-mail" value={form.email||""} onChange={v=>setF("email",v)} placeholder="Ex: aminata@gmail.com" type="email"/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <Inp label="Tarif (FCFA/h)" value={form.price||""} onChange={v=>setF("price",+v)} placeholder="Ex: 25000" type="number" filter="number" min={1000} max={200000}/>
                      <Sel label="Statut" value={form.statut||"En attente"} onChange={v=>setF("statut",v)} options={["En attente","Actif","Inactif","Refusé"]}/>
                    </div>
                    <div>
                      <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>📍 Quartiers couverts</label>
                      <button type="button" onClick={()=>setF("quartiersCouVerts", (form.quartiersCouVerts||[]).length===QUARTIERS.length ? [] : [...QUARTIERS])}
                        style={{padding:"6px 14px",borderRadius:999,border:`2px solid ${(form.quartiersCouVerts||[]).length===QUARTIERS.length?"#4f46e5":"#e5e7eb"}`,background:(form.quartiersCouVerts||[]).length===QUARTIERS.length?"#ede9fe":"#f9fafb",color:(form.quartiersCouVerts||[]).length===QUARTIERS.length?"#4f46e5":"#374151",fontWeight:700,fontSize:12,cursor:"pointer",marginBottom:8}}>
                        {(form.quartiersCouVerts||[]).length===QUARTIERS.length?"✓ Tous les quartiers":"Tous les quartiers"}
                      </button>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:120,overflowY:"auto"}}>
                        {QUARTIERS.map(q=>{
                          const qc = form.quartiersCouVerts||[];
                          const active = qc.includes(q);
                          return <button key={q} type="button" onClick={()=>setF("quartiersCouVerts", active?qc.filter(x=>x!==q):[...qc,q])}
                            style={{padding:"5px 12px",borderRadius:999,border:`1.5px solid ${active?"#4f46e5":"#e5e7eb"}`,background:active?"#eef2ff":"#fff",color:active?"#4f46e5":"#6b7280",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                            {q}
                          </button>;
                        })}
                      </div>
                    </div>
                    <button disabled={!form.name&&!form.prenom||!form.subject} onClick={()=>{
                      if(editTarget) handleModifierTuteur();
                      else handleAjouterTuteur();
                    }} style={{padding:13,background:"#4f46e5",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                      {editTarget?"Enregistrer":"Ajouter"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODALE COMPTE-RENDU ────────────────────────────────────── */}
      {crModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:20,padding:32,width:"100%",maxWidth:480,boxShadow:"0 24px 60px rgba(0,0,0,.2)"}}>
            <p style={{fontWeight:800,fontSize:17,margin:"0 0 4px",color:"#111827"}}>📋 Compte-rendu de séance</p>
            <p style={{fontSize:13,color:"#6b7280",margin:"0 0 20px"}}>
              {crModal.enfant} · {crModal.niveau} — <strong>{crModal.parent_nom}</strong>
            </p>

            {[
              {label:"Points travaillés",key:"points",ph:"Ex : Tables de multiplication, fractions, lecture de texte..."},
              {label:"Progrès observés",key:"progres",ph:"Ex : Bonne compréhension, encore des difficultés sur les divisions..."},
              {label:"Exercices recommandés",key:"exercices",ph:"Ex : Pages 34–36 du cahier de maths, relire le chapitre 3..."},
            ].map(({label,key,ph})=>(
              <div key={key} style={{marginBottom:14}}>
                <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:5}}>{label}</label>
                <textarea value={crData[key]} onChange={e=>setCrData(d=>({...d,[key]:e.target.value}))}
                  placeholder={ph} rows={2}
                  style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #e5e7eb",fontSize:13,resize:"vertical",fontFamily:"inherit",boxSizing:"border-box",outline:"none"}}/>
              </div>
            ))}

            <div style={{display:"flex",gap:10,marginTop:20}}>
              <a href={`https://wa.me/${(crModal.parent_tel||"").replace(/\D/g,"")||"226"}?text=${encodeURIComponent(
                `Bonjour ${crModal.parent_nom},\n\nVoici le compte-rendu de la séance de ${crModal.enfant} (${crModal.niveau}) avec Brillance Académie.\n\n` +
                `POINTS TRAVAILLÉS :\n${crData.points||"—"}\n\n` +
                `PROGRÈS OBSERVÉS :\n${crData.progres||"—"}\n\n` +
                `EXERCICES RECOMMANDÉS :\n${crData.exercices||"—"}\n\n` +
                `Pour toute question : wa.me/22677166565\nBrillance Académie`
              )}`} target="_blank" rel="noreferrer"
                style={{flex:1,padding:"12px",background:"#25d366",color:"#fff",borderRadius:12,fontWeight:700,fontSize:14,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                📲 Envoyer sur WhatsApp
              </a>
              <button onClick={()=>setCrModal(null)}
                style={{padding:"12px 20px",background:"none",border:"1.5px solid #e5e7eb",borderRadius:12,fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

// ─── LOGIN ADMIN ──────────────────────────────────────────────────────────────

// ─── ESPACE TUTEUR ────────────────────────────────────────────────────────────

function PageEspaceTuteur({ goHome }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [tuteur, setTuteur]     = useState(null);
  const [seances, setSeances]   = useState([]);
  const [error, setError]       = useState("");
  const [tab, setTab]           = useState("profil"); // profil | seances
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPwd, setNewPwd]     = useState("");
  const [newPwd2, setNewPwd2]   = useState("");
  const [pwdMsg, setPwdMsg]     = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) return;
    setLoading(true); setError("");
    try {
      const t = await loginTuteur(email.trim(), password);
      if (!t) { setError("Email ou mot de passe incorrect."); setLoading(false); return; }
      const s = await getReservationsByTuteurId(t.id);
      setTuteur(t);
      setSeances(s);
      setForm({
        prenom:    t.prenom || t.name || "",
        nom:       t.nom || "",
        telephone: t.telephone || t.tel || "",
        bio:       t.bio || "",
        subject:   t.subject || "",
        price:     t.price || "",
        niveaux:   t.niveaux || [],
        availableDays: t.available_days || t.availableDays || [],
        quartiersCouVerts: t.quartiers_couverts || t.quartiersCouVerts || [],
        modeSeance: t.mode_seance || "domicile",
      });
    } catch(e) { setError("Erreur de connexion. Réessayez."); }
    setLoading(false);
  };

  const changerPwd = async () => {
    if (!newPwd || newPwd !== newPwd2) { setPwdMsg("Les mots de passe ne correspondent pas."); return; }
    if (newPwd.length < 6) { setPwdMsg("Le mot de passe doit faire au moins 6 caractères."); return; }
    setPwdLoading(true); setPwdMsg("");
    try {
      await changerMotDePasseTuteur(tuteur.id, newPwd);
      setPwdMsg("✅ Mot de passe modifié avec succès !");
      setNewPwd(""); setNewPwd2("");
      setTimeout(() => { setShowChangePwd(false); setPwdMsg(""); }, 2500);
    } catch(e) { setPwdMsg("Erreur : " + e.message); }
    setPwdLoading(false);
  };

  const sauvegarder = async () => {
    setSaving(true); setSaved(false);
    try {
      await modifierTuteur(tuteur.id, form);
      setTuteur(t => ({ ...t, ...form }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) { alert("Erreur lors de la sauvegarde : " + e.message); }
    setSaving(false);
  };

  const toggleItem = (key, val) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x=>x!==val) : [...f[key], val]
    }));

  const statutStyle = s => ({
    padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700,
    background: s==="confirmée"?"#dcfce7":s==="en_attente"?"#fef3c7":"#fee2e2",
    color:      s==="confirmée"?"#065f46":s==="en_attente"?"#92400e":"#991b1b",
  });

  const inp = (label, key, type="text", placeholder="") => (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4}}>{label}</label>
      <input type={type} value={form[key]||""} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
        placeholder={placeholder}
        style={{width:"100%",padding:"10px 12px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#e8ddd0",fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:"column"}}>
      <nav style={{background:"#ebebE2",borderBottom:"1px solid #d4d4c8",padding:"0 40px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={goHome} style={{background:"none",border:"none",fontWeight:900,fontSize:18,color:"#22c55e",cursor:"pointer"}}>🎓 Brillance Académie</button>
        <button onClick={goHome} style={{padding:"8px 20px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:13,cursor:"pointer"}}>← Retour</button>
      </nav>

      <div style={{flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"48px 20px"}}>
        <div style={{width:"100%",maxWidth:680}}>

          {!tuteur ? (
            /* ── LOGIN ── */
            <div style={{background:"#fff",borderRadius:24,padding:40,boxShadow:"0 8px 40px rgba(0,0,0,.1)"}}>
              <p style={{fontSize:12,fontWeight:700,color:"#16a34a",textTransform:"uppercase",letterSpacing:2,margin:"0 0 6px"}}>🎓 Espace tuteur</p>
              <h2 style={{fontSize:24,fontWeight:900,color:"#111827",margin:"0 0 8px"}}>Accédez à votre profil</h2>
              <p style={{fontSize:14,color:"#6b7280",margin:"0 0 32px"}}>Entrez l'email utilisé lors de votre inscription pour modifier votre profil et voir vos séances.</p>
              <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>Votre adresse email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&login()} placeholder="votre@email.com"
                style={{width:"100%",padding:"14px 16px",border:"1.5px solid #e5e7eb",borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:16,fontFamily:"inherit"}}/>
              <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>Mot de passe</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••••••"
                style={{width:"100%",padding:"14px 16px",border:"1.5px solid #e5e7eb",borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:16,fontFamily:"inherit"}}/>
              {error && <p style={{fontSize:13,color:"#ef4444",margin:"0 0 12px"}}>{error}</p>}
              <button onClick={login} disabled={loading||!email.trim()||!password}
                style={{width:"100%",padding:14,background:"#16a34a",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",opacity:(loading||!email.trim()||!password)?0.6:1}}>
                {loading?"Vérification…":"Accéder à mon espace →"}
              </button>
            </div>

          ) : (
            /* ── DASHBOARD TUTEUR ── */
            <div>
              {/* Header */}
              <div style={{background:"#fff",borderRadius:20,padding:24,marginBottom:16,boxShadow:"0 4px 20px rgba(0,0,0,.07)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:52,height:52,borderRadius:16,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
                    {tuteur.emoji||"👨‍🏫"}
                  </div>
                  <div>
                    <h2 style={{fontSize:18,fontWeight:900,color:"#111827",margin:"0 0 2px"}}>{tuteur.prenom||tuteur.name} {tuteur.nom||""}</h2>
                    <p style={{fontSize:13,color:"#6b7280",margin:0}}>{tuteur.subject} · {tuteur.email}</p>
                    <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:999,
                      background:tuteur.statut==="Actif"?"#dcfce7":tuteur.statut==="En attente"?"#fef3c7":"#f3f4f6",
                      color:tuteur.statut==="Actif"?"#065f46":tuteur.statut==="En attente"?"#92400e":"#6b7280"}}>
                      {tuteur.statut}
                    </span>
                  </div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <div style={{textAlign:"center",background:"#dbeafe",borderRadius:12,padding:"10px 16px"}}>
                    <p style={{fontSize:20,fontWeight:900,color:"#2563eb",margin:0}}>{seances.length}</p>
                    <p style={{fontSize:11,color:"#2563eb",margin:0}}>Séances</p>
                  </div>
                  <div style={{textAlign:"center",background:"#dcfce7",borderRadius:12,padding:"10px 16px"}}>
                    <p style={{fontSize:20,fontWeight:900,color:"#16a34a",margin:0}}>{tuteur.rating||"—"} ★</p>
                    <p style={{fontSize:11,color:"#16a34a",margin:0}}>Note</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                {[["profil","✏️ Mon profil"],["seances","📅 Mes séances"]].map(([id,label])=>(
                  <button key={id} onClick={()=>setTab(id)}
                    style={{padding:"10px 20px",borderRadius:10,border:"none",fontWeight:700,fontSize:13,cursor:"pointer",
                      background:tab===id?"#4f46e5":"#fff",color:tab===id?"#fff":"#6b7280",
                      boxShadow:tab===id?"0 2px 8px rgba(79,70,229,.3)":"none"}}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── ONGLET PROFIL ── */}
              {tab==="profil" && (
                <div style={{background:"#fff",borderRadius:20,padding:28,boxShadow:"0 4px 20px rgba(0,0,0,.07)"}}>
                  <h3 style={{fontSize:15,fontWeight:800,color:"#111827",margin:"0 0 20px"}}>Informations personnelles</h3>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {inp("Prénom","prenom","text","Votre prénom")}
                    {inp("Nom","nom","text","Votre nom")}
                  </div>
                  {inp("Téléphone","telephone","tel","ex: 77 12 34 56")}
                  {inp("Matière principale","subject","text","ex: Mathématiques")}
                  {inp("Tarif horaire souhaité (FCFA)","price","number","ex: 30000")}

                  <div style={{marginBottom:14}}>
                    <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4}}>Biographie</label>
                    <textarea value={form.bio||""} onChange={e=>setForm(f=>({...f,bio:e.target.value}))}
                      rows={3} placeholder="Décrivez votre expérience et votre approche pédagogique..."
                      style={{width:"100%",padding:"10px 12px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:13,resize:"vertical",fontFamily:"inherit",boxSizing:"border-box",outline:"none"}}/>
                  </div>

                  <div style={{marginBottom:14}}>
                    <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Niveaux enseignés</label>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {NIVEAUX_LIST.map(n=>(
                        <button key={n} onClick={()=>toggleItem("niveaux",n)}
                          style={{padding:"5px 12px",borderRadius:999,border:"1.5px solid",fontSize:12,fontWeight:600,cursor:"pointer",
                            borderColor:form.niveaux?.includes(n)?"#4f46e5":"#e5e7eb",
                            background:form.niveaux?.includes(n)?"#4f46e5":"#fff",
                            color:form.niveaux?.includes(n)?"#fff":"#6b7280"}}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{marginBottom:14}}>
                    <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Jours disponibles</label>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {JOURS.map(j=>(
                        <button key={j} onClick={()=>toggleItem("availableDays",j)}
                          style={{padding:"5px 12px",borderRadius:999,border:"1.5px solid",fontSize:12,fontWeight:600,cursor:"pointer",
                            borderColor:form.availableDays?.includes(j)?"#16a34a":"#e5e7eb",
                            background:form.availableDays?.includes(j)?"#16a34a":"#fff",
                            color:form.availableDays?.includes(j)?"#fff":"#6b7280"}}>
                          {j}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{marginBottom:20}}>
                    <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Quartiers couverts</label>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {QUARTIERS_LIST.map(q=>(
                        <button key={q} onClick={()=>toggleItem("quartiersCouVerts",q)}
                          style={{padding:"5px 12px",borderRadius:999,border:"1.5px solid",fontSize:12,fontWeight:600,cursor:"pointer",
                            borderColor:form.quartiersCouVerts?.includes(q)?"#0284c7":"#e5e7eb",
                            background:form.quartiersCouVerts?.includes(q)?"#0284c7":"#fff",
                            color:form.quartiersCouVerts?.includes(q)?"#fff":"#6b7280"}}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <button onClick={sauvegarder} disabled={saving}
                      style={{flex:1,padding:"13px",background:"#16a34a",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                      {saving?"Sauvegarde…":"💾 Enregistrer les modifications"}
                    </button>
                    {saved && <span style={{fontSize:13,color:"#16a34a",fontWeight:700}}>✓ Sauvegardé !</span>}
                  </div>
                </div>
              )}

              {/* ── ONGLET SÉANCES ── */}
              {tab==="seances" && (
                <div style={{background:"#fff",borderRadius:20,padding:28,boxShadow:"0 4px 20px rgba(0,0,0,.07)"}}>
                  <h3 style={{fontSize:15,fontWeight:800,color:"#111827",margin:"0 0 20px"}}>📅 Vos séances</h3>
                  {seances.length===0 ? (
                    <p style={{textAlign:"center",color:"#9ca3af",padding:"32px 0",fontSize:14}}>Aucune séance pour le moment.</p>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {seances.map((s,i)=>(
                        <div key={i} style={{border:"1.5px solid #f3f4f6",borderRadius:14,padding:16,display:"flex",flexDirection:"column",gap:6}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                            <span style={{fontFamily:"monospace",fontSize:11,background:"#f1f5f9",padding:"2px 8px",borderRadius:6}}>{s.paiement_reference||"—"}</span>
                            <span style={statutStyle(s.statut)}>{s.statut}</span>
                          </div>
                          <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>👨‍👩‍👧 {s.parent_nom} · {s.enfant} ({s.niveau})</div>
                          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                            <span style={{fontSize:12,color:"#6b7280"}}>📅 {s.jour}{s.creneau?` à ${s.creneau}`:""}</span>
                            <span style={{fontSize:14,fontWeight:800,color:"#111827"}}>{s.montant?s.montant.toLocaleString("fr-FR")+" FCFA":"—"}</span>
                          </div>
                          {s.parent_email && (
                            <a href={`https://wa.me/${(s.parent_tel||"").replace(/\D/g,"")||"226"}?text=${encodeURIComponent(`Bonjour, je suis votre tuteur Brillance Academie. Je vous contacte pour notre seance du ${s.jour}.`)}`}
                              target="_blank" rel="noreferrer"
                              style={{fontSize:12,color:"#25d366",fontWeight:700,textDecoration:"none"}}>
                              📲 Contacter le parent
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Changer mot de passe */}
              <div style={{background:"#fff",borderRadius:20,padding:24,marginTop:16,boxShadow:"0 4px 20px rgba(0,0,0,.07)"}}>
                <button onClick={()=>setShowChangePwd(v=>!v)}
                  style={{background:"none",border:"none",fontWeight:700,fontSize:14,color:"#16a34a",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:8}}>
                  🔒 {showChangePwd ? "Masquer" : "Changer mon mot de passe"}
                </button>
                {showChangePwd && (
                  <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:12}}>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4}}>Nouveau mot de passe</label>
                      <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        style={{width:"100%",padding:"10px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4}}>Confirmer le mot de passe</label>
                      <input type="password" value={newPwd2} onChange={e=>setNewPwd2(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        style={{width:"100%",padding:"10px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    </div>
                    {pwdMsg && <p style={{fontSize:13,color:pwdMsg.startsWith("✅")?"#16a34a":"#ef4444",margin:0}}>{pwdMsg}</p>}
                    <button onClick={changerPwd} disabled={pwdLoading}
                      style={{padding:"11px 20px",background:"#16a34a",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",opacity:pwdLoading?0.6:1}}>
                      {pwdLoading ? "Enregistrement…" : "Enregistrer le mot de passe"}
                    </button>
                  </div>
                )}
              </div>

              <button onClick={()=>{setTuteur(null);setEmail("");setPassword("");setSeances([]);setTab("profil");setShowChangePwd(false);}}
                style={{marginTop:16,width:"100%",padding:12,background:"none",border:"1.5px solid #e5e7eb",borderRadius:12,fontWeight:600,fontSize:13,cursor:"pointer",color:"#6b7280"}}>
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ESPACE PARENT ────────────────────────────────────────────────────────────
function PageEspaceParent({ goHome }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [parent, setParent]     = useState(null);
  const [reservations, setReservations] = useState([]);
  const [error, setError]       = useState("");
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPwd, setNewPwd]     = useState("");
  const [newPwd2, setNewPwd2]   = useState("");
  const [pwdMsg, setPwdMsg]     = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) return;
    setLoading(true); setError(""); setParent(null); setReservations([]);
    try {
      const p = await loginParent(email.trim(), password);
      if (!p) { setError("Email ou mot de passe incorrect."); setLoading(false); return; }
      const resa = await getReservationsByParentEmail(email.trim());
      setParent(p);
      setReservations(resa);
    } catch(e) { setError("Erreur de connexion. Réessayez."); }
    setLoading(false);
  };

  const changerPwd = async () => {
    if (!newPwd || newPwd !== newPwd2) { setPwdMsg("Les mots de passe ne correspondent pas."); return; }
    if (newPwd.length < 6) { setPwdMsg("Le mot de passe doit faire au moins 6 caractères."); return; }
    setPwdLoading(true); setPwdMsg("");
    try {
      await changerMotDePasseParent(parent.id, newPwd);
      setPwdMsg("✅ Mot de passe modifié avec succès !");
      setNewPwd(""); setNewPwd2("");
      setTimeout(() => { setShowChangePwd(false); setPwdMsg(""); }, 2500);
    } catch(e) { setPwdMsg("Erreur : " + e.message); }
    setPwdLoading(false);
  };

  const statutStyle = (s) => ({
    padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700,
    background: s==="confirmée"?"#dcfce7":s==="en_attente"?"#fef3c7":"#fee2e2",
    color:      s==="confirmée"?"#065f46":s==="en_attente"?"#92400e":"#991b1b",
  });

  return (
    <div style={{minHeight:"100vh",background:"#e8ddd0",fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:"column"}}>
      {/* Nav */}
      <nav style={{background:"#ebebE2",borderBottom:"1px solid #d4d4c8",padding:"0 40px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={goHome} style={{background:"none",border:"none",fontWeight:900,fontSize:18,color:"#22c55e",cursor:"pointer"}}>🎓 Brillance Académie</button>
        <button onClick={goHome} style={{padding:"8px 20px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:13,cursor:"pointer"}}>← Retour</button>
      </nav>

      <div style={{flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"48px 20px"}}>
        <div style={{width:"100%",maxWidth:640}}>

          {!parent ? (
            /* ── FORMULAIRE LOGIN ── */
            <div style={{background:"#fff",borderRadius:24,padding:40,boxShadow:"0 8px 40px rgba(0,0,0,.1)"}}>
              <p style={{fontSize:12,fontWeight:700,color:"#4f46e5",textTransform:"uppercase",letterSpacing:2,margin:"0 0 6px"}}>🎓 Brillance Académie</p>
              <h2 style={{fontSize:24,fontWeight:900,color:"#111827",margin:"0 0 8px"}}>Mon espace parent</h2>
              <p style={{fontSize:14,color:"#6b7280",margin:"0 0 32px"}}>Entrez l'email utilisé lors de votre inscription pour accéder à vos réservations.</p>

              <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>Votre adresse email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&login()}
                placeholder="votre@email.com"
                style={{width:"100%",padding:"14px 16px",border:"1.5px solid #e5e7eb",borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:16,fontFamily:"inherit"}}/>

              <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>Mot de passe</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&login()}
                placeholder="••••••••"
                style={{width:"100%",padding:"14px 16px",border:"1.5px solid #e5e7eb",borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:16,fontFamily:"inherit"}}/>

              {error && <p style={{fontSize:13,color:"#ef4444",margin:"0 0 12px"}}>{error}</p>}

              <button onClick={login} disabled={loading||!email.trim()||!password}
                style={{width:"100%",padding:14,background:"#4f46e5",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",opacity:(loading||!email.trim()||!password)?0.6:1}}>
                {loading ? "Vérification…" : "Accéder à mon espace →"}
              </button>

              <p style={{fontSize:12,color:"#9ca3af",textAlign:"center",marginTop:20}}>
                Pas encore de compte ? <button onClick={goHome} style={{background:"none",border:"none",color:"#4f46e5",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Réserver une séance</button>
              </p>
            </div>

          ) : (
            /* ── TABLEAU DE BORD PARENT ── */
            <div>
              {/* Header */}
              <div style={{background:"#fff",borderRadius:20,padding:24,marginBottom:16,boxShadow:"0 4px 20px rgba(0,0,0,.07)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                <div>
                  <p style={{fontSize:11,fontWeight:700,color:"#4f46e5",textTransform:"uppercase",letterSpacing:2,margin:"0 0 2px"}}>Bienvenue</p>
                  <h2 style={{fontSize:20,fontWeight:900,color:"#111827",margin:"0 0 2px"}}>{parent.nom}</h2>
                  <p style={{fontSize:13,color:"#6b7280",margin:0}}>{parent.email}</p>
                </div>
                <div style={{display:"flex",gap:12}}>
                  <div style={{textAlign:"center",background:"#ede9fe",borderRadius:12,padding:"10px 20px"}}>
                    <p style={{fontSize:22,fontWeight:900,color:"#4f46e5",margin:0}}>{reservations.length}</p>
                    <p style={{fontSize:11,color:"#7c3aed",margin:0}}>Réservations</p>
                  </div>
                  <div style={{textAlign:"center",background:"#dcfce7",borderRadius:12,padding:"10px 20px"}}>
                    <p style={{fontSize:22,fontWeight:900,color:"#16a34a",margin:0}}>{reservations.filter(r=>r.statut==="confirmée").length}</p>
                    <p style={{fontSize:11,color:"#16a34a",margin:0}}>Confirmées</p>
                  </div>
                </div>
              </div>

              {/* Liste réservations */}
              <div style={{background:"#fff",borderRadius:20,padding:24,boxShadow:"0 4px 20px rgba(0,0,0,.07)"}}>
                <h3 style={{fontSize:16,fontWeight:800,color:"#111827",margin:"0 0 20px"}}>📅 Historique de vos réservations</h3>

                {reservations.length === 0 ? (
                  <p style={{textAlign:"center",color:"#9ca3af",fontSize:14,padding:"32px 0"}}>Aucune réservation trouvée.</p>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {reservations.map((r,i)=>(
                      <div key={i} style={{border:"1.5px solid #f3f4f6",borderRadius:14,padding:16,display:"flex",flexDirection:"column",gap:8}}>
                        {/* Ligne 1 : référence + statut */}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                          <span style={{fontFamily:"monospace",fontSize:12,background:"#f1f5f9",padding:"3px 10px",borderRadius:6,color:"#374151",fontWeight:700}}>
                            {r.paiement_reference||"—"}
                          </span>
                          <span style={statutStyle(r.statut)}>{r.statut}</span>
                        </div>
                        {/* Ligne 2 : tuteur + matière */}
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          <span style={{fontSize:13,fontWeight:700,color:"#111827"}}>👩‍🏫 {r.tuteur_nom||"Tuteur"}</span>
                          {r.niveau && <span style={{fontSize:12,background:"#ede9fe",color:"#4f46e5",padding:"2px 8px",borderRadius:999,fontWeight:600}}>{r.niveau}</span>}
                          {r.enfant && <span style={{fontSize:12,color:"#6b7280"}}>• {r.enfant}</span>}
                        </div>
                        {/* Ligne 3 : date + montant */}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                          <span style={{fontSize:12,color:"#6b7280"}}>📅 {r.jour}{r.creneau ? ` à ${r.creneau}` : ""} · {r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : ""}</span>
                          <span style={{fontSize:14,fontWeight:800,color:"#111827"}}>{r.montant ? r.montant.toLocaleString("fr-FR")+" FCFA" : "—"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Changer mot de passe */}
              <div style={{background:"#fff",borderRadius:20,padding:24,marginTop:16,boxShadow:"0 4px 20px rgba(0,0,0,.07)"}}>
                <button onClick={()=>setShowChangePwd(v=>!v)}
                  style={{background:"none",border:"none",fontWeight:700,fontSize:14,color:"#4f46e5",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:8}}>
                  🔒 {showChangePwd ? "Masquer" : "Changer mon mot de passe"}
                </button>
                {showChangePwd && (
                  <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:12}}>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4}}>Nouveau mot de passe</label>
                      <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        style={{width:"100%",padding:"10px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4}}>Confirmer le mot de passe</label>
                      <input type="password" value={newPwd2} onChange={e=>setNewPwd2(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        style={{width:"100%",padding:"10px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    </div>
                    {pwdMsg && <p style={{fontSize:13,color:pwdMsg.startsWith("✅")?"#16a34a":"#ef4444",margin:0}}>{pwdMsg}</p>}
                    <button onClick={changerPwd} disabled={pwdLoading}
                      style={{padding:"11px 20px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",opacity:pwdLoading?0.6:1}}>
                      {pwdLoading ? "Enregistrement…" : "Enregistrer le mot de passe"}
                    </button>
                  </div>
                )}
              </div>

              <button onClick={()=>{setParent(null);setEmail("");setPassword("");setReservations([]);}}
                style={{marginTop:16,width:"100%",padding:12,background:"none",border:"1.5px solid #e5e7eb",borderRadius:12,fontWeight:600,fontSize:13,cursor:"pointer",color:"#6b7280"}}>
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginAdmin({ onSuccess, onBack }) {
  const [pwd, setPwd]     = useState("");
  const [error, setError] = useState(false);
  const [show, setShow]   = useState(false);

  const check = () => {
    if (pwd === "Kayden2020@$") { onSuccess(); }
    else { setError(true); setTimeout(() => setError(false), 1500); }
  };

  return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}>
      <div style={{background:"#1e293b",borderRadius:24,padding:48,width:"100%",maxWidth:400,boxShadow:"0 25px 60px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:40,marginBottom:12}}>🎓</div>
          <h1 style={{fontSize:22,fontWeight:900,color:"#fff",margin:"0 0 6px"}}>Brillance Académie</h1>
          <p style={{fontSize:13,color:"#64748b",margin:0}}>Accès administration</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{position:"relative"}}>
            <input
              type={show ? "text" : "password"}
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              onKeyDown={e => e.key === "Enter" && check()}
              placeholder="Mot de passe"
              style={{
                width:"100%", padding:"14px 48px 14px 18px",
                border:`1.5px solid ${error ? "#ef4444" : "#334155"}`,
                borderRadius:12, background:"#0f172a", color:"#fff",
                fontSize:15, outline:"none", boxSizing:"border-box",
                transition:"border-color .2s",
              }}
              autoFocus
            />
            <button onClick={() => setShow(s => !s)}
              style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:16}}>
              {show ? "🙈" : "👁"}
            </button>
          </div>

          {error && <p style={{color:"#ef4444",fontSize:13,margin:0,textAlign:"center"}}>Mot de passe incorrect</p>}

          <button onClick={check}
            style={{padding:"14px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer"}}>
            Accéder au tableau de bord →
          </button>

          <button onClick={onBack}
            style={{padding:"10px",background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer"}}>
            ← Retour au site
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

// ─── Hash routing helpers ─────────────────────────────────────────────────────
function getHash() {
  return window.location.hash.replace(/^#\/?/, "") || "accueil";
}
function setHash(h) {
  window.location.hash = "/" + h;
}

function App() {
  const [hash, setHashState]      = useState(getHash);
  const [booking, setBooking]     = useState(null);
  const [adminAuth, setAdminAuth] = useState(false);

  useEffect(() => {
    const onHash = () => setHashState(getHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goTo = (h) => { setHash(h); setHashState(h); };

  const page = hash.startsWith("paiement") ? "payment"
             : hash === "admin"            ? "admin"
             : hash === "espace-parent"    ? "espace-parent"
             : hash === "espace-tuteur"    ? "espace-tuteur"
             : hash.startsWith("tuteur/")  ? "tuteur"
             : "site";

  const tuteurId = hash.startsWith("tuteur/") ? hash.split("/")[1] : null;

  if (page === "admin" && !adminAuth)
    return <LoginAdmin
      onSuccess={() => setAdminAuth(true)}
      onBack={() => goTo("accueil")}
    />;

  if (page === "admin" && adminAuth)
    return <Admin goHome={() => { goTo("accueil"); setAdminAuth(false); }} />;

  if (page === "espace-parent")
    return <PageEspaceParent goHome={() => goTo("accueil")} />;

  if (page === "espace-tuteur")
    return <PageEspaceTuteur goHome={() => goTo("accueil")} />;

  if (page === "tuteur" && tuteurId)
    return <PageTuteur
      tuteurId={tuteurId}
      goHome={() => goTo("accueil")}
      goPayment={b => { setBooking(b); goTo("paiement"); }}
    />;

  if (page === "payment" && booking)
    return (
      <PagePaiement
        booking={booking}
        onBack={()  => goTo("accueil")}
        onSuccess={() => { setBooking(null); goTo("accueil"); }}
      />
    );

  return (
    <SitePublic
      goAdmin={()  => goTo("admin")}
      goPayment={b => { setBooking(b); goTo("paiement"); }}
      goEspaceParent={() => goTo("espace-parent")}
      goEspaceTuteur={() => goTo("espace-tuteur")}
    />
  );
}

export default App;
