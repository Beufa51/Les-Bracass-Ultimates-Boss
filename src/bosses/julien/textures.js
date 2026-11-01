// Dessins PROVISOIRES du niveau manif (faits par le code, aucun fichier image) : murs 64×64, personnages et objets.
// Chaque dessin est une petite toile (canvas) ; le moteur 3D (raycaster.js) les découpe en colonnes.
// Pour mettre de vraies images plus tard : remplacer la toile par l'image (même taille conseillée).

function toile(l, h, dessin) {
  const c = document.createElement('canvas');
  c.width = l; c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  dessin(g, l, h);
  return c;
}
const R = (g, c, x, y, l, h) => { g.fillStyle = c; g.fillRect(x, y, l, h); };
function ovale(g, c, x, y, rx, ry) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
function ecrire(g, txt, x, y, taille, c, police = 'bold') {
  g.font = `${police} ${taille}px monospace`; g.fillStyle = c; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y);
}
// petit bruit pour que les surfaces ne soient pas toutes lisses
function grain(g, l, h, force, graine = 1) {
  let s = graine;
  for (let i = 0; i < l * h / 6; i++) {
    s = (s * 9301 + 49297) % 233280; const x = s % l;
    s = (s * 9301 + 49297) % 233280; const y = s % h;
    g.fillStyle = (i % 2) ? `rgba(0,0,0,${force})` : `rgba(255,255,255,${force * 0.7})`;
    g.fillRect(x, y, 1, 1);
  }
}
function fenetre(g, x, y, l, h) {
  R(g, '#e8e2d0', x - 2, y - 2, l + 4, h + 4);
  R(g, '#25364a', x, y, l, h);
  R(g, '#3d5878', x + 1, y + 1, l / 2 - 2, h / 2 - 2);
  R(g, '#e8e2d0', x + l / 2 - 1, y, 2, h);
  R(g, '#e8e2d0', x, y + h / 2 - 1, l, 2);
}

