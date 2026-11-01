// Les ARMES du héros (façon Doom : touches 1 à 5 ; bouton ARME sur téléphone qui passe à la suivante).
//  1 PANCARTE  : corps à corps, infinie ; un CRS frappé baisse son bouclier (étourdi) → vite, un œuf !
//  2 ŒUFS      : l'arme de base
//  3 TOMATES   : une tomate vaut 2 œufs et fait bien reculer
//  4 PISTOLET À EAU : jet continu, petits dégâts, ÉTEINT les nuages de lacrymo
//  5 FUMIGÈNES : nuage coloré ; les policiers dedans ne te voient plus et s'étouffent ; caché dedans, tu es invisible
// Les projectiles partagent une seule liste (scene.tirs) : { genre, x, y, dx, dy, t, ... }.
import { REGLAGES as RG } from './reglages.js';
import { murEn } from './raycaster.js';
import { jouerSon } from '../../core/ressources.js';

export const ARMES = [
  { id: 'pancarte', nom: 'PANCARTE', mun: null },
  { id: 'oeufs', nom: 'ŒUFS', mun: 'oeufs' },
  { id: 'tomates', nom: 'TOMATES', mun: 'tomates' },
  { id: 'eau', nom: 'PISTOLET À EAU', mun: 'eau' },
  { id: 'fumigenes', nom: 'FUMIGÈNES', mun: 'fumigenes' },
];
export const armeDe = (id) => ARMES.find(a => a.id === id);

// Objets à ramasser : quantité, maximum, et message la 1re fois (= on trouve l'arme)
export const RECHARGES = {
  oeufs: () => ({ n: RG.oeufs.boite, maxi: RG.oeufs.maxi, txt: `Une boîte d'œufs ! (+${RG.oeufs.boite})` }),
  tomates: () => ({ n: RG.tomates.cagette, maxi: RG.tomates.maxi, txt: `Une cagette de tomates ! (+${RG.tomates.cagette})`,
    trouve: 'Des TOMATES ! (touche 3 / ARME) : une tomate vaut deux œufs.' }),
  eau: () => ({ n: RG.eau.bouteille, maxi: RG.eau.maxi, txt: 'De l\'eau pour le pistolet !',
    trouve: 'Un PISTOLET À EAU ! (touche 4 / ARME) : il ÉTEINT les lacrymos.' }),
  fumigenes: () => ({ n: RG.fumigenes.boite, maxi: RG.fumigenes.maxi, txt: `Des fumigènes ! (+${RG.fumigenes.boite})`,
    trouve: 'Des FUMIGÈNES ! (touche 5 / ARME) : caché dans la fumée, la police ne te voit plus.' }),
};

