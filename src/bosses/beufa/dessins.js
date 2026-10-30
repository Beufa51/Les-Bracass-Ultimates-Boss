// =====================================================================
// DESSINS DE BEUFA façon METAL GEAR NES : PIXEL ART 8 bits — le rendu se fait
// en petit (pixel: 2 du manifeste), les couleurs sont réduites comme sur console,
// puis on agrandit sans lisser. Le VOLUME vient du trio NÉS : chapeau ÉCLAIRÉ +
// face AVANT sombre + CONTOUR NOIR, plus une OMBRE PORTÉE sous chaque objet.
//
// DEUX LEÇS DE LA VERSION PRÉCÉDENTE (rendu « moche ») :
//  1. COULEURS « SUR LA GRILLE » : le moteur quantifie les canaux par 28 — on
//     choisit des valeurs déjà multiples de 28 (0, 28, 56, 84…), sinon le bleu
//     de la nuit glisse vers un gris boueux au rendu ;
//  2. COUTURES : les carreaux pavés (sol, murs) sont dessinés SANS bord sur les
//     côtés qui se juxtaposent — avant, chaque carreau traçait son contour noir :
//     ça faisait des doubles lignes tous les 64 px, comme des carreaux cassés.
// Tout est tourné vers la DROITE (la scène fait le reste).
// =====================================================================
import { teinte, hasard } from '../../core/dessins.js';

// LE SOL (carreau de 128, pavé sur tout l'écran) : nuit bleutée, dalles de 32, joints
// discrets dessinés à L'INTÉRIEUR du carreau, traces d'usure. Damier calme, pas bruité.
export function DALLE_NES(ctx, w, h, p) {
  ctx.fillStyle = '#1c1c38'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1c1c54';
  for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) if (((x / 32 + y / 32) % 2) === 0) ctx.fillRect(x, y, 32, 32);
  ctx.strokeStyle = '#383854'; ctx.lineWidth = 2;
  for (let k = 32; k < w; k += 32) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k, h); ctx.stroke(); }
  for (let k = 32; k < h; k += 32) { ctx.beginPath(); ctx.moveTo(0, k); ctx.lineTo(w, k); ctx.stroke(); }
  const alea = hasard(11);
  ctx.fillStyle = '#00001c';   // éclats sombres : le béton a vécu
  for (let k = 0; k < 5; k++) {
    const x = Math.floor(alea() * 3) * 32 + 6 + Math.floor(alea() * 14);
    const y = Math.floor(alea() * 3) * 32 + 6 + Math.floor(alea() * 14);
    ctx.fillRect(x, y, 6, 3); ctx.fillRect(x + 9, y + 4, 3, 2);
  }
  ctx.fillStyle = '#545470';   // quelques gravats clairs
  for (let k = 0; k < 3; k++) ctx.fillRect(Math.floor(alea() * 3) * 32 + 10, Math.floor(alea() * 3) * 32 + 10, 3, 3);
}

// UN MUR HORIZONTAL (bande 64 x 20, pavée le long des murs) : chapeau éclairé +
// face avant sombre. Le joint de panneaux tombe PILE au bord du carreau → régulier
// une fois pavé, et AUCUN contour sur les côtés → plus de coutures noires.
export function MUR_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.55); ctx.fillRect(0, 8, w, h - 8);   // la face avant, sombre
  ctx.fillStyle = '#383838'; ctx.fillRect(0, 8, w, 2);                     // l'arête ombre du chapeau
  ctx.fillStyle = p.couleur; ctx.fillRect(0, 2, w, 6);                     // le chapeau
  ctx.fillStyle = teinte(p.couleur, 0.4); ctx.fillRect(0, 2, w, 2);         // rim light
  ctx.fillStyle = 'rgba(0,0,0,0.4)';                                        // le joint de panneau, au bord
  ctx.fillRect(0, 8, 2, h - 8);
  ctx.fillRect(0, 2, 1, 6);
  ctx.fillStyle = teinte(p.couleur, 0.25); ctx.fillRect(1, 2, 2, 6);        // le chant éclairé du joint
  ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, w, 2); ctx.fillRect(0, h - 2, w, 2);   // contours haut/bas seulement
}