// ---------------------------------------------------------------- murs
export function texturesMurs() {
  const T = {};
  T[1] = toile(64, 64, (g) => {   // briques + une fenêtre
    R(g, '#5a3324', 0, 0, 64, 64);
    for (let y = 0; y < 64; y += 8) for (let x = -8; x < 64; x += 16) {
      const dx = (y / 8) % 2 ? 8 : 0;
      R(g, ((x + y) / 8) % 3 ? '#8a4b35' : '#7c4230', x + dx + 1, y + 1, 14, 6);
    }
    fenetre(g, 20, 14, 24, 28);
    grain(g, 64, 64, 0.12, 3);
  });
  T[2] = toile(64, 64, (g) => {   // immeuble crème, 2 fenêtres, balcon
    R(g, '#d9cba8', 0, 0, 64, 64);
    for (let y = 0; y < 64; y += 16) R(g, '#c4b48f', 0, y, 64, 1);
    fenetre(g, 8, 10, 16, 26); fenetre(g, 40, 10, 16, 26);
    R(g, '#333', 4, 38, 56, 2);
    for (let x = 5; x < 60; x += 4) R(g, '#333', x, 39, 1, 8);
    R(g, '#333', 4, 46, 56, 1);
    grain(g, 64, 64, 0.08, 5);
  });
  T[3] = toile(64, 64, (g) => {   // boutique : enseigne + vitrine
    R(g, '#6d6d6d', 0, 0, 64, 64);
    R(g, '#b0262c', 0, 6, 64, 14);
    ecrire(g, 'TABAC', 32, 13, 10, '#ffe9a8');
    R(g, '#2a2a2a', 4, 24, 56, 40);
    const v = g.createLinearGradient(0, 24, 0, 64); v.addColorStop(0, '#6f97b0'); v.addColorStop(1, '#2d4656');
    g.fillStyle = v; g.fillRect(6, 26, 52, 38);
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(12, 60); g.lineTo(28, 30); g.moveTo(20, 62); g.lineTo(36, 30); g.stroke();
    R(g, '#2a2a2a', 31, 26, 2, 38);
    grain(g, 64, 64, 0.06, 7);
  });
  T[4] = toile(64, 64, (g) => {   // mur de béton tagué
    R(g, '#8e8e88', 0, 0, 64, 64);
    for (let x = 0; x < 64; x += 16) R(g, '#7a7a74', x, 0, 1, 64);
    grain(g, 64, 64, 0.18, 9);
    g.save(); g.translate(32, 24); g.rotate(-0.12);
    ecrire(g, 'GRÈVE', 0, 0, 15, '#e84aa0'); g.restore();
    ecrire(g, 'NON!', 20, 46, 11, '#3fd06a');
    ecrire(g, '✊', 48, 48, 12, '#ffd84a', 'normal');
  });
  T[5] = toile(64, 64, (g) => {   // palissade de chantier + affiches
    for (let x = 0; x < 64; x += 8) R(g, (x / 8) % 2 ? '#556b4e' : '#4b5f45', x, 0, 8, 64);
    for (let x = 0; x < 64; x += 8) R(g, '#3a4935', x, 0, 1, 64);
    R(g, '#f2efe0', 8, 14, 20, 28); ecrire(g, 'BAC', 18, 22, 7, '#c22'); ecrire(g, '2026', 18, 32, 7, '#222');
    R(g, '#ffd84a', 38, 22, 18, 24); ecrire(g, 'ON', 47, 30, 8, '#222'); ecrire(g, 'LÂCHE', 47, 39, 5, '#222');
    R(g, '#d0d0d0', 0, 60, 64, 4);
  });
  T[6] = toile(64, 64, (g) => {   // mur du lycée : pierre claire
    R(g, '#cdbf9a', 0, 0, 64, 64);
    for (let y = 0; y < 64; y += 12) { R(g, '#b5a780', 0, y, 64, 1); for (let x = (y / 12) % 2 * 16; x < 64; x += 32) R(g, '#b5a780', x, y, 1, 12); }
    fenetre(g, 22, 18, 20, 20);
    grain(g, 64, 64, 0.08, 11);
  });
  T[7] = toile(64, 64, (g) => {   // portail du lycée : grille verte, plaque « LYCÉE »
    const f = g.createLinearGradient(0, 0, 0, 64); f.addColorStop(0, '#9fc3dd'); f.addColorStop(0.6, '#d7d0bf'); f.addColorStop(1, '#a89f8c');
    g.fillStyle = f; g.fillRect(0, 0, 64, 64);
    R(g, '#c9b98f', 0, 34, 64, 20);
    for (let x = 2; x < 64; x += 6) { R(g, '#1f5a3a', x, 10, 2, 54); R(g, '#2f7a52', x, 8, 2, 3); }
    R(g, '#1f5a3a', 0, 20, 64, 3); R(g, '#1f5a3a', 0, 54, 64, 3);
    R(g, '#1c3f8f', 12, 0, 40, 11); R(g, '#fff', 13, 1, 38, 1);
    ecrire(g, 'LYCÉE', 32, 6, 8, '#ffffff');
  });
  return T;
}

// ---------------------------------------------------------------- personnages
const PEAU = '#e5b48c', PEAU_O = '#c48d68';
function eclabousser(g, l, h, n, graine) {   // traces d'œuf
  let s = graine;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280; const x = 8 + s % (l - 16);
    s = (s * 9301 + 49297) % 233280; const y = 14 + s % (h - 30);
    ovale(g, '#fff6d8', x, y, 5, 3); ovale(g, '#ffc928', x + 1, y, 2, 2);
  }
}

