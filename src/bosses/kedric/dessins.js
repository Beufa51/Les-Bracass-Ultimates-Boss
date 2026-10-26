// =====================================================================
// DESSINS PROVISOIRES DE KÉDRIC (course de football américain façon Eyeshield 21) :
// ton coureur vu de DOS (n°21, casque rouge), les défenseurs de Kédric vus de FACE
// (maillot vert, casque blanc), Kédric le coach showman et le trophée.
// Remplacés par les vraies illustrations dès qu'elles sont dans le manifeste.
// =====================================================================
import { CONTOUR, teinte, remplir, degrade } from '../../core/dessins.js';

// ---------- petits outils ----------
function trait(ctx, pts, largeur, couleur) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [l, c] of [[largeur + 3, CONTOUR], [largeur, couleur]]) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y);
    ctx.strokeStyle = c; ctx.lineWidth = l; ctx.stroke();
  }
}
function rond(ctx, x, y, rx, ry, couleur, ep = 2) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); remplir(ctx, couleur, ep);
}
function etoile(ctx, x, y, r, couleur) {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); remplir(ctx, couleur, 1.5);
}
// Ballon de football américain (ovale marron, coutures blanches)
function ballonUS(ctx, x, y, r, angle = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.62, 0, 0, Math.PI * 2);
  remplir(ctx, degrade(ctx, 0, -r * 0.6, 0, r * 0.6, [[0, '#c8743a'], [1, '#6a3414']]), 2);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.1);
  ctx.beginPath(); ctx.moveTo(-r * 0.4, 0); ctx.lineTo(r * 0.4, 0); ctx.stroke();
  for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * r * 0.16, -r * 0.13); ctx.lineTo(k * r * 0.16, r * 0.13); ctx.stroke(); }
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * r * 0.72, 0, r * 0.3, s < 0 ? -0.9 : Math.PI - 0.9, s < 0 ? 0.9 : Math.PI + 0.9); ctx.stroke(); }
  ctx.restore();
}

