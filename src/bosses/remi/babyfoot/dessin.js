// Babyfoot de Rémi — le DESSIN : décor (table, cage), Rémi, barres et figurines, balle, ligne de visée, boutons.
// Méthodes ajoutées à la scène RemiBaby (Object.assign) : « this » est la scène.
import { LARGEUR, HAUTEUR } from '../../../core/reglages.js';
import { texte } from '../../../core/ui.js';
import { jouerSon } from '../../../core/ressources.js';
import { vientDAppuyer } from '../../../core/clavier.js';
import { BABY as B, REPLIQUES } from '../reglages.js';
import { remi } from '../dessins.js';
import { bulle, annonce, hasard, choisir } from '../commun.js';
import { CX, L, W, R, proj, plier, xSur, profondeur, hommes, BARRES, BOUTON_G, BOUTON_D, BOUTON_ROULETTE, BOUTON_TIR, ZONE_BOUTONS, VIDES } from './outils.js';

export const Dessin = {

  // ---------- décor fixe : le bar, la table vue depuis ton but ----------
  decor() {
    this.cameras.main.setBackgroundColor('#1a0f12');
    const g = this.add.graphics().setDepth(1);
    g.fillGradientStyle(0x2a1418, 0x2a1418, 0x120a0c, 0x120a0c, 1).fillRect(0, 0, LARGEUR, HAUTEUR);
    const fondBar = ['remi_bar_babyfoot', 'remi_bar_interieur'].find(c => this.textures.exists(c));
    if (fondBar) {
      const im = this.add.image(LARGEUR / 2, 0, fondBar).setOrigin(0.5, 0).setDepth(1.5);
      im.setScale(Math.max(LARGEUR / im.width, 300 / im.height));
    } else {
      const neon = texte(this, 150, 34, 'BABYFOOT', 26, '#4fe8ff', { fontStyle: 'bold', stroke: '#06404a', strokeThickness: 5 }).setDepth(2).setAngle(-6);
      this.tweens.add({ targets: neon, alpha: 0.6, yoyo: true, repeat: -1, duration: 700 });
    }
    const t = this.add.graphics().setDepth(4);
    const m = 0.06;   // bord en bois autour du terrain
    const c = (x, z) => proj(x, 0, z);
    t.fillStyle(0x5a3418, 1).fillPoints([c(-W / 2 - m, -0.08), c(W / 2 + m, -0.08), c(W / 2 + m, L + m), c(-W / 2 - m, L + m)], true);
    t.fillStyle(0x2f8a3a, 1).fillPoints([c(-W / 2, 0), c(W / 2, 0), c(W / 2, L), c(-W / 2, L)], true);
    t.lineStyle(2, 0xffffff, 0.7).strokePoints([c(-W / 2, 0), c(W / 2, 0), c(W / 2, L), c(-W / 2, L)], true);
    t.lineBetween(c(-W / 2, L / 2).x, c(0, L / 2).y, c(W / 2, L / 2).x, c(0, L / 2).y);
    const r0 = c(0, L / 2);
    t.strokeEllipse(r0.x, r0.y, 0.2 * r0.k, 0.2 * r0.k * 0.32);
    // les deux buts (trou noir dans le bord)
    { const a = c(-B.but / 2, 0), b = c(B.but / 2, 0); t.fillStyle(0x0a0a0a, 1).fillRect(a.x, a.y - 6, b.x - a.x, 16); }
    // V19k : le BUT DE RÉMI bien lisible : une cage (fond sombre, filet, poteaux et barre blancs) au bout de la table
    const H = 0.075, P = 0.05;   // hauteur et profondeur de la cage (m)
    const q = (x, y, z) => proj(x, y, z);
    const g0 = q(-B.but / 2, 0, L), g1 = q(B.but / 2, 0, L), h0 = q(-B.but / 2, H, L), h1 = q(B.but / 2, H, L);
    const f0 = q(-B.but / 2, 0, L + P), f1 = q(B.but / 2, 0, L + P), fh0 = q(-B.but / 2, H, L + P), fh1 = q(B.but / 2, H, L + P);
    t.fillStyle(0x0b0b10, 1).fillPoints([h0, h1, g1, g0], true);
    t.lineStyle(1, 0xffffff, 0.35);
    for (let i = 1; i < 8; i++) { const x = -B.but / 2 + B.but * i / 8; t.lineBetween(q(x, 0, L + P).x, q(x, 0, L + P).y, q(x, H, L + P).x, q(x, H, L + P).y); }
    for (let i = 1; i < 4; i++) { const y = H * i / 4; t.lineBetween(q(-B.but / 2, y, L + P).x, q(0, y, L + P).y, q(B.but / 2, y, L + P).x, q(0, y, L + P).y); }
    t.lineStyle(1, 0xffffff, 0.3).lineBetween(fh0.x, fh0.y, h0.x, h0.y).lineBetween(fh1.x, fh1.y, h1.x, h1.y).lineBetween(f0.x, f0.y, g0.x, g0.y).lineBetween(f1.x, f1.y, g1.x, g1.y);
    t.lineStyle(Math.max(3, 0.008 * g0.k), 0xffffff, 1).lineBetween(g0.x, g0.y, h0.x, h0.y).lineBetween(g1.x, g1.y, h1.x, h1.y).lineBetween(h0.x, h0.y, h1.x, h1.y);
    this.solTable = t;
  },


  // ---------- dessin ----------
  dessiner() {
    const cam = this.cameras.main;
    cam.setRotation(this.ivresse ? Math.sin(this.horloge * 0.9) * 0.008 * Math.min(this.ivresse, B.ivresseMax) : 0);
    this.hud.setText(`TOI  ${this.butsToi}  -  ${this.butsRemi}  RÉMI` + (this.ivresse ? `     PINTES BUES : ${this.ivresse}` : ''));
    if (this.vignette) this.vignette.strength = Math.min(B.vignetteMax, this.ivresse * B.vignetteBue + (this.flou || 0));
    this.flou = Math.max(0, (this.flou || 0) - 0.01);
    // Rémi derrière la table, penché du côté où il va tirer
    if (this.pose !== 'face' && this.horloge > this.poseFin) this.pose = 'face';
    if (this.etat !== 'prep') this.penche *= 0.92;
    const yBord = proj(0, 0, L + 0.06).y;
    const bal = Math.sin(this.horloge * 1.5) * (2 + this.remiBu * 2);
    const px = CX + bal + this.penche * 75, rot = this.penche * 0.32 + bal * 0.004;   // il se penche franchement : c'est ÇA qu'on lit
    if (this.textures.exists('remi_baby')) {
      // la planche du babyfoot : cases alignées sur la casquette, le bas est caché par la table
      if (!this.imgRemi || !this.imgRemi.scene) this.imgRemi = this.add.sprite(CX, 0, 'remi_baby', 0).setOrigin(0.5, 0).setDepth(3).setScale(0.42);
      let f = { nargue: 4, boit: 5, rale: 6 }[this.pose];
      if (f === undefined) f = this.roulette ? 3 : this.penche < -0.3 ? 1 : this.penche > 0.3 ? 2 : 0;
      this.imgRemi.setFrame(f).setPosition(CX + bal + this.penche * 35, yBord - 130).setRotation(bal * 0.003);
    } else {
      this.gRemi.clear().setPosition(px, yBord + 6).setRotation(rot);
      remi(this.gRemi, this.pose === 'lance' ? 'lance' : 'face', this.horloge);
    }
    const g = this.g.clear(), ga = this.gAvant.clear();
    // de loin à près : barres de Rémi, balle, puis ton gardien devant (dans gAvant)
    const ordre = [['gar', 0xe53935], ['def', 0xe53935], ['att', 0xe53935]];
    const bz = this.balle ? this.balle.z : -1;
    // V19i : la balle a son propre calque, rangé selon sa distance (devant / derrière chaque barre et ses figurines)
    this.gBalle.clear().setDepth(profondeur(bz));
    // V19n TRAÎNÉE derrière la balle quand elle file (jaune pour un TIR ÉCLAIR)
    const vole = this.balle && (this.etat === 'riposte_vol' || this.etat === 'tir' || this.etat === 'filet') && (this.balle.vx || this.balle.vz);
    if (vole) { this.trace.push({ x: this.balle.x, z: this.balle.z }); if (this.trace.length > 9) this.trace.shift(); } else this.trace.length = 0;
    this.trace.forEach((t, i) => {
      const q = proj(t.x, R, t.z), a = (i + 1) / this.trace.length;
      this.gBalle.fillStyle(this.eclairTir && this.etat !== 'tir' ? 0xffd84a : 0xffffff, a * 0.45).fillCircle(q.x, q.y, R * q.k * (0.4 + 0.6 * a));
    });
    this.dessinerBalle(this.gBalle);
    this.dessinerEffets(ga);
    for (const [nom, coul] of ordre) {
      this.barre(g, BARRES[nom], this.pos[nom], coul, nom === 'att' ? (this.etat.startsWith('riposte') ? 1 : this.arme) : 0, nom === 'att' && this.roulette, false, nom);
    }
    this.barre(this.figures ? g : ga, BARRES.toi, this.pos.toi, 0x2f6fd6, 0, false, true, 'toi');
    // les 2 gros boutons ◀ ▶ (ils s'allument quand on appuie ; ils clignotent les premières secondes)
    if (this.etat !== 'intro') {
      const clign = this.horloge < (this.aideDoigt ?? 0) && Math.floor(this.horloge * 4) % 2 === 0;
      for (const [bt, tenu, s] of [[BOUTON_G, this.tenuG, -1], [BOUTON_D, this.tenuD, 1]]) {
        ga.fillStyle(0x000000, tenu ? 0.5 : 0.28).fillCircle(bt.x, bt.y, bt.r);
        ga.fillStyle(0x2f6fd6, tenu ? 0.55 : clign ? 0.35 : 0.12).fillCircle(bt.x, bt.y, bt.r - 6);
        ga.lineStyle(4, 0x9fc4ff, tenu ? 1 : 0.7).strokeCircle(bt.x, bt.y, bt.r);
        // GUIDE : la flèche à presser pour trouver la ligne VERTE clignote en jaune
        if (this.etat === 'riposte' && this.indice === s && !tenu) ga.fillStyle(0xffd84a, 0.35 + 0.35 * Math.sin(this.horloge * 12)).fillCircle(bt.x, bt.y, bt.r - 6);
        ga.fillStyle(0xffffff, tenu ? 1 : 0.85).fillTriangle(bt.x + s * 30, bt.y, bt.x - s * 18, bt.y - 30, bt.x - s * 18, bt.y + 30);
      }
    }
    // V19p FEINTE LISIBLE : pendant que tu vises, des zones rouges au sol montrent ce que couvre chaque défenseur
    // (elles suivent ta visée, avec retard : feinte-les)
    if (this.etat === 'riposte') {
      const br = BARRES.def, demi = B.prise * B.priseDefense;
      for (const h of hommes(br, this.pos.def)) {
        const a = proj(h - demi, 0, br.z), b = proj(h + demi, 0, br.z);
        g.fillStyle(0xff3b3b, 0.35).fillEllipse((a.x + b.x) / 2, a.y, b.x - a.x, 0.035 * a.k);
      }
    }
    // V19e LIGNE DE VISÉE pendant la riposte : VERTE si ta balle passe sa défense, ROUGE à partir du joueur qui bloque
    if (this.etat === 'riposte' && this.balle) {
      const lib = this.cheminLibre(), coul = (z) => lib.cote || z >= lib.bloque ? 0xff5a5a : lib.enFace ? 0xffd84a : 0x7fff7f;
      // le trajet (avec ses rebonds sur les bandes) : des points qui défilent vers le but
      const pas = 0.04, dec = (this.horloge * 0.25) % pas;
      // bourré, tu vois moins loin : la ligne raccourcit (et le rond d'arrivée disparaît à partir de B.ivresseRond pintes)
      const zVu = this.balle.z + (L - this.balle.z) * Math.max(B.vueMini, 1 - B.vueBue * this.ivresse);
      for (let z = this.balle.z + 0.05 + dec; z < Math.min(L, zVu); z += pas) {
        const q = proj(xSur(this.balle.x, this.balle.z, lib.biais, z), R, z);
        g.fillStyle(coul(z), 0.95).fillCircle(q.x, q.y, Math.max(2.5, 0.009 * q.k));
      }
      // le point d'arrivée sur la ligne de but : un rond (vert = BUT)
      const fin = proj(lib.xBut, R, L), cf = coul(L - 0.001);
      if (this.ivresse < B.ivresseRond) g.lineStyle(4, cf, 1).strokeEllipse(fin.x, fin.y, 0.06 * fin.k, 0.03 * fin.k);
      if (lib.libre && !lib.enFace) { const q = proj(0, 0, L); g.fillStyle(0x7fff7f, 0.18 + 0.12 * Math.sin(this.horloge * 10)).fillRect(proj(-B.but / 2, 0, L).x - 6, q.y - 0.09 * q.k, B.but * q.k + 12, 0.1 * q.k); }
      const vert = lib.libre && !lib.enFace;
      const pourquoi = lib.cote ? 'À CÔTÉ' : !lib.libre ? 'BLOQUÉ' : 'SON GARDIEN EST EN FACE';
      const [m, c] = vert ? ['LIBRE : TOUCHE TIR !', '#7fff7f']
        : this.indice === -1 ? [`${pourquoi} : ◀ TOURNE LA VISÉE`, '#ffd84a'] : this.indice === 1 ? [`${pourquoi} : TOURNE LA VISÉE ▶`, '#ffd84a']
        : this.indice === undefined ? [`${pourquoi} : tourne ta visée ◀ ▶`, '#ff7a7a']
        : [`${pourquoi} : attends qu'un trou s'ouvre`, '#ff7a7a'];
      this.txtVise.setText(m).setColor(c).setVisible(true);
    } else this.txtVise.setVisible(false);
    // le bouton TIR (sous le pouce droit, toujours là ; allumé seulement quand tu as la balle) ;
    // l'anneau jaune qui se vide = le bonus ÉCLAIR
    const tir = this.etat === 'riposte';
    this.txtTir.setVisible(this.etat !== 'intro').setAlpha(tir ? 1 : 0.35).setText('TIR');
    if (!tir && this.etat !== 'intro') { const bt = BOUTON_TIR; ga.fillStyle(0x000000, 0.25).fillCircle(bt.x, bt.y, bt.r); ga.lineStyle(3, 0xffffff, 0.3).strokeCircle(bt.x, bt.y, bt.r); }
    if (tir) {
      const f = Math.max(0, this.fenetre / this.diff.babyFenetre), bt = BOUTON_TIR;
      ga.fillStyle(0x000000, 0.45).fillCircle(bt.x, bt.y, bt.r);
      ga.fillStyle(f > 0 ? 0xffd84a : 0x7fff7f, f > 0 ? 0.35 : 0.25).fillCircle(bt.x, bt.y, bt.r - 6);
      ga.lineStyle(4, 0xffffff, 0.8).strokeCircle(bt.x, bt.y, bt.r);
      if (f > 0) ga.lineStyle(9, 0xffd84a, 1).beginPath().arc(bt.x, bt.y, bt.r + 7, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2).strokePath();
      this.txtTir.setText(f > 0 ? '⚡TIR' : 'TIR');
    }
    // le bouton « ROULETTE ! » clignote pendant le temps où l'on peut crier (après un but de Rémi en roulette)
    const appel = this.horloge < this.appelPossible;
    this.txtRoulette.setVisible(appel);
    if (appel) {
      const a = 0.55 + 0.45 * Math.sin(this.horloge * 14), bt = BOUTON_ROULETTE;
      const reste = (this.appelPossible - this.horloge) / B.appelDuree;
      ga.fillStyle(0x000000, 0.55).fillCircle(bt.x, bt.y, bt.r);
      ga.fillStyle(0xff5a5a, 0.35 + 0.3 * a).fillCircle(bt.x, bt.y, bt.r - 6);
      ga.lineStyle(9, 0xffd84a, 1).beginPath().arc(bt.x, bt.y, bt.r + 6, -Math.PI / 2, -Math.PI / 2 + reste * Math.PI * 2).strokePath();
      ga.lineStyle(4, 0xffd84a, a).strokeCircle(px, yBord - 60, 70);
    }
  },


  // une barre : la tige d'un bord à l'autre et ses joueurs (vus de dos pour toi, de face pour Rémi)
  barre(g, br, pos, coul, arme, roulette, deDos = false, nom = null) {
    const hT = 0.1;   // hauteur de la tige au-dessus du terrain
    const a = proj(-W / 2 - 0.08, hT, br.z), b = proj(W / 2 + 0.08, hT, br.z);
    g.lineStyle(Math.max(2, 0.012 * a.k), 0xcfd3d8, 1).lineBetween(a.x, a.y, b.x, b.y);
    if (deDos) {   // la poignée sur le côté
      g.fillStyle(0x222222, 1).fillRect(b.x - 6, b.y - 8, 40, 16);
    }
    // V19h : TON gardien est plus large et TRANSPARENT (on voit la balle et ses joueurs à travers, comme le boxeur de Greg) ;
    // ceux de Rémi ont un contour blanc et une ombre au sol (on voit où ils sont sur le terrain)
    const al = deDos ? B.transparenceGardien : 1;
    hommes(br, pos).forEach((x, i) => {
      const pied = proj(x, 0.005, br.z), tete = proj(x, hT + 0.035, br.z), k = pied.k;
      if (this.figures && nom) {   // l'image de la figurine (socle posé sur le terrain)
        const s = this.figs[nom][i];
        if (!deDos) g.fillStyle(0x000000, 0.4).fillEllipse(pied.x, pied.y, 0.07 * k, 0.02 * k);
        const tireur = nom !== 'att' || !this.tir || this.etat !== 'prep' || i === this.tir.qui;   // seul celui qui a la balle arme
        const f = deDos ? (this.horloge < (this.frappeToi ?? 0) ? 1 : 0) : roulette ? 3 : arme >= 0.99 ? 2 : arme > 0 && tireur ? 1 : 0;
        const h = B.hauteurFigurine * k * (deDos ? B.tailleGardien : 1) / s.height;
        s.setFrame(f).setScale(h);
        // barre LEVÉE (V19j) : les joueurs pivotent sur la tige, pieds vers Rémi : vus d'ici ils sont écrasés sous la tige
        if (f === 2 && !deDos) s.setFrame(0).setScale(h, h * B.leveEcrase).setOrigin(0.5, 0.18).setAlpha(0.7).setPosition(pied.x, proj(x, hT, br.z).y);
        else { s.setOrigin(0.5, 1).setPosition(pied.x, pied.y); if (!deDos) s.setAlpha(1); }
        return;
      }
      const largeur = (deDos ? B.largeurGardien : 0.035) * k;
      if (!deDos) g.fillStyle(0x000000, 0.4).fillEllipse(pied.x, pied.y, largeur * 2.2, largeur * 0.6);
      if (roulette) {   // la barre tourbillonne : le joueur tourne à toute vitesse
        const s = Math.sin(this.horloge * 40);
        g.fillStyle(coul, 0.9).fillRect(pied.x - largeur / 2, tete.y + (pied.y - tete.y) * (0.5 - 0.5 * Math.abs(s)), largeur, Math.max(3, (pied.y - tete.y) * Math.abs(s)));
        g.lineStyle(2, 0xffffff, 0.6).strokeEllipse(pied.x, (pied.y + tete.y) / 2, largeur * 2.4, (pied.y - tete.y) * 1.1);
        return;
      }
      // armé : le joueur se lève vers l'arrière (les pieds remontent)
      const yPied = pied.y - arme * (pied.y - tete.y) * 0.55;
      const corpsY = tete.y + 0.02 * k, corpsH = yPied - tete.y - 0.02 * k;
      g.fillStyle(coul, al).fillRoundedRect(pied.x - largeur / 2, corpsY, largeur, corpsH, 3);
      g.lineStyle(deDos ? 3 : 2, 0xffffff, deDos ? 0.9 : 0.85).strokeRoundedRect(pied.x - largeur / 2, corpsY, largeur, corpsH, 3);
      g.fillStyle(0x111111, al).fillRect(pied.x - largeur / 2, yPied - 0.012 * k, largeur, 0.012 * k);
      g.fillStyle(deDos ? 0x3a2a1a : 0xf0c8a0, al).fillCircle(tete.x, tete.y + 0.012 * k, 0.017 * k);
      if (deDos) g.fillStyle(0xffffff, al).fillRect(pied.x - largeur * 0.1, tete.y + 0.045 * k, largeur * 0.2, 0.03 * k);   // numéro dans le dos
    });
  },


  dessinerBalle(g) {
    const b = this.balle; if (!b) return;
    const p = proj(b.x, R, b.z), o = proj(b.x, 0, b.z);
    g.fillStyle(0x000000, 0.35).fillEllipse(o.x, o.y, R * 2.4 * o.k, R * 0.8 * o.k);
    g.fillStyle(0xf4f4f0, 1).fillCircle(p.x, p.y, R * p.k);
    // vision double quand tu as bu
    if (this.ivresse > 0) g.fillStyle(0xf4f4f0, 0.3).fillCircle(p.x + Math.sin(this.horloge * 1.3) * (3 + this.ivresse * 3), p.y, R * p.k);
  }
};
