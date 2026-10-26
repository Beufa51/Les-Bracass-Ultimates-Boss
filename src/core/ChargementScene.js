// Première scène : charge le hub et les badges (vite), puis ouvre le hub.
// Les fichiers de chaque boss sont chargés seulement en entrant chez lui (BossScene).
import { chargerFichiers, preparerVisuels } from './ressources.js';
import { texte } from './ui.js';
import { LARGEUR, HAUTEUR } from './reglages.js';

export class ChargementScene extends Phaser.Scene {
  constructor() { super('Chargement'); }

  preload() {
    texte(this, LARGEUR / 2, HAUTEUR / 2, 'Chargement...', 24);
    chargerFichiers(this);
  }

  create() {
    preparerVisuels(this);
    this.scene.start('Hub');
  }
}
