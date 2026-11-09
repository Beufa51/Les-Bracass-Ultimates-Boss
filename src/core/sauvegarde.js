// Sauvegarde dans le navigateur (localStorage) : badges, volumes, records.
// Si le navigateur refuse (navigation privée...), le jeu marche quand même,
// mais la sauvegarde est perdue à la fermeture de l'onglet.
import { nomDefi } from '../bosses/defis.js';
const CLE = 'bracass_sauvegarde_v1';
const ANCIENS_RANGS_BEUFA = { DOBERMAN: 'FOX', EAGLE: 'HOUND', PUMA: 'BOÎTE EN CARTON', CROCODILE: 'BOÎTE EN CARTON', CHICKEN: 'BOÎTE EN CARTON' };
const VOLUMES_DEFAUT = { musique: 1, sons: 1, voix: 1 };

function lire() {
  let d = null;
  try {
    const texte = localStorage.getItem(CLE);
    d = texte ? JSON.parse(texte) : null;
  } catch (e) { /* ignoré */ }
  if (!d || typeof d.badges !== 'object') d = { badges: {} };
  d.volumes = { ...VOLUMES_DEFAUT, ...(d.volumes || {}) };
  d.records = d.records || {};
  // Beufa : anciens noms de rangs (8 rangs avant nov. 2026) → les 4 nouveaux (sinon le vieux record ne serait plus battable)
  for (const [k, r] of Object.entries(d.records)) {
    if (/^beufa(_(?!piece)\w+)?$/.test(k) && r && ANCIENS_RANGS_BEUFA[r.rang]) r.rang = ANCIENS_RANGS_BEUFA[r.rang];
  }
  // ancien emplacement du record de Greg
  try {
    const ancien = JSON.parse(localStorage.getItem('bracass_greg_record') || 'null');
    if (ancien && !d.records.greg) d.records.greg = ancien;
  } catch (e) { /* ignoré */ }
  return d;
}

function ecrire(d) {
  try { localStorage.setItem(CLE, JSON.stringify(d)); } catch (e) { /* ignoré */ }
}

let donnees = lire();

export const Sauvegarde = {
  aLeBadge(id) { return !!donnees.badges[id]; },
  donnerBadge(id) { donnees.badges[id] = true; ecrire(donnees); },

  // REPRISE (audit méta, nov. 2026) : la dernière étape atteinte d'un boss en plusieurs jeux (Rémi, Julien, Beufa).
  // { scene, donnees } ; le hub propose « Reprendre » ou « Depuis le début ». Effacée quand le boss est battu.
  reprise(id) { return (donnees.reprises || {})[id] || null; },
  noterReprise(id, scene, d) {
    let copie = {};
    try { copie = JSON.parse(JSON.stringify(d || {})); } catch (e) { /* données non copiables : on garde l'étape seule */ }
    donnees.reprises = { ...(donnees.reprises || {}), [id]: { scene, donnees: copie } }; ecrire(donnees);
  },
  oublierReprise(id) {
    if (!this.reprise(id)) return;
    const r = { ...donnees.reprises }; delete r[id]; donnees.reprises = r; ecrire(donnees);
  },
  remettreAZero() { donnees = { badges: {}, volumes: donnees.volumes, records: {} }; ecrire(donnees); },

  // tout l'état sauvegardé, en lecture (tableau de progression du hub)
  tout() { return donnees; },

  // volumes de 0 à 1 : 'musique', 'sons', 'voix'
  volume(type) { return donnees.volumes[type] ?? 1; },
  reglerVolume(type, v) { donnees.volumes[type] = Math.round(Math.max(0, Math.min(1, v)) * 10) / 10; ecrire(donnees); },

  // choses déjà faites une fois (ex. 'lionel_entrainement')
  fait(cle) { return !!(donnees.faits || {})[cle]; },
  marquerFait(cle) { donnees.faits = { ...(donnees.faits || {}), [cle]: true }; ecrire(donnees); },
  // oublie toutes les choses faites dont la clé commence par ce début (ex. revoir les règles d'un boss)
  oublierFaits(debut) {
    const f = { ...(donnees.faits || {}) };
    for (const k of Object.keys(f)) if (k.startsWith(debut)) delete f[k];
    donnees.faits = f; ecrire(donnees);
  },

  // DÉFIS DE MAÎTRISE d'un boss (une clé par défi, gardés pour toujours)
  defis(id) { return (donnees.defis || {})[id] || {}; },
  reussirDefi(id, cle) {
    const deja = !!this.defis(id)[cle];
    donnees.defis = { ...(donnees.defis || {}), [id]: { ...this.defis(id), [cle]: true } };
    if (!deja) ecrire(donnees);
    return !deja;   // true seulement la PREMIÈRE fois : l'écran de victoire peut le fêter
  },

  // dernière difficulté choisie pour un boss
  difficulte(id) { return (donnees.difficultes || {})[id] || 'normal'; },
  reglerDifficulte(id, nom) { donnees.difficultes = { ...(donnees.difficultes || {}), [id]: nom }; ecrire(donnees); },

  // record d'un boss : { rang, temps } ; ordreRangs = ['S', 'A', 'B', 'C'] (du meilleur au moins bon)
  record(id) { return donnees.records[id] || null; },
  proposerRecord(id, rang, temps, ordreRangs) {
    const r = donnees.records[id];
    if (!r || ordreRangs.indexOf(rang) < ordreRangs.indexOf(r.rang) || (rang === r.rang && temps < r.temps)) {
      donnees.records[id] = { rang, temps };
      ecrire(donnees);
    }
    return donnees.records[id];
  },
};

