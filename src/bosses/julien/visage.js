// Tête du héros (l'étudiant) dans la barre du bas, comme dans Doom.
// - niveau 0 à 4 : plus il a perdu de vie, plus il est amoché (bleu, pansement, œil au beurre noir…)
// - regard -1 / 0 / 1 : il jette des coups d'œil à gauche / droite tout seul ; quand on le touche, il tourne la tête
//   vers ce qui l'a touché
// - expression : normal, aie (touché), tousse (dans les lacrymos), content (objet ramassé), ko (perdu)
// Dessin provisoire 34×40 fait par le code ; plus tard : une planche d'images (mêmes états) remplacera ce dessin.

const L = 34, H = 40;
const cache = new Map();
const PEAU = '#e5b48c', OMBRE = '#c48d68', CHEVEUX = '#5a3a1e', SWEAT = '#3a4a6a';

export function niveauVisage(vie, maxi) {
  const p = vie / maxi;
  return p > 0.8 ? 0 : p > 0.6 ? 1 : p > 0.4 ? 2 : p > 0.2 ? 3 : 4;
}

export function toileVisage(niveau, regard, expression) {
  const cle = `${niveau}:${regard}:${expression}`;
  if (cache.has(cle)) return cache.get(cle);
  const c = document.createElement('canvas');
  c.width = L; c.height = H;
  const g = c.getContext('2d');
  const R = (col, x, y, l, h) => { g.fillStyle = col; g.fillRect(x, y, l, h); };
  const t = expression === 'aie' ? regard : 0;   // la tête tourne vers le coup
  const dx = t;

  // sweat (capuche) + cou
  R(SWEAT, 2, 34, 30, 6); R('#2c3a56', 6, 32, 22, 3);
  R(OMBRE, 13 + dx, 29, 8, 5);
  // visage
  R(PEAU, 8 + dx, 8, 18, 23); R(PEAU, 7 + dx, 12, 20, 15); R(OMBRE, 8 + dx, 28, 18, 3);
  R(PEAU, 5 + dx, 15, 2, 6); R(PEAU, 27 + dx, 15, 2, 6);   // oreilles
  // cheveux en bataille (de plus en plus en désordre)
  R(CHEVEUX, 7 + dx, 3, 20, 7); R(CHEVEUX, 6 + dx, 6, 3, 8); R(CHEVEUX, 25 + dx, 6, 3, 8);
  R(CHEVEUX, 10 + dx, 1, 4, 3); R(CHEVEUX, 17 + dx, 0, 4, 4); R(CHEVEUX, 23 + dx, 2, 3, 3);
  if (niveau >= 2) { R(CHEVEUX, 4 + dx, 2, 3, 3); R(CHEVEUX, 27 + dx, 0, 3, 4); }

  // yeux
  const ye = 15, xg = 11 + dx, xd = 20 + dx;
  if (expression === 'ko') {
    for (const x of [xg, xd]) { R('#222', x, ye, 1, 1); R('#222', x + 2, ye, 1, 1); R('#222', x + 1, ye + 1, 1, 1); R('#222', x, ye + 2, 1, 1); R('#222', x + 2, ye + 2, 1, 1); }
  } else if (expression === 'aie' || expression === 'tousse') {
    R('#222', xg - 1, ye + 1, 5, 1); R('#222', xd - 1, ye + 1, 5, 1);   // yeux plissés
    R('#222', xg, ye, 3, 1); R('#222', xd, ye, 3, 1);
    if (expression === 'tousse') { R('#8fd0ff', xg, ye + 3, 1, 3); R('#8fd0ff', xd + 2, ye + 3, 1, 4); }   // larmes
  } else {
    const p = expression === 'normal' ? regard : 0;
    R('#fff', xg - 1, ye, 5, 3); R('#fff', xd - 1, ye, 5, 3);
    R('#2a1a0a', xg + 1 + p, ye, 2, 3); R('#2a1a0a', xd + 1 + p, ye, 2, 3);
    R(CHEVEUX, xg - 1, ye - 2, 5, 1); R(CHEVEUX, xd - 1, ye - 2, 5, 1);   // sourcils
    if (niveau >= 4) { R('#8a4a4a', xg - 1, ye + 3, 5, 1); R('#8a4a4a', xd - 1, ye + 3, 5, 1); }   // cernes
  }
  if (niveau >= 3 && expression !== 'ko') { g.fillStyle = 'rgba(90,40,90,0.6)'; g.fillRect(xg - 2, ye - 1, 7, 6); }   // œil au beurre noir
  // nez
  R(OMBRE, 16 + dx, 18, 2, 4);
  // bouche
  const yb = 24;
  if (expression === 'content') { R('#5a1a1a', 12 + dx, yb - 1, 10, 3); R('#fff', 13 + dx, yb - 1, 8, 1); R('#5a1a1a', 11 + dx, yb - 2, 1, 1); R('#5a1a1a', 22 + dx, yb - 2, 1, 1); }
  else if (expression === 'aie') { R('#5a1a1a', 13 + dx, yb - 1, 8, 4); R('#fff', 14 + dx, yb - 1, 6, 1); }
  else if (expression === 'tousse') { R('#5a1a1a', 15 + dx, yb - 1, 4, 4); }
  else if (expression === 'ko') { R('#5a1a1a', 13 + dx, yb, 8, 2); R('#d06070', 16 + dx, yb + 1, 3, 3); }
  else if (niveau >= 3) { R('#5a1a1a', 13 + dx, yb + 1, 8, 1); R('#5a1a1a', 13 + dx, yb, 1, 1); }   // grimace
  else R('#5a1a1a', 14 + dx, yb, 6, 1);

  // amochage
  if (niveau >= 1) { g.fillStyle = 'rgba(120,60,140,0.45)'; g.fillRect(22 + dx, 20, 4, 3); }   // bleu sur la joue
  if (niveau >= 2) { R('#e8c890', 18 + dx, 8, 6, 3); R('#c9a870', 20 + dx, 8, 2, 3); }   // pansement
  if (niveau >= 3) { R('#b02020', 19 + dx, yb + 1, 1, 2); }   // lèvre fendue
  if (niveau >= 4) { R('#9ad', 26 + dx, 11, 1, 3); g.fillStyle = 'rgba(200,40,40,0.5)'; g.fillRect(9 + dx, 10, 3, 2); }   // sueur, égratignure
  if (expression === 'tousse') { g.fillStyle = 'rgba(140,200,90,0.25)'; g.fillRect(0, 0, L, H); }
  cache.set(cle, c);
  return c;
}
