// Boss Kédric : match de football américain façon Eyeshield 21 (3 attaques avec coup d'envoi, puis la finale contre Kédric).
// Le menu de test (F1) permet aussi de commencer directement par la finale.
import { IDENTITE } from './reglages.js';
import { KedricCourse } from './KedricCourse.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [
    { id: 'action1', nom: 'Match complet (3 attaques + finale)', scene: 'KedricCourse' },
    { id: 'finale', nom: 'Finale directe (7-7, 1 contre 1 contre Kédric)', scene: 'KedricCourse' },
  ],
  manifeste: MANIFESTE,   // ses visuels et sons (rien de partagé avec les autres boss)
  scenes: [KedricCourse],
};
