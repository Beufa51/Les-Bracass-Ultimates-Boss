// =====================================================================
// DESSINS PROVISOIRES DE LIONEL (match de frisbee façon Windjammers) :
// le terrain de plage, les joueurs vus de 3/4 (tournés vers la DROITE,
// le jeu les retourne pour Lionel), le frisbee qui tourne et le trophée.
// =====================================================================
import { CONTOUR, teinte, hasard, remplir, degrade } from '../../core/dessins.js';

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

// Trophée doré (coupe à deux anses sur un socle)
function trophee(ctx, w, h) {
  const cx = w / 2;
  const or = (y0, y1) => degrade(ctx, cx - w * 0.3, y0, cx + w * 0.3, y1, [[0, '#fff3a8'], [0.35, '#ffd84a'], [0.7, '#c8961e'], [1, '#8a5a10']]);
  // anses
  ctx.lineWidth = w * 0.06; ctx.strokeStyle = '#1a1014';
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(cx + s * w * 0.3, h * 0.27, w * 0.14, h * 0.11, 0, s < 0 ? Math.PI * 0.5 : -Math.PI * 0.5, s < 0 ? Math.PI * 1.5 : Math.PI * 0.5); ctx.stroke();
  }
  ctx.lineWidth = w * 0.035; ctx.strokeStyle = '#e8b830';
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(cx + s * w * 0.3, h * 0.27, w * 0.14, h * 0.11, 0, s < 0 ? Math.PI * 0.5 : -Math.PI * 0.5, s < 0 ? Math.PI * 1.5 : Math.PI * 0.5); ctx.stroke();
  }
  // coupe
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.3, h * 0.1); ctx.lineTo(cx + w * 0.3, h * 0.1);
  ctx.quadraticCurveTo(cx + w * 0.3, h * 0.5, cx + w * 0.06, h * 0.56);
  ctx.lineTo(cx + w * 0.06, h * 0.7); ctx.lineTo(cx - w * 0.06, h * 0.7); ctx.lineTo(cx - w * 0.06, h * 0.56);
  ctx.quadraticCurveTo(cx - w * 0.3, h * 0.5, cx - w * 0.3, h * 0.1); ctx.closePath();
  remplir(ctx, or(0, h * 0.6), 3);
  ctx.beginPath(); ctx.ellipse(cx, h * 0.1, w * 0.3, h * 0.035, 0, 0, Math.PI * 2); remplir(ctx, '#8a5a10', 2);
  // étoile
  ctx.fillStyle = '#fffbe0'; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? w * 0.04 : w * 0.1; ctx.lineTo(cx + Math.cos(a) * r, h * 0.3 + Math.sin(a) * r); }
  ctx.closePath(); ctx.fill();
  // socle
  ctx.beginPath(); ctx.roundRect(cx - w * 0.2, h * 0.7, w * 0.4, h * 0.08, 4); remplir(ctx, or(h * 0.7, h * 0.78), 2.5);
  ctx.beginPath(); ctx.roundRect(cx - w * 0.28, h * 0.78, w * 0.56, h * 0.18, 6); remplir(ctx, degrade(ctx, 0, h * 0.78, 0, h * 0.96, [[0, '#5a2a1e'], [1, '#2a120c']]), 3);
  ctx.beginPath(); ctx.roundRect(cx - w * 0.18, h * 0.82, w * 0.36, h * 0.09, 3); remplir(ctx, or(h * 0.82, h * 0.91), 1.5);
  // reflet
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.ellipse(cx - w * 0.17, h * 0.24, w * 0.04, h * 0.1, -0.2, 0, Math.PI * 2); ctx.fill();
}

// =====================================================================
//  SURPRISES DU TERRAIN : mouette (4 battements d'ailes), château de sable, ballon de plage (qui roule)
//  Dessinées en DOUBLE taille (le jeu les affiche à moitié) avec des ombres en aplats et des reflets,
//  pour aller avec les illustrations manga des joueurs.
// =====================================================================
// remplit un chemin, ajoute une ombre en aplat (le chemin "ombre" est découpé dedans), puis l'encre
function encrer(ctx, chemin, couleur, ombre, dessinOmbre, epaisseur = 4) {
  ctx.save();
  chemin(); ctx.fillStyle = couleur; ctx.fill();
  if (dessinOmbre) { chemin(); ctx.clip(); dessinOmbre(); ctx.fillStyle = ombre; ctx.fill(); }
  ctx.restore();
  chemin(); ctx.strokeStyle = CONTOUR; ctx.lineWidth = epaisseur; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
}

