// Décor du niveau manif, pour le moteur 3D (raycaster.js) : hauteur des immeubles, étages, sol texturé, ciel panoramique.
// Tout est fait par le code (aucune image à fournir) ; les murs viennent de textures.js.
import { PLAN_MANIF, SECRETS, PARVIS, SOMBRE, NEONS } from './niveau_manif.js';

// Hauteur de chaque mur (en étages) : immeubles de 3 niveaux, ruelle et lycée 2, palissade 1, portail un peu plus haut
export const HAUTEURS = { 1: 3, 2: 3, 3: 3, 8: 3, 4: 2, 5: 1, 6: 2, 7: 1.4, 9: 3 };
// Texture des étages (au-dessus du rez-de-chaussée) : un tabac a des appartements au-dessus, la ruelle aussi
const ETAGES = { 1: 1, 2: 2, 3: 1, 8: 2, 4: 1, 6: 6, 9: 2 };

// Genres de sol
const CHAUSSEE = 0, TROTTOIR = 1, PAVES = 2, DALLES = 3, PASSAGE_Y = 4, EGOUT = 5, TRACTS = 6, PASSAGE_X = 7;
// zones rectangulaires (x0, y0, x1, y1, genre) ; la place est pavée, le parvis et la cour sont dallés
const ZONES_SOL = [
  [6, 18, 27, 27, PAVES], [PARVIS.x0, PARVIS.y0, PARVIS.x1, PARVIS.y1, DALLES], [14, 1, 18, 2, DALLES],
  [9, 37, 11, 40, PASSAGE_Y],    // passage piéton qui traverse le boulevard
  [15, 17, 17, 17, PASSAGE_X],   // passage piéton au bout de la rue du lycée
];

function texture32(dessin) {
  const c = document.createElement('canvas'); c.width = 32; c.height = 32;
  const g = c.getContext('2d');
  dessin(g);
  return new Uint32Array(g.getImageData(0, 0, 32, 32).data.buffer.slice(0));
}
function bruit(g, base, force, graine) {
  g.fillStyle = base; g.fillRect(0, 0, 32, 32);
  let s = graine;
  for (let i = 0; i < 220; i++) {
    s = (s * 9301 + 49297) % 233280; const x = s % 32; s = (s * 9301 + 49297) % 233280; const y = s % 32;
    g.fillStyle = i % 2 ? `rgba(0,0,0,${force})` : `rgba(255,255,255,${force * 0.6})`; g.fillRect(x, y, 1, 1);
  }
}
function texturesSol() {
  const T = [];
  const asphalte = (g) => bruit(g, '#3c3d42', 0.25, 3);
  T[CHAUSSEE] = texture32(asphalte);
  T[TROTTOIR] = texture32((g) => { bruit(g, '#8a8a86', 0.15, 5); g.fillStyle = '#6f6f6b'; g.fillRect(0, 0, 32, 1); g.fillRect(0, 16, 32, 1); g.fillRect(0, 0, 1, 32); g.fillRect(16, 0, 1, 32); });
  T[PAVES] = texture32((g) => {
    g.fillStyle = '#4a4540'; g.fillRect(0, 0, 32, 32);
    for (let y = 0; y < 32; y += 4) for (let x = (y / 4) % 2 * 2 - 2; x < 32; x += 4) {   // petits pavés
      g.fillStyle = ['#7a7168', '#6e665e', '#857b70'][((x + 2) * 7 + y * 3) % 3]; g.fillRect(x + 1, y + 1, 3, 3);
    }
  });
  T[DALLES] = texture32((g) => { bruit(g, '#b4a888', 0.1, 7); g.fillStyle = '#968a6c'; g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32); });
  T[PASSAGE_Y] = texture32((g) => { asphalte(g); g.fillStyle = '#e8e8e0'; g.fillRect(0, 2, 32, 6); g.fillRect(0, 18, 32, 6); });
  T[PASSAGE_X] = texture32((g) => { asphalte(g); g.fillStyle = '#e8e8e0'; g.fillRect(2, 0, 6, 32); g.fillRect(18, 0, 6, 32); });
  T[EGOUT] = texture32((g) => {
    asphalte(g); g.fillStyle = '#26272a'; g.beginPath(); g.arc(16, 16, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#4c4d52'; for (let i = 8; i < 25; i += 4) g.fillRect(i, 9, 2, 14);
  });
  T[TRACTS] = texture32((g) => {   // tracts et confettis tombés de la manif
    asphalte(g);
    for (const [x, y, c] of [[4, 6, '#d8d4c4'], [21, 4, '#c8b050'], [13, 21, '#d8d4c4'], [25, 25, '#b05a88']]) { g.fillStyle = c; g.fillRect(x, y, 3, 2); }
  });
  return T;
}

