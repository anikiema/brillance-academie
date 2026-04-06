// Brillance Académie v1.1 — admin protégé
import { useState, useEffect } from "react";
import { getTuteurs, getTousTuteurs, getReservations, getParents, creerReservation, ajouterParent, modifierParent, supprimerParent, ajouterTuteur, modifierTuteur, supprimerTuteur, changerStatutReservation } from "./lib/supabase.js";

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
const JOURS   = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
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

const QUARTIERS = ["Bonheur Ville","Ouaga 2000","Hamdalaye","Gounghin","Patte d'Oie","Wemtenga","Pissy","Karpala","Dassasgo"];

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

function Inp({ label, value, onChange, placeholder, type="text" }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <label style={{fontSize:13,fontWeight:600,color:"#374151"}}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{border:"1.5px solid #e5e7eb",borderRadius:12,padding:"11px 16px",fontSize:14,outline:"none",background:"#fafafa"}}
        onFocus={e=>e.target.style.borderColor="#4f46e5"}
        onBlur={e=>e.target.style.borderColor="#e5e7eb"}
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

function BadgeStatus({ s }) {
  const map = {"Actif":["#d1fae5","#065f46"],"Inactif":["#f3f4f6","#6b7280"],"En attente":["#fef3c7","#92400e"]};
  const [bg,fg] = map[s]||["#f3f4f6","#6b7280"];
  return <span style={{background:bg,color:fg,padding:"3px 10px",borderRadius:999,fontSize:12,fontWeight:700}}>{s}</span>;
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

// ─── PAGE PAIEMENT SÉCURISÉ ───────────────────────────────────────────────────

function PagePaiement({ booking, onSuccess, onBack }) {
  const { tuteur, jour, creneau, enfant, niveau, duree = "1h" } = booking;
  const [method, setMethod] = useState("orange");
  const [phone,  setPhone]  = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry,  setExpiry]  = useState("");
  const [cvv,     setCvv]     = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [txRef,   setTxRef]   = useState("");

  const essaiAmount = Math.round((tuteur?.price || 27500) * 0.8);

  const METHODS = [
    { id:"orange", abbr:"OM",   label:"Orange Money",  abbColor:"#f97316", bg:"#fff7ed", border:"#fed7aa", selBorder:"#f97316" },
    { id:"moov",   abbr:"Moov", label:"Moov Money",    abbColor:"#0ea5e9", bg:"#e0f2fe", border:"#bae6fd", selBorder:"#0ea5e9" },
    { id:"mtn",    abbr:"MTN",  label:"MTN MoMo",      abbColor:"#fff",    bg:"#fef9c3", border:"#fde68a", selBorder:"#eab308", abkBg:"#1c1917" },
    { id:"visa",   abbr:"VISA", label:"Carte bancaire", abbColor:"#374151", bg:"#f9fafb", border:"#e5e7eb", selBorder:"#374151" },
  ];

  const cur = METHODS.find(m => m.id === method);
  const mobileMethod = ["orange","moov","mtn"].includes(method);
  const phonePlaceholder = {orange:"+226 70 XX XX XX", moov:"+226 65 XX XX XX", mtn:"+226 76 XX XX XX"}[method] || "+226 XX XX XX XX";

  const canPay = mobileMethod ? phone.replace(/[\s+]/g,"").length >= 8 : cardNum.length >= 16 && expiry.length >= 4 && cvv.length >= 3;

  // Charger le script Flutterwave une seule fois
  useEffect(() => {
    if (document.getElementById("flw-script")) return;
    const s = document.createElement("script");
    s.id  = "flw-script";
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  const FLW_PUBLIC_KEY = "FLWPUBK_TEST-8df603ddb75524da26e0b7c366bd681b-X";

  const flwOptions = {
    orange: "mobilemoneyfranco",
    moov:   "mobilemoneyfranco",
    mtn:    "mobilemoneyghana",
    visa:   "card",
  };

  const pay = () => {
    if (!canPay || loading) return;
    setLoading(true);
    const ref = "BA-" + Date.now();
    setTxRef(ref);

    window.FlutterwaveCheckout({
      public_key:      FLW_PUBLIC_KEY,
      tx_ref:          ref,
      amount:          essaiAmount,
      currency:        "XOF",
      payment_options: flwOptions[method] || "mobilemoneyfranco,card",
      customer: {
        email:       booking.parentEmail || "client@brillanceacademie.com",
        name:        booking.parentNom   || "Parent",
        phonenumber: phone,
      },
      customizations: {
        title:       "Brillance Académie",
        description: `Séance avec ${tuteur?.prenom || ""} ${tuteur?.nom || ""} — ${tuteur?.subject || ""}`,
        logo:        "https://brillianceacademie.com/favicon.ico",
      },
      callback: (data) => {
        setLoading(false);
        if (data.status === "successful" || data.status === "completed") {
          setDone(true);
          setTimeout(onSuccess, 2000);
        }
      },
      onclose: () => { setLoading(false); },
    });
  };

  const S = { fontFamily:"'Comic Sans MS','Comic Sans',cursive", color:"#111827" };

  const refNum = "BA-" + Math.random().toString(36).slice(2,8).toUpperCase();

  if (done) return (
    <div style={{...S, minHeight:"100vh", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", padding:24}}>
      <div style={{maxWidth:520, width:"100%"}}>

        {/* Success header */}
        <div style={{textAlign:"center", marginBottom:32}}>
          <div style={{width:80, height:80, background:"#d1fae5", borderRadius:999, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto 20px", boxShadow:"0 0 0 12px #f0fdf4, 0 0 0 20px #dcfce7"}}>✅</div>
          <h2 style={{fontSize:28, fontWeight:900, margin:"0 0 8px", color:"#111827"}}>Séance confirmée !</h2>
          <p style={{color:"#6b7280", fontSize:15, margin:0}}>Paiement accepté · Référence <strong style={{color:"#4f46e5"}}>{refNum}</strong></p>
        </div>

        {/* Booking card */}
        <div style={{background:"#fff", borderRadius:20, padding:28, marginBottom:20, boxShadow:"0 4px 20px rgba(0,0,0,.07)"}}>
          <div style={{display:"flex", gap:14, alignItems:"center", marginBottom:24, paddingBottom:20, borderBottom:"1px solid #f3f4f6"}}>
            <div style={{width:52, height:52, background:"#ede9fe", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26}}>{tuteur?.emoji||"👩‍🏫"}</div>
            <div>
              <p style={{fontWeight:800, fontSize:17, margin:0}}>{tuteur?.prenom} {tuteur?.nom}</p>
              <p style={{fontSize:13, color:"#6366f1", margin:"3px 0 0", fontWeight:600}}>{tuteur?.subject}</p>
            </div>
            <div style={{marginLeft:"auto", textAlign:"right"}}>
              <p style={{fontSize:13, color:"#9ca3af", margin:0, textDecoration:"line-through"}}>{fmt(tuteur?.price||0)}</p>
              <p style={{fontSize:20, fontWeight:900, color:"#4f46e5", margin:0}}>{fmt(essaiAmount)}</p>
              <span style={{fontSize:11, background:"#dcfce7", color:"#065f46", padding:"2px 8px", borderRadius:999, fontWeight:700}}>−20 %</span>
            </div>
          </div>

          {[
            ["📅 Jour & heure", `${jour} à ${creneau}`],
            ["👧 Élève",        `${enfant} · ${niveau}`],
            ["💳 Paiement",     {orange:"Orange Money",wave:"Wave",mtn:"MTN MoMo",moov:"Moov Money",visa:"Carte bancaire"}[method] || method],
            ["📱 Contact",      phone || "—"],
          ].map(([k,v])=>(
            <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f9fafb", fontSize:14}}>
              <span style={{color:"#6b7280"}}>{k}</span>
              <span style={{fontWeight:600, color:"#111827"}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Next steps */}
        <div style={{background:"#ede9fe", borderRadius:16, padding:20, marginBottom:20}}>
          <p style={{fontWeight:700, fontSize:14, color:"#5b21b6", margin:"0 0 12px"}}>📲 Prochaines étapes</p>
          {[
            "Un SMS de confirmation a été envoyé sur votre numéro",
            `${tuteur?.prenom} vous contactera par WhatsApp 24h avant la séance`,
            "Vous recevrez un compte-rendu après chaque séance",
          ].map((s,i)=>(
            <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start", marginBottom:i<2?10:0}}>
              <span style={{width:20,height:20,background:"#fff",borderRadius:999,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#7c3aed",flexShrink:0}}>{i+1}</span>
              <p style={{fontSize:13, color:"#5b21b6", margin:0, lineHeight:1.5}}>{s}</p>
            </div>
          ))}
        </div>

        <button onClick={onBack} style={{width:"100%", padding:"14px", background:"#4f46e5", color:"#fff", border:"none", borderRadius:14, fontWeight:700, fontSize:15, cursor:"pointer"}}>
          Retour à l'accueil →
        </button>
      </div>
    </div>
  );

  return (
    <div style={{...S, minHeight:"100vh", background:"#f9fafb"}}>

      {/* Header */}
      <div style={{background:"#fff", borderBottom:"1px solid #f3f4f6", padding:"0 40px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <span style={{fontWeight:900, fontSize:20, color:"#4f46e5", letterSpacing:"-0.5px"}}>Brillance</span>
        <div style={{display:"flex", alignItems:"center", gap:8, color:"#6b7280", fontSize:14}}>
          <span style={{width:18, height:18, border:"2px solid #10b981", borderRadius:4, display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#10b981", fontSize:11}}>✓</span>
          <span style={{fontWeight:600, color:"#374151"}}>Paiement sécurisé</span>
        </div>
      </div>

      <div style={{maxWidth:640, margin:"0 auto", padding:"40px 24px"}}>

        {/* Résumé de séance */}
        <div style={{background:"#f0ebe3", borderRadius:16, padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:36}}>
          <div>
            <p style={{fontWeight:700, fontSize:16, margin:"0 0 4px"}}>Séance de tutorat</p>
            <p style={{fontSize:14, color:"#6b7280", margin:0}}>
              {tuteur?.prenom} {tuteur?.nom} · {tuteur?.subject} · {duree} · {jour} {creneau}
            </p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:28, fontWeight:900, margin:0, letterSpacing:"-0.5px"}}>{(essaiAmount).toLocaleString("fr-FR")}</p>
            <p style={{fontSize:13, color:"#6b7280", margin:0, fontWeight:600}}>FCFA</p>
          </div>
        </div>

        {/* Choix du mode de paiement */}
        <p style={{fontWeight:700, fontSize:16, marginBottom:16}}>Choisissez votre moyen de paiement</p>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginBottom:10}}>
          {METHODS.slice(0,4).map(m => (
            <button key={m.id} onClick={()=>setMethod(m.id)}
              style={{padding:"16px 10px", borderRadius:14, border:`2px solid ${method===m.id?"#4f46e5":m.border}`,
                background: method===m.id?"#f5f3ff":"#fff", cursor:"pointer", display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:6, transition:"all .15s", minHeight:90}}>
              {m.id==="mtn"
                ? <span style={{background:"#1c1917", color:"#eab308", fontWeight:900, fontSize:13, padding:"3px 8px", borderRadius:6}}>{m.abbr}</span>
                : <span style={{fontWeight:900, fontSize:17, color: method===m.id?"#4f46e5":m.abbColor}}>{m.abbr}</span>}
              <span style={{fontSize:12, color: method===m.id?"#4f46e5":"#6b7280", fontWeight:500}}>{m.label}</span>
            </button>
          ))}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginBottom:32}}>
          <button onClick={()=>setMethod("visa")}
            style={{padding:"16px 10px", borderRadius:14, border:`2px solid ${method==="visa"?"#4f46e5":"#e5e7eb"}`,
              background:method==="visa"?"#f5f3ff":"#fff", cursor:"pointer", display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:6, minHeight:90}}>
            <span style={{fontWeight:900, fontSize:13, color:method==="visa"?"#4f46e5":"#374151"}}>VISA / MC</span>
            <span style={{fontSize:12, color:method==="visa"?"#4f46e5":"#6b7280"}}>Carte bancaire</span>
          </button>
        </div>

        {/* Formulaire selon le mode */}
        <div style={{background:"#eef2ff", borderRadius:16, padding:24, display:"flex", flexDirection:"column", gap:16}}>

          {mobileMethod && <>
            <p style={{fontWeight:700, fontSize:16, margin:0, color:"#3730a3"}}>Paiement par {cur?.label}</p>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              <label style={{fontSize:13, fontWeight:600, color:"#4f46e5"}}>Numéro de téléphone {cur?.label}</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder={phonePlaceholder} type="tel"
                style={{padding:"14px 18px", borderRadius:12, border:"1.5px solid #c7d2fe", fontSize:15,
                  background:"#fff", outline:"none", color:"#111827", letterSpacing:"0.5px"}}/>
            </div>
          </>}

          {method === "visa" && <>
            <p style={{fontWeight:700, fontSize:16, margin:0, color:"#374151"}}>Paiement par carte bancaire</p>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              <label style={{fontSize:13, fontWeight:600, color:"#374151"}}>Numéro de carte</label>
              <input value={cardNum} onChange={e=>setCardNum(e.target.value.replace(/\D/g,"").slice(0,16))}
                placeholder="1234 5678 9012 3456" type="text"
                style={{padding:"14px 18px", borderRadius:12, border:"1.5px solid #d1d5db", fontSize:15, background:"#fff", outline:"none"}}/>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
              <div style={{display:"flex", flexDirection:"column", gap:6}}>
                <label style={{fontSize:13, fontWeight:600, color:"#374151"}}>Expiration (MM/AA)</label>
                <input value={expiry} onChange={e=>setExpiry(e.target.value.replace(/\D/g,"").slice(0,4))}
                  placeholder="MM/AA" type="text"
                  style={{padding:"14px 18px", borderRadius:12, border:"1.5px solid #d1d5db", fontSize:15, background:"#fff", outline:"none"}}/>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:6}}>
                <label style={{fontSize:13, fontWeight:600, color:"#374151"}}>CVV</label>
                <input value={cvv} onChange={e=>setCvv(e.target.value.replace(/\D/g,"").slice(0,3))}
                  placeholder="123" type="text"
                  style={{padding:"14px 18px", borderRadius:12, border:"1.5px solid #d1d5db", fontSize:15, background:"#fff", outline:"none"}}/>
              </div>
            </div>
          </>}

          {/* Total + bouton payer */}
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fff", borderRadius:12, padding:"14px 18px", marginTop:4}}>
            <div>
              <p style={{margin:0, fontSize:13, color:"#6b7280"}}>Total à payer</p>
              <div style={{display:"flex", alignItems:"baseline", gap:6}}>
                <span style={{fontSize:22, fontWeight:900, color:"#111827"}}>{essaiAmount.toLocaleString("fr-FR")}</span>
                <span style={{fontSize:13, fontWeight:600, color:"#6b7280"}}>FCFA</span>
                <span style={{fontSize:12, color:"#9ca3af", textDecoration:"line-through", marginLeft:4}}>{(tuteur?.price||27500).toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>
            <span style={{fontSize:12, background:"#dcfce7", color:"#065f46", padding:"4px 10px", borderRadius:999, fontWeight:700}}>-20 % essai</span>
          </div>

          <button onClick={pay} disabled={loading || !canPay}
            style={{padding:"15px", borderRadius:12, border:"none", cursor:canPay&&!loading?"pointer":"not-allowed",
              fontWeight:700, fontSize:15, background:canPay?"#4f46e5":"#e5e7eb", color:canPay?"#fff":"#9ca3af",
              transition:"all .15s", display:"flex", alignItems:"center", justifyContent:"center", gap:10}}>
            {loading
              ? <><svg style={{width:18,height:18,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Traitement en cours…</>
              : `Payer ${essaiAmount.toLocaleString("fr-FR")} FCFA →`}
          </button>

          <div style={{display:"flex", justifyContent:"center", gap:20, marginTop:4}}>
            {["🔒 SSL sécurisé", "✓ Paiement chiffré", "✓ Aucune donnée stockée"].map(t=>(
              <span key={t} style={{fontSize:11, color:"#6b7280"}}>{t}</span>
            ))}
          </div>
        </div>

        <button onClick={onBack} style={{display:"block", margin:"20px auto 0", background:"none", border:"none", color:"#9ca3af", fontSize:13, cursor:"pointer"}}>
          ← Annuler et revenir
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── INSCRIPTION PARENT ────────────────────────────────────────────────────────

function InscriptionParent({ onClose }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ nom:"", email:"", tel:"", ville:"", enfant:"", age:"", niveau:"", matieres:[], objectif:"", frequence:"1 fois par semaine" });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setD(p=>({...p,[k]:v}));
  const tog = m => set("matieres", d.matieres.includes(m)?d.matieres.filter(x=>x!==m):[...d.matieres,m]);

  const ok = [d.nom&&d.email&&d.tel&&d.ville, d.enfant&&d.niveau, d.matieres.length>0, true];

  const envoyer = async () => {
    setSaving(true);
    try {
      await ajouterParent({
        nom:       d.nom,
        email:     d.email,
        telephone: d.tel,
        enfant:    `${d.enfant}${d.niveau ? ", " + d.niveau : ""}`,
        statut:    "En attente",
        sessions:  0,
      });
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
        <Inp label="Votre nom complet" value={d.nom} onChange={v=>set("nom",v)} placeholder="Aminata Diallo"/>
        <Inp label="E-mail" value={d.email} onChange={v=>set("email",v)} placeholder="aminata@gmail.com" type="email"/>
        <Inp label="Téléphone (WhatsApp)" value={d.tel} onChange={v=>set("tel",v)} placeholder="77 XXX XX XX" type="tel"/>
        <Inp label="Ville" value={d.ville} onChange={v=>set("ville",v)} placeholder="Ouagadougou"/>
      </div>
    </>,
    <>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",marginBottom:16}}>Votre enfant</p>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Prénom de l'enfant" value={d.enfant} onChange={v=>set("enfant",v)} placeholder="Moussa"/>
        <Inp label="Âge" value={d.age} onChange={v=>set("age",v)} placeholder="10" type="number"/>
        <Sel label="Niveau scolaire" value={d.niveau} onChange={v=>set("niveau",v)} options={NIVEAUX}/>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>École fréquentée (optionnel)</label>
          <select style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:12,padding:"11px 16px",fontSize:13,background:"#fafafa",outline:"none"}}>
            <option>— Choisir une école partenaire —</option>
            {ECOLES_PARTENAIRES.map(e=><option key={e}>{e}</option>)}
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
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ prenom:"", nom:"", email:"", tel:"", ville:"", matieres:[], niveaux:[], experience:"", diplome:"", jours:[] });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setD(p=>({...p,[k]:v}));
  const tog = (k,v) => set(k, d[k].includes(v)?d[k].filter(x=>x!==v):[...d[k],v]);

  const ok = [d.prenom&&d.nom&&d.email&&d.tel&&d.ville, d.matieres.length>0&&d.niveaux.length>0&&d.experience, d.jours.length>0, true];

  const envoyer = async () => {
    setSaving(true);
    try {
      await ajouterTuteur({
        prenom:        d.prenom,
        nom:           d.nom,
        subject:       d.matieres.join(", ") || "Non spécifié",
        price:         27500,
        statut:        "En attente",
        bio:           [d.experience && `${d.experience} d'expérience`, d.diplome].filter(Boolean).join(". "),
        niveaux:       d.niveaux,
        availableDays: d.jours,
        quartier:      d.ville || "",
        emoji:         "👩‍🏫",
      });
      setStep(4);
    } catch(e) {
      alert("Erreur lors de l'envoi : " + e.message);
    }
    setSaving(false);
  };

  if (step===4) return (
    <Modal title="Candidature envoyée !" onClose={onClose}>
      <div style={{textAlign:"center",padding:"24px 0"}}>
        <div style={{fontSize:52}}>🎉</div>
        <p style={{color:"#6b7280",marginTop:16,lineHeight:1.6}}>Votre profil sera examiné par notre équipe.<br/>Réponse garantie sous 48h.</p>
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
      <Inp label="E-mail" value={d.email} onChange={v=>set("email",v)} placeholder="" type="email"/>
      <Inp label="Téléphone" value={d.tel} onChange={v=>set("tel",v)} placeholder="" type="tel"/>
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
      <Inp label="Années d'expérience" value={d.experience} onChange={v=>set("experience",v)} placeholder="Ex. : 3 ans"/>
      <Inp label="Diplôme le plus élevé" value={d.diplome} onChange={v=>set("diplome",v)} placeholder="Master Sciences de l'éducation"/>
    </div>,
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",margin:0}}>Vos disponibilités</p>
      <div>
        <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Jours disponibles</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{JOURS.map(j=><Pill key={j} active={d.jours.includes(j)} onClick={()=>tog("jours",j)}>{j}</Pill>)}</div>
      </div>
    </div>,
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <p style={{fontSize:15,fontWeight:700,color:"#111827",margin:0}}>Récapitulatif</p>
      <div style={{background:"#f5f3ff",borderRadius:16,padding:18,display:"flex",flexDirection:"column",gap:10}}>
        {[["Nom",`${d.prenom} ${d.nom}`],["Contact",d.email],["Ville",d.ville],["Matières",d.matieres.join(", ")],["Niveaux",d.niveaux.join(", ")],["Expérience",d.experience],["Jours",d.jours.join(", ")]]
          .map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#6b7280"}}>{k}</span><span style={{fontWeight:600,color:"#111827",textAlign:"right",maxWidth:"60%"}}>{v||"—"}</span></div>)}
      </div>
      <p style={{fontSize:11,color:"#9ca3af"}}>Réponse sous 48h après examen de votre profil.</p>
    </div>,
  ];

  return (
    <Modal title="Devenir tuteur" sub="Rejoignez notre réseau et aidez des enfants à progresser." onClose={onClose}>
      <Steps labels={["Profil","Compétences","Dispo.","Confirmation"]} current={step}/>
      {screens[step]}
      <div style={{display:"flex",gap:10,marginTop:20}}>
        {step>0 && <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:13,border:"1.5px solid #e5e7eb",borderRadius:12,background:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>← Retour</button>}
        <button disabled={!ok[step]||saving} onClick={step===3 ? envoyer : ()=>setStep(s=>s+1)}
          style={{flex:1,padding:13,border:"none",borderRadius:12,background:ok[step]&&!saving?"#4f46e5":"#e5e7eb",color:ok[step]&&!saving?"#fff":"#9ca3af",fontWeight:700,fontSize:14,cursor:ok[step]&&!saving?"pointer":"not-allowed"}}>
          {saving?"Envoi en cours…":step===3?"Envoyer ma candidature ✓":"Continuer →"}
        </button>
      </div>
    </Modal>
  );
}

// ─── SITE PUBLIC ───────────────────────────────────────────────────────────────

function SitePublic({ goAdmin, goPayment }) {
  const [modal, setModal]   = useState(null);
  const [search, setSearch] = useState("");
  const [activeM, setActiveM] = useState(null);
  const [activeQ, setActiveQ] = useState(null);
  const [activeN, setActiveN] = useState(null);
  const [tab, setTab]       = useState("parents");
  const [bookStep, setBook] = useState(0);
  const [tuteur, setTuteur] = useState(null);
  const [jour, setJour]     = useState(null);
  const [creneau, setCreneau] = useState(null);
  const [bi, setBi]         = useState({nom:"",email:"",enfant:"",niveau:""});
  const [bookDone, setBookDone] = useState(false);

  const setBI = (k,v) => setBi(p=>({...p,[k]:v}));

  const filteredTuteurs = TUTEURS.filter(t => {
    if (t.statut !== "Actif") return false;
    if (activeM && t.subject !== activeM) return false;
    if (activeQ && t.quartier !== activeQ) return false;
    if (activeN && !(t.niveaux||[]).includes(activeN)) return false;
    if (search && !t.prenom.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hasFilters = activeM || activeQ || activeN || search;

  const S = { // shared styles
    page:    { fontFamily:"'Comic Sans MS','Comic Sans',cursive", color:"#111827", background:"#f0efe8", backgroundImage:"repeating-linear-gradient(transparent, transparent 27px, rgba(148,163,184,0.25) 27px, rgba(148,163,184,0.25) 28px)", margin:0 },
    nav:     { position:"sticky", top:0, zIndex:100, background:"#ebebE2", borderBottom:"1px solid #d4d4c8", padding:"0 40px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 },
    navLink: { background:"none", border:"none", color:"#22c55e", fontSize:15, fontWeight:600, cursor:"pointer", padding:"0 4px", fontFamily:"'Comic Sans MS','Comic Sans',cursive" },
    btn:     { padding:"11px 26px", borderRadius:999, border:"none", fontWeight:700, fontSize:14, cursor:"pointer" },
    section: { padding:"80px 40px", maxWidth:1100, margin:"0 auto" },
    label:   { fontSize:11, fontWeight:700, color:"#6366f1", textTransform:"uppercase", letterSpacing:2, display:"block", marginBottom:10 },
    h2:      { fontSize:36, fontWeight:800, color:"#111827", margin:"0 0 14px", lineHeight:1.2 },
    sub:     { fontSize:16, color:"#6b7280", lineHeight:1.6, maxWidth:560 },
    card:    { background:"#f9fafb", border:"1.5px solid #f3f4f6", borderRadius:20, padding:24, display:"flex", flexDirection:"column", gap:10 },
  };

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({behavior:"smooth"});

  return (
    <div style={S.page}>
      {modal==="parent" && <InscriptionParent onClose={()=>setModal(null)}/>}
      {modal==="tuteur" && <InscriptionTuteur onClose={()=>setModal(null)}/>}

      {/* NAV */}
      <nav style={S.nav}>
        <span style={{fontSize:18,fontWeight:800,color:"#4f46e5",letterSpacing:"-0.5px"}}>Brillance Académie</span>
        <div style={{display:"flex",gap:28}}>
          {[["Trouver un tuteur","tutors"],["Matières","matieres"],["Comment ça marche","how"],["Avis","avis"]].map(([l,id])=>(
            <button key={id} onClick={()=>scrollTo(id)} style={S.navLink} onMouseOver={e=>e.target.style.color="#16a34a"} onMouseOut={e=>e.target.style.color="#22c55e"}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={()=>setModal("tuteur")} style={{...S.btn,background:"#f3f4f6",color:"#374151"}}>Devenir tuteur</button>
          <button onClick={()=>setModal("parent")} style={{...S.btn,background:"#dc2626",color:"#fff"}}>Commencer</button>
          <button onClick={goAdmin} style={{...S.btn,background:"#111827",color:"#fff",fontSize:12,padding:"9px 16px"}}>⚙</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{textAlign:"center",padding:"90px 40px 60px",background:"#fafafa"}}>
        <span style={{display:"inline-block",background:"#ede9fe",color:"#5b21b6",fontSize:13,fontWeight:600,padding:"5px 16px",borderRadius:999,marginBottom:24}}>
          Tuteurs spécialisés élémentaire · CP au CM2
        </span>
        <h1 style={{fontSize:54,fontWeight:900,color:"#111827",lineHeight:1.1,maxWidth:640,margin:"0 auto 18px",letterSpacing:"-1.5px"}}>
          Trouvez le bon tuteur<br/>pour votre enfant
        </h1>
        <p style={{fontSize:17,color:"#6b7280",maxWidth:520,margin:"0 auto 40px",lineHeight:1.7}}>
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
        <div style={{display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
          {[["✓","Tuteurs vérifiés"],["✓","Certifiés élémentaire"],["✓","Première séance gratuite"]].map(([icon,txt])=>(
            <span key={txt} style={{fontSize:14,color:"#374151",display:"flex",alignItems:"center",gap:6}}>
              <span style={{color:"#10b981",fontWeight:700}}>{icon}</span>{txt}
            </span>
          ))}
        </div>
      </div>

      {/* FILTRES */}
      <div id="matieres" style={{borderTop:"1px solid #d4d4c8",borderBottom:"1px solid #d4d4c8",padding:"20px 40px",background:"rgba(255,255,255,0.45)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>

          {/* Matières */}
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:700,color:"#9ca3af",minWidth:60}}>Matière</span>
            <Pill active={activeM===null} onClick={()=>setActiveM(null)}>Toutes</Pill>
            {MATIERES.map(({label,emoji})=>(
              <Pill key={label} active={activeM===label} onClick={()=>setActiveM(activeM===label?null:label)}>{emoji} {label}</Pill>
            ))}
          </div>

          {/* Quartier */}
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:700,color:"#9ca3af",minWidth:60}}>Quartier</span>
            <Pill active={activeQ===null} onClick={()=>setActiveQ(null)}>Tous</Pill>
            {QUARTIERS.map(q=>(
              <Pill key={q} active={activeQ===q} onClick={()=>setActiveQ(activeQ===q?null:q)}>📍 {q}</Pill>
            ))}
          </div>

          {/* Niveau */}
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:700,color:"#9ca3af",minWidth:60}}>Niveau</span>
            <Pill active={activeN===null} onClick={()=>setActiveN(null)}>Tous</Pill>
            {NIVEAUX.map(n=>(
              <Pill key={n} active={activeN===n} onClick={()=>setActiveN(activeN===n?null:n)}>{n}</Pill>
            ))}
          </div>

          {hasFilters && (
            <button onClick={()=>{setActiveM(null);setActiveQ(null);setActiveN(null);setSearch("");}}
              style={{alignSelf:"flex-start",background:"none",border:"none",color:"#6366f1",fontWeight:700,fontSize:13,cursor:"pointer",padding:0}}>
              ✕ Effacer tous les filtres
            </button>
          )}
        </div>
      </div>

      {/* TUTEURS */}
      <div id="tutors" style={{...S.section}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:32}}>
          <div>
            <span style={S.label}>Notre équipe</span>
            <h2 style={{...S.h2,marginBottom:0}}>{filteredTuteurs.length} tuteur{filteredTuteurs.length>1?"s":""} disponible{filteredTuteurs.length>1?"s":""}</h2>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {(activeQ||activeN) && <span style={{fontSize:13,color:"#6b7280"}}>{[activeQ,activeN].filter(Boolean).map(f=><span key={f} style={{background:"#eef2ff",color:"#4f46e5",padding:"3px 10px",borderRadius:999,fontSize:12,fontWeight:600,marginRight:4}}>✓ {f}</span>)}</span>}
          </div>
        </div>

        {filteredTuteurs.length===0 && (
          <div style={{textAlign:"center",padding:"60px 0",color:"#9ca3af"}}>
            <p style={{fontSize:40}}>🔍</p>
            <p style={{fontSize:16,fontWeight:600,marginTop:12}}>Aucun tuteur trouvé</p>
            <p style={{fontSize:14,marginTop:4}}>Essayez un autre terme ou matière.</p>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
          {filteredTuteurs.map(t=>(
            <div key={t.id} style={{...S.card,transition:"box-shadow .2s"}}
              onMouseOver={e=>e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,.1)"}
              onMouseOut={e=>e.currentTarget.style.boxShadow="none"}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:52,height:52,borderRadius:999,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{t.emoji}</div>
                <div>
                  <p style={{fontWeight:800,fontSize:16,margin:0,color:"#111827"}}>{t.prenom} {t.nom}</p>
                  <p style={{fontSize:13,color:"#6366f1",fontWeight:600,margin:"2px 0 0"}}>{t.subject}</p>
                </div>
                <div style={{marginLeft:"auto",textAlign:"right"}}>
                  <p style={{fontWeight:800,fontSize:18,margin:0,color:"#111827"}}>{fmt(t.price)}</p>
                  <p style={{fontSize:11,color:"#9ca3af",margin:0}}>par heure</p>
                </div>
              </div>
              <p style={{fontSize:13,color:"#6b7280",margin:0,lineHeight:1.6}}>{t.bio}</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <Stars n={t.rating}/>
                  <span style={{fontSize:12,color:"#9ca3af"}}>{t.sessions} séances</span>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {t.availableDays.slice(0,2).map(j=><span key={j} style={{fontSize:11,background:"#f3f4f6",padding:"3px 8px",borderRadius:999,color:"#6b7280"}}>{j}</span>)}
                </div>
              </div>
              <button onClick={()=>{setTuteur(t);setBook(1);scrollTo("book");}}
                style={{width:"100%",padding:"11px",borderRadius:12,border:"1.5px solid #e5e7eb",background:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",color:"#4f46e5",marginTop:4,transition:"all .15s"}}
                onMouseOver={e=>{e.target.style.background="#4f46e5";e.target.style.color="#fff";e.target.style.borderColor="#4f46e5"}}
                onMouseOut={e=>{e.target.style.background="#fff";e.target.style.color="#4f46e5";e.target.style.borderColor="#e5e7eb"}}>
                Réserver une séance →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ÉCOLES PARTENAIRES (marketing) */}
      <div style={{background:"#fafafa",borderTop:"1px solid #f3f4f6",padding:"48px 40px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",textAlign:"center"}}>
          <p style={{fontSize:12,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:2,marginBottom:24}}>
            Nos tuteurs maîtrisent les programmes de ces établissements
          </p>
          <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center"}}>
            {ECOLES_PARTENAIRES.map(e=>(
              <span key={e} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 16px",fontSize:13,color:"#6b7280",fontWeight:500}}>🏫 {e}</span>
            ))}
          </div>
          <p style={{fontSize:12,color:"#d1d5db",marginTop:16}}>Votre enfant n'est pas dans une école partenaire ? Nos tuteurs s'adaptent à tous les programmes.</p>
        </div>
      </div>

      {/* COMMENT ÇA MARCHE */}
      <div id="how" style={{background:"rgba(255,255,255,0.35)",padding:"80px 40px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <span style={S.label}>Comment ça marche</span>
            <h2 style={S.h2}>De la recherche à la première séance<br/>en moins de 24h</h2>
            <p style={{...S.sub,margin:"0 auto"}}>Un processus simple, transparent, sans surprise.</p>
          </div>

          {/* Steps timeline */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:24,marginBottom:56}}>
            {[
              {n:"01",icon:"📝",bg:"#ede9fe",color:"#7c3aed",t:"Décrivez les besoins de votre enfant",d:"Remplissez notre formulaire en 2 minutes : matière, niveau, quartier de Ouagadougou, disponibilités. Plus c'est précis, meilleur sera le match.",tag:"2 min"},
              {n:"02",icon:"🔍",bg:"#dbeafe",color:"#2563eb",t:"On sélectionne votre tuteur",d:"Notre équipe revoit les profils et sélectionne 1 à 3 tuteurs adaptés au niveau et au programme de votre école. Chaque tuteur est vérifié et certifié.",tag:"Sous 24h"},
              {n:"03",icon:"📅",bg:"#dcfce7",color:"#16a34a",t:"Vous choisissez le créneau",d:"On vous propose des créneaux disponibles selon votre quartier. Séances à domicile ou en ligne, selon votre préférence.",tag:"Flexible"},
              {n:"04",icon:"💳",bg:"#fef3c7",color:"#d97706",t:"Paiement sécurisé à la séance",d:"Orange Money, Wave, MTN MoMo, Moov ou carte bancaire. Aucun abonnement, aucun engagement. La première séance d'essai est à −20 %.",tag:"Sans engagement"},
              {n:"05",icon:"📊",bg:"#fce7f3",color:"#db2777",t:"Suivi & compte-rendu",d:"Après chaque séance, vous recevez un compte-rendu par WhatsApp : points travaillés, progrès, exercices recommandés.",tag:"Après chaque séance"},
              {n:"06",icon:"🏆",bg:"#f0fdf4",color:"#15803d",t:"Résultats garantis",d:"Si vous n'êtes pas satisfait après la première séance, nous vous remboursons intégralement. Zéro risque, satisfaction garantie.",tag:"Garantie 100 %"},
            ].map(({n,icon,bg,color,t,d,tag})=>(
              <div key={n} style={{background:"#fff",borderRadius:20,padding:28,display:"flex",gap:20,alignItems:"flex-start",border:"1.5px solid #f3f4f6",transition:"box-shadow .2s"}}
                onMouseOver={e=>e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.09)"}
                onMouseOut={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{width:52,height:52,borderRadius:16,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:10,fontWeight:800,color:"#d1d5db",letterSpacing:2}}>{n}</span>
                    <span style={{fontSize:11,fontWeight:700,background:bg,color,padding:"2px 10px",borderRadius:999}}>{tag}</span>
                  </div>
                  <h3 style={{fontSize:16,fontWeight:800,color:"#111827",margin:"0 0 8px"}}>{t}</h3>
                  <p style={{fontSize:13,color:"#6b7280",lineHeight:1.7,margin:0}}>{d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee banner */}
          <div style={{background:"#111827",borderRadius:24,padding:"36px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,flexWrap:"wrap"}}>
            <div>
              <p style={{color:"#a5b4fc",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:2,margin:"0 0 8px"}}>Notre engagement</p>
              <h3 style={{fontSize:22,fontWeight:800,color:"#fff",margin:"0 0 8px"}}>Première séance non satisfaisante ? On rembourse.</h3>
              <p style={{color:"#9ca3af",fontSize:14,margin:0}}>Aucun risque pour les familles. C'est ça, la confiance Brillance Académie.</p>
            </div>
            <button onClick={()=>setModal("parent")} style={{padding:"14px 32px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:15,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
              Démarrer gratuitement →
            </button>
          </div>
        </div>
      </div>

      {/* AVIS */}
      <div id="avis" style={{...S.section,background:"rgba(255,255,255,0.35)",maxWidth:"none",padding:"80px 40px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:40}}>
            <div><span style={S.label}>Témoignages</span><h2 style={{...S.h2,marginBottom:0}}>Ce que disent les familles</h2></div>
            <div style={{display:"flex",gap:8}}>
              {[["parents","👨‍👩‍👧 Parents"],["tuteurs","📖 Tuteurs"]].map(([v,l])=>(
                <Pill key={v} active={tab===v} onClick={()=>setTab(v)}>{l}</Pill>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20}}>
            {(tab==="parents" ? [
              {q:"Mon fils avait de grosses difficultés en maths. Après 4 séances, il a eu 14/20 à son contrôle. Je suis bluffée !",a:"Aminata D.",v:"Ouaga 2000",s:5},
              {q:"Le tuteur est venu à domicile, c'était parfait. Ma fille est plus motivée et ses notes progressent.",a:"Ibrahima S.",v:"Pikine",s:5},
              {q:"Inscription rapide, tuteur trouvé en 24h. Je recommande à tous les parents !",a:"Rokhaya N.",v:"Hamdalaye",s:5},
              {q:"On reçoit un compte-rendu après chaque séance. C'est très rassurant.",a:"Ndéye F.",v:"Gounghin",s:4},
            ] : [
              {q:"J'ai trouvé des familles vraiment engagées. Le système est simple et la rémunération est correcte.",a:"Kwame A.",v:"Tuteur Mathématiques",s:5},
              {q:"Brillance s'occupe de tout l'administratif. Je n'ai qu'à enseigner.",a:"Sofia R.",v:"Tutrice Sciences",s:5},
            ]).map(({q,a,v,s},i)=>(
              <div key={i} style={{...S.card,gap:12}}>
                <div style={{display:"flex",gap:2}}>{Array.from({length:s},(_,i)=><span key={i} style={{color:"#f59e0b"}}>★</span>)}</div>
                <p style={{fontSize:14,color:"#374151",lineHeight:1.7,margin:0,fontStyle:"italic"}}>« {q} »</p>
                <div><p style={{fontWeight:700,fontSize:14,margin:0,color:"#111827"}}>{a}</p><p style={{fontSize:12,color:"#9ca3af",margin:"2px 0 0"}}>{v}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RÉSERVATION */}
      <div id="book" style={{...S.section}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <span style={S.label}>Réservation</span>
          <h2 style={S.h2}>Réservez une séance d'essai</h2>
          <p style={S.sub}>Première séance à −20 % pour tester sans engagement.</p>
        </div>

        <div style={{maxWidth:640,margin:"0 auto"}}>
          <Steps labels={["Tuteur","Créneau","Infos","Paiement"]} current={bookStep}/>

          {bookDone && (
            <div style={{textAlign:"center",padding:"48px 0"}}>
              <div style={{fontSize:56}}>🎉</div>
              <h3 style={{fontSize:24,fontWeight:800,color:"#111827",marginTop:20}}>Séance confirmée !</h3>
              <p style={{color:"#6b7280",marginTop:8}}>{tuteur?.prenom} {tuteur?.nom} · {jour} à {creneau}</p>
              <button onClick={()=>{setBook(0);setTuteur(null);setJour(null);setCreneau(null);setBookDone(false);setBi({nom:"",email:"",enfant:"",niveau:""});}}
                style={{marginTop:24,padding:"12px 32px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                Nouvelle réservation
              </button>
            </div>
          )}

          {!bookDone && bookStep===0 && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {TUTEURS.filter(t=>t.statut==="Actif").map(t=>(
                <button key={t.id} onClick={()=>{setTuteur(t);setBook(1);}}
                  style={{...S.card,cursor:"pointer",border:`2px solid ${tuteur?.id===t.id?"#4f46e5":"#f3f4f6"}`,textAlign:"left",background:tuteur?.id===t.id?"#f5f3ff":"#f9fafb"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:28}}>{t.emoji}</span>
                    <div><p style={{fontWeight:700,margin:0,fontSize:14,color:"#111827"}}>{t.prenom} {t.nom}</p><p style={{fontSize:12,color:"#6366f1",margin:"2px 0 0"}}>{t.subject}</p></div>
                    <span style={{marginLeft:"auto",fontWeight:800,fontSize:15,color:"#111827"}}>{fmt(t.price)}/h</span>
                  </div>
                  <Stars n={t.rating}/>
                </button>
              ))}
            </div>
          )}

          {!bookDone && bookStep===1 && tuteur && (
            <div>
              <div style={{background:"#f5f3ff",borderRadius:16,padding:16,display:"flex",gap:14,alignItems:"center",marginBottom:24}}>
                <span style={{fontSize:32}}>{tuteur.emoji}</span>
                <div><p style={{fontWeight:700,margin:0,color:"#111827"}}>{tuteur.prenom} {tuteur.nom}</p><p style={{fontSize:13,color:"#6366f1",margin:"2px 0 0"}}>{tuteur.subject} · {fmt(tuteur.price)}/h</p></div>
              </div>
              <p style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:10}}>Choisissez un jour</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
                {tuteur.availableDays.map(d=><Pill key={d} active={jour===d} onClick={()=>setJour(d)}>{d}</Pill>)}
              </div>
              {jour && <>
                <p style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:10}}>Choisissez un créneau</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
                  {CRENEAUX.map(c=><Pill key={c} active={creneau===c} onClick={()=>setCreneau(c)}>{c}</Pill>)}
                </div>
              </>}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setBook(0)} style={{flex:1,padding:13,border:"1.5px solid #e5e7eb",borderRadius:12,background:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>← Retour</button>
                <button disabled={!jour||!creneau} onClick={()=>setBook(2)} style={{flex:1,padding:13,border:"none",borderRadius:12,background:jour&&creneau?"#4f46e5":"#e5e7eb",color:jour&&creneau?"#fff":"#9ca3af",fontWeight:700,fontSize:14,cursor:jour&&creneau?"pointer":"not-allowed"}}>Continuer →</button>
              </div>
            </div>
          )}

          {!bookDone && bookStep===2 && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Inp label="Votre nom (parent)" value={bi.nom} onChange={v=>setBI("nom",v)} placeholder="Aminata Diallo"/>
              <Inp label="E-mail" value={bi.email} onChange={v=>setBI("email",v)} placeholder="aminata@gmail.com" type="email"/>
              <Inp label="Prénom de l'enfant" value={bi.enfant} onChange={v=>setBI("enfant",v)} placeholder="Moussa"/>
              <Sel label="Niveau de l'enfant" value={bi.niveau} onChange={v=>setBI("niveau",v)} options={NIVEAUX}/>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={()=>setBook(1)} style={{flex:1,padding:13,border:"1.5px solid #e5e7eb",borderRadius:12,background:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>← Retour</button>
                <button disabled={!bi.nom||!bi.email||!bi.enfant} onClick={()=>setBook(3)} style={{flex:1,padding:13,border:"none",borderRadius:12,background:bi.nom&&bi.email&&bi.enfant?"#4f46e5":"#e5e7eb",color:bi.nom&&bi.email&&bi.enfant?"#fff":"#9ca3af",fontWeight:700,fontSize:14,cursor:bi.nom&&bi.email&&bi.enfant?"pointer":"not-allowed"}}>Continuer →</button>
              </div>
            </div>
          )}

          {!bookDone && bookStep===3 && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:"#f5f3ff",borderRadius:16,padding:18,display:"flex",flexDirection:"column",gap:10}}>
                {[["Tuteur",`${tuteur?.prenom} ${tuteur?.nom}`],["Matière",tuteur?.subject],["Jour",jour],["Créneau",creneau],["Parent",bi.nom],["Enfant",`${bi.enfant} · ${bi.niveau}`]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:14}}><span style={{color:"#6b7280"}}>{k}</span><span style={{fontWeight:600,color:"#111827"}}>{v}</span></div>
                ))}
                <div style={{borderTop:"1.5px solid #ddd6fe",paddingTop:12,marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,color:"#6b7280"}}>Séance d'essai (−20 %)</span>
                  <div style={{textAlign:"right"}}>
                    <span style={{textDecoration:"line-through",color:"#9ca3af",fontSize:13,marginRight:8}}>{fmt(tuteur?.price||0)}</span>
                    <span style={{fontWeight:800,color:"#4f46e5",fontSize:20}}>{fmt(Math.round((tuteur?.price||0)*0.8))}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={()=> goPayment({ tuteur, jour, creneau, enfant:bi.enfant, niveau:bi.niveau, parentNom:bi.nom, parentEmail:bi.email })}
                style={{padding:"14px 0",border:"none",borderRadius:12,background:"#4f46e5",color:"#fff",fontWeight:700,fontSize:16,cursor:"pointer"}}>
                Procéder au paiement →
              </button>
              <button onClick={()=>setBook(2)} style={{padding:13,border:"1.5px solid #e5e7eb",borderRadius:12,background:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",color:"#6b7280"}}>← Retour</button>
            </div>
          )}
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{background:"#111827",padding:"80px 40px",textAlign:"center"}}>
        <h2 style={{fontSize:40,fontWeight:900,color:"#fff",margin:"0 0 16px",letterSpacing:"-1px"}}>Prêt à commencer ?</h2>
        <p style={{color:"#9ca3af",fontSize:16,marginBottom:36}}>Première séance gratuite. Sans engagement.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center"}}>
          <button onClick={()=>setModal("parent")} style={{padding:"14px 36px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:999,fontWeight:700,fontSize:16,cursor:"pointer"}}>
            Trouver un tuteur
          </button>
          <button onClick={()=>setModal("tuteur")} style={{padding:"14px 36px",background:"transparent",color:"#fff",border:"2px solid #374151",borderRadius:999,fontWeight:700,fontSize:16,cursor:"pointer"}}>
            Devenir tuteur
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:"#0f172a",padding:"32px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <span style={{fontWeight:800,fontSize:15,color:"#fff"}}>Brillance Académie</span>
        <div style={{display:"flex",gap:24}}>
          {["Politique de confidentialité","Conditions d'utilisation","Nous contacter"].map(l=>(
            <button key={l} style={{background:"none",border:"none",color:"#6b7280",fontSize:13,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        <p style={{color:"#6b7280",fontSize:13,margin:0}}>© {new Date().getFullYear()} Brillance Académie</p>
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
  const [loadingT, setLoadingT]     = useState(true);
  const [search, setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setET]    = useState(null);
  const [form, setForm]        = useState({});
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  // Charger les tuteurs et réservations depuis Supabase
  useEffect(() => {
    getTousTuteurs()
      .then(data => { setTuteurs(data); setLoadingT(false); })
      .catch(() => { setTuteurs(TUTEURS); setLoadingT(false); });
    getReservations()
      .then(data => setReservations(data))
      .catch(() => {});
  }, []);

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
  ];

  const openAdd = (defaults) => { setET(null); setForm(defaults); setShowForm(true); };
  const openEdit = (row) => { setET(row); setForm({...row}); setShowForm(true); };

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Comic Sans MS','Comic Sans',cursive"}}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{marginBottom:28,paddingLeft:14}}>
          <p style={{fontWeight:800,fontSize:16,color:"#fff",margin:0}}>🎓 Brillance</p>
          <p style={{fontSize:11,color:"#475569",marginTop:2}}>Administration</p>
        </div>
        {MENU.map(({id,icon,label})=>(
          <button key={id} onClick={()=>setPage(id)} style={S.sLink(page===id)}>
            <span>{icon}</span>{label}
          </button>
        ))}
        <div style={{flex:1}}/>
        <button onClick={goHome} style={{...S.sLink(false),color:"#475569"}}>
          <span>🌐</span>Voir le site
        </button>
      </div>

      {/* Main */}
      <div style={S.main}>

        {/* DASHBOARD */}
        {page==="dashboard" && (
          <div>
            <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:"0 0 28px"}}>Tableau de bord</h1>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
              {[{l:"Parents inscrits",v:parents.length,icon:"👨‍👩‍👧",c:"#ede9fe"},{l:"Tuteurs actifs",v:tuteurs.filter(t=>t.statut==="Actif").length,icon:"📖",c:"#dcfce7"},{l:"Séances ce mois",v:47,icon:"📅",c:"#fef3c7"},{l:"Revenus",v:"1 540 000 FCFA",icon:"💰",c:"#fee2e2"}].map(({l,v,icon,c})=>(
                <div key={l} style={{...S.card,background:c,boxShadow:"none"}}>
                  <p style={{fontSize:24,margin:"0 0 8px"}}>{icon}</p>
                  <p style={{fontSize:32,fontWeight:900,margin:"0 0 4px",color:"#111827"}}>{v}</p>
                  <p style={{fontSize:13,color:"#6b7280",margin:0}}>{l}</p>
                </div>
              ))}
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
            <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:"0 0 28px"}}>Réservations</h1>
            <div style={S.card}>
              {reservations.length === 0 ? (
                <p style={{textAlign:"center",color:"#9ca3af",padding:"40px 0"}}>Aucune réservation pour l'instant.</p>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr>
                      {["Référence","Parent","Enfant","Jour · Créneau","Montant","Statut","Date","Action"].map(h=>(
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
                        <td style={{...S.td,fontSize:12,color:"#9ca3af"}}>{r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                        <td style={S.td}>
                          {r.statut==="en_attente" && (
                            <button onClick={async()=>{
                              await changerStatutReservation(r.id,"confirmée");
                              setReservations(rs=>rs.map(x=>x.id===r.id?{...x,statut:"confirmée"}:x));
                            }} style={{padding:"4px 12px",background:"#dcfce7",color:"#065f46",border:"1px solid #86efac",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              ✓ Confirmer
                            </button>
                          )}
                          {r.statut==="confirmée" && (
                            <button onClick={async()=>{
                              await changerStatutReservation(r.id,"annulée");
                              setReservations(rs=>rs.map(x=>x.id===r.id?{...x,statut:"annulée"}:x));
                            }} style={{padding:"4px 12px",background:"#fee2e2",color:"#991b1b",border:"1px solid #fca5a5",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                              ✗ Annuler
                            </button>
                          )}
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
        {page==="parents" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:0}}>Parents ({parents.length})</h1>
              <button onClick={()=>openAdd({nom:"",email:"",telephone:"",enfant:"",statut:"En attente"})}
                style={{padding:"10px 20px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                + Ajouter
              </button>
            </div>
            <div style={S.card}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…"
                style={{width:"100%",padding:"10px 16px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,marginBottom:16,boxSizing:"border-box",outline:"none"}}/>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Parent","Enfant","Téléphone","Séances","Statut",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {parents.filter(p=>!search||p.nom.toLowerCase().includes(search.toLowerCase())).map(p=>(
                    <tr key={p.id}>
                      <td style={S.td}><p style={{fontWeight:600,margin:0}}>{p.nom}</p><p style={{fontSize:12,color:"#9ca3af",margin:0}}>{p.email}</p></td>
                      <td style={S.td}>{p.enfant}</td>
                      <td style={S.td}>{p.telephone}</td>
                      <td style={{...S.td,fontWeight:700,color:"#4f46e5"}}>{p.sessions}</td>
                      <td style={S.td}><BadgeStatus s={p.statut}/></td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>openEdit(p)} style={{padding:"5px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",color:"#374151"}}>Modifier</button>
                          <button onClick={()=>setParents(pp=>pp.filter(x=>x.id!==p.id))} style={{padding:"5px 12px",border:"1px solid #fee2e2",borderRadius:8,background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",color:"#ef4444"}}>Suppr.</button>
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
                  <h2 style={{fontSize:18,fontWeight:800,margin:"0 0 20px",color:"#111827"}}>{editTarget?"Modifier":"Ajouter"} un parent</h2>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <Inp label="Nom complet" value={form.nom||""} onChange={v=>setF("nom",v)} placeholder="Aminata Diallo"/>
                    <Inp label="E-mail" value={form.email||""} onChange={v=>setF("email",v)} placeholder="aminata@gmail.com" type="email"/>
                    <Inp label="Téléphone" value={form.telephone||""} onChange={v=>setF("telephone",v)} placeholder="77 XXX XX XX" type="tel"/>
                    <Inp label="Enfant (prénom, niveau)" value={form.enfant||""} onChange={v=>setF("enfant",v)} placeholder="Moussa, CM1"/>
                    <Sel label="Statut" value={form.statut||"En attente"} onChange={v=>setF("statut",v)} options={["En attente","Actif","Inactif"]}/>
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
        )}

        {/* TUTEURS */}
        {page==="tuteurs" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:0}}>Tuteurs ({tuteurs.length})</h1>
              <button onClick={()=>openAdd({name:"",subject:"",email:"",statut:"En attente",price:"",jours:[],availableDays:[]})}
                style={{padding:"10px 20px",background:"#4f46e5",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                + Ajouter
              </button>
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
                      <td style={S.td}><BadgeStatus s={t.statut}/></td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:8}}>
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
                    <Sel label="Matière" value={form.subject||""} onChange={v=>setF("subject",v)} options={["", ...MATIERES.map(m=>m.label)]}/>
                    <Inp label="E-mail" value={form.email||""} onChange={v=>setF("email",v)} placeholder="Ex: aminata@gmail.com" type="email"/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <Inp label="Tarif (FCFA/h)" value={form.price||""} onChange={v=>setF("price",+v)} placeholder="Ex: 25000" type="number"/>
                      <Sel label="Statut" value={form.statut||"En attente"} onChange={v=>setF("statut",v)} options={["En attente","Actif","Inactif"]}/>
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
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

// ─── LOGIN ADMIN ──────────────────────────────────────────────────────────────

function LoginAdmin({ onSuccess, onBack }) {
  const [pwd, setPwd]     = useState("");
  const [error, setError] = useState(false);
  const [show, setShow]   = useState(false);

  const check = () => {
    if (pwd === "Kayden2020@$") { onSuccess(); }
    else { setError(true); setTimeout(() => setError(false), 1500); }
  };

  return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Comic Sans MS','Comic Sans',cursive"}}>
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
             : "site";

  if (page === "admin" && !adminAuth)
    return <LoginAdmin
      onSuccess={() => setAdminAuth(true)}
      onBack={() => goTo("accueil")}
    />;

  if (page === "admin" && adminAuth)
    return <Admin goHome={() => { goTo("accueil"); setAdminAuth(false); }} />;

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
    />
  );
}

export default App;
