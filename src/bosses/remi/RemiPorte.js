// =====================================================================
// RÉMI — JEU 3 : LA PORTE (qui tape le plus fort ?)
// Façon borne « boxeur » de bar : en 3 manches, Rémi frappe, puis toi.
//   1) ÉLAN : TAPOTE le plus vite possible (ESPACE, ou le doigt n'importe où) pour remplir la jauge.
//   2) VISÉE : le curseur va et vient ; ESPACE (ou un toucher) quand il est dans la zone verte = FRAPPE.
// Score = élan + précision (sur 999). La plus grosse frappe gagne la manche ; 2 manches = la victoire (et le badge).
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, PORTE as R, REPLIQUES } from './reglages.js';
import { remi, toi } from './dessins.js';
import { bulle, annonce, ecranPerdu, difficulteOuChoix, hasard, choisir } from './commun.js';

const SOL = 470, X_FRAPPE = 500, X_ATTENTE = 170, PORTE_X = 640;
const VIDES = { haut: null, bas: null, gauche: null, droite: null, espace: null, z: null, x: null };

export class RemiPorte extends BossScene {
  constructor() { super('RemiPorte', IDENTITE); }

  create() {
    this.etat = 'intro';         // intro | remi | elan | visee | frappe | fin
    this.horloge = 0; this.manche = 0; this.points = { toi: 0, remi: 0 };
    this.jauge = 0; this.curseur = 0; this.chrono = 0; this.tapes = 0;
    this.poseToi = 'garde'; this.poseRemi = 'garde'; this.frappeur = 'remi';
    this.fissures = []; this.tremble = 0; this.compteur = 0; this.compteurCible = 0; this.porteTombee = false;
    this.decor();
    this.gPorte = this.add.graphics().setDepth(3);
    this.gRemi = this.add.graphics().setDepth(5);
    this.gToi = this.add.graphics().setDepth(6);
    this.gJauges = this.add.graphics().setDepth(900);
    this.ecran = texte(this, PORTE_X + 70, 60, '000', 54, '#ff3030', { fontStyle: 'bold', stroke: '#300000', strokeThickness: 6, backgroundColor: '#100000' }).setDepth(4);
    this.hud = texte(this, 200, 28, '', 22, '#ffffff', { fontStyle: 'bold' }).setDepth(900);
    this.consigne = texte(this, LARGEUR / 2, 505, '', 30, '#ffd84a', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 12, y: 4 } }).setDepth(900).setVisible(false);
    this.touches = creerTouches(this);
    this.input.on('pointerdown', () => { this.toucher = true; });

    etiquettesTactiles({ ...VIDES, espace: 'OK' });
    const t = estTactile();
    this.afficherIntro('RÉMI - La porte', [
      REPLIQUES.porteIntro,
      `1) ÉLAN : TAPOTE ${t ? 'l\'écran' : 'ESPACE'} le plus vite possible`,
      `2) VISÉE : ${t ? 'touche' : 'ESPACE'} quand le curseur est dans la zone VERTE`,
      `${R.manches} manches : la plus grosse frappe gagne la manche.`,
    ], () => difficulteOuChoix(this, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.mancheSuivante(); }));
  }

  decor() {
    this.cameras.main.setBackgroundColor('#141018');
    const g = this.add.graphics().setDepth(1);
    g.fillGradientStyle(0x2a2030, 0x2a2030, 0x18121c, 0x18121c, 1).fillRect(0, 0, LARGEUR, SOL);
    // carrelage des toilettes du bar
    g.lineStyle(1, 0x3a3044, 1);
    for (let y = 40; y < SOL; y += 40) g.lineBetween(0, y, LARGEUR, y);
    for (let x = 0; x < LARGEUR; x += 40) g.lineBetween(x, 0, x, SOL);
    g.fillStyle(0x3a2a22, 1).fillRect(0, SOL, LARGEUR, HAUTEUR - SOL);
    // cadre de la porte
    g.fillStyle(0x2a1a10, 1).fillRect(PORTE_X - 14, 110, 172, SOL - 110);
    const s = texte(this, PORTE_X + 70, 128, 'WC', 20, '#ffffff').setDepth(4);
    s.setBackgroundColor('#2a6ad0');
  }

  mancheSuivante() {
    this.manche++;
    this.scores = { toi: 0, remi: 0 };
    annonce(this, `MANCHE ${this.manche}`, '#ffd84a', 1);
    this.majHud();
    this.time.delayedCall(1300, () => this.tourRemi());
  }

  tourRemi() {
    if (this.termine) return;
    this.etat = 'remi'; this.frappeur = 'remi';
    etiquettesTactiles(VIDES);
    this.poseRemi = 'elan';
    bulle(this, `Rémi : « ${choisir(REPLIQUES.porteRemiFrappe)} »`, '#ffd84a', 1.4, 80);
    this.time.delayedCall(900, () => {
      const s = Math.round(hasard(this.diff.remiMin, this.diff.remiMax));
      this.frapper('remi', s);
      this.time.delayedCall(1900, () => this.tourToi());
    });
  }

  tourToi() {
    if (this.termine) return;
    this.frappeur = 'toi'; this.poseRemi = 'garde';
    this.etat = 'elan'; this.jauge = 0; this.chrono = R.elan; this.tapes = 0; this.toucher = false;
    this.poseToi = 'elan';
    etiquettesTactiles({ ...VIDES, espace: 'TAPE !' });
    annonce(this, 'TAPE ! TAPE !', '#7fff7f', 0.7);
  }

  update(temps, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.horloge += dt;
    const appui = vientDAppuyer(this.touches.espace) || this.toucher;
    this.toucher = false;
    if (this.etat === 'elan') {
      if (appui) { this.jauge += R.parTape; this.tapes++; jouerSon(this, 'remi_tape', { rate: 0.8 + this.jauge * 0.8 }); }
      this.jauge = Phaser.Math.Clamp(this.jauge - R.baisse * dt, 0, 1);
      this.chrono -= dt;
      this.consigne.setVisible(true).setText(`ÉLAN : TAPOTE ${estTactile() ? 'L\'ÉCRAN' : 'ESPACE'} !   ${Math.max(0, this.chrono).toFixed(1)} s`);
      if (this.chrono <= 0) {
        this.etat = 'visee'; this.chrono = 0; this.elanFinal = this.jauge;
        etiquettesTactiles({ ...VIDES, espace: 'FRAPPE !' });
        jouerSon(this, 'ui_valider');
      }
    } else if (this.etat === 'visee') {
      this.chrono += dt;
      const ph = (this.chrono * this.diff.visee / R.periodeVisee) % 1;
      this.curseur = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      this.consigne.setVisible(true).setText(`${estTactile() ? 'TOUCHE' : 'ESPACE'} dans la zone VERTE !`);
      // un petit délai pour ne pas frapper avec la dernière tape de l'élan ; au bout de 4 s, ça part tout seul
      if ((appui && this.chrono > 0.25) || this.chrono > 4) this.frappeToi();
    } else this.consigne.setVisible(false);
    this.dessiner(dt);
  }

  frappeToi() {
    const ecart = Math.abs(this.curseur - 0.5), z = this.diff.zone / 2;
    const precision = ecart <= z ? 1 : Math.max(0, 1 - (ecart - z) / (0.5 - z));
    const s = Math.round(999 * (R.poidsElan * this.elanFinal + (1 - R.poidsElan) * precision));
    this.etat = 'frappe';
    etiquettesTactiles(VIDES);
    if (precision === 1) bulle(this, 'PILE AU CENTRE !', '#7fff7f', 1, 120);
    this.frapper('toi', s);
    this.time.delayedCall(1700, () => this.finManche());
  }

  // la frappe : pose, tremblement, fissures, compteur de la borne
  frapper(qui, score) {
    this.scores[qui] = score;
    if (qui === 'remi') this.poseRemi = 'frappe'; else this.poseToi = 'frappe';
    this.time.delayedCall(450, () => { if (qui === 'remi') this.poseRemi = 'garde'; else this.poseToi = 'garde'; });
    this.tremble = score / 999;
    this.cameras.main.shake(180 + score / 4, 0.004 + score / 999 * 0.014);
    jouerSon(this, score >= R.casse ? 'remi_porte_fort' : 'remi_porte');
    const n = Math.floor(score / 300) + (score >= R.casse ? 3 : 0);
    for (let k = 0; k < n; k++) this.fissures.push(this.fissure());
    this.compteur = 0; this.compteurCible = score;
    this.tweens.add({ targets: this, compteur: score, duration: 800, ease: 'Cubic.Out' });
    this.time.delayedCall(900, () => bulle(this, `${qui === 'remi' ? 'RÉMI' : 'TOI'} : ${score}${score >= R.casse ? '  -  LA PORTE SE FEND !' : ''}`, qui === 'remi' ? '#ffb070' : '#9fe0ff', 1.2, 150));
  }

  fissure() {
    const pts = [[PORTE_X + hasard(30, 110), hasard(220, 330)]];
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
    g.fillStyle(0x8a5a2b, 1).fillRect(PORTE_X, 124, 144, SOL - 124);
    g.lineStyle(3, 0x5a3818, 1).strokeRect(PORTE_X + 14, 150, 116, 120).strokeRect(PORTE_X + 14, 300, 116, 140);
    g.fillStyle(0xd8c060, 1).fillCircle(PORTE_X + 20, 300, 6);
    for (const f of this.fissures) {
      g.lineStyle(3, 0x1a0e06, 1).beginPath(); g.moveTo(f[0][0], f[0][1]);
      for (const [x, y] of f.slice(1)) g.lineTo(x, y);
      g.strokePath();
    }
    this.ecran.setText(String(Math.round(this.compteur)).padStart(3, '0'));
    // les deux joueurs : le frappeur devant la porte, l'autre attend à gauche
    const placer = (gr, qui, dessin, pose) => {
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
      j.fillStyle(0x000000, 0.6).fillRect(40, 150, 40, 300);
      j.fillStyle(v > 0.85 ? 0xff3030 : 0xffd84a, 1).fillRect(44, 446 - 292 * v, 32, 292 * v);
    }
    if (this.etat === 'visee') {
      const x0 = 220, L = 520, y = 440, z = this.diff.zone;
      j.fillStyle(0x000000, 0.7).fillRect(x0 - 6, y - 6, L + 12, 34);
      j.fillStyle(0xb03a3a, 1).fillRect(x0, y, L, 22);
      j.fillStyle(0xffd84a, 1).fillRect(x0 + L * (0.5 - z / 2 - 0.12), y, L * (z + 0.24), 22);
      j.fillStyle(0x3ad03a, 1).fillRect(x0 + L * (0.5 - z / 2), y, L * z, 22);
      j.fillStyle(0xffffff, 1).fillRect(x0 + L * this.curseur - 4, y - 10, 8, 42);
    }
  }
}
