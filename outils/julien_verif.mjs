// Vérification du boss JULIEN (manif → lycée → classe), sans navigateur. Doit finir à 0 erreur.
// Utilisation : node outils/julien_verif.mjs
//  - les 3 plans : lignes de même longueur, bords fermés, lettres connues, et tout est ATTEIGNABLE
//    (manif : la cour ; lycée : le carnet puis la porte de la salle 12 ; classe : Julien)
//  - chaque image citée par le code existe dans assets/sprites/julien/, chaque son du manifeste existe
//  - les réglages : nombres positifs, une valeur par phase (3) là où il en faut
import { existsSync, readFileSync } from 'fs';
import { REGLAGES as RG, DIFFICULTES } from '../src/bosses/julien/reglages.js';
import { PLAN_MANIF, OBJETS, SECRETS, RIDEAUX, PORTES } from '../src/bosses/julien/niveau_manif.js';
import { PLAN_LYCEE, OBJETS_LYCEE, SECRETS_LYCEE, PORTE_SALLE_12, RENFORTS_LYCEE } from '../src/bosses/julien/niveau_lycee.js';
import { PLAN_CLASSE, OBJETS_CLASSE } from '../src/bosses/julien/niveau_classe.js';
import { MANIFESTE } from '../src/bosses/julien/manifeste.js';

const erreurs = [];
const err = (m) => erreurs.push(m);
const MUR = (c) => c >= '1' && c <= '9';

// ---------------------------------------------------------------- plans
function verifierPlan(nom, plan, lettres) {
  const W = plan[0].length;
  plan.forEach((l, y) => { if (l.length !== W) err(`${nom} : la ligne ${y} fait ${l.length} cases (au lieu de ${W})`); });
  for (let x = 0; x < W; x++) if (!MUR(plan[0][x]) || !MUR(plan[plan.length - 1][x])) err(`${nom} : bord haut/bas ouvert en x=${x}`);
  plan.forEach((l, y) => { if (!MUR(l[0]) || !MUR(l[W - 1])) err(`${nom} : bord gauche/droit ouvert en y=${y}`); });
  plan.forEach((l, y) => [...l].forEach((c, x) => { if (!MUR(c) && c !== '.' && !lettres.has(c)) err(`${nom} : lettre inconnue « ${c} » en ${x},${y}`); }));
}
// cases atteignables depuis 'J' (bloque : les lettres qui bloquent le passage ; les murs sauf « passe »)
function atteignables(plan, bloque, passe = '') {
  const W = plan[0].length, H = plan.length;
  let dep = null;
  plan.forEach((l, y) => { const x = l.indexOf('J'); if (x >= 0) dep = [x, y]; });
  const vu = new Set([dep.join()]), file = [dep];
  while (file.length) {
    const [x, y] = file.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, c = (plan[ny] || '')[nx];
      if (c === undefined || vu.has(`${nx},${ny}`)) continue;
      if ((MUR(c) || bloque.includes(c)) && !passe.includes(c)) continue;
      vu.add(`${nx},${ny}`); file.push([nx, ny]);
    }
  }
  return vu;
}
const aCote = (vu, x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => vu.has(`${x + dx},${y + dy}`));
const position = (plan, c) => { for (let y = 0; y < plan.length; y++) { const x = plan[y].indexOf(c); if (x >= 0) return [x, y]; } return null; };

verifierPlan('manif', PLAN_MANIF, new Set(['J', 'S', ...Object.keys(OBJETS), ...Object.keys(SECRETS), ...Object.keys(RIDEAUX), ...Object.keys(PORTES)]));
{ const vu = atteignables(PLAN_MANIF, 'XZbpTCmkRaD', '7');   // le portail (7) s'ouvre à la fin ; sans la carte, porte D fermée
  if (!PLAN_MANIF.some((l, y) => [...l].some((c, x) => c === 'S' && vu.has(`${x},${y}`)))) err('manif : la cour du lycée (S) n\'est pas atteignable');
  // la carte de cantine (q) doit être atteignable (secrets ouverts) et la porte D doit toucher une case atteignable
  const vs = atteignables(PLAN_MANIF, 'bpTCmkRaD', '7XZ'), q = position(PLAN_MANIF, 'q'), d = position(PLAN_MANIF, 'D');
  if (q && !vs.has(`${q[0]},${q[1]}`)) err('manif : la carte de cantine (q) n\'est pas atteignable');
  if (d && !aCote(vs, d[0], d[1])) err('manif : la porte de service (D) n\'est pas atteignable'); }