// =====================================================================
//  TON COUREUR, VU DE DOS (unités : 1 = h / 150 ; pieds en (0, 0), y vers le haut = négatif)
//  poses : course (images animées), saut, rotation, plaque, victoire
// =====================================================================
function coureurDos(ctx, w, h, p, { i, n }) {
  const u = h / 150;
  ctx.save(); ctx.translate(w / 2, h - 2 * u); ctx.scale(u, u);
  const maillot = p.maillot || '#c8202c', pantalon = '#f4f4f4', casque = p.casque || '#d01e2a';
  const a = (i / Math.max(1, n)) * Math.PI * 2, s = n > 1 ? Math.sin(a) : 0;
  let P;
  if (p.pose === 'saut') P = { hanches: -66, epaules: -112, tete: -130, pieds: [[-14, -26], [14, -34]], genoux: [[-16, -46], [15, -50]], bras: [[-34, -92], [30, -98]], penche: 0 };
  else if (p.pose === 'rotation') P = { hanches: -42, epaules: -80, tete: -96, pieds: [[-26, 0], [22, 0]], genoux: [[-26, -22], [24, -20]], bras: [[-44, -70], [30, -66]], penche: 16 };
  else if (p.pose === 'plaque') P = { hanches: -54, epaules: -98, tete: -112, pieds: [[-30, -6], [30, -12]], genoux: [[-24, -28], [26, -32]], bras: [[-46, -132], [44, -128]], penche: -10 };
  else if (p.pose === 'victoire') P = { hanches: -62, epaules: -108, tete: -126, pieds: [[-18, 0], [18, 0]], genoux: [[-17, -32], [17, -32]], bras: [[-34, -150], [36, -156]], penche: 0, ballonHaut: true };
  else {
    const k1 = Math.max(0, s), k2 = Math.max(0, -s);
    P = { hanches: -62 + Math.abs(s) * 3, epaules: -108 + Math.abs(s) * 3, tete: -126 + Math.abs(s) * 3,
      pieds: [[-11, -k1 * 34], [11, -k2 * 34]], genoux: [[-12, -32 - k1 * 8], [12, -32 - k2 * 8]],
      bras: [[-34 + s * 4, -78 + s * 14], [26, -92]], penche: s * 3 };
  }
  const pen = P.penche, hy = P.hanches, ey = P.epaules;

  // traînée de vitesse (rotation)
  if (p.pose === 'rotation') {
    ctx.save(); ctx.globalAlpha = 0.6;
    for (let k = 0; k < 3; k++) { ctx.strokeStyle = k % 2 ? '#ffffff' : '#9fe0ff'; ctx.lineWidth = 4 - k;
      ctx.beginPath(); ctx.ellipse(0, -60 + k * 8, 58 - k * 6, 18, 0, 0.2, Math.PI * 1.6); ctx.stroke(); }
    ctx.restore();
  }
  // jambes : pantalon blanc jusqu'au genou, chaussette rouge, crampon noir (semelle visible si le pied est levé)
  for (const k of [0, 1]) {
    const hx = (k ? 10 : -10) + pen * 0.3, [gx, gy] = P.genoux[k], [px, py] = P.pieds[k];
    trait(ctx, [[hx, hy], [gx, gy]], 15, pantalon);
    trait(ctx, [[gx, gy + 2], [px, py - 7]], 10, maillot);
    rond(ctx, px, py - 4, 9, py < -10 ? 7 : 5, '#1c1c22', 2);
    if (py < -10) { ctx.fillStyle = '#9aa0aa'; for (const dx of [-4, 0, 4]) ctx.fillRect(px + dx - 1, py - 6, 2, 4); }
  }
  // fesses / pantalon
  ctx.beginPath(); ctx.moveTo(-17 + pen * 0.3, hy - 8); ctx.lineTo(17 + pen * 0.3, hy - 8); ctx.lineTo(19 + pen * 0.3, hy + 8); ctx.lineTo(-19 + pen * 0.3, hy + 8); ctx.closePath();
  remplir(ctx, pantalon, 2);
  ctx.strokeStyle = maillot; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18 + pen * 0.3, hy - 2); ctx.lineTo(18 + pen * 0.3, hy - 2); ctx.stroke();
  // bras gauche (balance)
  const epG = [-26 + pen, ey + 6], epD = [26 + pen, ey + 6];
  const [mgx, mgy] = P.bras[0];
  trait(ctx, [epG, [(epG[0] + mgx) / 2 - 8, (epG[1] + mgy) / 2 + 4], [mgx, mgy]], 11, maillot);
  rond(ctx, mgx, mgy, 6, 6, '#e8b48a', 2);
  // dos : maillot rouge, épaulières larges
  ctx.beginPath();
  ctx.moveTo(-15 + pen * 0.4, hy - 6); ctx.lineTo(-24 + pen, ey + 14); ctx.quadraticCurveTo(-34 + pen, ey + 2, -24 + pen, ey - 4);
  ctx.lineTo(24 + pen, ey - 4); ctx.quadraticCurveTo(34 + pen, ey + 2, 24 + pen, ey + 14); ctx.lineTo(15 + pen * 0.4, hy - 6); ctx.closePath();
  remplir(ctx, degrade(ctx, -30, 0, 30, 0, [[0, teinte(maillot, -0.25)], [0.45, teinte(maillot, 0.12)], [1, teinte(maillot, -0.35)]]), 2.5);
  // bandes blanches sur les épaules
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 18 + pen, ey - 3); ctx.lineTo(sx * 28 + pen, ey + 8); ctx.stroke(); }
  // numéro 21 dans le dos
  ctx.font = 'bold 26px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 4; ctx.strokeStyle = CONTOUR; ctx.strokeText(p.numero || '21', pen * 0.7, (ey + hy) / 2 + 2);
  ctx.fillStyle = '#ffffff'; ctx.fillText(p.numero || '21', pen * 0.7, (ey + hy) / 2 + 2);
  // bras droit qui serre le ballon (ou le lève pour la victoire)
  const [mdx, mdy] = P.bras[1];
  if (P.ballonHaut) {
    trait(ctx, [epD, [mdx - 4, (epD[1] + mdy) / 2], [mdx, mdy]], 11, maillot);
    ballonUS(ctx, mdx + 2, mdy - 10, 14, -0.6);
    rond(ctx, mdx, mdy, 6, 6, '#e8b48a', 2);
  } else {
    ballonUS(ctx, 30 + pen, ey + 24, 13, 0.9);
    trait(ctx, [epD, [36 + pen, ey + 22], [mdx + pen, mdy + 14]], 11, maillot);
    rond(ctx, mdx + pen, mdy + 14, 6, 6, '#e8b48a', 2);
  }
  // nuque + casque vu de dos
  const tx = pen * 1.1, ty = P.tete;
  ctx.beginPath(); ctx.roundRect(tx - 7, ty + 10, 14, 10, 3); remplir(ctx, '#d89a70', 2);
  // grille du casque qui dépasse sur les côtés
  ctx.strokeStyle = '#c8ccd4'; ctx.lineWidth = 3;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(tx + sx * 16, ty + 2); ctx.lineTo(tx + sx * 19, ty + 12); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(tx, ty, 18, 19, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(tx - 6, ty - 8, 2, tx, ty, 22); g.addColorStop(0, teinte(casque, 0.4)); g.addColorStop(1, teinte(casque, -0.3));
  remplir(ctx, g, 2.5);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(tx - 3, ty - 19, 6, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(tx - 9, ty - 9, 4, 7, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// =====================================================================
//  DÉFENSEUR DE KÉDRIC, VU DE FACE (unités : 1 = h / 150)
//  poses : course (animée), garde, bas (accroupi avant de plonger), plonge, bras (corde à linge), rate (au tapis)
// =====================================================================
function defenseur(ctx, w, h, p, { i, n }) {
  const u = h / 150;
  ctx.save(); ctx.translate(w / 2, h - 2 * u); ctx.scale(u, u);
  const maillot = p.maillot || '#1d8a4a', chiffre = p.chiffre || '#ffd84a', casque = p.casque || '#f4f4f4', bande = p.bande || '#1d8a4a';
  const a = (i / Math.max(1, n)) * Math.PI * 2, s = n > 1 ? Math.sin(a) : 0;
  const pose = p.pose || 'garde';

  if (pose === 'plonge') {
    // plongeon vers toi : le casque devant, les bras grands ouverts, le corps caché derrière
    ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
    for (let k = 0; k < 8; k++) { const ang = -Math.PI + k * Math.PI / 7; ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 60, -40 + Math.sin(ang) * 30); ctx.lineTo(Math.cos(ang) * 90, -40 + Math.sin(ang) * 46); ctx.stroke(); }
    ctx.restore();
    rond(ctx, 0, -6, 44, 8, 'rgba(0,0,0,0.25)', 0);
    for (const sx of [-1, 1]) {
      trait(ctx, [[sx * 22, -44], [sx * 46, -34], [sx * 66, -24]], 12, maillot);
      rond(ctx, sx * 68, -22, 8, 7, '#d89a70', 2);
    }
    ctx.beginPath(); ctx.ellipse(0, -46, 32, 18, 0, 0, Math.PI * 2); remplir(ctx, maillot, 2.5);
    ctx.fillStyle = chiffre; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.numero || '55', 0, -40);
    casqueFace(ctx, 0, -46, 0.95, casque, bande, p, 'furieux');
    ctx.restore(); return;
  }
  if (pose === 'rate') {
    // assis par terre, sonné
    for (const sx of [-1, 1]) { trait(ctx, [[sx * 12, -24], [sx * 34, -14], [sx * 40, -4]], 14, '#f4f4f4'); rond(ctx, sx * 42, -4, 9, 6, '#1c1c22', 2); }
    for (const sx of [-1, 1]) { trait(ctx, [[sx * 24, -64], [sx * 40, -44], [sx * 34, -26]], 11, maillot); rond(ctx, sx * 34, -24, 6, 6, '#d89a70', 2); }
    ctx.beginPath(); ctx.roundRect(-26, -76, 52, 52, 14); remplir(ctx, maillot, 2.5);
    ctx.fillStyle = chiffre; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.numero || '55', 0, -50);
    casqueFace(ctx, 6, -94, 1, casque, bande, p, 'sonne', 0.35);
    for (let k = 0; k < 3; k++) etoile(ctx, -26 + k * 26, -124 - (k % 2) * 8, 7, '#ffe14a');
    ctx.restore(); return;
  }
  const P = {
    course: { hanches: -64 + Math.abs(s) * 3, epaules: -104, tete: -124, pieds: [[-14, -Math.max(0, s) * 16], [14, -Math.max(0, -s) * 16]], genoux: [[-14, -34 - Math.max(0, s) * 14], [14, -34 - Math.max(0, -s) * 14]],
      mains: [[-34, -72 - s * 14], [34, -72 + s * 14]], visage: 'furieux' },
    garde: { hanches: -52 + s * 2, epaules: -92 + s * 2, tete: -110 + s * 2, pieds: [[-28, 0], [28, 0]], genoux: [[-30, -28], [30, -28]],
      mains: [[-50, -66], [50, -66]], visage: 'furieux' },
    bas: { hanches: -40, epaules: -72, tete: -86, pieds: [[-30, 0], [30, 0]], genoux: [[-34, -20], [34, -20]],
      mains: [[-36, -18], [36, -18]], visage: 'furieux' },
    bras: { hanches: -70, epaules: -112, tete: -132, pieds: [[-18, -8], [18, -8]], genoux: [[-18, -40], [18, -40]],
      mains: [[-72, -128], [72, -128]], visage: 'cri' },
  }[pose] || null;
  const Q = P || { hanches: -52, epaules: -92, tete: -110, pieds: [[-28, 0], [28, 0]], genoux: [[-30, -28], [30, -28]], mains: [[-50, -66], [50, -66]] };
  // jambes
  for (const k of [0, 1]) {
    const hx = k ? 12 : -12, [gx, gy] = Q.genoux[k], [px, py] = Q.pieds[k];
    trait(ctx, [[hx, Q.hanches], [gx, gy]], 15, '#f4f4f4');
    trait(ctx, [[gx, gy + 2], [px, py - 6]], 10, maillot);
    rond(ctx, px, py - 3, 10, 5, '#1c1c22', 2);
  }
  ctx.beginPath(); ctx.roundRect(-20, Q.hanches - 8, 40, 16, 4); remplir(ctx, '#f4f4f4', 2);
  // torse avec épaulières
  const ey = Q.epaules, hy = Q.hanches;
  ctx.beginPath();
  ctx.moveTo(-16, hy - 4); ctx.lineTo(-26, ey + 14); ctx.quadraticCurveTo(-38, ey + 2, -26, ey - 6);
  ctx.lineTo(26, ey - 6); ctx.quadraticCurveTo(38, ey + 2, 26, ey + 14); ctx.lineTo(16, hy - 4); ctx.closePath();
  remplir(ctx, degrade(ctx, -30, 0, 30, 0, [[0, teinte(maillot, -0.3)], [0.5, teinte(maillot, 0.15)], [1, teinte(maillot, -0.3)]]), 2.5);
  ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 4; ctx.strokeStyle = CONTOUR; ctx.strokeText(p.numero || '55', 0, (ey + hy) / 2 + 2);
  ctx.fillStyle = chiffre; ctx.fillText(p.numero || '55', 0, (ey + hy) / 2 + 2);
  if (p.etoile) etoile(ctx, 0, ey + 6, 7, '#ffffff');
  // bras
  for (const k of [0, 1]) {
    const sx = k ? 1 : -1, [mx, my] = Q.mains[k];
    trait(ctx, [[sx * 28, ey + 4], [(sx * 28 + mx) / 2 + sx * 6, (ey + my) / 2 + 6], [mx, my]], 11, maillot);
    rond(ctx, mx, my, 7, 7, '#d89a70', 2);
  }
  casqueFace(ctx, 0, Q.tete, 1, casque, bande, p, Q.visage || 'furieux');
  ctx.restore();
}

