// =====================================================================
// RÉMI — JEU 2 : LE BEER PONG (vu de ton bout de la table, Rémi en face)
// Chacun lance 2 balles par tour. Les 2 dedans = BALLS BACK (tu relances). Le premier qui vide les verres d'en face gagne.
// Lancer : GLISSE le doigt (ou la souris) vers le haut : la longueur = la force, le côté = la direction.
// Clavier : ◀ ▶ viser, ESPACE maintenu = jauge de force, relâcher = lancer.
// Chaque verre que Rémi te met, tu le bois : ta visée tangue de plus en plus.
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, PONG as P, REPLIQUES } from './reglages.js';
import { remi } from './dessins.js';
import { bulle, annonce, jeuSuivant, ecranPerdu, difficulteOuChoix, hasard, choisir } from './commun.js';

// ---------- projection : caméra derrière ton bout de table ----------
const CAM_Z = -2, CAM_H = 1.6, F = 775, HORIZON = -100, CX = LARGEUR / 2;
const D = P.table.longueur, W = P.table.largeur, H_VERRE = 0.12, G = 9.8;
function proj(x, y, z) {
  const p = F / (z - CAM_Z);
  return { x: CX + x * p, y: HORIZON + (CAM_H - y) * p, k: p };
}
const ETIQUETTES_VIDES = { haut: null, bas: null, gauche: null, droite: null, espace: null, z: null, x: null };

// pyramide de verres, pointe vers le milieu de la table ; loin = côté de Rémi
function pyramide(n, loin) {
  const rangs = n >= 10 ? [4, 3, 2, 1] : n >= 6 ? [3, 2, 1] : [2, 1];
  const r = P.rayon, dz = r * 1.75, v = [];
  rangs.forEach((nb, i) => {
    for (let k = 0; k < nb; k++) {
      const x = (k - (nb - 1) / 2) * r * 2.02, z = 0.13 + i * dz;
      v.push({ x, z: loin ? D - z : z, plein: true, bu: 0 });
    }
  });
  return v;
}

export class RemiPong extends BossScene {
  constructor() { super('RemiPong', IDENTITE); }