verifierPlan('lycée', PLAN_LYCEE, new Set(['J', ...Object.keys(OBJETS_LYCEE), ...Object.keys(SECRETS_LYCEE)]));
{ const vu = atteignables(PLAN_LYCEE, 'dqxFEBLO', 'X');   // le casier ouvert (X) s'ouvre en poussant
  const k = position(PLAN_LYCEE, 'k');
  if (!k || !aCote(vu, ...k)) err('lycée : le CARNET (k) n\'est pas atteignable');
  if (!aCote(vu, PORTE_SALLE_12.x, PORTE_SALLE_12.y + 1)) err('lycée : la porte de la salle 12 n\'est pas atteignable');
  if (PLAN_LYCEE[PORTE_SALLE_12.y][PORTE_SALLE_12.x] !== '4') err('lycée : PORTE_SALLE_12 ne tombe pas sur un mur « 4 »');
  for (const [t, x, y] of RENFORTS_LYCEE) if (PLAN_LYCEE[y][x] !== '.') err(`lycée : renfort ${t} sur une case occupée (${x},${y})`); }

verifierPlan('classe', PLAN_CLASSE, new Set(['J', 'U', ...Object.keys(OBJETS_CLASSE)]));
{ const vu = atteignables(PLAN_CLASSE, 'deq');
  const u = position(PLAN_CLASSE, 'U');
  if (!u || !aCote(vu, ...u)) err('classe : Julien (U) n\'est pas atteignable'); }

// ---------------------------------------------------------------- images citées par le code
const DOSSIER = 'assets/sprites/julien/';
const source = (f) => readFileSync('src/bosses/julien/' + f, 'utf8');
const chaines = (texte) => [...texte.matchAll(/'([a-z0-9_]+)'/g)].map(m => m[1]);
const tableau = (texte, nom) => { const m = texte.match(new RegExp(`const ${nom} = ([\\[{][\\s\\S]*?[\\]}]);`)); return m ? m[1] : ''; };
const images = new Set();
{ const c = source('JulienClasse.js'), d = source('dessus.js'), l = source('JulienLycee.js');
  for (const n of chaines(tableau(c, 'POSES_PROF'))) images.add('julien_' + n);   // chargées sous julien_julien_<pose>
  for (const n of [...chaines(tableau(c, 'OBJETS_IMAGES')), ...chaines(tableau(c, 'MURS_IMAGES')), ...chaines(tableau(d, 'DESSUS_IMAGES'))]) images.add(n);
  for (let k = 0; k < 4; k++) for (const p of ['content', 'cache']) images.add(`eleve_${k}_${p}`);
  const poses = tableau(l, 'POSES');
  for (const m of poses.matchAll(/(\w+): \[([^\]]*)\]/g)) for (const p of chaines(m[2])) images.add(`${m[1]}_${p}`);
  for (const n of [...chaines(tableau(l, 'MURS_IMAGES')), ...chaines(tableau(l, 'IMAGES'))]) images.add(n);
  for (const n of ['main_sarbacane', 'main_sarbacane_tir']) images.add(n);
}
for (const n of images) if (!existsSync(`${DOSSIER}julien_${n}.png`)) err(`image manquante : ${DOSSIER}julien_${n}.png`);

// ---------------------------------------------------------------- sons et musiques
for (const [cle, e] of Object.entries(MANIFESTE.sons)) if (e.fichier && !existsSync('assets/' + e.fichier)) err(`son manquant : ${cle} (assets/${e.fichier})`);

// ---------------------------------------------------------------- réglages
const J = RG.julien;
for (const [nom, v] of Object.entries({ cadence: J.cadence, preavis: J.preavis, arret: J.arret, dos: J.dos, dosApresPetite: J.dosApresPetite,
  'murs.nombre': J.murs.nombre, 'murs.intervalle': J.murs.intervalle, 'deluge.vagues': J.deluge.vagues, 'deluge.intervalle': J.deluge.intervalle })) {
  if (!Array.isArray(v) || v.length !== 3) err(`réglages : julien.${nom} doit avoir 3 valeurs (une par phase)`);
  else if (v.some(x => typeof x !== 'number' || x < 0)) err(`réglages : julien.${nom} contient une valeur invalide`);
}
for (const [nom, v] of Object.entries({ 'julien.vie': J.vie, 'sarbacane.degats': RG.sarbacane.degats, 'sarbacane.cadence': RG.sarbacane.cadence,
  'surveillant.vie': RG.surveillant.vie, 'cantiniere.vie': RG.cantiniere.vie, 'dessus.trou': J.dessus.trou, 'dessus.vitesseMur': J.dessus.vitesseMur }))
  if (!(v > 0)) err(`réglages : ${nom} doit être > 0`);
if (J.dessus.trou < 40) err('réglages : julien.dessus.trou trop petit (< 40 px) : impossible de passer');
for (const [k, d] of Object.entries(DIFFICULTES)) if (!(d.degats > 0 && d.munitions > 0 && d.cadence > 0)) err(`difficulté ${k} : valeurs invalides`);

// ---------------------------------------------------------------- bilan
console.log(`Julien : ${images.size} images, ${Object.keys(MANIFESTE.sons).length} sons, 3 plans vérifiés.`);
if (erreurs.length) { for (const e of erreurs) console.log('  ✗ ' + e); console.log(`${erreurs.length} erreur(s)`); process.exit(1); }
console.log('0 erreur');
