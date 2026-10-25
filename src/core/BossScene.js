// =====================================================================
// Modèle commun à tous les boss.
// Chaque boss "hérite" de cette scène et obtient gratuitement :
//   - l'écran des commandes avant de commencer (afficherIntro)
//   - la victoire (badge sauvegardé) et la défaite
//   - le retour au hub devant la porte du boss
// =====================================================================
import { LARGEUR, HAUTEUR } from './reglages.js';
import { Sauvegarde } from './sauvegarde.js';
import { texte, voile } from './ui.js';
import { jouerSon } from './ressources.js';

export class BossScene extends Phaser.Scene {
  // cle : nom unique de la scène ; identite : { id, nom } du boss
  constructor(cle, identite) {
    super(cle);
    this.identite = identite;
  }

  init(donnees) {
    this.donnees = donnees || {};
    this.termine = false;
  }

  // Affiche le titre et la liste des commandes, puis attend Espace
  afficherIntro(titre, commandes, quandPret) {
    const elements = [
      voile(this, 0.85).setDepth(1000),
      texte(this, LARGEUR / 2, 120, titre, 40, '#ffd84a').setDepth(1001),
      texte(this, LARGEUR / 2, 190, 'COMMANDES', 22, '#aaaaaa').setDepth(1001),
      texte(this, LARGEUR / 2, 290, commandes.join('\n'), 22, '#ffffff', { lineSpacing: 10 }).setDepth(1001),
      texte(this, LARGEUR / 2, 450, 'Appuie sur ESPACE pour commencer', 22, '#7fff7f').setDepth(1001),
    ];
    this.input.keyboard.once('keydown-SPACE', () => {
      elements.forEach(el => el.destroy());
      jouerSon(this, 'ui_valider');
      quandPret();
    });
  }

  victoire(message = 'Badge obtenu !') {
    if (this.termine) return;
    this.termine = true;
    Sauvegarde.donnerBadge(this.identite.id);
    jouerSon(this, 'ui_badge');
    this.ecranFin('VICTOIRE', message, '#ffd84a', true);
  }

  defaite(message = 'Retente ta chance !') {
    if (this.termine) return;
    this.termine = true;
    jouerSon(this, 'ui_defaite');
    this.ecranFin('PERDU', message, '#ff6b6b', false);
  }

  ecranFin(titre, message, couleur, gagne) {
    voile(this, 0.8).setDepth(1000);
    texte(this, LARGEUR / 2, 170, titre, 56, couleur).setDepth(1001);
    texte(this, LARGEUR / 2, 270, message, 24, '#ffffff', { wordWrap: { width: 800 } }).setDepth(1001);
    if (gagne) this.add.image(LARGEUR / 2, 360, 'badge_' + this.identite.id).setScale(2).setDepth(1001);
    texte(this, LARGEUR / 2, HAUTEUR - 60, 'ESPACE : retour au hub', 20, '#aaaaaa').setDepth(1001);
    // petit délai pour ne pas sauter l'écran par accident
    this.time.delayedCall(600, () => {
      this.input.keyboard.once('keydown-SPACE', () => this.retourHub());
    });
  }

  retourHub() {
    this.scene.start('Hub', { depuis: this.identite.id });
  }
}
