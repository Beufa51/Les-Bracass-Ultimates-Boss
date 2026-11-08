// GREG sur téléphone : commandes par GESTES (proposition A, nov. 2026 — voir propositions/greg_maniabilite_mobile.md).
//   Moitié GAUCHE de l'écran = défense : glisser ← / → = esquive ; doigt posé sans bouger = GARDE.
//   Moitié DROITE = attaque : toucher en HAUT = coup au visage, en BAS = coup au corps.
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
  garde: 0.12,         // secondes de doigt immobile pour lever la garde
  bouton: { x: LARGEUR / 2, y: HAUTEUR - 70, r: 58 },   // bouton DEMPSEY
};

// opts.mode() : 'combat' | 'dempsey' | 'frein' | 'tapis' | null (gestes inactifs) ; opts.dempseyPret() : bool
export function installerGestes(scene, opts) {
  const G = GESTES, doigts = new Map();

  // ---- aides à l'écran (discrètes) ----
  const aide = scene.add.graphics().setDepth(38);
  aide.lineStyle(2, 0xffffff, 0.35);
  for (let x = LARGEUR / 2 + 20; x < LARGEUR; x += 24) aide.lineBetween(x, G.ligne, x + 12, G.ligne);   // ligne VISAGE / CORPS
  aide.lineBetween(LARGEUR / 2, 120, LARGEUR / 2, 140); aide.lineBetween(LARGEUR / 2, HAUTEUR - 150, LARGEUR / 2, HAUTEUR - 130);
  const style = { stroke: '#000000', strokeThickness: 4 };
  const etiquettes = [
    texte(scene, LARGEUR - 70, G.ligne - 26, 'VISAGE', 18, '#ffffff', style),
    texte(scene, LARGEUR - 70, G.ligne + 26, 'CORPS', 18, '#5ad1ff', style),
    texte(scene, 130, HAUTEUR - 40, '◀ glisse ▶ : esquive\ndoigt posé : garde', 15, '#ffffff', { ...style, align: 'center' }),
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
  const lacher = (d) => { if (d.minuterie) d.minuterie.remove(); if (d.garde) { envoyer('keyup', 'bas'); d.garde = false; } };
  const bas = (p) => {
    const m = opts.mode(); if (!m) return;
    if (opts.dempseyPret() && Math.hypot(p.x - G.bouton.x, p.y - G.bouton.y) < G.bouton.r + 10) { taper('x'); onde(p.x, p.y, 0xffd84a); return; }
    if (m === 'frein') { taper('bas'); onde(p.x, p.y, 0x7fff7f); return; }
    if (m === 'tapis' || m === 'dempsey') { taper(p.x < LARGEUR / 2 ? 'gauche' : 'droite'); onde(p.x, p.y, 0xffffff); return; }
    if (p.x >= LARGEUR / 2) { taper(p.y < G.ligne ? 'espace' : 'z'); onde(p.x, p.y, p.y < G.ligne ? 0xffffff : 0x5ad1ff); return; }
    const d = { x0: p.x, fait: false, garde: false };
    d.minuterie = scene.time.delayedCall(G.garde * 1000, () => { if (!d.fait && doigts.get(p.id) === d) { d.garde = true; envoyer('keydown', 'bas'); } });
    doigts.set(p.id, d);
  };
  const bouge = (p) => {
    const d = doigts.get(p.id); if (!d || d.fait || !p.isDown) return;
    const dx = p.x - d.x0;
    if (Math.abs(dx) >= G.glisse) {   // esquive (la garde éventuelle est relâchée)
      d.fait = true; lacher(d);
      taper(dx < 0 ? 'gauche' : 'droite'); onde(p.x, p.y, 0xaaffff);
    }
  };
  const haut = (p) => { const d = doigts.get(p.id); if (d) { lacher(d); doigts.delete(p.id); } };
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
    pointercancel: (e) => haut(versJeu(e)),
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
      aide.setAlpha(a); etiquettes.forEach(t => t.setAlpha(a));
      bouton.setVisible(!!opts.dempseyPret()).setScale(1 + Math.sin(scene.time.now / 120) * 0.04);
    },
  };
}
