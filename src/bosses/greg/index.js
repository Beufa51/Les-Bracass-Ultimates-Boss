// Boss Greg : combat de boxe façon Hajime no Ippo (3 rounds).
// Le menu de test (F1) permet de commencer directement au round 2 ou 3.
import { IDENTITE } from './reglages.js';
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
};
