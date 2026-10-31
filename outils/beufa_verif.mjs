// VÉRIFICATION AUTOMATIQUE DES PIÈCES DE BEUFA — à lancer après CHAQUE changement de décor :
//   node outils/beufa_verif.mjs
// Elle lit src/bosses/beufa/reglages.js (les vraies données du jeu) et contrôle, pièce par pièce :
//   1. CHEMIN  : Snake (avec son vrai rayon) peut aller de l'entrée jusqu'à la sortie.
//   2. GARDES  : aucune ronde ne traverse un obstacle (les gardes se cognent, rayon des gardes).
//   3. PIÈGES  : aucun « faux passage » : un espace qui a l'air ouvert à l'écran mais où Snake ne passe pas.
//   4. POCHES  : aucune zone de sol visible qu'on ne peut pas atteindre depuis l'entrée.
// Code de sortie 1 s'il y a une ERREUR (1 ou 2) ; les AVERTISSEMENTS (3, 4) sont à regarder à l'œil.
import { PIECES, REGLAGES } from '../src/bosses/beufa/reglages.js';

const RJ = REGLAGES.joueur.rayon;   // rayon de Snake
const RG = REGLAGES.garde.rayon;    // rayon d'un garde
const PAS = 2;                      // finesse de la grille (px)
const FAUX_MIN = 2 * RJ - 10, FAUX_MAX = 34;   // un écart dans cette plage = piège (voir NOTES V61)

// les sorties : copie des conditions de BeufaInfiltration.js (fonction de mise à jour, « LA SORTIE »)
const SORTIES = {
  haut: (x, y) => y < 36 && x > 445 && x < 515,
  est: (x, y) => x > 1396 && y > 330 && y < 400,
  qg: (x, y) => x > 1396 && y > 330 && y < 400,
};

function obstacles(P) {
  const o = [];
  for (const m of P.murs) o.push({ x: m[0], y: m[1], l: m[2], h: m[3], nom: 'mur', mur: true });
  for (const m of (P.portesVerrouillees || [])) o.push({ x: m[0], y: m[1], l: m[2], h: m[3], nom: 'porte verrouillée', mur: true });
  for (const c of (P.conteneurs || [])) o.push({ x: c[0], y: c[1], l: c[2], h: c[3], nom: c[4] || 'beufa_conteneur' });
  for (const [x, y] of (P.sacs || [])) o.push({ x, y, l: 64, h: 44, nom: 'sacs' });
  for (const [x, y] of (P.tables || [])) o.push({ x, y, l: 140, h: 90, nom: 'table' });
  for (const [x, y] of (P.caisses || [])) o.push({ x, y, l: 64, h: 64, nom: 'caisse' });
  return o;
}
// même test que touche() dans le jeu
const touche = (obs, x, y, r) => obs.some((o) => x > o.x - o.l / 2 - r && x < o.x + o.l / 2 + r && y > o.y - o.h / 2 - r && y < o.y + o.h / 2 + r);
const nomO = (o) => `${o.nom} (${o.x},${o.y})`;

let erreurs = 0, avertissements = 0;
const erreur = (t) => { erreurs++; console.log('  ❌ ' + t); };
const avert = (t) => { avertissements++; console.log('  ⚠️  ' + t); };

