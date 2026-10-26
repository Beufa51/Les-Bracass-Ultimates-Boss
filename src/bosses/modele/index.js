// Boss modèle : exemple minimal à copier pour créer un nouveau boss.
import { IDENTITE } from './reglages.js';
import { ModeleScene } from './ModeleScene.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [{ id: 'unique', nom: 'Test victoire / défaite', scene: 'ModeleScene' }],
  manifeste: MANIFESTE,   // ses visuels et sons (rien de partagé avec les autres boss)
  scenes: [ModeleScene],
};