// Policier lanceur de lacrymos (48×80). poses : marche0, marche1, bras, lance, touche, fuite
function policier(pose) {
  return toile(48, 80, (g) => {
    const dos = pose === 'fuite';
    const pas = pose === 'marche1' ? 3 : pose === 'marche0' ? -3 : 0;
    // jambes
    R(g, '#16213f', 16 + pas, 52, 7, 26); R(g, '#16213f', 25 - pas, 52, 7, 26);
    R(g, '#111', 15 + pas, 76, 9, 4); R(g, '#111', 24 - pas, 76, 9, 4);
    // corps
    R(g, '#22356b', 13, 26, 22, 28); R(g, '#111', 13, 50, 22, 3);
    if (!dos) { R(g, '#d9d9d9', 16, 30, 6, 3); R(g, '#c9a227', 27, 30, 4, 4); }
    // bras + lanceur
    if (pose === 'bras') {
      R(g, '#22356b', 34, 6, 6, 22); ovale(g, '#3a3a3a', 37, 5, 4, 5); R(g, '#9aa', 35, 1, 4, 2);
      R(g, '#22356b', 7, 28, 6, 18);
    } else if (pose === 'lance') {
      R(g, '#22356b', 34, 22, 12, 6); R(g, PEAU, 44, 22, 4, 6);
      R(g, '#22356b', 7, 28, 6, 18);
    } else if (!dos) {
      R(g, '#22356b', 7, 28, 6, 18); R(g, '#22356b', 35, 28, 6, 18);
      R(g, '#555', 30, 38, 18, 5); R(g, '#333', 44, 37, 4, 7);   // lanceur
    } else {
      R(g, '#22356b', 6, 20, 6, 14); R(g, '#22356b', 36, 20, 6, 14);   // bras en l'air en fuyant
    }
    // tête + casque
    R(g, PEAU, 18, 14, 12, 12);
    ovale(g, '#1a2a55', 24, 13, 9, 8); R(g, '#1a2a55', 15, 13, 18, 4);
    if (!dos) { R(g, 'rgba(140,190,230,0.75)', 17, 16, 14, 6); R(g, '#222', 21, 23, 6, 1); }
    else R(g, '#1a2a55', 16, 14, 16, 10);
    if (pose === 'touche' || dos) eclabousser(g, 48, 80, dos ? 5 : 3, 17);
    if (pose === 'touche') { g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(10, 4, 30, 76); }
  });
}

// CRS au bouclier (56×80). poses : marche0, marche1, cri, charge, essouffle, touche, fuite
function crs(pose) {
  return toile(56, 80, (g) => {
    const dos = pose === 'fuite', bas = pose === 'essouffle';
    const pas = pose === 'marche1' || pose === 'charge' ? 3 : pose === 'marche0' ? -3 : 0;
    R(g, '#141414', 19 + pas, 52, 8, 26); R(g, '#141414', 29 - pas, 52, 8, 26);
    R(g, '#000', 18 + pas, 76, 10, 4); R(g, '#000', 28 - pas, 76, 10, 4);
    const yb = bas ? 32 : 24;
    R(g, '#262a30', 16, yb, 24, 30); R(g, '#3a3f48', 16, yb, 24, 6);
    // tête casquée
    const yt = bas ? 20 : 10;
    R(g, PEAU, 22, yt + 4, 12, 11);
    ovale(g, '#1b1d22', 28, yt + 3, 10, 9);
    if (!dos) {
      R(g, 'rgba(150,200,235,0.6)', 20, yt + 6, 16, 7);
      if (pose === 'cri') { R(g, '#4a1010', 25, yt + 13, 6, 3); }
      if (bas) { R(g, '#fff', 36, yt - 2, 4, 2); R(g, '#fff', 40, yt - 6, 3, 2); }   // il souffle
    }
    if (dos) { R(g, '#262a30', 8, 18, 6, 16); R(g, '#262a30', 42, 18, 6, 16); eclabousser(g, 56, 80, 5, 23); return; }
    // bouclier
    if (bas) {
      g.save(); g.translate(8, 46); g.rotate(-0.5);
      R(g, 'rgba(170,200,220,0.55)', 0, 0, 14, 30); R(g, '#9ab', 0, 0, 14, 2); g.restore();
    } else {
      const grand = pose === 'charge';
      const x = grand ? 4 : 8, y = grand ? 16 : 22, l = grand ? 48 : 40, h = grand ? 60 : 52;
      R(g, 'rgba(165,195,215,0.62)', x, y, l, h);
      g.strokeStyle = '#d8e4ec'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, l - 2, h - 2);
      ecrire(g, 'POLICE', x + l / 2, y + 12, grand ? 9 : 8, '#ffffff');
      R(g, 'rgba(255,255,255,0.25)', x + 4, y + 18, 3, h - 24);
    }
    if (pose === 'touche') { eclabousser(g, 56, 80, 3, 31); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(6, 4, 44, 76); }
  });
}

