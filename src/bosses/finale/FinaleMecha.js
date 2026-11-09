// =====================================================================
// BOSS FINAL : le MÉCHA DES BRACASS' — shoot'em up vu du dessus, défilement de gauche à droite.
// Ton vaisseau à gauche (tir automatique), le mécha à droite : 6 parties à détruire dans l'ordre (un pote par partie),
// chacune avec ses tirs simples et son attaque spéciale TOUJOURS annoncée (couloir rouge, trait, cible au sol, « ! »).
// Commandes : téléphone = un doigt n'importe où (le vaisseau suit le MOUVEMENT du doigt, décalé), bouton BOMBE ;
//             clavier = flèches, ESPACE = bombe. Réglages : reglages.js. Proposition : propositions/finale_mecha.md.
// Le bot (outils/finale_bot.mjs) pilote en posant this.cible = { x, y } et en appelant this.bombe().
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { texte, voile } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { Sauvegarde, formatTemps, lignesDefis } from '../../core/sauvegarde.js';
import { rangLisible, trouverRang } from '../../core/rangs.js';
import { IDENTITE, DIFFICULTES, REGLAGES as R } from './reglages.js';
import { choisirDifficulte, cleRecord } from './difficulte.js';

const PAS = 3;   // les masques des parties sont lus 1 pixel sur 3 (assez précis, très rapide)

export class FinaleMecha extends BossScene {
  constructor() { super('FinaleMecha', IDENTITE); }

