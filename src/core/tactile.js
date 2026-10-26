// Boutons tactiles pour smartphone / tablette.
// Chaque bouton "appuie" sur une vraie touche du clavier (flèches, Espace, Z, X) :
// le reste du jeu n'a donc rien à changer, il lit le clavier comme d'habitude.
// Les boutons n'apparaissent que sur un écran tactile.
// Option par scène : un JOYSTICK VIRTUEL qui suit le pouce à la place de la croix (modeJoystick(true)).
// Par défaut c'est la croix : une scène qui ne demande rien (hub, Greg, menus) garde la croix.

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
    .tactile button { border: 2px solid rgba(255,255,255,0.55); border-radius: 14px; background: rgba(20,20,30,0.35);
      color: #fff; font: bold 17px monospace; padding: 0; touch-action: none; -webkit-tap-highlight-color: transparent; }
    .tactile button.appuye { background: rgba(255,216,74,0.65); color: #111; }
    .tactile button.cache { visibility: hidden; }
    .tactile.gauche.masque { display: none; }
    .joystick-zone { position: fixed; left: 0; top: 50px; bottom: 0; width: 50%; z-index: 9; touch-action: none; }
    .joystick-zone.cache { display: none; }
    .joystick-base, .joystick-bouton { position: fixed; border-radius: 50%; pointer-events: none; z-index: 10; transform: translate(-50%, -50%); }
    .joystick-base { width: 130px; height: 130px; border: 3px solid rgba(255,255,255,0.45); background: rgba(20,20,30,0.25); }
    .joystick-bouton { width: 58px; height: 58px; border: 2px solid rgba(255,255,255,0.8); background: rgba(255,216,74,0.55); }
    .joystick-base.cache, .joystick-bouton.cache { display: none; }
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
  laCroix = croix;
  installerJoystick();
}

// ---------- Joystick virtuel (au choix de chaque scène) ----------
const RAYON_JOYSTICK = 55;      // le petit bouton s'éloigne au plus de 55 px du centre
const ZONE_MORTE = 16;          // en dessous, aucune direction
const DIRECTIONS = ['haut', 'bas', 'gauche', 'droite'];
let joystick = null, laCroix = null, joystickActif = false;

function installerJoystick() {
  const zone = document.createElement('div');
  const base = document.createElement('div'); base.className = 'joystick-base';
  const bouton = document.createElement('div'); bouton.className = 'joystick-bouton';
  joystick = { zone, base, bouton, doigt: null, cx: 0, cy: 0, actives: new Set(), permises: new Set(DIRECTIONS) };
  const placerRepos = () => {
    // au repos : le joystick attend, transparent, en bas à gauche
    const x = 95, y = window.innerHeight - 95;
    for (const el of [base, bouton]) { el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.opacity = '0.45'; }
  };
  joystick.repos = placerRepos;
  placerRepos();
  window.addEventListener('resize', placerRepos);
  const bouger = (x, y) => {
    let dx = x - joystick.cx, dy = y - joystick.cy;
    const dist = Math.hypot(dx, dy);
    // le centre suit le pouce s'il va trop loin (on n'est jamais "au bout" du joystick)
    if (dist > RAYON_JOYSTICK) {
      joystick.cx = x - dx / dist * RAYON_JOYSTICK; joystick.cy = y - dy / dist * RAYON_JOYSTICK;
      base.style.left = joystick.cx + 'px'; base.style.top = joystick.cy + 'px';
      dx = x - joystick.cx; dy = y - joystick.cy;
    }
    bouton.style.left = x + 'px'; bouton.style.top = y + 'px';
    // 8 directions : une direction compte si le pouce penche assez de ce côté
    const voulues = new Set(), d = Math.hypot(dx, dy);
    if (d > ZONE_MORTE) {
      if (dx > d * 0.38) voulues.add('droite');
      if (dx < -d * 0.38) voulues.add('gauche');
      if (dy > d * 0.38) voulues.add('bas');
      if (dy < -d * 0.38) voulues.add('haut');
    }
    directionsJoystick(voulues);
  };
  zone.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (joystick.doigt !== null) return;
    joystick.doigt = e.pointerId;
    try { zone.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
    joystick.cx = e.clientX; joystick.cy = e.clientY;
    for (const el of [base, bouton]) { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; el.style.opacity = '1'; }
  });
  zone.addEventListener('pointermove', (e) => { if (e.pointerId === joystick.doigt) { e.preventDefault(); bouger(e.clientX, e.clientY); } });
  const lacher = (e) => {
    if (e.pointerId !== joystick.doigt) return;
    joystick.doigt = null;
    directionsJoystick(new Set());
    placerRepos();
  };
  zone.addEventListener('pointerup', lacher);
  zone.addEventListener('pointercancel', lacher);
  zone.addEventListener('contextmenu', (e) => e.preventDefault());
  document.body.append(zone, base, bouton);
  afficherJoystick();
}

