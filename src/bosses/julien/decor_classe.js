// Décor et dessins PROVISOIRES du niveau 2 (la salle de classe), faits par le code : murs, plafond, sol,
// tables, bureau, Julien (le prof) et ses projectiles (livre, dictionnaire, copie d'interro).
// Même format que decor.js / textures.js, pour le moteur 3D (raycaster.js).
import { PLAN_CLASSE } from './niveau_classe.js';

const HAUT_MUR = 1.5;   // la classe est un peu plus haute que la vue (plafond au-dessus)
export const HAUTEURS_CLASSE = { table: 0.5, bureau: 0.58, julien: 1.0, livre: 0.11, dico: 0.15, copie: 0.13 };

function toile(l, h, dessin) {
  const c = document.createElement('canvas'); c.width = l; c.height = h;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; dessin(g, l, h); return c;
}
const R = (g, c, x, y, l, h) => { g.fillStyle = c; g.fillRect(x, y, l, h); };
function ovale(g, c, x, y, rx, ry) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
function ecrire(g, txt, x, y, taille, c) {
  g.font = `bold ${taille}px monospace`; g.fillStyle = c; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y);
}
function grain(g, l, h, force, graine) {
  let s = graine;
  for (let i = 0; i < l * h / 6; i++) {
    s = (s * 9301 + 49297) % 233280; const x = s % l; s = (s * 9301 + 49297) % 233280; const y = s % h;
    g.fillStyle = i % 2 ? `rgba(0,0,0,${force})` : `rgba(255,255,255,${force * 0.7})`; g.fillRect(x, y, 1, 1);
  }
}
// mur peint : vert d'eau en haut, plinthe et soubassement plus foncés
function murPeint(g) {
  R(g, '#b9c9a8', 0, 0, 64, 96); R(g, '#8fa37f', 0, 62, 64, 34); R(g, '#6d7f60', 0, 61, 64, 2); R(g, '#4b3a2a', 0, 90, 64, 6);
}

// ---------------------------------------------------------------- murs (64 × 96 : 1,5 fois plus haut que large)
export function mursClasse() {
  const M = {};
  M[1] = [toile(64, 96, (g) => { murPeint(g); grain(g, 64, 96, 0.06, 3); }),
    toile(64, 96, (g) => {   // avec une affiche (carte de France / tableau périodique, au hasard des cases)
      murPeint(g);
      R(g, '#f2ead2', 12, 14, 40, 30); R(g, '#7a9cc6', 15, 17, 34, 24);
      ovale(g, '#8fbf6a', 30, 29, 10, 9); ecrire(g, 'FRANCE', 32, 38, 5, '#2b3f5c');
      grain(g, 64, 96, 0.06, 4);
    })];
  M[2] = toile(64, 96, (g) => {   // tableau noir (vert) avec des formules à la craie
    murPeint(g);
    R(g, '#5b4128', 2, 14, 60, 46); R(g, '#24402f', 4, 16, 56, 40);
    g.globalAlpha = 0.75;
    ecrire(g, 'a²+b²', 20, 24, 7, '#e8eadf'); ecrire(g, '=c²', 44, 24, 7, '#e8eadf');
    ecrire(g, 'INTERRO', 32, 38, 8, '#f3f0c8'); ecrire(g, 'SURPRISE', 32, 47, 7, '#f3f0c8');
    g.globalAlpha = 1;
    R(g, '#5b4128', 2, 56, 60, 3); R(g, '#e8e8e0', 10, 55, 5, 2); R(g, '#d06a6a', 18, 55, 4, 2);   // rebord + craies
    grain(g, 64, 96, 0.05, 6);
  });
  M[3] = toile(64, 96, (g) => {   // fenêtres sur la cour
    murPeint(g);
    R(g, '#e8e4d8', 6, 8, 52, 54); R(g, '#8fc0e8', 9, 11, 46, 48); R(g, '#b9dbf2', 9, 11, 46, 14);
    R(g, '#6c9a58', 9, 46, 46, 13); R(g, '#e8e4d8', 30, 8, 4, 54); R(g, '#e8e4d8', 6, 33, 52, 3);
    R(g, '#c95a3a', 2, 8, 5, 54); R(g, '#c95a3a', 57, 8, 5, 54);   // rideaux
  });
  M[4] = toile(64, 96, (g) => {   // porte de la classe
    murPeint(g);
    R(g, '#5a3c22', 10, 10, 44, 86); R(g, '#7a5432', 13, 13, 38, 83); R(g, '#a8c8d8', 20, 18, 24, 18);
    ovale(g, '#d8b040', 46, 60, 2.5, 2.5); ecrire(g, 'SALLE 12', 32, 46, 6, '#f2e6c8');
  });
  return M;
}

