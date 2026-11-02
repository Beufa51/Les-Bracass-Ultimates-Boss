// Outils partagés par les 3 jeux de Rémi (seulement dans ce dossier) : bulle de texte, écran « perdu » avec REJOUER,
// passage au jeu suivant, difficulté retenue entre les jeux.
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { texte, voile } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { DIFFICULTES } from './reglages.js';
import { choisirDifficulte } from './difficulte.js';

export const ORDRE = [
  { id: 'velo', scene: 'RemiVelo' },
  { id: 'pong', scene: 'RemiPong' },
  { id: 'porte', scene: 'RemiPorte' },
];

// Difficulté : celle passée par le jeu précédent ; sinon (menu F1, rejouer) on la demande
export function difficulteOuChoix(scene, ensuite) {
  const nom = scene.donnees.diff;
  if (nom && DIFFICULTES[nom]) { ensuite(nom, DIFFICULTES[nom]); return; }
  choisirDifficulte(scene, 'remi', DIFFICULTES, ensuite);
}

// Bulle en haut de l'écran (texto, réplique) qui disparaît toute seule
export function bulle(scene, message, couleur = '#ffffff', duree = 2.2, y = 70) {
  const t = texte(scene, LARGEUR / 2, y, message, 22, couleur, { fontStyle: 'bold', backgroundColor: '#000000bb', padding: { x: 14, y: 6 }, wordWrap: { width: 860 } }).setDepth(950);
  scene.tweens.add({ targets: t, alpha: 0, delay: duree * 1000, duration: 300, onComplete: () => t.destroy() });
  return t;
}

// Grand titre au centre (« MANCHE 2 », « BALLS BACK ! »)
export function annonce(scene, titre, couleur = '#ffd84a', duree = 1.1) {
  const t = texte(scene, LARGEUR / 2, HAUTEUR / 2 - 40, titre, 56, couleur, { fontStyle: 'bold italic', strokeThickness: 8 }).setDepth(960).setScale(0.4);
  scene.tweens.add({ targets: t, scale: 1, duration: 220, ease: 'Back.Out' });
  scene.tweens.add({ targets: t, alpha: 0, delay: duree * 1000, duration: 250, onComplete: () => t.destroy() });
}

// Jeu suivant (même difficulté)
export function jeuSuivant(scene, idActuel, nomDiff) {
  const i = ORDRE.findIndex(o => o.id === idActuel);
  const s = ORDRE[i + 1];
  scene.scene.start(s.scene, { phase: s.id, diff: nomDiff, enchaine: true });
}

// PERDU : ESPACE = rejouer CE jeu (même difficulté), X = retour au hub
export function ecranPerdu(scene, titre, message, nomDiff) {
  if (scene.termine) return;
  scene.termine = true;
  jouerSon(scene, 'ui_defaite');
  etiquettesTactiles({ espace: 'Rejouer', x: 'Hub', z: null, haut: null, bas: null, gauche: null, droite: null });
  voile(scene, 0.82).setDepth(1000);
  texte(scene, LARGEUR / 2, 160, titre, 52, '#ff6b6b').setDepth(1001);
  texte(scene, LARGEUR / 2, 260, message, 24, '#ffffff', { wordWrap: { width: 820 } }).setDepth(1001);
  const t = estTactile();
  texte(scene, LARGEUR / 2, HAUTEUR - 80, `${t ? 'Rejouer' : 'ESPACE'} : rejouer ce jeu     ${t ? 'Hub' : 'X'} : retour au hub`, 22, '#7fff7f').setDepth(1001);
  scene.time.delayedCall(700, () => {
    const kb = scene.input.keyboard;
    kb.once('keydown-SPACE', () => scene.scene.restart({ phase: scene.donnees.phase, diff: nomDiff }));
    kb.once('keydown-X', () => scene.retourHub());
  });
}

export const hasard = (a, b) => a + Math.random() * (b - a);
export const choisir = (liste) => liste[Math.floor(Math.random() * liste.length)];

// Sur téléphone, les blocs de boutons (en bas à gauche et à droite) restent posés sur l'écran même quand leurs boutons
// sont cachés : ils « mangeaient » les touchers du jeu (bug V6 : « je dois appuyer à côté »). Pendant les jeux de Rémi,
// les blocs laissent passer les touchers ; seuls les boutons VISIBLES restent touchables. Remis comme avant en partant.
export function laisserPasserTactile(scene) {
  const blocs = [...document.querySelectorAll('.tactile')];
  for (const b of blocs) {
    b.style.pointerEvents = 'none';
    for (const bouton of b.querySelectorAll('button')) bouton.style.pointerEvents = 'auto';
  }
  scene.events.once('shutdown', () => {
    for (const b of blocs) { b.style.pointerEvents = ''; for (const bouton of b.querySelectorAll('button')) bouton.style.pointerEvents = ''; }
  });
}