// Étapes qu'on peut reprendre depuis le hub : nom affiché + données ajoutées au départ de la scène
export const SCENES_REPRISE = {
  BeufaQuiz: { boss: 'beufa', nom: 'au QUIZ dans son bureau' },
  JulienLycee: { boss: 'julien', nom: 'au LYCÉE', ajout: { depuisManif: true } },
  JulienClasse: { boss: 'julien', nom: 'en CLASSE (niveau 2)', ajout: { depuisManif: true } },
  RemiBaby: { boss: 'remi', nom: 'au BABYFOOT' },
  RemiPorte: { boss: 'remi', nom: 'à LA PORTE du bar' },
};

// EXPORT / IMPORT de la sauvegarde (audit méta) : un CODE à recopier (tout ce que le jeu garde dans le navigateur :
// badges, records, défis, réglages...). Changer de téléphone ou effacer les données du site ne fait plus tout perdre.
const PREFIXE_CODE = 'BRACASS1-';
export function codeSauvegarde() {
  const tout = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('bracass_')) tout[k] = localStorage.getItem(k);
    }
  } catch (e) { /* ignoré */ }
  tout[CLE] = JSON.stringify(donnees);   // (même si le navigateur refuse d'écrire, on exporte ce qu'on a en mémoire)
  const octets = new TextEncoder().encode(JSON.stringify(tout));
  let bin = ''; octets.forEach(o => { bin += String.fromCharCode(o); });
  return PREFIXE_CODE + btoa(bin);
}
// renvoie true si le code est bon (la sauvegarde est alors remplacée : il faut recharger la page)
export function chargerCode(code) {
  try {
    const c = String(code || '').replace(/\s+/g, '');
    if (!c.startsWith(PREFIXE_CODE)) return false;
    const bin = atob(c.slice(PREFIXE_CODE.length));
    const tout = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, ch => ch.charCodeAt(0))));
    if (!tout || typeof tout !== 'object' || !tout[CLE]) return false;
    const d = JSON.parse(tout[CLE]);
    if (!d || typeof d.badges !== 'object') return false;
    for (const k of Object.keys(tout)) if (k.startsWith('bracass_') && typeof tout[k] === 'string') localStorage.setItem(k, tout[k]);
    donnees = lire();
    return true;
  } catch (e) { return false; }
}

// Lignes de DÉFIS DE MAÎTRISE pour un écran de victoire : un défi réussi POUR LA PREMIÈRE
// FOIS est fêté en ★, les déjà réussis restent cochés, les autres sont proposés pour la revanche.
// (le nom de chaque défi vient de src/bosses/defis.js : liste = [{ id, test }])
export function lignesDefis(idBoss, liste) {
  const lignes = [];
  for (const d of liste) {
    const nom = d.nom || nomDefi(idBoss, d.id);
    if (d.test()) {
      const nouveau = Sauvegarde.reussirDefi(idBoss, d.id);
      lignes.push(`${nouveau ? '★ DÉFI RÉUSSI : ' : 'Défi déjà réussi : '}${nom}`);
    } else {
      lignes.push(`Défi à débloquer : ${nom}`);
    }
  }
  return lignes;
}
// version courte pour les écrans de fin déjà chargés : enregistre les défis réussis, renvoie les NOMS des nouveaux
export function defisNouveaux(idBoss, liste) {
  return liste.filter(d => d.test() && Sauvegarde.reussirDefi(idBoss, d.id)).map(d => nomDefi(idBoss, d.id));
}

// Temps au format 1'16"55
export function formatTemps(x) {
  return `${Math.floor(x / 60)}'${String(Math.floor(x % 60)).padStart(2, '0')}"${String(Math.floor((x % 1) * 100)).padStart(2, '0')}`;
}
