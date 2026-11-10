// Outils partagés par les 3 jeux de Rémi (seulement dans ce dossier) : bulle de texte, écran « perdu » avec REJOUER,
// passage au jeu suivant, difficulté retenue entre les jeux.
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { texte, voile } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { DIFFICULTES } from './reglages.js';
import { choisirDifficulte } from './difficulte.js';
import { attendreOK } from '../../core/BossScene.js';

export const ORDRE = [
  { id: 'velo', scene: 'RemiVelo' },
  { id: 'baby', scene: 'RemiBaby' },
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
// Avis jouabilité (nov. 2026) : pendant la SOIRÉE enchaînée, les règles d'un jeu = un bandeau de quelques secondes
// en haut de l'écran (pas d'écran à fermer). L'écran complet reste pour un accès direct au jeu.
// (analyse comparée, façon WarioWare) UN VERBE géant + un DOIGT dessiné qui mime le geste ('glisser', 'maintenir', 'taper'),
// la phrase en petit dessous.
// (Fabien, nov. 2026) avec `ensuite` : le bandeau RESTE jusqu'à ESPACE / toucher (le temps de lire), puis ensuite() lance le jeu.
export function bandeauRegle(scene, message, duree = 3, verbe = null, geste = null, ensuite = null) {
  const y = verbe ? 96 : 70, h = verbe ? 132 : 64;
  const fond = scene.add.rectangle(LARGEUR / 2, y, LARGEUR - 40, h, 0x000000, 0.8).setDepth(970).setStrokeStyle(2, 0xffd84a, 0.8);
  const objets = [fond];
  if (verbe) objets.push(texte(scene, LARGEUR / 2, y - 24, verbe, 52, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 8 }).setDepth(971));
  objets.push(texte(scene, LARGEUR / 2, verbe ? y + 38 : y, message, verbe ? 17 : 20, '#ffffff', { wordWrap: { width: LARGEUR - 220 }, align: 'center' }).setDepth(971));
  if (geste) {   // le doigt : un rond blanc (le bout du doigt) qui fait le geste, à gauche du verbe
    const gx = 110, gy = y - 10;
    const doigt = scene.add.circle(gx, gy, 16, 0xffffff, 0.95).setStrokeStyle(3, 0x000000).setDepth(972);
    const trace = scene.add.circle(gx, gy, 16).setStrokeStyle(3, 0xffd84a, 0.9).setDepth(971);
    objets.push(doigt, trace);
    if (geste === 'glisser') scene.tweens.add({ targets: doigt, x: gx + 60, yoyo: true, repeat: -1, duration: 450, ease: 'Sine.InOut' });
    else if (geste === 'maintenir') scene.tweens.add({ targets: trace, radius: 34, alpha: 0.2, repeat: -1, duration: 900 });
    else scene.tweens.add({ targets: doigt, scale: 0.7, yoyo: true, repeat: -1, duration: 220 });
  }
  if (ensuite) {
    const invite = texte(scene, LARGEUR / 2, y + h / 2 + 22, `${estTactile() ? 'Touche l\'écran' : 'Appuie sur ESPACE'} pour jouer`, 22, '#7fff7f',
      { fontStyle: 'bold', backgroundColor: '#000000bb', padding: { x: 12, y: 4 } }).setDepth(971);
    objets.push(invite);
    scene.tweens.add({ targets: invite, scale: 1.08, yoyo: true, repeat: -1, duration: 500 });
  }
  objets.forEach(o => { const a = o.alpha; o.setAlpha(0); scene.tweens.add({ targets: o, alpha: a, duration: 200 }); });
  const fermer = () => scene.tweens.add({ targets: objets, alpha: 0, duration: 300, onComplete: () => {
    // (bug nov. 2026) arrêter d'abord les animations SANS FIN du doigt : sinon elles touchent un rond détruit
    scene.tweens.killTweensOf(objets);
    objets.forEach(o => o.destroy());
  } });
  if (!ensuite) { scene.time.delayedCall(duree * 1000, fermer); return; }
  attendreOK(scene, () => { jouerSon(scene, 'ui_valider'); fermer(); ensuite(); }, 600);
}

export function annonce(scene, titre, couleur = '#ffd84a', duree = 1.1) {
  const t = texte(scene, LARGEUR / 2, HAUTEUR / 2 - 40, titre, 56, couleur, { fontStyle: 'bold italic', strokeThickness: 8 }).setDepth(960).setScale(0.4);
  scene.tweens.add({ targets: t, scale: 1, duration: 220, ease: 'Back.Out' });
  scene.tweens.add({ targets: t, alpha: 0, delay: duree * 1000, duration: 250, onComplete: () => t.destroy() });
}

// (analyse comparée, façon Mario Party) les « ÉTOILES BONUS » drôles du bilan de la soirée, tirées des chiffres comptés
export function etoilesBonus(b) {
  const v = b.veloDetail || {}, f = b.babyDetail || {}, p = b.porteDetail || {}, e = [];
  if (v.chutes === 0) e.push('Pilote du dimanche ? Non : ZÉRO chute');
  if (f.gamelles >= 1) e.push('Roi de la gamelle');
  if (f.arrets >= 3) e.push('Le mur du babyfoot');
  if (p.attrapes === 0) e.push('Le videur ? Jamais vu');
  if (p.parfaits >= 2) e.push('Poing parfait');
  if (v.chutes >= 3) e.push('Le vélo, c\'est pas ton truc');
  if (b.temps && b.temps < 150) e.push('Soirée express');
  return e.slice(0, 2);
}

// BILAN de la soirée (V17) : les points de chaque jeu + le temps de jeu, passés d'un jeu à l'autre
export function bilanDe(scene) { const b = scene.donnees.bilan; return b ? { ...b } : { temps: 0 }; }
export function noterJeu(scene, id, points, details) {
  scene.bilan[id] = Math.max(0, Math.round(points));
  if (details) scene.bilan[id + 'Detail'] = details;   // (pour les « étoiles bonus » du bilan)
  scene.bilan.temps += scene.debutJeu ? (Date.now() - scene.debutJeu) / 1000 : 0;
}

// Jeu suivant (même difficulté, le bilan suit)
export function jeuSuivant(scene, idActuel, nomDiff) {
  const i = ORDRE.findIndex(o => o.id === idActuel);
  const s = ORDRE[i + 1];
  scene.scene.start(s.scene, { phase: s.id, diff: nomDiff, enchaine: true, bilan: scene.bilan });
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
  texte(scene, LARGEUR / 2, HAUTEUR - 80, `${t ? 'Rejouer' : 'ESPACE'} : rejouer ce jeu     ${t ? 'Hub' : 'ALT'} : retour au hub`, 22, '#7fff7f').setDepth(1001);
  scene.time.delayedCall(700, () => {
    const kb = scene.input.keyboard;
    kb.once('keydown-SPACE', () => scene.scene.restart({ phase: scene.donnees.phase, diff: nomDiff, bilan: scene.donnees.bilan }));
    let parti = false; const hub = () => { if (!parti) { parti = true; scene.retourHub(); } };
    kb.once('keydown-X', hub); kb.once('keydown-ALT', hub);   // PC : ALT
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