// Manifestant (décor), 48×100 avec sa pancarte
const PANCARTES = [['NON !', '#e83a3a'], ['GRÈVE', '#2a7de1'], ['BAC POUR', 'TOUS'], ['ON', 'LÂCHE RIEN']];
const HABITS = ['#d9472b', '#3f8f4a', '#7a3fa0', '#e0a030'];
function manifestant(n) {
  return toile(48, 100, (g) => {
    const [l1, l2] = PANCARTES[n % 4];
    R(g, '#6b4a2a', 23, 14, 2, 30);
    R(g, '#f5f0dc', 4, 2, 40, 22); g.strokeStyle = '#333'; g.strokeRect(4.5, 2.5, 39, 21);
    if (l2.startsWith('#')) ecrire(g, l1, 24, 13, 10, l2);
    else { ecrire(g, l1, 24, 9, 8, '#222'); ecrire(g, l2, 24, 18, 7, '#c22'); }
    R(g, '#2b3550', 16, 72, 7, 26); R(g, '#2b3550', 25, 72, 7, 26);
    R(g, HABITS[n % 4], 13, 46, 22, 28);
    R(g, HABITS[n % 4], 22, 30, 6, 18);   // bras qui tient la pancarte
    R(g, PEAU, 18, 32, 12, 13);
    R(g, ['#3a2416', '#111', '#a0662a', '#5a3a1a'][n % 4], 17, 30, 14, 5);
    R(g, '#222', 21, 37, 2, 2); R(g, '#222', 26, 37, 2, 2); R(g, '#7a2a2a', 22, 41, 4, 2);
  });
}

