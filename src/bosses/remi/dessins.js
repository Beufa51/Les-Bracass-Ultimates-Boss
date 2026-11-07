// =====================================================================
// DESSINS PROVISOIRES DE RÉMI (tracés au code avec Phaser Graphics, redessinés à chaque image) :
// toi à vélo (de profil), les bourrés, Rémi, la porte.
// Chaque fonction dessine autour de (0, 0) = les PIEDS (ou le point au sol) : on place / tourne l'objet Graphics.
// À remplacer par les vraies illustrations (voir propositions/remi_prompts_images.md).
// =====================================================================

const CONTOUR = 0x111118;
export const COULEURS = {
  peau: 0xf1c27d, toi: 0x2f7de1, jean: 0x2b3a67, velo: 0xd23a3a,
  remi: 0xe8742a, remiCasquette: 0x1d1d1d, barbe: 0x5a3a1e,
  bourre: [0x7a9a3a, 0x8a4ab0, 0x3a8a8a, 0xb0503a, 0x777777],
};

function trait(g, pts, ep, couleur) {
  for (const [l, c] of [[ep + 3, CONTOUR], [ep, couleur]]) {
    g.lineStyle(l, c, 1);
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (const [x, y] of pts.slice(1)) g.lineTo(x, y);
    g.strokePath();
  }
}
function rond(g, x, y, r, couleur) {
  g.fillStyle(CONTOUR, 1).fillCircle(x, y, r + 1.5);
  g.fillStyle(couleur, 1).fillCircle(x, y, r);
}
// genou entre la hanche et le pied (deux segments de longueur L, genou vers l'avant)
function genou(h, p, L, sens = 1) {
  const dx = p[0] - h[0], dy = p[1] - h[1], d = Math.min(Math.hypot(dx, dy), 2 * L - 0.01);
  const m = [(h[0] + p[0]) / 2, (h[1] + p[1]) / 2], k = Math.sqrt(Math.max(0, L * L - (d / 2) ** 2));
  const nx = -dy / (d || 1), ny = dx / (d || 1);
  return [m[0] - nx * k * sens, m[1] - ny * k * sens];
}

// ---------- TOI À VÉLO (de profil, vers la droite) ----------
// a = angle du pédalier (radians) ; o = { danseuse, sonnette }
export function cycliste(g, a, o = {}) {
  const R = [-36, -24], F = [36, -24], C = [-4, -24], S = [-14, -64], H = [24, -66];
  // roues
  for (const [x, y] of [R, F]) {
    g.lineStyle(5, CONTOUR, 1).strokeCircle(x, y, 22);
    g.lineStyle(1.5, 0xbbbbbb, 1);
    for (let k = 0; k < 3; k++) {
      const b = a * 0.7 + k * Math.PI / 3;
      g.lineBetween(x - Math.cos(b) * 20, y - Math.sin(b) * 20, x + Math.cos(b) * 20, y + Math.sin(b) * 20);
    }
  }
  const p1 = [C[0] + Math.cos(a) * 12, C[1] + Math.sin(a) * 12], p2 = [C[0] - Math.cos(a) * 12, C[1] - Math.sin(a) * 12];
  const hanche = [S[0] + 2, S[1] - 6 - (o.danseuse ? 10 : 0)], epaule = [hanche[0] + 22, hanche[1] - 36];
  // jambe du fond (plus sombre)
  trait(g, [hanche, genou(hanche, p2, 27), p2], 7, 0x1f2a4d);
  // cadre
  trait(g, [R, C, S, R], 4, COULEURS.velo);
  trait(g, [S, H, C], 4, COULEURS.velo);
  trait(g, [H, F], 4, COULEURS.velo);
  trait(g, [H, [H[0] - 4, H[1] - 12], [H[0] + 6, H[1] - 14]], 3, 0x333333);   // guidon
  trait(g, [[S[0] - 8, S[1] - 2], [S[0] + 8, S[1] - 2]], 4, 0x222222);         // selle
  // corps
  trait(g, [hanche, epaule], 13, COULEURS.toi);
  trait(g, [hanche, genou(hanche, p1, 27), p1], 8, COULEURS.jean);
  trait(g, [epaule, [epaule[0] + 10, epaule[1] + 14], [H[0] + 4, H[1] - 13]], 6, COULEURS.peau);
  rond(g, epaule[0] + 6, epaule[1] - 15, 12, COULEURS.peau);
  g.fillStyle(0x3a2a1a, 1).fillEllipse(epaule[0] + 3, epaule[1] - 22, 22, 10);   // cheveux
  if (o.sonnette) { g.lineStyle(2, 0xffe680, 1).strokeCircle(H[0] + 12, H[1] - 26, 6).strokeCircle(H[0] + 12, H[1] - 26, 12); }
}