// Mouette vue de profil, tournée vers la droite (128 x 96) : 4 positions d'ailes
function mouette(ctx, w, h, p, { i }) {
  const cx = w * 0.46, cy = h * 0.56;
  const ailes = [-0.95, -0.35, 0.35, -0.2][i % 4];   // haut, milieu, bas, remonte
  // une aile : attachée au dos, la pointe monte ou descend
  const aile = (dx, fonce) => {
    const px = cx - 6 + dx, bout = [cx - 38 + dx, cy + ailes * 46];
    const chemin = () => { ctx.beginPath(); ctx.moveTo(px + 16, cy - 4);
      ctx.quadraticCurveTo(px - 4, cy + ailes * 30 - 10, bout[0], bout[1]);
      ctx.quadraticCurveTo(px + 2, cy + ailes * 14 + 6, px + 22, cy + 4); ctx.closePath(); };
    encrer(ctx, chemin, fonce ? '#c9d2dc' : '#f6f8fb', '#aeb9c6',
      () => { ctx.beginPath(); ctx.ellipse(px + 6, cy + (ailes > 0 ? -6 : 8), 34, 10, ailes * 0.6, 0, Math.PI * 2); }, 3.5);
    // bout des ailes noir
    ctx.save(); chemin(); ctx.clip();
    ctx.beginPath(); ctx.arc(bout[0], bout[1], 14, 0, Math.PI * 2); ctx.fillStyle = '#2b2f36'; ctx.fill(); ctx.restore();
    chemin(); ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3.5; ctx.stroke();
  };
  aile(10, true);   // aile du fond (plus sombre)
  // queue
  encrer(ctx, () => { ctx.beginPath(); ctx.moveTo(cx - 20, cy - 4); ctx.lineTo(cx - 44, cy - 10); ctx.lineTo(cx - 40, cy + 2); ctx.lineTo(cx - 44, cy + 10); ctx.lineTo(cx - 18, cy + 8); ctx.closePath(); },
    '#eef1f5', '#b8c2cd', () => { ctx.beginPath(); ctx.rect(cx - 50, cy + 2, 40, 12); });
  // corps : ventre blanc, dos gris
  encrer(ctx, () => { ctx.beginPath(); ctx.ellipse(cx, cy + 2, 26, 13, -0.08, 0, Math.PI * 2); },
    '#ffffff', '#c3ccd6', () => { ctx.beginPath(); ctx.ellipse(cx - 2, cy + 14, 30, 8, 0, 0, Math.PI * 2); });
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy + 2, 26, 13, -0.08, 0, Math.PI * 2); ctx.clip();
  ctx.beginPath(); ctx.ellipse(cx - 4, cy - 10, 26, 8, -0.08, 0, Math.PI * 2); ctx.fillStyle = '#b7c3cf'; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.ellipse(cx, cy + 2, 26, 13, -0.08, 0, Math.PI * 2); ctx.strokeStyle = CONTOUR; ctx.lineWidth = 4; ctx.stroke();
  // tête
  const tx = cx + 26, ty = cy - 10;
  encrer(ctx, () => { ctx.beginPath(); ctx.arc(tx, ty, 12, 0, Math.PI * 2); }, '#ffffff', '#c9d2dc',
    () => { ctx.beginPath(); ctx.arc(tx - 4, ty + 7, 11, 0, Math.PI * 2); });
  // bec jaune avec la tache rouge
  encrer(ctx, () => { ctx.beginPath(); ctx.moveTo(tx + 9, ty - 3); ctx.lineTo(tx + 30, ty + 1); ctx.quadraticCurveTo(tx + 31, ty + 5, tx + 26, ty + 5); ctx.lineTo(tx + 9, ty + 5); ctx.closePath(); },
    '#ffc93a', '#e08a1a', () => { ctx.beginPath(); ctx.rect(tx, ty + 2, 40, 6); }, 3);
  ctx.fillStyle = '#e6303a'; ctx.beginPath(); ctx.arc(tx + 24, ty + 4, 2.2, 0, Math.PI * 2); ctx.fill();
  // œil vif et sourcil (elle a l'air fière d'elle)
  ctx.fillStyle = CONTOUR; ctx.beginPath(); ctx.arc(tx + 3, ty - 3, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(tx + 4, ty - 4, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = CONTOUR; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tx - 3, ty - 9); ctx.lineTo(tx + 8, ty - 7); ctx.stroke();
  // pattes repliées
  ctx.strokeStyle = '#e08a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 6, cy + 14); ctx.lineTo(cx - 16, cy + 20); ctx.stroke();
  aile(0, false);   // aile de devant
}