  create() {
    this.etat = 'intro';             // intro | vise | vol | remi | fin
    this.horloge = 0; this.ivresse = 0; this.ivresseRemi = 0;
    this.balle = null; this.glisse = null;
    this.visee = { x: 0, force: 0, charge: false, t: 0 };
    this.verresRemi = pyramide(P.verres, true);
    this.verresToi = pyramide(P.verres, false);
    this.decor();
    this.gRemi = this.add.graphics().setDepth(3);
    this.g = this.add.graphics().setDepth(5);
    this.gVisee = this.add.graphics().setDepth(6);
    this.hud = texte(this, LARGEUR / 2, 24, '', 20, '#ffffff', { fontStyle: 'bold' }).setDepth(900);
    this.hudTour = texte(this, LARGEUR / 2, 520, '', 22, '#7fff7f', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 10, y: 3 } }).setDepth(900);
    this.touches = creerTouches(this);
    this.installerGlisse();
    this.pose = 'face';

    etiquettesTactiles({ ...ETIQUETTES_VIDES, espace: 'OK' });
    const t = estTactile();
    this.afficherIntro('RÉMI - Le beer pong', [
      'Vide les verres de Rémi avant qu\'il vide les tiens !',
      'GLISSE ' + (t ? 'le doigt' : 'la souris') + ' vers le haut : longueur = force, côté = direction',
      t ? '' : 'ou : ◀ ▶ viser, ESPACE maintenu = force, relâche = lance',
      '2 balles par tour ; les 2 dedans = BALLS BACK (tu rejoues)',
      'Chaque verre que Rémi te met... tu le bois : ta visée tangue !',
    ].filter(Boolean), () => difficulteOuChoix(this, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.demarrer(); }));
  }

  demarrer() {
    this.tourDe('toi');
    bulle(this, 'Rémi : « Les invités d\'abord. Vas-y, rate. »', '#ffd84a', 2.4, 70);
  }

  tourDe(qui) {
    this.qui = qui; this.balles = 2; this.reussis = 0; this.ballsBack = false;
    if (qui === 'toi') { this.etat = 'vise'; etiquettesTactiles(ETIQUETTES_VIDES); }
    else { this.etat = 'remi'; this.time.delayedCall(900, () => this.lancerRemi()); }
  }

  // ---------- décor fixe : le bar, la table ----------
  decor() {
    this.cameras.main.setBackgroundColor('#1a0f12');
    const g = this.add.graphics().setDepth(1);
    g.fillGradientStyle(0x2a1418, 0x2a1418, 0x120a0c, 0x120a0c, 1).fillRect(0, 0, LARGEUR, HAUTEUR);
    // étagères de bouteilles derrière Rémi
    for (const y of [70, 130]) {
      g.fillStyle(0x4a2a18, 1).fillRect(80, y + 30, 800, 8);
      for (let x = 100; x < 870; x += 26) {
        const c = choisir([0x2e7d32, 0x8d5a2b, 0x9fd8e8, 0xb03a3a, 0xd8c060]);
        g.fillStyle(c, 0.85).fillRect(x, y + 4, 12, 26).fillRect(x + 4, y - 6, 4, 10);
      }
    }
    const neon = texte(this, 150, 40, 'BEER PONG', 26, '#4fe8ff', { fontStyle: 'bold', stroke: '#06404a', strokeThickness: 5 }).setDepth(2).setAngle(-6);
    this.tweens.add({ targets: neon, alpha: 0.6, yoyo: true, repeat: -1, duration: 700 });
    // table (trapèze en perspective)
    const t = this.add.graphics().setDepth(4);
    const a = proj(-W / 2, 0, 0), b = proj(W / 2, 0, 0), c = proj(W / 2, 0, D), d = proj(-W / 2, 0, D);
    t.fillStyle(0x1a3a6a, 1).fillPoints([a, b, c, d], true);
    t.lineStyle(4, 0xffffff, 0.8).strokePoints([a, b, c, d], true);
    const m1 = proj(0, 0, 0), m2 = proj(0, 0, D);
    t.lineStyle(2, 0xffffff, 0.35).lineBetween(m1.x, m1.y, m2.x, m2.y);
    const e = proj(-W / 2, 0, D / 2), f = proj(W / 2, 0, D / 2);
    t.lineStyle(3, 0xffffff, 0.5).lineBetween(e.x, e.y, f.x, f.y);
    t.fillStyle(0x0e2240, 1).fillRect(a.x, a.y, b.x - a.x, 24);   // épaisseur du bord de table
  }

  // ---------- lancer au doigt / à la souris ----------
  installerGlisse() {
    this.input.on('pointerdown', (p) => {
      if (this.etat !== 'vise' || this.termine) return;
      this.glisse = { x0: p.x, y0: p.y, x: p.x, y: p.y };
    });
    this.input.on('pointermove', (p) => { if (this.glisse) { this.glisse.x = p.x; this.glisse.y = p.y; } });
    this.input.on('pointerup', (p) => {
      if (!this.glisse) return;
      const gl = this.glisse; this.glisse = null;
      if (this.etat !== 'vise') return;
      const cible = this.cibleGlisse(gl.x0, gl.y0, p.x, p.y);
      if (cible) this.lancerToi(cible.x, cible.z);
    });
  }

  // longueur du geste vers le haut = force (portée), écart sur le côté = direction
  cibleGlisse(x0, y0, x1, y1) {
    const dy = y0 - y1, dx = x1 - x0;
    if (dy < 35) return null;
    const force = Phaser.Math.Clamp((dy - 35) / 300, 0, 1.15);
    return { x: Phaser.Math.Clamp(dx / 230, -1, 1) * (W / 2), z: 0.6 + force * 2.0 };
  }

  // tangage de l'ivresse (visible sur la visée)
  tangage() {
    const a = this.ivresse * P.ivresse;
    return { x: a * Math.sin(this.horloge * 1.7), z: a * 1.6 * Math.cos(this.horloge * 1.13) };
  }

  update(temps, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.horloge += dt;
    if (this.etat === 'vise') this.viseClavier(dt);
    if (this.balle) this.balleVol(dt);
    this.dessiner(dt);
  }

  viseClavier(dt) {
    const T = this.touches, v = this.visee;
    if (T.gauche.isDown) v.x -= 0.45 * dt;
    if (T.droite.isDown) v.x += 0.45 * dt;
    v.x = Phaser.Math.Clamp(v.x, -W / 2, W / 2);
    if (T.espace.isDown) {
      if (!v.charge) { v.charge = true; v.t = 0; }
      v.t += dt;
      const ph = (v.t / P.balancier) % 1;
      v.force = ph < 0.5 ? ph * 2 : 2 - ph * 2;
    } else if (v.charge) {
      v.charge = false;
      this.lancerToi(v.x, 0.6 + v.force * 2.0);
    }
  }

  lancerToi(tx, tz) {
    const s = this.tangage(), e = this.diff.erreur;
    const ex = (hasard(-1, 1) + hasard(-1, 1)) / 2 * e, ez = (hasard(-1, 1) + hasard(-1, 1)) / 2 * e * 1.5;
    this.balles--;
    this.etat = 'vol';
    this.lancer({ x: 0.05, y: 0.3, z: -0.3 }, tx + s.x + ex, tz + s.z + ez, this.verresRemi, 'toi');
    jouerSon(this, 'remi_lance');
  }

  lancerRemi() {
    if (this.termine) return;
    const pleins = this.verresToi.filter(v => v.plein);
    const cible = choisir(pleins);
    const chance = Math.max(0.1, this.diff.remi - this.ivresseRemi * 0.025);
    let tx, tz;
    const a = Math.random() * Math.PI * 2;
    if (Math.random() < chance) { const r = Math.random() * P.rayon * 0.5; tx = cible.x + Math.cos(a) * r; tz = cible.z + Math.sin(a) * r; }
    else { const r = hasard(P.rayon * 1.3, P.rayon * 3.2); tx = cible.x + Math.cos(a) * r; tz = cible.z + Math.sin(a) * r; }
    this.balles--;
    this.pose = 'lance';
    this.time.delayedCall(350, () => { this.pose = 'face'; });
    this.lancer({ x: hasard(-0.12, 0.12), y: 0.55, z: D + 0.25 }, tx, tz, this.verresToi, 'remi');
    jouerSon(this, 'remi_lance');
  }

  // vol en cloche jusqu'au plan du haut des verres, en dureeVol secondes (un peu plus long si c'est loin)
  lancer(depart, tx, tz, verres, qui) {
    const dist = Math.hypot(tx - depart.x, tz - depart.z);
    const T = P.dureeVol * (0.65 + 0.35 * dist / D);
    this.balle = {
      x: depart.x, y: depart.y, z: depart.z, t: 0, T, tx, tz, verres, qui, etat: 'vol',
      vx: (tx - depart.x) / T, vz: (tz - depart.z) / T, vy: (H_VERRE - depart.y + G * T * T / 2) / T, fin: 0, rebonds: 0,
    };
  }

  balleVol(dt) {
    const b = this.balle;
    b.t += dt;
    if (b.etat === 'dedans') { b.fin -= dt; b.y = Math.max(0.02, b.y - dt * 0.4); if (b.fin <= 0) this.finBalle(); return; }
    if (b.etat === 'rebord') { b.fin -= dt; if (b.fin <= 0) this.resoudreRebord(); return; }
    b.x += b.vx * dt; b.z += b.vz * dt; b.vy -= G * dt; b.y += b.vy * dt;
    if (b.etat === 'vol' && b.t >= b.T) { this.arrivee(); return; }
    if (b.etat === 'libre') {
      const surTable = Math.abs(b.x) <= W / 2 && b.z >= 0 && b.z <= D;
      if (surTable && b.y <= 0 && b.vy < 0) {
        b.y = 0; b.vy = -b.vy * 0.45; b.rebonds++;
        if (b.rebonds <= 2) jouerSon(this, 'remi_rebond');
      }
      if (b.y < -0.8 || b.t > b.T + 1.6) this.finBalle();
    }
  }

  // la balle arrive à hauteur des verres : dedans ? rebord ? raté ?
  arrivee() {
    const b = this.balle, r = P.rayon;
    let meilleur = null, dmin = 9;
    for (const v of b.verres) if (v.plein) { const d = Math.hypot(b.x - v.x, b.z - v.z); if (d < dmin) { dmin = d; meilleur = v; } }
    b.verre = meilleur;
    if (meilleur && dmin < r * P.dedans) { this.dedans(); return; }
    if (meilleur && dmin < r * P.rebord) { b.etat = 'rebord'; b.fin = 0.55; b.x = meilleur.x + (b.x - meilleur.x) * 0.9; jouerSon(this, 'remi_rebond'); return; }
    b.etat = 'libre';
  }

  resoudreRebord() {
    const b = this.balle;
    if (Math.random() < 0.5) { this.dedans(); return; }
    b.etat = 'libre'; b.vy = 1.2; b.vx = (b.x - b.verre.x) * 12; b.vz = (b.z - b.verre.z) * 12 + (b.qui === 'toi' ? 0.6 : -0.6);
    bulle(this, 'Sur le rebord... et non !', '#ffb0b0', 1, 120);
  }

  dedans() {
    const b = this.balle, v = b.verre;
    b.etat = 'dedans'; b.fin = 0.5; b.x = v.x; b.z = v.z; b.y = H_VERRE;
    v.plein = false; v.bu = 1;
    this.reussis++;
    jouerSon(this, 'remi_plouf');
    this.cameras.main.shake(120, 0.004);
    if (b.qui === 'toi') {
      this.ivresseRemi++;
      bulle(this, choisir(['PLOUF !', 'DEDANS !', 'Bois, Rémi !']), '#7fff7f', 1, 120);
      if (Math.random() < 0.6) this.time.delayedCall(700, () => bulle(this, `Rémi : « ${choisir(REPLIQUES.pongToucheToi)} »`, '#ffd84a', 1.6, 70));
    } else {
      this.ivresse++;
      bulle(this, `Tu bois ! (verres bus : ${this.ivresse})`, '#ffb0b0', 1.3, 120);
      this.time.delayedCall(600, () => bulle(this, `Rémi : « ${choisir(REPLIQUES.pongToucheRemi)} »`, '#ffd84a', 1.6, 70));
      this.cameras.main.shake(300, 0.006);
    }
  }

  finBalle() {
    const b = this.balle;
    this.balle = null;
    if (b.qui === 'remi' && b.etat !== 'dedans' && Math.random() < 0.4) bulle(this, `Rémi : « ${choisir(REPLIQUES.pongRateRemi)} »`, '#ffd84a', 1.4, 70);
    if (!this.verresRemi.some(v => v.plein)) { this.gagne(); return; }
    if (!this.verresToi.some(v => v.plein)) { this.etat = 'fin'; this.time.delayedCall(600, () => ecranPerdu(this, 'PERDU AU BEER PONG', REPLIQUES.pongPerdu, this.nomDiff)); return; }
    if (this.balles > 0) { if (b.qui === 'toi') this.etat = 'vise'; else this.time.delayedCall(700, () => this.lancerRemi()); return; }
    // fin du tour : les 2 dedans = BALLS BACK (une fois par tour)
    if (this.reussis === 2 && !this.ballsBack) {
      this.ballsBack = true;
      annonce(this, 'BALLS BACK !', '#7fff7f');
      this.time.delayedCall(900, () => { this.balles = 2; this.reussis = 0; if (b.qui === 'toi') this.etat = 'vise'; else this.lancerRemi(); });
      if (b.qui !== 'toi') this.etat = 'remi';
      else this.etat = 'pause';
      return;
    }
    const suivant = b.qui === 'toi' ? 'remi' : 'toi';
    this.etat = 'pause';
    this.time.delayedCall(500, () => this.tourDe(suivant));
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
    // Rémi derrière la table (il tangue un peu plus à chaque verre bu)
    const gr = this.gRemi.clear();
    const bal = Math.sin(this.horloge * 1.5) * (2 + this.ivresseRemi * 2);
    gr.setPosition(CX + bal, proj(0, 0, D).y + 6).setRotation(bal * 0.004);
    remi(gr, this.pose, this.horloge);

    const g = this.g.clear();
    const objets = [];
    for (const v of [...this.verresRemi, ...this.verresToi]) if (v.plein || v.bu > 0) objets.push({ z: v.z, f: () => this.verre(g, v) });
    const b = this.balle;
    if (b) objets.push({ z: b.etat === 'dedans' ? b.z + 0.001 : b.z - 0.02, f: () => this.dessinerBalle(g, b) });
    objets.sort((a, c) => c.z - a.z).forEach(o => o.f());
    for (const v of [...this.verresRemi, ...this.verresToi]) if (!v.plein && v.bu > 0) v.bu = Math.max(0, v.bu - 0.025);

    // visée (ton tour)
    const gv = this.gVisee.clear();
    if (this.etat === 'vise') {
      const s = this.tangage();
      if (this.visee.charge || !estTactile()) {
        const x = this.visee.x + s.x;
        const p0 = proj(x, 0, 0.1), p1 = proj(x, 0, D);
        gv.lineStyle(3, 0xffffff, 0.35);
        for (let k = 0; k < 14; k++) { const a = k / 14, c = (k + 0.5) / 14; gv.lineBetween(p0.x + (p1.x - p0.x) * a, p0.y + (p1.y - p0.y) * a, p0.x + (p1.x - p0.x) * c, p0.y + (p1.y - p0.y) * c); }
      }
      if (this.visee.charge) {
        gv.fillStyle(0x000000, 0.6).fillRect(LARGEUR - 70, 160, 34, 260);
        const f = this.visee.force;
        gv.fillStyle(f > 0.65 && f < 0.85 ? 0x7fff7f : 0xffd84a, 1).fillRect(LARGEUR - 66, 416 - 252 * f, 26, 252 * f);
        if (this.diff.aide) this.repere(gv, this.visee.x + s.x, 0.6 + f * 2.0 + s.z);
      }
      if (this.glisse) {
        const gl = this.glisse;
        gv.lineStyle(5, 0xffd84a, 0.8).lineBetween(gl.x0, gl.y0, gl.x, gl.y);
        gv.fillStyle(0xffd84a, 1).fillCircle(gl.x, gl.y, 8);
        const c = this.cibleGlisse(gl.x0, gl.y0, gl.x, gl.y);
        if (c && this.diff.aide) this.repere(gv, c.x + s.x, c.z + s.z);
      }
    }
    // HUD
    const n = (l) => l.filter(v => v.plein).length;
    this.hud.setText(`TOI : ${n(this.verresToi)} verres      RÉMI : ${n(this.verresRemi)} verres      bus : ${this.ivresse}`);
    const tour = this.etat === 'vise' ? `À TOI  -  balle ${3 - this.balles} / 2  -  ${estTactile() ? 'glisse le doigt vers le haut' : 'glisse la souris, ou ◀ ▶ + ESPACE'}`
      : (this.etat === 'remi' || (this.balle && this.balle.qui === 'remi')) ? 'RÉMI LANCE...' : '';
    this.hudTour.setText(tour).setVisible(!!tour);
    // l'ivresse fait un peu tanguer l'écran
    this.cameras.main.setRotation(Math.sin(this.horloge * 0.9) * this.ivresse * 0.004);
  }

  repere(g, x, z) {
    const p = proj(x, H_VERRE, z);
    g.lineStyle(3, 0x7fff7f, 0.9).strokeEllipse(p.x, p.y, p.k * 0.06, p.k * 0.03);
  }

  verre(g, v) {
    const r = P.rayon, haut = proj(v.x, H_VERRE, v.z), bas = proj(v.x, 0, v.z);
    const rx = r * haut.k, ry = rx * 0.42, rb = rx * 0.72;
    g.fillStyle(0x000000, 0.25).fillEllipse(bas.x, bas.y, rb * 2.4, ry * 1.4);
    if (!v.plein) { g.fillStyle(0xffffff, v.bu * 0.6).fillCircle(haut.x, haut.y - rx * 0.6, rx * (1.4 - v.bu)); return; }
    g.fillStyle(0xc81e2a, 1).fillPoints([{ x: haut.x - rx, y: haut.y }, { x: haut.x + rx, y: haut.y }, { x: bas.x + rb, y: bas.y }, { x: bas.x - rb, y: bas.y }], true);
    g.fillStyle(0x9a1420, 1).fillEllipse(bas.x, bas.y, rb * 2, ry * 1.4);
    g.fillStyle(0xc81e2a, 1).fillRect(bas.x - rb, bas.y - 2, rb * 2, 2);
    g.fillStyle(0xf4f4f4, 1).fillEllipse(haut.x, haut.y, rx * 2, ry * 2);
    g.fillStyle(0xe8a52a, 1).fillEllipse(haut.x, haut.y + 1, rx * 1.7, ry * 1.6);
    g.fillStyle(0xfff3c8, 0.8).fillEllipse(haut.x - rx * 0.3, haut.y, rx * 0.5, ry * 0.5);
  }

  dessinerBalle(g, b) {
    const p = proj(b.x, b.y, b.z), o = proj(b.x, 0, b.z);
    const r = Math.max(3, 0.022 * p.k);
    if (b.y > -0.05 && Math.abs(b.x) < W / 2 && b.z > 0 && b.z < D) g.fillStyle(0x000000, 0.3).fillEllipse(o.x, o.y, r * 2.2, r * 0.9);
    if (b.etat === 'dedans' && b.fin < 0.3) return;
    g.fillStyle(0x222222, 1).fillCircle(p.x, p.y, r + 1);
    g.fillStyle(0xffffff, 1).fillCircle(p.x, p.y, r);
    g.fillStyle(0xdddddd, 1).fillCircle(p.x + r * 0.3, p.y + r * 0.3, r * 0.5);
  }
}
