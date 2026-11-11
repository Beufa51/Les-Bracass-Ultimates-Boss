// GREG sur téléphone : commandes par GESTES (proposition A, nov. 2026 — voir propositions/greg_maniabilite_mobile.md).
//   Moitié GAUCHE de l'écran = défense : glisser ← / → = esquive ; doigt posé sans bouger = GARDE.
//   Moitié DROITE = attaque : toucher n'importe où = coup de poing (nov. 2026 : plus de visage / corps).
//   (nov. 2026, retour Fabien : on peut aussi ESQUIVER en glissant sur la moitié DROITE ; le coup part au lever du doigt
//    ou dès qu'il reste posé G.coup s, donc un glissé n'envoie pas de coup.)
//   Jauge pleine : gros bouton doré DEMPSEY au milieu. Pendant le roll / au tapis : toucher à gauche / à droite.
//   Boule ROUGE du roll (Greg contre) : toucher n'importe où = FREIN.
// Comme les boutons tactiles, chaque geste « appuie » sur une vraie touche du clavier : le combat ne change pas.
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { texte } from '../../core/ui.js';

const TOUCHES = {
  gauche: ['ArrowLeft', 'ArrowLeft', 37], droite: ['ArrowRight', 'ArrowRight', 39], bas: ['ArrowDown', 'ArrowDown', 40],
  espace: [' ', 'Space', 32], z: ['z', 'KeyZ', 90], x: ['x', 'KeyX', 88],
};
function envoyer(type, nom) {
  const [key, code, kc] = TOUCHES[nom];
  const ev = new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'keyCode', { get: () => kc });
  Object.defineProperty(ev, 'which', { get: () => kc });
  window.dispatchEvent(ev);
}
// appui bref : il doit durer quelques images pour que le jeu le « voie »
function taper(nom) { envoyer('keydown', nom); setTimeout(() => envoyer('keyup', nom), 70); }

export const GESTES = {
  ligne: 320,          // hauteur (écran) qui sépare VISAGE (au-dessus) et CORPS (en dessous) : la ceinture de Greg
  glisse: 26,          // pixels à glisser pour une esquive
  glisseGarde: 64,     // ... quand la GARDE est levée : il faut glisser plus franchement (le pouce posé bouge un peu sans le vouloir)
  garde: 0.12,         // secondes de doigt immobile pour lever la garde
  reGarde: 0.25,       // après une esquive au doigt resté posé : attente en plus avant de relever la garde
  coup: 0.09,          // moitié droite : doigt posé sans glisser pendant X s = le coup part (sinon au lever du doigt)
  bouton: { x: LARGEUR / 2, y: HAUTEUR - 70, r: 58 },   // bouton DEMPSEY
};

