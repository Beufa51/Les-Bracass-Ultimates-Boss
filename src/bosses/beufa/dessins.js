// =====================================================================
// DESSINS PROVISOIRES DE BEUFA (vue du dessus, NUIT) : gardes, héros, caisses, tours, projecteurs...
// Chaque forme reçoit : ctx (pinceau), w / h (taille d'une case), p (réglages du manifeste),
// et l'image en cours { i, n } pour les animations.
// Le GARDE et le HÉROS sont dessinés tournés vers la DROITE (la scène les tourne avec setRotation).
// =====================================================================
import { CONTOUR, teinte, remplir, degrade } from '../../core/dessins.js';

// Un garde : casque, épaules d'uniforme, torche tenue devant lui
export function GARDE(ctx, w, h, p, { i, n }) {
  const cx = w / 2, cy = h / 2;
  const pas = n > 1 ? Math.sin((i / n) * Math.PI * 2) : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(cx, cy + 3, 15, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(cx + 4, cy - 17 + pas * 2, 9, 5, 2); remplir(ctx, '#ffe9a0', 1.5);   // la torche
  ctx.beginPath(); ctx.roundRect(cx - 13, cy - 12 - Math.abs(pas), 24, 24, 9);
  remplir(ctx, degrade(ctx, cx - 13, 0, cx + 11, 0, [[0, teinte(p.couleur, 0.2)], [1, teinte(p.couleur, -0.3)]]), 2.5);
  ctx.beginPath(); ctx.roundRect(cx + 1, cy - 12 + pas * 3, 7, 9, 3); remplir(ctx, teinte(p.couleur, -0.15), 2);
  ctx.beginPath(); ctx.roundRect(cx + 1, cy + 3 - pas * 3, 7, 9, 3); remplir(ctx, teinte(p.couleur, -0.15), 2);
  ctx.beginPath(); ctx.arc(cx - 3, cy, 9, 0, Math.PI * 2); remplir(ctx, '#2c362c', 2);
  ctx.beginPath(); ctx.arc(cx - 3, cy, 4.5, 0, Math.PI * 2); remplir(ctx, teinte(p.couleur, -0.45), 1.5);
}

// Le héros : sweat rouge, casque rouge à bande blanche, le 21 dans le dos
export function HEROS(ctx, w, h, p, { i, n }) {
  const cx = w / 2, cy = h / 2;
  const pas = n > 1 ? Math.sin((i / n) * Math.PI * 2) : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(cx, cy + 3, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(cx - 13, cy - 11 - Math.abs(pas), 24, 22, 8);
  remplir(ctx, degrade(ctx, cx - 13, 0, cx + 11, 0, [[0, teinte(p.couleur, 0.25)], [1, teinte(p.couleur, -0.3)]]), 2.5);
  ctx.beginPath(); ctx.roundRect(cx, cy - 11 + pas * 3, 7, 8, 3); remplir(ctx, teinte(p.couleur, -0.1), 2);
  ctx.beginPath(); ctx.roundRect(cx, cy + 3 - pas * 3, 7, 8, 3); remplir(ctx, teinte(p.couleur, -0.1), 2);
  ctx.beginPath(); ctx.arc(cx - 3, cy, 9, 0, Math.PI * 2); remplir(ctx, '#c02b2b', 2);
  ctx.beginPath(); ctx.ellipse(cx - 5, cy, 7, 3.4, 0, 0, Math.PI * 2); remplir(ctx, '#ffffff', 1);   // la bande du casque
  ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff'; ctx.fillText('21', cx - 4, cy + 6);
}

// Une caisse en bois, avec ses planches et sa croix
export function CAISSE(ctx, w, h, p) {
  ctx.fillStyle = degrade(ctx, 0, 0, 0, h, [[0, teinte(p.couleur, 0.15)], [1, teinte(p.couleur, -0.3)]]); ctx.fillRect(2, 2, w - 4, h - 4);
  ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3; ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2;
  for (let y = 13; y < h - 6; y += 11) { ctx.beginPath(); ctx.moveTo(4, y); ctx.lineTo(w - 4, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(4, 4); ctx.lineTo(w - 4, h - 4); ctx.moveTo(w - 4, 4); ctx.lineTo(4, h - 4); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(2, 2, w - 4, 3);
}

// Un pilier de béton
export function PILIER(ctx, w, h, p) {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 2;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(cx + 1, cy + 2, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  remplir(ctx, degrade(ctx, cx - r, cy - r, cx + r, cy + r, [[0, teinte(p.couleur, 0.25)], [1, teinte(p.couleur, -0.4)]]), 2.5);
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; ctx.stroke();
}

// Une tour de garde : plateforme, garde-corps en croix, projecteur au centre
export function TOUR(ctx, w, h, p) {
  const cx = w / 2, cy = h / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(cx + 2, cy + 3, w * 0.42, h * 0.36, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(3, 3, w - 6, h - 6, 7);
  remplir(ctx, degrade(ctx, 0, 0, w, h, [[0, teinte(p.couleur, 0.3)], [1, teinte(p.couleur, -0.4)]]), 3);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(8, cy); ctx.lineTo(w - 8, cy); ctx.moveTo(cx, 8); ctx.lineTo(cx, h - 8); ctx.stroke();
  const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, 11);
  g.addColorStop(0, '#fff8d0'); g.addColorStop(1, '#c9a22e');
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); remplir(ctx, g, 2.5);
}

// LA PORTE DU QG : blindée, bande jaune, « QG » gravé
export function PORTE(ctx, w, h, p) {
  ctx.beginPath(); ctx.roundRect(2, 2, w - 4, h - 4, 6);
  remplir(ctx, degrade(ctx, 0, 0, 0, h, [[0, teinte(p.couleur, 0.15)], [1, teinte(p.couleur, -0.4)]]), 3);
  ctx.save(); ctx.beginPath(); ctx.rect(5, 5, w - 10, 9); ctx.clip();
  for (let x = 5; x < w - 5; x += 12) { ctx.fillStyle = (x / 12) % 2 < 1 ? '#ffd84a' : '#1a1014'; ctx.fillRect(x, 5, 12, 9); }
  ctx.restore();
  ctx.font = 'bold ' + Math.round(h * 0.4) + 'px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8f0f8'; ctx.fillText('QG', w / 2, h * 0.62);
  ctx.fillStyle = '#1a2028';
  for (const x of [12, w - 12]) ctx.fillRect(x - 2, h * 0.6, 4, 4);
}

// BEUFA lui-même, vu de dessus : costaud, bras croisés, casquette et son écusson « B »
export function BEUFA(ctx, w, h, p, { i, n }) {
  const cx = w / 2, cy = h / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(cx, cy + 6, 24, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(cx - 24, cy - 14, 48, 28, 12);
  remplir(ctx, degrade(ctx, cx - 24, 0, cx + 24, 0, [[0, teinte(p.couleur, 0.25)], [1, teinte(p.couleur, -0.35)]]), 3);
  ctx.beginPath(); ctx.roundRect(cx - 16, cy - 4, 32, 10, 5); remplir(ctx, teinte(p.couleur, -0.2), 2);
  ctx.beginPath(); ctx.arc(cx, cy - 4, 13, Math.PI, Math.PI * 2); remplir(ctx, '#1e2e1e', 2);
  ctx.beginPath(); ctx.roundRect(cx - 13, cy - 6, 26, 8, 4); remplir(ctx, '#16241a', 2);
  ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd84a'; ctx.fillText('B', cx, cy - 8);
}
