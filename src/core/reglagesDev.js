// Réglages développeur : chaque boss peut proposer des chiffres à régler sans ouvrir les fichiers du jeu
// (vitesse, taille d'une jauge, timing...). Dans SON index.js :
//   reglagesDev: [{ groupe: 'NORMAL', nom: 'Vitesse', objet: DIFFICULTES.normal, champ: 'vitesse', pas: 0.05, min: 0.5, max: 2 }, ...]
// (objet[champ] est un nombre, ou un oui / non). Les valeurs changées sont gardées dans le navigateur (localStorage)
// et appliquées au démarrage du jeu ; « par défaut » = la valeur écrite dans les fichiers.
// Écran : ReglagesDevScene.js (accès caché depuis le hub, ou le menu de test F1).
const CLE = 'bracass_reglages_dev_v1';
const defauts = new Map();

function lire() {
  try { return JSON.parse(localStorage.getItem(CLE) || '{}') || {}; } catch (e) { return {}; }
}
function ecrire() {
  try { localStorage.setItem(CLE, JSON.stringify(valeurs)); } catch (e) { /* ignoré */ }
}
let valeurs = lire();

const cle = (boss, r) => `${boss.id}:${r.groupe || ''}:${r.nom}`;

// À appeler une fois au démarrage : retient les valeurs d'origine et applique celles changées
export function appliquerReglagesDev(liste) {
  for (const boss of liste) for (const r of boss.reglagesDev || []) {
    const k = cle(boss, r);
    if (!defauts.has(k)) defauts.set(k, r.objet[r.champ]);
    if (k in valeurs && typeof valeurs[k] === typeof defauts.get(k)) r.objet[r.champ] = valeurs[k];
  }
}

export function valeurDefaut(boss, r) { return defauts.get(cle(boss, r)); }
export function estChange(boss, r) { return r.objet[r.champ] !== valeurDefaut(boss, r); }

// sens : -1 / +1 (un oui / non s'inverse)
export function changerReglage(boss, r, sens) {
  const v = r.objet[r.champ];
  let n;
  if (typeof v === 'boolean') n = !v;
  else {
    const decimales = String(r.pas).split('.')[1]?.length || 0;
    n = Number(Math.min(r.max, Math.max(r.min, v + sens * r.pas)).toFixed(decimales));
  }
  fixer(boss, r, n);
}

export function remettreReglage(boss, r) { fixer(boss, r, valeurDefaut(boss, r)); }
export function remettreTout(boss) { for (const r of boss.reglagesDev || []) remettreReglage(boss, r); }

function fixer(boss, r, n) {
  r.objet[r.champ] = n;
  const k = cle(boss, r);
  if (n === defauts.get(k)) delete valeurs[k]; else valeurs[k] = n;
  ecrire();
}

export function texteValeur(v) {
  if (typeof v === 'boolean') return v ? 'OUI' : 'NON';
  return String(v);
}