PIECES.forEach((P, i) => {
  console.log(`\n${P.nom} (${P.l}×${P.h})`);
  const obs = obstacles(P);
  const L = P.l, H = P.h, nx = Math.floor(L / PAS), ny = Math.floor(H / PAS);

  // ---- 1. CHEMIN : parcours en largeur sur la grille, depuis l'entrée ----
  const libre = (x, y) => x >= 22 && x <= L - 22 && y >= 22 && y <= H - 22 && !touche(obs, x, y, RJ);
  const vu = new Uint8Array(nx * ny);
  const gx0 = Math.round(P.entree.x / PAS), gy0 = Math.round(P.entree.y / PAS);
  if (!libre(gx0 * PAS, gy0 * PAS)) erreur(`l'entrée (${P.entree.x},${P.entree.y}) est DANS un obstacle`);
  const file = [gx0 + gy0 * nx]; vu[file[0]] = 1;
  let sortieAtteinte = false;
  for (let k = 0; k < file.length; k++) {
    const c = file[k], cx = c % nx, cy = (c - cx) / nx;
    if (SORTIES[P.sortie](cx * PAS, cy * PAS)) sortieAtteinte = true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ax = cx + dx, ay = cy + dy;
      if (ax < 0 || ay < 0 || ax >= nx || ay >= ny) continue;
      const n = ax + ay * nx;
      if (!vu[n] && libre(ax * PAS, ay * PAS)) { vu[n] = 1; file.push(n); }
    }
  }
  if (sortieAtteinte) console.log('  ✅ chemin entrée → sortie');
  else erreur('IMPOSSIBLE d\'atteindre la sortie depuis l\'entrée');

  // ---- 2. GARDES : chaque ronde, échantillonnée tous les 4 px ----
  const erreursAvant = erreurs;
  P.gardes.forEach((g, gi) => {
    const ch = g.chemin, segs = [];
    for (let k = 0; k < ch.length - 1; k++) segs.push([ch[k], ch[k + 1]]);
    if (ch.length > 2) segs.push([ch[ch.length - 1], ch[0]]);
    if (!segs.length) segs.push([ch[0], ch[0]]);
    const touches = new Set();
    for (const [a, b] of segs) {
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4));
      for (let t = 0; t <= n; t++) {
        const x = a[0] + (b[0] - a[0]) * t / n, y = a[1] + (b[1] - a[1]) * t / n;
        for (const o of obs) if (touche([o], x, y, RG)) touches.add(nomO(o));
      }
    }
    if (touches.size) erreur(`garde n°${gi} (ronde ${JSON.stringify(ch)}) traverse : ${[...touches].join(', ')}`);
  });
  if (erreurs === erreursAvant) console.log('  ✅ rondes dégagées');

  // ---- 3. PIÈGES : écart « on croit passer » entre deux obstacles face à face ----
  for (let a = 0; a < obs.length; a++) for (let b = a + 1; b < obs.length; b++) {
    const A = obs[a], B = obs[b];
    if (A.mur && B.mur) continue;
    const ex = Math.abs(A.x - B.x) - (A.l + B.l) / 2, ey = Math.abs(A.y - B.y) - (A.h + B.h) / 2;
    const ecart = ex < 0 ? ey : ey < 0 ? ex : null;   // face à face seulement (pas en diagonale)
    if (ecart !== null && ecart > FAUX_MIN && ecart < FAUX_MAX) {
      const passe = ecart > 2 * RJ;
      avert(`écart de ${Math.round(ecart)} px entre ${nomO(A)} et ${nomO(B)} — ${passe ? 'Snake passe tout juste (frustrant)' : 'Snake NE PASSE PAS'} : coller (0) ou ouvrir (≥ ${FAUX_MAX})`);
    }
  }

  // ---- 4. POCHES : sol libre mais inatteignable (hors bords et hors dessous des objets) ----
  let poches = 0;
  const pocheVue = new Uint8Array(nx * ny);
  for (let c = 0; c < nx * ny; c++) {
    if (vu[c] || pocheVue[c]) continue;
    const cx = c % nx, cy = (c - cx) / nx;
    if (!libre(cx * PAS, cy * PAS)) continue;
    // une poche : on la remplit pour mesurer sa taille
    const f = [c]; pocheVue[c] = 1; let mx = cx, Mx = cx, my = cy, My = cy;
    for (let k = 0; k < f.length; k++) {
      const d = f[k], dx0 = d % nx, dy0 = (d - dx0) / nx;
      mx = Math.min(mx, dx0); Mx = Math.max(Mx, dx0); my = Math.min(my, dy0); My = Math.max(My, dy0);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ax = dx0 + dx, ay = dy0 + dy;
        if (ax < 0 || ay < 0 || ax >= nx || ay >= ny) continue;
        const n = ax + ay * nx;
        if (!pocheVue[n] && !vu[n] && libre(ax * PAS, ay * PAS)) { pocheVue[n] = 1; f.push(n); }
      }
    }
    if (f.length * PAS * PAS >= 200) {
      poches++;
      avert(`zone inatteignable (${f.length * PAS * PAS} px²) autour de x ${mx * PAS}-${Mx * PAS}, y ${my * PAS}-${My * PAS}`);
    }
  }
  if (!poches) console.log('  ✅ pas de zone inatteignable');
});

console.log(`\nBILAN : ${erreurs} erreur(s), ${avertissements} avertissement(s)`);
process.exit(erreurs ? 1 : 0);
