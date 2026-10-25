// =====================================================================
// DESSINS PROVISOIRES : tout ce qui n'a pas encore de vrai fichier image
// est dessiné ici par le code (style manga : contours épais, ombres, reflets).
// Chaque forme reçoit : ctx (pinceau), w / h (taille d'une case), p (réglages
// du manifeste), et l'image en cours { i, n } pour les animations.
// =====================================================================

const CONTOUR = '#1a1014';

// ---------- petits outils ----------
// Éclaircit (f > 0) ou assombrit (f < 0) une couleur "#rrggbb"
function teinte(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const cible = f > 0 ? 255 : 0, k = Math.abs(f);
  r = Math.round(r + (cible - r) * k); g = Math.round(g + (cible - g) * k); b = Math.round(b + (cible - b) * k);
  return `rgb(${r},${g},${b})`;
}

// Hasard "fixe" : le même dessin à chaque chargement
function hasard(graine) {
  let s = graine;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function remplir(ctx, couleur, epaisseur = 3) {
  ctx.fillStyle = couleur; ctx.fill();
  if (epaisseur) { ctx.strokeStyle = CONTOUR; ctx.lineWidth = epaisseur; ctx.lineJoin = 'round'; ctx.stroke(); }
}

function degrade(ctx, x0, y0, x1, y1, arrets) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  arrets.forEach(([pos, c]) => g.addColorStop(pos, c));
  return g;
}