export function texturesSprites() {
  const S = {};
  for (const p of ['marche0', 'marche1', 'bras', 'lance', 'touche', 'fuite']) S['lanceur_' + p] = policier(p);
  for (const p of ['marche0', 'marche1', 'cri', 'charge', 'essouffle', 'touche', 'fuite']) S['bouclier_' + p] = crs(p);
  for (let i = 0; i < 4; i++) S['manifestant_' + i] = manifestant(i);
  S.barriere = toile(64, 40, (g) => {
    R(g, '#9aa0a6', 2, 4, 60, 3); R(g, '#9aa0a6', 2, 30, 60, 3);
    for (let x = 4; x < 62; x += 5) R(g, '#b8bec4', x, 6, 2, 25);
    R(g, '#7a8086', 2, 4, 3, 36); R(g, '#7a8086', 59, 4, 3, 36);
    R(g, '#55595d', 0, 37, 10, 3); R(g, '#55595d', 54, 37, 10, 3);
  });
  S.poubelle = toile(36, 46, (g) => {
    R(g, '#2f6b3a', 4, 10, 28, 34); R(g, '#24552e', 2, 6, 32, 6); R(g, '#1c4424', 4, 12, 28, 2);
    ovale(g, '#111', 8, 44, 3, 3); ovale(g, '#111', 28, 44, 3, 3);
    R(g, '#d8d8d8', 12, 2, 8, 5); R(g, '#c8a060', 22, 3, 6, 4);   // ça déborde
  });
  S.oeufs = toile(32, 20, (g) => {
    R(g, '#b88a52', 2, 6, 28, 13); R(g, '#9c7240', 2, 6, 28, 2);
    for (let i = 0; i < 3; i++) ovale(g, '#fff8e8', 9 + i * 7, 7, 3, 4);
    ecrire(g, 'ŒUFS', 16, 14, 6, '#4a2f12');
  });
  S.sandwich = toile(36, 18, (g) => {
    ovale(g, '#d39a4a', 18, 9, 16, 6); R(g, '#5fb04a', 4, 9, 28, 2); R(g, '#e2a8a0', 5, 10, 26, 2);
    for (let x = 8; x < 30; x += 6) R(g, '#b07a30', x, 5, 3, 1);
  });
  S.statue = toile(64, 128, (g) => {   // Marianne sur son socle (place de la République)
    R(g, '#8d8a80', 6, 84, 52, 44); R(g, '#a5a296', 6, 84, 52, 4); R(g, '#77746b', 10, 96, 44, 2);
    R(g, '#9b988c', 12, 72, 40, 14);
    ecrire(g, 'RF', 32, 108, 10, '#5d5a52');
    R(g, '#3f6b5a', 24, 30, 16, 44); R(g, '#355d4e', 20, 50, 24, 24);   // robe
    ovale(g, '#3f6b5a', 32, 24, 7, 8);                                   // tête
    R(g, '#3f6b5a', 38, 6, 5, 28); ovale(g, '#e0b040', 40, 6, 5, 5);    // bras levé + flamme
    R(g, '#2d4e42', 26, 18, 12, 3);                                      // bonnet
  });
  S.camion = toile(128, 80, (g) => {   // camion de CRS vu de face
    R(g, '#e8ecef', 6, 8, 116, 58); R(g, '#1d3f8f', 6, 40, 116, 10);
    R(g, '#2a3440', 14, 14, 100, 22); R(g, 'rgba(160,200,230,0.4)', 18, 16, 40, 8);
    for (let x = 16; x < 114; x += 6) R(g, '#6a7480', x, 14, 2, 22);      // grille de protection
    ecrire(g, 'POLICE', 64, 45, 8, '#ffffff');
    R(g, '#c9a227', 12, 54, 14, 6); R(g, '#c9a227', 102, 54, 14, 6);      // phares
    R(g, '#1d3f8f', 52, 2, 24, 6); R(g, '#3fa0ff', 56, 2, 6, 6); R(g, '#3fa0ff', 66, 2, 6, 6);   // gyrophares
    R(g, '#111', 10, 66, 22, 14); R(g, '#111', 96, 66, 22, 14); R(g, '#333', 6, 62, 116, 6);
  });
  S.colonne = toile(40, 112, (g) => {   // colonne Morris
    R(g, '#2f5a3a', 4, 100, 32, 12); R(g, '#2f5a3a', 8, 18, 24, 84);
    R(g, '#f0e6c8', 10, 24, 20, 30); ecrire(g, 'CINÉ', 20, 32, 6, '#a22'); R(g, '#ffd84a', 10, 58, 20, 36); ecrire(g, 'MANIF', 20, 70, 5, '#222');
    ovale(g, '#2f5a3a', 20, 14, 16, 6); ovale(g, '#264a30', 20, 6, 8, 6); R(g, '#264a30', 19, 0, 2, 4);
  });
  // ARMES : projectiles, fumées, objets à ramasser
  S.tomate = toile(12, 12, (g) => { ovale(g, '#d8281e', 6, 7, 5, 5); R(g, '#3f9a3a', 4, 1, 4, 3); R(g, '#ff8a7a', 3, 4, 2, 2); });
  S.splat_rouge = toile(22, 14, (g) => { ovale(g, '#c8241a', 11, 8, 10, 5); ovale(g, '#ff5a48', 12, 7, 4, 2); ovale(g, '#c8241a', 3, 4, 2, 2); ovale(g, '#e8d070', 16, 9, 1, 1); });
  S.eau = toile(8, 8, (g) => { ovale(g, 'rgba(140,200,255,0.85)', 4, 4, 3, 3); R(g, '#fff', 3, 2, 1, 1); });
  S.fumi = toile(10, 14, (g) => { R(g, '#d02a8a', 2, 4, 6, 10); R(g, '#222', 2, 4, 6, 2); ovale(g, 'rgba(240,140,200,0.8)', 5, 2, 4, 3); });
  S.fumee = toile(64, 56, (g) => {
    const b = [[20, 36, 15], [38, 32, 17], [50, 40, 12], [28, 20, 13], [44, 18, 11], [12, 44, 9], [56, 46, 8], [32, 8, 9]];
    for (const [x, y, r] of b) ovale(g, 'rgba(235,120,190,0.6)', x, y, r, r * 0.85);
    for (const [x, y, r] of b) ovale(g, 'rgba(160,230,140,0.3)', x + 3, y + 2, r * 0.5, r * 0.4);
  });
  S.tomates = toile(40, 24, (g) => {   // cagette de tomates
    for (let i = 0; i < 4; i++) ovale(g, '#d8281e', 8 + i * 8, 8, 4, 4);
    R(g, '#c8a060', 2, 10, 36, 13); for (let x = 4; x < 38; x += 6) R(g, '#a07a40', x, 12, 2, 9); R(g, '#8a6430', 2, 10, 36, 2);
  });
  S.eau_pistolet = toile(40, 24, (g) => {   // pistolet à eau au sol
    R(g, '#ff8c1a', 4, 8, 28, 8); R(g, '#2a9cff', 10, 2, 12, 7); R(g, '#ff8c1a', 22, 14, 6, 9); R(g, '#ffd84a', 32, 10, 6, 4);
  });
  S.fumigenes = toile(30, 26, (g) => {   // 3 fumigènes
    for (let i = 0; i < 3; i++) { R(g, ['#d02a8a', '#2ac05a', '#e0c020'][i], 4 + i * 9, 6, 6, 18); R(g, '#222', 4 + i * 9, 6, 6, 3); }
  });
  S.oeuf = toile(10, 12, (g) => { ovale(g, '#fffaf0', 5, 6, 4, 5.5); R(g, '#fff', 3, 3, 1, 2); });
  S.splat = toile(22, 14, (g) => { ovale(g, '#fff6d8', 11, 8, 10, 5); ovale(g, '#ffc928', 12, 8, 4, 3); ovale(g, '#fff6d8', 3, 4, 2, 2); ovale(g, '#fff6d8', 19, 3, 2, 2); });
  S.grenade = toile(12, 12, (g) => { R(g, '#3b4038', 3, 2, 6, 9); R(g, '#c8b030', 3, 2, 6, 2); ovale(g, 'rgba(220,220,210,0.7)', 6, 1, 3, 2); });
  S.nuage = toile(64, 48, (g) => {
    const b = [[20, 30, 14], [36, 26, 16], [48, 32, 12], [28, 18, 12], [42, 16, 10], [12, 36, 9], [54, 38, 9]];
    for (const [x, y, r] of b) ovale(g, 'rgba(205,215,190,0.55)', x, y, r, r * 0.85);
    for (const [x, y, r] of b) ovale(g, 'rgba(235,240,225,0.35)', x - 2, y - 3, r * 0.5, r * 0.4);
  });
  return S;
}