// LA MÊME BANDE, VERTICALE (murs de gauche/droite) — même logique, joints horizontaux.
export function MUR_NES_V(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.55); ctx.fillRect(8, 0, w - 8, h);
  ctx.fillStyle = '#383838'; ctx.fillRect(8, 0, 2, h);
  ctx.fillStyle = p.couleur; ctx.fillRect(2, 0, 6, h);
  ctx.fillStyle = teinte(p.couleur, 0.4); ctx.fillRect(2, 0, 2, h);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(8, 0, w - 8, 2);
  ctx.fillRect(2, 0, 6, 1);
  ctx.fillStyle = teinte(p.couleur, 0.25); ctx.fillRect(2, 1, 6, 2);
  ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, 2, h); ctx.fillRect(w - 2, 0, 2, h);
}

// UNE CAISSE EN BOIS, en VOLUME : ombre portée, chapeau clair, planches, sangles
// métalliques aux coins, rivets — chaude sur le sol froid, elle se lit d'un coup d'œil.
export function CAISSE_NES(ctx, w, h, p) {
  ctx.fillStyle = '#1c1c1c';   // l'ombre : la caisse POSE sur le sol
  ctx.beginPath(); ctx.ellipse(w / 2, h - 5, w / 2 - 4, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = teinte(p.couleur, -0.45); ctx.fillRect(3, h - 18, w - 6, 15);   // face avant
  ctx.fillStyle = p.couleur; ctx.fillRect(3, 3, w - 6, h - 20);                   // chapeau
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(3, 3, w - 6, 3);           // rim light
  ctx.fillStyle = teinte(p.couleur, -0.25);                                       // les planches du chapeau
  for (let y = 9; y < h - 20; y += 7) ctx.fillRect(4, y, w - 8, 2);
  ctx.fillStyle = '#1c1c1c'; ctx.fillRect(3, 3, 4, h - 6); ctx.fillRect(w - 7, 3, 4, h - 6);   // sangles
  ctx.fillStyle = '#545454'; ctx.fillRect(4, 4, 2, h - 8); ctx.fillRect(w - 6, 4, 2, h - 8);
  ctx.fillStyle = '#a8a8a8';   // rivets
  for (const [x, y] of [[4, 5], [w - 8, 5], [4, h - 21], [w - 8, h - 21]]) ctx.fillRect(x, y, 2, 2);
  ctx.strokeStyle = '#0a0a14'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
}

// LA TOUR-PROJECTEUR : plateforme en volume, garde-corps en croix, cœur lumineux.
export function TOUR_NES(ctx, w, h, p) {
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.ellipse(w / 2, h - 6, w / 2 - 6, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = teinte(p.couleur, -0.55); ctx.fillRect(6, 8, w - 12, h - 14);
  ctx.fillStyle = p.couleur; ctx.fillRect(6, 8, w - 12, h - 30);
  ctx.fillStyle = teinte(p.couleur, 0.35); ctx.fillRect(6, 8, w - 12, 5);
  ctx.strokeStyle = '#0a0a14'; ctx.lineWidth = 2; ctx.strokeRect(6, 8, w - 12, h - 14);
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(6, h / 2 - 2, w - 12, 4); ctx.fillRect(w / 2 - 2, 8, 4, h - 14);
  ctx.fillStyle = '#545454';
  ctx.fillRect(6, h / 2 - 1, w - 12, 2); ctx.fillRect(w / 2 - 1, 8, 2, h - 14);
  ctx.fillStyle = '#e0c41c'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fce054'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fcfcfc'; ctx.fillRect(w / 2 - 3, h / 2 - 3, 5, 5);
}

// UNE PORTE BLINDÉE : ouverte (bande de chantier jaune/noire + LED verte = la sortie)
// ou verrouillée (LED rouge — les pièces à venir du plan).
export function PORTE_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.5); ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = p.couleur; ctx.fillRect(1, 1, w - 2, h - 4);
  ctx.fillStyle = teinte(p.couleur, 0.35); ctx.fillRect(1, 1, w - 2, 3);
  ctx.strokeStyle = '#0a0a14'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = '#a8a8a8';
  for (const x of [5, w - 8]) { ctx.fillRect(x, 4, 2, 2); ctx.fillRect(x, h - 8, 2, 2); }
  if (p.ouverte) {
    ctx.fillStyle = '#fce054'; ctx.fillRect(4, h / 2 - 3, w - 8, 6);   // ÇA SORT PAR ICI
    ctx.fillStyle = '#0a0a14';
    for (let x = 5; x < w - 10; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, h / 2 + 3); ctx.lineTo(x + 3, h / 2 - 3); ctx.lineTo(x + 6, h / 2 - 3); ctx.lineTo(x + 3, h / 2 + 3);
      ctx.fill();
    }
    ctx.fillStyle = '#1c541c'; ctx.fillRect(w - 14, 3, 8, 8);
    ctx.fillStyle = '#38fc38'; ctx.fillRect(w - 13, 4, 6, 6);
  } else {
    ctx.fillStyle = '#541c1c'; ctx.fillRect(w - 14, 3, 8, 8);
    ctx.fillStyle = '#fc3838'; ctx.fillRect(w - 13, 4, 6, 6);
    ctx.fillStyle = '#545454'; ctx.fillRect(w / 2 - 7, h / 2 - 1, 14, 3);
  }
}

