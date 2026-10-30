// =====================================================================
// DESSINS DE BEUFA façon METAL GEAR — PIXEL ART 16 bits (SNES, ~1994).
// Le rendu se fait en petit (pixel: 2 du manifeste), les couleurs sont
// quantifiées par le moteur, puis on agrandit sans lisser.
//
// LE STYLE SNES (demande de Fabien : « en style SNES plutôt que NES ») :
//  - des RAMPS DE 3-4 TONS par matériau (le NÉS se contentait de 2) ;
//  - des TRANSITIONS EN TRAME — le damier 2 px, LA signature 16 bits —
//    entre deux tons, au lieu de bords francs partout ;
//  - des CONTOURS TEINTÉS : le bleu nuit profond #00001c au lieu du noir
//    pur épais, et des sillons en biseau (arête claire + ombre) ;
//  - plus de détails fins : grain, reflets, rivets, chanbord des nervures.
//
// TOUJOURS LES DEUX LEÇS DES VERSIONS PRÉCÉDENTES (rendu « moche ») :
//  1. COULEURS « SUR LA GRILLE » : le moteur quantifie les canaux par 28 —
//     on choisit des valeurs déjà multiples de 28 (0, 28, 56, 84…), sinon
//     le bleu de la nuit glisse vers un gris boueux au rendu ;
//  2. COUTURES : les carreaux pavés (sol, route, murs) sont dessinés SANS
//     bord sur les côtés qui se juxtaposent — sinon doubles lignes au pavage.
// Tout est tourné vers la DROITE (la scène fait le reste).
// =====================================================================
import { teinte, hasard } from '../../core/dessins.js';

// LA TRAME 16 bits : un damier de pas 2 — la transition douce entre deux tons.
function trame(ctx, x, y, l, h, couleur) {
  ctx.fillStyle = couleur;
  for (let yy = 0; yy < h; yy += 2) for (let xx = 0; xx < l; xx += 2)
    if ((((x + xx) / 2 + (y + yy) / 2) % 2) === 0) ctx.fillRect(x + xx, y + yy, 2, 2);
}

// LE SOL (carreau de 128, pavé sur tout l'écran) : nuit bleutée, dalles de 32 —
// joints en SILLON biseauté (arête claire + ombre : du relief, plus de lignes
// plates), traces d'usure en trame. Damier calme, pas bruité.
export function DALLE_NES(ctx, w, h, p) {
  ctx.fillStyle = '#1c1c38'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1c1c54';
  for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) if (((x / 32 + y / 32) % 2) === 0) ctx.fillRect(x, y, 32, 32);
  for (let k = 32; k < w; k += 32) {   // joints verticaux : le sillon biseauté
    ctx.fillStyle = '#545470'; ctx.fillRect(k - 2, 0, 2, h);
    ctx.fillStyle = '#00001c'; ctx.fillRect(k, 0, 2, h);
  }
  for (let k = 32; k < h; k += 32) {   // joints horizontaux : pareil
    ctx.fillStyle = '#545470'; ctx.fillRect(0, k - 2, w, 2);
    ctx.fillStyle = '#00001c'; ctx.fillRect(0, k, w, 2);
  }
  const alea = hasard(11);
  ctx.fillStyle = '#00001c';   // éclats sombres : le béton a vécu
  for (let k = 0; k < 5; k++) {
    const x = Math.floor(alea() * 3) * 32 + 6 + Math.floor(alea() * 14);
    const y = Math.floor(alea() * 3) * 32 + 6 + Math.floor(alea() * 14);
    ctx.fillRect(x, y, 6, 3); ctx.fillRect(x + 9, y + 4, 3, 2);
  }
  trame(ctx, 44, 76, 14, 10, '#00001c');   // deux plaques d'usure, en trame 16 bits
  trame(ctx, 12, 20, 10, 8, '#00001c');
  ctx.fillStyle = '#70708c';   // les gravats clairs
  for (let k = 0; k < 3; k++) ctx.fillRect(Math.floor(alea() * 3) * 32 + 10, Math.floor(alea() * 3) * 32 + 10, 3, 3);
  ctx.fillStyle = '#8c8ca8';   // leurs éclats
  for (let k = 0; k < 2; k++) ctx.fillRect(Math.floor(alea() * 3) * 32 + 14, Math.floor(alea() * 3) * 32 + 12, 2, 2);
}

