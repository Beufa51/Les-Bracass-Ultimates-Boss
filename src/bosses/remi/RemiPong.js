// =====================================================================
// RÉMI — JEU 2 : LE BEER PONG (V4 : caméra proche, LANCE-PIERRE)
// Toute la table est visible (V5) : tes verres en bas, ceux de Rémi en haut, Rémi derrière.
// LANCER : pose le doigt (ou la souris) n'importe où sous Rémi et TIRE VERS LE BAS (vers toi) comme un lance-pierre ;
//   plus tu tires loin = plus loin ; tirer à gauche envoie à droite (et inversement). Les POINTILLÉS montrent TOUTE la trajectoire,
//   jusqu'à la retombée (FACILE : + le point d'arrivée ; CHAMPION : pointillés plus espacés). Lâche = la balle part.
//   Clavier : ◀ ▶ direction, ▲ ▼ force, ESPACE lance.
// 2 balles par tour ; les 2 dedans = BALLS BACK. 3 verres de suite = EN FEU (trajectoire entière, lancer plus précis).
// Chaque verre que Rémi te met, tu le bois : ta visée tangue. Rémi agite parfois les bras pour te déconcentrer :
//   touche-le (ou Z) pour lui dire « Chut ! ».
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, PONG as P, REPLIQUES } from './reglages.js';
import { remi } from './dessins.js';
import { bulle, annonce, jeuSuivant, ecranPerdu, difficulteOuChoix, hasard, choisir , laisserPasserTactile } from './commun.js';

// ---------- projection : caméra en retrait et en hauteur : toute la table tient dans l'écran (bord de Rémi y≈190, le tien y≈520) ----------
const CAM_Z = -2, CAM_H = 1.416, F = 984, HORIZON = -177, CX = LARGEUR / 2;
const D = P.table.longueur, W = P.table.largeur, H_VERRE = 0.12, G = 9.8;
function proj(x, y, z) {
  const p = F / (z - CAM_Z);
  return { x: CX + x * p, y: HORIZON + (CAM_H - y) * p, k: p };
}
const DEPART = { x: 0, y: 0.1, z: 0.55 };       // ta balle, juste devant ta pyramide de verres
const BOUTON_REBOND = { x: 880, y: 455, r: 52 };   // bouton « REBOND » (en bas à droite)
const ETIQUETTES_VIDES = { haut: null, bas: null, gauche: null, droite: null, espace: null, z: null, x: null };

// pyramide de verres, pointe vers le milieu de la table ; loin = côté de Rémi
function pyramide(n, loin) {
  const rangs = n >= 10 ? [4, 3, 2, 1] : n >= 6 ? [3, 2, 1] : [2, 1];
  const r = P.rayon, dz = r * 1.75, v = [];
  rangs.forEach((nb, i) => {
    for (let k = 0; k < nb; k++) {
      const x = (k - (nb - 1) / 2) * r * 2.02, z = 0.13 + i * dz;
      v.push({ x, z: loin ? D - z : z, plein: true, bu: 0, flash: 0, rang: i, col: k - (nb - 1) / 2 });
    }
  });
  return v;
}

export class RemiPong extends BossScene {
  constructor() { super('RemiPong', IDENTITE); }

