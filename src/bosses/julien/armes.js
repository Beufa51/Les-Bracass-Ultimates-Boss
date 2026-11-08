// Les ARMES du héros (façon Doom : touches 1 à 6 ; bouton ARME sur téléphone qui passe à la suivante).
//  1 PANCARTE  : corps à corps, infinie ; un CRS frappé baisse son bouclier (étourdi) → vite, un œuf !
//  2 ŒUFS      : l'arme de base
//  3 TOMATES   : une tomate vaut 2 œufs et fait bien reculer
//  4 PISTOLET À EAU : jet continu, petits dégâts, ÉTEINT les nuages de lacrymo
//  5 FUMIGÈNES : nuage coloré ; les policiers dedans ne te voient plus et s'étouffent ; caché dedans, tu es invisible
//  6 SARBACANE : (niveau 2) boulettes de papier, infinie, précise, petits dégâts (×2 dans le dos de Julien, comme le reste)
// Les projectiles partagent une seule liste (scene.tirs) : { genre, x, y, dx, dy, t, ... }.
import { REGLAGES as RG } from './reglages.js';
import { murEn } from './raycaster.js';
import { jouerSon } from '../../core/ressources.js';

export const ARMES = [
  { id: 'pancarte', nom: 'PANCARTE', mun: null },
  { id: 'oeufs', nom: 'ŒUFS', mun: 'oeufs' },
  { id: 'tomates', nom: 'TOMATES', mun: 'tomates' },
  { id: 'eau', nom: 'PISTOLET À EAU', mun: 'eau' },
  { id: 'sarbacane', nom: 'SARBACANE', mun: null },   // lycée et classe, touche 5 (les FUMIGÈNES ont été supprimés : demande de Fabien)
  { id: 'sono', nom: 'LA SONO', mun: 'sono' },   // grand secret de la manif (ARME pour la choisir)
];
export const armeDe = (id) => ARMES.find(a => a.id === id);

// Objets à ramasser : quantité, maximum, et message la 1re fois (= on trouve l'arme)
export const RECHARGES = {
  oeufs: () => ({ n: RG.oeufs.boite, maxi: RG.oeufs.maxi, txt: `Une boîte d'œufs ! (+${RG.oeufs.boite})` }),
  tomates: () => ({ n: RG.tomates.cagette, maxi: RG.tomates.maxi, txt: `Une cagette de tomates ! (+${RG.tomates.cagette})`,
    trouve: 'Des TOMATES ! (touche 3 / ARME) : une tomate vaut deux œufs.' }),
  eau: () => ({ n: RG.eau.bouteille, maxi: RG.eau.maxi, txt: 'De l\'eau pour le pistolet !',
    trouve: 'Un PISTOLET À EAU ! (touche 4 / ARME) : il ÉTEINT les lacrymos.' }),
  sono: () => ({ n: RG.sono.charges, maxi: RG.sono.maxi, txt: 'Des piles pour la sono !',
    trouve: 'LA SONO ! (touche 6 / ARME) : un coup de basse, et TOUS les policiers en vue s\'enfuient. 2 charges.' }),
};

// Change d'arme (si on l'a) ; sens : +1 / -1 = la suivante / la précédente qui a des munitions
export function choisirArme(scene, id) {
  const j = scene.j;
  if (!j.armes.has(id)) return false;
  const a = armeDe(id);
  if (a.mun && j.mun[a.mun] <= 0) { scene.message(`Plus de ${a.nom.toLowerCase()} !`); return false; }
  if (j.arme !== id) { j.arme = id; j.lanceT = 0; j.changeT = 0.3; scene.message(a.nom, 1.2); }   // l'arme descend puis remonte
  return true;
}
export function armeSuivante(scene) {
  const j = scene.j, i = ARMES.findIndex(a => a.id === j.arme);
  for (let k = 1; k <= ARMES.length; k++) {
    const a = ARMES[(i + k) % ARMES.length];
    if (j.armes.has(a.id) && (!a.mun || j.mun[a.mun] > 0)) { choisirArme(scene, a.id); return; }
  }
}
// plus de munitions : on passe aux œufs, sinon à la pancarte
// (même si le bouton reste enfoncé, comme dans Doom : on n'attend pas qu'il soit relâché)
function armeDeSecours(scene) {
  const j = scene.j, avant = j.arme;
  armeSuivante(scene);
  if (j.arme === avant) j.arme = j.mun.oeufs > 0 ? 'oeufs' : 'pancarte';
  scene.message(`À court ! ${armeDe(j.arme).nom}`, 1.5);
}

