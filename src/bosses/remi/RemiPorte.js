// =====================================================================
// RÉMI — JEU 3 : LA PORTE (qui tape le plus fort ?)
// Façon borne « boxeur » de bar : en 3 manches, Rémi frappe, puis toi.
//   1) ÉLAN : tape GAUCHE / DROITE en ALTERNANCE le plus vite possible (◀ ▶, ou les 2 moitiés d'écran) ;
//      deux fois le même côté = ça ne compte pas. (Sans alternance possible, ESPACE marche à moitié.)
//   2) VISÉE : le curseur va et vient ; ESPACE (ou un toucher) quand il est dans la zone verte = FRAPPE.
// Score = élan + précision (sur 999). La plus grosse frappe gagne la manche ; 2 manches = la victoire (et le badge).
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, PORTE as R, REPLIQUES } from './reglages.js';
import { remi, toi } from './dessins.js';
import { bulle, annonce, ecranPerdu, difficulteOuChoix, hasard, choisir , laisserPasserTactile } from './commun.js';

const SOL = 470, X_FRAPPE = 500, X_ATTENTE = 170;
// la porte du décor illustré (remi_porte_decor.jpg, 960 x 536) : son battant, pour le faire trembler / tomber
const BATTANT = { x: 774, y: 147, l: 140, h: 322 };
const ECHELLE = 0.45, POING = 342;   // POING : où est le poing (px) dans la case de l'impact (largeur de la pose)
// VUE DE DOS (audit C1) : le décor zoomé x1,5 sur sa porte (à droite), le frappeur DE DOS au premier plan qui frappe la porte.
const ZOOM = 1.5, DECOR_X = -480, DECOR_Y = -183;
const PORTE_DOS = { x: DECOR_X + BATTANT.x * ZOOM, y: DECOR_Y + BATTANT.y * ZOOM, l: BATTANT.l * ZOOM, h: BATTANT.h * ZOOM };
const IMPACT = { x: 730, y: 272 };   // où le poing touche la porte (écran)
// planches de dos (outils/remi/preparer_images.py) : cases alignées à gauche ; « poing » = où est le poing dans la case de l'impact
const DOS = {
  remi: { tex: 'remi_dos', echelle: 0.75, haut: 150, cases: { garde: 0, elan: 0, coup: 1, frappe: 2 }, poing: 520 },
  toi: { tex: 'remi_toi_dos', echelle: 1.1, haut: 128, cases: { garde: 0, elan: 1, coup: 2, frappe: 3 }, poing: 336 },
};
const VIDES = { haut: null, bas: null, gauche: null, droite: null, espace: null, z: null, x: null };

export class RemiPorte extends BossScene {
  constructor() { super('RemiPorte', IDENTITE); }

