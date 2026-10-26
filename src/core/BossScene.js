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
import { jouerSon, chargerFichiers, preparerVisuels } from './ressources.js';
import { estTactile, etiquettesTactiles } from './tactile.js';

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

  // Les visuels et sons de CE boss sont chargés en entrant chez lui (le démarrage du jeu ne charge que le hub).
  // Une deuxième visite ne recharge rien.
  preload() {
    const id = this.identite.id;
    chargerFichiers(this, id);
    if (this.load.list.size === 0) { preparerVisuels(this, id); return; }
    const titre = texte(this, LARGEUR / 2, HAUTEUR / 2 - 30, `Chez ${this.identite.nom}...`, 28, '#ffd84a');
    const fond = this.add.rectangle(LARGEUR / 2, HAUTEUR / 2 + 20, 404, 24, 0x000000).setStrokeStyle(2, 0xffffff, 0.6);
    const barre = this.add.rectangle(LARGEUR / 2 - 200, HAUTEUR / 2 + 20, 0, 18, 0xffd84a).setOrigin(0, 0.5);
    this.load.on('progress', (v) => { barre.width = 400 * v; });
    this.load.once('complete', () => {
      this.load.off('progress');
      titre.destroy(); fond.destroy(); barre.destroy();
      preparerVisuels(this, id);
    });
  }

  // Affiche le titre et la liste des commandes, puis attend Espace
  afficherIntro(titre, commandes, quandPret) {
    const elements = [
      voile(this, 0.85).setDepth(1000),
      texte(this, LARGEUR / 2, 120, titre, 40, '#ffd84a').setDepth(1001),
      texte(this, LARGEUR / 2, 190, 'COMMANDES', 22, '#aaaaaa').setDepth(1001),
      texte(this, LARGEUR / 2, 220, commandes.join('\n'), 20, '#ffffff', { lineSpacing: 6 }).setOrigin(0.5, 0).setDepth(1001),
      texte(this, LARGEUR / 2, 495, `Appuie sur ${estTactile() ? 'OK' : 'ESPACE'} pour commencer`, 22, '#7fff7f').setDepth(1001),
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
    etiquettesTactiles({ espace: 'OK', z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    if (gagne && this.ecranVictoire) { this.ecranVictoire(message); this.attendreRetour(1200); return; }
    voile(this, 0.8).setDepth(1000);
    texte(this, LARGEUR / 2, 170, titre, 56, couleur).setDepth(1001);
    texte(this, LARGEUR / 2, 270, message, 24, '#ffffff', { wordWrap: { width: 800 } }).setDepth(1001);
    if (gagne) this.add.image(LARGEUR / 2, 400, 'badge_' + this.identite.id).setScale(2).setDepth(1001);
    texte(this, LARGEUR / 2, HAUTEUR - 60, `${estTactile() ? 'OK' : 'ESPACE'} : retour au hub`, 20, '#aaaaaa').setDepth(1001);
    this.attendreRetour(600);
  }

  // ESPACE : retour au hub (petit délai pour ne pas sauter l'écran par accident)
  attendreRetour(delai) {
    this.time.delayedCall(delai, () => {
      this.input.keyboard.once('keydown-SPACE', () => this.retourHub());
    });
  }

  retourHub() {
    this.scene.start('Hub', { depuis: this.identite.id });
  }
}
