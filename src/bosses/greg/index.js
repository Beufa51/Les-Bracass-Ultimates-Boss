// Boss Greg : combat de boxe façon Hajime no Ippo (3 rounds).
// Le menu de test (F1) permet de commencer directement au round 2 ou 3.
import { IDENTITE, DIFFICULTES as D } from './reglages.js';
import { GregCombat } from './GregCombat.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [
    { id: 'round1', nom: 'Combat (depuis le round 1)', scene: 'GregCombat' },
    { id: 'round2', nom: 'Combat (depuis le round 2)', scene: 'GregCombat' },
    { id: 'round3', nom: 'Combat (depuis le round 3)', scene: 'GregCombat' },
  ],
  manifeste: MANIFESTE,   // ses visuels et sons (rien de partagé avec les autres boss)
  scenes: [GregCombat],
  // réglages développeur (écran caché du hub : 5 appuis sur « Badges ») ; voir src/core/reglagesDev.js
  reglagesDev: ['facile', 'normal', 'champion'].flatMap(n => [
    { groupe: D[n].nom, nom: 'Dégâts des coups de Greg (x)', objet: D[n], champ: 'degatsGreg', pas: 0.05, min: 0.2, max: 3 },
    { groupe: D[n].nom, nom: 'Préparation de ses coups (x, + grand = + lent)', objet: D[n], champ: 'vitesse', pas: 0.05, min: 0.5, max: 2 },
    { groupe: D[n].nom, nom: 'Durée de ton esquive (s)', objet: D[n], champ: 'esquive', pas: 0.01, min: 0.15, max: 1 },
    { groupe: D[n].nom, nom: 'Aides (flèche + cible)', objet: D[n], champ: 'aides' },
  ]),
};
