// =====================================================================
// V18 (audit global) : LA FIN — « LES BRACASS' AU COMPLET ! »
// Montrée une fois quand les 6 badges sont gagnés (en revenant au hub), puis à revoir depuis le hub (touche F ou le
// bouton « ★ La fin » en haut). Les 6 boss défilent avec leur badge, confettis, puis retour au hub.
// =====================================================================
import { LARGEUR, HAUTEUR } from '../core/reglages.js';
import { texte } from '../core/ui.js';
import { jouerSon } from '../core/ressources.js';
import { estTactile, etiquettesTactiles } from '../core/tactile.js';
import { BOSS } from '../bosses/liste.js';

// portrait de chaque boss (chargé ici sous une clé à part : les boss retouchent parfois leurs propres images)
const PORTRAITS = {
  beufa: 'assets/sprites/beufa/beufa_buste.jpg',
  kedric: 'assets/sprites/kedric/kedric_portrait.png',
  julien: 'assets/sprites/julien/julien_presentation.png',
  greg: 'assets/sprites/greg/greg_portrait.jpg',
  remi: 'assets/sprites/remi/remi_presentation.png',
  lionel: 'assets/sprites/lionel/lionel_portrait.png',
};

export class FinaleScene extends Phaser.Scene {
  constructor() { super('Finale'); }

  preload() {
    for (const [id, f] of Object.entries(PORTRAITS)) if (!this.textures.exists('fin_' + id)) this.load.image('fin_' + id, f);
  }

  create() {
    etiquettesTactiles({ espace: 'Hub', z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    this.cameras.main.setBackgroundColor('#0b0b14');
    // rayons qui tournent
    const rayons = this.add.graphics({ x: LARGEUR / 2, y: HAUTEUR / 2 });
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2;
      rayons.fillStyle(k % 2 ? 0x2a1f05 : 0x1a1530, 1);
      rayons.slice(0, 0, 900, a, a + Math.PI / 16, false); rayons.fillPath();
    }
    this.tweens.add({ targets: rayons, angle: 360, duration: 40000, repeat: -1 });

    const titre = texte(this, LARGEUR / 2, 56, 'LES BRACASS\' AU COMPLET !', 46, '#ffd84a', { fontStyle: 'bold italic', stroke: '#7a3b00', strokeThickness: 10 }).setScale(3).setAlpha(0);
    this.tweens.add({ targets: titre, scale: 1, alpha: 1, duration: 400, ease: 'Back.Out', onComplete: () => this.cameras.main.shake(250, 0.01) });
    jouerSon(this, 'ui_badge');

    // les 6 cartes, une par une
    const L = 140, H = 250, ecart = 152, x0 = LARGEUR / 2 - ecart * 2.5;
    BOSS.forEach((boss, i) => {
      const x = x0 + i * ecart, y = 270;
      const carte = this.add.container(x, y + 400);
      carte.add(this.add.rectangle(0, 0, L, H, 0x1d1d30).setStrokeStyle(4, 0xffd84a));
      if (this.textures.exists('fin_' + boss.id)) {
        const p = this.add.image(0, -18, 'fin_' + boss.id);
        p.setScale(Math.min((L - 14) / p.width, (H - 64) / p.height));
        carte.add(p);
      }
      carte.add(texte(this, 0, H / 2 - 30, boss.nom, 20, '#ffffff', { fontStyle: 'bold' }));
      if (this.textures.exists('badge_' + boss.id)) carte.add(this.add.image(0, H / 2 + 6, 'badge_' + boss.id).setScale(0.9));
      this.tweens.add({ targets: carte, y, delay: 500 + i * 260, duration: 450, ease: 'Back.Out',
        onComplete: () => jouerSon(this, 'ui_valider') });
      this.tweens.add({ targets: carte, angle: { from: -2, to: 2 }, delay: 2600 + i * 120, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });

    const fin = texte(this, LARGEUR / 2, 448, 'Tu as battu les 6 boss. La légende des Bracass\' est à toi.', 22, '#ffffff').setAlpha(0);
    const invite = texte(this, LARGEUR / 2, 500, `${estTactile() ? 'Hub' : 'ESPACE ou clic'} : retour au hub`, 18, '#7fff7f').setAlpha(0);
    this.tweens.add({ targets: [fin, invite], alpha: 1, delay: 2400, duration: 500 });

    // confettis
    const couleurs = [0xffd84a, 0x7fff7f, 0xff5a6e, 0x9fe0ff, 0xc77dff, 0xffffff];
    this.time.addEvent({ delay: 90, repeat: -1, callback: () => {
      const c = this.add.rectangle(Phaser.Math.Between(0, LARGEUR), -10, 8, 14, Phaser.Utils.Array.GetRandom(couleurs)).setAngle(Phaser.Math.Between(0, 180));
      this.tweens.add({ targets: c, y: HAUTEUR + 20, x: c.x + Phaser.Math.Between(-80, 80), angle: c.angle + 540, duration: Phaser.Math.Between(2200, 3600), onComplete: () => c.destroy() });
    } });

    this.time.delayedCall(2400, () => {
      let fait = false;
      const retour = () => { if (fait) return; fait = true; this.scene.start('Hub', {}); };
      this.input.keyboard.once('keydown-SPACE', retour);
      this.input.once('pointerdown', retour);
    });
  }
}