function genresSol() {
  const W = PLAN_MANIF[0].length, H = PLAN_MANIF.length;
  const estMur = (x, y) => x < 0 || y < 0 || x >= W || y >= H || /[1-9]/.test(PLAN_MANIF[y][x]) || !!SECRETS[PLAN_MANIF[y][x]];
  const genres = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let g = CHAUSSEE;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (estMur(x + dx, y + dy)) g = TROTTOIR;
    if (g === CHAUSSEE) {
      const h = (x * 73 + y * 151) % 29;
      if (h === 0) g = EGOUT; else if (y >= 36 && h % 6 === 1) g = TRACTS;
    }
    for (const [x0, y0, x1, y1, z] of ZONES_SOL) if (x >= x0 && x <= x1 && y >= y0 && y <= y1) g = z;
    genres[y * W + x] = g;
  }
  return { genres, largeur: W };
}

// Ciel panoramique (fait le tour complet) : toits de Paris, tour Eiffel, Sacré-Cœur, fumées de lacrymos
function panorama(h) {
  const W = 1024;
  const c = document.createElement('canvas'); c.width = W; c.height = h;
  const g = c.getContext('2d');
  const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, '#5f6f88'); d.addColorStop(0.75, '#b9bcc0'); d.addColorStop(1, '#d4cfc4');
  g.fillStyle = d; g.fillRect(0, 0, W, h);
  let s = 11; const alea = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 14; i++) {   // nuages
    const x = alea() * W, y = 8 + alea() * h * 0.35;
    g.fillStyle = 'rgba(235,236,238,0.35)';
    for (let k = 0; k < 5; k++) g.fillRect(x + k * 9 - 20, y + (k % 2) * 3, 26, 6);
  }
  // fumées de lacrymo qui montent
  for (const x of [140, 520, 860]) for (let k = 0; k < 9; k++) {
    g.fillStyle = `rgba(215,222,205,${0.5 - k * 0.04})`;
    g.beginPath(); g.arc(x + Math.sin(k) * 8 + k * 3, h - 22 - k * 9, 7 + k * 1.6, 0, Math.PI * 2); g.fill();
  }
  // tour Eiffel et Sacré-Cœur au loin
  g.fillStyle = '#7d8492';
  g.beginPath(); g.moveTo(300, h - 18); g.lineTo(306, h - 70); g.lineTo(308, h - 70); g.lineTo(314, h - 18); g.fill();
  g.fillRect(302, h - 40, 10, 2); g.fillRect(306, h - 76, 2, 8);
  g.beginPath(); g.arc(700, h - 34, 9, Math.PI, 0); g.fill(); g.fillRect(691, h - 34, 18, 16); g.fillRect(699, h - 48, 2, 6);
  // ligne de toits (zinc, cheminées), sur tout le tour
  let x = 0;
  while (x < W) {
    const l = 18 + alea() * 30, hh = 10 + alea() * 16;
    g.fillStyle = alea() < 0.5 ? '#5d6470' : '#666d79';
    g.beginPath(); g.moveTo(x, h); g.lineTo(x, h - hh); g.lineTo(x + 4, h - hh - 5); g.lineTo(x + l - 4, h - hh - 5); g.lineTo(x + l, h - hh); g.lineTo(x + l, h); g.fill();
    g.fillStyle = '#4c525c'; g.fillRect(x + 6, h - hh - 10, 3, 6); g.fillRect(x + l - 10, h - hh - 9, 3, 5);
    x += l;
  }
  return c;
}

// Construit le décor complet. murs : textures de textures.js (code → toile, ou [sans panneau, avec panneau])
export function construireDecor(ctx, murs, l, hVue) {
  const premier = (t) => Array.isArray(t) ? t[0] : t;
  const etages = {};
  for (const [code, de] of Object.entries(ETAGES)) etages[code] = premier(murs[de]);
  const mi = hVue / 2;
  const image = ctx.createImageData(l, hVue - mi);
  const brume = ctx.createLinearGradient(0, mi, 0, hVue);
  brume.addColorStop(0, 'rgba(28,30,38,0.8)'); brume.addColorStop(0.35, 'rgba(28,30,38,0.3)'); brume.addColorStop(1, 'rgba(28,30,38,0)');
  const sol = genresSol(), W = sol.largeur;
  // lumière : cases sombres (murs et sol plus foncés) et néons qui clignotent
  const sombre = new Uint8Array(sol.genres.length), neons = new Set();
  for (const [x0, y0, x1, y1] of SOMBRE) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) sombre[y * W + x] = 1;
  for (const [x0, y0, x1, y1] of NEONS) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) neons.add(y * W + x);
  const textures = texturesSol();
  // textures du sol assombries (même rang + 16)
  textures.forEach((t, i) => { const s = new Uint32Array(t.length);
    for (let k = 0; k < t.length; k++) { const v = t[k]; s[k] = (v & 0xff000000) | (((v >> 16 & 255) * 0.45) << 16) | (((v >> 8 & 255) * 0.45) << 8) | ((v & 255) * 0.5); }
    textures[i + 16] = s; });
  return {
    murs, etages, hauteurs: HAUTEURS, ciel: panorama(mi), sombre, neons, neonEteint: 0,
    sol: { ...sol, textures, image, buf: new Uint32Array(image.data.buffer), brume },
  };
}