// Casque vu de face avec sa grille ; visage : 'furieux' | 'cri' | 'sonne'
function casqueFace(ctx, x, y, k, casque, bande, p, visage, angle = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(angle);
  ctx.beginPath(); ctx.ellipse(0, 0, 19, 20, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(-6, -8, 2, 0, 0, 24); g.addColorStop(0, '#ffffff'); g.addColorStop(1, teinte(casque === '#f4f4f4' ? '#d8dce4' : casque, -0.1));
  remplir(ctx, casque === '#f4f4f4' ? g : casque, 2.5);
  ctx.fillStyle = bande; ctx.fillRect(-3, -20, 6, 12);
  if (p.etoile) etoile(ctx, 0, -12, 5, '#ffd84a');
  // visage (dans l'ouverture du casque)
  ctx.beginPath(); ctx.roundRect(-12, -6, 24, 20, 6); remplir(ctx, '#d89a70', 2);
  ctx.strokeStyle = CONTOUR; ctx.lineWidth = 2.2; ctx.fillStyle = CONTOUR;
  if (visage === 'sonne') {
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 5, 0, 3, 0, Math.PI * 1.7); ctx.stroke(); }
  } else if (p.lunettes) {
    ctx.beginPath(); ctx.roundRect(-11, -3, 22, 7, 3); ctx.fillStyle = '#111'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-8, -2, 4, 2);
  } else {
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 9, -4); ctx.lineTo(sx * 2, -1); ctx.stroke(); ctx.beginPath(); ctx.arc(sx * 5, 1, 1.8, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.beginPath();
  if (visage === 'cri') { ctx.ellipse(0, 8, 4, 4, 0, 0, Math.PI * 2); ctx.fillStyle = '#5a1010'; ctx.fill(); }
  else if (p.lunettes) { ctx.moveTo(-6, 7); ctx.quadraticCurveTo(0, 12, 6, 7); ctx.stroke(); }
  else { ctx.moveTo(-5, 9); ctx.lineTo(5, 8); ctx.stroke(); }
  // grille
  ctx.strokeStyle = '#9aa0aa'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-16, 4); ctx.lineTo(16, 4); ctx.moveTo(-15, 11); ctx.lineTo(15, 11); ctx.moveTo(0, 4); ctx.lineTo(0, 15); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-9, -10, 4, 6, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// =====================================================================