// Change d'arme (si on l'a) ; sens : +1 / -1 = la suivante / la précédente qui a des munitions
export function choisirArme(scene, id) {
  const j = scene.j;
  if (!j.armes.has(id)) return false;
  const a = armeDe(id);
  if (a.mun && j.mun[a.mun] <= 0) { scene.message(`Plus de ${a.nom.toLowerCase()} !`); return false; }
  if (j.arme !== id) { j.arme = id; j.lanceT = 0; scene.message(a.nom, 1.2); }
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
function armeDeSecours(scene) {
  const j = scene.j;
  j.arme = j.mun.oeufs > 0 ? 'oeufs' : 'pancarte';
  scene.message(`À court ! ${armeDe(j.arme).nom}`, 1.5);
}

// Tir de l'arme en main. appui : le bouton est enfoncé ; nouveau : il vient d'être enfoncé
export function tirer(scene, dx, dy, appui, nouveau) {
  const j = scene.j, a = armeDe(j.arme);
  if (!appui || j.recharge > 0) return;
  if (a.mun && j.mun[a.mun] <= 0) { if (nouveau) armeDeSecours(scene); return; }
  if (a.mun) j.mun[a.mun]--;
  const [vx, vy] = scene.viser(dx, dy);
  const ajout = (genre, ax, ay, extra = {}) => scene.tirs.push({ genre, x: j.x + ax * 0.3, y: j.y + ay * 0.3, dx: ax, dy: ay, t: 0, ...extra });
  if (j.arme === 'pancarte') {
    j.recharge = RG.pancarte.cadence; j.lanceT = 0.25;
    jouerSon(scene, 'julien_pancarte');
    frapper(scene, dx, dy);
  } else if (j.arme === 'oeufs') {
    j.recharge = RG.oeufs.cadence; j.lanceT = 0.18;
    ajout('oeuf', vx, vy);
    jouerSon(scene, 'julien_lancer');
  } else if (j.arme === 'tomates') {
    j.recharge = RG.tomates.cadence; j.lanceT = 0.25;
    ajout('tomate', vx, vy);
    jouerSon(scene, 'julien_lancer', { rate: 0.8 });
  } else if (j.arme === 'eau') {
    j.recharge = RG.eau.cadence; j.lanceT = 0.1;
    const e = (Math.random() - 0.5) * 0.06, base = Math.atan2(vy, vx);
    ajout('eau', Math.cos(base + e), Math.sin(base + e));
    if (nouveau || Math.random() < 0.25) jouerSon(scene, 'julien_eau');
  } else if (j.arme === 'fumigenes') {
    j.recharge = RG.fumigenes.cadence; j.lanceT = 0.3;
    // il retombe à « distance » cases devant, ou avant le premier mur
    let d = 0.5;
    while (d < RG.fumigenes.distance && !murEn(scene.plan, j.x + dx * d, j.y + dy * d)) d += 0.25;
    d = Math.max(0.6, d - 0.4);
    ajout('fumi', dx, dy, { x0: j.x, y0: j.y, x1: j.x + dx * d, y1: j.y + dy * d, z: 0.5 });
    jouerSon(scene, 'julien_lancer', { rate: 0.6 });
  }
  if (j.cafe > 0) j.recharge *= RG.bonus.cafeCadence;   // café serré : on tire plus vite
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
  if (cible.type === 'bouclier' && cible.etat !== 'essouffle') {
    // le bouclier encaisse, mais le CRS est sonné : bouclier baissé quelques instants
    scene.deplacer(cible, recul[0], recul[1], 0.28);
    cible.etat = 'essouffle'; cible.t = P.etourdit * scene.diff.essouffle; cible.alerte = true;
    jouerSon(scene, 'julien_plonk', { rate: 0.6 });
    scene.message('BONK ! Son bouclier tombe : vite, vise-le !', 1.5);
    return;
  }
  scene.toucherEnnemi(cible, P.degats, { recul, tache: null });
}

// Fait avancer les tirs (œufs, tomates, eau, fumigènes) et les fumées colorées
export function avancerTirs(scene, dt) {
  const j = scene.j;
  for (const o of scene.tirs) {
    if (o.fini) continue;
    o.t += dt;
    if (o.genre === 'fumi') {   // vol en cloche jusqu'au point visé, puis la fumée
      const t = Math.min(1, o.t / RG.fumigenes.vol);
      o.x = o.x0 + (o.x1 - o.x0) * t; o.y = o.y0 + (o.y1 - o.y0) * t; o.z = 0.5 * (1 - t) + 1.2 * t * (1 - t);
      if (t >= 1) { o.fini = true; scene.fumees.push({ x: o.x, y: o.y, t: RG.fumigenes.duree }); jouerSon(scene, 'julien_fumigene'); }
      continue;
    }
    const R = o.genre === 'oeuf' ? RG.oeufs : o.genre === 'tomate' ? RG.tomates : RG.eau;
    o.x += o.dx * R.vitesse * dt; o.y += o.dy * R.vitesse * dt;
    const vie = o.genre === 'oeuf' ? 2 : R.duree;
    if (o.genre === 'eau') for (const n of scene.nuages) if (Math.hypot(n.x - o.x, n.y - o.y) < RG.lacrymo.rayon) n.t -= R.eteint;   // l'eau éteint la lacrymo
    if (murEn(scene.plan, o.x, o.y) || o.t > vie) {
      o.fini = true;
      if (o.genre !== 'eau') {
        scene.alerter(o.x, o.y, 2.5);
        scene.splats.push({ x: o.x - o.dx * 0.12, y: o.y - o.dy * 0.12, t: 1.5, rouge: o.genre === 'tomate' });
        jouerSon(scene, 'julien_splat', { rate: o.genre === 'tomate' ? 0.9 : 1.3 });
      }
      continue;
    }
    for (const b of scene.objets) if (b.actif && b.solide && Math.hypot(b.x - o.x, b.y - o.y) < b.rayon) {
      o.fini = true;
      if (o.genre !== 'eau') scene.splats.push({ x: o.x, y: o.y, t: 1.2, rouge: o.genre === 'tomate' });
      if (b.type === 'manifestant' && o.genre !== 'eau') scene.message('« Hé ! Pas sur nous ! »');
      break;
    }
    if (o.fini) continue;
    for (const e of scene.ennemis) if (e.actif && e.etat !== 'fuite' && Math.hypot(e.x - o.x, e.y - o.y) < 0.35) {
      o.fini = true;
      scene.toucherEnnemi(e, R.degats, { recul: [o.dx * R.recul, o.dy * R.recul], silencieux: o.genre === 'eau', tache: o.genre === 'oeuf' ? 'oeuf' : o.genre === 'tomate' ? 'tomate' : null });
      break;
    }
  }
  scene.tirs = scene.tirs.filter(o => !o.fini);
  // fumées colorées : les policiers dedans s'étouffent (même derrière le bouclier)
  j.rose = Math.max(0, (j.rose || 0) - dt * 1.5);
  for (const f of scene.fumees) {
    f.t -= dt;
    for (const e of scene.ennemis) if (e.actif && e.etat !== 'fuite' && Math.hypot(e.x - f.x, e.y - f.y) < RG.fumigenes.rayon) {
      scene.toucherEnnemi(e, RG.fumigenes.degats * dt, { perceBouclier: true, silencieux: true });
    }
    if (Math.hypot(j.x - f.x, j.y - f.y) < RG.fumigenes.rayon) j.rose = Math.min(1, j.rose + dt * 3);
  }
  scene.fumees = scene.fumees.filter(f => f.t > 0);
}

// Vrai si (x, y) est dans une fumée colorée (on n'y voit rien : ni toi, ni les policiers)
export function dansFumee(scene, x, y) {
  return scene.fumees.some(f => Math.hypot(x - f.x, y - f.y) < RG.fumigenes.rayon * 0.9);
}
