// Boss Kédric : course de football américain façon Eyeshield 21 (3 actions à marquer).
// Le menu de test (F1) permet aussi de commencer directement à la dernière action (duel contre Kédric).
import { IDENTITE } from './reglages.js';
import { KedricCourse } from './KedricCourse.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [
    { id: 'action1', nom: 'Match (depuis l\'action 1)', scene: 'KedricCourse' },
    { id: 'action3', nom: 'Match (action 3 : duel contre Kédric)', scene: 'KedricCourse' },
  ],
  manifeste: MANIFESTE,   // ses visuels et sons (rien de partagé avec les autres boss)
  scenes: [KedricCourse],
};
