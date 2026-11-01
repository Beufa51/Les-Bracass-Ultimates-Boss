// Commandes TÉLÉPHONE du FPS de Julien (comme les jeux de tir sur mobile, le plus intuitif) :
//  - pouce GAUCHE : joystick qui apparaît où l'on pose le pouce → avancer / reculer / pas de côté
//    (pousser à fond = courir)
//  - pouce DROIT : glisser sur la moitié droite de l'écran → tourner ; une petite tape → lancer un œuf
//  - gros bouton ŒUF en bas à droite (maintenu = lancers en rafale)
// Pendant le jeu, la croix du moteur commun est cachée ; tout revient comme avant en quittant la scène.
import { estTactile } from '../../core/tactile.js';

const RAYON = 55, ZONE_MORTE = 10;

export function installerTactileFps(scene) {
  if (!estTactile()) return null;
  const el = (tag, style) => { const e = document.createElement(tag); Object.assign(e.style, style); return e; };
  const zoneG = el('div', { position: 'fixed', left: '0', top: '50px', bottom: '0', width: '50%', zIndex: 9, touchAction: 'none' });
  const zoneD = el('div', { position: 'fixed', right: '0', top: '50px', bottom: '0', width: '50%', zIndex: 9, touchAction: 'none' });
  const rond = { position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 10, transform: 'translate(-50%, -50%)' };
  const base = el('div', { ...rond, width: '130px', height: '130px', background: 'rgba(20,20,30,0.25)', border: '3px solid rgba(255,255,255,0.45)' });
  const pouce = el('div', { ...rond, width: '58px', height: '58px', background: 'rgba(255,216,74,0.55)', border: '2px solid rgba(255,255,255,0.8)' });
  const oeuf = el('button', { position: 'fixed', right: '18px', bottom: '22px', width: '96px', height: '96px', borderRadius: '50%', zIndex: 11,
    border: '3px solid rgba(255,255,255,0.7)', background: 'rgba(255,240,200,0.35)', color: '#fff', font: 'bold 18px monospace',
    touchAction: 'none', webkitTapHighlightColor: 'transparent' });
  oeuf.textContent = 'ŒUF';
  const aide = el('div', { position: 'fixed', right: '130px', top: '45%', zIndex: 10, pointerEvents: 'none', color: 'rgba(255,255,255,0.7)',
    font: 'bold 13px monospace', textAlign: 'right', textShadow: '0 0 3px #000' });
  aide.textContent = '← glisse pour tourner →';
  const tous = [zoneG, zoneD, base, pouce, oeuf, aide];
  document.body.append(...tous);

  const croix = document.querySelector('.tactile.gauche');
  const croixAvant = croix && croix.style.display;
  const etat = { actif: false, g: null, cx: 0, cy: 0, jx: 0, jy: 0, d: null, dx0: 0, dt0: 0, bouge: 0, rot: 0, tape: false, oeuf: false };

  const repos = () => {
    const x = 95, y = window.innerHeight - 95;
    for (const e of [base, pouce]) { e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.opacity = '0.45'; }
    etat.jx = 0; etat.jy = 0;
  };
  repos();
  window.addEventListener('resize', repos);

  // --- joystick (pouce gauche)
  zoneG.addEventListener('pointerdown', (e) => {
    e.preventDefault(); if (etat.g !== null) return;
    etat.g = e.pointerId; try { zoneG.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
    etat.cx = e.clientX; etat.cy = e.clientY;
    for (const b of [base, pouce]) { b.style.left = e.clientX + 'px'; b.style.top = e.clientY + 'px'; b.style.opacity = '1'; }
  });
  zoneG.addEventListener('pointermove', (e) => {
    if (e.pointerId !== etat.g) return;
    e.preventDefault();
    let dx = e.clientX - etat.cx, dy = e.clientY - etat.cy;
    const d = Math.hypot(dx, dy);
    if (d > RAYON) {   // le centre suit le pouce s'il va trop loin
      etat.cx = e.clientX - dx / d * RAYON; etat.cy = e.clientY - dy / d * RAYON;
      base.style.left = etat.cx + 'px'; base.style.top = etat.cy + 'px';
      dx = e.clientX - etat.cx; dy = e.clientY - etat.cy;
    }
    pouce.style.left = e.clientX + 'px'; pouce.style.top = e.clientY + 'px';
    const n = Math.hypot(dx, dy);
    if (n < ZONE_MORTE) { etat.jx = 0; etat.jy = 0; return; }
    etat.jx = dx / RAYON; etat.jy = dy / RAYON;
  });
  const lacherG = (e) => { if (e.pointerId === etat.g) { etat.g = null; repos(); } };
  zoneG.addEventListener('pointerup', lacherG);
  zoneG.addEventListener('pointercancel', lacherG);

  // --- tourner (pouce droit) ; une tape courte = un œuf
  zoneD.addEventListener('pointerdown', (e) => {
    e.preventDefault(); if (etat.d !== null) return;
    etat.d = e.pointerId; try { zoneD.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
    etat.dx0 = e.clientX; etat.dt0 = performance.now(); etat.bouge = 0;
  });
  zoneD.addEventListener('pointermove', (e) => {
    if (e.pointerId !== etat.d) return;
    e.preventDefault();
    const dx = e.clientX - etat.dx0; etat.dx0 = e.clientX;
    etat.rot += dx; etat.bouge += Math.abs(dx);
    if (etat.bouge > 40 && !etat.aideVue) { etat.aideVue = true; aide.style.display = 'none'; }   // compris : l'aide s'en va
  });
  const lacherD = (e) => {
    if (e.pointerId !== etat.d) return;
    if (etat.bouge < 12 && performance.now() - etat.dt0 < 250) etat.tape = true;
    etat.d = null;
  };
  zoneD.addEventListener('pointerup', lacherD);
  zoneD.addEventListener('pointercancel', lacherD);

  // --- bouton ŒUF
  oeuf.addEventListener('pointerdown', (e) => { e.preventDefault(); try { oeuf.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ } etat.oeuf = true; etat.tape = true; oeuf.style.background = 'rgba(255,216,74,0.7)'; });
  const lacherO = (e) => { e.preventDefault(); etat.oeuf = false; oeuf.style.background = 'rgba(255,240,200,0.35)'; };
  oeuf.addEventListener('pointerup', lacherO);
  oeuf.addEventListener('pointercancel', lacherO);
  for (const e of tous) e.addEventListener('contextmenu', (ev) => ev.preventDefault());

  const montrer = (v) => {
    etat.actif = v;
    for (const e of tous) e.style.display = v && !(e === aide && etat.aideVue) ? '' : 'none';
    if (croix) croix.style.display = v ? 'none' : croixAvant;
    if (!v) { etat.g = null; etat.d = null; etat.oeuf = false; etat.tape = false; etat.rot = 0; repos(); }
  };
  montrer(false);

  scene.events.once('shutdown', () => {
    window.removeEventListener('resize', repos);
    tous.forEach(e => e.remove());
    if (croix) croix.style.display = croixAvant;
  });

  return {
    activer: montrer,
    // joystick : x = pas de côté (-1 gauche … 1 droite), y = avancer (1) / reculer (-1)
    joystick: () => ({ x: etat.jx, y: -etat.jy }),
    // pixels glissés depuis la dernière image (à transformer en rotation)
    rotation: () => { const r = etat.rot; etat.rot = 0; return r; },
    // vrai si on veut lancer un œuf (bouton maintenu, ou une tape)
    tir: () => { const t = etat.oeuf || etat.tape; etat.tape = false; return t; },
  };
}
