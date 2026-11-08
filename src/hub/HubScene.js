// =====================================================================
// HUB : écran de SÉLECTION DES BOSS, façon Mega Man (nov. 2026, remplace la salle aux 6 portes).
// Grille 3 x 3 : les 6 boss autour, TOI au milieu, les BADGES et LA FIN en bas.
// Un boss pas encore battu n'apparaît qu'en OMBRE ; battu, il apparaît en couleur avec son badge.
// Flèches = déplacer le curseur, Espace = combattre ; au doigt : toucher une case la choisit, la retoucher = combattre.
// Musique : hub_musique (assets/audio/hub/). Images : outils/hub/preparer_selection.py.
// =====================================================================
import { LARGEUR, HAUTEUR } from '../core/reglages.js';
import { texte } from '../core/ui.js';
import { creerTouches, vientDAppuyer } from '../core/clavier.js';
import { Sauvegarde, formatTemps } from '../core/sauvegarde.js';
import { jouerSon } from '../core/ressources.js';
import { jouerMusique } from '../core/musique.js';
import { BOSS } from '../bosses/liste.js';
import { REGLAGES_HUB as R } from './reglages.js';
import { estTactile, etiquettesTactiles } from '../core/tactile.js';
import { ouvrirReglagesDev } from '../core/ReglagesDevScene.js';

// place de chaque case dans la grille (colonne, ligne)
const PLACES = { beufa: [0, 0], kedric: [1, 0], julien: [2, 0], greg: [0, 1], remi: [2, 1], lionel: [0, 2],
  toi: [1, 1], badges: [1, 2], fin: [2, 2] };

export class HubScene extends Phaser.Scene {
  constructor() { super('Hub'); }

  init(donnees) { this.depuis = donnees && donnees.depuis; }

  create() {
    this.entree = false;
    etiquettesTactiles({ espace: 'Combattre', z: null, x: null });
    jouerMusique(this, 'hub_musique');
    const nb = BOSS.filter(b => Sauvegarde.aLeBadge(b.id)).length;
    this.complet = nb >= BOSS.length;

    // ---- fond : bleu nuit + bandes qui défilent ----
    this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x0a0e24);
    this.bandes = this.add.graphics();
    this.decalage = 0;
    texte(this, LARGEUR / 2, 30, 'CHOISIS TON ADVERSAIRE', 30, '#ffd84a', { fontStyle: 'bold', stroke: '#b3202c', strokeThickness: 6 });

    // ---- les cases ----
    this.cases = [];
    for (const boss of BOSS) {
      const p = PLACES[boss.id]; if (!p) continue;
      this.cases.push(this.caseBoss(boss, ...this.position(p)));
    }
    this.cases.push(this.caseToi(...this.position(PLACES.toi)));
    this.cases.push(this.caseBadges(nb, ...this.position(PLACES.badges)));
    this.cases.push(this.caseFin(...this.position(PLACES.fin)));

    // curseur : sur le boss d'où l'on revient, sinon sur le premier pas encore battu
    const retour = this.cases.find(c => c.boss && c.boss.id === this.depuis);
    const aBattre = this.cases.find(c => c.boss && c.boss.pret && !Sauvegarde.aLeBadge(c.boss.id));
    this.choix = retour || aBattre || this.cases[0];
    this.cadreChoix = this.add.graphics().setDepth(5);

