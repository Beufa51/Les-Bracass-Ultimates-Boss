// Scène d'exemple : un carré rebondit. Z = gagner, X = perdre.
// Sert à vérifier que badges, sauvegarde et retour au hub fonctionnent.
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { IDENTITE, REGLAGES } from './reglages.js';
import { etiquettesTactiles } from '../../core/tactile.js';

export class ModeleScene extends BossScene {
  constructor() { super('ModeleScene', IDENTITE); }

  create() {
    etiquettesTactiles({ z: 'Gagner', x: 'Perdre' });
    this.cameras.main.setBackgroundColor('#202830');
    this.enJeu = false;
    this.cible = this.add.sprite(LARGEUR / 2, HAUTEUR / 2, 'modele_cible').play('modele_cible');
    this.sens = 1;
    texte(this, LARGEUR / 2, 60, 'Boss modèle (test)', 28, '#ffd84a');
    this.touches = creerTouches(this);
    this.afficherIntro('Boss modèle', ['Z : gagner (donne un badge de test)', 'X : perdre'], () => { this.enJeu = true; });
  }

  update(temps, delta) {
    if (!this.enJeu || this.termine) return;
    this.cible.x += this.sens * REGLAGES.vitesseCible * delta / 1000;
    if (this.cible.x > LARGEUR - 64 || this.cible.x < 64) this.sens *= -1;
    if (vientDAppuyer(this.touches.z)) this.victoire('Le modèle fonctionne !');
    if (vientDAppuyer(this.touches.x)) this.defaite('Défaite de test.');
  }
}