//  KÉDRIC, LE COACH SHOWMAN (de face ; unités : 1 = h / 200)
//  Banane gominée, lunettes noires, micro-casque, veste verte à liseré doré, chaîne en or.
//  poses : portrait (te pointe du doigt), buste (images : 0 sourire, 1 il crie), danse (animée), defaite (à genoux)
// =====================================================================
function kedric(ctx, w, h, p, { i, n }) {
  const buste = p.pose === 'buste';
  const u = buste ? h / 72 : h / 200;
  ctx.save();
  if (buste) { ctx.translate(w / 2, h * 2.85); ctx.scale(u, u); }
  else { ctx.translate(w / 2, h - 2 * u); ctx.scale(u, u); }
  const veste = '#1d8a4a', or = '#ffd84a', peau = '#d8a070';
  const crie = buste ? i === 1 : p.pose === 'danse' || p.pose === 'portrait';
  const def = p.pose === 'defaite';
  const s = p.pose === 'danse' && n > 1 ? (i % 2 ? 1 : -1) : 0;
  // jambes (pantalon blanc, baskets dorées)
  const hy = def ? -52 : -86, ey = def ? -110 : -150, ty = def ? -126 : -172;
  if (!buste) {
    if (def) {
      for (const sx of [-1, 1]) { trait(ctx, [[sx * 12, hy], [sx * 22, -16], [sx * 40, -10]], 15, '#f0f0f0'); rond(ctx, sx * 46, -8, 11, 7, or, 2); }
    } else {
      for (const sx of [-1, 1]) {
        const lev = s === sx ? 18 : 0;
        trait(ctx, [[sx * 12, hy], [sx * 18 + s * 6, -44 - lev], [sx * 20, -8 - lev * 0.6]], 15, '#f0f0f0');
        rond(ctx, sx * 22, -6 - lev * 0.6, 13, 7, or, 2);
      }
    }
    ctx.beginPath(); ctx.roundRect(-24, hy - 10, 48, 18, 5); remplir(ctx, '#f0f0f0', 2);
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-24, hy - 10, 48, 5); ctx.fillStyle = or; ctx.fillRect(-5, hy - 10, 10, 5);
  }
  // bras du fond selon la pose
  const mainsDe = {
    portrait: [[-58, ty + 22], [70, ey + 18]],        // gauche : micro près de la bouche ; droite : te pointe
    buste: [[-40, ey + 64], [40, ey + 64]],
    danse: s < 0 ? [[-64, ey - 60], [36, hy - 6]] : [[-36, hy - 6], [64, ey - 60]],
    defaite: [[-40, -12], [40, -12]],
  }[p.pose] || [[-40, hy], [40, hy]];
  // veste
  ctx.beginPath();
  ctx.moveTo(-26, hy + 2); ctx.lineTo(-34, ey + 18); ctx.quadraticCurveTo(-40, ey, -24, ey - 6);
  ctx.lineTo(24, ey - 6); ctx.quadraticCurveTo(40, ey, 34, ey + 18); ctx.lineTo(26, hy + 2); ctx.closePath();
  remplir(ctx, degrade(ctx, -36, 0, 36, 0, [[0, teinte(veste, -0.35)], [0.5, teinte(veste, 0.15)], [1, teinte(veste, -0.35)]]), 2.5);
  // t-shirt noir + liseré doré + chaîne en or + K
  ctx.beginPath(); ctx.moveTo(-10, ey - 4); ctx.lineTo(10, ey - 4); ctx.lineTo(6, hy); ctx.lineTo(-6, hy); ctx.closePath(); remplir(ctx, '#1c1c22', 2);
  ctx.strokeStyle = or; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-11, ey - 4); ctx.lineTo(-7, hy); ctx.moveTo(11, ey - 4); ctx.lineTo(7, hy); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, ey + 4, 11, 0.2, Math.PI - 0.2); ctx.stroke();
  etoile(ctx, 0, ey + 17, 5, or);
  ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = or; ctx.fillText('K', -22, ey + 22);
  // bras
  for (const k of [0, 1]) {
    const sx = k ? 1 : -1, [mx, my] = mainsDe[k];
    trait(ctx, [[sx * 30, ey + 4], [(sx * 30 + mx) / 2 + sx * 8, (ey + my) / 2 + 8], [mx, my]], 13, veste);
    rond(ctx, mx, my, 8, 8, peau, 2);
  }
  // le doigt qui te pointe, le micro dans l'autre main
  if (p.pose === 'portrait') {
    trait(ctx, [[70, ey + 18], [84, ey + 14]], 4, peau);
    ctx.beginPath(); ctx.roundRect(-64, ty + 18, 10, 26, 4); remplir(ctx, '#2a2a2a', 2);
    rond(ctx, -59, ty + 16, 8, 8, '#9aa0aa', 2);
  }
  if (p.pose === 'danse') { const [mx, my] = mainsDe[s < 0 ? 0 : 1]; trait(ctx, [[mx, my], [mx + s * 4, my - 14]], 4, peau); }
  // tête
  const tx = 0;
  ctx.beginPath(); ctx.roundRect(tx - 7, ty + 12, 14, 12, 3); remplir(ctx, peau, 2);
  if (def) ctx.translate(0, 4);
  ctx.beginPath(); ctx.ellipse(tx, ty, 17, 20, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(tx - 5, ty - 6, 2, tx, ty, 22); g.addColorStop(0, teinte(peau, 0.25)); g.addColorStop(1, teinte(peau, -0.15));
  remplir(ctx, g, 2.5);
  // banane gominée
  ctx.beginPath(); ctx.moveTo(tx - 17, ty - 2); ctx.quadraticCurveTo(tx - 22, ty - 26, tx - 4, ty - 30);
  ctx.quadraticCurveTo(tx + 26, ty - 40, tx + 30, ty - 22); ctx.quadraticCurveTo(tx + 20, ty - 26, tx + 16, ty - 12);
  ctx.lineTo(tx + 17, ty - 2); ctx.quadraticCurveTo(tx + 8, ty - 16, tx - 12, ty - 12); ctx.closePath();
  remplir(ctx, '#1c1418', 2.5);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tx - 6, ty - 28); ctx.quadraticCurveTo(tx + 10, ty - 34, tx + 22, ty - 28); ctx.stroke();
  // lunettes noires (fêlées s'il a perdu)
  ctx.beginPath(); ctx.roundRect(tx - 15, ty - 6, 13, 9, 3); ctx.roundRect(tx + 2, ty - 6, 13, 9, 3); ctx.fillStyle = '#111'; ctx.fill();
  ctx.strokeStyle = CONTOUR; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx - 2, ty - 3); ctx.lineTo(tx + 2, ty - 3); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(tx - 12, ty - 5, 4, 2); ctx.fillRect(tx + 5, ty - 5, 4, 2);
  if (def) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx + 4, ty - 6); ctx.lineTo(tx + 9, ty - 1); ctx.lineTo(tx + 6, ty + 3); ctx.stroke();
    ctx.fillStyle = '#7fd0ff'; ctx.beginPath(); ctx.ellipse(tx - 9, ty + 7, 2, 4, 0, 0, Math.PI * 2); ctx.fill(); }
  // bouche : grand sourire de star, ou il crie dans son micro, ou il boude
  ctx.strokeStyle = CONTOUR; ctx.lineWidth = 2;
  if (def) { ctx.beginPath(); ctx.moveTo(tx - 6, ty + 12); ctx.quadraticCurveTo(tx, ty + 8, tx + 6, ty + 12); ctx.stroke(); }
  else if (crie) { ctx.beginPath(); ctx.ellipse(tx, ty + 10, 7, 5, 0, 0, Math.PI * 2); ctx.fillStyle = '#5a1010'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(tx - 5, ty + 6, 10, 2.5); }
  else { ctx.beginPath(); ctx.moveTo(tx - 8, ty + 8); ctx.quadraticCurveTo(tx, ty + 16, tx + 8, ty + 8); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke(); }
  // micro-casque
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(tx, ty - 2, 20, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  rond(ctx, tx - 19, ty, 4, 7, '#2a2a2a', 1.5);
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx - 19, ty + 4); ctx.quadraticCurveTo(tx - 16, ty + 12, tx - 8, ty + 12); ctx.stroke();
  rond(ctx, tx - 7, ty + 12, 2.5, 2.5, '#9aa0aa', 1);
  ctx.restore();
}

