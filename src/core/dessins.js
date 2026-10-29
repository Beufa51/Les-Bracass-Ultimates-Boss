// =====================================================================
// DESSINS PROVISOIRES DU MOTEUR COMMUN (hub, badges) : tout ce qui n'a pas encore
// de vrai fichier image est dessiné par le code (style manga : contours épais, ombres, reflets).
// Les dessins de chaque boss sont dans SON dossier (src/bosses/<boss>/dessins.js).
// Chaque forme reçoit : ctx (pinceau), w / h (taille d'une case), p (réglages
// du manifeste), et l'image en cours { i, n } pour les animations.
// =====================================================================

export const CONTOUR = '#1a1014';

// ---------- petits outils ----------
// Éclaircit (f > 0) ou assombrit (f < 0) une couleur "#rrggbb"
export function teinte(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const cible = f > 0 ? 255 : 0, k = Math.abs(f);
  r = Math.round(r + (cible - r) * k); g = Math.round(g + (cible - g) * k); b = Math.round(b + (cible - b) * k);
  return `rgb(${r},${g},${b})`;
}

// Hasard "fixe" : le même dessin à chaque chargement
export function hasard(graine) {
  let s = graine;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export function remplir(ctx, couleur, epaisseur = 3) {
  ctx.fillStyle = couleur; ctx.fill();
  if (epaisseur) { ctx.strokeStyle = CONTOUR; ctx.lineWidth = epaisseur; ctx.lineJoin = 'round'; ctx.stroke(); }
}

export function degrade(ctx, x0, y0, x1, y1, arrets) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  arrets.forEach(([pos, c]) => g.addColorStop(pos, c));
  return g;
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
  if (r > 8) {   // l'anneau intérieur seulement si le disque est assez grand (une petite pierre : rayon négatif interdit)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w / 2, h / 2, r - 6, 0, Math.PI * 2); ctx.stroke();
  }
}

// Médaille : disque métallique, anneau, lettre gravée
function badge(ctx, w, h, p) {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 3;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, 1, cx, cy, r * 1.2);
  g.addColorStop(0, teinte(p.couleur, 0.6)); g.addColorStop(0.5, p.couleur); g.addColorStop(1, teinte(p.couleur, -0.5));
  remplir(ctx, g, 2.5);
  if (r > 8) {   // l'anneau seulement si la médaille est assez grande (rayon négatif interdit)
    ctx.beginPath(); ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke();
  }
  if (p.icone === 'frisbee') {
    // petit frisbee vu de 3/4 à la place de la lettre
    ctx.save(); ctx.translate(cx, cy + 1); ctx.rotate(-0.35);
    ctx.beginPath(); ctx.ellipse(0, 2, r * 0.6, r * 0.3, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.6, r * 0.3, 0, 0, Math.PI * 2); remplir(ctx, '#ffffff', 1.5);
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.36, r * 0.17, 0, 0, Math.PI * 2); ctx.strokeStyle = p.couleur; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  } else if (p.icone === 'football') {
    // petit ballon de football américain à la place de la lettre
    ctx.save(); ctx.translate(cx, cy + 1); ctx.rotate(-0.6);
    ctx.beginPath(); ctx.ellipse(1, 2, r * 0.62, r * 0.38, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.62, r * 0.38, 0, 0, Math.PI * 2); remplir(ctx, '#8a4a20', 1.5);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-r * 0.25, 0); ctx.lineTo(r * 0.25, 0); ctx.stroke();
    for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * r * 0.12, -r * 0.08); ctx.lineTo(k * r * 0.12, r * 0.08); ctx.stroke(); }
    ctx.restore();
  } else {
  ctx.font = `bold ${Math.round(h * 0.42)}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillText(p.lettre || '?', cx + 1, cy + 2);
  ctx.fillStyle = '#ffffff'; ctx.fillText(p.lettre || '?', cx, cy + 1);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.ellipse(cx - r * 0.4, cy - r * 0.45, r * 0.25, r * 0.12, -0.6, 0, Math.PI * 2); ctx.fill();
}

function rect(ctx, w, h, p, { i, n }) {
  const r = n > 1 ? Math.round(Math.sin((i / n) * Math.PI * 2) * 3) : 0;
  ctx.beginPath(); ctx.roundRect(6, 6 + r, w - 12, h - 12, 8);
  remplir(ctx, degrade(ctx, 0, 6, 0, h - 6, [[0, teinte(p.couleur, 0.3)], [1, teinte(p.couleur, -0.3)]]));
}

export const FORMES = { rect, cercle, badge, perso, porte, dalle, mur };