// Château de sable vu de 3/4 (140 x 128) : base arrondie, trois tours, coquillages, drapeau
function chateau(ctx, w, h) {
  const SABLE = '#efcf8a', OMBRE = '#c79a55', CLAIR = '#fbe6b4';
  const alea = hasard(11);
  // une tour cylindrique vue de 3/4 : face éclairée à gauche, ombre à droite, créneaux en haut
  const tour = (x, haut, l, bas) => {
    const ry = l * 0.22;
    encrer(ctx, () => { ctx.beginPath(); ctx.moveTo(x - l / 2, haut); ctx.lineTo(x - l / 2, bas); ctx.ellipse(x, bas, l / 2, ry, 0, Math.PI, 0, true); ctx.lineTo(x + l / 2, haut); ctx.closePath(); },
      SABLE, OMBRE, () => { ctx.beginPath(); ctx.rect(x + l * 0.12, haut - 10, l, bas - haut + 30); });
    // créneaux
    for (let k = 0; k < 4; k++) {
      const cxk = x - l / 2 + l * (k + 0.5) / 4;
      encrer(ctx, () => { ctx.beginPath(); ctx.roundRect(cxk - l * 0.09, haut - 11, l * 0.18, 13, 2); }, k >= 2 ? OMBRE : SABLE, null, null, 3);
    }
    // dessus de la tour
    encrer(ctx, () => { ctx.beginPath(); ctx.ellipse(x, haut, l / 2, ry, 0, 0, Math.PI * 2); }, CLAIR, null, null, 3);
    // traces de seau (les anneaux du moule)
    ctx.strokeStyle = 'rgba(120,80,30,0.45)'; ctx.lineWidth = 2;
    for (const f of [0.35, 0.7]) { ctx.beginPath(); ctx.ellipse(x, haut + (bas - haut) * f, l / 2 - 1, ry, 0, 0.15, Math.PI - 0.15); ctx.stroke(); }
  };
  // tas de sable à la base
  encrer(ctx, () => { ctx.beginPath(); ctx.ellipse(w / 2, h - 16, w * 0.47, 14, 0, 0, Math.PI * 2); }, '#e3bf78', '#c09050',
    () => { ctx.beginPath(); ctx.ellipse(w / 2 + 10, h - 6, w * 0.5, 10, 0, 0, Math.PI * 2); });
  // rempart
  encrer(ctx, () => { ctx.beginPath(); ctx.moveTo(18, 62); ctx.lineTo(18, h - 22); ctx.quadraticCurveTo(w / 2, h - 6, w - 18, h - 22); ctx.lineTo(w - 18, 62); ctx.quadraticCurveTo(w / 2, 74, 18, 62); ctx.closePath(); },
    SABLE, OMBRE, () => { ctx.beginPath(); ctx.rect(w * 0.62, 50, w, h); });
  tour(30, 48, 30, h - 24);
  tour(w - 30, 48, 30, h - 24);
  tour(w / 2, 22, 38, h - 34);
  // porte en arche
  encrer(ctx, () => { ctx.beginPath(); ctx.moveTo(w / 2 - 11, h - 22); ctx.lineTo(w / 2 - 11, h - 42); ctx.arc(w / 2, h - 42, 11, Math.PI, 0); ctx.lineTo(w / 2 + 11, h - 22); ctx.closePath(); }, '#6b4520', null, null, 3);
  // coquillages (un rose, un blanc) et une étoile de mer
  const coquille = (x, y, c) => {
    encrer(ctx, () => { ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.arc(x, y, 8, Math.PI * 0.85, Math.PI * 0.15, false); ctx.closePath(); }, c, null, null, 2.5);
    ctx.strokeStyle = CONTOUR; ctx.lineWidth = 1.5;
    for (const a of [-0.9, -0.3, 0.3, 0.9]) { ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x + Math.sin(a) * 7, y - 6 + Math.abs(a) * 3); ctx.stroke(); }
  };
  coquille(w * 0.3, h - 52, '#ffb3c1');
  coquille(w * 0.72, h - 46, '#fff6e6');
  ctx.save(); ctx.translate(w * 0.86, h - 16); ctx.beginPath();
  for (let k = 0; k < 10; k++) { const r = k % 2 ? 4 : 10, a = -Math.PI / 2 + k * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.6); }
  ctx.closePath(); remplir(ctx, '#ff7a3a', 2.5); ctx.restore();
  // drapeau violet de Lionel au sommet (bâton de glace en guise de mât)
  ctx.strokeStyle = CONTOUR; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(w / 2, 14); ctx.lineTo(w / 2, -2 + 4); ctx.stroke();
  ctx.strokeStyle = '#e8d2a0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(w / 2, 14); ctx.lineTo(w / 2, 3); ctx.stroke();
  encrer(ctx, () => { ctx.beginPath(); ctx.moveTo(w / 2 + 1, 2); ctx.quadraticCurveTo(w / 2 + 14, 0, w / 2 + 24, 7); ctx.quadraticCurveTo(w / 2 + 12, 9, w / 2 + 1, 12); ctx.closePath(); },
    '#9b4dff', '#6a2bc0', () => { ctx.beginPath(); ctx.rect(w / 2, 8, 30, 10); }, 2.5);
  // reflets de lumière (côté soleil) et grains de sable
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const [x, y0, y1] of [[w / 2 - 14, 30, 60], [21, 54, 74], [w - 39, 54, 74]]) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
  for (let k = 0; k < 140; k++) {
    ctx.fillStyle = alea() < 0.5 ? 'rgba(120,80,30,0.35)' : 'rgba(255,255,255,0.45)';
    ctx.fillRect(12 + alea() * (w - 24), 16 + alea() * (h - 30), 2, 2);
  }
}