// ---------------------------------------------------------------- plafond (tourne avec la vue), sol
function plafond(h) {
  return toile(1024, Math.ceil(h), (g, l, hh) => {
    const d = g.createLinearGradient(0, 0, 0, hh); d.addColorStop(0, '#d6d2c4'); d.addColorStop(1, '#8e8b80');
    g.fillStyle = d; g.fillRect(0, 0, l, hh);
    for (let x = 0; x < l; x += 64) { R(g, '#a9a597', x, 0, 1, hh); }   // dalles du faux plafond
    for (let x = 20; x < l; x += 128) { R(g, '#fffbe6', x, hh * 0.25, 40, 5); R(g, '#d8d4b8', x, hh * 0.25 + 5, 40, 2); }   // néons
  });
}
function texture32(dessin) {
  const c = document.createElement('canvas'); c.width = 32; c.height = 32;
  const g = c.getContext('2d'); dessin(g);
  return new Uint32Array(g.getImageData(0, 0, 32, 32).data.buffer.slice(0));
}
function solsClasse() {
  const lino = texture32((g) => {   // lino gris-bleu en carreaux
    g.fillStyle = '#7d8590'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#737a85'; g.fillRect(0, 0, 16, 16); g.fillRect(16, 16, 16, 16);
    g.fillStyle = '#636a73'; g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32);
  });
  const parquet = texture32((g) => {   // estrade du prof
    for (let y = 0; y < 32; y += 8) { g.fillStyle = y % 16 ? '#8a5f38' : '#7a5230'; g.fillRect(0, y, 32, 8); g.fillStyle = '#5c3e22'; g.fillRect(0, y, 32, 1); g.fillRect((y * 3) % 32, y, 1, 8); }
  });
  return [lino, parquet];
}

export function construireDecorClasse(ctx, l, hVue) {
  const W = PLAN_CLASSE[0].length, H = PLAN_CLASSE.length, mi = hVue / 2;
  const genres = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) genres[y * W + x] = y <= 3 ? 1 : 0;   // estrade devant le tableau
  const image = ctx.createImageData(l, hVue - mi);
  const brume = ctx.createLinearGradient(0, mi, 0, hVue);
  brume.addColorStop(0, 'rgba(40,38,34,0.55)'); brume.addColorStop(0.4, 'rgba(40,38,34,0.15)'); brume.addColorStop(1, 'rgba(40,38,34,0)');
  return {
    murs: mursClasse(), etages: {}, hauteurs: { 1: HAUT_MUR, 2: HAUT_MUR, 3: HAUT_MUR, 4: HAUT_MUR },
    ciel: plafond(mi), sombre: new Uint8Array(W * H), neons: new Set(), neonEteint: 0,
    sol: { genres, largeur: W, textures: solsClasse(), image, buf: new Uint32Array(image.data.buffer), brume },
  };
}

