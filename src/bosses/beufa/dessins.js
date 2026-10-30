// =====================================================================
// DESSINS DE BEUFA façon METAL GEAR NES : PIXEL ART 8 bits — le rendu se fait
// en petit (pixel: 2 du manifeste), les couleurs sont réduites, puis on agrandit
// sans lisser. Le VOLUME vient du trio NÉS : chapeau ÉCLAIRÉ + face AVANT sombre
// + CONTOUR NOIR. Tout est tourné vers la DROITE (la scène fait le reste).
// =====================================================================
import { teinte, hasard } from '../../core/dessins.js';

// Le sol : damier discret de dalles sombres + quelques gravats
export function DALLE_NES(ctx, w, h, p) {
  ctx.fillStyle = '#141a26'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#101522';
  for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) if (((x + y) / 32) % 2 === 0) ctx.fillRect(x, y, 32, 32);
  ctx.strokeStyle = '#1c2434'; ctx.lineWidth = 2;
  for (let k = 0; k <= w; k += 32) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k, h); ctx.stroke(); }
  for (let k = 0; k <= h; k += 32) { ctx.beginPath(); ctx.moveTo(0, k); ctx.lineTo(w, k); ctx.stroke(); }
  const alea = hasard(11);
  ctx.fillStyle = '#1a2130';
  for (let k = 0; k < 5; k++) ctx.fillRect(Math.floor(alea() * (w - 6) / 4) * 4, Math.floor(alea() * (h - 6) / 4) * 4, 4, 4);
}

// Un mur horizontal (bande 64 x 20, pavée le long des murs) : chapeau + face avant
export function MUR_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.45); ctx.fillRect(0, 8, w, h - 8);
  ctx.fillStyle = p.couleur; ctx.fillRect(0, 2, w, 8);
  ctx.fillStyle = teinte(p.couleur, 0.35); ctx.fillRect(0, 0, w, 4);
  ctx.fillStyle = teinte(p.couleur, 0.15);
  for (let x = 0; x < w; x += 16) ctx.fillRect(x + 1, 3, 14, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (let x = 0; x < w; x += 16) ctx.fillRect(x, 9, 16, 2);
  ctx.strokeStyle = '#0a0e15'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = '#e8f0f8'; ctx.fillRect(2, 0, w - 4, 1);
}

// La même bande, verticale (mur de gauche/droite)
export function MUR_NES_V(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.45); ctx.fillRect(8, 0, w - 8, h);
  ctx.fillStyle = p.couleur; ctx.fillRect(2, 0, 8, h);
  ctx.fillStyle = teinte(p.couleur, 0.35); ctx.fillRect(0, 0, 4, h);
  ctx.fillStyle = teinte(p.couleur, 0.15);
  for (let y = 0; y < h; y += 16) ctx.fillRect(3, y + 1, 3, 14);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (let y = 0; y < h; y += 16) ctx.fillRect(9, y, 2, 16);
  ctx.strokeStyle = '#0a0e15'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = '#e8f0f8'; ctx.fillRect(0, 2, 1, h - 4);
}

// Une caisse en VOLUME : chapeau clair + face avant sombre + sangles + rivets
export function CAISSE_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.5); ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = teinte(p.couleur, 0.15); ctx.fillRect(2, 2, w - 4, h - 18);
  ctx.fillStyle = teinte(p.couleur, 0.35); ctx.fillRect(2, 2, w - 4, 4);
  ctx.fillStyle = teinte(p.couleur, -0.2); ctx.fillRect(2, h - 16, w - 4, 14);
  ctx.fillStyle = teinte(p.couleur, 0.05); ctx.fillRect(2, h - 16, w - 4, 3);
  ctx.fillStyle = '#232a38';
  ctx.fillRect(6, 2, 5, h - 4); ctx.fillRect(w - 11, 2, 5, h - 4); ctx.fillRect(2, 7, w - 4, 5);
  ctx.fillStyle = '#3c4654';
  ctx.fillRect(7, 3, 3, h - 6); ctx.fillRect(w - 10, 3, 3, h - 6); ctx.fillRect(3, 8, w - 6, 3);
  ctx.strokeStyle = '#0a0e15'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = '#9aa3ad';
  for (const [x, y] of [[5, 5], [w - 7, 5], [5, h - 7], [w - 7, h - 7]]) ctx.fillRect(x, y, 2, 2);
}

