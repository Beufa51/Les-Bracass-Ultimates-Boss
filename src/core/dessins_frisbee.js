// =====================================================================
// DESSINS PROVISOIRES du match de frisbee (Lionel, façon Windjammers) :
// le terrain de plage, les joueurs vus de 3/4 (tournés vers la DROITE,
// le jeu les retourne pour Lionel) et le frisbee qui tourne.
// =====================================================================
import { CONTOUR, teinte, hasard, remplir, degrade } from './dessins.js';

// ---------- petits outils ----------
function trait(ctx, pts, largeur, couleur) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [l, c] of [[largeur + 3, CONTOUR], [largeur, couleur]]) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y);
    ctx.strokeStyle = c; ctx.lineWidth = l; ctx.stroke();
  }
}

// Frisbee vu de 3/4 : bord rouge, centre bleu, lettres "WJ" (comme sur les planches de Lionel)
function disque(ctx, x, y, rx, angle = 0, tour = 0) {
  const ry = rx * 0.45;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  ctx.beginPath(); ctx.ellipse(0, ry * 0.35, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = '#5a0e1a'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); remplir(ctx, degrade(ctx, 0, -ry, 0, ry, [[0, '#ff5a5a'], [1, '#b0182a']]), 2);
  ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.68, ry * 0.68, 0, 0, Math.PI * 2); ctx.fillStyle = '#2a4fd0'; ctx.fill();
  // bande qui tourne (montre la rotation)
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.68, ry * 0.68, 0, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = '#7fe36a'; ctx.lineWidth = Math.max(1.5, rx * 0.16);
  const a = tour * Math.PI * 2;
  ctx.beginPath(); ctx.moveTo(-Math.cos(a) * rx, -Math.sin(a) * ry); ctx.lineTo(Math.cos(a) * rx, Math.sin(a) * ry); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.ellipse(-rx * 0.35, -ry * 0.4, rx * 0.25, ry * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// =====================================================================
//  JOUEUR DE FRISBEE (3/4, tourné vers la droite)
//  Positions en "unités" (1 unité = h / 140), pieds en (0, 0), y vers le haut = négatif.
// =====================================================================
const POSES = {
  garde:    { pieds: [[-15, 0], [17, 0]], genoux: [[-15, -19], [17, -20]], bassin: -38, penche: 5,
              mains: [[14, -52], [24, -56]] },
  tient:    { pieds: [[-15, 0], [17, 0]], genoux: [[-15, -19], [17, -20]], bassin: -38, penche: 3,
              mains: [[-26, -58], [18, -56]], disque: 0 },
  lance:    { pieds: [[-24, 0], [24, 0]], genoux: [[-15, -18], [24, -22]], bassin: -36, penche: 8,
              mains: [[-26, -66], [44, -68]], disque: 1 },
  super:    { pieds: [[-24, 0], [24, 0]], genoux: [[-15, -18], [24, -22]], bassin: -36, penche: 10,
              mains: [[-28, -60], [46, -74]], disque: 1, tourbillon: true },
  rattrape: { pieds: [[-10, 0], [12, 0]], genoux: [[-9, -21], [13, -22]], bassin: -40, penche: -2,
              mains: [[4, -102], [16, -104]], disque: 'haut' },
  nargue:   { pieds: [[-11, 0], [13, 0]], genoux: [[-10, -21], [12, -21]], bassin: -41, penche: -3,
              mains: [[-14, -46], [8, -112]], disque: 'doigt' },
  victoire: { pieds: [[-13, 0], [15, 0]], genoux: [[-12, -21], [14, -21]], bassin: -41, penche: -4,
              mains: [[-16, -108], [18, -110]], disque: 1 },
  touche:   { pieds: [[-20, 0], [16, -6]], genoux: [[-18, -19], [8, -24]], bassin: -36, penche: -18,
              mains: [[-30, -58], [-6, -94]] },
  defaite:  { pieds: [[-22, 0], [12, 0]], genoux: [[-12, -4], [16, -22]], bassin: -22, penche: 26,
              mains: [[10, -40], [16, -42]], visageCache: true },
};

function poseCourse(i, n) {
  const a = (i / Math.max(1, n)) * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
  return {
    pieds: [[s * 18, Math.min(0, c * 9)], [-s * 18, Math.min(0, -c * 9)]],
    genoux: [[s * 9 + 6, -20], [-s * 9 + 6, -20]],
    bassin: -39 + Math.abs(s) * 2, penche: 10,
    mains: [[-s * 18 + 4, -54], [s * 18 + 8, -54]],
  };
}

function joueurFrisbee(ctx, w, h, p, { i, n }) {
  const u = h / 140;
  const P = p.pose === 'course' ? poseCourse(i, n) : (POSES[p.pose] || POSES.garde);
  ctx.save();
  if (p.pose === 'plongeon') {
    // corps à l'horizontale, bras tendus vers l'avant
    ctx.translate(w * 0.12, h - 22 * u); ctx.scale(u * 0.82, u * 0.82); ctx.rotate(1.35);
    dessinerCorps(ctx, { pieds: [[-10, 0], [8, 0]], genoux: [[-8, -20], [8, -20]], bassin: -40, penche: 0,
      mains: [[4, -112], [12, -110]], disque: p.avecDisque ? 'haut' : null }, p);
  } else {
    ctx.translate(w / 2, h - 4 * u); ctx.scale(u, u);
    dessinerCorps(ctx, P, p, i);
  }
  ctx.restore();
}

function dessinerCorps(ctx, P, p, image = 0) {
  const peau = p.peau || '#e0a77c', short = p.short || '#1f9a6a', maillot = p.maillot || '#1f9a6a';
  const panneau = p.panneau || '#f2ead2', chaussures = p.chaussures || '#2fae7a';
  const b = P.bassin, pen = P.penche || 0;
  const epY = b - 33, epX = pen;                 // épaules
  const hanches = [[-6, b], [7, b]], epaules = [[epX - 9, epY], [epX + 9, epY]];

  // tourbillon du super lancer (derrière)
  if (P.tourbillon) {
    ctx.save(); ctx.globalAlpha = 0.55;
    for (let k = 0; k < 4; k++) {
      ctx.strokeStyle = k % 2 ? '#bff5c8' : '#3fd07a'; ctx.lineWidth = 5 - k;
      ctx.beginPath(); ctx.ellipse(6, -50 + k * 6, 44 - k * 4, 16, -0.25, 0.3 + k, 5.6 + k); ctx.stroke();
    }
    ctx.restore();
  }

  // jambes : la jambe du fond d'abord
  const jambe = (k, fond) => {
    const [hx, hy] = hanches[k], [gx, gy] = P.genoux[k], [px, py] = P.pieds[k];
    const pp = fond ? teinte(peau, -0.18) : peau;
    trait(ctx, [[hx, hy], [gx, gy], [px, py - 6]], 7.5, pp);
    // chaussette + basket montante
    trait(ctx, [[px, py - 9], [px, py - 5]], 6.5, '#d9d9d9');
    ctx.beginPath(); ctx.roundRect(px - 5, py - 9, 15, 9, 3); remplir(ctx, fond ? teinte(chaussures, -0.2) : chaussures, 2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(px - 4, py - 2.5, 13, 2);
    // short sur le haut de la cuisse
    trait(ctx, [[hx, hy - 2], [hx + (gx - hx) * 0.5, hy + (gy - hy) * 0.5]], 11, fond ? teinte(short, -0.2) : short);
  };
  jambe(0, true);

  // bras du fond
  const brasDe = (k, fond) => {
    const [sx, sy] = epaules[k], [mx, my] = P.mains[k];
    const cx = (sx + mx) / 2 + (k ? 4 : -4), cy = (sy + my) / 2 + 5;
    const pp = fond ? teinte(peau, -0.18) : peau;
    trait(ctx, [[sx, sy], [cx, cy], [mx, my]], 6.5, pp);
    // poignet éponge vert et blanc
    const ax = mx + (cx - mx) * 0.28, ay = my + (cy - my) * 0.28;
    trait(ctx, [[ax, ay], [mx + (cx - mx) * 0.12, my + (cy - my) * 0.12]], 7.5, chaussures);
    ctx.beginPath(); ctx.arc(mx, my, 4.2, 0, Math.PI * 2); remplir(ctx, pp, 2);
  };
  brasDe(0, true);

  // short (bassin)
  ctx.beginPath(); ctx.moveTo(-10, b - 6); ctx.lineTo(11, b - 6); ctx.lineTo(13, b + 5); ctx.lineTo(-12, b + 5); ctx.closePath();
  remplir(ctx, short, 2);
  ctx.strokeStyle = panneau; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(11.5, b - 5); ctx.lineTo(13, b + 4); ctx.stroke();

  // maillot : côtés verts, devant crème avec le numéro
  ctx.beginPath();
  ctx.moveTo(epaules[0][0], epaules[0][1]); ctx.lineTo(epaules[1][0], epaules[1][1]);
  ctx.lineTo(11, b - 4); ctx.lineTo(-10, b - 4); ctx.closePath();
  remplir(ctx, maillot, 2);
  ctx.save(); ctx.clip();
  ctx.beginPath(); ctx.moveTo(epX - 3, epY + 3); ctx.lineTo(epX + 9, epY + 1); ctx.lineTo(12, b - 4); ctx.lineTo(-2, b - 4); ctx.closePath();
  ctx.fillStyle = panneau; ctx.fill();
  ctx.fillStyle = '#c8202c'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (p.numero) ctx.fillText(p.numero, (epX + 5 + 5) / 2 + 1, (epY + b) / 2 + 2);
  ctx.restore();
  // col
  ctx.strokeStyle = panneau; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(epX + 1, epY - 1, 5, 0.2, Math.PI - 0.2); ctx.stroke();

  jambe(1, false);
  brasDe(1, false);

  // tête
  const tx = epX + 3, ty = epY - 12;
  ctx.beginPath(); ctx.ellipse(tx - 10, ty + 1, 2.5, 3.5, 0, 0, Math.PI * 2); remplir(ctx, peau, 1.5);   // oreille
  ctx.beginPath(); ctx.ellipse(tx, ty, 10, 11.5, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(tx + 3, ty - 4, 1, tx, ty, 13);
  g.addColorStop(0, teinte(peau, 0.25)); g.addColorStop(1, teinte(peau, -0.15)); remplir(ctx, g, 2);
  // barbe de trois jours
  if (p.barbe) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(tx, ty, 10, 11.5, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = p.barbe; ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.ellipse(tx + 4, ty + 9, 9, 6, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // cheveux courts (ou en pics pour le héros)
  ctx.beginPath();
  if (p.coiffure === 'pics') {
    ctx.moveTo(tx - 11, ty + 1);
    for (let k = 0; k <= 6; k++) { const a = Math.PI + (k / 6) * Math.PI; ctx.lineTo(tx + Math.cos(a) * 15 - 2, ty - 2 + Math.sin(a) * 15); ctx.lineTo(tx + Math.cos(a + 0.26) * 10, ty - 2 + Math.sin(a + 0.26) * 10); }
    ctx.lineTo(tx + 10, ty - 3);
  } else {
    ctx.moveTo(tx - 10.5, ty + 2); ctx.quadraticCurveTo(tx - 12, ty - 14, tx + 1, ty - 13);
    ctx.quadraticCurveTo(tx + 11, ty - 12, tx + 10, ty - 4); ctx.lineTo(tx + 4, ty - 7); ctx.lineTo(tx - 4, ty - 5); ctx.lineTo(tx - 6, ty + 2);
  }
  ctx.closePath(); remplir(ctx, p.cheveux || '#5a3a22', 2);
  if (P.visageCache) {
    // mains sur le visage
    ctx.beginPath(); ctx.ellipse(tx + 5, ty + 1, 6, 7, 0, 0, Math.PI * 2); remplir(ctx, peau, 2);
  } else {
    // œil (regarde vers la droite), sourcil
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(tx + 5, ty - 1, 2.6, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.yeux || '#4a7ab0'; ctx.beginPath(); ctx.arc(tx + 6, ty - 1, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = CONTOUR; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(tx + 1.5, ty - 5); ctx.lineTo(tx + 8, ty - 5.5); ctx.stroke();
    // bouche : sourire en coin (chambreur) ou neutre
    ctx.beginPath();
    if (['nargue', 'victoire'].includes(p.pose)) { ctx.moveTo(tx + 2, ty + 5); ctx.quadraticCurveTo(tx + 6, ty + 8, tx + 9, ty + 3); }
    else if (p.pose === 'touche') { ctx.ellipse(tx + 6, ty + 6, 2, 2.5, 0, 0, Math.PI * 2); }
    else { ctx.moveTo(tx + 3, ty + 6); ctx.lineTo(tx + 8, ty + 5.5); }
    ctx.stroke();
  }

  // frisbee
  const tour = image * 0.25;
  if (P.disque === 0 || P.disque === 1) disque(ctx, P.mains[P.disque][0] + (P.disque ? 6 : -4), P.mains[P.disque][1] - 1, 12, P.disque ? -0.15 : 0.25, tour);
  if (P.disque === 'haut') disque(ctx, (P.mains[0][0] + P.mains[1][0]) / 2 + 2, (P.mains[0][1] + P.mains[1][1]) / 2 - 5, 13, 0, tour);
  if (P.disque === 'doigt') disque(ctx, P.mains[1][0], P.mains[1][1] - 6, 12, 0, tour);
}

// Frisbee seul (animation de rotation : une bande qui tourne)
function frisbee(ctx, w, h, p, { i, n }) {
  disque(ctx, w / 2, h / 2, w * 0.42, 0, i / n * 0.5);
}

// =====================================================================
//  TERRAIN DE PLAGE (vue de 3/4 au-dessus, dans l'esprit de Windjammers 2) :
//  cage grillagée, palmiers, public coloré, ligne centrale jaune, poteaux rembourrés.
//  p.terrain = { x0, x1, y0, y1, filet, zone5 } (mêmes valeurs que le jeu)
// =====================================================================

// Palmier : tronc courbé + palmes (vu un peu d'en haut)
function palmier(ctx, x, y, taille, penche, alea) {
  ctx.save(); ctx.translate(x, y);
  // tronc en anneaux
  const n = 9, hx = penche * taille, hy = -taille;
  for (let k = 0; k < n; k++) {
    const t = k / n, t2 = (k + 1) / n;
    const ax = hx * t * t, ay = hy * t, bx = hx * t2 * t2, by = hy * t2;
    ctx.beginPath(); ctx.moveTo(ax - 9 + t * 3, ay); ctx.lineTo(bx - 8 + t2 * 3, by); ctx.lineTo(bx + 8 - t2 * 3, by); ctx.lineTo(ax + 9 - t * 3, ay); ctx.closePath();
    remplir(ctx, k % 2 ? '#9a6a3a' : '#7d5230', 2);
  }
  // palmes
  ctx.translate(hx, hy);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + alea() * 0.4, L = taille * (0.55 + alea() * 0.25);
    ctx.save(); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(L * 0.5, -L * 0.22, L, L * 0.12);
    ctx.quadraticCurveTo(L * 0.5, L * 0.12, 0, 0);
    remplir(ctx, degrade(ctx, 0, 0, L, 0, [[0, '#2f9a3a'], [1, '#1d6b2a']]), 2);
    ctx.strokeStyle = 'rgba(200,255,150,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.quadraticCurveTo(L * 0.5, -L * 0.06, L * 0.95, L * 0.1); ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); remplir(ctx, '#6a4a2a', 2);   // noix de coco
  ctx.restore();
}

// Ombre de palme posée sur le sable
function ombrePalme(ctx, x, y, r, alea) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(70,45,10,0.16)';
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + alea() * 0.5, L = r * (0.7 + alea() * 0.3);
    ctx.save(); ctx.rotate(a); ctx.scale(1, 0.55);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.5, -L * 0.2, L, 0); ctx.quadraticCurveTo(L * 0.5, L * 0.2, 0, 0); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// Grillage en losanges dans un rectangle
function grillage(ctx, x, y, w, h, pas = 9, couleur = 'rgba(220,230,240,0.55)') {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = couleur; ctx.lineWidth = 1;
  for (let k = -h; k < w + h; k += pas) {
    ctx.beginPath(); ctx.moveTo(x + k, y); ctx.lineTo(x + k + h, y + h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h, y); ctx.stroke();
  }
  ctx.restore();
}

// Tube métallique (rambarde)
function tube(ctx, x0, y0, x1, y1, ep = 6) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = CONTOUR; ctx.lineWidth = ep + 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = '#b9c3cc'; ctx.lineWidth = ep; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0 - ep * 0.2); ctx.lineTo(x1, y1 - ep * 0.2); ctx.stroke();
}

// Poteau rembourré jaune (comme sur les murs de Windjammers 2)
function poteauJaune(ctx, x, y, h) {
  ctx.beginPath(); ctx.roundRect(x - 7, y, 14, h, 7);
  remplir(ctx, degrade(ctx, x - 7, 0, x + 7, 0, [[0, '#c89a10'], [0.4, '#ffe14a'], [1, '#b08008']]), 2);
}

function terrainFrisbee(ctx, w, h, p) {
  const T = p.terrain, alea = hasard(93);
  const hT = T.y1 - T.y0, z5a = T.y0 + hT * T.zone5[0], z5b = T.y0 + hT * T.zone5[1];
  // ---------- fond : plage autour de la cage ----------
  ctx.fillStyle = degrade(ctx, 0, 0, 0, h, [[0, '#f0d79a'], [1, '#e2c07a']]); ctx.fillRect(0, 0, w, h);
  // public coloré en haut (gradins sur le sable, serviettes, parasols)
  const peaux = ['#f0c8a0', '#d8a074', '#b07850', '#8a5636', '#ffd8b0', '#c48a5c'];
  const habits = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#ffffff', '#ff6f91'];
  const cheveux = ['#1a1410', '#6a4422', '#d8b040', '#a83020', '#2a2a2a', '#f0e0a0'];
  for (const [y, r] of [[58, 9], [82, 10.5], [108, 12]]) {
    for (let x = 8 + (r % 2) * 7; x < w; x += r * 2.5) {
      const xx = x + (alea() - 0.5) * 6, yy = y + (alea() - 0.5) * 4;
      if (alea() < 0.12) continue;
      ctx.fillStyle = habits[Math.floor(alea() * habits.length)];
      ctx.beginPath(); ctx.ellipse(xx, yy + r * 1.5, r * 1.15, r * 0.95, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(xx - r * 1.15, yy + r * 1.5, r * 2.3, r);
      if (alea() < 0.2) {   // bras levés
        ctx.strokeStyle = peaux[Math.floor(alea() * peaux.length)]; ctx.lineWidth = r * 0.45; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(xx - r * 0.9, yy + r); ctx.lineTo(xx - r * 1.4, yy - r * 1.2); ctx.moveTo(xx + r * 0.9, yy + r); ctx.lineTo(xx + r * 1.4, yy - r * 1.2); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(xx, yy, r * 0.72, 0, Math.PI * 2); ctx.fillStyle = peaux[Math.floor(alea() * peaux.length)]; ctx.fill();
      ctx.strokeStyle = CONTOUR; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(xx, yy - r * 0.15, r * 0.74, Math.PI * 1.05, Math.PI * 1.95); ctx.fillStyle = cheveux[Math.floor(alea() * cheveux.length)]; ctx.fill();
      if (alea() < 0.15) { ctx.fillStyle = '#111'; ctx.fillRect(xx - r * 0.55, yy - r * 0.15, r * 1.1, r * 0.28); }   // lunettes de soleil
    }
  }
  // ---------- mur du fond : rambarde + grillage ----------
  const haut = T.y0 - 38;
  ctx.fillStyle = 'rgba(30,40,55,0.35)'; ctx.fillRect(T.x0 - 30, haut, T.x1 - T.x0 + 60, 38);
  grillage(ctx, T.x0 - 30, haut, T.x1 - T.x0 + 60, 38);
  tube(ctx, T.x0 - 30, haut, T.x1 + 30, haut, 7);
  tube(ctx, T.x0 - 30, T.y0 - 2, T.x1 + 30, T.y0 - 2, 5);
  for (let x = T.x0 - 30; x <= T.x1 + 30; x += (T.x1 - T.x0 + 60) / 8) tube(ctx, x, haut, x, T.y0 - 2, 6);
  // ---------- sol de sable ----------
  ctx.fillStyle = degrade(ctx, 0, T.y0, 0, T.y1, [[0, '#f2d58e'], [1, '#e5bf72']]); ctx.fillRect(T.x0, T.y0, T.x1 - T.x0, hT);
  for (let k = 0; k < 1400; k++) {
    ctx.fillStyle = alea() < 0.5 ? 'rgba(160,120,60,0.16)' : 'rgba(255,248,220,0.3)';
    ctx.fillRect(T.x0 + alea() * (T.x1 - T.x0), T.y0 + alea() * hT, 2, 2);
  }
  // ombres des palmiers sur le sable
  for (const [x, y, r] of [[T.x0 + 260, T.y0 + 90, 70], [T.x1 - 230, T.y1 - 110, 85], [T.x0 + 120, T.y1 - 40, 55], [T.x1 - 90, T.y0 + 40, 60]]) ombrePalme(ctx, x, y, r, alea);
  // ombre portée du mur du fond
  ctx.fillStyle = 'rgba(80,50,10,0.15)'; ctx.fillRect(T.x0, T.y0, T.x1 - T.x0, 14);
  // ---------- lignes ----------
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ctx.strokeRect(T.x0 + 2, T.y0 + 2, T.x1 - T.x0 - 4, hT - 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2;
  for (const x of [T.x0 + (T.filet - T.x0) * 0.33, T.x1 - (T.x1 - T.filet) * 0.33]) { ctx.beginPath(); ctx.moveTo(x, T.y0); ctx.lineTo(x, T.y1); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(T.x0, (T.y0 + T.y1) / 2); ctx.lineTo(T.x1, (T.y0 + T.y1) / 2); ctx.stroke();
  // ligne centrale jaune (le « filet »)
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(T.filet + 3, T.y0); ctx.lineTo(T.filet + 3, T.y1); ctx.stroke();
  ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(T.filet, T.y0); ctx.lineTo(T.filet, T.y1); ctx.stroke();
  // ---------- buts : murs des deux bouts (3 points jaune, 5 points rouge au milieu) ----------
  for (const [x, sens] of [[T.x0, -1], [T.x1, 1]]) {
    const bx = sens < 0 ? x - 28 : x;
    for (const [ya, yb, c, pts] of [[T.y0, z5a, '#ffd84a', 3], [z5a, z5b, '#e6303a', 5], [z5b, T.y1, '#ffd84a', 3]]) {
      ctx.fillStyle = degrade(ctx, bx, 0, bx + 28, 0, [[0, teinte(c, sens < 0 ? -0.25 : 0.1)], [1, teinte(c, sens < 0 ? 0.1 : -0.25)]]);
      ctx.fillRect(bx, ya, 28, yb - ya);
      grillage(ctx, bx, ya, 28, yb - ya, 8, 'rgba(255,255,255,0.35)');
      ctx.strokeStyle = CONTOUR; ctx.lineWidth = 2; ctx.strokeRect(bx, ya, 28, yb - ya);
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = CONTOUR; ctx.lineWidth = 4; ctx.strokeText(String(pts), bx + 14, (ya + yb) / 2);
      ctx.fillStyle = '#ffffff'; ctx.fillText(String(pts), bx + 14, (ya + yb) / 2);
    }
    // poteaux jaunes rembourrés aux limites des zones
    for (const y of [T.y0 - 6, z5a - 14, z5b - 14, T.y1 - 20]) poteauJaune(ctx, bx + 14, y, 28);
  }
  // ---------- mur de devant : rambarde basse + grillage ----------
  ctx.fillStyle = 'rgba(30,40,55,0.35)'; ctx.fillRect(T.x0 - 30, T.y1 + 4, T.x1 - T.x0 + 60, 24);
  grillage(ctx, T.x0 - 30, T.y1 + 4, T.x1 - T.x0 + 60, 24);
  tube(ctx, T.x0 - 30, T.y1 + 4, T.x1 + 30, T.y1 + 4, 5);
  tube(ctx, T.x0 - 30, T.y1 + 28, T.x1 + 30, T.y1 + 28, 7);
  for (let x = T.x0 - 30; x <= T.x1 + 30; x += (T.x1 - T.x0 + 60) / 8) tube(ctx, x, T.y1 + 4, x, T.y1 + 28, 6);
  // poteaux du centre (petits piquets jaunes aux bouts de la ligne)
  poteauJaune(ctx, T.filet, T.y0 - 40, 40); poteauJaune(ctx, T.filet, T.y1 - 6, 36);
  // ---------- palmiers dans les coins (hors du terrain) ----------
  // (ceux du bas restent dans les coins pour ne pas cacher les buts)
  palmier(ctx, 12, h + 95, 80, 0.2, alea);
  palmier(ctx, w - 12, h + 95, 80, -0.2, alea);
  palmier(ctx, 18, 150, 90, 0.1, alea);
  palmier(ctx, w - 16, 150, 90, -0.1, alea);
}

export const FORMES_FRISBEE = { joueurFrisbee, frisbee, terrainFrisbee };