// LA ROUTE (carreau 128, pavé en bande verticale de 70 px) : asphalte à TROIS
// tons (base, granulats clairs, cavités sombres), plaques d'usure en trame,
// lignes de bord à chant éclairé, pointillé à cœur lumineux.
export function ROUTE_NES(ctx, w, h, p) {
  ctx.fillStyle = '#1c1c1c'; ctx.fillRect(0, 0, w, h);
  const alea = hasard(11);
  ctx.fillStyle = '#383838';   // les granulats clairs de l'asphalte
  for (let k = 0; k < 30; k++) ctx.fillRect(Math.floor(alea() * 32) * 4, Math.floor(alea() * 32) * 4, 3, 3);
  ctx.fillStyle = '#00001c';   // les cavités sombres
  for (let k = 0; k < 14; k++) ctx.fillRect(Math.floor(alea() * 32) * 4, Math.floor(alea() * 32) * 4, 3, 2);
  trame(ctx, 20, 40, 24, 14, '#00001c');   // une plaque usée, foncée, en trame
  trame(ctx, 76, 96, 28, 12, '#383838');   // un rustine de réparateur, claire
  ctx.fillStyle = '#8c8c8c';   // les lignes de bord — ton repos, un peu sale
  ctx.fillRect(0, 0, 4, h); ctx.fillRect(66, 0, 4, h);
  ctx.fillStyle = '#c4c4c4';   // leur chant éclairé
  ctx.fillRect(1, 0, 2, h); ctx.fillRect(67, 0, 2, h);
  ctx.fillStyle = '#e0e0e0';   // le pointillé central — répété à chaque carreau → régulier
  ctx.fillRect(33, 8, 4, 44);
  ctx.fillStyle = '#fcfcfc'; ctx.fillRect(34, 8, 2, 44);   // son cœur lumineux
}

// UN MUR HORIZONTAL (bande 64 x 20, pavée le long des murs) : chapeau éclairé
// à 3 tons + raccord en TRAME vers la face sombre — le volume 16 bits. Le
// joint de panneaux tombe PILE au bord du carreau, aucun contour latéral.
export function MUR_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.55); ctx.fillRect(0, 8, w, h - 8);   // la face avant, sombre
  ctx.fillStyle = '#383838'; ctx.fillRect(0, 8, w, 2);                     // l'arête d'ombre du chapeau
  trame(ctx, 0, 10, w, 4, teinte(p.couleur, -0.3));                        // le raccord chapeau→face EN TRAME
  ctx.fillStyle = p.couleur; ctx.fillRect(0, 2, w, 6);                     // le chapeau
  ctx.fillStyle = teinte(p.couleur, 0.4); ctx.fillRect(0, 2, w, 2);        // rim light
  ctx.fillStyle = teinte(p.couleur, 0.6); ctx.fillRect(0, 2, w, 1);        // l'éclat du bord haut
  ctx.fillStyle = '#00001c';   // le joint de panneau, au bord (tuilable)
  ctx.fillRect(0, 8, 2, h - 8);
  ctx.fillRect(0, 2, 1, 6);
  ctx.fillStyle = teinte(p.couleur, 0.25); ctx.fillRect(1, 2, 2, 6);       // le chant éclairé du joint
  ctx.fillStyle = '#00001c'; ctx.fillRect(0, 0, w, 2); ctx.fillRect(0, h - 2, w, 2);   // contours haut/bas seulement
}

// LA MÊME BANDE, VERTICALE (murs de gauche/droite) — même logique, joints horizontaux.
export function MUR_NES_V(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.55); ctx.fillRect(8, 0, w - 8, h);
  ctx.fillStyle = '#383838'; ctx.fillRect(8, 0, 2, h);
  trame(ctx, 10, 0, 4, h, teinte(p.couleur, -0.3));
  ctx.fillStyle = p.couleur; ctx.fillRect(2, 0, 6, h);
  ctx.fillStyle = teinte(p.couleur, 0.4); ctx.fillRect(2, 0, 2, h);
  ctx.fillStyle = teinte(p.couleur, 0.6); ctx.fillRect(2, 0, 1, h);
  ctx.fillStyle = '#00001c';
  ctx.fillRect(8, 0, w - 8, 2);
  ctx.fillRect(2, 0, 6, 1);
  ctx.fillStyle = teinte(p.couleur, 0.25); ctx.fillRect(2, 1, 6, 2);
  ctx.fillStyle = '#00001c'; ctx.fillRect(0, 0, 2, h); ctx.fillRect(w - 2, 0, 2, h);
}