// La tour-projecteur : plateforme en volume + garde-corps en croix + cœur lumineux
export function TOUR_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.5); ctx.fillRect(4, 4, w - 8, h - 8);
  ctx.fillStyle = p.couleur; ctx.fillRect(4, 4, w - 8, h - 22);
  ctx.fillStyle = teinte(p.couleur, 0.25); ctx.fillRect(4, 4, w - 8, 6);
  ctx.strokeStyle = '#0a0e15'; ctx.lineWidth = 2; ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.fillStyle = '#0a0e15';
  ctx.fillRect(4, h / 2 - 2, w - 8, 4); ctx.fillRect(w / 2 - 2, 4, 4, h - 8);
  ctx.fillStyle = '#3c4654';
  ctx.fillRect(4, h / 2 - 1, w - 8, 2); ctx.fillRect(w / 2 - 1, 4, 2, h - 8);
  ctx.fillStyle = '#c9a22e'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff8d0'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(w / 2 - 3, h / 2 - 3, 4, 4);
}

// Une porte blindée : ouverte (bande jaune + LED verte = la sortie) ou verrouillée (LED rouge)
export function PORTE_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.45); ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = p.couleur; ctx.fillRect(1, 1, w - 2, h - 6);
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(1, 1, w - 2, 3);
  ctx.fillStyle = '#9aa3ad';
  for (const x of [5, w - 8]) { ctx.fillRect(x, 4, 2, 2); ctx.fillRect(x, h - 8, 2, 2); }
  ctx.strokeStyle = '#0a0e15'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
  if (p.ouverte) {
    ctx.fillStyle = '#ffd84a'; ctx.fillRect(4, h / 2 - 3, w - 8, 6);
    ctx.fillStyle = '#2a5a10'; ctx.fillRect(w - 14, 3, 7, 7);
    ctx.fillStyle = '#7fff7f'; ctx.fillRect(w - 13, 4, 5, 5);
  } else {
    ctx.fillStyle = '#5a1010'; ctx.fillRect(w - 14, 3, 7, 7);
    ctx.fillStyle = '#ff5a5a'; ctx.fillRect(w - 13, 4, 5, 5);
    ctx.fillStyle = '#3c4654'; ctx.fillRect(w / 2 - 6, h / 2 - 1, 12, 3);
  }
}