  create() {
    this.etat = 'intro';         // intro | remi | elan | visee | frappe | fin
    this.horloge = 0; this.manche = 0; this.points = { toi: 0, remi: 0 };
    this.jauge = 0; this.curseur = 0; this.chrono = 0; this.tapes = 0;
    this.poseToi = 'garde'; this.poseRemi = 'garde'; this.frappeur = 'remi';
    this.fissures = []; this.tremble = 0; this.compteur = 0; this.compteurCible = 0; this.porteTombee = false;
    this.decorImage = this.textures.exists('remi_porte_decor');
    this.vueDos = this.decorImage && this.textures.exists('remi_dos') && this.textures.exists('remi_toi_dos');
    this.eclats = []; this.flash = 0; this.entree = 0; this.dernierFrappeur = null;
    this.px = this.decorImage ? BATTANT.x : 640;   // bord gauche de la porte
    this.decor();
    this.gPorte = this.add.graphics().setDepth(3);
    this.gRemi = this.add.graphics().setDepth(5);
    this.gToi = this.add.graphics().setDepth(6);
    // illustrations de profil (6 cases : Rémi garde / coup / impact, toi garde / coup / impact) ; sinon les dessins du code
    if (this.vueDos) {
      this.dos = { remi: this.add.sprite(0, 0, DOS.remi.tex, 0).setOrigin(0, 0).setScale(DOS.remi.echelle).setDepth(6),
        toi: this.add.sprite(0, 0, DOS.toi.tex, 0).setOrigin(0, 0).setScale(DOS.toi.echelle).setDepth(6) };
    } else if (this.textures.exists('remi_porte')) {
      this.sprRemi = this.add.sprite(0, 0, 'remi_porte', 0).setOrigin(0, 1).setScale(ECHELLE).setDepth(5);
      this.sprToi = this.add.sprite(0, 0, 'remi_porte', 3).setOrigin(0, 1).setScale(ECHELLE).setDepth(6);
    }
    this.gJauges = this.add.graphics().setDepth(900);
    this.ecran = texte(this, this.vueDos ? 130 : this.decorImage ? this.px - 170 : this.px + 70, this.vueDos ? 110 : this.decorImage ? 80 : 60, '000', 54, '#ff3030', { fontStyle: 'bold', stroke: '#300000', strokeThickness: 6, backgroundColor: '#100000' }).setDepth(4);
    this.hud = texte(this, 200, 28, '', 22, '#ffffff', { fontStyle: 'bold' }).setDepth(900);
    this.consigne = texte(this, LARGEUR / 2, 505, '', 30, '#ffd84a', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 12, y: 4 } }).setDepth(900).setVisible(false);
    this.touches = creerTouches(this);
    laisserPasserTactile(this);   // les blocs de boutons cachés ne mangent plus les touchers
    jouerMusique(this, 'remi_musique_bar');   // la musique du bar (dès l'écran des commandes)
    this.input.on('pointerdown', (p) => { this.toucher = true; this.toucheX = p.x; });
    this.gel = 0; this.bonusPari = 0; this.cible = { x: 0, y: 0 };

    etiquettesTactiles({ ...VIDES, espace: 'OK' });
    const t = estTactile();
    this.afficherIntro('RÉMI - La porte', [
      REPLIQUES.porteIntro,
      `1) ÉLAN : tape ${t ? 'GAUCHE / DROITE de l\'écran' : '◀ ▶'} EN ALTERNANCE, le plus vite possible`,
      `2) VISÉE : ${t ? 'touche' : 'ESPACE'} quand le curseur est dans la zone VERTE`,
      `${R.manches} manches : la plus grosse frappe gagne la manche.`,
    ], () => difficulteOuChoix(this, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.mancheSuivante(); }));
  }

  decor() {
    this.cameras.main.setBackgroundColor('#141018');
    if (this.vueDos) {
      // décor zoomé sur la porte ; le battant (découpé du fond) tremble et s'ouvre, le trou noir derrière
      const t = this.textures.get('remi_porte_decor');
      if (!t.has('battant')) t.add('battant', 0, BATTANT.x, BATTANT.y, BATTANT.l, BATTANT.h);
      this.add.image(DECOR_X, DECOR_Y, 'remi_porte_decor').setOrigin(0, 0).setScale(ZOOM).setDepth(1);
      this.add.rectangle(PORTE_DOS.x, PORTE_DOS.y, PORTE_DOS.l, PORTE_DOS.h, 0x050308).setOrigin(0, 0).setDepth(2);
      this.battant = this.add.image(PORTE_DOS.x, PORTE_DOS.y, 'remi_porte_decor', 'battant').setOrigin(0, 0).setScale(ZOOM).setDepth(2.5);
      this.bat = PORTE_DOS;
      return;
    }
    if (this.decorImage) {
      // fond illustré ; le battant de la porte est découpé du fond (il tremble, il tombe), avec le trou noir derrière
      const t = this.textures.get('remi_porte_decor');
      if (!t.has('battant')) t.add('battant', 0, BATTANT.x, BATTANT.y, BATTANT.l, BATTANT.h);
      this.add.image(0, 0, 'remi_porte_decor').setOrigin(0, 0).setDepth(1);
      this.add.rectangle(BATTANT.x, BATTANT.y, BATTANT.l, BATTANT.h, 0x050308).setOrigin(0, 0).setDepth(2);
      this.battant = this.add.image(BATTANT.x, BATTANT.y, 'remi_porte_decor', 'battant').setOrigin(0, 0).setDepth(2.5);
      this.bat = BATTANT;
      return;
    }
    const g = this.add.graphics().setDepth(1);
    g.fillGradientStyle(0x2a2030, 0x2a2030, 0x18121c, 0x18121c, 1).fillRect(0, 0, LARGEUR, SOL);
    // carrelage des toilettes du bar
    g.lineStyle(1, 0x3a3044, 1);
    for (let y = 40; y < SOL; y += 40) g.lineBetween(0, y, LARGEUR, y);
    for (let x = 0; x < LARGEUR; x += 40) g.lineBetween(x, 0, x, SOL);
    g.fillStyle(0x3a2a22, 1).fillRect(0, SOL, LARGEUR, HAUTEUR - SOL);
    // cadre de la porte
    g.fillStyle(0x2a1a10, 1).fillRect(this.px - 14, 110, 172, SOL - 110);
    const s = texte(this, this.px + 70, 128, 'WC', 20, '#ffffff').setDepth(4);
    s.setBackgroundColor('#2a6ad0');
  }

  mancheSuivante() {
    this.manche++;
    this.scores = { toi: 0, remi: 0 };
    const decisive = this.points.toi === this.points.remi && this.points.toi === Math.ceil(R.manches / 2) - 1 && this.manche > 1;
    annonce(this, decisive ? 'MANCHE DÉCISIVE !' : `MANCHE ${this.manche}`, decisive ? '#ff5a5a' : '#ffd84a', 1.2);
    if (decisive) jouerSon(this, 'remi_foule');
    this.majHud();
    this.time.delayedCall(1300, () => this.tourRemi());
  }

  tourRemi() {
    if (this.termine) return;
    this.etat = 'remi'; this.frappeur = 'remi';
    etiquettesTactiles(VIDES);
    this.poseRemi = 'elan';
    bulle(this, `Rémi : « ${choisir(REPLIQUES.porteRemiFrappe)} »`, '#ffd84a', 1.4, 80);
    // PARI (audit C3) : pendant que Rémi prend son élan, devine s'il fera PLUS ou MOINS que le seuil
    this.seuilPari = Math.round((this.diff.remiMin + this.diff.remiMax) / 20) * 10;
    this.pari = null; this.bonusPari = 0; this.etat = 'pari'; this.chrono = 2.2;
    etiquettesTactiles({ ...VIDES, gauche: 'MOINS', droite: 'PLUS' });
  }

  // fin du pari (ou pas de réponse) : Rémi frappe
  coupRemi() {
    this.etat = 'remi';
    etiquettesTactiles(VIDES);
    const s = Math.round(hasard(this.diff.remiMin, this.diff.remiMax));
    this.frapper('remi', s);
    if (this.pari) {
      const bon = (this.pari === 'plus') === (s > this.seuilPari);
      this.bonusPari = bon ? 60 : 0;
      this.time.delayedCall(1000, () => bulle(this, bon ? 'PARI GAGNÉ : +60 à ta frappe !' : 'Pari perdu...', bon ? '#7fff7f' : '#ffb0b0', 1.2, 200));
    }
    this.time.delayedCall(2100, () => this.tourToi());
  }

  tourToi() {
    if (this.termine) return;
    this.frappeur = 'toi'; this.poseRemi = 'garde';
    this.etat = 'elan'; this.jauge = 0; this.chrono = R.elan; this.tapes = 0; this.toucher = false;
    this.poseToi = 'elan';
    etiquettesTactiles(VIDES);
    this.dernierCote = null;
    annonce(this, 'GAUCHE ! DROITE !', '#7fff7f', 0.7);
  }

  update(temps, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.horloge += dt;
    const T = this.touches;
    const appui = vientDAppuyer(T.espace) || this.toucher;
    const toucheX = this.toucher ? this.toucheX : null;
    this.toucher = false;
    // GEL d'impact : le jeu s'arrête un instant au moment du coup
    if (this.gel > 0) { this.gel -= dt; this.dessiner(0); return; }
    if (this.etat === 'pari') {
      this.chrono -= dt;
      if (!this.pari) {
        if (vientDAppuyer(T.gauche) || (toucheX !== null && toucheX < LARGEUR / 2)) this.pari = 'moins';
        if (vientDAppuyer(T.droite) || (toucheX !== null && toucheX >= LARGEUR / 2)) this.pari = 'plus';
        if (this.pari) jouerSon(this, 'ui_valider');
      }
      this.consigne.setVisible(true).setText(this.pari ? `Pari : ${this.pari.toUpperCase()} de ${this.seuilPari}` :
        `PARI : Rémi fera ◀ MOINS ou PLUS ▶ de ${this.seuilPari} ?`);
      if (this.chrono <= 0) this.coupRemi();
      this.dessiner(dt);
      return;
    }
    if (this.etat === 'elan') {
      // ÉLAN façon « Track & Field » : il faut ALTERNER gauche et droite
      let cote = null;
      if (vientDAppuyer(T.gauche) || (toucheX !== null && toucheX < LARGEUR / 2)) cote = 'g';
      if (vientDAppuyer(T.droite) || (toucheX !== null && toucheX >= LARGEUR / 2)) cote = 'd';
      if (cote) {
        if (cote !== this.dernierCote) { this.jauge += R.parTape; this.tapes++; jouerSon(this, 'remi_tape', { rate: 0.8 + this.jauge * 0.8 }); }
        else { this.jauge -= 0.02; this.rate = 0.25; }   // même côté deux fois : raté
        this.dernierCote = cote; this.flashCote = { c: cote, t: 0.12 };
      } else if (vientDAppuyer(T.espace)) { this.jauge += R.parTape * 0.5; jouerSon(this, 'remi_tape'); }
      this.rate = Math.max(0, (this.rate || 0) - dt);
      this.jauge = Phaser.Math.Clamp(this.jauge - R.baisse * dt, 0, 1);
      this.chrono -= dt;
      this.consigne.setVisible(true).setText(this.rate > 0 ? 'ALTERNE ! gauche, droite, gauche...' : `ÉLAN : GAUCHE / DROITE en alternance !   ${Math.max(0, this.chrono).toFixed(1)} s`);
      if (this.chrono <= 0) {
        this.etat = 'visee'; this.chrono = 0; this.elanFinal = this.jauge;
        etiquettesTactiles({ ...VIDES, espace: 'FRAPPE !' });
        jouerSon(this, 'ui_valider');
      }
    } else if (this.etat === 'visee') {
      this.chrono += dt;
      const ph = (this.chrono * this.diff.visee / R.periodeVisee) % 1;
      this.curseur = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      if (this.vueDos) {
        // VISÉE SUR LA PORTE : une cible se promène sur le battant ; frappe quand elle passe sur ton poing (+)
        const t = this.chrono * this.diff.visee, b = this.bat;
        this.cible.x = b.x + b.l / 2 + (b.l / 2 - 26) * Math.sin(t * 2.3);
        this.cible.y = IMPACT.y + 110 * Math.sin(t * 3.1 + 0.8);
      }
      this.consigne.setVisible(true).setText(this.vueDos ? `${estTactile() ? 'TOUCHE' : 'ESPACE'} quand la cible passe sur le + !` : `${estTactile() ? 'TOUCHE' : 'ESPACE'} dans la zone VERTE !`);
      // un petit délai pour ne pas frapper avec la dernière tape de l'élan ; au bout de 4 s, ça part tout seul
      if ((appui && this.chrono > 0.25) || this.chrono > 4) this.frappeToi();
    } else this.consigne.setVisible(false);
    this.dessiner(dt);
  }

  frappeToi() {
    let precision;
    if (this.vueDos) {
      const d = Math.hypot(this.cible.x - IMPACT.x, this.cible.y - IMPACT.y), zr = this.diff.zone * 200;
      precision = d <= zr ? 1 : Math.max(0, 1 - (d - zr) / 130);
    } else {
      const ecart = Math.abs(this.curseur - 0.5), z = this.diff.zone / 2;
      precision = ecart <= z ? 1 : Math.max(0, 1 - (ecart - z) / (0.5 - z));
    }
    const s = Math.min(999, Math.round(999 * (R.poidsElan * this.elanFinal + (1 - R.poidsElan) * precision)) + this.bonusPari);
    this.etat = 'frappe';
    etiquettesTactiles(VIDES);
    if (precision === 1 && this.elanFinal > 0.9) { bulle(this, 'COUP DE GRÂCE !', '#ffd84a', 1.2, 120); jouerSon(this, 'remi_foule'); }
    else if (precision === 1) bulle(this, 'PILE DESSUS !', '#7fff7f', 1, 120);
    this.frapper('toi', s);
    this.time.delayedCall(1700, () => this.finManche());
  }

  // la frappe : pose, tremblement, fissures, compteur de la borne
  frapper(qui, score) {
    this.scores[qui] = score;
    // « coup » (bras qui part) puis « frappe » (impact, traits de vitesse)
    if (qui === 'remi') this.poseRemi = 'coup'; else this.poseToi = 'coup';
    this.time.delayedCall(90, () => { if (qui === 'remi') this.poseRemi = 'frappe'; else this.poseToi = 'frappe'; });
    this.time.delayedCall(450, () => { if (qui === 'remi') this.poseRemi = 'garde'; else this.poseToi = 'garde'; });
    this.tremble = score / 999;
    this.time.delayedCall(90, () => {
      this.gel = 0.08 + score / 999 * 0.1;   // petit arrêt sur image, plus long pour un gros coup
      this.cameras.main.shake(180 + score / 4, 0.004 + score / 999 * 0.014);
      if (this.vueDos) {
        const pop = texte(this, IMPACT.x, IMPACT.y - 40, String(score), 30 + score / 25, score >= R.casse ? '#ffd84a' : '#ffffff', { fontStyle: 'bold italic', strokeThickness: 8 }).setDepth(950);
        this.tweens.add({ targets: pop, y: IMPACT.y - 120, alpha: 0, scale: 1.3, duration: 1100, delay: 200, onComplete: () => pop.destroy() });
      }
    });
    jouerSon(this, score >= R.casse ? 'remi_porte_fort' : 'remi_porte');
    if (this.vueDos) {
      // IMPACT proportionnel à la force (C2) : fissures en étoile, éclats de bois et flash blanc pour les gros coups
      this.time.delayedCall(90, () => {
        const n = 2 + Math.floor(score / 140), L = 20 + score / 7;
        for (let k = 0; k < n; k++) this.fissures.push(this.fissure(Math.random() * Math.PI * 2, L * hasard(0.5, 1)));
        const e = Math.floor(score / 60);
        for (let k = 0; k < e; k++) this.eclats.push({ x: IMPACT.x, y: IMPACT.y, vx: hasard(-260, 260), vy: hasard(-380, 80), r: hasard(-6, 6), a: 0, vie: hasard(0.5, 1) });
        if (score >= R.casse) { this.flash = 1; jouerSon(this, 'remi_porte_fort'); }
      });
    } else {
      const n = Math.floor(score / 300) + (score >= R.casse ? 3 : 0);
      for (let k = 0; k < n; k++) this.fissures.push(this.fissure());
    }
    this.compteur = 0; this.compteurCible = score;
    this.tweens.add({ targets: this, compteur: score, duration: 800, ease: 'Cubic.Out' });
    this.time.delayedCall(900, () => bulle(this, `${qui === 'remi' ? 'RÉMI' : 'TOI'} : ${score}${score >= R.casse ? '  -  LA PORTE SE FEND !' : ''}`, qui === 'remi' ? '#ffb070' : '#9fe0ff', 1.2, 150));
  }

  fissure(angle, longueur) {
    if (this.vueDos) {
      // un rayon de fissure qui part de l'impact, en zigzag
      const pts = [[IMPACT.x - this.bat.x, IMPACT.y]], n = 5;
      for (let k = 1; k <= n; k++) {
        const r = longueur * k / n, a = angle + hasard(-0.25, 0.25);
        pts.push([IMPACT.x - this.bat.x + Math.cos(a) * r, IMPACT.y + Math.sin(a) * r]);
      }
      return pts.map(([x, y]) => [this.bat.x + Phaser.Math.Clamp(x, 6, this.bat.l - 6), Phaser.Math.Clamp(y, this.bat.y + 6, this.bat.y + this.bat.h - 6)]);
    }
    const pts = [[this.px + hasard(4, 60), hasard(250, 300)]];   // autour de l'impact du poing
    for (let k = 0; k < 4; k++) { const [x, y] = pts[pts.length - 1]; pts.push([x + hasard(-26, 26), y + hasard(-30, 30)]); }
    return pts;
  }

  finManche() {
    const { toi: a, remi: b } = this.scores;
    if (a > b) { this.points.toi++; annonce(this, 'MANCHE POUR TOI !', '#7fff7f', 1.1); }
    else if (b > a) { this.points.remi++; annonce(this, 'MANCHE POUR RÉMI', '#ff9a5a', 1.1); }
    else annonce(this, 'ÉGALITÉ !', '#ffffff', 1.1);
    this.majHud();
    const besoin = Math.ceil(R.manches / 2);
    this.time.delayedCall(1500, () => {
      if (this.points.toi >= besoin) this.gagner();
      else if (this.points.remi >= besoin) ecranPerdu(this, 'RÉMI TAPE PLUS FORT', REPLIQUES.portePerdu, this.nomDiff);
      else this.mancheSuivante();
    });
  }

  gagner() {
    this.etat = 'fin';
    this.porteTombee = true;
    if (this.battant) this.tweens.add({ targets: this.battant, x: this.bat.x + this.bat.l, scaleX: 0.08, duration: 260, ease: 'Cubic.In' });
    jouerSon(this, 'remi_porte_fort');
    this.cameras.main.shake(500, 0.02);
    annonce(this, 'LA PORTE CÈDE !', '#ffd84a', 1.4);
    this.time.delayedCall(1800, () => this.victoire(REPLIQUES.porteGagne));
  }

  majHud() { this.hud.setText(`MANCHE ${this.manche}   TOI ${this.points.toi} - ${this.points.remi} RÉMI`); }

  dessiner(dt) {
    this.tremble = Math.max(0, this.tremble - dt * 2.5);
    // la porte (qui tombe à la fin)
    const g = this.gPorte.clear();
    const dx = Math.sin(this.horloge * 60) * this.tremble * 5;
    g.setPosition(dx, 0);
    if (this.porteTombee) { g.setRotation(0.25).setPosition(160, -60); }
    if (this.battant) {
      // à la fin, le battant s'ouvre d'un coup vers l'intérieur (il « pivote » sur ses gonds) et laisse le trou noir
      if (this.porteTombee) g.setVisible(false);
      else this.battant.setPosition(this.bat.x + g.x, this.bat.y);
    } else {
    g.fillStyle(0x8a5a2b, 1).fillRect(this.px, 124, 144, SOL - 124);
    g.lineStyle(3, 0x5a3818, 1).strokeRect(this.px + 14, 150, 116, 120).strokeRect(this.px + 14, 300, 116, 140);
    g.fillStyle(0xd8c060, 1).fillCircle(this.px + 20, 300, 6);
    }
    for (const f of this.fissures) {
      g.lineStyle(3, 0x1a0e06, 1).beginPath(); g.moveTo(f[0][0], f[0][1]);
      for (const [x, y] of f.slice(1)) g.lineTo(x, y);
      g.strokePath();
    }
    this.ecran.setText(String(Math.round(this.compteur)).padStart(3, '0'));
    // les deux joueurs : le frappeur devant la porte, l'autre attend à gauche
    if (this.vueDos) {
      // seul le frappeur est à l'écran (il arrive par la gauche à chaque changement)
      if (this.dernierFrappeur !== this.frappeur) { this.dernierFrappeur = this.frappeur; this.entree = 1; }
      this.entree = Math.max(0, this.entree - dt * 3);
      for (const qui of ['remi', 'toi']) {
        const spr = this.dos[qui], c = DOS[qui], vis = this.frappeur === qui;
        spr.setVisible(vis);
        if (!vis) continue;
        const pose = qui === 'remi' ? this.poseRemi : this.poseToi;
        const x = IMPACT.x - c.poing * c.echelle - 400 * this.entree * this.entree;
        // en garde il respire ; pendant l'élan il TREMBLE de plus en plus (jauge)
        const bal = pose === 'garde' ? Math.sin(this.horloge * 4) * 4 : pose === 'elan' && qui === 'toi' ? Math.sin(this.horloge * 47) * 5 * this.jauge : 0;
        spr.setFrame(c.cases[pose] ?? 0).setPosition(x - (pose === 'elan' && qui === 'remi' ? 30 : 0), c.haut + bal)
          .setRotation(pose === 'elan' && qui === 'remi' ? -0.06 : 0);
      }
    }
    // ÉLAN : les bords de l'écran rougissent à mesure que la jauge monte (la tension monte)
    if (this.vueDos) {
      const e = this.etat === 'elan' ? this.jauge : this.etat === 'visee' ? this.elanFinal : 0;
      if (e > 0) {
        for (let k = 0; k < 6; k++) {
          const m = 14 + k * 14;
          g.fillStyle(0xff2020, e * 0.07).fillRect(-g.x, 0, LARGEUR, m).fillRect(-g.x, HAUTEUR - m, LARGEUR, m).fillRect(-g.x, 0, m, HAUTEUR).fillRect(LARGEUR - m - g.x, 0, m, HAUTEUR);
        }
      }
      if (this.etat === 'visee') {
        const c = this.cible, zr = this.diff.zone * 200;
        g.lineStyle(4, 0xff3030, 0.95).strokeCircle(c.x - g.x, c.y, zr + 10).strokeCircle(c.x - g.x, c.y, zr * 0.5 + 4);
        g.fillStyle(0xff3030, 0.25).fillCircle(c.x - g.x, c.y, zr + 10);
        g.lineStyle(4, 0xffffff, 1).lineBetween(IMPACT.x - 16 - g.x, IMPACT.y, IMPACT.x + 16 - g.x, IMPACT.y).lineBetween(IMPACT.x - g.x, IMPACT.y - 16, IMPACT.x - g.x, IMPACT.y + 16);
      }
    }
    // éclats de bois et flash
    for (const e of this.eclats) { e.x += e.vx * dt; e.y += e.vy * dt; e.vy += 900 * dt; e.a += e.r * dt; e.vie -= dt; }
    this.eclats = this.eclats.filter(e => e.vie > 0);
    for (const e of this.eclats) {
      const c = Math.cos(e.a), s2 = Math.sin(e.a);
      g.fillStyle(0x8a5a2b, Math.min(1, e.vie * 2)).fillPoints([{ x: e.x - c * 8, y: e.y - s2 * 8 }, { x: e.x + c * 8, y: e.y + s2 * 8 }, { x: e.x + c * 8 - s2 * 3, y: e.y + s2 * 8 + c * 3 }], true);
    }
    this.flash = Math.max(0, this.flash - dt * 4);
    if (this.flash > 0) g.fillStyle(0xffffff, this.flash * 0.6).fillRect(-50, -50, LARGEUR + 100, HAUTEUR + 100);
    const placer = (gr, qui, dessin, pose) => {
      if (this.vueDos) return;
      const spr = qui === 'remi' ? this.sprRemi : this.sprToi;
      if (spr) {
        // illustrations (cases alignées à gauche = le pied arrière) : le poing de l'impact touche la porte
        const p = this.frappeur === qui ? pose : 'garde', base = qui === 'remi' ? 0 : 3;
        const x = this.frappeur === qui ? this.px + 6 - POING * ECHELLE : (qui === 'remi' ? 40 : 230);
        spr.setFrame(base + ({ coup: 1, frappe: 2 }[p] ?? 0));
        spr.setPosition(x - (p === 'elan' ? 22 : 0), SOL + 4).setRotation(p === 'elan' ? -0.1 : 0);
        return;
      }
      const x = this.frappeur === qui ? X_FRAPPE : X_ATTENTE + (qui === 'remi' ? 0 : 90);
      gr.clear().setPosition(x, SOL).setScale(1.5);
      dessin(gr, this.frappeur === qui ? pose : 'garde', this.horloge);
    };
    placer(this.gRemi, 'remi', remi, this.poseRemi);
    placer(this.gToi, 'toi', toi, this.poseToi);
    // jauges (ton tour)
    const j = this.gJauges.clear();
    if (this.etat === 'elan' || this.etat === 'visee') {
      const v = this.etat === 'elan' ? this.jauge : this.elanFinal;
      // jauge en 10 PALIERS colorés, comme une borne de bar (C4)
      j.fillStyle(0x000000, 0.65).fillRect(36, 146, 48, 308);
      const COUL = [0x3ad03a, 0x5ad03a, 0x8ad03a, 0xb8d03a, 0xe0d03a, 0xffc03a, 0xff9a3a, 0xff6a3a, 0xff3a3a, 0xff2080];
      for (let k = 0; k < 10; k++) {
        const allume = v * 10 > k, yk = 446 - (k + 1) * 29.6;
        j.fillStyle(COUL[k], allume ? 1 : 0.18).fillRect(42, yk + 3, 36, 24);
      }
    }
    // pendant l'élan : 2 gros boutons G / D, celui à taper ensuite clignote
    if (this.etat === 'elan') {
      const fl = this.flashCote && this.flashCote.t > 0 ? this.flashCote.c : null;
      if (this.flashCote) this.flashCote.t -= dt;
      const suivant = this.dernierCote === 'g' ? 'd' : this.dernierCote === 'd' ? 'g' : null;
      for (const [c, x] of [['g', 210], ['d', LARGEUR - 110]]) {
        const allume = fl === c, attendu = suivant === c && Math.floor(this.horloge * 8) % 2 === 0;
        j.fillStyle(0x000000, 0.4).fillCircle(x, 400, 70);
        j.fillStyle(allume ? 0xffffff : attendu ? 0x7fff7f : 0xffd84a, allume ? 0.8 : attendu ? 0.5 : 0.18).fillCircle(x, 400, 64);
        j.lineStyle(4, 0xffd84a, 0.9).strokeCircle(x, 400, 70);
        j.fillStyle(0xffffff, 1);
        if (c === 'g') j.fillTriangle(x + 18, 375, x + 18, 425, x - 22, 400); else j.fillTriangle(x - 18, 375, x - 18, 425, x + 22, 400);
      }
    }
    if (this.etat === 'visee' && !this.vueDos) {
      const x0 = 220, L = 520, y = 440, z = this.diff.zone;
      j.fillStyle(0x000000, 0.7).fillRect(x0 - 6, y - 6, L + 12, 34);
      j.fillStyle(0xb03a3a, 1).fillRect(x0, y, L, 22);
      j.fillStyle(0xffd84a, 1).fillRect(x0 + L * (0.5 - z / 2 - 0.12), y, L * (z + 0.24), 22);
      j.fillStyle(0x3ad03a, 1).fillRect(x0 + L * (0.5 - z / 2), y, L * z, 22);
      j.fillStyle(0xffffff, 1).fillRect(x0 + L * this.curseur - 4, y - 10, 8, 42);
    }
  }
}
