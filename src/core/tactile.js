// Boutons tactiles pour smartphone / tablette.
// Chaque bouton "appuie" sur une vraie touche du clavier (flèches, Espace, Z, X) :
// le reste du jeu n'a donc rien à changer, il lit le clavier comme d'habitude.
// Les boutons n'apparaissent que sur un écran tactile.

const TOUCHES = {
  haut:   { key: 'ArrowUp',    code: 'ArrowUp',    keyCode: 38, texte: '▲' },
  bas:    { key: 'ArrowDown',  code: 'ArrowDown',  keyCode: 40, texte: '▼' },
  gauche: { key: 'ArrowLeft',  code: 'ArrowLeft',  keyCode: 37, texte: '◀' },
  droite: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, texte: '▶' },
  espace: { key: ' ',          code: 'Space',      keyCode: 32, texte: 'Espace' },
  z:      { key: 'z',          code: 'KeyZ',       keyCode: 90, texte: 'Z' },
  x:      { key: 'x',          code: 'KeyX',       keyCode: 88, texte: 'X' },
};

const boutons = {};
const DUREE_MINI = 70;   // millisecondes

export function estTactile() {
  return window.matchMedia && window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
}

function envoyer(type, t) {
  const ev = new KeyboardEvent(type, { key: t.key, code: t.code, bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'keyCode', { get: () => t.keyCode });
  Object.defineProperty(ev, 'which', { get: () => t.keyCode });
  window.dispatchEvent(ev);
}

export function installerTactile() {
  if (!estTactile()) return;
  const style = document.createElement('style');
  style.textContent = `
    .tactile { position: fixed; bottom: 12px; display: grid; gap: 8px; z-index: 10; touch-action: none; user-select: none; -webkit-user-select: none; }
    .tactile.gauche { left: 12px; grid-template-columns: repeat(3, 72px); grid-template-rows: repeat(2, 72px); }
    .tactile.droite { right: 12px; grid-template-columns: repeat(2, 96px); grid-template-rows: repeat(2, 72px); }
    .tactile button { border: 2px solid rgba(255,255,255,0.55); border-radius: 14px; background: rgba(20,20,30,0.55);
      color: #fff; font: bold 17px monospace; padding: 0; touch-action: none; -webkit-tap-highlight-color: transparent; }
    .tactile button.appuye { background: rgba(255,216,74,0.65); color: #111; }
    .tactile button.cache { visibility: hidden; }
  `;
  document.head.appendChild(style);

  const croix = document.createElement('div');
  croix.className = 'tactile gauche';
  const actions = document.createElement('div');
  actions.className = 'tactile droite';
  // croix : ▲ au milieu en haut, ◀ ▼ ▶ en bas
  const placement = { haut: [croix, '2', '1'], gauche: [croix, '1', '2'], bas: [croix, '2', '2'], droite: [croix, '3', '2'],
    x: [actions, '1 / span 2', '1'], z: [actions, '1', '2'], espace: [actions, '2', '2'] };

  for (const [nom, [parent, col, ligne]] of Object.entries(placement)) {
    const t = TOUCHES[nom];
    const b = document.createElement('button');
    b.textContent = t.texte;
    b.style.gridColumn = col; b.style.gridRow = ligne;
    let enfonce = false, debut = 0;
    const appuyer = (e) => {
      e.preventDefault(); if (enfonce) return;
      // le bouton reste appuyé même si le pouce glisse un peu à côté (relâché au lever du doigt)
      try { b.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
      enfonce = true; debut = performance.now(); b.classList.add('appuye'); envoyer('keydown', t);
    };
    // Un appui très bref doit durer au moins quelques images, sinon le jeu ne le "voit" pas
    const relacher = (e) => {
      e.preventDefault(); if (!enfonce) return;
      enfonce = false; b.classList.remove('appuye');
      setTimeout(() => envoyer('keyup', t), Math.max(0, DUREE_MINI - (performance.now() - debut)));
    };
    b.addEventListener('pointerdown', appuyer);
    b.addEventListener('pointerup', relacher);
    b.addEventListener('pointercancel', relacher);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    parent.appendChild(b);
    boutons[nom] = b;
  }
  document.body.append(croix, actions);
}

// Chaque scène choisit le texte de ses boutons ; null = bouton caché.
// Ex. : etiquettesTactiles({ espace: 'Entrer', z: null, x: null })
export function etiquettesTactiles(etiquettes = {}) {
  for (const [nom, b] of Object.entries(boutons)) {
    const e = nom in etiquettes ? etiquettes[nom] : TOUCHES[nom].texte;
    b.classList.toggle('cache', e === null);
    if (e !== null) b.textContent = e;
  }
}
