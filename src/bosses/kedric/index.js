// Boss Kédric : match de football américain façon Eyeshield 21 (3 attaques avec coup d'envoi, puis le battle de danse contre Kédric).
// Le menu de test (F1) permet aussi de commencer directement par le battle de danse.
import { IDENTITE } from './reglages.js';
import { KedricCourse } from './KedricCourse.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [
    { id: 'action1', nom: 'Match complet (3 attaques + finale)', scene: 'KedricCourse' },
    { id: 'finale', nom: 'Battle de danse direct (14-7)', scene: 'KedricCourse' },
  ],
  manifeste: MANIFESTE,   // ses visuels et sons (rien de partagé avec les autres boss)
  scenes: [KedricCourse],
};
