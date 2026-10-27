// Boss Kédric : match de football américain façon Eyeshield 21 (3 attaques, 4 essais pour avancer de 10 yards).
// Le menu de test (F1) permet aussi de commencer directement à la 3e attaque (Kédric joue lui-même).
import { IDENTITE } from './reglages.js';
import { KedricCourse } from './KedricCourse.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [
    { id: 'action1', nom: 'Match complet (3 attaques)', scene: 'KedricCourse' },
    { id: 'action3', nom: '3e attaque à 7-7 (Kédric joue)', scene: 'KedricCourse' },
  ],
  manifeste: MANIFESTE,   // ses visuels et sons (rien de partagé avec les autres boss)
  scenes: [KedricCourse],
};