// Bras avec biceps : de l'épaule (sx, sy) au poignet (gx, gy)
function bras(ctx, sx, sy, gx, gy, largeurEpaule, largeurPoignet, peau, tatouage) {
  const dx = gx - sx, dy = gy - sy, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const mx = sx + dx * 0.4, my = sy + dy * 0.4, b = largeurEpaule * 0.68;
  ctx.beginPath();
  ctx.moveTo(sx + nx * largeurEpaule / 2, sy + ny * largeurEpaule / 2);
  ctx.quadraticCurveTo(mx + nx * b, my + ny * b, gx + nx * largeurPoignet / 2, gy + ny * largeurPoignet / 2);
  ctx.lineTo(gx - nx * largeurPoignet / 2, gy - ny * largeurPoignet / 2);
  ctx.quadraticCurveTo(mx - nx * b, my - ny * b, sx - nx * largeurEpaule / 2, sy - ny * largeurEpaule / 2);
  ctx.closePath();
  remplir(ctx, degrade(ctx, mx + nx * b, my + ny * b, mx - nx * b, my - ny * b,
    [[0, teinte(peau, 0.25)], [0.45, peau], [1, teinte(peau, -0.35)]]));
  if (!tatouage) return;
  // manche de tatouages : taches de couleur à l'intérieur du bras
  ctx.save(); ctx.clip();
  const alea = hasard(Math.round(Math.abs(sx * 7 + sy * 3)) + 11);
  for (let k = 0; k < 46; k++) {
    const t = 0.12 + alea() * 0.86, cote = (alea() - 0.5) * largeurEpaule;
    ctx.fillStyle = tatouage[Math.floor(alea() * tatouage.length)];
    ctx.globalAlpha = 0.55 + alea() * 0.35;
    ctx.beginPath(); ctx.arc(sx + dx * t + nx * cote, sy + dy * t + ny * cote, 3 + alea() * 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3; ctx.stroke();
}

// Cheveux bouclés (coupe afro courte), vus de face
function cheveuxBoucles(ctx, hx, hy, couleur) {
  ctx.beginPath();
  ctx.moveTo(hx - 44, hy + 6);
  ctx.quadraticCurveTo(hx - 54, hy - 60, hx, hy - 66);
  ctx.quadraticCurveTo(hx + 54, hy - 60, hx + 44, hy + 6);
  ctx.lineTo(hx + 38, hy + 6); ctx.lineTo(hx + 36, hy - 24);
  ctx.quadraticCurveTo(hx, hy - 36, hx - 36, hy - 24);
  ctx.lineTo(hx - 38, hy + 6); ctx.closePath();
  remplir(ctx, degrade(ctx, hx, hy - 66, hx, hy, [[0, teinte(couleur, 0.1)], [1, couleur]]));
  // bord bosselé : une boucle tous les ~20°
  for (let a = Math.PI * 1.02; a <= Math.PI * 1.98; a += Math.PI / 9) {
    const x = hx + Math.cos(a) * 44, y = hy - 22 + Math.sin(a) * 40;
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2);
    remplir(ctx, degrade(ctx, x - 8, y - 8, x + 8, y + 8, [[0, teinte(couleur, 0.14)], [1, couleur]]), 2.5);
  }
  // petites boucles à l'intérieur
  ctx.strokeStyle = teinte(couleur, 0.18); ctx.lineWidth = 2;
  const alea = hasard(5);
  for (let k = 0; k < 16; k++) {
    const x = hx - 30 + alea() * 60, y = hy - 56 + alea() * 26;
    ctx.beginPath(); ctx.arc(x, y, 4, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke();
  }
}

// Barbe courte qui couvre la mâchoire, avec moustache
function barbe(ctx, hx, hy, couleur) {
  ctx.beginPath();
  ctx.moveTo(hx - 42, hy - 6);
  ctx.quadraticCurveTo(hx - 46, hy + 24, hx - 32, hy + 42);
  ctx.quadraticCurveTo(hx - 16, hy + 64, hx, hy + 64);
  ctx.quadraticCurveTo(hx + 16, hy + 64, hx + 32, hy + 42);
  ctx.quadraticCurveTo(hx + 46, hy + 24, hx + 42, hy - 6);
  ctx.lineTo(hx + 36, hy - 4);
  ctx.quadraticCurveTo(hx + 32, hy + 14, hx + 18, hy + 22);
  ctx.quadraticCurveTo(hx, hy + 16, hx - 18, hy + 22);
  ctx.quadraticCurveTo(hx - 32, hy + 14, hx - 36, hy - 4);
  ctx.closePath();
  remplir(ctx, degrade(ctx, hx, hy, hx, hy + 64, [[0, teinte(couleur, 0.15)], [1, couleur]]), 2.5);
  ctx.strokeStyle = teinte(couleur, 0.35); ctx.lineWidth = 1.5;
  const alea = hasard(9);
  for (let k = 0; k < 14; k++) {
    const x = hx - 30 + alea() * 60, y = hy + 26 + alea() * 30;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 1.4); ctx.stroke();
  }
}

// Gant de boxe : (x, y) = centre, r = taille, versBras = angle vers le coude
function gant(ctx, x, y, r, couleur, versBras, poignet = '#ffffff', pouce = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(versBras - Math.PI / 2);
  const k = r / 30;
  ctx.scale(k, k);
  const trait = 3 / k;
  // manchette (vers le bras)
  ctx.beginPath(); ctx.roundRect(-17, 18, 34, 22, 6);
  remplir(ctx, degrade(ctx, -17, 0, 17, 0, [[0, teinte(poignet, -0.3)], [0.4, poignet], [1, teinte(poignet, -0.4)]]), trait);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5 / k;
  ctx.beginPath(); ctx.moveTo(-10, 24); ctx.lineTo(10, 34); ctx.moveTo(10, 24); ctx.lineTo(-10, 34); ctx.stroke();
  // poing
  ctx.beginPath();
  ctx.moveTo(-27, 2);
  ctx.bezierCurveTo(-30, -34, 28, -38, 29, -4);
  ctx.bezierCurveTo(30, 18, 18, 26, 0, 26);
  ctx.bezierCurveTo(-18, 26, -26, 18, -27, 2);
  ctx.closePath();
  const g = ctx.createRadialGradient(-9, -14, 3, 0, -2, 36);
  g.addColorStop(0, teinte(couleur, 0.55)); g.addColorStop(0.35, couleur); g.addColorStop(1, teinte(couleur, -0.5));
  remplir(ctx, g, trait);
  // pouce
  ctx.beginPath(); ctx.ellipse(pouce * 22, 8, 8, 14, pouce * -0.4, 0, Math.PI * 2);
  remplir(ctx, teinte(couleur, -0.15), trait);
  // couture + reflet
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5 / k;
  ctx.beginPath(); ctx.moveTo(-20, 6); ctx.quadraticCurveTo(0, 14, 18, 4); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.ellipse(-10, -16, 9, 5, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Mèches de cheveux en pics (vue de face ou de dos)
function cheveuxPics(ctx, hx, hy, rayon, couleur, nbPics, frange) {
  ctx.beginPath();
  ctx.moveTo(hx - rayon, hy + 4);
  for (let i = 0; i <= nbPics; i++) {
    const a = Math.PI + (i / nbPics) * Math.PI;              // de la gauche vers la droite, par le haut
    const long = rayon * (1.45 + (i % 2) * 0.25);
    const aBase = a - Math.PI / nbPics / 2;
    ctx.lineTo(hx + Math.cos(aBase) * rayon * 0.95, hy + Math.sin(aBase) * rayon * 0.95);
    ctx.lineTo(hx + Math.cos(a) * long, hy + Math.sin(a) * long - 6);
  }
  ctx.lineTo(hx + rayon, hy + 4);
  if (frange) {   // frange : quelques pointes sur le front
    ctx.lineTo(hx + rayon * 0.75, hy - rayon * 0.25);
    ctx.lineTo(hx + rayon * 0.45, hy - rayon * 0.05);
    ctx.lineTo(hx + rayon * 0.25, hy - rayon * 0.4);
    ctx.lineTo(hx, hy - rayon * 0.1);
    ctx.lineTo(hx - rayon * 0.25, hy - rayon * 0.42);
    ctx.lineTo(hx - rayon * 0.5, hy - rayon * 0.08);
    ctx.lineTo(hx - rayon * 0.75, hy - rayon * 0.3);
  } else {
    ctx.quadraticCurveTo(hx, hy + rayon * 0.5, hx - rayon, hy + 4);
  }
  ctx.closePath();
  remplir(ctx, degrade(ctx, hx - rayon, hy - rayon * 1.6, hx + rayon, hy + rayon * 0.3,
    [[0, teinte(couleur, 0.35)], [0.5, couleur], [1, teinte(couleur, -0.4)]]));
  // reflets
  ctx.strokeStyle = teinte(couleur, 0.5); ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hx - rayon * 0.6, hy - rayon * 0.9); ctx.quadraticCurveTo(hx - rayon * 0.3, hy - rayon * 1.2, hx, hy - rayon * 1.1);
  ctx.moveTo(hx + rayon * 0.2, hy - rayon * 1.0); ctx.lineTo(hx + rayon * 0.5, hy - rayon * 0.85);
  ctx.stroke();
}

// =====================================================================
//  GREG, VU DE FACE
// =====================================================================
const POSES_FACE = {
  garde:         { g: [-48, -272, 34], d: [48, -266, 34] },
  garde_basse:   { g: [-58, -170, 34], d: [58, -174, 34] },
  prepare:       { g: [-46, -272, 34], d: [122, -300, 31], dx: 16 },
  prepare_bas:   { g: [-46, -266, 34], d: [112, -150, 31], dx: 12, dy: 10 },
  prepare_smash: { g: [-46, -254, 34], d: [80, -86, 38], dy: 30, dx: 10 },
  jab:           { g: [-14, -238, 64], d: [50, -266, 34], dy: -4 },
  crochet:       { g: [-50, -266, 34], d: [-74, -252, 56], dx: -22 },
  corps:         { g: [-50, -266, 34], d: [8, -150, 58], dy: 16 },
  uppercut:      { g: [-50, -254, 34], d: [10, -334, 60], dy: -10 },
  bloque:        { g: [-28, -302, 42], d: [28, -292, 42], dy: 6 },
  touche:        { g: [-122, -196, 34], d: [108, -226, 34], dx: 26, tete: 'ko' },
  essouffle:     { g: [-64, -138, 34], d: [64, -142, 34], dy: 26, tete: 'souffle' },
  victoire:      { g: [-48, -272, 34], d: [100, -372, 36], tete: 'rire' },
};

function boxeurFace(ctx, w, h, p) {
  const peau = p.peau || '#f2c9a0';
  ctx.save();
  ctx.translate(w / 2, h);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (p.pose === 'sol') { faceAuSol(ctx, p, peau); ctx.restore(); return; }
  const P = POSES_FACE[p.pose] || POSES_FACE.garde;
  const dx = P.dx || 0, dy = P.dy || 0;
  const T = (x, y) => [x + dx, y + dy];            // haut du corps
  const W = (x, y) => [x + dx * 0.4, y + dy];      // taille

  // cuisses (coupées par le bas de l'image)
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 90, -40); ctx.lineTo(s * 80, 4); ctx.lineTo(s * 14, 4); ctx.lineTo(s * 10, -40); ctx.closePath();
    remplir(ctx, degrade(ctx, s * 90, 0, s * 10, 0, [[0, teinte(peau, -0.4)], [0.6, peau], [1, teinte(peau, -0.2)]]));
  }

  // short en satin
  const [ax, ay] = W(-72, -108), [bx, by] = W(72, -108);
  ctx.beginPath();
  ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
  ctx.lineTo(96, -24); ctx.lineTo(10, -20); ctx.lineTo(0, -36); ctx.lineTo(-10, -20); ctx.lineTo(-96, -24);
  ctx.closePath();
  remplir(ctx, degrade(ctx, -96, 0, 96, 0, [[0, teinte(p.couleur, -0.45)], [0.3, teinte(p.couleur, 0.15)], [0.45, teinte(p.couleur, 0.4)], [0.6, p.couleur], [1, teinte(p.couleur, -0.5)]]));
  ctx.strokeStyle = p.bandes || 'rgba(255,255,255,0.85)'; ctx.lineWidth = 6;       // bandes latérales
  ctx.beginPath(); ctx.moveTo(ax + 4, ay + 12); ctx.lineTo(-90, -26); ctx.moveTo(bx - 4, by + 12); ctx.lineTo(90, -26); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;             // plis
  ctx.beginPath(); ctx.moveTo(-40 + dx * 0.4, -90 + dy); ctx.quadraticCurveTo(-48, -60, -44, -30);
  ctx.moveTo(36 + dx * 0.4, -86 + dy); ctx.quadraticCurveTo(44, -60, 40, -30); ctx.stroke();
  // ceinture
  ctx.beginPath(); ctx.roundRect(ax - 2, ay - 14, bx - ax + 4, 18, 4);
  remplir(ctx, degrade(ctx, 0, ay - 14, 0, ay + 4, [[0, teinte(p.ceinture, 0.4)], [0.5, p.ceinture], [1, teinte(p.ceinture, -0.35)]]));
  ctx.fillStyle = p.texteCeinture || '#1a1014'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(p.nom || '', (ax + bx) / 2, ay - 5);

  // torse
  ctx.beginPath();
  ctx.moveTo(...T(-26, -284));
  ctx.quadraticCurveTo(...T(-40, -268), ...T(-62, -266));
  ctx.quadraticCurveTo(...T(-102, -264), ...T(-108, -234));
  ctx.quadraticCurveTo(...T(-110, -206), ...T(-94, -196));
  ctx.quadraticCurveTo(...T(-90, -150), ...W(-68, -114));
  ctx.lineTo(...W(-70, -102)); ctx.lineTo(...W(70, -102)); ctx.lineTo(...W(68, -114));
  ctx.quadraticCurveTo(...T(90, -150), ...T(94, -196));
  ctx.quadraticCurveTo(...T(110, -206), ...T(108, -234));
  ctx.quadraticCurveTo(...T(102, -264), ...T(62, -266));
  ctx.quadraticCurveTo(...T(40, -268), ...T(26, -284));
  ctx.closePath();
  remplir(ctx, degrade(ctx, -110 + dx, 0, 110 + dx, 0,
    [[0, teinte(peau, -0.45)], [0.18, teinte(peau, -0.1)], [0.38, teinte(peau, 0.18)], [0.6, peau], [0.85, teinte(peau, -0.25)], [1, teinte(peau, -0.5)]]));
  // muscles : pectoraux, abdos, obliques
  const ombre = 'rgba(110,50,20,0.28)';
  ctx.fillStyle = ombre;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(...T(s * 4, -214)); ctx.quadraticCurveTo(...T(s * 40, -192), ...T(s * 84, -222));
    ctx.quadraticCurveTo(...T(s * 50, -200), ...T(s * 4, -204)); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(90,40,15,0.45)'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(...T(0, -250)); ctx.lineTo(...W(0, -118));
  for (const s of [-1, 1]) {
    ctx.moveTo(...T(s * 4, -212)); ctx.quadraticCurveTo(...T(s * 44, -192), ...T(s * 84, -224));
    ctx.moveTo(...T(s * 62, -186)); ctx.quadraticCurveTo(...T(s * 56, -150), ...W(s * 50, -118));
  }
  ctx.stroke();
  for (let r = 0; r < 3; r++) {
    for (const s of [-1, 1]) {
      const [x, y] = T(s * 20, -178 + r * 22);
      ctx.beginPath(); ctx.ellipse(x, y, 12, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,240,220,0.18)'; ctx.fill();
      ctx.strokeStyle = 'rgba(90,40,15,0.22)'; ctx.lineWidth = 2; ctx.stroke();
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.18)';      // reflet sur l'épaule
  ctx.beginPath(); ctx.ellipse(...T(-78, -240), 18, 8, -0.4, 0, Math.PI * 2); ctx.fill();

  // cou
  ctx.beginPath();
  ctx.moveTo(...T(-26, -282)); ctx.lineTo(...T(-24, -306)); ctx.lineTo(...T(24, -306)); ctx.lineTo(...T(26, -282));
  ctx.quadraticCurveTo(...T(0, -272), ...T(-26, -282));
  remplir(ctx, degrade(ctx, -26 + dx, 0, 26 + dx, 0, [[0, teinte(peau, -0.35)], [0.5, peau], [1, teinte(peau, -0.4)]]));

  // tête
  const ko = P.tete === 'ko';
  const hx = dx + (ko ? 24 : 0), hy = -330 + dy;
  ctx.save();
  if (ko) { ctx.translate(hx, hy); ctx.rotate(0.3); ctx.translate(-hx, -hy); }
  visageGreg(ctx, hx, hy, peau, p, P.tete);
  ctx.restore();

  // bras + gants (le plus gros gant, le plus "proche", en dernier)
  const dessinerBras = (epX, [gx, gy, r], cote) => {
    const sx = epX + dx, sy = -240 + dy, x = gx + dx, y = gy + dy;
    bras(ctx, sx, sy, x, y, 36, 24, peau, p.tatouage);
    gant(ctx, x, y, r, p.gants, Math.atan2(sy - y, sx - x), p.poignets || '#ffffff', cote);
  };
  if (P.g[2] >= P.d[2]) { dessinerBras(84, P.d, -1); dessinerBras(-84, P.g, 1); }
  else { dessinerBras(-84, P.g, 1); dessinerBras(84, P.d, -1); }
  ctx.restore();
}

function visageGreg(ctx, hx, hy, peau, p, expression) {
  // oreilles
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(hx + s * 42, hy + 4, 9, 14, 0, 0, Math.PI * 2); remplir(ctx, teinte(peau, -0.15));
  }
  // forme du visage : mâchoire carrée
  ctx.beginPath();
  ctx.moveTo(hx - 40, hy - 18);
  ctx.quadraticCurveTo(hx - 44, hy + 16, hx - 30, hy + 36);
  ctx.quadraticCurveTo(hx - 16, hy + 54, hx, hy + 55);
  ctx.quadraticCurveTo(hx + 16, hy + 54, hx + 30, hy + 36);
  ctx.quadraticCurveTo(hx + 44, hy + 16, hx + 40, hy - 18);
  ctx.quadraticCurveTo(hx + 38, hy - 54, hx, hy - 55);
  ctx.quadraticCurveTo(hx - 38, hy - 54, hx - 40, hy - 18);
  ctx.closePath();
  const g = ctx.createRadialGradient(hx - 12, hy - 14, 6, hx, hy, 60);
  g.addColorStop(0, teinte(peau, 0.2)); g.addColorStop(0.6, peau); g.addColorStop(1, teinte(peau, -0.35));
  remplir(ctx, g);
  // ombre sous les pommettes et sur la mâchoire
  ctx.fillStyle = 'rgba(110,50,20,0.22)';
  ctx.beginPath(); ctx.moveTo(hx - 36, hy + 18); ctx.quadraticCurveTo(hx - 26, hy + 30, hx - 16, hy + 50);
  ctx.quadraticCurveTo(hx - 30, hy + 44, hx - 36, hy + 18); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 36, hy + 18); ctx.quadraticCurveTo(hx + 26, hy + 30, hx + 16, hy + 50);
  ctx.quadraticCurveTo(hx + 30, hy + 44, hx + 36, hy + 18); ctx.fill();

  if (p.barbe) barbe(ctx, hx, hy, p.barbe);

  ctx.strokeStyle = CONTOUR; ctx.fillStyle = CONTOUR; ctx.lineCap = 'round';
  if (expression === 'ko') {
    // yeux en spirale
    for (const s of [-1, 1]) {
      ctx.lineWidth = 2.5; ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.3) {
        const r = a * 1.1, x = hx + s * 16 + Math.cos(a) * r, y = hy - 2 + Math.sin(a) * r * 0.8;
        a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(hx + 2, hy + 32, 12, 9, 0.1, 0, Math.PI * 2); remplir(ctx, '#5a1020', 2.5);
    ctx.fillStyle = '#e06a7a'; ctx.beginPath(); ctx.ellipse(hx + 6, hy + 36, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    // sourcils épais, froncés (ou levés quand il rit)
    const rire = expression === 'rire';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(hx + s * 34, hy - (rire ? 26 : 24)); ctx.lineTo(hx + s * 8, hy - (rire ? 22 : 12));
      ctx.lineTo(hx + s * 8, hy - (rire ? 16 : 6)); ctx.lineTo(hx + s * 32, hy - (rire ? 18 : 16)); ctx.closePath();
      ctx.fillStyle = p.cheveux || '#111'; ctx.fill();
      // oeil
      ctx.beginPath();
      ctx.moveTo(hx + s * 30, hy - 6); ctx.quadraticCurveTo(hx + s * 19, hy - 12, hx + s * 9, hy - 3);
      ctx.quadraticCurveTo(hx + s * 19, hy + 3, hx + s * 30, hy - 6); ctx.closePath();
      remplir(ctx, '#ffffff', 2);
      ctx.fillStyle = p.yeux || CONTOUR; ctx.beginPath(); ctx.arc(hx + s * 17, hy - 4, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = CONTOUR; ctx.beginPath(); ctx.arc(hx + s * 17, hy - 4, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(hx + s * 17 - 2, hy - 7, 2, 2);
    }
    // bouche
    ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3;
    if (expression === 'souffle') {
      ctx.beginPath(); ctx.ellipse(hx, hy + 33, 10, 12, 0, 0, Math.PI * 2); remplir(ctx, '#5a1020', 2.5);
    } else if (rire) {
      ctx.beginPath(); ctx.moveTo(hx - 18, hy + 28); ctx.quadraticCurveTo(hx, hy + 48, hx + 18, hy + 28); ctx.closePath();
      remplir(ctx, '#ffffff', 2.5);
    } else {
      if (p.barbe) { ctx.fillStyle = '#9a5444'; ctx.beginPath(); ctx.ellipse(hx, hy + 33, 13, 4, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(hx - 15, hy + 34); ctx.quadraticCurveTo(hx, hy + 30, hx + 15, hy + 32); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hx - 8, hy + 41); ctx.lineTo(hx + 8, hy + 41); ctx.stroke();
    }
  }
  // nez
  ctx.strokeStyle = 'rgba(90,40,15,0.7)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(hx + 2, hy - 2); ctx.quadraticCurveTo(hx + 6, hy + 14, hx + 1, hy + 18); ctx.lineTo(hx - 6, hy + 17); ctx.stroke();
  // pansement sur la joue (boxeur de manga !)
  if (p.pansement) {
  ctx.save(); ctx.translate(hx + 26, hy + 14); ctx.rotate(-0.5);
  ctx.beginPath(); ctx.roundRect(-11, -5, 22, 10, 3); remplir(ctx, '#f6efe2', 1.5);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-3, -3); ctx.lineTo(3, 3); ctx.moveTo(3, -3); ctx.lineTo(-3, 3); ctx.stroke();
  ctx.restore();
  }
  // gouttes de sueur quand il est essoufflé
  if (expression === 'souffle') {
    ctx.fillStyle = '#bfe8ff';
    for (const [x, y] of [[-46, -30], [48, -10], [-40, 20]]) {
      ctx.beginPath(); ctx.moveTo(hx + x, hy + y - 9); ctx.quadraticCurveTo(hx + x + 6, hy + y + 2, hx + x, hy + y + 4);
      ctx.quadraticCurveTo(hx + x - 6, hy + y + 2, hx + x, hy + y - 9); remplir(ctx, '#bfe8ff', 1.5);
    }
  }
  if (p.coiffure === 'boucles') cheveuxBoucles(ctx, hx, hy, p.cheveux || '#111');
  else cheveuxPics(ctx, hx, hy - 16, 44, p.cheveux || '#111', 9, true);
}

function faceAuSol(ctx, p, peau) {
  // Greg K.O., allongé sur le dos (vu en raccourci)
  ctx.beginPath(); ctx.ellipse(0, -16, 170, 20, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  // jambes
  for (const y of [-30, -52]) {
    ctx.beginPath(); ctx.roundRect(-170, y - 11, 90, 22, 10); remplir(ctx, degrade(ctx, 0, y - 11, 0, y + 11, [[0, peau], [1, teinte(peau, -0.35)]]));
  }
  // short
  ctx.beginPath(); ctx.roundRect(-100, -72, 70, 56, 14);
  remplir(ctx, degrade(ctx, 0, -72, 0, -16, [[0, teinte(p.couleur, 0.3)], [1, teinte(p.couleur, -0.4)]]));
  ctx.fillStyle = p.ceinture; ctx.fillRect(-36, -70, 8, 52);
  // torse
  ctx.beginPath(); ctx.ellipse(10, -46, 70, 32, 0, 0, Math.PI * 2);
  remplir(ctx, degrade(ctx, 0, -78, 0, -14, [[0, teinte(peau, 0.15)], [1, teinte(peau, -0.35)]]));
  // tête
  ctx.save(); ctx.translate(108, -54); ctx.rotate(Math.PI / 2 - 0.15);
  visageGreg(ctx, 0, 0, peau, p, 'ko');
  ctx.restore();
  // gants
  gant(ctx, 30, -104, 26, p.gants, Math.PI / 2, p.poignets || '#fff');
  gant(ctx, 50, 6, 26, p.gants, -Math.PI / 2, p.poignets || '#fff');
  // étoiles qui tournent
  ctx.fillStyle = '#ffd84a'; ctx.strokeStyle = CONTOUR; ctx.lineWidth = 2;
  for (const [x, y] of [[90, -150], [130, -170], [170, -146]]) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5 : 12;
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

// =====================================================================
//  TON BOXEUR, VU DE DOS
// =====================================================================
const POSES_DOS = {
  garde:     { g: [-60, -228, 27], d: [60, -228, 27] },
  jab:       { g: [-22, -298, 21], d: [58, -226, 27], dx: -6 },
  crochet:   { g: [-60, -226, 27], d: [14, -286, 23], dx: 10 },
  corps:     { g: [-60, -220, 27], d: [10, -232, 23], dx: 8, dy: 14 },
  esquive:   { g: [-52, -206, 27], d: [52, -206, 27], dy: 26 },
  bloque:    { g: [-25, -238, 30], d: [25, -238, 30], dy: 4 },
  touche:    { g: [-88, -206, 27], d: [84, -202, 27], dy: -6, tete: 10 },
  victoire:  { g: [-80, -306, 27], d: [80, -306, 27] },
  dempsey_g: { g: [-10, -276, 24], d: [62, -206, 27], dx: -36, dy: 34 },
  dempsey_d: { g: [-62, -206, 27], d: [10, -276, 24], dx: 36, dy: 34 },
};

function boxeurDos(ctx, w, h, p) {
  const peau = p.peau || '#f2c9a0';
  ctx.save();
  ctx.translate(w / 2, h);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (p.pose === 'sol') { dosAuSol(ctx, p, peau); ctx.restore(); return; }
  const P = POSES_DOS[p.pose] || POSES_DOS.garde;
  const dx = P.dx || 0, dy = P.dy || 0;
  const T = (x, y) => [x + dx, y + dy];

  // cuisses
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 72, -30); ctx.lineTo(s * 66, 4); ctx.lineTo(s * 10, 4); ctx.lineTo(s * 8, -30); ctx.closePath();
    remplir(ctx, degrade(ctx, s * 72, 0, s * 8, 0, [[0, teinte(peau, -0.4)], [1, peau]]));
  }
  // short
  ctx.beginPath();
  ctx.moveTo(-64, -100 + dy); ctx.lineTo(64, -100 + dy); ctx.lineTo(76, -16); ctx.lineTo(4, -12); ctx.lineTo(0, -26); ctx.lineTo(-4, -12); ctx.lineTo(-76, -16);
  ctx.closePath();
  remplir(ctx, degrade(ctx, -76, 0, 76, 0, [[0, teinte(p.couleur, -0.45)], [0.35, teinte(p.couleur, 0.35)], [0.55, p.couleur], [1, teinte(p.couleur, -0.5)]]));
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-60, -88 + dy); ctx.lineTo(-72, -18); ctx.moveTo(60, -88 + dy); ctx.lineTo(72, -18); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-66, -112 + dy, 132, 16, 4);
  remplir(ctx, degrade(ctx, 0, -112 + dy, 0, -96 + dy, [[0, '#ffffff'], [1, '#b9c4d6']]));
  ctx.fillStyle = teinte(p.couleur, -0.3); ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText("BRACASS'", 0, -104 + dy);

  // dos (trapèzes, omoplates, colonne)
  ctx.beginPath();
  ctx.moveTo(...T(-22, -224));
  ctx.quadraticCurveTo(...T(-40, -210), ...T(-66, -206));
  ctx.quadraticCurveTo(...T(-92, -202), ...T(-90, -176));
  ctx.quadraticCurveTo(...T(-80, -140), -60 + dx * 0.4, -110 + dy);
  ctx.lineTo(60 + dx * 0.4, -110 + dy);
  ctx.quadraticCurveTo(...T(80, -140), ...T(90, -176));
  ctx.quadraticCurveTo(...T(92, -202), ...T(66, -206));
  ctx.quadraticCurveTo(...T(40, -210), ...T(22, -224));
  ctx.closePath();
  remplir(ctx, degrade(ctx, -92 + dx, 0, 92 + dx, 0,
    [[0, teinte(peau, -0.45)], [0.25, teinte(peau, 0.15)], [0.5, peau], [0.8, teinte(peau, -0.2)], [1, teinte(peau, -0.5)]]));
  ctx.strokeStyle = 'rgba(90,40,15,0.45)'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(...T(0, -214)); ctx.quadraticCurveTo(...T(-2, -160), dx * 0.4, -114 + dy);
  for (const s of [-1, 1]) {
    ctx.moveTo(...T(s * 58, -196)); ctx.quadraticCurveTo(...T(s * 46, -160), ...T(s * 16, -168));   // omoplate
    ctx.moveTo(...T(s * 76, -160)); ctx.quadraticCurveTo(...T(s * 62, -132), ...T(s * 44, -118));   // dorsal
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.ellipse(...T(-64, -192), 16, 7, -0.3, 0, Math.PI * 2); ctx.fill();

  // nuque + oreilles + arrière de la tête
  const hx = dx + (P.tete || 0), hy = -250 + dy;
  ctx.beginPath(); ctx.moveTo(...T(-18, -220)); ctx.lineTo(...T(-16, -240)); ctx.lineTo(...T(16, -240)); ctx.lineTo(...T(18, -220)); ctx.closePath();
  remplir(ctx, degrade(ctx, -18 + dx, 0, 18 + dx, 0, [[0, teinte(peau, -0.35)], [0.5, peau], [1, teinte(peau, -0.4)]]));
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(hx + s * 30, hy + 6, 7, 11, 0, 0, Math.PI * 2); remplir(ctx, teinte(peau, -0.1));
  }
  ctx.beginPath(); ctx.ellipse(hx, hy, 30, 33, 0, 0, Math.PI * 2);
  remplir(ctx, degrade(ctx, hx - 30, hy - 30, hx + 30, hy + 30, [[0, teinte(p.cheveux, 0.3)], [0.6, p.cheveux], [1, teinte(p.cheveux, -0.4)]]));
  cheveuxPics(ctx, hx, hy + 4, 31, p.cheveux, 7, false);
  // pointes sur la nuque
  ctx.beginPath(); ctx.moveTo(hx - 24, hy + 18);
  for (let i = 0; i <= 6; i++) ctx.lineTo(hx - 24 + i * 8, hy + (i % 2 ? 36 : 22));
  ctx.closePath(); remplir(ctx, p.cheveux, 2.5);

  // bras + gants (vus de dos : on voit le dessus des gants)
  const dessinerBras = (epX, [gx, gy, r], cote) => {
    const sx = epX + dx, sy = -196 + dy, x = gx + dx, y = gy + dy;
    bras(ctx, sx, sy, x, y, 30, 20, teinte(peau, -0.08));
    gant(ctx, x, y, r, p.gants, Math.atan2(sy - y, sx - x), p.poignets || '#3fa7ff', cote);
  };
  dessinerBras(-70, P.g, -1); dessinerBras(70, P.d, 1);
  ctx.restore();
}