function directionsJoystick(voulues) {
  for (const d of DIRECTIONS) {
    const veut = voulues.has(d) && joystick.permises.has(d);
    if (veut && !joystick.actives.has(d)) { joystick.actives.add(d); envoyer('keydown', TOUCHES[d]); }
    if (!veut && joystick.actives.has(d)) { joystick.actives.delete(d); envoyer('keyup', TOUCHES[d]); }
  }
}

function afficherJoystick() {
  if (!joystick) return;
  const visible = joystickActif && joystick.permises.size > 0;
  joystick.zone.className = 'joystick-zone' + (visible ? '' : ' cache');
  joystick.base.classList.toggle('cache', !visible);
  joystick.bouton.classList.toggle('cache', !visible);
  if (laCroix) laCroix.classList.toggle('masque', joystickActif);
  if (!visible) { joystick.doigt = null; directionsJoystick(new Set()); joystick.repos(); }
}

// Une scène choisit le joystick (true) ou la croix (false, par défaut).
// Penser à remettre false quand la scène se ferme (les autres scènes gardent la croix).
export function modeJoystick(actif) {
  joystickActif = !!actif;
  afficherJoystick();
}

// Chaque scène choisit le texte de ses boutons ; null = bouton caché.
// Ex. : etiquettesTactiles({ espace: 'Entrer', z: null, x: null })
let dernieresEtiquettes = {};
export function etiquettesTactiles(etiquettes = {}) {
  dernieresEtiquettes = etiquettes;
  if (joystick) {
    joystick.permises = new Set(DIRECTIONS.filter(d => !(d in etiquettes) || etiquettes[d] !== null));
    afficherJoystick();
  }
  for (const [nom, b] of Object.entries(boutons)) {
    const e = nom in etiquettes ? etiquettes[nom] : TOUCHES[nom].texte;
    b.classList.toggle('cache', e === null);
    if (e !== null) b.textContent = e;
  }
}

// Étiquettes actuelles (pour les remettre après la pause)
export function etiquettesActuelles() { return { ...dernieresEtiquettes }; }

// Bouton pause (en haut au milieu de l'écran) : appelle 'action' quand on le touche
let boutonPause = null;
export function installerBoutonPause(action) {
  if (!estTactile()) return;
  const b = document.createElement('button');
  boutonPause = b;
  b.textContent = 'II';
  Object.assign(b.style, {
    position: 'fixed', top: '6px', left: '50%', transform: 'translateX(-50%)', width: '46px', height: '34px',
    zIndex: 11, border: '2px solid rgba(255,255,255,0.55)', borderRadius: '10px', background: 'rgba(20,20,30,0.45)',
    color: '#fff', font: 'bold 16px monospace', touchAction: 'none',
  });
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); action(); });
  document.body.appendChild(b);
}

// Une scène peut ranger le bouton pause en haut à droite (ex. pour ne pas cacher son chrono).
// 'centre' = la place d'origine ; à remettre quand la scène se ferme.
export function placerBoutonPause(place) {
  if (!boutonPause) return;
  const droite = place === 'droite';
  Object.assign(boutonPause.style, { left: droite ? 'auto' : '50%', right: droite ? '8px' : 'auto', transform: droite ? 'none' : 'translateX(-50%)' });
}