// opts.mode() : 'combat' | 'dempsey' | 'frein' | 'tapis' | null (gestes inactifs) ; opts.dempseyPret() : bool
export function installerGestes(scene, opts) {
  const G = GESTES, doigts = new Map();

  // ---- aides à l'écran (discrètes) ----
  const aide = scene.add.graphics().setDepth(38);
  // round 1 : les deux moitiés de l'écran se voient (voile très léger)
  const moities = scene.add.graphics().setDepth(37);
  moities.fillStyle(0x5ad1ff, 0.07).fillRect(0, 90, LARGEUR / 2, HAUTEUR - 90);
  moities.fillStyle(0xffd84a, 0.07).fillRect(LARGEUR / 2, 90, LARGEUR / 2, HAUTEUR - 90);
  aide.lineStyle(3, 0xffffff, 0.5);
  aide.lineBetween(LARGEUR / 2, 120, LARGEUR / 2, 140); aide.lineBetween(LARGEUR / 2, HAUTEUR - 150, LARGEUR / 2, HAUTEUR - 130);
  const style = { stroke: '#000000', strokeThickness: 4 };
  const etiquettes = [
    texte(scene, LARGEUR - 150, G.ligne, 'touche : COUP', 22, '#ffffff', style),
    texte(scene, 150, HAUTEUR - 46, '◀ glisse ▶ : ESQUIVE (partout)\ndoigt posé : GARDE', 20, '#ffffff', { ...style, align: 'center' }),
  ].map(t => t.setDepth(38));
  const bouton = scene.add.container(G.bouton.x, G.bouton.y).setDepth(39).setVisible(false);
  const rond = scene.add.graphics();
  rond.fillStyle(0xffd84a, 0.9).fillCircle(0, 0, G.bouton.r).lineStyle(4, 0xb3202c, 1).strokeCircle(0, 0, G.bouton.r);
  bouton.add([rond, texte(scene, 0, 0, 'DEMPSEY\nROLL !', 17, '#1a1014', { align: 'center', fontStyle: 'bold' })]);
  const onde = (x, y, couleur) => {
    const c = scene.add.circle(x, y, 16, couleur, 0.45).setDepth(39);
    scene.tweens.add({ targets: c, scale: 2.4, alpha: 0, duration: 260, onComplete: () => c.destroy() });
  };

  // ---- les doigts ----
  // nb de doigts qui tiennent la garde : on ne relâche la touche que quand le DERNIER se lève
  let gardes = 0;
  const lever = () => { if (gardes++ === 0) envoyer('keydown', 'bas'); };
  const lacher = (d) => {
    if (d.minuterie) d.minuterie.remove();
    if (d.garde) { d.garde = false; if (--gardes <= 0) { gardes = 0; envoyer('keyup', 'bas'); } }
  };
  // garde : doigt immobile G.garde s. Si le combat est figé (encart « ROUND », « BOX ! », « SMASH !! »...), on attend
  // qu'il reprenne au lieu d'oublier le doigt (retour Fabien 11 nov. 2026 : pouce posé d'avance = garde jamais levée).
  const armerGarde = (id, d, delai) => {
    if (d.minuterie) d.minuterie.remove();
    d.minuterie = scene.time.delayedCall(delai, () => {
      if (d.fait || d.garde || doigts.get(id) !== d) return;
      if (opts.mode() === 'combat') { d.garde = true; lever(); } else armerGarde(id, d, 50);
    });
  };
  const bas = (p) => {
    const m = opts.mode();
    if (!m) { if (p.x < LARGEUR / 2) { const d = { x0: p.x, fait: false, garde: false }; doigts.set(p.id, d); armerGarde(p.id, d, G.garde * 1000); } return; }
    if (opts.dempseyPret() && Math.hypot(p.x - G.bouton.x, p.y - G.bouton.y) < G.bouton.r + 10) { taper('x'); onde(p.x, p.y, 0xffd84a); return; }
    if (m === 'frein') { taper('bas'); onde(p.x, p.y, 0x7fff7f); return; }
    if (m === 'tapis' || m === 'dempsey') { taper(p.x < LARGEUR / 2 ? 'gauche' : 'droite'); onde(p.x, p.y, 0xffffff); return; }
    if (p.x >= LARGEUR / 2) {   // attaque : le coup part au lever du doigt ou après G.coup s ; un glissé = esquive
      const d = { x0: p.x, fait: false, garde: false, attaque: true };
      d.frapper = () => { if (d.fait) return; d.fait = true; if (d.minuterie) d.minuterie.remove(); taper('espace'); onde(p.x, p.y, 0xffffff); };
      d.minuterie = scene.time.delayedCall(G.coup * 1000, () => { if (doigts.get(p.id) === d) d.frapper(); });
      doigts.set(p.id, d); return;
    }
    const d = { x0: p.x, fait: false, garde: false };
    doigts.set(p.id, d); armerGarde(p.id, d, G.garde * 1000);
  };
  const bouge = (p) => {
    const d = doigts.get(p.id); if (!d || d.glisse || (d.fait && !d.attaque) || !p.isDown) return;
    if (opts.mode() !== 'combat') return;   // combat figé : pas d'esquive (le doigt reste prêt pour la garde)
    const dx = p.x - d.x0;
    if (Math.abs(dx) >= (d.garde ? G.glisseGarde : G.glisse)) {   // esquive (la garde éventuelle est relâchée ; à droite, elle coupe le coup déjà parti)
      lacher(d);
      taper(dx < 0 ? 'gauche' : 'droite'); onde(p.x, p.y, 0xaaffff);
      if (d.attaque) { d.fait = true; d.glisse = true; return; }
      // doigt de défense resté posé après l'esquive : il pourra glisser à nouveau, ou relever la garde s'il s'arrête
      d.x0 = p.x; armerGarde(p.id, d, G.garde * 1000 + G.reGarde * 1000);
    }
  };
  const haut = (p, annule) => { const d = doigts.get(p.id); if (d) { if (d.attaque && !annule) d.frapper(); lacher(d); doigts.delete(p.id); } };
  // On écoute TOUT l'écran (y compris les bandes noires à gauche / à droite du jeu, là où sont les pouces) ;
  // la position est ramenée en coordonnées du jeu. Les vrais boutons (pause...) gardent leurs touches.
  const versJeu = (e) => {
    const r = scene.game.canvas.getBoundingClientRect();
    return { id: e.pointerId, isDown: true,
      x: Math.max(0, Math.min(LARGEUR - 1, (e.clientX - r.left) * LARGEUR / r.width)),
      y: Math.max(0, Math.min(HAUTEUR - 1, (e.clientY - r.top) * HAUTEUR / r.height)) };
  };
  const surBouton = (e) => e.target && e.target.closest && e.target.closest('button, .pause, [role="button"]');
  const ecoute = {
    pointerdown: (e) => { if (!surBouton(e) && !scene.sys.isPaused()) { bas(versJeu(e)); } },
    pointermove: (e) => bouge(versJeu(e)),
    pointerup: (e) => haut(versJeu(e)),
    pointercancel: (e) => haut(versJeu(e), true),
    // doigt posé longtemps = « appui long » du téléphone (menu, loupe, sélection) : il annulait le doigt et lâchait la garde
    contextmenu: (e) => e.preventDefault(),
    selectstart: (e) => e.preventDefault(),
  };
  for (const [n, f] of Object.entries(ecoute)) window.addEventListener(n, f);
  scene.events.once('shutdown', () => {
    for (const d of doigts.values()) lacher(d);
    doigts.clear();
    for (const [n, f] of Object.entries(ecoute)) window.removeEventListener(n, f);
  });

  // à appeler à chaque image : aides visibles en combat (bien visibles au round 1, discrètes ensuite), bouton Dempsey
  return {
    maj(round) {
      const m = opts.mode(), combat = m === 'combat';
      const a = combat ? (round === 1 ? 0.85 : 0.35) : 0;
      aide.setAlpha(a); etiquettes.forEach(t => t.setAlpha(a)); moities.setAlpha(combat && round === 1 ? 1 : 0);
      bouton.setVisible(!!opts.dempseyPret()).setScale(1 + Math.sin(scene.time.now / 120) * 0.04);
    },
  };
}