// Main du héros qui tient l'œuf (bas de l'écran). pose : 'tient' ou 'lance'
export function texturesMain() {
  const main = (lance) => toile(90, 80, (g) => {
    if (lance) {
      R(g, '#3a4a6a', 40, 30, 22, 50);    // manche du sweat, bras tendu vers l'avant
      ovale(g, PEAU, 50, 28, 12, 10); R(g, PEAU_O, 42, 30, 16, 3);
    } else {
      R(g, '#3a4a6a', 46, 48, 30, 32);
      ovale(g, PEAU, 56, 44, 15, 12);
      ovale(g, '#fffaf0', 52, 30, 9, 12); R(g, '#fff', 47, 24, 2, 5);
      R(g, PEAU, 42, 38, 8, 10); R(g, PEAU_O, 44, 44, 24, 2);
    }
  });
  // autres armes (dessins provisoires 105 × 120, comme la vraie image de la main à l'œuf)
  const bras = (g, x, y, l = 30) => { R(g, '#1f2c52', x, y, l, 120 - y); R(g, '#2a3a66', x + 4, y, 6, 120 - y); };
  const arme = (dessin) => toile(105, 120, (g) => { g.imageSmoothingEnabled = false; dessin(g); });
  return {
    tient: main(false), lance: main(true),
    pancarte: arme((g) => { R(g, '#7a5530', 50, 20, 6, 80); R(g, '#e8dcb8', 14, 6, 80, 40); g.strokeStyle = '#5a4a30'; g.strokeRect(14.5, 6.5, 79, 39); ecrire(g, 'NON !', 54, 26, 16, '#c22'); bras(g, 40, 88); ovale(g, PEAU, 54, 86, 13, 10); }),
    pancarte_tir: arme((g) => { g.save(); g.translate(40, 60); g.rotate(-0.9); R(g, '#7a5530', -3, -40, 6, 80); R(g, '#e8dcb8', -40, -70, 80, 40); ecrire(g, 'NON !', 0, -50, 16, '#c22'); g.restore(); bras(g, 30, 90); ovale(g, PEAU, 42, 86, 13, 10); }),
    tomates: arme((g) => { bras(g, 46, 70); ovale(g, PEAU, 60, 64, 16, 13); ovale(g, '#d8281e', 56, 48, 14, 13); R(g, '#3f9a3a', 52, 34, 8, 5); ovale(g, '#ff8a7a', 50, 44, 3, 3); }),
    tomates_tir: arme((g) => { bras(g, 40, 50); ovale(g, PEAU, 52, 46, 15, 11); }),
    eau: arme((g) => { bras(g, 52, 78); R(g, '#ff8c1a', 30, 52, 56, 18); R(g, '#2a9cff', 46, 34, 26, 18); R(g, '#ffd84a', 22, 56, 10, 8); R(g, '#ff8c1a', 62, 70, 12, 20); ovale(g, PEAU, 68, 80, 12, 10); }),
    eau_tir: arme((g) => { bras(g, 52, 78); R(g, '#ff8c1a', 30, 54, 56, 18); R(g, '#2a9cff', 46, 36, 26, 18); R(g, '#ffd84a', 22, 58, 10, 8); ovale(g, 'rgba(160,215,255,0.8)', 14, 58, 8, 5); R(g, '#ff8c1a', 62, 72, 12, 20); ovale(g, PEAU, 68, 82, 12, 10); }),
    fumigenes: arme((g) => { bras(g, 46, 72); ovale(g, PEAU, 60, 66, 15, 12); R(g, '#d02a8a', 52, 26, 14, 40); R(g, '#222', 52, 26, 14, 6); ovale(g, 'rgba(240,140,200,0.7)', 58, 18, 10, 8); }),
    fumigenes_tir: arme((g) => { bras(g, 40, 50); ovale(g, PEAU, 52, 46, 15, 11); }),
  };
}

