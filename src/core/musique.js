// Musiques de fond, jouées avec le lecteur audio du navigateur (pas celui de Phaser) :
//  - elles démarrent pendant le téléchargement (pas besoin d'attendre tout le fichier) ;
//  - sur iPhone, elles s'entendent même en mode silencieux ;
//  - les navigateurs bloquent la musique tant qu'on n'a pas touché l'écran ou le clavier :
//    on la (re)lance donc au premier appui si elle a été bloquée.
import { MANIFESTE } from './manifestes.js';
import { Sauvegarde } from './sauvegarde.js';

const pistes = {};

function piste(cle) {
  const e = MANIFESTE.sons[cle];
  if (!e || !e.fichier) return null;
  if (!pistes[cle]) {
    const a = new Audio('assets/' + e.fichier);
    a.loop = true;
    a.preload = 'none';
    pistes[cle] = { audio: a, voulue: false, base: e.volume ?? 0.5 };
    a.volume = pistes[cle].base * Sauvegarde.volume('musique');
  }
  return pistes[cle];
}

// À appeler une fois au démarrage du jeu
export function installerMusiques() {
  const relancer = () => {
    for (const p of Object.values(pistes)) {
      if (p.voulue && p.audio.paused) p.audio.play().catch(() => {});
    }
  };
  for (const type of ['pointerdown', 'touchend', 'keydown', 'click']) {
    window.addEventListener(type, relancer, { capture: true });
  }
  // onglet caché => musique en pause
  document.addEventListener('visibilitychange', () => {
    for (const p of Object.values(pistes)) {
      if (document.hidden) p.audio.pause(); else if (p.voulue) p.audio.play().catch(() => {});
    }
  });
}

// Joue une musique en boucle tant que la scène est active
export function jouerMusique(scene, cle) {
  const p = piste(cle);
  if (!p) return;
  p.voulue = true;
  p.audio.currentTime = 0;
  p.audio.play().catch(() => { /* bloquée : relancée au prochain appui */ });
  scene.events.once('shutdown', () => { p.voulue = false; p.audio.pause(); });
  // jeu en pause => musique en pause
  const pause = () => p.audio.pause(), reprise = () => { if (p.voulue) p.audio.play().catch(() => {}); };
  scene.events.on('pause', pause); scene.events.on('resume', reprise);
  scene.events.once('shutdown', () => { scene.events.off('pause', pause); scene.events.off('resume', reprise); });
}

// À appeler quand on change le volume de la musique dans les réglages
export function majVolumeMusique() {
  for (const p of Object.values(pistes)) p.audio.volume = p.base * Sauvegarde.volume('musique');
}