// ---------------------------------------------------------------- Julien, le prof (48 × 84)
// poses : marche0, marche1, bras (livre levé), lance, touche, rage, vaincu
function julien(pose) {
  return toile(48, 84, (g) => {
    const pas = pose === 'marche1' ? 3 : pose === 'marche0' ? -3 : 0;
    const rage = pose === 'rage', vaincu = pose === 'vaincu';
    const peau = rage ? '#e07a6a' : '#e5b48c';
    // jambes (pantalon beige) + chaussures
    R(g, '#b9a37a', 16 + pas, 54, 7, 26); R(g, '#b9a37a', 25 - pas, 54, 7, 26);
    R(g, '#3a2414', 15 + pas, 79, 9, 5); R(g, '#3a2414', 24 - pas, 79, 9, 5);
    // veste en velours marron, chemise, cravate
    R(g, '#7a5233', 12, 28, 24, 28); R(g, '#e9e4d8', 20, 28, 8, 14); R(g, '#a8322c', 23, 30, 3, 12);
    R(g, '#5f3e25', 12, 54, 24, 2); R(g, '#c9a067', 13, 44, 4, 4);   // coudières
    // bras
    if (pose === 'bras' || rage) {
      R(g, '#7a5233', 35, 6, 6, 24); ovale(g, peau, 38, 6, 3, 3);
      if (!rage) { R(g, '#2f5fa8', 32, 0, 14, 8); R(g, '#f2ead2', 33, 1, 12, 1); }   // le livre au-dessus de sa tête
      R(g, '#7a5233', rage ? 7 : 7, rage ? 6 : 28, 6, rage ? 24 : 20);
      if (rage) ovale(g, peau, 10, 6, 3, 3);
    } else if (pose === 'lance') {
      R(g, '#7a5233', 34, 28, 12, 6); ovale(g, peau, 46, 31, 3, 3); R(g, '#7a5233', 7, 28, 6, 20);
    } else {
      R(g, '#7a5233', 7, 28, 6, 22); R(g, '#7a5233', 35, 28, 6, 22);
      ovale(g, peau, 10, 51, 3, 3); ovale(g, peau, 38, 51, 3, 3);
      R(g, '#2f5fa8', 36, 44, 9, 12);   // il tient un manuel
    }
    // tête : chauve sur le dessus, cheveux gris sur les côtés, lunettes, moustache
    ovale(g, peau, 24, 17, 9, 11);
    R(g, '#9a9a96', 14, 14, 3, 8); R(g, '#9a9a96', 31, 14, 3, 8);
    R(g, '#222', 17, 15, 6, 4); R(g, '#222', 25, 15, 6, 4); R(g, '#222', 23, 16, 2, 1);
    R(g, '#cfe8ff', 18, 16, 4, 2); R(g, '#cfe8ff', 26, 16, 4, 2);
    R(g, '#6b6b66', 20, 23, 8, 2);
    if (rage) { R(g, '#3a0a0a', 21, 26, 6, 3); R(g, '#222', 17, 12, 6, 2); R(g, '#222', 25, 12, 6, 2); }
    else if (pose === 'touche' || vaincu) ovale(g, '#3a0a0a', 24, 27, 3, 2);
    else R(g, '#5a2a1a', 21, 26, 6, 1);
    if (pose === 'touche') { ovale(g, '#fff6d8', 28, 10, 6, 4); ovale(g, '#ffc928', 29, 10, 3, 2); }   // œuf sur le crâne
    if (vaincu) { for (const [x, y] of [[14, 2], [24, 0], [34, 2]]) ecrire(g, '★', x, y + 4, 7, '#ffd84a'); }
  });
}

// ---------------------------------------------------------------- objets et projectiles
export function spritesClasse() {
  const S = {};
  for (const p of ['marche0', 'marche1', 'bras', 'lance', 'touche', 'rage', 'vaincu']) S['julien_' + p] = julien(p);
  S.table = toile(64, 36, (g) => {   // table d'élève (plateau en bois, pieds en métal), un cahier dessus
    R(g, '#3c3c40', 6, 10, 3, 26); R(g, '#3c3c40', 55, 10, 3, 26); R(g, '#2c2c30', 6, 24, 52, 2);
    R(g, '#c49a62', 0, 4, 64, 7); R(g, '#a07a48', 0, 10, 64, 2);
    R(g, '#e8e2d0', 40, 1, 12, 4); R(g, '#d0503a', 14, 2, 8, 3);
  });
  S.bureau = toile(64, 40, (g) => {   // bureau du prof : plein devant, pile de copies et pomme
    R(g, '#6b4626', 2, 8, 60, 32); R(g, '#8a5f38', 0, 4, 64, 6); R(g, '#5a3a1e', 6, 14, 52, 1);
    R(g, '#f2ead2', 8, 0, 16, 5); R(g, '#e2dac2', 9, 1, 14, 1); ovale(g, '#c8302a', 46, 2, 3, 3);
  });
  S.livre = toile(20, 14, (g) => { R(g, '#2f5fa8', 0, 0, 20, 14); R(g, '#f2ead2', 2, 11, 17, 2); R(g, '#ffd84a', 6, 4, 8, 2); });
  S.dico = toile(22, 16, (g) => { R(g, '#a8322c', 0, 0, 22, 16); R(g, '#f2ead2', 2, 12, 19, 3); ecrire(g, 'DICO', 11, 6, 6, '#ffd84a'); });
  S.copie = toile(16, 20, (g) => {
    R(g, '#f6f3ea', 0, 0, 16, 20); for (let y = 4; y < 20; y += 3) R(g, '#9fb6d8', 1, y, 14, 1);
    R(g, '#d84a4a', 3, 0, 1, 20); ecrire(g, '0/20', 9, 3, 4, '#d84a4a');
  });
  return S;
}