// ---------- UN BOURRÉ ----------
// pose : 'debout' (titube, bouteille à la main), 'allonge' (couché par terre), 'marche' (traverse), 'ecarte' (a sursauté)
// t = temps (s) pour l'animation ; c = couleur du tee-shirt
export function bourre(g, pose, t, c = 0x7a9a3a) {
  if (pose === 'allonge') {
    trait(g, [[-44, -8], [-8, -10]], 8, 0x333344);               // jambes
    trait(g, [[-8, -10], [26, -12]], 14, c);                     // corps
    trait(g, [[20, -14], [34, -26], [48, -22]], 5, COULEURS.peau); // bras levé
    rond(g, 40, -14, 11, COULEURS.peau);
    g.fillStyle(0xd33a3a, 1).fillCircle(50, -14, 3);             // nez rouge
    bouteille(g, -20, -2, 1.4);
    return;
  }
  const s = Math.sin(t * 2.3), l = pose === 'marche' ? Math.sin(t * 7) * 10 : 0;
  const hanche = [s * 4, -52], epaule = [s * 12, -96];
  trait(g, [hanche, [-8 + l, -24], [-12 + l, 0]], 8, 0x333344);
  trait(g, [hanche, [8 - l, -26], [12 - l, 0]], 8, 0x333344);
  trait(g, [hanche, epaule], 16, c);
  if (pose === 'ecarte') trait(g, [epaule, [epaule[0] - 18, epaule[1] - 22]], 5, COULEURS.peau);
  else trait(g, [epaule, [epaule[0] + 16, epaule[1] + 18], [epaule[0] + 22, epaule[1] - 2]], 5, COULEURS.peau);
  bouteille(g, epaule[0] + 22, epaule[1] - 2, 1);
  rond(g, epaule[0] + 2, epaule[1] - 16, 12, COULEURS.peau);
  g.fillStyle(0xd33a3a, 1).fillCircle(epaule[0] - 9, epaule[1] - 15, 3.5);   // nez rouge (il regarde vers toi)
  g.lineStyle(2, CONTOUR, 1).lineBetween(epaule[0] - 6, epaule[1] - 21, epaule[0] - 1, epaule[1] - 19);
}
function bouteille(g, x, y, k) {
  g.fillStyle(CONTOUR, 1).fillRect(x - 4 * k, y - 18 * k, 8 * k, 20 * k);
  g.fillStyle(0x2e7d32, 1).fillRect(x - 3 * k, y - 17 * k, 6 * k, 18 * k);
  g.fillStyle(0x2e7d32, 1).fillRect(x - 1.5 * k, y - 23 * k, 3 * k, 7 * k);
}

// Verre cassé et flaque (au sol)
export function verreCasse(g) {
  g.fillStyle(0x9fd8e8, 0.9);
  for (const [x, w] of [[-22, 10], [-6, 14], [10, 8], [20, 11]]) g.fillTriangle(x, 0, x + w, 0, x + w / 2, -10 - (w % 5));
}
export function flaque(g) {
  g.fillStyle(0xb5c23a, 0.85).fillEllipse(0, -2, 90, 12);
  g.fillStyle(0xd8e05a, 0.8).fillEllipse(-12, -3, 30, 5);
}

