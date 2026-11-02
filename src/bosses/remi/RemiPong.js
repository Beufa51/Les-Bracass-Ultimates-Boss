// =====================================================================
// RÉMI — JEU 2 : LE BEER PONG (vu de ton bout de la table, Rémi en face)
// Chacun lance 2 balles par tour. Les 2 dedans = BALLS BACK (tu relances). Le premier qui vide les verres d'en face gagne.
// Lancer en 2 temps : 1) VISER : toucher (ou cliquer) le verre visé ; clavier : ◀ ▶ ▲ ▼ puis ESPACE.
//                     2) FORCE : la jauge va et vient ; toucher / ESPACE quand le curseur est dans le VERT.
// Dans le vert = la balle tombe sur la cible (à un poil près) ; trop fort / pas assez = trop loin / trop court.
// Chaque verre que Rémi te met, tu le bois : ta visée tangue de plus en plus.
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
    this.balle = null;
    this.visee = { x: 0, z: D - 0.25, force: 0, t: 0 };
    this.verresRemi = pyramide(P.verres, true);
    this.verresToi = pyramide(P.verres, false);
    this.decor();
    this.gRemi = this.add.graphics().setDepth(3);
    this.g = this.add.graphics().setDepth(5);
    this.gVisee = this.add.graphics().setDepth(6);
    this.hud = texte(this, LARGEUR / 2, 24, '', 20, '#ffffff', { fontStyle: 'bold' }).setDepth(900);
    this.hudTour = texte(this, LARGEUR / 2, 520, '', 22, '#7fff7f', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 10, y: 3 } }).setDepth(900);
    this.txtCourt = texte(this, 225, 463, 'court', 16, '#ffb0b0').setDepth(901).setVisible(false);
    this.txtLoin = texte(this, 735, 463, 'loin', 16, '#ffb0b0').setDepth(901).setVisible(false);
    this.touches = creerTouches(this);
    jouerMusique(this, 'remi_musique_bar');   // la musique du bar (dès l'écran des commandes)
    this.installerVisee();
    this.pose = 'face'; this.poseFin = 0;

    etiquettesTactiles({ ...ETIQUETTES_VIDES, espace: 'OK' });
    const t = estTactile();
    this.afficherIntro('RÉMI - Le beer pong', [
      'Vide les verres de Rémi avant qu\'il vide les tiens !',
      `1) VISE : ${t ? 'touche' : 'clique sur'} le verre que tu vises${t ? '' : ' (ou ◀ ▶ ▲ ▼ puis ESPACE)'}`,
      `2) FORCE : ${t ? 'touche' : 'clique (ou ESPACE)'} quand le curseur est dans le VERT`,
      '2 balles par tour ; les 2 dedans = BALLS BACK (tu rejoues)',
      'Chaque verre que Rémi te met... tu le bois : ta visée tangue !',
    ].filter(Boolean), () => difficulteOuChoix(this, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.demarrer(); }));
  }

  demarrer() {
    this.tourDe('toi');
    bulle(this, 'Rémi : « Les invités d\'abord. Vas-y, rate. »', '#ffd84a', 2.4, 250);
  }

  tourDe(qui) {
    this.qui = qui; this.balles = 2; this.reussis = 0; this.ballsBack = false;
    if (qui === 'toi') { this.commencerVisee(); etiquettesTactiles(ETIQUETTES_VIDES); }
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

  // ---------- viser au doigt / à la souris ----------
  commencerVisee() {
    this.etat = 'vise'; this.viseDepuis = this.horloge;
    const v = this.visee, pleins = this.verresRemi.filter(c => c.plein);
    if (pleins.length) { const c = pleins.reduce((a, b) => (Math.abs(b.x) + Math.abs(b.z - (D - 0.25)) < Math.abs(a.x) + Math.abs(a.z - (D - 0.25)) ? b : a)); v.x = c.x; v.z = c.z; }
    etiquettesTactiles({ ...ETIQUETTES_VIDES, espace: 'OK' });
  }

  commencerForce() {
    this.etat = 'force'; this.visee.t = Math.random() * 0.3; this.visee.force = 0;
    etiquettesTactiles({ ...ETIQUETTES_VIDES, espace: 'LANCE !' });
    jouerSon(this, 'ui_valider');
  }

  installerVisee() {
    this.input.on('pointerdown', (p) => {
      if (this.termine) return;
      if (this.etat === 'force') { this.lancerToi(); return; }
      if (this.etat !== 'vise') return;
      // point de la table sous le doigt (au niveau du haut des verres), puis aimanté sur le verre le plus proche
      if (p.y <= HORIZON + 5) return;
      const z = CAM_Z + (CAM_H - H_VERRE) * F / (p.y - HORIZON), x = (p.x - CX) * (z - CAM_Z) / F;
      let meilleur = null, dmin = 0.16;
      for (const c of this.verresRemi) if (c.plein) { const d = Math.hypot(c.x - x, c.z - z); if (d < dmin) { dmin = d; meilleur = c; } }
      if (meilleur) { this.visee.x = meilleur.x; this.visee.z = meilleur.z; }
      else if (z > D / 2 && z < D + 0.2) { this.visee.x = Phaser.Math.Clamp(x, -W / 2, W / 2); this.visee.z = z; }
      else return;
      this.commencerForce();
    });
  }

  // écart de portée dû à la jauge : dans le vert = presque rien ; hors du vert = trop court / trop loin
  ecartForce(f) {
    const off = f - 0.5, z = this.diff.zoneForce / 2, a = Math.abs(off);
    return Math.sign(off) * (a <= z ? a * 0.25 : z * 0.25 + (a - z) * 1.0);
  }

  // tangage de l'ivresse (visible sur la visée)
  tangage() {
    const a = this.ivresse * P.ivresse;
    return { x: a * Math.sin(this.horloge * 1.7), z: a * 1.6 * Math.cos(this.horloge * 1.13) };
  }

  update(temps, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.horloge += dt;
    if (this.etat === 'vise' || this.etat === 'force') this.viseClavier(dt);
    if (this.balle) this.balleVol(dt);
    this.dessiner(dt);
  }

  viseClavier(dt) {
    const T = this.touches, v = this.visee;
    if (this.etat === 'vise') {
      if (T.gauche.isDown) v.x -= 0.35 * dt;
      if (T.droite.isDown) v.x += 0.35 * dt;
      if (T.haut.isDown) v.z += 0.35 * dt;
      if (T.bas.isDown) v.z -= 0.35 * dt;
      v.x = Phaser.Math.Clamp(v.x, -W / 2, W / 2); v.z = Phaser.Math.Clamp(v.z, D / 2, D);
      if (vientDAppuyer(T.espace) && this.horloge - this.viseDepuis > 0.25) this.commencerForce();
      return;
    }
    v.t += dt;
    const ph = (v.t * this.diff.visee / P.balancier) % 1;
    v.force = ph < 0.5 ? ph * 2 : 2 - ph * 2;
    if (vientDAppuyer(T.espace) && v.t > 0.15) this.lancerToi();
  }

  lancerToi() {
    const s = this.tangage(), e = this.diff.erreur, v = this.visee;
    const ex = (hasard(-1, 1) + hasard(-1, 1)) / 2 * e, ez = (hasard(-1, 1) + hasard(-1, 1)) / 2 * e;
    const f = v.force, dz = this.ecartForce(f);
    if (Math.abs(f - 0.5) <= this.diff.zoneForce / 2) bulle(this, 'Bonne force !', '#7fff7f', 0.7, 300);
    else bulle(this, f > 0.5 ? 'Trop fort !' : 'Trop court !', '#ffb0b0', 0.7, 300);
    this.balles--;
    this.etat = 'vol';
    this.lancer({ x: 0.05, y: 0.3, z: -0.3 }, v.x + s.x + ex, v.z + s.z + ez + dz, this.verresRemi, 'toi');
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
    this.poseTemp('lance', 0.6);
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
    bulle(this, 'Sur le rebord... et non !', '#ffb0b0', 1, 300);
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
      this.time.delayedCall(450, () => this.poseTemp('boit', 1.6));
      bulle(this, choisir(['PLOUF !', 'DEDANS !', 'Bois, Rémi !']), '#7fff7f', 1, 300);
      if (Math.random() < 0.6) this.time.delayedCall(700, () => bulle(this, `Rémi : « ${choisir(REPLIQUES.pongToucheToi)} »`, '#ffd84a', 1.6, 250));
    } else {
      this.ivresse++;
      this.time.delayedCall(300, () => this.poseTemp('nargue', 1.6));
      bulle(this, `Tu bois ! (verres bus : ${this.ivresse})`, '#ffb0b0', 1.3, 300);
      this.time.delayedCall(600, () => bulle(this, `Rémi : « ${choisir(REPLIQUES.pongToucheRemi)} »`, '#ffd84a', 1.6, 250));
      this.cameras.main.shake(300, 0.006);
    }
  }

  finBalle() {
    const b = this.balle;
    this.balle = null;
    if (b.qui === 'remi' && b.etat !== 'dedans' && Math.random() < 0.4) bulle(this, `Rémi : « ${choisir(REPLIQUES.pongRateRemi)} »`, '#ffd84a', 1.4, 250);
    if (!this.verresRemi.some(v => v.plein)) { this.gagne(); return; }
    if (!this.verresToi.some(v => v.plein)) { this.etat = 'fin'; this.time.delayedCall(600, () => ecranPerdu(this, 'PERDU AU BEER PONG', REPLIQUES.pongPerdu, this.nomDiff)); return; }
    if (this.balles > 0) { if (b.qui === 'toi') this.commencerVisee(); else this.time.delayedCall(700, () => this.lancerRemi()); return; }
    // fin du tour : les 2 dedans = BALLS BACK (une fois par tour)
    if (this.reussis === 2 && !this.ballsBack) {
      this.ballsBack = true;
      annonce(this, 'BALLS BACK !', '#7fff7f');
      this.time.delayedCall(900, () => { this.balles = 2; this.reussis = 0; if (b.qui === 'toi') this.commencerVisee(); else this.lancerRemi(); });
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
    if (this.pose !== 'face' && this.horloge > this.poseFin) this.pose = 'face';
    if (this.textures.exists('remi_pong')) {
      // la planche de Rémi de face (attend, lance, boit, nargue), coupée à la taille : la table cache le bas
      if (!this.imgRemi) this.imgRemi = this.add.sprite(CX, 0, 'remi_pong', 0).setOrigin(0.5, 1).setDepth(3).setScale(0.36);
      this.imgRemi.setFrame({ face: 0, lance: 1, boit: 2, nargue: 3 }[this.pose] ?? 0);
      this.imgRemi.setPosition(CX + bal, proj(0, 0, D).y + 34).setRotation(bal * 0.004);
      return this.dessinerTable();
    }
    gr.setPosition(CX + bal, proj(0, 0, D).y + 6).setRotation(bal * 0.004);
    remi(gr, this.pose, this.horloge);
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
    for (const v of [...this.verresRemi, ...this.verresToi]) if (!v.plein && v.bu > 0) v.bu = Math.max(0, v.bu - 0.025);

    // visée (ton tour) : la cible tangue avec l'ivresse ; la jauge de force en bas
    const gv = this.gVisee.clear();
    if (this.etat === 'vise' || this.etat === 'force') {
      const s = this.tangage(), v = this.visee;
      const p = proj(v.x + s.x, H_VERRE, v.z + s.z), r = P.rayon * p.k;
      const pulse = this.etat === 'vise' ? 1 + 0.15 * Math.sin(this.horloge * 8) : 1;
      gv.lineStyle(3, 0xffd84a, 1).strokeEllipse(p.x, p.y, r * 2.6 * pulse, r * 1.2 * pulse);
      gv.lineBetween(p.x - r * 1.8, p.y, p.x - r * 0.7, p.y).lineBetween(p.x + r * 0.7, p.y, p.x + r * 1.8, p.y);
      gv.lineBetween(p.x, p.y - r * 1.2, p.x, p.y - r * 0.4);
      if (this.etat === 'force') {
        const x0 = 260, L = 440, y = 452, z = this.diff.zoneForce;
        gv.fillStyle(0x000000, 0.7).fillRect(x0 - 6, y - 6, L + 12, 34);
        gv.fillStyle(0xb03a3a, 1).fillRect(x0, y, L, 22);
        gv.fillStyle(0xffd84a, 1).fillRect(x0 + L * (0.5 - z / 2 - 0.1), y, L * (z + 0.2), 22);
        gv.fillStyle(0x3ad03a, 1).fillRect(x0 + L * (0.5 - z / 2), y, L * z, 22);
        gv.fillStyle(0xffffff, 1).fillRect(x0 + L * v.force - 4, y - 10, 8, 42);
        this.txtCourt.setVisible(true); this.txtLoin.setVisible(true);
        if (this.diff.aide) { const q = proj(v.x + s.x, H_VERRE, v.z + s.z + this.ecartForce(v.force)); gv.fillStyle(0x7fff7f, 0.9).fillCircle(q.x, q.y, 4); }
      }
    }
    if (this.etat !== 'force') { this.txtCourt.setVisible(false); this.txtLoin.setVisible(false); }
    // HUD
    const n = (l) => l.filter(v => v.plein).length;
    this.hud.setText(`TOI : ${n(this.verresToi)} verres      RÉMI : ${n(this.verresRemi)} verres      bus : ${this.ivresse}`);
    const tour = this.etat === 'vise' ? `À TOI  -  balle ${3 - this.balles} / 2  -  ${estTactile() ? 'touche le verre visé' : 'clique sur un verre (ou ◀ ▶ ▲ ▼ + ESPACE)'}`
      : this.etat === 'force' ? `${estTactile() ? 'TOUCHE' : 'CLIQUE / ESPACE'} quand le curseur est dans le VERT !`
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
