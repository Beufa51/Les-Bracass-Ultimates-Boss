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
    // Ajout optionnel (alerte de Beufa) : boucle: { debut, fin } en secondes. Le morceau est joué une fois depuis 0
    // (l'intro n'est pas rejouée), puis de fin on revient à debut. Le fichier doit dépasser un peu « fin ».
    if (e.boucle) setInterval(() => {
      if (!a.paused && a.currentTime >= e.boucle.fin) a.currentTime = e.boucle.debut + (a.currentTime - e.boucle.fin);
    }, 15);
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

// Joue une musique en boucle tant que la scène est active.
// options.reprendre : repart là où elle s'était arrêtée (au lieu du début) — pour un morceau court rejoué souvent.
export function jouerMusique(scene, cle, options = {}) {
  const p = piste(cle);
  if (!p) return;
  p.voulue = true;
  if (!options.reprendre) p.audio.currentTime = 0;
  p.audio.play().catch(() => { /* bloquée : relancée au prochain appui */ });
  scene.events.once('shutdown', () => { p.voulue = false; p.audio.pause(); });
  // jeu en pause => musique en pause
  const pause = () => p.audio.pause(), reprise = () => { if (p.voulue) p.audio.play().catch(() => {}); };
  scene.events.on('pause', pause); scene.events.on('resume', reprise);
  scene.events.once('shutdown', () => { scene.events.off('pause', pause); scene.events.off('resume', reprise); });
}

// À appeler quand on change le volume de la musique dans les réglages
export function majVolumeMusique() {
  for (const p of Object.values(pistes)) p.audio.volume = p.base * (p.facteur ?? 1) * Sauvegarde.volume('musique');
}

// ---------- Ajouts optionnels (utilisés par le battle de danse de Kédric) ----------
// DÉBLOQUE des musiques (téléphone) : à appeler PENDANT un appui (toucher / clic / touche). Les navigateurs des
// téléphones refusent une musique lancée plus tard sans appui ; une musique déjà jouée une fois pendant un appui,
// elle, peut repartir quand on veut. On la joue donc en MUET un instant puis on l'arrête (si elle n'est pas voulue).
export function deverrouillerMusiques(cles) {
  for (const cle of cles) {
    const p = piste(cle);
    if (!p || p.debloquee) continue;
    if (p.voulue) { p.audio.play().then(() => { p.debloquee = true; }).catch(() => {}); continue; }
    const a = p.audio;
    a.muted = true;
    a.play().then(() => {
      if (!p.voulue) { a.pause(); a.currentTime = 0; }
      a.muted = false; p.debloquee = true;
    }).catch(() => { a.muted = false; });
  }
}

// Arrête une musique (elle ne repart plus toute seule au prochain appui)
export function arreterMusique(cle) {
  const p = pistes[cle];
  if (p) { p.voulue = false; p.audio.pause(); }
}

// Place la lecture à 'secondes' (pour reprendre un passage précis du morceau)
export function placerMusique(cle, secondes) {
  const p = piste(cle);
  if (p) try { p.audio.currentTime = secondes; } catch (e) { /* pas encore chargée : ignoré */ }
}

// Position de lecture en secondes, ou null si la musique ne joue pas vraiment (bloquée, en pause, en chargement)
export function tempsMusique(cle) {
  const p = pistes[cle];
  if (!p || p.audio.paused || p.audio.seeking || p.audio.readyState < 3) return null;
  return p.audio.currentTime;
}

// ---------- Ajout optionnel (utilisé par la porte de Rémi) ----------
// Baisse / coupe une musique SANS l'arrêter (f : 1 = normal, 0 = muette) ; le réglage de volume reste appliqué
export function facteurMusique(cle, f) {
  const p = pistes[cle];
  if (!p) return;
  p.facteur = Math.max(0, Math.min(1, f));
  p.audio.volume = p.base * p.facteur * Sauvegarde.volume('musique');
}