  create() {
    // la scène est RÉUTILISÉE d'une partie à l'autre : on oublie les objets créés « à la demande » la fois d'avant
    // (sinon on réutilise un texte déjà détruit → bug « drawImage » à la 2e partie)
    this.imgRemi = null; this.imgDouble = null; this.txtRebond = null; this.rebond = false; this.prochainHoquet = undefined; this.hoquet = 0; this.prep = null;
    this.etat = 'intro';             // intro | vise | vol | remi | pause | fin
    this.horloge = 0; this.ivresse = 0; this.ivresseRemi = 0; this.serie = 0; this.feu = false;
    this.balle = null; this.tir = null; this.distrait = 0; this.gouttes = []; this.flashBiere = 0;
    this.visee = { x: 0, f: 0.45 };   // clavier : direction (m) et force (0 à 1)
    this.verresRemi = pyramide(P.verres, true);
    this.verresToi = pyramide(P.verres, false);
    this.decor();
    this.gRemi = this.add.graphics().setDepth(3);
    this.g = this.add.graphics().setDepth(5);
    this.gDouble = this.add.graphics().setDepth(5.5).setAlpha(0.35);
    this.gVisee = this.add.graphics().setDepth(6);
    this.hud = texte(this, LARGEUR / 2, 24, '', 20, '#ffffff', { fontStyle: 'bold' }).setDepth(900);
    this.hudTour = texte(this, 16, 516, '', 18, '#7fff7f', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 8, y: 3 }, align: 'left' }).setOrigin(0, 0.5).setDepth(900);
    this.touches = creerTouches(this);
    laisserPasserTactile(this);   // les blocs de boutons cachés ne mangent plus les touchers
    jouerMusique(this, 'remi_musique_bar');   // la musique du bar (dès l'écran des commandes)
    this.installerTir();
    this.pose = 'face'; this.poseFin = 0;

    etiquettesTactiles({ ...ETIQUETTES_VIDES, espace: 'OK' });
    const t = estTactile();
    this.afficherIntro('RÉMI - Le beer pong', [
      'Vide les verres de Rémi avant qu\'il vide les tiens !',
      `LANCE-PIERRE : pose ${t ? 'le doigt' : 'la souris'} au milieu de l'écran, TIRE VERS LE BAS, lâche`,
      'Plus tu tires loin = plus loin ; les pointillés montrent la trajectoire',
      t ? '' : 'Clavier : ◀ ▶ direction, ▲ ▼ force, ESPACE lance',
      '2 balles par tour ; les 2 dedans = BALLS BACK ; 3 de suite = EN FEU',
      `Rémi agite les bras ? ${t ? 'Touche-le' : 'Clique sur lui (ou Z)'} : « Chut ! »`,
      `Bouton REBOND${t ? '' : ' (ou X)'} : la balle rebondit sur la table, plus dur... mais 2 VERRES !`,
      `Quand Rémi se concentre : ${t ? 'touche' : 'ESPACE'} quand le cercle est tout petit = tu le déconcentres`,
    ].filter(Boolean), () => difficulteOuChoix(this, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.demarrer(); }));
  }

  demarrer() {
    this.tourDe('toi');
    bulle(this, 'Rémi : « Les invités d\'abord. Vas-y, rate. »', '#ffd84a', 2.4, 250);
  }

  tourDe(qui) {
    this.qui = qui; this.balles = 2; this.reussis = 0; this.ballsBack = false;
    if (qui === 'toi') this.commencerVisee();
    else { this.etat = 'remi'; etiquettesTactiles(ETIQUETTES_VIDES); this.time.delayedCall(500, () => this.prepRemi()); }
  }

  // ---------- décor fixe : le bar, la table ----------
  decor() {
    this.cameras.main.setBackgroundColor('#1a0f12');
    const g = this.add.graphics().setDepth(1);
    g.fillGradientStyle(0x2a1418, 0x2a1418, 0x120a0c, 0x120a0c, 1).fillRect(0, 0, LARGEUR, HAUTEUR);
    for (const y of [50, 112]) {
      g.fillStyle(0x4a2a18, 1).fillRect(40, y + 30, 880, 8);
      for (let x = 60; x < 910; x += 26) {
        const c = choisir([0x2e7d32, 0x8d5a2b, 0x9fd8e8, 0xb03a3a, 0xd8c060]);
        g.fillStyle(c, 0.85).fillRect(x, y + 4, 12, 26).fillRect(x + 4, y - 6, 4, 10);
      }
    }
    // l'illustration de l'intérieur du bar (derrière Rémi), si elle est là : remplace les étagères dessinées
    if (this.textures.exists('remi_bar_interieur')) {
      const im = this.add.image(LARGEUR / 2, 0, 'remi_bar_interieur').setOrigin(0.5, 0).setDepth(1.5);
      im.setScale(Math.max(LARGEUR / im.width, 300 / im.height));
    }
    if (!this.textures.exists('remi_bar_interieur')) {   // (l'illustration a déjà son néon)
      const neon = texte(this, 140, 30, 'BEER PONG', 26, '#4fe8ff', { fontStyle: 'bold', stroke: '#06404a', strokeThickness: 5 }).setDepth(2).setAngle(-6);
      this.tweens.add({ targets: neon, alpha: 0.6, yoyo: true, repeat: -1, duration: 700 });
    }
    // table (trapèze en perspective) : du bout de Rémi jusque sous l'écran
    const t = this.add.graphics().setDepth(4);
    const a = proj(-W / 2, 0, 0), b = proj(W / 2, 0, 0), c = proj(W / 2, 0, D), d = proj(-W / 2, 0, D);
    t.fillStyle(0x1a3a6a, 1).fillPoints([a, b, c, d], true);
    t.lineStyle(5, 0xffffff, 0.85).strokePoints([a, b, c, d], true);
    const m1 = proj(0, 0, 0), m2 = proj(0, 0, D);
    t.lineStyle(2, 0xffffff, 0.3).lineBetween(m1.x, m1.y, m2.x, m2.y);
    const e = proj(-W / 2, 0, D / 2), f = proj(W / 2, 0, D / 2);
    t.lineStyle(3, 0xffffff, 0.5).lineBetween(e.x, e.y, f.x, f.y);
    t.fillStyle(0x0e2240, 1).fillRect(a.x, a.y, b.x - a.x, 18);   // épaisseur du bord de table
  }

  // ---------- ton tour : le lance-pierre ----------
  commencerVisee() {
    this.etat = 'vise'; this.viseDepuis = this.horloge; this.tir = null;
    etiquettesTactiles(ETIQUETTES_VIDES);
    // Rémi essaie parfois de te déconcentrer
    if (Math.random() < this.diff.distrait) {
      this.time.delayedCall(hasard(300, 1200), () => {
        if (this.etat !== 'vise') return;
        this.distrait = 3; this.poseTemp('nargue', 3);
        bulle(this, `Rémi agite les bras ! ${estTactile() ? 'Touche-le' : 'Clique sur lui (ou Z)'} : « Chut ! »`, '#ffb070', 1.6, 300);
      });
    }
  }

  // TIR REBOND : la balle rebondit une fois sur la table avant les verres. Plus dur (imprécision x1,5, aimant /2),
  // mais s'il rentre : DEUX VERRES d'un coup.
  basculerRebond() {
    this.rebond = !this.rebond;
    jouerSon(this, 'remi_rebond');
    bulle(this, this.rebond ? 'TIR REBOND : plus dur, mais 2 verres s\'il rentre !' : 'Tir normal', this.rebond ? '#ffb070' : '#ffffff', 1, 300);
  }

  // vol du tir rebond : jusqu'à la table (point de rebond), puis de la table jusqu'au haut des verres
  volRebond(depart, tx, tz) {
    const zb = tz - 0.45, xb = depart.x + (tx - depart.x) * 0.55;
    const T1 = P.dureeVol * 0.55, T2 = 0.32;
    const v1 = { T: T1, vx: (xb - depart.x) / T1, vz: (zb - depart.z) / T1, vy: (0 - depart.y + G * T1 * T1 / 2) / T1 };
    const v2 = { T: T2, vx: (tx - xb) / T2, vz: (tz - zb) / T2, vy: (H_VERRE + G * T2 * T2 / 2) / T2 };
    return { v1, v2, xb, zb };
  }

  chut() {
    if (this.distrait <= 0) return;
    this.distrait = 0; this.pose = 'face';
    bulle(this, '« CHUT ! »', '#7fff7f', 0.9, 300);
    jouerSon(this, 'ui_valider');
  }

  installerTir() {
    this.input.on('pointerdown', (p) => {
      if (this.termine) return;
      if (this.etat === 'remiPrep') { this.souffler(); return; }
      if (this.etat !== 'vise') return;
      if (Math.hypot(p.x - BOUTON_REBOND.x, p.y - BOUTON_REBOND.y) < BOUTON_REBOND.r) { this.basculerRebond(); return; }
      if (p.y < 240 && Math.abs(p.x - CX) < 150) { this.chut(); return; }   // toucher Rémi
      this.tir = { x0: p.x, y0: p.y, x: p.x, y: p.y };
    });
    this.input.on('pointermove', (p) => { if (this.tir) { this.tir.x = p.x; this.tir.y = p.y; } });
    this.input.on('pointerup', () => {
      if (!this.tir) return;
      const c = this.cibleTir(); this.tir = null;
      if (this.etat === 'vise' && c) this.lancerToi(c.x, c.z);
    });
  }

  // cible (sans tangage) du lance-pierre en cours : tirer vers le bas = force ; tirer à gauche = envoie à droite
  cibleTir() {
    const t = this.tir;
    if (!t) return null;
    const dx = t.x - t.x0, dy = t.y - t.y0, l = Math.hypot(dx, dy);
    if (l < 25 || dy < 10) return null;
    const f = Math.min(1, l / P.tirage);
    return { x: Phaser.Math.Clamp(-dx / P.tirage * 0.9, -W / 2, W / 2), z: 1.0 + f * 1.05, f };
  }

  // tangage de l'ivresse (+ Rémi qui agite les bras)
  tangage() {
    const a = this.ivresse * P.ivresse + (this.distrait > 0 ? 0.05 : 0), v = 1 + this.ivresse * 0.25;
    // HOQUET : une secousse brève et forte
    const h = this.hoquet > 0 ? Math.sin(this.hoquet * 30) * 0.09 * this.hoquet / 0.4 : 0;
    return { x: a * Math.sin(this.horloge * 1.7 * v) + h, z: a * 1.6 * Math.cos(this.horloge * 1.13 * v) + h * 0.8 };
  }

  // part de la courbe d'aide encore visible (l'alcool efface la retombée)
  partCourbe() { return this.feu ? 1 : Math.max(0.25, Math.min(this.diff.apercu, 1 - this.ivresse * P.courbeBue)); }

  update(temps, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.horloge += dt;
    this.distrait = Math.max(0, this.distrait - dt);
    this.flashBiere = Math.max(0, this.flashBiere - dt);
    // hoquets quand on a trop bu (pendant ta visée)
    this.hoquet = Math.max(0, (this.hoquet || 0) - dt);
    if (this.etat === 'vise' && this.ivresse >= P.hoquet) {
      this.prochainHoquet = (this.prochainHoquet ?? 3) - dt;
      if (this.prochainHoquet <= 0) {
        this.prochainHoquet = hasard(3, 7) / (1 + (this.ivresse - P.hoquet) * 0.3);
        this.hoquet = 0.4; jouerSon(this, 'remi_hips');
        bulle(this, 'HIPS !', '#ffb070', 0.6, 300);
      }
    }
    if (this.etat === 'vise') this.viseClavier(dt);
    if (this.etat === 'remiPrep') {
      this.prep.t += dt;
      if (vientDAppuyer(this.touches.espace) || vientDAppuyer(this.touches.z)) this.souffler();
      if (this.prep.t >= this.prep.d) this.lancerRemi();
    }
    if (this.balle) this.balleVol(dt);
    this.gouttesPas(dt);
    this.dessiner(dt);
  }

  viseClavier(dt) {
    const T = this.touches, v = this.visee;
    if (T.gauche.isDown) v.x -= 0.4 * dt;
    if (T.droite.isDown) v.x += 0.4 * dt;
    if (T.haut.isDown) v.f += 0.5 * dt;
    if (T.bas.isDown) v.f -= 0.5 * dt;
    v.x = Phaser.Math.Clamp(v.x, -W / 2, W / 2); v.f = Phaser.Math.Clamp(v.f, 0, 1);
    if (vientDAppuyer(T.z)) this.chut();
    if (vientDAppuyer(T.x)) this.basculerRebond();
    if (vientDAppuyer(T.espace) && this.horloge - this.viseDepuis > 0.25) this.lancerToi(v.x, 1.0 + v.f * 1.05);
  }

  lancerToi(tx, tz) {
    const s = this.tangage(), e = this.diff.erreur * (this.feu ? 0.5 : 1);
    // imprécision du bras (augmente avec l'alcool)
    const e2 = this.rebond ? Math.max(0.045, e * 1.5) * (1 + this.ivresse * 0.15) : e * (1 + this.ivresse * 0.15), ex = hasard(-1, 1) * e2, ez = hasard(-1, 1) * e2 * 1.2;
    this.balles--;
    this.etat = 'vol'; this.distrait = 0;
    // AIMANT : à jeun, la balle est attirée vers le verre le plus proche de la cible (de moins en moins quand on a bu)
    let ax = tx + s.x, az = tz + s.z;
    const aim = Math.max(0, P.aimant - this.ivresse * 0.12) * (this.rebond ? 0.5 : 1);
    let proche = null, dmin = 0.13;
    for (const v of this.verresRemi) if (v.plein) { const d = Math.hypot(v.x - ax, v.z - az); if (d < dmin) { dmin = d; proche = v; } }
    if (proche) { ax += (proche.x - ax) * aim; az += (proche.z - az) * aim; }
    this.lancer(DEPART, ax + ex, az + ez, this.verresRemi, 'toi');
    if (this.rebond) {
      const r = this.volRebond(DEPART, ax + ex, az + ez);
      Object.assign(this.balle, r.v1, { etat: 'vol1', rebondTir: r });
    }
    jouerSon(this, 'remi_lance');
  }

  // Rémi se concentre 1 s avant de lancer : un cercle se resserre sur lui ; toucher (ou ESPACE / Z) quand il est TOUT PETIT
  // = « FFFFF ! » : tu le déconcentres, son lancer est bien moins précis. Trop tôt = raté pour ce lancer.
  prepRemi() {
    if (this.termine) return;
    this.etat = 'remiPrep'; this.prep = { t: 0, d: 1.0, fait: false, reussi: false };
  }

  souffler() {
    const p = this.prep;
    if (!p || p.fait) return;
    p.fait = true;
    p.reussi = p.t > p.d - 0.3;
    if (p.reussi) { bulle(this, '« FFFFFF ! » Rémi est déconcentré !', '#7fff7f', 1, 300); jouerSon(this, 'remi_hips', { rate: 0.6 }); }
    else bulle(this, 'Trop tôt...', '#ffb0b0', 0.7, 300);
  }

  lancerRemi() {
    if (this.termine) return;
    const souffle = this.prep && this.prep.reussi; this.prep = null; this.etat = 'remi';
    const pleins = this.verresToi.filter(v => v.plein);
    const cible = choisir(pleins);
    const chance = Math.max(0.05, this.diff.remi - this.ivresseRemi * 0.025 - (souffle ? 0.3 : 0));
    let tx, tz;
    const a = Math.random() * Math.PI * 2;
    if (Math.random() < chance) { const r = Math.random() * P.rayon * 0.5; tx = cible.x + Math.cos(a) * r; tz = cible.z + Math.sin(a) * r; }
    else { const r = hasard(P.rayon * 1.3, P.rayon * 3.2); tx = cible.x + Math.cos(a) * r; tz = cible.z + Math.sin(a) * r; }
    this.balles--;
    this.poseTemp('lance', 0.6);
    this.lancer({ x: hasard(-0.12, 0.12), y: 0.5, z: D + 0.2 }, tx, tz, this.verresToi, 'remi');
    jouerSon(this, 'remi_lance');
  }

  // vol en cloche jusqu'au plan du haut des verres
  parametresVol(depart, tx, tz) {
    const dist = Math.hypot(tx - depart.x, tz - depart.z);
    const T = P.dureeVol * (0.6 + 0.4 * dist / D);
    return { T, vx: (tx - depart.x) / T, vz: (tz - depart.z) / T, vy: (H_VERRE - depart.y + G * T * T / 2) / T };
  }

  lancer(depart, tx, tz, verres, qui) {
    this.balle = { x: depart.x, y: depart.y, z: depart.z, t: 0, tx, tz, verres, qui, etat: 'vol', fin: 0, rebonds: 0, trace: [],
      ...this.parametresVol(depart, tx, tz) };
  }

  balleVol(dt0) {
    const b = this.balle;
    let dt = dt0;
    // RALENTI quand TA balle redescend tout près d'un verre (et pendant qu'elle tourne sur le rebord)
    if (b.qui === 'toi' && (b.etat === 'rebord' || (b.etat === 'vol' && b.vy < 0 && b.y < 0.5 &&
      b.verres.some(v => v.plein && Math.hypot(v.x - b.tx, v.z - b.tz) < P.rayon * 1.6)))) dt *= 0.35;
    b.t += dt;
    const p = proj(b.x, b.y, b.z);
    b.trace.push([p.x, p.y, Math.max(3, 0.022 * p.k)]); if (b.trace.length > 9) b.trace.shift();
    if (b.etat === 'dedans') { b.fin -= dt0; b.y = Math.max(0.02, b.y - dt0 * 0.4); if (b.fin <= 0) this.finBalle(); return; }
    if (b.etat === 'rebord') {
      // la balle tourne sur le rebord du verre avant de tomber dedans... ou dehors
      b.angle += dt * 14; b.fin -= dt;
      b.x = b.verre.x + Math.cos(b.angle) * P.rayon * 0.95; b.z = b.verre.z + Math.sin(b.angle) * P.rayon * 0.95; b.y = H_VERRE + 0.01;
      if (b.fin <= 0) this.resoudreRebord();
      return;
    }
    b.x += b.vx * dt; b.z += b.vz * dt; b.vy -= G * dt; b.y += b.vy * dt;
    if (b.etat === 'vol1' && b.t >= b.T) {
      // le rebond sur la table, puis la 2e partie du vol
      b.y = 0; b.t = 0; Object.assign(b, b.rebondTir.v2, { etat: 'vol' });
      jouerSon(this, 'remi_rebond');
      return;
    }
    if (b.etat === 'vol' && b.t >= b.T) { this.arrivee(); return; }
    if (b.etat === 'libre') {
      const surTable = Math.abs(b.x) <= W / 2 && b.z >= 0 && b.z <= D;
      if (surTable && b.y <= 0 && b.vy < 0) {
        b.y = 0; b.vy = -b.vy * 0.45; b.rebonds++;
        if (b.rebonds <= 2) jouerSon(this, 'remi_rebond');
      }
      if (b.y < -0.8 || b.t > b.T + 1.4) this.finBalle();
    }
  }

  // la balle arrive à hauteur des verres : dedans ? rebord ? raté ?
  arrivee() {
    const b = this.balle, r = P.rayon;
    let meilleur = null, dmin = 9;
    for (const v of b.verres) if (v.plein) { const d = Math.hypot(b.x - v.x, b.z - v.z); if (d < dmin) { dmin = d; meilleur = v; } }
    b.verre = meilleur;
    if (meilleur && dmin < r * P.dedans) { this.dedans(); return; }
    if (meilleur && dmin < r * P.rebord) {
      b.dRebord = dmin;
      b.etat = 'rebord'; b.fin = 0.9; b.angle = Math.atan2(b.z - meilleur.z, b.x - meilleur.x);
      jouerSon(this, 'remi_rebond');
      if (b.qui === 'toi') bulle(this, 'LE REBORD...', '#ffd84a', 0.8, 300);
      return;
    }
    b.etat = 'libre';
  }

  resoudreRebord() {
    const b = this.balle;
    // plus la balle est tombée près du centre, plus elle a de chances de rentrer (plus juste qu'un pile ou face)
    const r = P.rayon, d = b.dRebord ?? r;
    const chance = Phaser.Math.Clamp(1 - (d - r * P.dedans) / (r * (P.rebord - P.dedans)), 0.15, 0.85);
    if (Math.random() < chance) { this.dedans(); return; }
    b.etat = 'libre'; b.vy = 1.2; b.vx = (b.x - b.verre.x) * 12; b.vz = (b.z - b.verre.z) * 12 + (b.qui === 'toi' ? 0.6 : -0.6);
    bulle(this, '... et non !', '#ffb0b0', 1, 300);
  }

  dedans() {
    const b = this.balle, v = b.verre;
    b.etat = 'dedans'; b.fin = 0.5; b.x = v.x; b.z = v.z; b.y = H_VERRE;
    v.plein = false; v.bu = 1; v.flash = 1;
    this.reussis++;
    // TIR REBOND réussi : un 2e verre (le plus proche) saute aussi
    if (b.qui === 'toi' && b.rebondTir) {
      let autre = null, dmin = 9;
      for (const w of b.verres) if (w.plein) { const d = Math.hypot(w.x - v.x, w.z - v.z); if (d < dmin) { dmin = d; autre = w; } }
      if (autre) { autre.plein = false; autre.bu = 1; this.ivresseRemi++; this.time.delayedCall(300, () => this.eclabousser(autre)); }
      this.time.delayedCall(200, () => annonce(this, 'REBOND : 2 VERRES !', '#ffb070', 1.1));
    }
    jouerSon(this, 'remi_plouf');
    if (b.qui === 'toi') {
      this.eclabousser(v);
      this.cameras.main.shake(140, 0.005);
      this.ivresseRemi++; this.serie++;
      if (this.serie >= P.serieFeu && !this.feu) { this.feu = true; this.time.delayedCall(500, () => annonce(this, 'EN FEU !', '#ff8a2a', 1.2)); }
      annonce(this, choisir(['BOIS, RÉMI !', 'PLOUF !', 'DEDANS !']), '#7fff7f', 0.7);
      jouerSon(this, 'remi_foule');
      this.time.delayedCall(450, () => this.poseTemp('boit', 1.6));
      if (Math.random() < 0.6) this.time.delayedCall(900, () => bulle(this, `Rémi : « ${choisir(REPLIQUES.pongToucheToi)} »`, '#ffd84a', 1.6, 250));
    } else {
      this.ivresse++; this.flashBiere = 0.8;
      this.time.delayedCall(250, () => jouerSon(this, 'remi_boit'));
      if (this.ivresse === P.hoquet) this.time.delayedCall(1500, () => bulle(this, 'Tu commences à être pompette : la fin de la courbe s\'efface et tu as le hoquet !', '#ffb070', 2.4, 300));
      annonce(this, 'TU BOIS !', '#ffb070', 0.9);
      this.time.delayedCall(300, () => this.poseTemp('nargue', 1.6));
      this.time.delayedCall(700, () => bulle(this, `Rémi : « ${choisir(REPLIQUES.pongToucheRemi)} »`, '#ffd84a', 1.6, 250));
      this.cameras.main.shake(300, 0.008);
    }
  }

  eclabousser(v) {
    const h = proj(v.x, H_VERRE, v.z);
    for (let k = 0; k < 16; k++) this.gouttes.push({ x: h.x, y: h.y, vx: hasard(-160, 160), vy: hasard(-320, -120), vie: hasard(0.4, 0.8) });
  }

  gouttesPas(dt) {
    for (const d of this.gouttes) { d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 900 * dt; d.vie -= dt; }
    this.gouttes = this.gouttes.filter(d => d.vie > 0);
  }

  finBalle() {
    const b = this.balle;
    this.balle = null;
    if (b.qui === 'toi' && b.etat !== 'dedans') { this.serie = 0; if (this.feu) { this.feu = false; bulle(this, 'Plus en feu...', '#aaaaaa', 1, 300); } }
    if (b.qui === 'remi' && b.etat !== 'dedans' && Math.random() < 0.4) bulle(this, `Rémi : « ${choisir(REPLIQUES.pongRateRemi)} »`, '#ffd84a', 1.4, 250);
    if (!this.verresRemi.some(v => v.plein)) { this.gagne(); return; }
    if (!this.verresToi.some(v => v.plein)) { this.etat = 'fin'; this.time.delayedCall(600, () => ecranPerdu(this, 'PERDU AU BEER PONG', REPLIQUES.pongPerdu, this.nomDiff)); return; }
    if (this.balles > 0) {
      if (b.qui === 'toi') this.commencerVisee();
      else { this.etat = 'remi'; this.time.delayedCall(350, () => this.prepRemi()); }
      return;
    }
    // fin du tour : les 2 dedans = BALLS BACK (une fois par tour)
    if (this.reussis === 2 && !this.ballsBack) {
      this.ballsBack = true;
      annonce(this, 'BALLS BACK !', '#7fff7f');
      this.etat = b.qui === 'toi' ? 'pause' : 'remi';
      this.time.delayedCall(900, () => { this.balles = 2; this.reussis = 0; if (b.qui === 'toi') this.commencerVisee(); else this.prepRemi(); });
      return;
    }
    const suivant = b.qui === 'toi' ? 'remi' : 'toi';
    this.etat = 'pause';
    this.time.delayedCall(450, () => this.tourDe(suivant));
  }

  gagne() {
    this.etat = 'fin';
    annonce(this, 'GAGNÉ !', '#7fff7f', 1.4);
    jouerSon(this, 'remi_arrivee');
    this.time.delayedCall(900, () => bulle(this, `Rémi : « ${REPLIQUES.pongGagne} »`, '#ffd84a', 2.8, 90));
    this.time.delayedCall(3800, () => jeuSuivant(this, 'pong', this.nomDiff));
  }

  // ---------- dessin ----------
  dessiner() {
    // Rémi derrière la table (il tangue un peu plus à chaque verre bu ; il gigote quand il te déconcentre)
    const gr = this.gRemi.clear();
    let bal = Math.sin(this.horloge * 1.5) * (2 + this.ivresseRemi * 2);
    if (this.distrait > 0) bal += Math.sin(this.horloge * 18) * 10;
    if (this.pose !== 'face' && this.horloge > this.poseFin) this.pose = 'face';
    const yBord = proj(0, 0, D).y;
    if (this.textures.exists('remi_pong')) {
      // la planche de Rémi de face (attend, lance, boit, nargue), coupée à la taille : la table cache le bas
      if (!this.imgRemi) this.imgRemi = this.add.sprite(CX, 0, 'remi_pong', 0).setOrigin(0.5, 1).setDepth(3).setScale(0.34);
      this.imgRemi.setFrame({ face: 0, lance: 1, boit: 2, nargue: 3 }[this.pose] ?? 0);
      this.imgRemi.setPosition(CX + bal, yBord + 26).setRotation(bal * 0.004);
      if (!this.imgDouble) this.imgDouble = this.add.sprite(CX, 0, 'remi_pong', 0).setOrigin(0.5, 1).setDepth(3.5).setScale(0.34).setAlpha(0.3).setVisible(false);
      const dec = Math.sin(this.horloge * 1.3) * (4 + this.ivresse * 4);
      this.imgDouble.setFrame(this.imgRemi.frame.name).setPosition(CX + bal + dec * 1.5, yBord + 26).setRotation(this.imgRemi.rotation);
    } else {
      gr.setPosition(CX + bal, yBord + 6).setRotation(bal * 0.004);
      remi(gr, this.pose, this.horloge);
    }
    this.dessinerTable();
  }

  // pose de Rémi pendant d secondes, puis il revient en attente
  poseTemp(p, d = 1.4) { this.pose = p; this.poseFin = this.horloge + d; }

  dessinerTable() {
    const g = this.g.clear();
    const objets = [];
    for (const v of [...this.verresRemi, ...this.verresToi]) if (v.plein || v.bu > 0) objets.push({ z: v.z, f: () => this.verre(g, v) });
    const b = this.balle;
    if (b) objets.push({ z: b.etat === 'dedans' ? b.z + 0.001 : b.z - 0.02, f: () => this.dessinerBalle(g, b) });
    objets.sort((a, c) => c.z - a.z).forEach(o => o.f());
    // VISION DOUBLE quand tu as bu : les verres de Rémi en double, décalés (et Rémi aussi)
    const gd = this.gDouble.clear(), dec = this.ivresse > 0 ? Math.sin(this.horloge * 1.3) * (4 + this.ivresse * 4) : 0;
    if (dec) { gd.setPosition(dec, 0); for (const v of this.verresRemi) if (v.plein) this.verre(gd, v); }
    if (this.imgDouble) this.imgDouble.setVisible(!!dec);
    for (const v of [...this.verresRemi, ...this.verresToi]) { if (!v.plein && v.bu > 0) v.bu = Math.max(0, v.bu - 0.025); v.flash = Math.max(0, v.flash - 0.02); }
    for (const d of this.gouttes) g.fillStyle(0xe8a52a, Math.min(1, d.vie * 2)).fillCircle(d.x, d.y, 4);
    if (this.flashBiere > 0) g.fillStyle(0xe8a52a, this.flashBiere * 0.5).fillRect(0, 0, LARGEUR, HAUTEUR);

    // visée : la balle dans le lance-pierre, l'élastique, les pointillés de la trajectoire
    const gv = this.gVisee.clear();
    if (this.etat === 'vise') {
      const s = this.tangage(), base = proj(DEPART.x, DEPART.y, DEPART.z);
      let c = this.cibleTir(), tire = { x: 0, y: 0 };
      if (this.tir) { tire = { x: (this.tir.x - this.tir.x0) * 0.35, y: Math.max(0, this.tir.y - this.tir.y0) * 0.35 }; }
      else c = { x: this.visee.x, z: 1.0 + this.visee.f * 1.05, f: this.visee.f };   // clavier
      const bx = base.x + tire.x, by = Math.min(base.y + tire.y, HAUTEUR - 8);
      if (this.tir) {
        gv.lineStyle(4, 0x8a5a2b, 1).lineBetween(base.x - 40, base.y, bx, by).lineBetween(base.x + 40, base.y, bx, by);
      }
      if (c) {
        const vol = this.parametresVol(DEPART, c.x + s.x, c.z + s.z);
        if (this.rebond) this.apercuRebond(gv, c, s);
        // TOUTE la courbe jusqu'à la retombée ; en CHAMPION, des pointillés plus espacés et pas de point d'arrivée
        const part = this.feu ? 1 : this.diff.apercu, pas = 1, fin = Math.round(24 * this.partCourbe());
        for (let k = 1; k <= (this.rebond ? 0 : fin); k += pas) {
          const t = (k / 24) * vol.T;
          const q = proj(DEPART.x + vol.vx * t, DEPART.y + vol.vy * t - G * t * t / 2, DEPART.z + vol.vz * t);
          const rr = Math.max(2.5, q.k * 0.009);
          // OMBRE de la trajectoire sur la table : on voit où passe la balle (et où elle tombe)
          const o = proj(DEPART.x + vol.vx * t, 0, DEPART.z + vol.vz * t);
          gv.fillStyle(0x000000, 0.35).fillEllipse(o.x, o.y, rr * 2.4, rr * 1);
          gv.fillStyle(0x000000, 0.6).fillCircle(q.x, q.y, rr + 1.5);   // contour sombre : lisible même devant Rémi
          gv.fillStyle(this.feu ? 0xff8a2a : 0xffffff, 0.95).fillCircle(q.x, q.y, rr);
        }
        this.vueCote(gv, vol, c, s, pas, fin);
        if ((part >= 0.5 && fin >= 24) || this.feu) { const q = proj(c.x + s.x, H_VERRE, c.z + s.z); gv.lineStyle(2, 0x7fff7f, 0.9).strokeEllipse(q.x, q.y, q.k * 0.07, q.k * 0.03); }
        if (!this.tir) {   // jauge de force (clavier)
          gv.fillStyle(0x000000, 0.5).fillRect(LARGEUR - 60, 280, 22, 150);
          gv.fillStyle(0xffd84a, 1).fillRect(LARGEUR - 57, 427 - 144 * c.f, 16, 144 * c.f);
        }
      }
      const r = Math.max(6, 0.022 * base.k);
      gv.fillStyle(this.feu ? 0xff8a2a : 0x222222, 1).fillCircle(bx, by, r + 2);
      gv.fillStyle(this.feu ? 0xffd27a : 0xffffff, 1).fillCircle(bx, by, r);
    }
    // bouton REBOND (pendant ta visée)
    if (this.etat === 'vise') {
      const b = BOUTON_REBOND;
      gv.fillStyle(0x000000, 0.5).fillCircle(b.x, b.y, b.r);
      gv.fillStyle(0xffb070, this.rebond ? 0.75 : 0.15).fillCircle(b.x, b.y, b.r - 5);
      gv.lineStyle(4, 0xffb070, 1).strokeCircle(b.x, b.y, b.r);
    }
    if (!this.txtRebond) this.txtRebond = texte(this, BOUTON_REBOND.x, BOUTON_REBOND.y, 'REBOND\nx2', 16, '#ffffff', { fontStyle: 'bold' }).setDepth(901);
    this.txtRebond.setVisible(this.etat === 'vise');
    // Rémi se concentre : le cercle qui se resserre (vert quand c'est le moment de souffler)
    if (this.etat === 'remiPrep' && this.prep && !this.prep.fait) {
      const k = 1 - this.prep.t / this.prep.d, bon = this.prep.t > this.prep.d - 0.3;
      const y = proj(0, 0, D).y - 140;
      gv.lineStyle(6, bon ? 0x7fff7f : 0xffffff, 0.9).strokeCircle(CX, y, 30 + 110 * k);
      gv.lineStyle(3, 0x7fff7f, 0.6).strokeCircle(CX, y, 34);
    }
    // HUD
    const n = (l) => l.filter(v => v.plein).length;
    this.hud.setText(`TOI ${n(this.verresToi)}  -  ${n(this.verresRemi)} RÉMI      verres bus : ${this.ivresse}${this.feu ? '      🔥 EN FEU' : ''}`);
    const tour = this.etat === 'vise' ? `À TOI (balle ${3 - this.balles}/2) : ${estTactile() ? 'tire vers toi et lâche' : 'tire avec la souris, ou ◀ ▶ ▲ ▼ + ESPACE'}`
      : this.etat === 'remiPrep' ? `Rémi se concentre... ${estTactile() ? 'TOUCHE' : 'ESPACE'} quand le cercle est tout petit !`
      : (this.etat === 'remi' || (this.balle && this.balle.qui === 'remi')) ? 'RÉMI LANCE...' : '';
    this.hudTour.setText(tour).setVisible(!!tour);
    // l'ivresse fait un peu tanguer l'écran
    this.cameras.main.setRotation(Math.sin(this.horloge * 0.9) * this.ivresse * 0.008);
  }

  // pointillés du tir rebond (orange) : jusqu'à la table, puis jusqu'aux verres (raccourcis par l'alcool comme l'autre)
  apercuRebond(g, c, s) {
    const r = this.volRebond(DEPART, c.x + s.x, c.z + s.z), pts = [];
    for (let k = 1; k <= 14; k++) { const t = k / 14 * r.v1.T; pts.push([DEPART.x + r.v1.vx * t, DEPART.y + r.v1.vy * t - G * t * t / 2, DEPART.z + r.v1.vz * t]); }
    for (let k = 1; k <= 10; k++) { const t = k / 10 * r.v2.T; pts.push([r.xb + r.v2.vx * t, r.v2.vy * t - G * t * t / 2, r.zb + r.v2.vz * t]); }
    const n = Math.round(pts.length * this.partCourbe());
    for (const [x, y, z] of pts.slice(0, n)) {
      const q = proj(x, y, z), rr = Math.max(2.5, q.k * 0.009), o = proj(x, 0, z);
      g.fillStyle(0x000000, 0.35).fillEllipse(o.x, o.y, rr * 2.4, rr);   // ombre sur la table
      g.fillStyle(0x000000, 0.6).fillCircle(q.x, q.y, rr + 1.5);
      g.fillStyle(0xffb070, 1).fillCircle(q.x, q.y, rr);
    }
  }

  // VUE DE CÔTÉ (encart en haut à droite) : la table de profil, les verres de Rémi, et la courbe qui monte puis RETOMBE
  vueCote(g, vol, c, s, pas, fin = 24) {
    const x0 = LARGEUR - 250, y0 = 120, L = 230, H = 80, zMin = DEPART.z - 0.1;
    const X = (z) => x0 + (z - zMin) / (D + 0.1 - zMin) * L, Y = (y) => y0 - y * 95;
    g.fillStyle(0x000000, 0.6).fillRoundedRect(x0 - 10, y0 - H, L + 20, H + 22, 8);
    g.lineStyle(3, 0x4f7fc0, 1).lineBetween(X(zMin), y0, X(D), y0);
    // verres de Rémi : un rectangle par rang (vus de côté)
    const rangs = new Map();
    for (const v of this.verresRemi) if (v.plein) rangs.set(v.rang, v.z);
    for (const z of rangs.values()) g.fillStyle(0xc81e2a, 1).fillRect(X(z) - 4, Y(H_VERRE), 8, Y(0) - Y(H_VERRE));
    for (let k = 0; k <= fin; k += pas) {
      const t = (k / 24) * vol.T;
      g.fillStyle(this.feu ? 0xff8a2a : 0xffffff, 1).fillCircle(X(DEPART.z + vol.vz * t), Y(DEPART.y + vol.vy * t - G * t * t / 2), 2);
    }
    if (fin >= 24) g.fillStyle(0x7fff7f, 1).fillCircle(X(c.z + s.z), Y(H_VERRE), 3.5);
  }

  verre(g, v) {
    const r = P.rayon, haut = proj(v.x, H_VERRE, v.z), bas = proj(v.x, 0, v.z);
    const rx = r * haut.k, ry = rx * 0.45, rb = rx * 0.72;
    g.fillStyle(0x000000, 0.25).fillEllipse(bas.x, bas.y, rb * 2.4, ry * 1.4);
    if (!v.plein) { g.fillStyle(0xffffff, v.bu * 0.6).fillCircle(haut.x, haut.y - rx * 0.6, rx * (1.4 - v.bu)); return; }
    g.fillStyle(0xc81e2a, 1).fillPoints([{ x: haut.x - rx, y: haut.y }, { x: haut.x + rx, y: haut.y }, { x: bas.x + rb, y: bas.y }, { x: bas.x - rb, y: bas.y }], true);
    g.fillStyle(0xe0404a, 0.6).fillRect(haut.x - rx * 0.55, haut.y + ry, rx * 0.25, (bas.y - haut.y) * 0.7);   // reflet
    g.fillStyle(0x9a1420, 1).fillEllipse(bas.x, bas.y, rb * 2, ry * 1.4);
    g.fillStyle(0xf4f4f4, 1).fillEllipse(haut.x, haut.y, rx * 2, ry * 2);
    g.fillStyle(0xe8a52a, 1).fillEllipse(haut.x, haut.y + 1, rx * 1.7, ry * 1.6);
    g.fillStyle(0xfff3c8, 0.8).fillEllipse(haut.x - rx * 0.3, haut.y, rx * 0.5, ry * 0.5);
  }

  dessinerBalle(g, b) {
    const p = proj(b.x, b.y, b.z), o = proj(b.x, 0, b.z);
    const r = Math.max(3, 0.022 * p.k);
    if (b.y > -0.05 && Math.abs(b.x) < W / 2 && b.z > 0 && b.z < D) g.fillStyle(0x000000, 0.3).fillEllipse(o.x, o.y, r * 2.2, r * 0.9);
    if (b.etat === 'dedans' && b.fin < 0.3) return;
    // traînée (orange quand tu es EN FEU)
    b.trace.forEach(([x, y, rr], k) => g.fillStyle(this.feu && b.qui === 'toi' ? 0xff8a2a : 0xffffff, (k + 1) / b.trace.length * 0.35).fillCircle(x, y, rr * (0.5 + k / b.trace.length * 0.5)));
    g.fillStyle(0x222222, 1).fillCircle(p.x, p.y, r + 1);
    g.fillStyle(this.feu && b.qui === 'toi' ? 0xffd27a : 0xffffff, 1).fillCircle(p.x, p.y, r);
    g.fillStyle(0xdddddd, 1).fillCircle(p.x + r * 0.3, p.y + r * 0.3, r * 0.5);
  }
}