// Ballon de plage (80 x 80) : 6 quartiers qui tournent, l'ombre et le reflet restent fixes (la lumière ne bouge pas)
function ballon(ctx, w, h, p, { i, n }) {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 4, tour = (i / n) * Math.PI * 2;   // n images = un tour complet
  const couleurs = ['#e6303a', '#ffffff', '#2a6fd0', '#ffffff', '#ffd84a', '#ffffff'];
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  // chaque quartier est compris entre deux méridiens ; un méridien de longitude a se voit
  // comme une demi-ellipse de largeur sin(a) ; seule la moitié tournée vers nous (-90° à 90°) est visible
  const meridien = (a, sens) => { for (let k = 0; k <= 16; k++) { const t = -Math.PI / 2 + Math.PI * (sens > 0 ? k : 16 - k) / 16;
    ctx.lineTo(cx + Math.sin(a) * Math.cos(t) * r, cy + Math.sin(t) * r); } };
  for (let k = 0; k < 6; k++) {
    let milieu = tour + (k + 0.5) * Math.PI / 3;
    milieu = Math.atan2(Math.sin(milieu), Math.cos(milieu));   // ramené entre -180° et 180°
    const a0 = Math.max(-Math.PI / 2, milieu - Math.PI / 6), a1 = Math.min(Math.PI / 2, milieu + Math.PI / 6);
    if (a0 >= a1) continue;   // quartier caché derrière
    ctx.beginPath(); meridien(a0, 1); meridien(a1, -1); ctx.closePath();
    ctx.fillStyle = couleurs[k]; ctx.fill();
    ctx.strokeStyle = 'rgba(26,16,20,0.55)'; ctx.lineWidth = 2; ctx.stroke();
  }
  // ombre en aplat (bas-droite) et reflet (haut-gauche)
  ctx.beginPath(); ctx.arc(cx + r * 0.45, cy + r * 0.5, r * 1.05, 0, Math.PI * 2); ctx.arc(cx - r * 0.1, cy - r * 0.05, r * 0.98, 0, Math.PI * 2, true);
  ctx.fillStyle = 'rgba(40,20,60,0.32)'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.ellipse(cx - r * 0.38, cy - r * 0.45, r * 0.24, r * 0.12, -0.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - r * 0.12, cy - r * 0.66, r * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // pastille du haut et encre
  ctx.beginPath(); ctx.ellipse(cx, cy - r + 3, r * 0.18, r * 0.08, 0, 0, Math.PI * 2); remplir(ctx, '#ffffff', 2);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = CONTOUR; ctx.lineWidth = 4; ctx.stroke();
}

export const FORMES_LIONEL = { joueurFrisbee, frisbee, terrainFrisbee, trophee, mouette, chateau, ballon };
