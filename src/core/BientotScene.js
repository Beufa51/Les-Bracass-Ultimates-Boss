// Écran affiché pour un boss pas encore développé.
import { LARGEUR, HAUTEUR } from './reglages.js';
import { texte } from './ui.js';
import { BOSS } from '../bosses/liste.js';

export class BientotScene extends Phaser.Scene {
  constructor() { super('Bientot'); }

  init(donnees) { this.bossId = donnees.bossId; }

  create() {
    const boss = BOSS.find(b => b.id === this.bossId);
    this.cameras.main.setBackgroundColor('#1b1b2b');
    texte(this, LARGEUR / 2, 150, boss ? boss.nom : '???', 48, '#ffd84a');
    texte(this, LARGEUR / 2, 250, 'Bientôt !', 40, '#ffffff');
    texte(this, LARGEUR / 2, 320, 'Ce boss est encore en construction.', 22, '#aaaaaa');
    texte(this, LARGEUR / 2, HAUTEUR - 70, 'ESPACE : retour au hub', 20, '#7fff7f');
    this.time.delayedCall(300, () => {
      this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Hub', { depuis: this.bossId }));
    });
  }
}