// Tir de l'arme en main. appui : le bouton est enfoncé ; nouveau : il vient d'être enfoncé
export function tirer(scene, dx, dy, appui, nouveau) {
  const j = scene.j, a = armeDe(j.arme);
  if (!appui || j.recharge > 0 || j.changeT > 0) return;
  if (scene.confisque && scene.confisque.id === j.arme) return;   // (la classe) Julien l'a confisquée
  if (a.mun && j.mun[a.mun] <= 0) { armeDeSecours(scene); return; }
  if (a.mun) j.mun[a.mun]--;
  const [vx, vy] = scene.viser(dx, dy);
  const ajout = (genre, ax, ay, extra = {}) => scene.tirs.push({ genre, x: j.x + ax * 0.3, y: j.y + ay * 0.3, dx: ax, dy: ay, t: 0, ...extra });
  if (j.arme === 'pancarte') {
    j.recharge = RG.pancarte.cadence; j.lanceT = 0.25;
    jouerSon(scene, 'julien_pancarte');
    frapper(scene, dx, dy);
  } else if (j.arme === 'oeufs') {
    j.recharge = RG.oeufs.cadence; j.lanceT = 0.18;
    ajout('oeuf', vx, vy, j.pourris > 0 ? { pourri: true } : {});   // trésor : œufs pourris
    if (j.pourris > 0 && --j.pourris === 0) scene.message('Plus d\'œufs pourris…', 1.5);
    jouerSon(scene, 'julien_lancer');
  } else if (j.arme === 'tomates') {
    j.recharge = RG.tomates.cadence; j.lanceT = 0.25;
    ajout('tomate', vx, vy);
    jouerSon(scene, 'julien_lancer', { rate: 0.8 });
  } else if (j.arme === 'sarbacane') {
    j.recharge = RG.sarbacane.cadence * (j.turbo ? RG.turbo.cadence : 1); j.lanceT = 0.12;   // trésor : sarbacane TURBO
    ajout('boulette', vx, vy);
    jouerSon(scene, 'julien_lancer', { rate: 1.6 });
  } else if (j.arme === 'eau') {
    j.recharge = RG.eau.cadence; j.lanceT = 0.1;
    const e = (Math.random() - 0.5) * 0.06, base = Math.atan2(vy, vx);
    ajout('eau', Math.cos(base + e), Math.sin(base + e));
    if (nouveau || Math.random() < 0.25) jouerSon(scene, 'julien_eau');
  } else if (j.arme === 'sono') {
    j.recharge = RG.sono.cadence; j.lanceT = 0.5;
    scene.sono();
  }
  if (j.cafe > 0) j.recharge *= RG.bonus.cafeCadence;   // café serré : on tire plus vite
  scene.alerter(j.x, j.y, RG.bruitTir);   // le bruit alerte les policiers proches
}

// coup de pancarte : le policier le plus proche devant toi
function frapper(scene, dx, dy) {
  const j = scene.j, P = RG.pancarte;
  let cible = null, mieux = P.portee;
  for (const e of scene.ennemis) if (e.actif && e.etat !== 'fuite') {
    const ox = e.x - j.x, oy = e.y - j.y, d = Math.hypot(ox, oy);
    if (d > mieux || (ox * dx + oy * dy) / d < Math.cos(0.6)) continue;
    cible = e; mieux = d;
  }
  if (!cible) return;
  const d = Math.hypot(cible.x - j.x, cible.y - j.y);
  const recul = [(cible.x - j.x) / d * P.recul, (cible.y - j.y) / d * P.recul];
  if (cible.type === 'bouclier' && !scene.bouclierBaisse(cible)) {
    // le bouclier encaisse, mais le CRS est sonné : bouclier baissé quelques instants
    scene.deplacer(cible, recul[0], recul[1], 0.28);
    cible.etat = 'essouffle'; cible.t = P.etourdit * scene.diff.essouffle; cible.alerte = true;
    jouerSon(scene, 'julien_plonk', { rate: 0.6 });
    scene.message('BONK ! Son bouclier tombe : vite, vise-le !', 1.5);
    return;
  }
  scene.toucherEnnemi(cible, P.degats, { recul, tache: null, genre: 'pancarte' });
}

