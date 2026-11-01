// Joystick du pouce GAUCHE (téléphone) pour la manif : il apparaît là où l'on pose le pouce et donne
// avancer / reculer (haut / bas) et PAS DE CÔTÉ (gauche / droite), en douceur (analogique).
// On tourne avec les boutons ↺ ↻ et on tire avec LANCER (à droite) : rien à glisser.
// Pendant le jeu, la croix du moteur commun est cachée ; tout revient comme avant en quittant la scène.
import { estTactile } from '../../core/tactile.js';

const RAYON = 55, ZONE_MORTE = 10;

export function installerJoystick(scene) {
  if (!estTactile()) return null;
  const el = (style) => { const e = document.createElement('div'); Object.assign(e.style, style); return e; };
  const zone = el({ position: 'fixed', left: '0', top: '60px', bottom: '0', width: '45%', zIndex: 9, touchAction: 'none', display: 'none' });
  const rond = { position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 10, transform: 'translate(-50%, -50%)', display: 'none' };
  const base = el({ ...rond, width: '130px', height: '130px', background: 'rgba(20,20,30,0.25)', border: '3px solid rgba(255,255,255,0.45)' });
  const pouce = el({ ...rond, width: '58px', height: '58px', background: 'rgba(255,216,74,0.55)', border: '2px solid rgba(255,255,255,0.8)' });
  document.body.append(zone, base, pouce);
  const croix = document.querySelector('.tactile.gauche');
  const croixAvant = croix ? croix.style.display : '';
  const etat = { doigt: null, cx: 0, cy: 0, x: 0, y: 0, actif: false };

  const repos = () => {
    const x = 100, y = window.innerHeight - 100;
    for (const b of [base, pouce]) { b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.opacity = '0.45'; }
    etat.x = 0; etat.y = 0;
  };
  repos();
  window.addEventListener('resize', repos);
  zone.addEventListener('pointerdown', (e) => {
    e.preventDefault(); if (etat.doigt !== null) return;
    etat.doigt = e.pointerId; try { zone.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
    etat.cx = e.clientX; etat.cy = e.clientY;
    for (const b of [base, pouce]) { b.style.left = e.clientX + 'px'; b.style.top = e.clientY + 'px'; b.style.opacity = '1'; }
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== etat.doigt) return;
    e.preventDefault();
    let dx = e.clientX - etat.cx, dy = e.clientY - etat.cy;
    const d = Math.hypot(dx, dy);
    if (d > RAYON) {   // le centre suit le pouce s'il va trop loin
      etat.cx = e.clientX - dx / d * RAYON; etat.cy = e.clientY - dy / d * RAYON;
      base.style.left = etat.cx + 'px'; base.style.top = etat.cy + 'px';
      dx = e.clientX - etat.cx; dy = e.clientY - etat.cy;
    }
    pouce.style.left = e.clientX + 'px'; pouce.style.top = e.clientY + 'px';
    if (Math.hypot(dx, dy) < ZONE_MORTE) { etat.x = 0; etat.y = 0; return; }
    etat.x = dx / RAYON; etat.y = -dy / RAYON;
  });
  const lacher = (e) => { if (e.pointerId === etat.doigt) { etat.doigt = null; repos(); } };
  zone.addEventListener('pointerup', lacher);
  zone.addEventListener('pointercancel', lacher);
  zone.addEventListener('contextmenu', (e) => e.preventDefault());

  scene.events.once('shutdown', () => {
    window.removeEventListener('resize', repos);
    zone.remove(); base.remove(); pouce.remove();
    if (croix) croix.style.display = croixAvant;
  });

  return {
    // en jeu : joystick visible, croix cachée ; hors jeu (menus, fin) : la croix revient
    activer(v) {
      etat.actif = v;
      for (const b of [zone, base, pouce]) b.style.display = v ? '' : 'none';
      if (croix) croix.style.display = v ? 'none' : croixAvant;
      if (!v) { etat.doigt = null; repos(); }
    },
    // x : pas de côté (-1 gauche … 1 droite) ; y : avancer (1) / reculer (-1)
    valeur: () => ({ x: etat.x, y: etat.y }),
  };
}
