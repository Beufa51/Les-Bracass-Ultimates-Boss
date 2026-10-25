// Boss modèle : exemple minimal à copier pour créer un nouveau boss.
import { IDENTITE } from './reglages.js';
import { ModeleScene } from './ModeleScene.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [{ id: 'unique', nom: 'Test victoire / défaite', scene: 'ModeleScene' }],
  scenes: [ModeleScene],
};