// Fait avancer les tirs (œufs, tomates, eau, boulettes)
export function avancerTirs(scene, dt) {
  const j = scene.j;
  for (const o of scene.tirs) {
    if (o.fini) continue;
    o.t += dt;
    const R = o.genre === 'oeuf' ? RG.oeufs : o.genre === 'tomate' ? RG.tomates : o.genre === 'boulette' ? RG.sarbacane : RG.eau;
    o.x += o.dx * R.vitesse * dt; o.y += o.dy * R.vitesse * dt;
    const vie = o.genre === 'oeuf' ? 2 : R.duree, sec = o.genre === 'eau' || o.genre === 'boulette';   // sec : pas de tache
    if (o.genre === 'eau') for (const n of scene.nuages) if (Math.hypot(n.x - o.x, n.y - o.y) < RG.lacrymo.rayon) n.t -= R.eteint;   // l'eau éteint la lacrymo
    if (murEn(scene.plan, o.x, o.y) || o.t > vie) {
      o.fini = true;
      if (!sec) {
        scene.alerter(o.x, o.y, 2.5);
        scene.splats.push({ x: o.x - o.dx * 0.12, y: o.y - o.dy * 0.12, t: 1.5, rouge: o.genre === 'tomate' });
        jouerSon(scene, 'julien_splat', { rate: o.genre === 'tomate' ? 0.9 : 1.3 });
      }
      continue;
    }
    for (const b of scene.objets) if (b.actif && b.solide && !(b.porteur && b.porteur.actif && b.porteur.etat !== 'fuite') && Math.hypot(b.x - o.x, b.y - o.y) < b.rayon) {   // (porteur : le policier sur le toit du fourgon)
      o.fini = true;
      if (!sec) scene.splats.push({ x: o.x, y: o.y, t: 1.2, rouge: o.genre === 'tomate' });
      if ((b.type === 'farine' || b.type === 'extincteur') && o.genre !== 'eau') scene.exploserFarine(b);   // extincteur : le lycée
      if (b.replique && o.genre !== 'eau') scene.message(b.replique, 1.6);   // (les fayots du lycée)
      if (b.type === 'manifestant' && o.genre !== 'eau') scene.message('« Hé ! Pas sur nous ! »');
      break;
    }
    if (o.fini) continue;
    for (const e of scene.ennemis) if (e.actif && e.etat !== 'fuite' && Math.hypot(e.x - o.x, e.y - o.y) < 0.35) {
      o.fini = true;
      // pistolet à eau : petit « plic » toutes les 3 gouttes et un SURSAUT toutes les 6 (audit nov. 2026 : il « ne faisait rien »)
      const goutte = o.genre === 'eau' ? (e.eauN = (e.eauN || 0) + 1) : 0;
      if (goutte % 3 === 1) jouerSon(scene, 'julien_eau', { rate: 1.7, volume: 0.35 });
      scene.toucherEnnemi(e, R.degats * (o.pourri ? RG.pourris.degats : 1), { perceBouclier: !!o.pourri, recul: [o.dx * R.recul, o.dy * R.recul], silencieux: o.genre === 'eau' && goutte % 6 !== 0, genre: o.genre, tache: o.genre === 'oeuf' ? 'oeuf' : o.genre === 'tomate' ? 'tomate' : null });
      break;
    }
  }
  scene.tirs = scene.tirs.filter(o => !o.fini);
}