// UN CONTENEUR DE CARGAISON (140 x 52) : LA grande couverture de la base.
// SNES : ramp 4 tons + raccord en trame, nervures à CHANBORD (chant éclairé +
// ombre portée de la nervure), contour teinté. Rouge rouille ou vert olive.
export function CONTENEUR_NES(ctx, w, h, p) {
  ctx.fillStyle = '#1c1c1c';   // l'ombre : le conteneur POSE lourdement sur le sol
  ctx.beginPath(); ctx.ellipse(w / 2, h - 5, w / 2 - 8, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = teinte(p.couleur, -0.45); ctx.fillRect(3, h - 18, w - 6, 15);   // face avant
  trame(ctx, 3, h - 18, w - 6, 4, teinte(p.couleur, -0.2));                        // raccord chapeau→face en trame
  ctx.fillStyle = p.couleur; ctx.fillRect(3, 3, w - 6, h - 20);                   // chapeau
  trame(ctx, 3, h - 24, w - 6, 4, teinte(p.couleur, -0.15));                       // le chapeau fond vers la face
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(3, 3, w - 6, 4);           // rim light
  ctx.fillStyle = teinte(p.couleur, 0.5); ctx.fillRect(3, 3, w - 6, 2);           // l'éclat haut
  for (let x = 12; x < w - 30; x += 12) {   // les nervures ondulées, À CHANBORD
    ctx.fillStyle = teinte(p.couleur, -0.25); ctx.fillRect(x, 9, 4, h - 26);   // le corps
    ctx.fillStyle = teinte(p.couleur, 0.15); ctx.fillRect(x, 9, 1, h - 26);     // le chant éclairé (gauche)
    ctx.fillStyle = teinte(p.couleur, -0.4); ctx.fillRect(x + 3, 9, 1, h - 26); // l'ombre de la nervure (droite)
  }
  ctx.fillStyle = teinte(p.couleur, -0.35); ctx.fillRect(w - 26, h - 18, 22, 13);   // le bout : les PORTES
  trame(ctx, w - 26, h - 18, 22, 3, teinte(p.couleur, -0.15));                      // leur raccord en trame
  ctx.fillStyle = '#00001c'; ctx.fillRect(w - 20, 5, 2, h - 18); ctx.fillRect(w - 13, 5, 2, h - 18);   // les verrous
  ctx.fillStyle = '#8c8c8c';   // les tiges de verrouillage, éclairées
  ctx.fillRect(w - 20, 6, 2, 2); ctx.fillRect(w - 13, 6, 2, 2);
  ctx.fillStyle = '#545454'; ctx.fillRect(3, 3, 7, h - 6); ctx.fillRect(w - 10, 3, 7, h - 6);   // coins de fonte
  ctx.fillStyle = '#8c8c8c'; ctx.fillRect(3, 3, 7, 2); ctx.fillRect(w - 10, 3, 7, 2);           // leur éclat
  ctx.fillStyle = '#a8a8a8';
  for (const y of [6, h - 10]) { ctx.fillRect(5, y, 3, 3); ctx.fillRect(w - 12, y, 3, 3); }   // rivets
  ctx.strokeStyle = '#00001c'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
}

// UNE CAISSE EN BOIS (64 x 64), en VOLUME : ombre portée, chapeau clair à 3 tons,
// planches biseautées (trait d'ombre + chant de lumière), sangles métalliques
// 3 tons, rivets. Chaude sur le sol froid.
export function CAISSE_NES(ctx, w, h, p) {
  ctx.fillStyle = '#1c1c1c';   // l'ombre : la caisse POSE sur le sol
  ctx.beginPath(); ctx.ellipse(w / 2, h - 5, w / 2 - 4, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = teinte(p.couleur, -0.45); ctx.fillRect(3, h - 18, w - 6, 15);   // face avant
  trame(ctx, 3, h - 18, w - 6, 4, teinte(p.couleur, -0.2));                        // raccord en trame
  ctx.fillStyle = p.couleur; ctx.fillRect(3, 3, w - 6, h - 20);                   // chapeau
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(3, 3, w - 6, 3);           // rim light
  ctx.fillStyle = teinte(p.couleur, 0.5); ctx.fillRect(3, 3, w - 6, 1);           // l'éclat
  for (let y = 9; y < h - 20; y += 7) {   // les planches du chapeau, biseautées
    ctx.fillStyle = teinte(p.couleur, -0.25); ctx.fillRect(4, y, w - 8, 2);     // le trait d'ombre
    ctx.fillStyle = teinte(p.couleur, 0.15); ctx.fillRect(4, y - 1, w - 8, 1);     // le chant de lumière
  }
  ctx.fillStyle = '#383838'; ctx.fillRect(3, 3, 4, h - 6); ctx.fillRect(w - 7, 3, 4, h - 6);   // sangles
  ctx.fillStyle = '#545454'; ctx.fillRect(4, 4, 2, h - 8); ctx.fillRect(w - 6, 4, 2, h - 8);   // leur cœur
  ctx.fillStyle = '#8c8c8c';   // les rivets, avec leur éclat
  for (const [x, y] of [[4, 5], [w - 8, 5], [4, h - 21], [w - 8, h - 21]]) { ctx.fillRect(x, y, 2, 2); ctx.fillRect(x, y, 1, 1); }
  ctx.strokeStyle = '#00001c'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
}

// LE POSTE DE CONTRÔLE : SACS DE SABLE empilés (64 x 44). SNES : chaque sac a
// son biseau (chant de lumière + trait d'ombre) et les rangées se raccordent
// en TRAME — des volumes ronds, pas des rectangles plats.
export function SACS_NES(ctx, w, h, p) {
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.ellipse(w / 2, h - 4, w / 2 - 4, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = teinte(p.couleur, -0.35); ctx.fillRect(2, h - 16, w - 4, 13);   // la rangée du bas, à l'ombre
  trame(ctx, 2, h - 16, w - 4, 4, p.couleur);                                      // raccord des rangées en trame
  ctx.fillStyle = p.couleur; ctx.fillRect(2, 2, w - 4, h - 17);                   // la rangée du haut
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(2, 2, w - 4, 3);           // rim light
  ctx.strokeStyle = teinte(p.couleur, -0.5); ctx.lineWidth = 1;   // chaque sac, dessiné un à un
  for (let x = 10; x < w - 4; x += 12) {
    ctx.strokeRect(x - 5, 3, 11, h - 20);
    ctx.fillStyle = teinte(p.couleur, 0.2); ctx.fillRect(x - 4, 4, 9, 2);         // le chant de lumière du sac
    ctx.fillStyle = teinte(p.couleur, -0.3); ctx.fillRect(x - 4, h - 20, 9, 2);   // son ombre basse
  }
  ctx.strokeStyle = teinte(p.couleur, -0.4); ctx.lineWidth = 1;   // les coutures du bas, en pointillé
  for (let x = 16; x < w - 6; x += 12) { ctx.beginPath(); ctx.moveTo(x - 5, h - 19); ctx.lineTo(x + 6, h - 19); ctx.stroke(); }
  ctx.strokeStyle = '#00001c'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
}

// LA TABLE À CARTES (140 x 90) : le cœur du QG — cadre de bois biseauté, feutre,
// une carte d'état-major : terres à DEUX tons avec côtes soulignées, LE FRONT en
// pointillés rouges, les axes d'attaque bleus, les unités en blanc.
export function TABLE_NES(ctx, w, h, p) {
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.ellipse(w / 2, h - 5, w / 2 - 6, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#705438'; ctx.fillRect(3, 3, w - 6, h - 6);   // le cadre de bois
  ctx.fillStyle = teinte('#705438', 0.3); ctx.fillRect(3, 3, w - 6, 3);   // son chant éclairé
  ctx.fillStyle = teinte('#705438', -0.3); ctx.fillRect(3, h - 6, w - 6, 3);   // son ombre basse
  ctx.fillStyle = p.couleur; ctx.fillRect(8, 8, w - 16, h - 16);   // le feutre à carte
  ctx.fillStyle = '#8c7054';   // une terre, ton clair
  ctx.beginPath(); ctx.moveTo(20, h - 14); ctx.lineTo(60, 22); ctx.lineTo(96, 40); ctx.lineTo(70, h - 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#70543c';   // une autre, ton sombre
  ctx.beginPath(); ctx.moveTo(96, h - 22); ctx.lineTo(w - 16, h - 34); ctx.lineTo(w - 22, 30); ctx.lineTo(104, 34); ctx.closePath(); ctx.fill();
  trame(ctx, 96, 34, 12, 14, '#8c7054');   // le raccord des deux terres, en trame
  ctx.strokeStyle = '#54381c'; ctx.lineWidth = 1;   // les côtes, soulignées
  ctx.beginPath(); ctx.moveTo(20, h - 14); ctx.lineTo(60, 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(96, h - 22); ctx.lineTo(w - 22, 30); ctx.stroke();
  ctx.strokeStyle = '#c41c1c'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);   // LE FRONT, en pointillés rouges
  ctx.beginPath(); ctx.moveTo(14, h / 2 + 6); ctx.bezierCurveTo(50, 18, 84, h - 18, w - 12, h / 2 - 4); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#fc5454';   // les jalons du front
  ctx.fillRect(14, h / 2 + 4, 3, 3); ctx.fillRect(w - 14, h / 2 - 6, 3, 3);
  ctx.strokeStyle = '#3870a8'; ctx.lineWidth = 2;   // les axes d'attaque, flèches bleues
  ctx.beginPath(); ctx.moveTo(30, h - 16); ctx.lineTo(70, 34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(70, 34); ctx.lineTo(63, 44); ctx.moveTo(70, 34); ctx.lineTo(80, 40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - 26, h - 14); ctx.lineTo(102, 52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(102, 52); ctx.lineTo(112, 50); ctx.moveTo(102, 52); ctx.lineTo(108, 60); ctx.stroke();
  ctx.fillStyle = '#fcfcfc'; ctx.fillRect(52, 34, 5, 4); ctx.fillRect(84, h - 30, 5, 4);   // les unités
  ctx.fillStyle = '#a8a8a8'; ctx.fillRect(53, 38, 5, 1); ctx.fillRect(85, h - 26, 5, 1);   // leur petite ombre
  ctx.strokeStyle = '#00001c'; ctx.lineWidth = 2; ctx.strokeRect(3, 3, w - 6, h - 6);
}

// LA TOUR-PROJECTEUR AU BORD DE L'ÉCRAN (36 x 36) : un nid sur le mur, projecteur
// pointé vers la pièce — dessiné face à la DROITE, la scène le tourne vers sa
// cible. SNES : boîtier métallique à 3 tons avec raccord en trame, lampe à
// cœurs concentriques (blanc → jaune → ambre en trame).
export function PROJECTEUR_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.5); ctx.fillRect(4, 8, w - 10, h - 12);   // le socle sur le mur
  trame(ctx, 4, 8, w - 10, 4, teinte(p.couleur, -0.25));                        // son raccord en trame
  ctx.fillStyle = p.couleur; ctx.fillRect(4, 8, w - 10, h - 24);
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(4, 8, w - 10, 4);
  ctx.fillStyle = teinte(p.couleur, 0.5); ctx.fillRect(4, 8, w - 10, 1);
  ctx.strokeStyle = '#00001c'; ctx.lineWidth = 2; ctx.strokeRect(4, 8, w - 10, h - 12);
  ctx.fillStyle = '#00001c'; ctx.fillRect(w - 22, h / 2 - 3, 6, 6);   // le support
  ctx.fillStyle = '#383838'; ctx.fillRect(w - 17, h / 2 - 8, 13, 16);   // le boîtier
  ctx.fillStyle = '#545454'; ctx.fillRect(w - 17, h / 2 - 8, 13, 7);   // sa face éclairée
  trame(ctx, w - 17, h / 2 + 1, 13, 4, '#70708c');   // le raccord métallique en trame
  ctx.fillStyle = '#e0a81c'; ctx.fillRect(w - 12, h / 2 - 6, 8, 12);   // la lampe : l'ambre extérieur
  ctx.fillStyle = '#fce054'; ctx.fillRect(w - 11, h / 2 - 6, 7, 12);   // le jaune
  ctx.fillStyle = '#fcfcfc'; ctx.fillRect(w - 10, h / 2 - 4, 5, 8);   // le cœur, blanc chaud
}

// UNE PORTE BLINDÉE : ouverte (bande de chantier jaune/noire + LED verte = la
// sortie) ou verrouillée (LED rouge). SNES : bande biseautée, LED à halo en
// trame. Le contour reste teinté, pas noir pur.
export function PORTE_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.5); ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = p.couleur; ctx.fillRect(1, 1, w - 2, h - 4);
  ctx.fillStyle = teinte(p.couleur, 0.35); ctx.fillRect(1, 1, w - 2, 3);
  ctx.fillStyle = teinte(p.couleur, 0.55); ctx.fillRect(1, 1, w - 2, 1);
  ctx.strokeStyle = '#00001c'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = '#a8a8a8';
  for (const x of [5, w - 8]) { ctx.fillRect(x, 4, 2, 2); ctx.fillRect(x, h - 8, 2, 2); }
  if (p.ouverte) {
    ctx.fillStyle = '#fce054'; ctx.fillRect(4, h / 2 - 3, w - 8, 6);   // ÇA SORT PAR ICI
    ctx.fillStyle = '#c4a81c'; ctx.fillRect(4, h / 2 + 2, w - 8, 1);   // l'ombre basse de la bande
    ctx.fillStyle = '#fcfce0'; ctx.fillRect(5, h / 2 - 3, w - 10, 1);   // son chant éclairé
    ctx.fillStyle = '#00001c';
    for (let x = 5; x < w - 10; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, h / 2 + 3); ctx.lineTo(x + 3, h / 2 - 3); ctx.lineTo(x + 6, h / 2 - 3); ctx.lineTo(x + 3, h / 2 + 3);
      ctx.fill();
    }
    ctx.fillStyle = '#1c541c'; ctx.fillRect(w - 14, 3, 8, 8);   // la LED
    trame(ctx, w - 15, 2, 10, 10, '#1c8c38');                  // son halo vert, en trame
    ctx.fillStyle = '#38fc38'; ctx.fillRect(w - 13, 5, 6, 4);
    ctx.fillStyle = '#c4fc70'; ctx.fillRect(w - 13, 5, 3, 2);  // l'éclat de la LED
  } else {
    ctx.fillStyle = '#541c1c'; ctx.fillRect(w - 14, 3, 8, 8);   // la LED
    trame(ctx, w - 15, 2, 10, 10, '#8c1c1c');                  // son halo rouge, en trame
    ctx.fillStyle = '#fc3838'; ctx.fillRect(w - 13, 5, 6, 4);
    ctx.fillStyle = '#fc8c70'; ctx.fillRect(w - 13, 5, 3, 2);  // l'éclat de la LED
    ctx.fillStyle = '#545454'; ctx.fillRect(w / 2 - 7, h / 2 - 1, 14, 3);   // la poignée
    ctx.fillStyle = '#8c8c8c'; ctx.fillRect(w / 2 - 7, h / 2 - 1, 14, 1);    // son chant éclairé
  }
}

// UN GARDE, tourné vers la DROITE : ombre, uniforme olive à 3 tons avec raccord
// en trame, harnais, casquette biseautée, fusil tenu devant — 2 frames de
// marche (les jambes alternent, le fusil tangue d'un pixel).
export function GARDE_NES(ctx, w, h, p, { i, n }) {
  const cx = w / 2, cy = h / 2;
  const pas = n > 1 ? (i === 0 ? 1 : -1) : 0;
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.ellipse(cx, cy + 7, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c381c';   // les bottes (alternées : ça MARCHE)
  ctx.fillRect(cx - 10 + pas * 4, cy + 3, 8, 7); ctx.fillRect(cx + 2 - pas * 4, cy + 3, 8, 7);
  ctx.fillStyle = '#00001c';
  ctx.fillRect(cx - 10 + pas * 4, cy + 8, 8, 3); ctx.fillRect(cx + 2 - pas * 4, cy + 8, 8, 3);
  ctx.fillStyle = teinte(p.couleur, -0.3); ctx.fillRect(cx - 12, cy - 8, 22, 13);   // le torse, face sombre
  trame(ctx, cx - 12, cy + 1, 22, 4, p.couleur);                                    // raccord en trame
  ctx.fillStyle = p.couleur; ctx.fillRect(cx - 12, cy - 8, 22, 6);                 // le dos éclairé
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(cx - 12, cy - 8, 22, 2);    // rim light
  ctx.fillStyle = teinte(p.couleur, 0.5); ctx.fillRect(cx - 12, cy - 8, 22, 1);    // l'éclat
  ctx.fillStyle = teinte(p.couleur, -0.45); ctx.fillRect(cx - 3, cy - 8, 2, 13);   // la sangle du harnais
  ctx.fillRect(cx + 5, cy - 8, 2, 13);
  ctx.fillStyle = p.couleur; ctx.fillRect(cx + 1, cy - 6, 9, 6);   // l'épaule avant
  ctx.fillStyle = teinte(p.couleur, 0.2); ctx.fillRect(cx + 1, cy - 6, 9, 2);
  ctx.fillStyle = '#1c1c1c'; ctx.fillRect(cx + 2, cy - 3 + pas, 15, 4);   // le fusil
  ctx.fillStyle = '#545454'; ctx.fillRect(cx + 2, cy - 3 + pas, 15, 2);
  ctx.fillStyle = '#00001c'; ctx.fillRect(cx + 15, cy - 3 + pas, 3, 4);   // le canon
  ctx.fillStyle = '#e0a870'; ctx.fillRect(cx - 4, cy - 16, 11, 9);   // la tête
  ctx.fillStyle = '#c48c54'; ctx.fillRect(cx - 4, cy - 10, 11, 3);   // son ombre basse (le cou)
  ctx.fillStyle = '#1c381c'; ctx.fillRect(cx - 6, cy - 19, 15, 5);   // la casquette
  ctx.fillStyle = teinte('#1c381c', 0.35); ctx.fillRect(cx - 6, cy - 19, 15, 2);   // son chant éclairé
  ctx.fillStyle = teinte('#1c381c', 0.55); ctx.fillRect(cx - 6, cy - 19, 15, 1);  // l'éclat
  ctx.fillStyle = '#00001c'; ctx.fillRect(cx - 7, cy - 17, 3, 2);   // le pont de la casquette
  ctx.fillStyle = '#00001c'; ctx.fillRect(cx + 3, cy - 12, 2, 2);   // l'œil
}

// LE HÉROS INFILTRATEUR, tourné vers la DROITE : combinaison bleu nuit à 3 tons
// avec raccord en trame, BANDEAU ROUGE (comme Snake) dont les nœuds flottent
// derrière, 2 frames de marche.
export function HEROS_NES(ctx, w, h, p, { i, n }) {
  const cx = w / 2, cy = h / 2;
  const pas = n > 1 ? (i === 0 ? 1 : -1) : 0;
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.ellipse(cx, cy + 7, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c1c38';   // les jambes
  ctx.fillRect(cx - 10 + pas * 4, cy + 3, 8, 7); ctx.fillRect(cx + 2 - pas * 4, cy + 3, 8, 7);
  ctx.fillStyle = '#00001c';
  ctx.fillRect(cx - 10 + pas * 4, cy + 8, 8, 3); ctx.fillRect(cx + 2 - pas * 4, cy + 8, 8, 3);
  ctx.fillStyle = teinte(p.couleur, -0.3); ctx.fillRect(cx - 12, cy - 8, 22, 13);
  trame(ctx, cx - 12, cy + 1, 22, 4, p.couleur);
  ctx.fillStyle = p.couleur; ctx.fillRect(cx - 12, cy - 8, 22, 7);
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(cx - 12, cy - 8, 22, 2);
  ctx.fillStyle = teinte(p.couleur, 0.5); ctx.fillRect(cx - 12, cy - 8, 22, 1);
  ctx.fillStyle = teinte(p.couleur, -0.45); ctx.fillRect(cx - 3, cy - 8, 2, 13);   // les sangles du harnais
  ctx.fillRect(cx + 5, cy - 8, 2, 13);
  ctx.fillStyle = '#e0a870'; ctx.fillRect(cx - 4, cy - 16, 11, 9);   // la tête
  ctx.fillStyle = '#c48c54'; ctx.fillRect(cx - 4, cy - 10, 11, 3);   // son ombre basse (le cou)
  ctx.fillStyle = '#c41c1c';   // LE BANDEAU ROUGE, à 3 tons
  ctx.fillRect(cx - 6, cy - 17, 15, 4);
  ctx.fillStyle = '#fc5454'; ctx.fillRect(cx - 6, cy - 17, 15, 1);   // son éclat
  ctx.fillStyle = '#8c1c1c'; ctx.fillRect(cx - 6, cy - 14, 15, 1);   // son ombre
  ctx.fillStyle = '#c41c1c'; ctx.fillRect(cx - 10, cy - 16 + pas * 2, 4, 7);   // les nœuds qui volent
  ctx.fillStyle = '#fc5454'; ctx.fillRect(cx - 10, cy - 16 + pas * 2, 4, 1);
  ctx.fillStyle = '#38281c'; ctx.fillRect(cx - 5, cy - 12, 13, 3);   // les cheveux sous le bandeau
  ctx.fillStyle = '#00001c'; ctx.fillRect(cx + 3, cy - 12, 2, 2);   // l'œil
}

// BEUFA EN PERSONNE : le costaud, casquette vissée sur la tête, écusson « B »
// doré qui brille, bras croisés, barbe à deux tons — il passe dans la
// cinématique. Ramp 4 tons + raccord en trame, comme un vrai boss 16 bits.
export function BEUFA_NES(ctx, w, h, p) {
  const cx = w / 2, cy = h / 2;
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.ellipse(cx, cy + 8, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c1c14';
  ctx.fillRect(cx - 16, cy + 4, 12, 9); ctx.fillRect(cx + 4, cy + 4, 12, 9);
  ctx.fillStyle = teinte(p.couleur, -0.4); ctx.fillRect(cx - 20, cy - 12, 40, 18);   // le torse, large
  trame(ctx, cx - 20, cy + 1, 40, 5, p.couleur);                                     // raccord en trame
  ctx.fillStyle = p.couleur; ctx.fillRect(cx - 20, cy - 12, 40, 9);
  ctx.fillStyle = teinte(p.couleur, 0.3); ctx.fillRect(cx - 20, cy - 12, 40, 4);
  ctx.fillStyle = teinte(p.couleur, 0.5); ctx.fillRect(cx - 20, cy - 12, 40, 1);   // l'éclat
  ctx.fillStyle = '#e0a870';   // les poings des bras croisés
  ctx.fillRect(cx - 8, cy - 4, 6, 6); ctx.fillRect(cx + 3, cy - 4, 6, 6);
  ctx.fillStyle = '#c48c54'; ctx.fillRect(cx - 8, cy, 6, 2); ctx.fillRect(cx + 3, cy, 6, 2);   // leurs ombres
  ctx.fillStyle = '#e0a870'; ctx.fillRect(cx - 7, cy - 26, 17, 13);   // la tête
  ctx.fillStyle = '#c48c54'; ctx.fillRect(cx - 7, cy - 16, 17, 3);   // le bas du visage
  ctx.fillStyle = '#38281c'; ctx.fillRect(cx - 7, cy - 15, 17, 5);   // LA BARBE
  ctx.fillStyle = '#54381c'; ctx.fillRect(cx - 7, cy - 15, 17, 1);   // ses reflets
  ctx.fillStyle = '#38281c'; ctx.fillRect(cx - 6, cy - 17, 15, 3);
  ctx.fillStyle = '#00001c'; ctx.fillRect(cx - 10, cy - 31, 23, 7);   // la casquette
  ctx.fillStyle = teinte('#38281c', 0.4); ctx.fillRect(cx - 10, cy - 31, 23, 3);
  ctx.fillStyle = teinte('#38281c', 0.6); ctx.fillRect(cx - 10, cy - 31, 23, 1);
  ctx.fillStyle = '#00001c'; ctx.fillRect(cx - 11, cy - 25, 25, 2);   // la visière
  ctx.fillStyle = '#fce054'; ctx.fillRect(cx - 1, cy - 29, 5, 5);   // l'écusson « B » doré
  ctx.fillStyle = '#fcfc70'; ctx.fillRect(cx - 1, cy - 29, 2, 2);   // il brille
  ctx.fillStyle = '#00001c'; ctx.fillRect(cx + 2, cy - 21, 3, 3);   // l'œil
}

// LA PIERRE DE DIVERSION : un galet à 3 tons, l'ombre basse raccordée en trame.
export function PIERRE_NES(ctx, w, h, p) {
  ctx.fillStyle = teinte(p.couleur, -0.3); ctx.fillRect(1, 3, w - 2, h - 5);
  trame(ctx, 1, h - 5, w - 2, 3, teinte(p.couleur, -0.5));   // son ombre basse, en trame
  ctx.fillStyle = p.couleur; ctx.fillRect(1, 2, w - 3, h - 6);
  ctx.fillStyle = teinte(p.couleur, 0.35); ctx.fillRect(2, 2, w - 6, 2);
  ctx.fillStyle = teinte(p.couleur, 0.55); ctx.fillRect(2, 2, 3, 1);   // l'éclat
  ctx.strokeStyle = teinte(p.couleur, -0.6); ctx.lineWidth = 1; ctx.strokeRect(1, 2, w - 2, h - 4);
}
