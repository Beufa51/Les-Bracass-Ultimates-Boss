// Boss Rémi : la soirée au bar, 3 jeux à la suite (même difficulté) :
// 1) le VÉLO pour aller au bar (vue de profil, éviter les bourrés)  2) le BABYFOOT contre Rémi  3) la PORTE (qui tape le plus fort).
// Le menu de test (F1) permet de commencer directement par le 2e ou le 3e jeu.
import { IDENTITE, DIFFICULTES as D, VELO, BABY, PORTE } from './reglages.js';
import { RemiVelo } from './RemiVelo.js';
import { RemiBaby } from './RemiBaby.js';
import { RemiPorte } from './RemiPorte.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [
    { id: 'velo', nom: 'Soirée complète (vélo, babyfoot, porte)', scene: 'RemiVelo' },
    { id: 'baby', nom: 'Babyfoot direct', scene: 'RemiBaby' },
    { id: 'porte', nom: 'La porte direct', scene: 'RemiPorte' },
  ],
  manifeste: MANIFESTE,
  scenes: [RemiVelo, RemiBaby, RemiPorte],
  // réglages développeur (écran caché du hub : 5 appuis sur « Badges ») ; voir src/core/reglagesDev.js
  reglagesDev: [
    { groupe: 'VÉLO', nom: 'Longueur du trajet (px)', objet: VELO, champ: 'longueur', pas: 1000, min: 4000, max: 40000 },
    { groupe: 'VÉLO', nom: 'Vitesse au départ (px/s)', objet: VELO, champ: 'vitesseDepart', pas: 20, min: 150, max: 700 },
    { groupe: 'VÉLO', nom: 'Vitesse à l\'arrivée (px/s)', objet: VELO, champ: 'vitesseFin', pas: 20, min: 150, max: 800 },
    { groupe: 'VÉLO', nom: 'Recharge de la sonnette (s)', objet: VELO, champ: 'sonnette', pas: 0.1, min: 0.1, max: 3 },
    { groupe: 'VÉLO', nom: 'Hauteur du saut (vitesse de départ)', objet: VELO, champ: 'saut', pas: 20, min: 300, max: 900 },
    { groupe: 'BABYFOOT', nom: 'Largeur d\'arrêt de ton gardien (m)', objet: BABY, champ: 'priseToi', pas: 0.005, min: 0.03, max: 0.12 },
    { groupe: 'BABYFOOT', nom: 'Buts pour gagner', objet: BABY, champ: 'buts', pas: 1, min: 1, max: 9 },
    { groupe: 'BABYFOOT', nom: 'Vitesse des boutons ◀ ▶ (m/s)', objet: BABY, champ: 'vitesseBoutons', pas: 0.1, min: 0.3, max: 3 },
    { groupe: 'BABYFOOT', nom: 'Vitesse de ton gardien (m/s)', objet: BABY, champ: 'vitesseGardien', pas: 0.1, min: 0.6, max: 4 },
    { groupe: 'PORTE', nom: 'Solidité de la porte', objet: PORTE, champ: 'solidite', pas: 250, min: 1000, max: 10000 },
    { groupe: 'PORTE', nom: 'Vitesse de charge', objet: PORTE, champ: 'charge', pas: 0.05, min: 0.1, max: 1.5 },
    ...['entrainement', 'facile', 'normal', 'champion'].flatMap(n => [
      { groupe: D[n].nom, nom: 'Vélo : temps avant la fermeture (s)', objet: D[n], champ: 'temps', pas: 2, min: 30, max: 150 },
      { groupe: D[n].nom, nom: 'Vélo : densité des obstacles (x)', objet: D[n], champ: 'densite', pas: 0.05, min: 0.3, max: 2.5 },
      { groupe: D[n].nom, nom: 'Baby : vitesse des tirs de Rémi (m/s)', objet: D[n], champ: 'babyVitesse', pas: 0.05, min: 0.3, max: 2 },
      { groupe: D[n].nom, nom: 'Baby : feintes de Rémi (part)', objet: D[n], champ: 'babyFeinte', pas: 0.05, min: 0, max: 1 },
      { groupe: D[n].nom, nom: 'Baby : aide au gardien (0 à 1)', objet: D[n], champ: 'babyAide', pas: 0.05, min: 0, max: 1 },
      { groupe: D[n].nom, nom: 'Porte : charge visée par Rémi', objet: D[n], champ: 'remiCharge', pas: 0.02, min: 0.2, max: 1 },
      { groupe: D[n].nom, nom: 'Porte : prudence de Rémi', objet: D[n], champ: 'remiPrudent', pas: 0.05, min: 0, max: 1 },
      { groupe: D[n].nom, nom: 'Porte : annonce du videur (x)', objet: D[n], champ: 'videur', pas: 0.05, min: 0.3, max: 3 },
      { groupe: D[n].nom, nom: 'Porte : feintes du videur (part)', objet: D[n], champ: 'feintes', pas: 0.05, min: 0, max: 1 },
      { groupe: D[n].nom, nom: 'Porte : largeur zone verte', objet: D[n], champ: 'zone', pas: 0.01, min: 0.02, max: 0.6 },
    ]),
  ],
};