// ---------------------------------------------------------------- vraies images (assets/sprites/julien/)
// Faites par outils/julien/decouper_planches.py à partir des planches de assets_inbox/julien/.
// Une image absente de cette liste garde son dessin provisoire ci-dessus.
const SPRITES = [
  ...['marche0', 'marche1', 'bras', 'lance', 'touche', 'fuite'].map(p => 'lanceur_' + p),
  ...['marche0', 'marche1', 'cri', 'charge', 'essouffle', 'touche', 'fuite'].map(p => 'bouclier_' + p),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(n => 'manifestant_' + n),
  'barriere', 'poubelle', 'oeufs', 'sandwich', 'oeuf', 'splat', 'grenade', 'nuage', 'statue', 'camion', 'colonne',
  'tomates', 'eau_pistolet', 'fumigenes', 'tomate', 'splat_rouge', 'fumee',
];
const MURS = { 1: 'mur_briques', 2: 'mur_immeuble', 3: 'mur_boutique', 4: 'mur_tag', 5: 'mur_palissade', 6: 'mur_lycee',
  7: 'portail_lycee', 8: 'mur_boutique2' };   // 8 : 2e tabac (façade en pierre), pas de dessin provisoire (repli : briques)
const MAINS = { tient: 'main_tient', lance: 'main_lance',
  ...Object.fromEntries(['pancarte', 'tomates', 'eau', 'fumigenes'].flatMap(a => [[a, 'main_' + a], [a + '_tir', 'main_' + a + '_tir']])) };
