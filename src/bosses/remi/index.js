// Boss Rémi : la soirée au bar, 3 jeux à la suite (même difficulté) :
// 1) le VÉLO pour aller au bar (vue de profil, éviter les bourrés)  2) le BEER PONG contre Rémi  3) la PORTE (qui tape le plus fort).
// Le menu de test (F1) permet de commencer directement par le 2e ou le 3e jeu.
import { IDENTITE, DIFFICULTES as D, VELO, PONG, PORTE } from './reglages.js';
import { RemiVelo } from './RemiVelo.js';
import { RemiPong } from './RemiPong.js';
import { RemiPorte } from './RemiPorte.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [
    { id: 'velo', nom: 'Soirée complète (vélo, beer pong, porte)', scene: 'RemiVelo' },
    { id: 'pong', nom: 'Beer pong direct', scene: 'RemiPong' },
    { id: 'porte', nom: 'La porte direct', scene: 'RemiPorte' },
  ],
  manifeste: MANIFESTE,
  scenes: [RemiVelo, RemiPong, RemiPorte],
  // réglages développeur (écran caché du hub : 5 appuis sur « Badges ») ; voir src/core/reglagesDev.js
  reglagesDev: [
    { groupe: 'VÉLO', nom: 'Longueur du trajet (px)', objet: VELO, champ: 'longueur', pas: 1000, min: 4000, max: 40000 },
    { groupe: 'VÉLO', nom: 'Vitesse de croisière (px/s)', objet: VELO, champ: 'croisiere', pas: 20, min: 150, max: 600 },
    { groupe: 'VÉLO', nom: 'Vitesse en sprint (px/s)', objet: VELO, champ: 'vitesseMax', pas: 20, min: 200, max: 800 },
    { groupe: 'VÉLO', nom: 'Sprint : endurance perdue par s', objet: VELO, champ: 'endurance', pas: 0.05, min: 0.05, max: 2 },
    { groupe: 'VÉLO', nom: 'Recharge de la sonnette (s)', objet: VELO, champ: 'sonnette', pas: 0.1, min: 0.2, max: 3 },
    { groupe: 'VÉLO', nom: 'Hauteur du saut (vitesse de départ)', objet: VELO, champ: 'saut', pas: 20, min: 300, max: 900 },
    { groupe: 'BEER PONG', nom: 'Verres par joueur (6 ou 10)', objet: PONG, champ: 'verres', pas: 4, min: 6, max: 10 },
    { groupe: 'BEER PONG', nom: 'Taille du « dedans » (x rayon)', objet: PONG, champ: 'dedans', pas: 0.05, min: 0.4, max: 1.2 },
    { groupe: 'BEER PONG', nom: 'Tangage par verre bu (m)', objet: PONG, champ: 'ivresse', pas: 0.002, min: 0, max: 0.04 },
    { groupe: 'PORTE', nom: 'Durée de l\'élan (s)', objet: PORTE, champ: 'elan', pas: 0.2, min: 1, max: 6 },
    { groupe: 'PORTE', nom: 'Jauge par tape', objet: PORTE, champ: 'parTape', pas: 0.005, min: 0.02, max: 0.2 },
    ...['facile', 'normal', 'champion'].flatMap(n => [
      { groupe: D[n].nom, nom: 'Vélo : temps avant la fermeture (s)', objet: D[n], champ: 'temps', pas: 2, min: 30, max: 150 },
      { groupe: D[n].nom, nom: 'Vélo : densité des obstacles (x)', objet: D[n], champ: 'densite', pas: 0.05, min: 0.3, max: 2.5 },
      { groupe: D[n].nom, nom: 'Pong : chance que Rémi mette un verre', objet: D[n], champ: 'remi', pas: 0.02, min: 0, max: 1 },
      { groupe: D[n].nom, nom: 'Pong : ton imprécision (m)', objet: D[n], champ: 'erreur', pas: 0.005, min: 0, max: 0.15 },
      { groupe: D[n].nom, nom: 'Porte : score mini de Rémi', objet: D[n], champ: 'remiMin', pas: 10, min: 100, max: 990 },
      { groupe: D[n].nom, nom: 'Porte : score maxi de Rémi', objet: D[n], champ: 'remiMax', pas: 10, min: 100, max: 999 },
      { groupe: D[n].nom, nom: 'Porte : largeur zone verte', objet: D[n], champ: 'zone', pas: 0.01, min: 0.02, max: 0.6 },
    ]),
  ],
};
