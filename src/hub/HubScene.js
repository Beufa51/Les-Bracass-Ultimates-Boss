// =====================================================================
// HUB : salle vue du dessus, 6 portes alignées (une par boss),
// et la barre des 6 badges en bas.
// =====================================================================
import { LARGEUR, HAUTEUR } from '../core/reglages.js';
import { texte } from '../core/ui.js';
import { creerTouches, vientDAppuyer } from '../core/clavier.js';
import { Sauvegarde, formatTemps } from '../core/sauvegarde.js';
import { jouerSon } from '../core/ressources.js';
import { BOSS } from '../bosses/liste.js';
import { REGLAGES_HUB as R } from './reglages.js';
import { estTactile, etiquettesTactiles } from '../core/tactile.js';
import { ouvrirReglagesDev } from '../core/ReglagesDevScene.js';

export class HubScene extends Phaser.Scene {
  constructor() { super('Hub'); }

  init(donnees) { this.depuis = donnees && donnees.depuis; }

  create() {
    this.entree = false;
    etiquettesTactiles({ espace: 'Entrer', z: null, x: null });
    // Sol et mur du fond
    this.add.tileSprite(0, 0, LARGEUR, HAUTEUR, 'hub_sol', 0).setOrigin(0);
    this.add.tileSprite(0, 0, LARGEUR, R.basDuMur, 'hub_mur', 0).setOrigin(0);

    // Portes
    this.portes = BOSS.map((boss, i) => {
      const x = R.premierePorteX + i * R.ecartPortes;
      const porte = this.add.image(x, R.basDuMur - 50, 'hub_porte');
      texte(this, x, 30, boss.nom, 20, '#ffd84a');
      if (!boss.pret) texte(this, x, R.basDuMur + 18, 'Bientôt', 16, '#ffb347');
      else if (Sauvegarde.aLeBadge(boss.id)) texte(this, x, R.basDuMur + 18, 'Gagné !', 16, '#7fff7f');
      const rec = boss.pret && Sauvegarde.record(boss.id);
      if (rec) texte(this, x, R.basDuMur + 38, `Record ${rec.rang} ${formatTemps(rec.temps)}`, 12, '#ffd84a');
      return { boss, x, porte };
    });

    // Barre des badges
    this.add.rectangle(LARGEUR / 2, HAUTEUR - R.hauteurBarre / 2, LARGEUR, R.hauteurBarre, 0x000000, 0.75);
    const nb = BOSS.filter(b => Sauvegarde.aLeBadge(b.id)).length;
    texte(this, 90, HAUTEUR - R.hauteurBarre / 2, `Badges\n${nb} / ${BOSS.length}`, 16, '#ffffff');
    this.accesCacheReglages();
    BOSS.forEach((boss, i) => {
      const cle = Sauvegarde.aLeBadge(boss.id) ? 'badge_' + boss.id : 'badge_vide';
      this.add.image(260 + i * 64, HAUTEUR - R.hauteurBarre / 2, cle);
    });
    texte(this, 820, HAUTEUR - R.hauteurBarre / 2, estTactile() ? 'Flèches : bouger\nEntrer : porte' : 'Flèches : bouger\nEspace : entrer', 14, '#aaaaaa');

    // Héros : devant la porte du boss d'où l'on revient, sinon en bas au centre
    const retour = this.portes.find(p => p.boss.id === this.depuis);
    const departX = retour ? retour.x : LARGEUR / 2;
    const departY = retour ? R.limiteHaut + 20 : R.limiteBas - 20;
    this.heros = this.add.sprite(departX, departY, 'hub_heros_immobile');

    this.aide = texte(this, LARGEUR / 2, R.limiteBas + 20, '', 18, '#ffffff');
    this.touches = creerTouches(this);
    this.cameras.main.fadeIn(250);
  }

  // Accès caché aux RÉGLAGES DÉVELOPPEUR : 5 appuis rapides sur « Badges » (en bas à gauche), ou la touche D
  accesCacheReglages() {
    let appuis = [];
    const zone = this.add.zone(90, HAUTEUR - R.hauteurBarre / 2, 170, R.hauteurBarre).setInteractive();
    zone.on('pointerdown', () => {
      const t = this.time.now;
      appuis = [...appuis.filter(a => t - a < 2500), t];
      if (appuis.length >= 5) { appuis = []; ouvrirReglagesDev(this.game); }
    });
    this.input.keyboard.on('keydown-D', () => ouvrirReglagesDev(this.game));
  }

  update(temps, delta) {
    if (this.entree) return;
    const t = this.touches;
    const v = R.vitesseHeros * delta / 1000;
    let dx = 0, dy = 0;
    if (t.gauche.isDown) dx -= 1;
    if (t.droite.isDown) dx += 1;
    if (t.haut.isDown) dy -= 1;
    if (t.bas.isDown) dy += 1;
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }

    const h = this.heros;
    h.x = Phaser.Math.Clamp(h.x + dx * v, 32, LARGEUR - 32);
    h.y = Phaser.Math.Clamp(h.y + dy * v, R.limiteHaut, R.limiteBas);
    if (dx || dy) { h.play('hub_heros_marche', true); if (dx) h.setFlipX(dx < 0); }
    else h.play('hub_heros_immobile', true);

    // Porte la plus proche
    const proche = this.portes.find(p => Math.abs(p.x - h.x) < R.distanceEntree && h.y < R.limiteHaut + R.distanceEntree);
    this.portes.forEach(p => p.porte.clearTint());
    if (proche) {
      proche.porte.setTint(0xffffaa);
      this.aide.setText(`${estTactile() ? 'Entrer' : 'Espace'} : entrer chez ${proche.boss.nom}`);
      if (vientDAppuyer(t.espace)) this.entrer(proche.boss);
    } else {
      this.aide.setText('');
    }
  }

  entrer(boss) {
    this.entree = true;
    jouerSon(this, 'hub_porte');
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (boss.pret) this.scene.start(boss.phases[0].scene, { phase: boss.phases[0].id });
      else this.scene.start('Bientot', { bossId: boss.id });
    });
  }
}