  create() {
    const d = this.donnees;
    this.etat = 'intro'; this.T = 0; this.gagne = false;
    this.balles = []; this.tirs = []; this.couloirs = []; this.traits = []; this.flaques = []; this.cibles = []; this.chemins = [];
    this.eclats = []; this.explos = []; this.att = {};
    this.stats = { coups: 0, bombes: 0, continues: d.continues || 0 };
    etiquettesTactiles({ espace: null, z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    this.input.addPointer(2);

    // ---- décor qui défile ----
    this.fond = this.textures.exists('finale_fond')
      ? this.add.tileSprite(0, 0, LARGEUR, HAUTEUR, 'finale_fond').setOrigin(0)
      : this.add.rectangle(0, 0, LARGEUR, HAUTEUR, 0x1a1040).setOrigin(0);

    // ---- le mécha : 6 parties superposées (même taille, même place) ----
    const M = R.mecha;
    this.mecha = { x: M.x, bas: M.bas, dy: 0, monte: 0 };
    this.parties = R.parties.map((p, i) => {
      const cle = 'finale_mecha_' + p.id;
      const spr = this.add.image(M.x, M.bas, cle).setOrigin(0.5, 1).setScale(M.echelle).setDepth(10);
      return { ...p, i, cle, spr, masque: this.lireMasque(cle), pvMax: p.pv, pv: p.pv, detruite: false };
    });
    for (const p of this.parties) p.centre = this.centreMasque(p.masque);

    // ---- ton vaisseau ----
    const V = R.vaisseau;
    this.vaisseau = this.add.image(140, HAUTEUR / 2, 'finale_vaisseau').setScale(V.echelle).setDepth(20);
    this.point = this.add.circle(0, 0, V.rayon + 1, 0xffffff).setStrokeStyle(2, 0xff3355).setDepth(21);
    this.cible = null; this.doigt = null; this.invincible = 0; this.recharge = 0;

    this.gTirs = this.add.graphics().setDepth(15);
    this.gAlertes = this.add.graphics().setDepth(12);
    this.gBalles = this.add.graphics().setDepth(25);
    this.gEffets = this.add.graphics().setDepth(26);

    // ---- interface ----
    this.txtVies = texte(this, 16, 22, '', 24, '#ff6b8a', { fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0, 0.5).setDepth(40);
    this.txtPartie = texte(this, LARGEUR / 2 + 60, 18, '', 18, '#ffd84a', { fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setDepth(40);
    this.gBarre = this.add.graphics().setDepth(40);
    this.bandeauTxt = texte(this, LARGEUR / 2, HAUTEUR / 2 - 40, '', 40, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 8 }).setDepth(60).setAlpha(0);
    this.creerBoutonBombe();
    this.touches = creerTouches(this);
    this.brancherDoigt();
    this.ombre = this.add.rectangle(0, 0, LARGEUR, HAUTEUR, 0x000000, 0).setOrigin(0).setDepth(55);

    jouerMusique(this, 'finale_musique');
    this.majInterface();
    // 1re fois : FACILE proposé par défaut (c'est la récompense, pas un mur)
    if (!(Sauvegarde.tout().difficultes || {})[IDENTITE.id]) Sauvegarde.reglerDifficulte(IDENTITE.id, 'facile');
    const lancer = () => choisirDifficulte(this, IDENTITE.id, DIFFICULTES, (nom, diff) => {
      this.nomDiff = nom; this.diff = diff;
      this.preparerPartie();
    });
    if (d.rejouer) { this.entree(true); lancer(); return; }
    this.entree(false);
    this.time.delayedCall(1700, () => this.afficherIntro('BOSS FINAL : LE MÉCHA DES BRACASS\'', [
      'Les 6 Bracass\' ont fusionné dans un robot géant : détruis ses 6 parties, une par une !',
      estTactile() ? 'Pose un doigt N\'IMPORTE OÙ : le vaisseau suit le mouvement du doigt.' : 'FLÈCHES : piloter le vaisseau.',
      'Le tir est AUTOMATIQUE. Seul le POINT BLANC du vaisseau craint les tirs.',
      'Seule la partie ENCADRÉE EN JAUNE prend tes tirs : mets-toi à sa hauteur !',
      'Couloir ROUGE, trait rouge, cible au sol, « ! » : une attaque arrive, sors de là !',
      `${estTactile() ? 'Bouton BOMBE' : 'ESPACE'} : BOMBE (efface tous les tirs). +1 bombe par partie détruite.`,
    ], lancer));
  }

  // ---------- entrée du mécha : « LES BRACASS' FUSIONNENT ! » ----------
  entree(rapide) {
    this.mecha.monte = rapide ? 0 : 420;
    if (!rapide) {
      this.cameras.main.shake(1400, 0.006);
      this.bandeau('LES BRACASS\' FUSIONNENT !', 1.6, '#ff6b6b');
      this.tweens.add({ targets: this.mecha, monte: 0, duration: 1500, ease: 'Cubic.Out' });
    }
  }

  // ---------- début (ou reprise après un CONTINUE) ----------
  preparerPartie() {
    const D = this.diff, reprise = this.donnees.reprise || 0;
    this.vies = this.viesMax = D.vies; this.bombes = D.bombes;
    this.parties.forEach((p, i) => {
      p.pv = p.pvMax = Math.round(p.pv * D.pv);
      if (i < reprise) { p.detruite = true; p.spr.setVisible(false); }
    });
    this.actuelle = reprise;
    this.majInterface();
    this.bandeau(reprise ? `ON REPREND : ${this.parties[reprise].nom}` : 'PRÊT ?', 1.0);
    this.time.delayedCall(1100, () => { this.bandeau('GO !', 0.6, '#7fff7f'); this.etat = 'jeu'; this.debut = this.T; });
  }

  // ======================= MASQUES DES PARTIES (où le robot « existe ») =======================
  lireMasque(cle) {
    const src = this.textures.get(cle).getSourceImage();
    const L = Math.ceil(src.width / PAS), H = Math.ceil(src.height / PAS);
    const can = document.createElement('canvas'); can.width = src.width; can.height = src.height;
    const ctx = can.getContext('2d'); ctx.drawImage(src, 0, 0);
    const px = ctx.getImageData(0, 0, src.width, src.height).data;
    const m = new Uint8Array(L * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < L; x++) m[y * L + x] = px[((y * PAS) * src.width + x * PAS) * 4 + 3] > 100 ? 1 : 0;
    return { L, H, m, w: src.width, h: src.height };
  }
  centreMasque(k) {
    let sx = 0, sy = 0, n = 0, x0 = 1e9, y0 = 1e9, x1 = 0, y1 = 0;
    for (let y = 0; y < k.H; y++) for (let x = 0; x < k.L; x++) if (k.m[y * k.L + x]) {
      sx += x; sy += y; n++; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    return { x: sx / n * PAS, y: sy / n * PAS, x0: x0 * PAS, y0: y0 * PAS, x1: x1 * PAS, y1: y1 * PAS };
  }
  // point de l'écran → pixel de l'image du mécha
  versImage(x, y) {
    const s = R.mecha.echelle, k = this.parties[0].masque;
    return { x: (x - (this.mecha.x - k.w * s / 2)) / s, y: (y - (this.mecha.bas + this.mecha.dy + this.mecha.monte - k.h * s)) / s };
  }
  versEcran(ix, iy) {
    const s = R.mecha.echelle, k = this.parties[0].masque;
    return { x: this.mecha.x - k.w * s / 2 + ix * s, y: this.mecha.bas + this.mecha.dy + this.mecha.monte - k.h * s + iy * s };
  }
  // la partie (non détruite) à ce point de l'écran ; seule = ne regarder que cette partie-là
  partieEn(x, y, seule = null) {
    const i = this.versImage(x, y), mx = Math.floor(i.x / PAS), my = Math.floor(i.y / PAS);
    for (const p of seule ? [seule] : this.parties) {
      if (p.detruite) continue;
      const k = p.masque;
      if (mx >= 0 && my >= 0 && mx < k.L && my < k.H && k.m[my * k.L + mx]) return p;
    }
    return null;
  }
  origine(id) { const p = this.parties.find(q => q.id === id); return this.versEcran(p.centre.x, p.centre.y); }

  // ======================= COMMANDES =======================
  brancherDoigt() {
    // le vaisseau suit le MOUVEMENT du doigt (pas sa position) : on ne le cache jamais sous le pouce
    this.input.on('pointerdown', (p) => {
      if (this.doigt || this.surBombe(p)) return;
      this.doigt = { id: p.id, px: p.x, py: p.y, sx: this.vaisseau.x, sy: this.vaisseau.y };
    });
    this.input.on('pointermove', (p) => {
      const d = this.doigt; if (!d || d.id !== p.id) return;
      const S = R.vaisseau.suivi;
      this.cible = { x: d.sx + (p.x - d.px) * S, y: d.sy + (p.y - d.py) * S };
    });
    const lacher = (p) => { if (this.doigt && this.doigt.id === p.id) { this.doigt = null; this.cible = null; } };
    this.input.on('pointerup', lacher); this.input.on('pointerupoutside', lacher);
  }
  creerBoutonBombe() {
    this.btnBombe = this.add.circle(62, HAUTEUR - 62, 42, 0x8a1c2c, 0.85).setStrokeStyle(4, 0xffd84a).setDepth(41).setInteractive();
    this.txtBombe = texte(this, 62, HAUTEUR - 62, '', 18, '#ffffff', { fontStyle: 'bold', align: 'center' }).setDepth(42);
    this.btnBombe.on('pointerdown', () => this.bombe());
  }
  surBombe(p) { return Math.hypot(p.x - this.btnBombe.x, p.y - this.btnBombe.y) < 48; }

  bombe() {
    if (this.etat !== 'jeu' || this.bombes <= 0) return;
    this.bombes--; this.stats.bombes++;
    jouerSon(this, 'finale_bombe');
    this.cameras.main.flash(300, 255, 240, 200); this.cameras.main.shake(300, 0.01);
    for (const b of this.balles) this.eclat(b.x, b.y, 0xffffff);
    this.balles = []; this.couloirs = []; this.traits = []; this.cibles = []; this.chemins = [];
    this.invincible = Math.max(this.invincible, R.bombe.invincible);
    this.toucherPartie(this.parties[this.actuelle], R.bombe.degats);
    this.bandeau('LE CRI DES BRACASS\' !', 0.8, '#ffffff');
    this.majInterface();
  }

  // ======================= BOUCLE =======================
  update(temps, delta) {
    const dt = Math.min(0.05, delta / 1000);
    this.T += dt;
    this.mecha.dy = Math.sin(this.T * 1.3) * R.mecha.flotte;
    if (this.fond.tilePositionX !== undefined) this.fond.tilePositionX += 40 * dt;
    this.parties.forEach(p => { if (!p.tombe) p.spr.setPosition(this.mecha.x, this.mecha.bas + this.mecha.dy + this.mecha.monte); });
    if (this.etat === 'jeu' && !this.termine) {
      this.piloter(dt);
      this.tirer(dt);
      this.attaquer(dt);
      this.bougerBalles(dt);
      if (vientDAppuyer(this.touches.espace)) this.bombe();
    } else if (this.etat === 'explose') {
      this.bougerBalles(dt, true);
    }
    this.eclats = this.eclats.filter(e => (e.t += dt) < 0.25);
    this.explos = this.explos.filter(e => (e.t += dt) < e.duree);
    this.dessiner();
  }

  piloter(dt) {
    const V = R.vaisseau, Z = V.zone, t = this.touches, v = this.vaisseau;
    const lent = this.flaques.some(f => Math.hypot(f.x - this.px(), f.y - v.y) < f.r) ? R.ralentiMousse : 1;
    if (this.cible) {
      const dx = this.cible.x - v.x, dy = this.cible.y - v.y, dist = Math.hypot(dx, dy), max = 900 * lent * dt;
      if (dist > 0) { const k = Math.min(1, max / dist); v.x += dx * k; v.y += dy * k; }
    } else {
      const vx = (t.droite.isDown ? 1 : 0) - (t.gauche.isDown ? 1 : 0), vy = (t.bas.isDown ? 1 : 0) - (t.haut.isDown ? 1 : 0);
      const n = Math.hypot(vx, vy) || 1;
      v.x += vx / n * V.vitesse * lent * dt; v.y += vy / n * V.vitesse * lent * dt;
    }
    v.x = Phaser.Math.Clamp(v.x, Z.xMin, Z.xMax); v.y = Phaser.Math.Clamp(v.y, Z.yMin, Z.yMax);
    if (this.invincible > 0) this.invincible -= dt;
    v.setAlpha(this.invincible > 0 ? (Math.floor(this.T * 14) % 2 ? 0.35 : 1) : 1);
    this.point.setPosition(this.px(), v.y);
  }
  px() { return this.vaisseau.x + R.vaisseau.pointX; }

  // ---------- tes tirs (automatiques) ----------
  tirer(dt) {
    const V = R.vaisseau, v = this.vaisseau;
    this.recharge -= dt;
    if (this.recharge <= 0) {
      this.recharge = V.cadence;
      this.tirs.push({ x: v.x + 40, y: v.y - 7 }, { x: v.x + 40, y: v.y + 7 });
      this.salve = (this.salve || 0) + 1;
      if (this.salve % 3 === 1) jouerSon(this, 'finale_laser_heros', { volume: 0.09 });   // une salve sur TROIS, très bas (Fabien : « trop fort, agaçant à la longue »)
      this.eclat(v.x + 44, v.y, 0xfff27a);   // éclair au bout du canon
    }
    const pas = V.vitesseTir * dt;
    this.tirs = this.tirs.filter(t => {
      // on avance par petits bouts pour ne pas « sauter » par-dessus une partie fine
      for (let k = 0; k < 3; k++) {
        t.x += pas / 3;
        // seule la partie VISÉE prend les tirs (les autres sont traversées : sinon le torse cachait le bras de Lionel)
        const p = this.partieEn(t.x, t.y, this.parties[this.actuelle]);
        if (p) {
          this.toucherPartie(p, V.degats); this.eclat(t.x, t.y, 0xffd84a);
          if (!(this.T < this.prochainImpact)) { this.prochainImpact = this.T + 0.22; jouerSon(this, 'finale_impact', { volume: 0.3 }); }   // au plus ≈ 4 par seconde, discret
          return false;
        }
      }
      return t.x < LARGEUR + 20;
    });
  }

  toucherPartie(p, degats) {
    if (!p || p.detruite || this.etat !== 'jeu') return;
    p.pv -= degats;
    // reflet rouge bref (au plus toutes les 0,12 s : sous un tir continu, la partie ne reste pas toute blanche)
    if (!(this.T < (p.reflet || 0))) {
      p.reflet = this.T + 0.12; p.spr.setTint(0xff9090);
      this.time.delayedCall(50, () => { if (!p.detruite) p.spr.clearTint(); });
    }
    if (p.pv <= 0) this.detruirePartie(p);
    this.majInterface();
  }

  detruirePartie(p) {
    p.detruite = true; p.pv = 0;
    jouerSon(this, 'finale_partie');
    this.cameras.main.shake(500, 0.012);
    const c = this.origine(p.id);
    for (let k = 0; k < 8; k++) this.time.delayedCall(k * 160, () => this.explosion(c.x + Phaser.Math.Between(-60, 60), c.y + Phaser.Math.Between(-70, 70), 50));
    p.spr.setTint(0x444444);
    // le pote est éjecté (en parachute) avec sa réplique
    const bulle = texte(this, Math.min(c.x, LARGEUR - 230), c.y - 40, `🪂 ${p.nom} : « ${p.replique} »`, 18, '#ffffff',
      { fontStyle: 'bold', backgroundColor: '#000000cc', padding: { x: 8, y: 5 }, wordWrap: { width: 300 } }).setDepth(50);
    this.tweens.add({ targets: bulle, y: bulle.y - 90, alpha: 0, delay: 1600, duration: 1200, onComplete: () => bulle.destroy() });
    // tous les tirs s'effacent, la partie tombe
    for (const b of this.balles) this.eclat(b.x, b.y, 0xffffff);
    this.balles = []; this.couloirs = []; this.traits = []; this.cibles = []; this.chemins = [];
    this.time.delayedCall(R.explosionPartie * 1000, () => {
      p.tombe = true;
      this.tweens.add({ targets: p.spr, y: p.spr.y + 500, angle: p.i % 2 ? 25 : -25, alpha: 0, duration: 1100, ease: 'Quad.In' });
    });
    if (p.i === this.parties.length - 1) { this.finDuMecha(); return; }
    this.bombes += R.bombe.parPartie;
    this.etat = 'pause';
    this.actuelle = p.i + 1; this.att = {};
    this.time.delayedCall((R.explosionPartie + R.pauseEntreParties) * 1000, () => {
      if (this.termine) return;
      this.bandeau(`CIBLE : ${this.parties[this.actuelle].nom} !`, 1.0);
      this.etat = 'jeu';
    });
    this.majInterface();
  }

  // ======================= LES ATTAQUES DU MÉCHA =======================
  // minuteur d'une attaque : vrai quand il est temps (période / cadence de la difficulté)
  minuteur(nom, periode, premier = 0.6) {
    if (this.att[nom] === undefined) this.att[nom] = premier;
    this.att[nom] -= this.dt;
    if (this.att[nom] > 0) return false;
    this.att[nom] += periode / this.diff.cadence;
    return true;
  }
  vise(o, ecart = 0) { return Math.atan2(this.vaisseau.y - o.y, this.px() - o.x) + ecart; }
  balle(x, y, angle, vitesse, type, r, extra = {}) {
    const v = vitesse * this.diff.vitesse;
    this.balles.push({ x, y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v, type, r, age: 0, ...extra });
  }

  attaquer(dt) {
    this.dt = dt;
    const p = this.parties[this.actuelle];
    if (!p || p.detruite) return;
    this[p.id](R.attaques[p.id], this.origine(p.id));
  }

  kedric(A, o) {
    if (this.minuteur('ballons', A.ballons.periode)) {
      const n = A.ballons.nombre;
      for (let k = 0; k < n; k++) this.balle(o.x, o.y, this.vise(o, (k - (n - 1) / 2) * A.ballons.ecart), A.ballons.vitesse, 'ballon', 9);
    }
    // BLITZ : un couloir rouge à ta hauteur, puis une ligne de défenseurs qui charge
    if (this.minuteur('blitz', A.blitz.toutesLes, 3)) {
      const B = A.blitz;
      this.alerteCouloir(this.vaisseau.y, B.hauteur, B.preavis, () => {
        for (let k = 0; k < B.nombre; k++) {
          const y = this.couloirY + (k - (B.nombre - 1) / 2) * (B.hauteur / B.nombre);
          this.balle(LARGEUR - 200 + k * 30, y, Math.PI, B.vitesse, 'defenseur', 14);
        }
      });
    }
  }

  remi(A, o) {
    // PINTES lancées en cloche : une CIBLE apparaît au sol, la pinte y tombe et laisse une flaque de mousse
    if (this.minuteur('pintes', A.pintes.periode)) {
      const tx = Phaser.Math.Clamp(this.px() + Phaser.Math.Between(-50, 50), 40, 600), ty = Phaser.Math.Clamp(this.vaisseau.y + Phaser.Math.Between(-40, 40), 30, 515);
      const duree = A.pintes.duree / this.diff.vitesse;
      this.cibles.push({ x: tx, y: ty, t: 0, duree, x0: o.x, y0: o.y });
    }
    if (this.minuteur('tournee', A.tournee.toutesLes, 3.5)) {
      const n = A.tournee.nombre, base = this.vise(o);
      this.bandeau('TOURNÉE GÉNÉRALE !', 0.7, '#ffb347');
      for (let k = 0; k < n; k++) this.balle(o.x, o.y, base + (k / (n - 1) - 0.5) * A.tournee.angle, A.tournee.vitesse, 'pinte', 10);
    }
  }

  lionel(A, o) {
    if (this.minuteur('frisbees', A.frisbees.periode) && this.balles.filter(b => b.type === 'frisbee').length < A.frisbees.max) {
      const a = Math.PI + (Math.random() < 0.5 ? -1 : 1) * Phaser.Math.FloatBetween(0.45, 0.8);
      this.balle(o.x - 40, o.y, a, A.frisbees.vitesse, 'frisbee', 11, { rebonds: 3 });
    }
    // SUPER LANCER : un trait rouge vers toi, puis un frisbee en feu très rapide sur ce trait
    if (this.minuteur('super', A.superLancer.toutesLes, 2.5)) {
      const S = A.superLancer, a = this.vise(o);
      this.traits.push({ x: o.x, y: o.y, a, t: 0, duree: S.preavis, fin: () => this.balle(o.x, o.y, a, S.vitesse, 'feu', 14) });
    }
  }

  greg(A, o) {
    if (this.minuteur('jabs', A.jabs.periode)) this.balle(o.x, o.y, this.vise(o), A.jabs.vitesse, 'jab', 9);
    // POING-FUSÉE : couloir rouge à ta hauteur, puis le gant traverse l'écran ; DEMPSEY ROLL = 3 à la suite
    const poing = (preavis) => this.alerteCouloir(this.vaisseau.y, A.poing.hauteur, preavis, () => {
      this.balle(LARGEUR - 160, this.couloirY, Math.PI, A.poing.vitesse, 'poing', 32);
    });
    if (this.minuteur('poing', A.poing.toutesLes, 2.5)) poing(A.poing.preavis);
    if (this.minuteur('dempsey', A.dempsey.toutesLes, 7)) this.dempsey(A.dempsey, o);
  }

  // DEMPSEY ROLL : un grand ∞ en pointillés rouges (le chemin du poing), puis le poing le parcourt en entier et repart.
  // On s'abrite DANS une boucle du ∞ ou loin de lui.
  dempsey(D, o) {
    this.bandeau('DEMPSEY ROLL !', 0.9, '#ff6b6b');
    const duree = D.duree / this.diff.vitesse, ch = { ...D, t: 0, preavis: D.preavis / Math.sqrt(this.diff.vitesse) };
    this.chemins.push(ch);
    this.att.poing = Math.max(this.att.poing || 0, ch.preavis + duree + 1.5);   // pas d'autre poing pendant le ∞
    this.att.jabs = Math.max(this.att.jabs || 0, ch.preavis + duree);
    this.time.delayedCall(ch.preavis * 1000, () => {
      if (this.etat !== 'jeu' || this.actuelle !== 3 || !this.chemins.includes(ch)) return;
      ch.actif = true; jouerSon(this, 'finale_dempsey');
      this.balles.push({ x: o.x, y: o.y, vx: 0, vy: 0, type: 'poing', r: 30, age: 0, chemin: ch, duree, x0: o.x, y0: o.y, approche: 0.35, trace: [] });
    });
  }
  pointInfini(ch, u) {
    const s = Math.sin(u), c = Math.cos(u), k = 1 + s * s;
    return { x: ch.cx + ch.largeur * c / k, y: ch.cy + ch.hauteur * s * c / k };
  }

  julien(A, o) {
    // pluie de COPIES qui tombent en se balançant
    if (this.minuteur('copies', A.copies.periode)) {
      const x = Phaser.Math.Between(30, 620);
      this.balles.push({ x, y: -10, vx: 0, vy: A.copies.vitesse * this.diff.vitesse, type: 'copie', r: 8, age: 0, balance: x });
    }
    // INTERRO SURPRISE : anneaux de « 20/20 », lents mais serrés
    if (this.minuteur('interro', A.interro.toutesLes, 3)) {
      const I = A.interro;
      this.bandeau('INTERRO SURPRISE !', 0.8, '#9fd0ff');
      for (let a = 0; a < I.anneaux; a++) this.time.delayedCall(a * I.ecart * 1000, () => {
        if (this.etat !== 'jeu' || this.actuelle !== 4) return;
        const dec = a * 0.5 * (2 * Math.PI / I.parAnneau);
        for (let k = 0; k < I.parAnneau; k++) this.balle(o.x, o.y, dec + k * 2 * Math.PI / I.parAnneau, I.vitesse, 'note', 9);
      });
    }
  }

  beufa(A, o) {
    const p = this.parties[5], C = A.cone;
    // CÔNE DE VISION qui balaie : dedans trop longtemps → « ! » et rafale ciblée ; dehors, rien
    this.cone = { x: o.x, y: o.y, a: Math.PI + Math.sin(this.T * C.balayage) * 0.75, demi: C.angle, portee: C.portee };
    const dx = this.px() - o.x, dy = this.vaisseau.y - o.y;
    const ecart = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - this.cone.a));
    if (ecart < C.angle && Math.hypot(dx, dy) < C.portee) this.repere = (this.repere || 0) + this.dt; else this.repere = Math.max(0, (this.repere || 0) - this.dt);
    if (this.repere >= C.repere && !(this.att.rafale > 0)) {
      this.repere = 0; this.att.rafale = 1.3;
      this.alerte = { x: this.vaisseau.x, y: this.vaisseau.y - 50, t: 0.6 };
      this.time.delayedCall(C.delai * 1000, () => { if (this.etat === 'jeu') this.laserRouge(); });
      for (let k = 0; k < C.rafale; k++) this.time.delayedCall(C.delai * 1000 + k * 90, () => { if (this.etat === 'jeu') this.balle(o.x, o.y, this.vise(o), C.vitesse, 'balle', 8); });
    }
    if (this.att.rafale > 0) this.att.rafale -= this.dt;
    if (this.minuteur('tirsB', A.tirs.periode)) this.balle(o.x, o.y, this.vise(o, Phaser.Math.FloatBetween(-0.15, 0.15)), A.tirs.vitesse, 'balle', 8);
    // DÉSESPOIR : sous 30 % de sa vie, un peu des attaques des 5 autres
    if (p.pv < p.pvMax * A.desespoir) {
      if (!this.desespoir) { this.desespoir = true; this.bandeau('BEUFA APPELLE LES AUTRES !', 1, '#ff6b6b'); }
      const At = R.attaques;
      if (this.minuteur('dKedric', At.kedric.ballons.periode * 2.2, 1)) for (let k = -1; k <= 1; k++) this.balle(o.x, o.y, this.vise(o, k * 0.25), At.kedric.ballons.vitesse, 'ballon', 9);
      if (this.minuteur('dLionel', At.lionel.frisbees.periode * 2.5, 2) && this.balles.filter(b => b.type === 'frisbee').length < 2)
        this.balle(o.x - 40, o.y, Math.PI + (Math.random() < 0.5 ? -0.6 : 0.6), At.lionel.frisbees.vitesse, 'frisbee', 11, { rebonds: 2 });
      if (this.minuteur('dJulien', At.julien.copies.periode * 3, 0.5)) { const x = Phaser.Math.Between(30, 620); this.balles.push({ x, y: -10, vx: 0, vy: At.julien.copies.vitesse * this.diff.vitesse, type: 'copie', r: 8, age: 0, balance: x }); }
    }
  }

  // (l'alerte « tu-tu » avant les attaques est RETIRÉE : Fabien la trouvait insupportable ; l'écran prévient déjà)
  // son des LASERS ROUGES ennemis (fourni par Fabien) : quand une attaque annoncée en rouge part ; pas deux à la fois
  laserRouge() {
    if (this.T < (this.prochainLaser || 0)) return;
    this.prochainLaser = this.T + 0.35;
    jouerSon(this, 'finale_laser_ennemi', { volume: 0.5 });
  }

  alerteCouloir(y, hauteur, preavis, fin) {
    y = Phaser.Math.Clamp(y, 40, HAUTEUR - 40);
    this.couloirs.push({ y, h: hauteur, t: 0, duree: preavis / Math.sqrt(this.diff.vitesse), fin: () => { this.couloirY = y; fin(); } });
  }

  // ---------- les tirs ennemis bougent, rebondissent, touchent ----------
  bougerBalles(dt, sansDegats = false) {
    const px = this.px(), py = this.vaisseau.y, rayon = R.vaisseau.rayon;
    for (const c of this.couloirs) if ((c.t += dt) >= c.duree && !c.parti) { c.parti = true; this.laserRouge(); c.fin(); }
    this.couloirs = this.couloirs.filter(c => !c.parti);
    for (const t of this.traits) if ((t.t += dt) >= t.duree && !t.parti) { t.parti = true; this.laserRouge(); t.fin(); }
    this.traits = this.traits.filter(t => !t.parti);
    // pintes en cloche : à l'arrivée, éclaboussure (touche) + flaque de mousse (ralentit)
    const M = R.attaques.remi.mousse;
    for (const c of this.cibles) {
      c.t += dt;
      if (c.t >= c.duree && !c.fini) {
        c.fini = true;
        this.flaques.push({ x: c.x, y: c.y, r: M.rayon, t: 0, duree: M.duree });
        this.explosion(c.x, c.y, 30, 0xfff2b0); jouerSon(this, 'finale_explosion', { volume: 0.4 });
        if (!sansDegats && Math.hypot(c.x - px, c.y - py) < 28 + rayon) this.blesse();
      }
    }
    this.cibles = this.cibles.filter(c => !c.fini);
    this.flaques = this.flaques.filter(f => (f.t += dt) < f.duree);
    for (const ch of this.chemins) ch.t += dt;
    this.balles = this.balles.filter(b => {
      b.age += dt;
      if (b.chemin) this.suivreInfini(b, dt);
      else { b.x += b.vx * dt; b.y += b.vy * dt; }
      if (b.type === 'copie') b.x = b.balance + Math.sin(b.age * 3 + b.balance) * 28;
      if (b.type === 'frisbee' && b.rebonds > 0 && (b.y < 12 || b.y > HAUTEUR - 12)) { b.vy *= -1; b.rebonds--; b.y = Phaser.Math.Clamp(b.y, 12, HAUTEUR - 12); }
      if (!sansDegats && Math.hypot(b.x - px, b.y - py) < b.r + rayon) { this.blesse(); return false; }
      return b.x > -60 && b.x < LARGEUR + 60 && b.y > -60 && b.y < HAUTEUR + 60;
    });
  }

  // le poing du DEMPSEY : approche jusqu'au bout droit du ∞, le parcourt une fois, puis repart vers le mécha
  suivreInfini(b, dt) {
    const ch = b.chemin, ax = b.x, ay = b.y;
    if (b.age < b.approche) {
      const k = b.age / b.approche, d = this.pointInfini(ch, 0);
      b.x = b.x0 + (d.x - b.x0) * k; b.y = b.y0 + (d.y - b.y0) * k;
    } else {
      const u = (b.age - b.approche) / b.duree * 2 * Math.PI;
      if (u >= 2 * Math.PI) { b.chemin = null; b.vx = 700; b.vy = 0; this.chemins = this.chemins.filter(c => c !== ch); return; }
      if (u > Math.PI && !b.mi) { b.mi = true; jouerSon(this, 'finale_dempsey'); }
      const p = this.pointInfini(ch, u); b.x = p.x; b.y = p.y;
    }
    b.vx = (b.x - ax) / Math.max(dt, 1e-3); b.vy = (b.y - ay) / Math.max(dt, 1e-3);   // (pour le bot : où il va)
    b.trace.unshift({ x: b.x, y: b.y }); if (b.trace.length > 6) b.trace.pop();
  }

  blesse() {
    if (this.invincible > 0 || this.etat !== 'jeu') return;
    this.vies--; this.stats.coups++;
    this.invincible = R.vaisseau.invincible;
    jouerSon(this, 'finale_touche');
    this.cameras.main.shake(250, 0.012); this.cameras.main.flash(120, 255, 60, 60);
    this.explosion(this.px(), this.vaisseau.y, 40, 0xff6b6b);
    // les tirs tout près disparaissent (on ne se fait pas toucher deux fois de suite)
    this.balles = this.balles.filter(b => Math.hypot(b.x - this.px(), b.y - this.vaisseau.y) > 130);
    this.majInterface();
    if (this.vies <= 0) this.gameOver();
  }

  // ======================= FIN : GAME OVER / VICTOIRE =======================
  gameOver() {
    this.etat = 'perdu'; this.termine = true;
    jouerSon(this, 'ui_defaite');
    this.explosion(this.px(), this.vaisseau.y, 80);
    this.vaisseau.setVisible(false); this.point.setVisible(false);
    const i = this.actuelle, t = estTactile();
    voile(this, 0.8).setDepth(1000);
    texte(this, LARGEUR / 2, 150, 'GAME OVER', 60, '#ff6b6b', { fontStyle: 'bold' }).setDepth(1001);
    texte(this, LARGEUR / 2, 235, `${this.parties[i].nom} et les autres te narguent… Parties détruites : ${i} / 6`, 22, '#ffffff').setDepth(1001);
    texte(this, LARGEUR / 2, 320, `${t ? 'Continuer' : 'ESPACE'} : CONTINUER (on reprend à ${this.parties[i].nom}, sans record)`, 22, '#7fff7f').setDepth(1001);
    texte(this, LARGEUR / 2, 360, `${t ? 'Début' : 'Z'} : tout recommencer      ${t ? 'Hub' : 'X'} : retour au hub`, 20, '#aaaaaa').setDepth(1001);
    etiquettesTactiles({ espace: 'Continuer', z: 'Début', x: 'Hub', haut: null, bas: null, gauche: null, droite: null });
    const base = { rejouer: true, nomDiff: this.nomDiff, diffObjet: this.diff };
    this.time.delayedCall(800, () => {
      let fait = false;
      const une = (f) => () => { if (fait) return; fait = true; f(); };
      const kb = this.input.keyboard;
      kb.once('keydown-SPACE', une(() => this.scene.restart({ ...base, reprise: i, continues: this.stats.continues + 1 })));
      kb.once('keydown-Z', une(() => this.scene.restart(base)));
      kb.once('keydown-X', une(() => this.retourHub()));
    });
  }
  continuer() { this.input.keyboard.emit('keydown-SPACE'); }   // (bot)

  finDuMecha() {
    this.etat = 'explose';
    this.temps = this.T - this.debut;
    this.bandeau('LE MÉCHA EXPLOSE !', 2, '#ffd84a');
    for (let k = 0; k < 16; k++) this.time.delayedCall(k * 140, () => {
      this.explosion(this.mecha.x + Phaser.Math.Between(-150, 150), Phaser.Math.Between(80, 500), Phaser.Math.Between(40, 90));
      if (k % 3 === 0) { jouerSon(this, k % 6 ? 'finale_explosion' : 'finale_partie'); this.cameras.main.shake(200, 0.015); }
    });
    this.time.delayedCall(2600, () => { this.cameras.main.flash(600, 255, 255, 255); this.parties.forEach(p => p.spr.setVisible(false)); });
    this.time.delayedCall(3400, () => { this.gagne = true; this.victoire(this.messageFin()); });
  }

  classement() {
    const V = R, perfect = this.stats;
    const score = 50 * Math.max(0, this.vies) / this.viesMax + 30 * Math.min(1, V.par / Math.max(1, this.temps)) + 20 * Math.max(0, 1 - perfect.bombes / 4);
    let r = V.rangs.find(x => score >= x.seuil);
    if (perfect.continues > 0 && (r.rang === 'S' || r.rang === 'A')) r = V.rangs.find(x => x.rang === 'B');   // CONTINUE : au mieux B
    return { ...r, score };
  }

  messageFin() {
    const r = this.classement(), cont = this.stats.continues > 0;
    const record = cont ? null : Sauvegarde.proposerRecord(cleRecord(IDENTITE.id, this.nomDiff), r.rang, this.temps, R.rangs.map(x => x.rang));
    this.resultat = { r, record, nouveau: record && record.rang === r.rang && Math.abs(record.temps - this.temps) < 0.01 };
    const defis = cont ? ['(CONTINUE utilisé : ni record ni défis)'] : lignesDefis(IDENTITE.id, [
      { id: 'intouchable', test: () => this.stats.coups === 0 },
      { id: 'sansBombe', test: () => this.stats.bombes === 0 },
      { id: 'rapide', test: () => this.temps < R.defiTemps },
    ]);
    return `Le mécha des Bracass' est détruit !\nRANG ${rangLisible(r.nom, r.rang)}   -   temps ${formatTemps(this.temps)}\n` +
      `Cœurs restants : ${this.vies} / ${this.viesMax}   ·   bombes utilisées : ${this.stats.bombes}` +
      (record ? `\nRecord : ${rangLisible((trouverRang(R.rangs, record.rang) || {}).nom || record.rang, record.rang)} en ${formatTemps(record.temps)}` : '') +
      `\nMode ${this.diff.nom}\n` + defis.join('\n');
  }

  ecranVictoire(message) {
    const P = 1000, { r, nouveau } = this.resultat;
    voile(this, 0.85).setDepth(P);
    const titre = texte(this, LARGEUR / 2, 60, 'VICTOIRE FINALE !!', 56, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 10 }).setDepth(P + 1).setScale(2.5).setAlpha(0);
    this.tweens.add({ targets: titre, scale: 1, alpha: 1, duration: 350, ease: 'Back.Out' });
    const lettre = texte(this, 150, 300, r.rang, 110, '#ffffff', { fontStyle: 'bold', stroke: '#b3202c', strokeThickness: 12 }).setDepth(P + 1).setScale(0);
    this.tweens.add({ targets: lettre, scale: 1, delay: 700, duration: 300, ease: 'Back.Out' });
    texte(this, 150, 215, 'RANG', 24, '#ffd84a').setDepth(P + 1);
    texte(this, 150, 385, r.nom, 22, '#ffd84a', { fontStyle: 'bold', wordWrap: { width: 260 }, align: 'center' }).setDepth(P + 1);
    if (nouveau) texte(this, 150, 425, '★ NOUVEAU RECORD ★', 18, '#7fff7f').setDepth(P + 1);
    const bloc = texte(this, 320, 130, message.split('\n').slice(1).join('\n').replace(/★ DÉFI RÉUSSI : /g, '★ ').replace(/Défi déjà réussi : /g, '✓ ').replace(/Défi à débloquer : /g, '☐ '),
      18, '#ffffff', { align: 'left', lineSpacing: 6, wordWrap: { width: 600 }, backgroundColor: '#000000aa', padding: { x: 12, y: 10 } }).setOrigin(0, 0).setDepth(P + 1);
    if (bloc.height > 340) bloc.setScale(340 / bloc.height);
    texte(this, LARGEUR / 2, HAUTEUR - 30, `${estTactile() ? 'OK' : 'ESPACE'} : la suite…`, 20, '#aaaaaa').setDepth(P + 1);
  }

  // après la victoire : la FIN (les 6 Bracass' au complet) au lieu du hub
  retourHub() {
    if (this.gagne) this.scene.start('Finale');
    else super.retourHub();
  }

  // ======================= DESSIN =======================
  bandeau(txt, duree, couleur = '#ffd84a') {
    const b = this.bandeauTxt; this.tweens.killTweensOf(b);
    b.setText(txt).setColor(couleur).setAlpha(1).setScale(1.4);
    this.tweens.add({ targets: b, scale: 1, duration: 200, ease: 'Back.Out' });
    this.tweens.add({ targets: b, alpha: 0, delay: duree * 1000, duration: 250 });
  }
  eclat(x, y, couleur) { this.eclats.push({ x, y, t: 0, couleur }); }
  explosion(x, y, r, couleur = 0xffb347) { this.explos.push({ x, y, r, t: 0, duree: 0.5, couleur }); }

  majInterface() {
    if (this.vies === undefined) { this.txtVies.setText(''); this.txtBombe.setText('BOMBE'); return; }
    this.txtVies.setText('❤'.repeat(Math.max(0, this.vies)) + '♡'.repeat(Math.max(0, this.viesMax - this.vies)));
    this.txtBombe.setText(`BOMBE\nx${this.bombes}`);
    this.btnBombe.setAlpha(this.bombes > 0 ? 1 : 0.4);
    const p = this.parties[this.actuelle];
    this.txtPartie.setText(p ? `${p.nom} (${this.actuelle + 1}/6)` : '');
  }

  dessiner() {
    const g = this.gBalles.clear(), a = this.gAlertes.clear(), e = this.gEffets.clear(), t = this.gTirs.clear();
    // barre de vie de la partie visée
    const B = this.gBarre.clear(), p = this.parties[this.actuelle];
    if (p && this.vies !== undefined) {
      B.fillStyle(0x000000, 0.7).fillRect(LARGEUR / 2 - 160, 34, 320, 14);
      B.fillStyle(0xff4a5a, 1).fillRect(LARGEUR / 2 - 158, 36, 316 * Math.max(0, p.pv) / p.pvMax, 10);
      // cadre jaune clignotant autour de la partie à détruire
      if (!p.detruite && this.etat === 'jeu' && Math.floor(this.T * 4) % 2) {
        const c = p.centre, h = this.versEcran(c.x0, c.y0), b = this.versEcran(c.x1, c.y1), L = 18;
        a.lineStyle(4, 0xffd84a, 1);
        for (const [x, y, sx, sy] of [[h.x, h.y, 1, 1], [b.x, h.y, -1, 1], [h.x, b.y, 1, -1], [b.x, b.y, -1, -1]]) {
          a.lineBetween(x, y, x + sx * L, y); a.lineBetween(x, y, x, y + sy * L);
        }
      }
    }
    // alertes : couloirs rouges, traits, cibles au sol, flaques, cône
    for (const c of this.couloirs) {
      const clign = Math.floor(c.t * 10) % 2 ? 0.35 : 0.18;
      a.fillStyle(0xff2040, clign).fillRect(0, c.y - c.h / 2, LARGEUR, c.h);
      a.lineStyle(2, 0xff2040, 0.9).strokeRect(0, c.y - c.h / 2, LARGEUR, c.h);
    }
    for (const tr of this.traits) {
      a.lineStyle(3 + 4 * tr.t / tr.duree, 0xff3030, 0.5 + 0.5 * (Math.floor(tr.t * 12) % 2));
      a.lineBetween(tr.x, tr.y, tr.x + Math.cos(tr.a) * 1200, tr.y + Math.sin(tr.a) * 1200);
    }
    for (const ch of this.chemins) {
      const clign = ch.actif ? 0.18 : (Math.floor(ch.t * 8) % 2 ? 0.95 : 0.45);
      a.fillStyle(0xff2a3a, clign);
      for (let k = 0; k < 64; k++) { const q = this.pointInfini(ch, k / 64 * 2 * Math.PI); a.fillCircle(q.x, q.y, ch.actif ? 4 : 6); }
    }
    for (const f of this.flaques) a.fillStyle(0xfff2b0, 0.35 * (1 - f.t / f.duree) + 0.15).fillCircle(f.x, f.y, f.r);
    for (const c of this.cibles) {
      const k = c.t / c.duree;
      a.lineStyle(3, 0xffb347, 0.9).strokeCircle(c.x, c.y, 28); a.lineStyle(2, 0xffb347, 0.6).strokeCircle(c.x, c.y, 28 * (1 - k) + 4);
      // la pinte vole en cloche vers sa cible
      const x = c.x0 + (c.x - c.x0) * k, y = c.y0 + (c.y - c.y0) * k - Math.sin(k * Math.PI) * 160;
      g.fillStyle(0xf2b630, 1).fillRect(x - 7, y - 9, 14, 18); g.fillStyle(0xffffff, 1).fillRect(x - 8, y - 12, 16, 5);
    }
    if (p && p.id === 'beufa' && this.cone && this.etat === 'jeu') {
      const c = this.cone, k = Math.min(1, (this.repere || 0) / R.attaques.beufa.cone.repere);
      a.fillStyle(k > 0 ? 0xff3030 : 0xffe14a, 0.13 + 0.15 * k);
      a.slice(c.x, c.y, c.portee, c.a - c.demi, c.a + c.demi, false).fillPath();
    }
    if (this.alerte && (this.alerte.t -= this.dt || 0) > 0) e.fillStyle(0xffd84a, 1).fillTriangle(this.alerte.x - 12, this.alerte.y - 30, this.alerte.x + 12, this.alerte.y - 30, this.alerte.x, this.alerte.y);
    // tes tirs
    t.fillStyle(0xfff27a, 1);
    for (const s of this.tirs) t.fillRect(s.x - 10, s.y - 2, 20, 4);
    // tirs ennemis (contour sombre : bien lisibles sur le décor)
    for (const b of this.balles) {
      g.lineStyle(2, 0x000000, 0.8);
      switch (b.type) {
        case 'ballon': g.fillStyle(0x8b4a20, 1).fillEllipse(b.x, b.y, b.r * 2.6, b.r * 1.8).strokeEllipse(b.x, b.y, b.r * 2.6, b.r * 1.8); g.lineStyle(1, 0xffffff, 1).lineBetween(b.x - 5, b.y, b.x + 5, b.y); break;
        case 'defenseur': g.fillStyle(0x2a5acc, 1).fillCircle(b.x, b.y, b.r).strokeCircle(b.x, b.y, b.r); g.fillStyle(0xffffff, 1).fillRect(b.x - b.r, b.y - 3, b.r * 2, 6); break;
        case 'pinte': g.fillStyle(0xf2b630, 1).fillRect(b.x - 7, b.y - 9, 14, 18).strokeRect(b.x - 7, b.y - 9, 14, 18); g.fillStyle(0xffffff, 1).fillRect(b.x - 8, b.y - 12, 16, 5); break;
        case 'frisbee': g.fillStyle(0xff8a1c, 1).fillEllipse(b.x, b.y, b.r * 2.4, b.r * 1.3).strokeEllipse(b.x, b.y, b.r * 2.4, b.r * 1.3); break;
        case 'feu': g.fillStyle(0xff3b1c, 1).fillCircle(b.x, b.y, b.r).strokeCircle(b.x, b.y, b.r); g.fillStyle(0xffe14a, 0.8).fillCircle(b.x + 12, b.y, b.r * 0.8); break;
        case 'poing':
          if (b.trace) b.trace.forEach((q, k) => g.fillStyle(0xd8202c, 0.35 - k * 0.05).fillCircle(q.x, q.y, b.r * (1 - k * 0.08)));
          // un GANT DE BOXE : poing rouge, pouce, poignet blanc (côté mécha, à droite), reflet
          g.lineStyle(3, 0x000000, 0.9);
          g.fillStyle(0xf2f2f2, 1).fillRect(b.x + b.r * 0.55, b.y - b.r * 0.55, b.r * 0.6, b.r * 1.1).strokeRect(b.x + b.r * 0.55, b.y - b.r * 0.55, b.r * 0.6, b.r * 1.1);
          g.fillStyle(0xd8202c, 1).fillCircle(b.x, b.y, b.r).strokeCircle(b.x, b.y, b.r);
          g.fillStyle(0xd8202c, 1).fillEllipse(b.x + b.r * 0.1, b.y + b.r * 0.62, b.r * 0.9, b.r * 0.55).strokeEllipse(b.x + b.r * 0.1, b.y + b.r * 0.62, b.r * 0.9, b.r * 0.55);
          g.fillStyle(0xffffff, 0.55).fillEllipse(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.6, b.r * 0.35); break;
        case 'jab': g.fillStyle(0xd8202c, 1).fillCircle(b.x, b.y, b.r).strokeCircle(b.x, b.y, b.r); break;
        case 'copie': g.fillStyle(0xffffff, 1).fillRect(b.x - 7, b.y - 9, 14, 18).strokeRect(b.x - 7, b.y - 9, 14, 18); g.lineStyle(1, 0x3060c0, 1).lineBetween(b.x - 4, b.y - 3, b.x + 4, b.y - 3).lineBetween(b.x - 4, b.y + 2, b.x + 4, b.y + 2); break;
        case 'note': g.fillStyle(0xff3a5a, 1).fillCircle(b.x, b.y, b.r).strokeCircle(b.x, b.y, b.r); g.fillStyle(0xffffff, 1).fillCircle(b.x, b.y, b.r * 0.45); break;
        default: g.fillStyle(0x9cff6a, 1).fillCircle(b.x, b.y, b.r).strokeCircle(b.x, b.y, b.r);
      }
    }
    for (const x of this.eclats) e.fillStyle(x.couleur, 1 - x.t / 0.25).fillCircle(x.x, x.y, 4 + 16 * x.t);
    for (const x of this.explos) {
      const k = x.t / x.duree;
      e.fillStyle(x.couleur, 0.9 * (1 - k)).fillCircle(x.x, x.y, x.r * (0.4 + k));
      e.fillStyle(0xffffff, 0.8 * (1 - k)).fillCircle(x.x, x.y, x.r * 0.5 * (1 - k));
    }
  }
}