// hauteur dans le monde (1 = un mur) avec les vraies images : leur cadre inclut bras levés, pancartes, fumée…
const HAUTEURS_IMAGES = { lanceur: 1.0, bouclier: 0.95, manifestant: 1.1, barriere: 0.45, poubelle: 0.5, oeufs: 0.2,
  sandwich: 0.1, oeuf: 0.08, splat: 0.12, grenade: 0.16, nuage: 1.0, statue: 2.0, camion: 1.05, colonne: 1.5,
  tomates: 0.26, eau: 0.2, fumigenes: 0.28 };
export const HAUTEURS_PROVISOIRES = { lanceur: 0.82, bouclier: 0.86, manifestant: 1.0, barriere: 0.42, poubelle: 0.5, oeufs: 0.18,
  sandwich: 0.14, oeuf: 0.08, splat: 0.1, grenade: 0.1, nuage: 0.9, statue: 1.7, camion: 0.95, colonne: 1.35,
  tomates: 0.22, eau: 0.2, fumigenes: 0.22 };

// murs qui ont aussi une version AVEC panneau (posée sur 1 case sur 6 : voir raycaster.js)
const PANNEAUX = ['mur_briques', 'mur_immeuble', 'mur_tag', 'mur_lycee'];
const tous = () => [...SPRITES, ...Object.values(MURS), ...PANNEAUX.map(n => n + '_panneau'), ...Object.values(MAINS), 'tetes'];

// dans preload() : demande le chargement des images (une seule fois)
export function chargerImages(scene) {
  for (const n of tous()) if (!scene.textures.exists('julien_' + n)) scene.load.image('julien_' + n, `assets/sprites/julien/julien_${n}.png`);
}

// dans create() : remplace les dessins provisoires par les images chargées ; renvoie le nombre de manifestants différents
export function appliquerImages(scene, T) {
  const img = (n) => scene.textures.exists('julien_' + n) ? scene.textures.get('julien_' + n).getSourceImage() : null;
  T.hauteurs = { ...HAUTEURS_PROVISOIRES };
  let manif = 4;
  for (const n of SPRITES) {
    const i = img(n);
    if (!i) continue;
    T.spr[n] = i;
    const type = n.split('_')[0];
    if (HAUTEURS_IMAGES[type]) T.hauteurs[type] = HAUTEURS_IMAGES[type];
    if (type === 'manifestant') manif = Math.max(manif, +n.split('_')[1] + 1);
  }
  for (const [code, n] of Object.entries(MURS)) {
    const i = img(n), p = img(n + '_panneau');
    if (i) T.murs[code] = p ? [i, p] : i;
  }
  for (const [pose, n] of Object.entries(MAINS)) { const i = img(n); if (i) T.main[pose] = i; }
  T.main.image = !!img('main_tient');
  T.nbManif = manif;
  // tête du héros : planche de 20 cases sur une ligne → 20 images de la texture Phaser
  T.tetes = false;
  if (scene.textures.exists('julien_tetes')) {
    const tex = scene.textures.get('julien_tetes');
    const src = tex.getSourceImage(), fw = src.width / 20;
    if (!tex.has(0)) for (let k = 0; k < 20; k++) tex.add(k, 0, k * fw, 0, fw, src.height);
    T.tetes = true;
  }
}
