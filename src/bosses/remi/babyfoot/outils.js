// Babyfoot de Rémi — constantes et calculs partagés (projection, barres, boutons, trajets avec rebonds).
import { LARGEUR } from '../../../core/reglages.js';
import { BABY as B } from '../reglages.js';

// ---------- projection : caméra basse derrière ton but (ton bord y≈520, celui de Rémi y≈190) ----------
export const CAM_Z = -0.55, CAM_H = 0.4, F = 663, HORIZON = 20, CX = LARGEUR / 2;
export const L = B.longueur, W = B.largeur, R = B.balle;
export function proj(x, y, z) {
  const p = F / (z - CAM_Z);
  return { x: CX + x * p, y: HORIZON + (CAM_H - y) * p, k: p };
}
// les 2 gros boutons (dessinés) et leurs zones de toucher, bien plus grandes (tout le bas de l'écran, sur les côtés)
// V19t (choix de Fabien) : ◀ ▶ CÔTE À CÔTE sous le pouce GAUCHE, gros TIR sous le pouce DROIT (viser et tirer sans bouger les mains)
export const BOUTON_G = { x: 80, y: 452, r: 64 }, BOUTON_D = { x: 226, y: 452, r: 64 };
export const BOUTON_ROULETTE = { x: LARGEUR / 2 + 250, y: 225, r: 62 };   // à droite : pas sous l'annonce « BUT DE RÉMI »
export const BOUTON_TIR = { x: LARGEUR - 104, y: 440, r: 80 };
// zones de toucher (plus grandes que les dessins) : sous y, ◀ à gauche de g, ▶ de g à d, TIR à droite de tir
export const ZONE_BOUTONS = { y: 300, g: 153, d: 320, tir: LARGEUR - 270 };
export const VIDES = { haut: null, bas: null, gauche: null, droite: null, espace: null, z: null, x: null };
// les barres : z (m depuis ton but), nombre de joueurs, écart, débattement, à qui
export const BARRES = {
  toi: { z: 0.07, n: 1, ecart: 0, course: B.course, moi: true },
  att: { z: 0.52, n: 3, ecart: 0.2, course: 0.1 },   // (V19b : 0,30 → 0,52 : le tir part de plus loin, le temps de lire)
  def: { z: 0.78, n: 2, ecart: 0.25, course: 0.15 },
  gar: { z: 0.93, n: 1, ecart: 0, course: 0.17 },
};
// V19k BILLARD : x de la balle à la distance z, rebonds sur les bandes compris (on « replie » la droite entre les bandes)
export const plier = (x) => { const m = W / 2 - R, p = 4 * m; const u = ((x + m) % p + p) % p; return u <= 2 * m ? u - m : 3 * m - u; };
export const xSur = (x0, z0, a, z) => plier(x0 + Math.tan(a) * (z - z0));
// calque d'un objet à la distance z (plus près = devant) : les figurines et la balle se rangent entre elles
export const profondeur = (z) => 5.1 + (L - z) * 0.5;
export const hommes = (b, pos) => Array.from({ length: b.n }, (_, i) => pos + (i - (b.n - 1) / 2) * b.ecart);