// UN GARDE, tourné vers la DROITE : ombre, uniforme olive, casquette, fusil tenu
// devant — 2 frames de marche (les jambes alternent, le fusil tangue d'un pixel).
export function GARDE_NES(ctx, w, h, p, { i, n }) {
  const cx = w / 2, cy = h / 2;
  const pas = n > 1 ? (i === 0 ? 1 : -1) : 0;
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.ellipse(cx, cy + 7, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c381c';   // les bottes (alternées : ça MARCHE)
  ctx.fillRect(cx - 10 + pas * 4, cy + 3, 8, 7); ctx.fillRect(cx + 2 - pas * 4, cy + 3, 8, 7);
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(cx - 10 + pas * 4, cy + 8, 8, 3); ctx.fillRect(cx + 2 - pas * 4, cy + 8, 8, 3);
  ctx.fillStyle = teinte(p.couleur, -0.3); ctx.fillRect(cx - 12, cy - 8, 22, 13);   // le torse
  ctx.fillStyle = p.couleur; ctx.fillRect(cx - 12, cy - 8, 22, 6);
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(cx - 12, cy - 8, 22, 2);
  ctx.fillStyle = p.couleur; ctx.fillRect(cx + 1, cy - 6, 9, 6);   // l'épaule avant
  ctx.fillStyle = '#1c1c1c'; ctx.fillRect(cx + 2, cy - 3 + pas, 15, 4);   // le fusil
  ctx.fillStyle = '#545454'; ctx.fillRect(cx + 2, cy - 3 + pas, 15, 2);
  ctx.fillStyle = '#0a0a14'; ctx.fillRect(cx + 15, cy - 3 + pas, 3, 4);   // le canon
  ctx.fillStyle = '#e0a870'; ctx.fillRect(cx - 4, cy - 16, 11, 9);   // la tête
  ctx.fillStyle = '#1c381c'; ctx.fillRect(cx - 6, cy - 19, 15, 5);   // la casquette
  ctx.fillStyle = teinte('#1c381c', 0.35); ctx.fillRect(cx - 6, cy - 19, 15, 2);
  ctx.fillStyle = '#0a0a14'; ctx.fillRect(cx - 7, cy - 17, 3, 2);   // le pont de la casquette
  ctx.fillStyle = '#0a0a14'; ctx.fillRect(cx + 3, cy - 12, 2, 2);   // l'œil
}

// LE HÉROS INFILTRATEUR, tourné vers la DROITE : combinaison bleu nuit, BANDEAU
// ROUGE (comme Snake) dont les nœuds flottent derrière, 2 frames de marche.
export function HEROS_NES(ctx, w, h, p, { i, n }) {
  const cx = w / 2, cy = h / 2;
  const pas = n > 1 ? (i === 0 ? 1 : -1) : 0;
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.ellipse(cx, cy + 7, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c1c38';   // les jambes
  ctx.fillRect(cx - 10 + pas * 4, cy + 3, 8, 7); ctx.fillRect(cx + 2 - pas * 4, cy + 3, 8, 7);
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(cx - 10 + pas * 4, cy + 8, 8, 3); ctx.fillRect(cx + 2 - pas * 4, cy + 8, 8, 3);
  ctx.fillStyle = teinte(p.couleur, -0.3); ctx.fillRect(cx - 12, cy - 8, 22, 13);
  ctx.fillStyle = p.couleur; ctx.fillRect(cx - 12, cy - 8, 22, 7);
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(cx - 12, cy - 8, 22, 2);
  ctx.fillStyle = '#e0a870'; ctx.fillRect(cx - 4, cy - 16, 11, 9);   // la tête
  ctx.fillStyle = '#c41c1c';   // LE BANDEAU ROUGE
  ctx.fillRect(cx - 6, cy - 17, 15, 4);
  ctx.fillStyle = '#fc5454'; ctx.fillRect(cx - 6, cy - 17, 15, 1);
  ctx.fillStyle = '#c41c1c'; ctx.fillRect(cx - 10, cy - 16 + pas * 2, 4, 7);   // les nœuds qui volent
  ctx.fillStyle = '#38281c'; ctx.fillRect(cx - 5, cy - 12, 13, 3);   // les cheveux sous le bandeau
  ctx.fillStyle = '#0a0a14'; ctx.fillRect(cx + 3, cy - 12, 2, 2);   // l'œil
}

// BEUFA EN PERSONNE : le costaud, casquette vissée sur la tête, écusson « B » doré,
// bras croisés, barbe — il passe dans la cinématique.
export function BEUFA_NES(ctx, w, h, p) {
  const cx = w / 2, cy = h / 2;
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.ellipse(cx, cy + 8, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c1c14';
  ctx.fillRect(cx - 16, cy + 4, 12, 9); ctx.fillRect(cx + 4, cy + 4, 12, 9);
  ctx.fillStyle = teinte(p.couleur, -0.4); ctx.fillRect(cx - 20, cy - 12, 40, 18);   // le torse, large
  ctx.fillStyle = p.couleur; ctx.fillRect(cx - 20, cy - 12, 40, 9);
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(cx - 20, cy - 12, 40, 4);
  ctx.fillStyle = '#e0a870';   // les poings des bras croisés
  ctx.fillRect(cx - 8, cy - 4, 6, 6); ctx.fillRect(cx + 3, cy - 4, 6, 6);
  ctx.fillStyle = '#e0a870'; ctx.fillRect(cx - 7, cy - 26, 17, 13);   // la tête
  ctx.fillStyle = '#38281c'; ctx.fillRect(cx - 7, cy - 15, 17, 5);   // LA BARBE
  ctx.fillStyle = '#38281c'; ctx.fillRect(cx - 6, cy - 17, 15, 3);
  ctx.fillStyle = '#0a0a14'; ctx.fillRect(cx - 10, cy - 31, 23, 7);   // la casquette
  ctx.fillStyle = teinte('#38281c', 0.4); ctx.fillRect(cx - 10, cy - 31, 23, 3);
  ctx.fillStyle = '#0a0a14'; ctx.fillRect(cx - 11, cy - 25, 25, 2);   // la visière
  ctx.fillStyle = '#fce054'; ctx.fillRect(cx - 1, cy - 29, 5, 5);   // l'écusson « B » doré
  ctx.fillStyle = '#0a0a14'; ctx.fillRect(cx + 2, cy - 21, 3, 3);   // l'œil
}

// LA PIERRE DE DIVERSION : un galet avec son reflet.
export function PIERRE_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.3); ctx.fillRect(1, 3, w - 2, h - 5);
  ctx.fillStyle = p.couleur; ctx.fillRect(1, 2, w - 3, h - 6);
  ctx.fillStyle = teinte(p.couleur, 0.35); ctx.fillRect(2, 2, w - 6, 2);
  ctx.strokeStyle = '#0a0a14'; ctx.lineWidth = 1; ctx.strokeRect(1, 2, w - 2, h - 4);
}
