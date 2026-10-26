// Boss Lionel : match de frisbee façon Windjammers (2 sets gagnants).
// Le menu de test (F1) permet aussi de commencer directement au set décisif.
import { IDENTITE } from './reglages.js';
import { LionelMatch } from './LionelMatch.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [
    { id: 'set1', nom: 'Match (depuis le set 1)', scene: 'LionelMatch' },
    { id: 'decisif', nom: 'Match (set décisif, 1-1)', scene: 'LionelMatch' },
  ],
  scenes: [LionelMatch],
};
