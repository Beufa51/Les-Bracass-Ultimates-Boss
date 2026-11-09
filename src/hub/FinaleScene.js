// =====================================================================
// LA FIN (après le BOSS FINAL, ou touche F au hub une fois les 6 badges) : cinématique en 4 temps.
//  1. LE TAS : flash, les 6 Bracass' sonnés tombent du ciel (assets/sprites/finale/tas.png)
//  2. LA PHOTO DE GROUPE : les 6 poses de l'intro arrivent une par une, ton vaisseau se pose, « CLIC ! »
//  3. LE BILAN : ton meilleur rang chez chaque boss (format « NOM (lettre) ») et les défis réussis
//  4. LE GÉNÉRIQUE qui défile (une réplique par pote, les musiques lues dans CREDITS.md), puis retour au hub
// ESPACE / un toucher = passer au temps suivant. Musique : celle de l'intro (Dragon Ball Final Bout).
// =====================================================================
import { LARGEUR, HAUTEUR } from '../core/reglages.js';
import { texte } from '../core/ui.js';
import { jouerSon } from '../core/ressources.js';
import { jouerMusique } from '../core/musique.js';
import { estTactile, etiquettesTactiles } from '../core/tactile.js';
import { Sauvegarde } from '../core/sauvegarde.js';
import { rangLisible } from '../core/rangs.js';
import { BOSS, FINALE } from '../bosses/liste.js';
import { rangRecord } from '../bosses/rangs.js';
import { DEFIS } from '../bosses/defis.js';
import { REGLAGES as R_FINALE } from '../bosses/finale/reglages.js';

const ORDRE_PHOTO = ['greg', 'julien', 'beufa', 'kedric', 'remi', 'lionel'];   // de gauche à droite sur la photo
const LETTRES = ['S', 'A', 'B', 'C'];

export class FinaleScene extends Phaser.Scene {
  constructor() { super('Finale'); }

  preload() {
    const charger = (cle, f) => { if (!this.textures.exists(cle)) this.load.image(cle, f); };
    charger('fin_tas', 'assets/sprites/finale/tas.png');
    charger('fin_vaisseau', 'assets/sprites/finale/vaisseau.png');
    for (const id of ORDRE_PHOTO) charger('fin_pose_' + id, `assets/sprites/intro/intro_pose_${id}.png`);
    if (!this.cache.text.exists('fin_credits')) this.load.text('fin_credits', 'CREDITS.md');
  }