// Un garde, tourné vers la DROITE : casque, fusil tenu devant, 2 frames de marche
export function GARDE_NES(ctx, w, h, p, { i, n }) {
  const cx = w / 2, cy = h / 2;
  const pas = n > 1 ? (i === 0 ? 1 : -1) : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(cx, cy + 6, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a2010';
  ctx.fillRect(cx - 10 + pas * 4, cy + 2, 8, 8); ctx.fillRect(cx + 2 - pas * 4, cy + 2, 8, 8);
  ctx.fillStyle = '#232a18'; ctx.fillRect(cx + 2, cy - 2, 16, 5);
  ctx.fillStyle = '#0a0e15'; ctx.fillRect(cx + 15, cy - 3, 5, 3);
  ctx.fillStyle = teinte(p.couleur, -0.35); ctx.fillRect(cx - 12, cy - 8, 22, 14);
  ctx.fillStyle = p.couleur; ctx.fillRect(cx - 12, cy - 8, 22, 6);
  ctx.fillStyle = teinte(p.couleur, 0.25); ctx.fillRect(cx - 12, cy - 8, 22, 3);
  ctx.fillStyle = p.couleur; ctx.fillRect(cx + 2, cy - 6, 10, 6);
  ctx.fillStyle = '#e8b488'; ctx.fillRect(cx + 12, cy - 5, 5, 5);
  ctx.fillStyle = '#e8b488'; ctx.fillRect(cx - 4, cy - 16, 11, 9);
  ctx.fillStyle = teinte(p.couleur, 0.1); ctx.fillRect(cx - 6, cy - 19, 15, 6);
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(cx - 6, cy - 19, 15, 2);
  ctx.fillStyle = '#0a0e15'; ctx.fillRect(cx - 5, cy - 20, 17, 2);
  ctx.fillStyle = '#0a0e15'; ctx.fillRect(cx + 2, cy - 12, 2, 2);
}

// Le héros infiltrateur, tourné vers la DROITE : combinaison sombre + bandeau rouge
export function HEROS_NES(ctx, w, h, p, { i, n }) {
  const cx = w / 2, cy = h / 2;
  const pas = n > 1 ? (i === 0 ? 1 : -1) : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(cx, cy + 6, 13, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#10141c';
  ctx.fillRect(cx - 10 + pas * 4, cy + 2, 8, 8); ctx.fillRect(cx + 2 - pas * 4, cy + 2, 8, 8);
  ctx.fillStyle = teinte(p.couleur, -0.4); ctx.fillRect(cx - 12, cy - 8, 22, 14);
  ctx.fillStyle = p.couleur; ctx.fillRect(cx - 12, cy - 8, 22, 7);
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(cx - 12, cy - 8, 22, 3);
  ctx.fillStyle = p.couleur; ctx.fillRect(cx + 4, cy - 5 + pas * 2, 9, 6);
  ctx.fillStyle = '#e8b488'; ctx.fillRect(cx + 12, cy - 4 + pas * 2, 5, 5);
  ctx.fillStyle = '#e8b488'; ctx.fillRect(cx - 4, cy - 16, 11, 9);
  ctx.fillStyle = '#c02b2b'; ctx.fillRect(cx - 6, cy - 17, 15, 4);
  ctx.fillStyle = '#ff5a5a'; ctx.fillRect(cx - 6, cy - 17, 15, 1);
  ctx.fillStyle = '#3c2a18'; ctx.fillRect(cx - 6, cy - 20, 15, 3);
  ctx.fillStyle = '#0a0e15'; ctx.fillRect(cx + 3, cy - 11, 2, 2);
}

// BEUFA en personne : le costaud à la casquette, écusson B, bras croisés, barbe
export function BEUFA_NES(ctx, w, h, p) {
  const cx = w / 2, cy = h / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(cx, cy + 8, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a2010';
  ctx.fillRect(cx - 16, cy + 3, 12, 10); ctx.fillRect(cx + 4, cy + 3, 12, 10);
  ctx.fillStyle = teinte(p.couleur, -0.4); ctx.fillRect(cx - 20, cy - 12, 40, 18);
  ctx.fillStyle = p.couleur; ctx.fillRect(cx - 20, cy - 12, 40, 9);
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(cx - 20, cy - 12, 40, 4);
  ctx.fillStyle = teinte(p.couleur, -0.2); ctx.fillRect(cx - 20, cy - 4, 40, 7);
  ctx.fillStyle = '#e8b488'; ctx.fillRect(cx - 8, cy - 4, 6, 6); ctx.fillRect(cx + 3, cy - 4, 6, 6);
  ctx.fillStyle = '#e8b488'; ctx.fillRect(cx - 7, cy - 26, 17, 13);
  ctx.fillStyle = '#16241a'; ctx.fillRect(cx - 10, cy - 31, 23, 7);
  ctx.fillStyle = '#2e4a32'; ctx.fillRect(cx - 10, cy - 31, 23, 3);
  ctx.fillStyle = '#0a0e15'; ctx.fillRect(cx - 11, cy - 24, 25, 2);
  ctx.fillStyle = '#ffd84a'; ctx.fillRect(cx - 1, cy - 30, 5, 5);
  ctx.fillStyle = '#0a0e15'; ctx.fillRect(cx + 2, cy - 20, 3, 3);
  ctx.fillStyle = '#3c2a18'; ctx.fillRect(cx - 7, cy - 15, 17, 4);
}

// La pierre de diversion : un petit galet avec son reflet
export function PIERRE_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.3); ctx.fillRect(1, 3, w - 2, h - 5);
  ctx.fillStyle = p.couleur; ctx.fillRect(1, 2, w - 3, h - 6);
  ctx.fillStyle = teinte(p.couleur, 0.35); ctx.fillRect(2, 2, w - 6, 2);
  ctx.strokeStyle = '#0a0e15'; ctx.lineWidth = 1; ctx.strokeRect(1, 2, w - 2, h - 4);
}