function dosAuSol(ctx, p, peau) {
  ctx.beginPath(); ctx.ellipse(0, -14, 130, 16, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(-130, -50, 80, 36, 14);
  remplir(ctx, degrade(ctx, 0, -50, 0, -14, [[0, teinte(p.couleur, 0.3)], [1, teinte(p.couleur, -0.4)]]));
  ctx.beginPath(); ctx.ellipse(0, -36, 66, 28, 0, 0, Math.PI * 2);
  remplir(ctx, degrade(ctx, 0, -64, 0, -8, [[0, teinte(peau, 0.15)], [1, teinte(peau, -0.35)]]));
  ctx.beginPath(); ctx.ellipse(86, -40, 30, 28, 0, 0, Math.PI * 2);
  remplir(ctx, degrade(ctx, 56, -68, 116, -12, [[0, teinte(p.cheveux, 0.3)], [1, teinte(p.cheveux, -0.3)]]));
  gant(ctx, 26, -84, 24, p.gants, Math.PI / 2, p.poignets || '#3fa7ff');
  gant(ctx, 40, -2, 24, p.gants, -Math.PI / 2, p.poignets || '#3fa7ff');
}

// =====================================================================
//  RING (vu depuis ton coin, face aux cordes du fond)
// =====================================================================
function ring(ctx, w, h) {
  const alea = hasard(42);
  // salle sombre
  ctx.fillStyle = degrade(ctx, 0, 0, 0, h * 0.62, [[0, '#05050d'], [0.6, '#151530'], [1, '#262447']]);
  ctx.fillRect(0, 0, w, h);
  // rampe de projecteurs
  ctx.fillStyle = '#1c1c28'; ctx.fillRect(0, 14, w, 10);
  for (let x = 40; x < w; x += 80) {
    const halo = ctx.createRadialGradient(x, 30, 2, x, 30, 46);
    halo.addColorStop(0, 'rgba(255,248,220,0.9)'); halo.addColorStop(0.2, 'rgba(255,240,190,0.35)'); halo.addColorStop(1, 'rgba(255,240,190,0)');
    ctx.fillStyle = halo; ctx.fillRect(x - 46, 0, 92, 80);
    ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.arc(x, 30, 6, 0, Math.PI * 2); ctx.fill();
  }
  // public (4 rangées de silhouettes, les plus proches plus claires)
  for (let rang = 0; rang < 5; rang++) {
    const y = 120 + rang * 34, base = 26 + rang * 12;
    for (let x = -20 + (rang % 2) * 15; x < w + 30; x += 30) {
      const v = base + Math.floor(alea() * 18);
      ctx.fillStyle = `rgb(${v},${v - 4},${v + 22})`;
      const tx = x + alea() * 6, ty = y + alea() * 6;
      ctx.beginPath(); ctx.arc(tx, ty, 11, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(tx, ty + 30, 17, 20, 0, Math.PI, 0); ctx.fill();
      ctx.fillRect(tx - 17, ty + 30, 34, 10);
    }
  }
  // flashs d'appareils photo
  for (let i = 0; i < 6; i++) {
    const x = alea() * w, y = 110 + alea() * 160, r = 2 + alea() * 3;
    const f = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    f.addColorStop(0, 'rgba(255,255,255,0.95)'); f.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = f; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - r * 1.6, y); ctx.lineTo(x + r * 1.6, y); ctx.moveTo(x, y - r * 1.6); ctx.lineTo(x, y + r * 1.6); ctx.stroke();
  }
  // tapis du ring en perspective
  ctx.beginPath(); ctx.moveTo(108, 330); ctx.lineTo(w - 108, 330); ctx.lineTo(w + 40, 505); ctx.lineTo(-40, 505); ctx.closePath();
  ctx.fillStyle = degrade(ctx, 0, 330, 0, 505, [[0, '#7f95ad'], [1, '#c9d7e6']]); ctx.fill();
  const flaque = ctx.createRadialGradient(w / 2, 420, 20, w / 2, 420, 330);
  flaque.addColorStop(0, 'rgba(255,255,240,0.45)'); flaque.addColorStop(1, 'rgba(255,255,240,0)');
  ctx.fillStyle = flaque; ctx.fill();
  // logo au centre du tapis
  ctx.save(); ctx.translate(w / 2, 420); ctx.scale(1, 0.28);
  ctx.strokeStyle = 'rgba(40,60,110,0.45)'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(0, 0, 200, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 170, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(40,60,110,0.45)'; ctx.font = 'bold italic 34px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText("BRACASS' GYM", w / 2, 422);
  // poteaux et coussins de coin
  for (const [x, couleur] of [[104, '#c0392b'], [w - 104, '#2c6fbf']]) {
    ctx.beginPath(); ctx.roundRect(x - 9, 190, 18, 148, 4);
    remplir(ctx, degrade(ctx, x - 9, 0, x + 9, 0, [[0, '#888'], [0.4, '#eee'], [1, '#555']]), 2);
    ctx.beginPath(); ctx.roundRect(x - 15, 200, 30, 112, 10);
    remplir(ctx, degrade(ctx, x - 15, 0, x + 15, 0, [[0, teinte(couleur, -0.4)], [0.4, teinte(couleur, 0.3)], [1, teinte(couleur, -0.5)]]), 2);
  }
  // cordes (cylindres légèrement détendus)
  ['#e74c3c', '#f2f2f2', '#2f86d6'].forEach((c, i) => {
    const y = 216 + i * 36;
    ctx.lineCap = 'round';
    ctx.strokeStyle = CONTOUR; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(118, y); ctx.quadraticCurveTo(w / 2, y + 7, w - 118, y); ctx.stroke();
    ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(118, y - 2); ctx.quadraticCurveTo(w / 2, y + 5, w - 118, y - 2); ctx.stroke();
  });
  // tablier du ring (devant)
  ctx.fillStyle = degrade(ctx, 0, 500, 0, h, [[0, '#2f47a8'], [1, '#14215c']]); ctx.fillRect(0, 500, w, h - 500);
  ctx.fillStyle = '#ffd84a'; ctx.fillRect(0, 500, w, 4);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px monospace';
  ctx.fillText("BRACASS' BOXING CLUB  ·  CHAMPIONNAT DES BOSS", w / 2, 526);
  // cônes de lumière
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const x of [220, 480, 740]) {
    ctx.fillStyle = degrade(ctx, 0, 0, 0, h, [[0, 'rgba(255,245,200,0.13)'], [1, 'rgba(255,245,200,0.02)']]);
    ctx.beginPath(); ctx.moveTo(x - 18, 24); ctx.lineTo(x + 18, 24); ctx.lineTo(x + 190, h); ctx.lineTo(x - 190, h); ctx.fill();
  }
  ctx.restore();
  // vignette
  const v = ctx.createRadialGradient(w / 2, h * 0.55, h * 0.35, w / 2, h * 0.55, w * 0.7);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}

// =====================================================================
//  LE VIEUX COACH (portrait)
// =====================================================================
function coach(ctx, w, h) {
  const peau = '#ecc39b';
  ctx.save(); ctx.translate(w / 2, h);
  // manteau
  ctx.beginPath(); ctx.moveTo(-70, 0); ctx.quadraticCurveTo(-66, -50, -30, -58); ctx.lineTo(30, -58); ctx.quadraticCurveTo(66, -50, 70, 0); ctx.closePath();
  remplir(ctx, degrade(ctx, -70, 0, 70, 0, [[0, '#15151d'], [0.4, '#3a3a4c'], [1, '#101016']]));
  ctx.beginPath(); ctx.moveTo(-14, -58); ctx.lineTo(0, -20); ctx.lineTo(14, -58); ctx.closePath(); remplir(ctx, '#e9e2d0', 2);
  // tête chauve
  ctx.beginPath(); ctx.ellipse(0, -100, 38, 46, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(-12, -122, 4, 0, -100, 56);
  g.addColorStop(0, '#fff3e0'); g.addColorStop(0.4, peau); g.addColorStop(1, teinte(peau, -0.35));
  remplir(ctx, g);
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-12, -128, 10, 5, -0.4, 0, Math.PI * 2); ctx.fill();
  // rides
  ctx.strokeStyle = 'rgba(90,40,15,0.45)'; ctx.lineWidth = 1.5;
  for (const y of [-126, -119]) { ctx.beginPath(); ctx.moveTo(-18, y); ctx.quadraticCurveTo(0, y - 4, 18, y); ctx.stroke(); }
  // gros sourcils blancs + yeux plissés
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(s * 15, -108, 13, 5, s * 0.25, 0, Math.PI * 2); remplir(ctx, '#f4f4f4', 1.5);
    ctx.strokeStyle = CONTOUR; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(s * 7, -99); ctx.lineTo(s * 22, -100); ctx.stroke();
  }
  // nez + moustache
  ctx.strokeStyle = 'rgba(90,40,15,0.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -98); ctx.quadraticCurveTo(5, -84, 0, -80); ctx.stroke();
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0, -78); ctx.quadraticCurveTo(s * 20, -82, s * 30, -68); ctx.quadraticCurveTo(s * 16, -70, 0, -72); ctx.closePath();
    remplir(ctx, '#f8f8f8', 1.5);
  }
  // canne
  ctx.strokeStyle = CONTOUR; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(56, 0); ctx.lineTo(56, -96); ctx.arc(46, -96, 10, 0, Math.PI, true); ctx.stroke();
  ctx.strokeStyle = '#8b5a2b'; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}