  create() {
    etiquettesTactiles({ espace: 'Suite', z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    this.cameras.main.setBackgroundColor('#0b0b14');
    jouerMusique(this, 'intro_musique');
    this.rayons = this.add.graphics({ x: LARGEUR / 2, y: HAUTEUR / 2 });
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2;
      this.rayons.fillStyle(k % 2 ? 0x2a1f05 : 0x1a1530, 1).slice(0, 0, 900, a, a + Math.PI / 16, false).fillPath();
    }
    this.tweens.add({ targets: this.rayons, angle: 360, duration: 40000, repeat: -1 });
    this.calque = null; this.etape = -1;
    this.etapes = [() => this.leTas(), () => this.laPhoto(), () => this.leBilan(), () => this.leGenerique()];
    this.suivante();
    // passer au temps suivant (petit délai : un appui ne saute pas deux temps d'un coup)
    const passer = () => { if (this.time.now - this.debutEtape > 700) this.suivante(); };
    this.input.keyboard.on('keydown-SPACE', passer);
    this.input.on('pointerdown', passer);
  }

  suivante() {
    if (this.calque) { this.tweens.killTweensOf(this.calque.list); this.calque.destroy(); }
    this.time.removeAllEvents();
    this.etape++;
    if (this.etape >= this.etapes.length) { this.scene.start('Hub', {}); return; }
    this.calque = this.add.container(0, 0);
    this.debutEtape = this.time.now;
    this.etapes[this.etape]();
  }
  ajout(o) { this.calque.add(o); return o; }
  // chaque temps passe tout seul au suivant après « duree » secondes
  auto(duree) { this.time.delayedCall(duree * 1000, () => this.suivante()); }
  invite() {
    this.ajout(texte(this, LARGEUR - 16, HAUTEUR - 16, `${estTactile() ? 'Touche' : 'ESPACE'} : suite ▶`, 15, '#aaaaaa').setOrigin(1, 1));
  }

  // ---------- 1. le tas ----------
  leTas() {
    this.cameras.main.flash(500, 255, 255, 255);
    jouerSon(this, 'finale_partie');
    this.ajout(texte(this, LARGEUR / 2, 46, 'BOUM !', 52, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 10 }));
    if (this.textures.exists('fin_tas')) {
      const tas = this.ajout(this.add.image(LARGEUR / 2, -260, 'fin_tas').setScale(0.82));
      this.tweens.add({ targets: tas, y: 285, duration: 700, delay: 400, ease: 'Bounce.Out',
        onComplete: () => { this.cameras.main.shake(400, 0.015); jouerSon(this, 'finale_explosion'); } });
      this.tweens.add({ targets: tas, angle: { from: -1.5, to: 1.5 }, delay: 1300, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
    const l = this.ajout(texte(this, LARGEUR / 2, HAUTEUR - 44, 'Le mécha a sauté… les Bracass\' sont K.O. Mais ils sourient.', 22, '#ffffff',
      { stroke: '#000000', strokeThickness: 5 }).setAlpha(0));
    this.tweens.add({ targets: l, alpha: 1, delay: 1500, duration: 500 });
    this.invite(); this.auto(6);
  }

  // ---------- 2. la photo de groupe ----------
  laPhoto() {
    const titre = this.ajout(texte(this, LARGEUR / 2, 50, 'LES BRACASS\' AU COMPLET !', 44, '#ffd84a',
      { fontStyle: 'bold italic', stroke: '#7a3b00', strokeThickness: 10 }).setScale(3).setAlpha(0));
    ORDRE_PHOTO.forEach((id, i) => {
      if (!this.textures.exists('fin_pose_' + id)) return;
      const x = 122 + i * 143, gauche = i < 3;
      const p = this.ajout(this.add.image(gauche ? -200 : LARGEUR + 200, 315, 'fin_pose_' + id).setScale(0.5));
      this.tweens.add({ targets: p, x, delay: 300 + i * 330, duration: 420, ease: 'Back.Out', onComplete: () => jouerSon(this, 'ui_valider') });
    });
    if (this.textures.exists('fin_vaisseau')) {
      const v = this.ajout(this.add.image(-150, 120, 'fin_vaisseau').setScale(0.55).setDepth(5));
      this.tweens.add({ targets: v, x: LARGEUR / 2, y: 478, delay: 2400, duration: 900, ease: 'Cubic.Out' });
    }
    this.time.delayedCall(3500, () => {
      this.cameras.main.flash(250, 255, 255, 255); jouerSon(this, 'ui_badge');
      this.tweens.add({ targets: titre, scale: 1, alpha: 1, duration: 400, ease: 'Back.Out' });
      this.ajout(texte(this, 120, 120, 'CLIC !', 34, '#ffffff', { fontStyle: 'bold', stroke: '#000000', strokeThickness: 6 }).setAngle(-12));
      this.confettis();
    });
    this.invite(); this.auto(9);
  }
  confettis() {
    const couleurs = [0xffd84a, 0x7fff7f, 0xff5a6e, 0x9fe0ff, 0xc77dff, 0xffffff];
    this.time.addEvent({ delay: 90, repeat: 60, callback: () => {
      const c = this.ajout(this.add.rectangle(Phaser.Math.Between(0, LARGEUR), -10, 8, 14, Phaser.Utils.Array.GetRandom(couleurs)).setAngle(Phaser.Math.Between(0, 180)));
      this.tweens.add({ targets: c, y: HAUTEUR + 20, x: c.x + Phaser.Math.Between(-80, 80), angle: c.angle + 540, duration: Phaser.Math.Between(2200, 3600) });
    } });
  }

  // ---------- 3. le bilan ----------
  // meilleur rang d'un boss, toutes difficultés confondues (Julien : manif et classe)
  meilleurRang(id) {
    const recs = Sauvegarde.tout().records || {};
    let mieux = null;
    for (const [cle, r] of Object.entries(recs)) {
      const liste = cle === 'julien_classe' ? 'julien_classe' : id;
      if (!(cle === id || (cle.startsWith(id + '_') && !cle.includes('piece')))) continue;
      const g = rangRecord(liste, r.rang);
      if (!mieux || LETTRES.indexOf(g.lettre) < LETTRES.indexOf(mieux.lettre)) mieux = g;
    }
    return mieux;
  }
  leBilan() {
    this.ajout(texte(this, LARGEUR / 2, 40, 'TON PALMARÈS', 40, '#ffd84a', { fontStyle: 'bold', stroke: '#b3202c', strokeThickness: 8 }));
    const liste = [...BOSS, { ...FINALE, nom: 'BOSS FINAL' }];
    let defisFaits = 0, defisTotal = 0;
    liste.forEach((b, i) => {
      const y = 100 + i * 46, g = this.meilleurRang(b.id);
      const d = DEFIS[b.id] || [], faits = d.filter(x => Sauvegarde.defis(b.id)[x.id]).length;
      defisFaits += faits; defisTotal += d.length;
      const ligne = [
        this.add.rectangle(LARGEUR / 2, y, LARGEUR - 120, 38, i % 2 ? 0x13235a : 0x0e1b48, 0.92),
        texte(this, 90, y, b.nom.toUpperCase(), 22, '#ffd84a', { fontStyle: 'bold' }).setOrigin(0, 0.5),
        texte(this, 300, y, g ? rangLisible(g.nom, g.lettre) : '—', 22, g && g.lettre === 'S' ? '#ffd84a' : '#ffffff', { fontStyle: 'bold' }).setOrigin(0, 0.5),
        texte(this, LARGEUR - 90, y, d.length ? `défis ${faits}/${d.length}` : '', 18, faits === d.length ? '#7fff7f' : '#c8d8ff').setOrigin(1, 0.5),
      ];
      ligne.forEach(o => { this.ajout(o); o.setAlpha(0); });
      this.tweens.add({ targets: ligne, alpha: 1, delay: 300 + i * 280, duration: 250, onStart: () => jouerSon(this, 'ui_valider') });
    });
    const total = this.ajout(texte(this, LARGEUR / 2, 440, `DÉFIS RÉUSSIS : ${defisFaits} / ${defisTotal}` +
      (defisFaits === defisTotal ? '   ★ TOUT EST FAIT ! ★' : '   (le reste t\'attend au hub)'), 22, defisFaits === defisTotal ? '#7fff7f' : '#ffffff').setAlpha(0));
    this.tweens.add({ targets: total, alpha: 1, delay: 300 + liste.length * 280 + 300, duration: 400 });
    this.invite(); this.auto(10);
  }

  // ---------- 4. le générique ----------
  leGenerique() {
    this.tweens.add({ targets: this.rayons, alpha: 0.35, duration: 800 });
    const repliques = Object.fromEntries(R_FINALE.parties.map(p => [p.id, p.replique]));
    const lignes = ['LES BRACASS\'', 'ULTIMATE BOSS', '', 'Une idée et un jeu de FABIEN', '', '— LES BOSS —', ''];
    for (const b of BOSS) lignes.push(b.nom.toUpperCase(), `« ${repliques[b.id] || '…'} »`, '');
    lignes.push('— LES MUSIQUES —', '');
    const credits = this.cache.text.get('fin_credits') || '';
    for (const l of credits.split('\n')) {
      const m = l.match(/^\|\s*Musique[^|]*\|\s*([^|]+)\|/);
      if (m) lignes.push(m[1].trim().replace(/, réencodée.*$/, ''));
    }
    lignes.push('', 'Merci aux Bracass\' d\'avoir prêté leur tête.', '', '', 'MERCI D\'AVOIR JOUÉ !');
    const bloc = this.ajout(texte(this, LARGEUR / 2, HAUTEUR + 20, lignes.join('\n'), 22, '#ffffff',
      { align: 'center', lineSpacing: 8, stroke: '#000000', strokeThickness: 4, wordWrap: { width: LARGEUR - 80 } }).setOrigin(0.5, 0));
    const duree = (bloc.height + HAUTEUR) / 55;   // 55 px par seconde
    this.tweens.add({ targets: bloc, y: HAUTEUR / 2 - bloc.height + 30, duration: duree * 1000, ease: 'Linear' });
    this.invite(); this.auto(duree + 2.5);
  }
}