// Trophée : un ballon de football américain en or sur un socle
function trophee(ctx, w, h) {
  const cx = w / 2;
  ctx.beginPath(); ctx.roundRect(cx - w * 0.3, h * 0.72, w * 0.6, h * 0.24, 8);
  remplir(ctx, degrade(ctx, 0, h * 0.72, 0, h * 0.96, [[0, '#5a2a1e'], [1, '#2a120c']]), 3);
  ctx.beginPath(); ctx.roundRect(cx - w * 0.2, h * 0.78, w * 0.4, h * 0.1, 4);
  remplir(ctx, degrade(ctx, cx - w * 0.2, 0, cx + w * 0.2, 0, [[0, '#8a5a10'], [0.5, '#fff3a8'], [1, '#8a5a10']]), 2);
  // tige
  ctx.beginPath(); ctx.moveTo(cx - w * 0.08, h * 0.72); ctx.lineTo(cx - w * 0.04, h * 0.58); ctx.lineTo(cx + w * 0.04, h * 0.58); ctx.lineTo(cx + w * 0.08, h * 0.72); ctx.closePath();
  remplir(ctx, '#c8961e', 2.5);
  // ballon en or
  ctx.save(); ctx.translate(cx, h * 0.36); ctx.rotate(-0.5);
  ctx.beginPath(); ctx.ellipse(0, 0, w * 0.36, w * 0.22, 0, 0, Math.PI * 2);
  remplir(ctx, degrade(ctx, -w * 0.3, -w * 0.2, w * 0.3, w * 0.2, [[0, '#fff3a8'], [0.4, '#ffd84a'], [0.75, '#c8961e'], [1, '#8a5a10']]), 3);
  ctx.strokeStyle = '#fffbe0'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-w * 0.14, 0); ctx.lineTo(w * 0.14, 0); ctx.stroke();
  for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * w * 0.055, -w * 0.035); ctx.lineTo(k * w * 0.055, w * 0.035); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-w * 0.12, -w * 0.1, w * 0.1, w * 0.04, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  etoile(ctx, cx + w * 0.3, h * 0.12, w * 0.06, '#fffbe0');
}

// Ballon seul (petit, pour les effets)
function ballon(ctx, w, h, p, { i, n }) {
  ballonUS(ctx, w / 2, h / 2, w * 0.42, (i / Math.max(1, n)) * Math.PI * 2);
}

export const FORMES_KEDRIC = { coureurDos, defenseur, kedric, trophee, ballon };