// =====================================================================
//  HUB
// =====================================================================
// Héros du hub, vu de dessus en 3/4, tourné vers la droite (i = image de marche)
function perso(ctx, w, h, p, { i, n }) {
  const pas = n > 1 ? Math.sin((i / n) * Math.PI * 2) : 0;
  const rebond = n > 1 ? -Math.abs(pas) * 2 : 0;
  ctx.save(); ctx.translate(w / 2, h);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, -4, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  // jambes
  for (const [s, k] of [[-1, pas], [1, -pas]]) {
    ctx.beginPath(); ctx.roundRect(s * 6 - 4 + k * 5, -18, 8, 14, 3); remplir(ctx, '#2b3550', 2);
    ctx.beginPath(); ctx.roundRect(s * 6 - 5 + k * 6, -7, 11, 6, 3); remplir(ctx, '#ffffff', 2);
  }
  ctx.translate(0, rebond);
  // corps (t-shirt)
  ctx.beginPath(); ctx.roundRect(-12, -34, 24, 20, 7);
  remplir(ctx, degrade(ctx, -12, 0, 12, 0, [[0, teinte(p.couleur, 0.25)], [1, teinte(p.couleur, -0.3)]]), 2);
  // bras qui balancent
  ctx.beginPath(); ctx.roundRect(-16 - pas * 2, -32, 6, 14, 3); remplir(ctx, '#f2c9a0', 2);
  ctx.beginPath(); ctx.roundRect(10 + pas * 2, -32, 6, 14, 3); remplir(ctx, '#f2c9a0', 2);
  // tête
  ctx.beginPath(); ctx.arc(0, -46, 14, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(-4, -50, 2, 0, -46, 16); g.addColorStop(0, '#ffe1c0'); g.addColorStop(1, '#d9a77c');
  remplir(ctx, g, 2);
  ctx.beginPath(); ctx.moveTo(-15, -46); ctx.quadraticCurveTo(-16, -64, 2, -62); ctx.lineTo(8, -66); ctx.lineTo(10, -60);
  ctx.quadraticCurveTo(16, -58, 14, -50); ctx.lineTo(4, -54); ctx.lineTo(-2, -50); ctx.lineTo(-8, -54); ctx.closePath();
  remplir(ctx, '#4a2c18', 2);
  ctx.fillStyle = CONTOUR; ctx.fillRect(4, -47, 3, 5); ctx.fillRect(9, -47, 3, 5);
  ctx.restore();
}

function porte(ctx, w, h, p) {
  // encadrement en pierre
  ctx.fillStyle = degrade(ctx, 0, 0, w, 0, [[0, '#5b5566'], [0.5, '#8a8496'], [1, '#4a4555']]);
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
  for (let y = 10; y < h; y += 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(8, y); ctx.moveTo(w - 8, y); ctx.lineTo(w, y); ctx.stroke(); }
  // porte en planches
  ctx.beginPath(); ctx.roundRect(9, 8, w - 18, h - 8, [16, 16, 0, 0]);
  remplir(ctx, degrade(ctx, 9, 0, w - 9, 0, [[0, teinte(p.couleur, -0.35)], [0.5, teinte(p.couleur, 0.1)], [1, teinte(p.couleur, -0.4)]]), 3);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2;
  for (let x = 9 + (w - 18) / 4; x < w - 12; x += (w - 18) / 4) { ctx.beginPath(); ctx.moveTo(x, 12); ctx.lineTo(x, h); ctx.stroke(); }
  // ferrures
  ctx.fillStyle = '#2a2a2a';
  for (const y of [28, h - 26]) ctx.fillRect(11, y, w - 22, 6);
  // poignée dorée
  const g = ctx.createRadialGradient(w - 24, h * 0.55 - 2, 1, w - 22, h * 0.55, 7);
  g.addColorStop(0, '#fff3b0'); g.addColorStop(1, '#b8860b');
  ctx.beginPath(); ctx.arc(w - 22, h * 0.55, 6, 0, Math.PI * 2); remplir(ctx, g, 2);
}

function dalle(ctx, w, h, p) {
  ctx.fillStyle = degrade(ctx, 0, 0, w, h, [[0, teinte(p.couleur, 0.08)], [1, teinte(p.couleur, -0.12)]]);
  ctx.fillRect(0, 0, w, h);
  const alea = hasard(7);
  for (let k = 0; k < 24; k++) {
    ctx.fillStyle = `rgba(255,255,255,${alea() * 0.05})`;
    ctx.fillRect(alea() * w, alea() * h, 3, 3);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.moveTo(3, h - 3); ctx.lineTo(3, 3); ctx.lineTo(w - 3, 3); ctx.stroke();
}

function mur(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.45); ctx.fillRect(0, 0, w, h);
  const alea = hasard(3);
  for (let y = 0; y < h; y += 16) {
    const dec = (y / 16) % 2 ? w / 2 : 0;
    for (let x = dec - w / 2; x < w; x += w / 2) {
      const c = teinte(p.couleur, (alea() - 0.5) * 0.25);
      ctx.fillStyle = degrade(ctx, 0, y, 0, y + 14, [[0, c], [1, teinte(p.couleur, -0.25)]]);
      ctx.fillRect(x + 1, y + 1, w / 2 - 2, 14);
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x + 1, y + 1, w / 2 - 2, 2);
    }
  }
}

