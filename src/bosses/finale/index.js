// BOSS FINAL : pas une case de boss comme les autres (case du MILIEU du hub, verrouillée jusqu'aux 6 badges).
import { IDENTITE } from './reglages.js';
import { FinaleMecha } from './FinaleMecha.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [{ id: 'mecha', nom: 'BOSS FINAL : le mécha des Bracass\'', scene: 'FinaleMecha' }],
  manifeste: MANIFESTE,
  scenes: [FinaleMecha],
};