// ---------- RÉMI ----------
// pose : 'face' (de face, buste, pour le babyfoot), 'lance' (bras levé), 'garde' / 'elan' / 'frappe' (de profil, vers la droite)
export function remi(g, pose, t = 0) {
  personne(g, pose, t, { tee: COULEURS.remi, casquette: true, barbe: true });
}
// Toi, de profil (la porte)
export function toi(g, pose, t = 0) {
  personne(g, pose, t, { tee: COULEURS.toi, casquette: false, barbe: false });
}

function personne(g, pose, t, o) {
  if (pose === 'face' || pose === 'lance') {
    // buste de face, à partir de la taille (0, 0)
    trait(g, [[-30, 0], [-32, -70], [32, -70], [30, 0]], 4, o.tee);
    g.fillStyle(o.tee, 1).fillRect(-30, -70, 60, 70);
    if (pose === 'lance') trait(g, [[30, -64], [52, -96], [46, -128]], 9, COULEURS.peau);
    else trait(g, [[30, -64], [40, -30], [34, -4]], 9, COULEURS.peau);
    trait(g, [[-30, -64], [-40, -30], [-34, -4]], 9, COULEURS.peau);
    rond(g, 0, -98, 24, COULEURS.peau);
    if (o.barbe) { g.fillStyle(COULEURS.barbe, 1).fillEllipse(0, -84, 40, 22); g.fillStyle(COULEURS.peau, 1).fillEllipse(0, -90, 18, 7); }
    g.fillStyle(CONTOUR, 1).fillCircle(-9, -103, 3).fillCircle(9, -103, 3);
    if (o.casquette) { g.fillStyle(COULEURS.remiCasquette, 1).fillEllipse(0, -116, 52, 22).fillRect(-26, -118, 52, 8); }
    return;
  }
  const el = pose === 'elan' ? 1 : 0, fr = pose === 'frappe' ? 1 : 0;
  const b = Math.sin(t * 6) * 2;
  const hanche = [-6 * el, -64], epaule = [6 - 14 * el + 14 * fr, -116 + b];
  trait(g, [hanche, [-14, -30], [-22, 0]], 10, COULEURS.jean);
  trait(g, [hanche, [10, -32], [18, 0]], 10, COULEURS.jean);
  trait(g, [hanche, epaule], 22, o.tee);
  // bras de frappe
  const poing = fr ? [epaule[0] + 66, epaule[1] + 4] : el ? [epaule[0] - 34, epaule[1] + 10] : [epaule[0] + 26, epaule[1] - 6];
  const coude = fr ? [epaule[0] + 34, epaule[1] + 2] : el ? [epaule[0] - 20, epaule[1] + 26] : [epaule[0] + 18, epaule[1] + 22];
  trait(g, [epaule, coude, poing], 9, COULEURS.peau);
  rond(g, poing[0], poing[1], 8, COULEURS.peau);
  rond(g, epaule[0] + 4, epaule[1] - 26, 18, COULEURS.peau);
  if (o.barbe) g.fillStyle(COULEURS.barbe, 1).fillEllipse(epaule[0] + 12, epaule[1] - 16, 20, 16);
  g.fillStyle(CONTOUR, 1).fillCircle(epaule[0] + 14, epaule[1] - 30, 2.5);
  if (o.casquette) { g.fillStyle(COULEURS.remiCasquette, 1).fillEllipse(epaule[0] + 4, epaule[1] - 40, 38, 16).fillRect(epaule[0] + 4, epaule[1] - 40, 28, 6); }
  else g.fillStyle(0x3a2a1a, 1).fillEllipse(epaule[0], epaule[1] - 40, 32, 12);
}