function cercle(ctx, w, h, p) {
  const r = Math.min(w, h) / 2 - 3;
  ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
  remplir(ctx, degrade(ctx, 0, 0, 0, h, [[0, teinte(p.couleur, -0.4)], [1, teinte(p.couleur, 0.2)]]), 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(w / 2, h / 2, r - 6, 0, Math.PI * 2); ctx.stroke();
}

// Médaille : disque métallique, anneau, lettre gravée
function badge(ctx, w, h, p) {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 3;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, 1, cx, cy, r * 1.2);
  g.addColorStop(0, teinte(p.couleur, 0.6)); g.addColorStop(0.5, p.couleur); g.addColorStop(1, teinte(p.couleur, -0.5));
  remplir(ctx, g, 2.5);
  ctx.beginPath(); ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.font = `bold ${Math.round(h * 0.42)}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillText(p.lettre || '?', cx + 1, cy + 2);
  ctx.fillStyle = '#ffffff'; ctx.fillText(p.lettre || '?', cx, cy + 1);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.ellipse(cx - r * 0.4, cy - r * 0.45, r * 0.25, r * 0.12, -0.6, 0, Math.PI * 2); ctx.fill();
}

function rect(ctx, w, h, p, { i, n }) {
  const r = n > 1 ? Math.round(Math.sin((i / n) * Math.PI * 2) * 3) : 0;
  ctx.beginPath(); ctx.roundRect(6, 6 + r, w - 12, h - 12, 8);
  remplir(ctx, degrade(ctx, 0, 6, 0, h - 6, [[0, teinte(p.couleur, 0.3)], [1, teinte(p.couleur, -0.3)]]));
}

export const FORMES = { rect, cercle, badge, perso, porte, dalle, mur, boxeurFace, boxeurDos, ring, coach };
