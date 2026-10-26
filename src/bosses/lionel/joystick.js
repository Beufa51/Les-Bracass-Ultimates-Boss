// Joystick virtuel pour téléphone, propre au match de Lionel :
// il apparaît là où on pose le pouce (moitié gauche de l'écran), le suit, et "appuie"
// sur les flèches du clavier (8 directions). Pendant le match, la croix tactile du jeu
// est cachée et le bouton pause rangé en haut à droite (pour ne pas cacher le chrono) ;
// tout redevient comme avant quand on quitte le match (le hub et les autres boss n'y voient rien).
import { estTactile } from '../../core/tactile.js';

const RAYON = 55;        // le petit bouton s'éloigne au plus de 55 px du centre
const ZONE_MORTE = 16;   // en dessous, aucune direction
const TOUCHES = {
  haut:   { key: 'ArrowUp',    code: 'ArrowUp',    keyCode: 38 },
  bas:    { key: 'ArrowDown',  code: 'ArrowDown',  keyCode: 40 },
  gauche: { key: 'ArrowLeft',  code: 'ArrowLeft',  keyCode: 37 },
  droite: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
};
const DIRECTIONS = Object.keys(TOUCHES);

function envoyer(type, t) {
  const ev = new KeyboardEvent(type, { key: t.key, code: t.code, bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'keyCode', { get: () => t.keyCode });
  Object.defineProperty(ev, 'which', { get: () => t.keyCode });
  window.dispatchEvent(ev);
}

// Installe le joystick pour cette scène ; renvoie { directions(etiquettes) } ou null (pas un écran tactile)
export function installerJoystick(scene) {
  if (!estTactile()) return null;
  const zone = document.createElement('div');
  const base = document.createElement('div');
  const bouton = document.createElement('div');
  Object.assign(zone.style, { position: 'fixed', left: '0', top: '50px', bottom: '0', width: '50%', zIndex: 9, touchAction: 'none' });
  for (const [el, taille, fond, bord] of [[base, 130, 'rgba(20,20,30,0.25)', '3px solid rgba(255,255,255,0.45)'],
    [bouton, 58, 'rgba(255,216,74,0.55)', '2px solid rgba(255,255,255,0.8)']]) {
    Object.assign(el.style, { position: 'fixed', width: taille + 'px', height: taille + 'px', borderRadius: '50%', background: fond,
      border: bord, pointerEvents: 'none', zIndex: 10, transform: 'translate(-50%, -50%)' });
  }
  document.body.append(zone, base, bouton);

  // la croix du jeu est cachée, la pause va en haut à droite (remis comme avant à la fin)
  const croix = document.querySelector('.tactile.gauche');
  const pause = [...document.querySelectorAll('button')].find(b => b.textContent === 'II');
  const avant = { croix: croix && croix.style.display, pause: pause && { left: pause.style.left, right: pause.style.right, transform: pause.style.transform } };
  if (croix) croix.style.display = 'none';
  if (pause) Object.assign(pause.style, { left: 'auto', right: '8px', transform: 'none' });

  const etat = { doigt: null, cx: 0, cy: 0, actives: new Set(), permises: new Set(DIRECTIONS) };
  const repos = () => {
    // au repos : le joystick attend, transparent, en bas à gauche
    const x = 95, y = window.innerHeight - 95;
    for (const el of [base, bouton]) { el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.opacity = '0.45'; }
  };
  repos();
  window.addEventListener('resize', repos);
  const changer = (voulues) => {
    for (const d of DIRECTIONS) {
      const veut = voulues.has(d) && etat.permises.has(d);
      if (veut && !etat.actives.has(d)) { etat.actives.add(d); envoyer('keydown', TOUCHES[d]); }
      if (!veut && etat.actives.has(d)) { etat.actives.delete(d); envoyer('keyup', TOUCHES[d]); }
    }
  };
  const bouger = (x, y) => {
    let dx = x - etat.cx, dy = y - etat.cy;
    const dist = Math.hypot(dx, dy);
    // le centre suit le pouce s'il va trop loin (on n'est jamais "au bout" du joystick)
    if (dist > RAYON) {
      etat.cx = x - dx / dist * RAYON; etat.cy = y - dy / dist * RAYON;
      base.style.left = etat.cx + 'px'; base.style.top = etat.cy + 'px';
      dx = x - etat.cx; dy = y - etat.cy;
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
    changer(voulues);
  };
  zone.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (etat.doigt !== null) return;
    etat.doigt = e.pointerId;
    try { zone.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
    etat.cx = e.clientX; etat.cy = e.clientY;
    for (const el of [base, bouton]) { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; el.style.opacity = '1'; }
  });
  zone.addEventListener('pointermove', (e) => { if (e.pointerId === etat.doigt) { e.preventDefault(); bouger(e.clientX, e.clientY); } });
  const lacher = (e) => {
    if (e.pointerId !== etat.doigt) return;
    etat.doigt = null; changer(new Set()); repos();
  };
  zone.addEventListener('pointerup', lacher);
  zone.addEventListener('pointercancel', lacher);
  zone.addEventListener('contextmenu', (e) => e.preventDefault());

  // à la fermeture de la scène : on enlève tout et on remet la croix et la pause
  scene.events.once('shutdown', () => {
    changer(new Set());
    window.removeEventListener('resize', repos);
    zone.remove(); base.remove(); bouton.remove();
    if (croix) croix.style.display = avant.croix;
    if (pause) Object.assign(pause.style, avant.pause);
  });

  return {
    // directions utilisables (null dans les étiquettes tactiles = direction ignorée) ; aucune => joystick caché
    directions(etiquettes) {
      etat.permises = new Set(DIRECTIONS.filter(d => !(d in etiquettes) || etiquettes[d] !== null));
      const visible = etat.permises.size > 0;
      for (const el of [zone, base, bouton]) el.style.display = visible ? '' : 'none';
      if (!visible) { etat.doigt = null; repos(); }
      changer(new Set([...etat.actives].filter(d => etat.permises.has(d))));
    },
  };
}
