// Musiques de fond, jouées avec le lecteur audio du navigateur (pas celui de Phaser) :
//  - elles démarrent pendant le téléchargement (pas besoin d'attendre tout le fichier) ;
//  - sur iPhone, elles s'entendent même en mode silencieux ;
//  - les navigateurs bloquent la musique tant qu'on n'a pas touché l'écran ou le clavier :
//    on la (re)lance donc au premier appui si elle a été bloquée.
import { MANIFESTE } from '../../assets/manifeste.js';

const pistes = {};

function piste(cle) {
  const e = MANIFESTE.sons[cle];
  if (!e || !e.fichier) return null;
  if (!pistes[cle]) {
    const a = new Audio('assets/' + e.fichier);
    a.loop = true;
    a.preload = 'none';
    a.volume = e.volume ?? 0.5;
    pistes[cle] = { audio: a, voulue: false };
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
}