    this.aide = texte(this, LARGEUR / 2, HAUTEUR - 16,
      estTactile() ? 'Touche un boss, puis touche-le encore (ou « Combattre ») pour l\'affronter' : '◀ ▲ ▼ ▶ : choisir     ESPACE : combattre', 15, '#aaaaaa');
    this.infos = texte(this, LARGEUR / 2, HAUTEUR - 40, '', 16, '#ffffff');
    this.touches = creerTouches(this);
    this.input.on('pointerdown', (p) => this.toucher(p.x, p.y));
    this.input.keyboard.on('keydown-D', () => ouvrirReglagesDev(this.game));
    this.input.keyboard.on('keydown-F', () => { if (this.complet) this.voirFin(); });
    this.cameras.main.fadeIn(250);
    this.majChoix();
    if (this.complet && !Sauvegarde.fait('finale_vue')) { Sauvegarde.marquerFait('finale_vue'); this.time.delayedCall(700, () => this.voirFin()); }
  }

  position([col, ligne]) {
    return [LARGEUR / 2 + (col - 1) * (R.caseL + R.ecart), R.grilleY + ligne * (R.caseH + R.ecart)];
  }

  // cadre « métal » d'une case
  cadre(x, y, couleur = 0x3a5fcd) {
    const g = this.add.graphics();
    g.fillStyle(0x05070f, 1).fillRect(x - R.caseL / 2, y - R.caseH / 2, R.caseL, R.caseH);
    g.lineStyle(4, couleur, 1).strokeRect(x - R.caseL / 2, y - R.caseH / 2, R.caseL, R.caseH);
    g.lineStyle(1, 0xa8c4ff, 0.5).strokeRect(x - R.caseL / 2 + 5, y - R.caseH / 2 + 5, R.caseL - 10, R.caseH - 10);
    return g;
  }

  caseBoss(boss, x, y) {
    const battu = Sauvegarde.aLeBadge(boss.id);
    this.cadre(x, y, battu ? 0xd4a52a : 0x3a5fcd);
    const cle = battu ? 'select_' + boss.id : 'select_' + boss.id + '_ombre';
    const img = this.textures.exists(cle) ? this.add.image(x, y + R.caseH / 2 - 26, cle).setOrigin(0.5, 1) : null;
    if (img) img.setScale(Math.min((R.caseL - 16) / img.width, (R.caseH - 34) / img.height));
    // bandeau du nom
    this.add.rectangle(x, y + R.caseH / 2 - 13, R.caseL - 8, 22, 0x000000, 0.85);
    texte(this, x, y + R.caseH / 2 - 13, boss.nom.toUpperCase(), 17, battu ? '#ffd84a' : '#ffffff', { fontStyle: 'bold' });
    if (battu) this.add.image(x + R.caseL / 2 - 22, y - R.caseH / 2 + 22, 'badge_' + boss.id).setScale(0.75);
    if (!boss.pret) texte(this, x, y - 10, 'BIENTÔT', 18, '#ffb347', { stroke: '#000000', strokeThickness: 4 });
    else if (!battu) texte(this, x - R.caseL / 2 + 18, y - R.caseH / 2 + 18, '?', 22, '#5aa8ff', { fontStyle: 'bold' });
    const rec = boss.pret && Sauvegarde.record(boss.id);
    const info = !boss.pret ? `${boss.nom} : bientôt...` : battu
      ? `${boss.nom} : battu !${rec ? `   Record ${rec.rang} en ${formatTemps(rec.temps)}` : ''}`
      : `${boss.nom} : pas encore battu`;
    return { boss, x, y, img, info, action: () => this.entrer(boss) };
  }

  caseToi(x, y) {
    this.cadre(x, y, 0x7fe8ff);
    const h = this.add.sprite(x, y - 8, 'hub_heros_immobile').setScale(1.4);
    this.tweens.add({ targets: h, y: y - 12, yoyo: true, repeat: -1, duration: 500, ease: 'Sine.InOut' });
    texte(this, x, y + R.caseH / 2 - 13, 'TOI', 17, '#7fe8ff', { fontStyle: 'bold' });
    return { x, y, info: 'Bats les 6 Bracass\' et gagne leurs badges !', action: null };
  }

  // case des badges (+ accès caché aux réglages développeur : 5 appuis rapides)
  caseBadges(nb, x, y) {
    this.cadre(x, y, 0x3a5fcd);
    BOSS.forEach((boss, i) => {
      const cle = Sauvegarde.aLeBadge(boss.id) ? 'badge_' + boss.id : 'badge_vide';
      this.add.image(x + ((i % 3) - 1) * 52, y - 30 + Math.floor(i / 3) * 46, cle).setScale(0.8);
    });
    texte(this, x, y + R.caseH / 2 - 13, `BADGES ${nb} / ${BOSS.length}`, 16, '#ffffff', { fontStyle: 'bold' });
    let appuis = [];
    return { x, y, info: `${nb} badge${nb > 1 ? 's' : ''} sur ${BOSS.length}`, action: null, secret: () => {
      const t = this.time.now;
      appuis = [...appuis.filter(a => t - a < 2500), t];
      if (appuis.length >= 5) { appuis = []; ouvrirReglagesDev(this.game); }
    } };
  }

  caseFin(x, y) {
    this.cadre(x, y, this.complet ? 0xd4a52a : 0x2a3350);
    if (this.complet) {
      const t = texte(this, x, y - 10, '★ LA FIN ★', 22, '#ffd84a', { fontStyle: 'bold' });
      this.tweens.add({ targets: t, scale: 1.08, yoyo: true, repeat: -1, duration: 600 });
    } else texte(this, x, y - 10, '?', 54, '#2f3a66', { fontStyle: 'bold' });
    texte(this, x, y + R.caseH / 2 - 13, this.complet ? 'REVOIR LA FIN' : '???', 16, this.complet ? '#ffd84a' : '#55607f', { fontStyle: 'bold' });
    return { x, y, info: this.complet ? 'La scène finale des 6 badges' : 'Gagne les 6 badges pour débloquer cette case...',
      action: this.complet ? () => this.voirFin() : null };
  }

  majChoix() {
    const c = this.choix, g = this.cadreChoix;
    g.clear();
    g.lineStyle(6, 0xffffff, 1).strokeRect(c.x - R.caseL / 2 - 4, c.y - R.caseH / 2 - 4, R.caseL + 8, R.caseH + 8);
    this.infos.setText(c.info || '');
    this.cases.forEach(k => { if (k.img) { this.tweens.killTweensOf(k.img); k.img.setY(k.y + R.caseH / 2 - 26); } });
    if (c.img) this.tweens.add({ targets: c.img, y: c.img.y - 5, yoyo: true, repeat: -1, duration: 260 });
  }

  bouger(dc, dl) {
    const [col, ligne] = [Math.round((this.choix.x - LARGEUR / 2) / (R.caseL + R.ecart)) + 1, Math.round((this.choix.y - R.grilleY) / (R.caseH + R.ecart))];
    const [x, y] = this.position([(col + dc + 3) % 3, (ligne + dl + 3) % 3]);
    const c = this.cases.find(k => Math.abs(k.x - x) < 2 && Math.abs(k.y - y) < 2);
    if (c) { this.choix = c; jouerSon(this, 'ui_valider'); this.majChoix(); }
  }

  valider(c = this.choix) {
    if (c.secret) c.secret();
    if (c.action) c.action();
  }

  update(temps, delta) {
    // bandes du fond qui défilent
    this.decalage = (this.decalage + delta * 0.03) % 40;
    const b = this.bandes; b.clear(); b.lineStyle(14, 0x121a3c, 1);
    for (let y = -40 + this.decalage; y < HAUTEUR + 40; y += 40) b.lineBetween(0, y, LARGEUR, y - 60);
    // cadre du choix qui clignote
    this.cadreChoix.setAlpha(Math.floor(temps / 180) % 2 ? 1 : 0.45);
    if (this.entree) return;
    const t = this.touches;
    if (vientDAppuyer(t.gauche)) this.bouger(-1, 0);
    else if (vientDAppuyer(t.droite)) this.bouger(1, 0);
    else if (vientDAppuyer(t.haut)) this.bouger(0, -1);
    else if (vientDAppuyer(t.bas)) this.bouger(0, 1);
    else if (vientDAppuyer(t.espace)) this.valider();
  }

  // toucher une case : la choisir ; la retoucher : la valider
  toucher(x, y) {
    if (this.entree) return;
    const c = this.cases.find(k => Math.abs(k.x - x) < R.caseL / 2 && Math.abs(k.y - y) < R.caseH / 2);
    if (!c) return;
    if (c === this.choix) this.valider(c);
    else { this.choix = c; jouerSon(this, 'ui_valider'); this.majChoix(); if (c.secret) c.secret(); }
  }

  voirFin() { if (this.entree) return; this.entree = true; this.scene.start('Finale'); }

  // façon Mega Man : la case s'illumine, le boss apparaît en grand dans une bande, puis on part chez lui
  entrer(boss) {
    this.entree = true;
    jouerSon(this, 'hub_porte');
    const bande = this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, 190, 0x101a4a, 0.97).setDepth(20).setScale(1, 0);
    this.tweens.add({ targets: bande, scaleY: 1, duration: 220, ease: 'Cubic.Out' });
    const cle = this.textures.exists('select_' + boss.id) ? 'select_' + boss.id : null;
    if (cle) {
      const img = this.add.image(-120, HAUTEUR / 2 + 92, cle).setOrigin(0.5, 1).setDepth(21).setScale(1.4);
      this.tweens.add({ targets: img, x: 300, duration: 300, delay: 150, ease: 'Back.Out' });
    }
    const nom = texte(this, 640, HAUTEUR / 2, '', 52, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 8 }).setDepth(21);
    const lettres = boss.nom.toUpperCase();
    for (let i = 1; i <= lettres.length; i++) this.time.delayedCall(250 + i * 70, () => { nom.setText(lettres.slice(0, i)); jouerSon(this, 'ui_valider'); });
    this.time.delayedCall(250 + lettres.length * 70 + 700, () => {
      this.cameras.main.fadeOut(250);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (boss.pret) this.scene.start(boss.phases[0].scene, { phase: boss.phases[0].id });
        else this.scene.start('Bientot', { bossId: boss.id });
      });
    });
  }
}
