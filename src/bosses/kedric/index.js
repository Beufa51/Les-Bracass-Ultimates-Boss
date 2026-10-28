// Boss Kédric : match de football américain façon Eyeshield 21 (3 courses d'une traite, chacune après un coup d'envoi, puis le battle de danse contre Kédric).
// Le menu de test (F1) permet aussi de commencer directement par le battle de danse.
import { IDENTITE, DIFFICULTES as D, REGLAGES as R } from './reglages.js';
import { KedricCourse } from './KedricCourse.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [
    { id: 'action1', nom: 'Match complet (3 courses + battle de danse)', scene: 'KedricCourse' },
    { id: 'finale', nom: 'Battle de danse direct (2 touchdowns)', scene: 'KedricCourse' },
  ],
  manifeste: MANIFESTE,   // ses visuels et sons (rien de partagé avec les autres boss)
  scenes: [KedricCourse],
  // réglages développeur (écran caché du hub : 5 appuis sur « Badges ») ; voir src/core/reglagesDev.js
  reglagesDev: [
    { groupe: 'MATCH', nom: 'Nombre de courses', objet: R, champ: 'courses', pas: 1, min: 1, max: 5 },
    { groupe: 'MATCH', nom: 'Écart entre 2 rangs de défenseurs (yards)', objet: R.defense, champ: 'espace', pas: 1, min: 6, max: 20 },
    { groupe: 'MATCH', nom: 'Vitesse de course de départ (yards/s)', objet: R, champ: 'vitesseBase', pas: 0.5, min: 3, max: 12 },
    { groupe: 'GHOST', nom: 'Durée du Devil Bat Ghost (s)', objet: R.ghost, champ: 'duree', pas: 0.5, min: 1, max: 10 },
    { groupe: 'GHOST', nom: 'Jauge : points par esquive', objet: R.ghost, champ: 'parEsquive', pas: 1, min: 0, max: 5 },
    { groupe: 'GHOST', nom: 'Jauge : points par esquive PARFAITE', objet: R.ghost, champ: 'parParfait', pas: 1, min: 0, max: 6 },
    { groupe: 'BATTLE', nom: 'Vitesse de chute des flèches (pixels/s)', objet: R.showtime.piste, champ: 'vitesse', pas: 10, min: 100, max: 400 },
    ...['facile', 'normal', 'champion'].flatMap(n => [
      { groupe: D[n].nom, nom: 'Taille de la jauge Ghost', objet: D[n], champ: 'ghost', pas: 1, min: 1, max: 20 },
      { groupe: D[n].nom, nom: 'Vitesse de course (x)', objet: D[n], champ: 'vitesse', pas: 0.05, min: 0.5, max: 2 },
      { groupe: D[n].nom, nom: 'Symbole avant le contact (s)', objet: D[n], champ: 'alerte', pas: 0.05, min: 0.3, max: 3 },
      { groupe: D[n].nom, nom: 'Vitesse des défenseurs', objet: D[n], champ: 'charge', pas: 0.25, min: 0, max: 6 },
      { groupe: D[n].nom, nom: 'Battle : fenêtre de timing (x)', objet: D[n], champ: 'fenetreShow', pas: 0.05, min: 0.5, max: 2 },
      { groupe: D[n].nom, nom: 'Battle : flèches rouges', objet: D[n], champ: 'flechesRouges' },
    ]),
  ],
};
