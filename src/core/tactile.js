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
let croix = null, actions = null, placement = null;
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
    .tactile button { border: 2px solid rgba(255,255,255,0.55); border-radius: 14px; background: rgba(20,20,30,0.35);
      color: #fff; font: bold 17px monospace; padding: 0; touch-action: none; -webkit-tap-highlight-color: transparent; }
    .tactile button.appuye { background: rgba(255,216,74,0.65); color: #111; }
    .tactile button.cache { visibility: hidden; }
    .tactile.gauche.danse { grid-template-columns: repeat(2, 124px); grid-template-rows: 124px; }
    .tactile.droite.danse { grid-template-columns: repeat(2, 124px); grid-template-rows: 124px; }
    .tactile.danse button { font-size: 46px; }
    .tactile.danse button.cache { display: none; }
    .tactile.noir button { opacity: 0.04; }   // coupure de courant : la page est NOIRE, les boutons restent juste appuyables
    .tactile.gauche.separee { grid-template-columns: repeat(2, 96px); grid-template-rows: 96px; }
    .tactile.droite.separee { grid-template-columns: repeat(2, 84px); grid-template-rows: repeat(2, 76px); }
    .tactile.separee button.cache { display: none; }
    .tactile.gauche.separee button { font-size: 36px; }
  `;
  document.head.appendChild(style);

  croix = document.createElement('div');
  croix.className = 'tactile gauche';
  actions = document.createElement('div');
  actions.className = 'tactile droite';
  // croix : ▲ au milieu en haut, ◀ ▼ ▶ en bas
  placement = { haut: [croix, '2', '1'], gauche: [croix, '1', '2'], bas: [croix, '2', '2'], droite: [croix, '3', '2'],
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
let dernieresEtiquettes = {};
export function etiquettesTactiles(etiquettes = {}) {
  dernieresEtiquettes = etiquettes;
  for (const [nom, b] of Object.entries(boutons)) {
    const e = nom in etiquettes ? etiquettes[nom] : TOUCHES[nom].texte;
    b.classList.toggle('cache', e === null);
    if (e !== null) b.textContent = e;
  }
}

// Étiquettes actuelles (pour les remettre après la pause)
export function etiquettesActuelles() { return { ...dernieresEtiquettes }; }

// Bouton pause (en haut au milieu de l'écran) : appelle 'action' quand on le touche
export function installerBoutonPause(action) {
  if (!estTactile()) return;
  const b = document.createElement('button');
  b.textContent = 'II';
  Object.assign(b.style, {
    position: 'fixed', top: '6px', left: '50%', transform: 'translateX(-50%)', width: '46px', height: '34px',
    zIndex: 11, border: '2px solid rgba(255,255,255,0.55)', borderRadius: '10px', background: 'rgba(20,20,30,0.45)',
    color: '#fff', font: 'bold 16px monospace', touchAction: 'none',
  });
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); action(); });
  document.body.appendChild(b);
}

// Dispositions (optionnelles) des boutons, au choix d'un boss :
//  'normale' : la croix à gauche, les actions à droite (par défaut)
//  'separee' : ◀ ▶ sous le pouce gauche ; ▲ ▼ et les actions (Espace, Z) sous le pouce droit
//  'danse'   : 4 TRÈS gros boutons en ligne, ◀ ▶ à gauche, ▲ ▼ à droite, le reste retiré
// Un boss qui change de disposition remet 'normale' en partant.
const DISPOSITIONS = {
  separee: { gauche: ['croix', '1', '1'], droite: ['croix', '2', '1'], haut: ['actions', '1', '1'], bas: ['actions', '1', '2'],
    espace: ['actions', '2', '1'], z: ['actions', '2', '2'], x: ['actions', '3', '1'] },
  danse: { gauche: ['croix', '1', '1'], droite: ['croix', '2', '1'], haut: ['actions', '1', '1'], bas: ['actions', '2', '1'] },
};
export function disposition(nom = 'normale') {
  if (!croix) return;
  for (const n of ['danse', 'separee']) { croix.classList.toggle(n, n === nom); actions.classList.toggle(n, n === nom); }
  const parents = { croix, actions };
  const place = DISPOSITIONS[nom] ? Object.fromEntries(Object.entries(DISPOSITIONS[nom]).map(([k, [p, c, l]]) => [k, [parents[p], c, l]])) : placement;
  for (const [nom2, [parent, col, ligne]] of Object.entries({ ...placement, ...place })) {
    const b = boutons[nom2];
    b.style.gridColumn = col; b.style.gridRow = ligne;
    if (b.parentNode !== parent) parent.appendChild(b);
  }
}
// (ancienne forme, gardée) : dispositionDanse(true) = disposition('danse'), dispositionDanse(false) = 'normale'
export function dispositionDanse(actif) { disposition(actif ? 'danse' : 'normale'); }

// Allume un bouton (optionnel, ex. jeu de rythme : le bouton à presser brille de plus en plus fort) :
// force de 0 (éteint) à 1 (maintenant !) ; couleur CSS de la lueur. eteindreBoutons() les éteint tous.
const lueurs = {};
export function allumerBouton(nom, force = 0, couleur = '#ffd84a') {
  const b = boutons[nom];
  if (!b) return;
  const style = force <= 0 ? '' : `0 0 ${Math.round(8 + 28 * force)}px ${Math.round(2 + 10 * force)}px ${couleur}`;
  if (lueurs[nom] === style) return;   // rien de changé : on ne touche pas à la page
  lueurs[nom] = style;
  b.style.boxShadow = style;
  b.style.borderColor = force <= 0 ? '' : couleur;
}
export function eteindreBoutons() { for (const nom of Object.keys(boutons)) allumerBouton(nom, 0); }

// NOIR TOTAL (battle de Kédric) : les boutons de la page s'éteignent (quasi invisibles) —
// le téléphone a un écran VRAIMENT noir comme le PC ; ils restent appuyables (garde le rythme en tête)
export function voileNoirTactile(actif) {
  for (const p of [croix, actions]) if (p) p.classList.toggle('noir', actif);
}

// Où est un bouton à l'écran (rectangle de la page), ou null s'il n'est pas affiché (pas d'écran tactile, bouton caché)
export function rectBouton(nom) {
  const b = boutons[nom];
  if (!b || b.classList.contains('cache') || !b.offsetParent) return null;
  return b.getBoundingClientRect();
}
