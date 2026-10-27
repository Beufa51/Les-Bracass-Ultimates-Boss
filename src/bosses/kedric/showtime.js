// =====================================================================
// SHOWTIME : le DUEL DE FRIME contre Kédric (façon PaRappa / Simon).
// Kédric montre une suite de pas en rythme (une pose, une flèche de couleur, un son par pas),
// puis il te tend le micro : « À TOI ! ». Tu refais les mêmes pas, sur les mêmes temps (◀ ▶ ▲ ▼).
// Une FLÈCHE ROUGE veut dire « fais l'INVERSE » (◀ ↔ ▶, ▲ ↔ ▼).
// La jauge du PUBLIC fait le tir à la corde : pile sur le temps = le public est pour toi.
// Toute la logique avance dans maj(dt, touches) (pas de minuteries Phaser) : les bots peuvent jouer en accéléré.
// =====================================================================
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { texte } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { onomatopee, lignesImpact } from './effets.js';
import { REGLAGES as R } from './reglages.js';

const S = R.showtime;
const FLECHES = { gauche: '◀', droite: '▶', haut: '▲', bas: '▼' };
const COULEURS = { gauche: '#3fa7ff', droite: '#ff9a3c', haut: '#ffd84a', bas: '#d9a0ff' };
const INVERSE = { gauche: 'droite', droite: 'gauche', haut: 'bas', bas: 'haut' };
const SON = { gauche: 0.9, droite: 1.1, haut: 1.3, bas: 0.75 };   // une note par direction
const P = 600;   // profondeur d'affichage (sous le HUD et les encarts)

export class Showtime {
  // options : { manches: [4, 6, 8], rouges: [0, 0, 2], jauge: -30..30, mini: false } ; fin(gagne, bilan) appelé à la fin
  constructor(scene, options, fin) {
    this.s = scene; this.o = options; this.fin = fin;
    this.jauge = options.jauge || 0;
    this.manche = -1;
    this.bilan = { parfaits: 0, bien: 0, rates: 0 };
    this.fenetre = { parfait: S.parfait * scene.diff.fenetreShow, bien: S.bien * scene.diff.fenetreShow };
    this.el = [];
    // projecteurs sur Kédric
    const g = this.ajout(scene.add.graphics().setDepth(P));
    g.fillStyle(0x000000, 0.45); g.fillRect(0, 160, LARGEUR, HAUTEUR - 160);
    g.fillStyle(0xfff3a8, 0.13);
    for (const x0 of [380, 740]) { g.beginPath(); g.moveTo(x0, 0); g.lineTo(440, 480); g.lineTo(700, 480); g.closePath(); g.fillPath(); }
    g.fillStyle(0xfff3a8, 0.18); g.fillEllipse(570, 470, 300, 50);
    this.kedric = this.ajout(scene.add.sprite(570, 468, 'kedric_portrait').setOrigin(0.5, 1).setDepth(P + 2));
    this.toi = this.ajout(scene.add.sprite(215, HAUTEUR + 10, 'kedric_toi_course', 0).setOrigin(0.5, 1).setDepth(P + 3));
    this.flecheKedric = this.ajout(texte(scene, 790, 300, '', 110, '#ffffff', { fontStyle: 'bold', strokeThickness: 12 }).setDepth(P + 4));
    // la jauge du public (tir à la corde) : à gauche Kédric (vert), à droite toi (rouge)
    this.jaugeG = this.ajout(scene.add.graphics().setDepth(P + 4));
    this.ajout(texte(scene, LARGEUR / 2 - 245, 160, 'KÉDRIC', 15, '#7fff7f').setDepth(P + 4));
    this.ajout(texte(scene, LARGEUR / 2 + 245, 160, 'TOI', 15, '#ff7f7f').setDepth(P + 4));
    this.ajout(texte(scene, LARGEUR / 2, 160, 'PUBLIC', 13, '#ffffff').setDepth(P + 4));
    // la rangée des pas (en bas) et le cercle de timing
    this.rangee = [];
    this.cercles = this.ajout(scene.add.graphics().setDepth(P + 5));
    this.retour = this.ajout(texte(scene, LARGEUR / 2 + 40, 425, '', 26, '#ffffff', { fontStyle: 'bold' }).setDepth(P + 6));
    this.mancheSuivante();
  }

  ajout(o) { this.el.push(o); return o; }

  detruire() { this.el.forEach(o => o.destroy()); this.rangee.forEach(o => o.destroy()); this.el = []; this.rangee = []; }

  // ---------- une manche : Kédric montre, puis toi ----------
  mancheSuivante() {
    this.manche++;
    const n = this.o.manches[this.manche];
    const seq = [];
    for (let i = 0; i < n; i++) {
      let d;
      do { d = ['gauche', 'droite', 'haut', 'bas'][Math.floor(Math.random() * 4)]; } while (i >= 2 && d === seq[i - 1] && d === seq[i - 2]);
      seq.push(d);
    }
    // flèches rouges (fais l'inverse) : jamais sur le premier pas
    const rouges = new Set();
    const nr = (this.o.rouges || [])[this.manche] || 0;
    while (rouges.size < Math.min(nr, n - 1)) rouges.add(1 + Math.floor(Math.random() * (n - 1)));
    this.pas = seq.map((d, i) => ({ montre: d, rouge: rouges.has(i), attendu: rouges.has(i) ? INVERSE[d] : d, note: null }));
    this.beat = 60 / (this.o.mini ? S.bpm[0] : S.bpm[Math.min(this.manche, S.bpm.length - 1)]);
    this.phase = 'annonce'; this.t = 0; this.iMontre = -1;
    this.rangee.forEach(o => o.destroy()); this.rangee = [];
    const titre = this.o.mini ? `REVANCHE DE KÉDRIC : ${n} PAS` : `MANCHE ${this.manche + 1} / ${this.o.manches.length} : ${n} PAS`;
    this.s.bandeau.setText(nr ? `${titre}  -  FLÈCHE ROUGE = fais l'INVERSE !` : titre).setColor(nr ? '#ff9a9a' : '#ffd84a').setVisible(true);
    this.poseKedric('portrait');
    this.poseToi(null);
  }

  // ---------- la boucle ----------
  maj(dt, e) {
    this.t += dt;
    const b = this.beat;
    if (this.phase === 'annonce') {
      if (this.t >= S.annonce) { this.phase = 'montre'; this.t = 0; this.s.bandeau.setVisible(false); }
    } else if (this.phase === 'montre') {
      // Kédric fait un pas à chaque temps
      const i = Math.floor(this.t / b) - 1;
      if (i > this.iMontre && i < this.pas.length) {
        this.iMontre = i;
        const p = this.pas[i];
        this.poseKedric(p.montre);
        this.flecheKedric.setText(FLECHES[p.montre]).setColor(p.rouge ? '#ff3030' : COULEURS[p.montre]).setScale(1.3);
        this.s.tweens.add({ targets: this.flecheKedric, scale: 1, duration: 150 });
        jouerSon(this.s, 'kedric_alerte', { rate: SON[p.montre], volume: 0.9 });
        this.ajouterCase(i);
        this.public(-S.kedricParPas);
      }
      if (this.t >= (this.pas.length + 1) * b) {
        // il te tend le micro : à toi !
        this.phase = 'micro'; this.t = 0;
        this.flecheKedric.setText('');
        this.poseKedric('micro');
        onomatopee(this.s, 570, 250, 'À TOI !', 48, '#ffffff');
        jouerSon(this.s, 'kedric_niveau');
      }
    } else if (this.phase === 'micro') {
      if (this.t >= b) { this.phase = 'toi'; this.t = 0; }
    } else if (this.phase === 'toi') {
      // tes pas : la cible i tombe au temps i + 1
      for (const k of ['gauche', 'droite', 'haut', 'bas']) if (e[k]) this.appui(k);
      for (let i = 0; i < this.pas.length; i++) {
        const p = this.pas[i];
        if (p.note === null && this.t > (i + 1) * b + this.fenetre.bien) this.noter(i, 'rate');
      }
      if (this.pas.every(p => p.note !== null) && this.t > (this.pas.length + 1) * b) this.finManche();
    } else if (this.phase === 'bilan') {
      if (this.t >= S.pause) this.mancheSuivante();
    }
    this.afficher();
  }

  appui(k) {
    const b = this.beat;
    // le prochain pas pas encore noté, s'il est assez proche dans le temps
    const i = this.pas.findIndex(p => p.note === null);
    if (i < 0) return;
    const ecart = Math.abs(this.t - (i + 1) * b);
    if (ecart > this.fenetre.bien * 1.6) return;   // appui bien trop tôt : ignoré
    const p = this.pas[i];
    this.poseToi(k);
    if (k !== p.attendu) this.noter(i, 'rate');
    else this.noter(i, ecart <= this.fenetre.parfait ? 'parfait' : ecart <= this.fenetre.bien ? 'bien' : 'rate');
  }

  noter(i, note) {
    const p = this.pas[i];
    p.note = note;
    const caseI = this.rangee[i];
    if (note === 'parfait') { this.bilan.parfaits++; this.public(S.gain.parfait); jouerSon(this.s, 'kedric_parfait', { rate: SON[p.attendu] }); this.retour.setText('PARFAIT !').setColor('#7fe8ff'); lignesImpact(this.s, caseI.x, caseI.y, 0x9fe0ff, 10, 70); }
    else if (note === 'bien') { this.bilan.bien++; this.public(S.gain.bien); jouerSon(this.s, 'kedric_esquive', { rate: SON[p.attendu] }); this.retour.setText('BIEN').setColor('#7fff7f'); }
    else { this.bilan.rates++; this.public(-S.gain.rate); jouerSon(this.s, 'kedric_alerte', { rate: 0.5 }); this.retour.setText(p.rouge ? 'RATÉ ! (flèche rouge = l\'inverse)' : 'RATÉ !').setColor('#ff6b6b'); this.poseKedric('haut'); }
    this.s.tweens.killTweensOf(this.retour); this.retour.setAlpha(1).setScale(1.2);
    this.s.tweens.add({ targets: this.retour, scale: 1, duration: 120 });
    caseI.setColor(note === 'rate' ? '#ff6b6b' : note === 'parfait' ? '#7fe8ff' : '#7fff7f');
    // public tout à Kédric : perdu tout de suite (sinon on joue toutes les manches, pour le spectacle)
    if (!this.o.mini && this.jauge <= -100) this.terminer(false);
  }

  finManche() {
    if (this.termine) return;
    if (this.manche >= this.o.manches.length - 1) { this.terminer(this.o.mini ? true : this.jauge > 0); return; }
    this.phase = 'bilan'; this.t = 0;
    this.poseKedric(this.jauge > 0 ? 'haut' : 'portrait');
  }

  terminer(gagne) {
    if (this.termine) return;
    this.termine = true;
    this.phase = 'fin';
    this.poseKedric(gagne ? 'defaite' : 'haut');
    this.poseToi(gagne ? 'haut' : null);
    this.fin(gagne, this.bilan);
  }

  public(n) { this.jauge = Math.max(-100, Math.min(100, this.jauge + n)); }

  // ---------- affichage ----------
  ajouterCase(i) {
    const n = this.pas.length, ecart = Math.min(78, 620 / n);
    const x = LARGEUR / 2 + 40 + (i - (n - 1) / 2) * ecart;
    const p = this.pas[i];
    const c = texte(this.s, x, 488, FLECHES[p.montre], 44, p.rouge ? '#ff3030' : COULEURS[p.montre], { fontStyle: 'bold' }).setDepth(P + 6);
    this.rangee.push(c);
  }

  afficher() {
    // jauge du public
    const g = this.jaugeG; g.clear();
    const x0 = LARGEUR / 2 - 200, w = 400, y = 176;
    g.fillStyle(0x1d8a4a, 1); g.fillRect(x0, y, w, 14);
    g.fillStyle(0xc8202c, 1); g.fillRect(x0 + w / 2 - (this.jauge / 100) * w / 2, y, w / 2 + (this.jauge / 100) * w / 2, 14);
    g.fillStyle(0xffffff, 1); g.fillRect(x0 + w / 2 - (this.jauge / 100) * w / 2 - 2, y - 4, 4, 22);
    g.lineStyle(2, 0xffffff, 0.8); g.strokeRect(x0, y, w, 14);
    // cercle de timing autour du pas à faire (il se resserre jusqu'au temps)
    const c = this.cercles; c.clear();
    if (this.phase === 'toi') {
      const i = this.pas.findIndex(p => p.note === null);
      if (i >= 0) {
        const cible = (i + 1) * this.beat, reste = cible - this.t;
        const caseI = this.rangee[i];
        const r = 26 + Math.max(0, Math.min(1, reste / this.beat)) * 50;
        const bleu = Math.abs(reste) <= this.fenetre.bien;
        c.lineStyle(5, Math.abs(reste) <= this.fenetre.parfait ? 0xffffff : bleu ? 0x3fa7ff : 0xffd84a, 1);
        c.strokeCircle(caseI.x, caseI.y, r);
        c.lineStyle(2, 0xffffff, 0.5); c.strokeCircle(caseI.x, caseI.y, 26);
      }
    }
  }

  // Kédric : une image par pas ; tant que ses images de frime n'existent pas, on prend ses images de danse
  poseKedric(pose) {
    const s = this.s, k = this.kedric;
    const voulue = 'kedric_frime_' + pose;
    let cle = 'kedric_portrait', image = 0, retourne = false, ecrase = 1;
    if (s.estIllustre(voulue)) cle = voulue;
    else if (pose === 'gauche') { cle = 'kedric_danse'; image = 0; }
    else if (pose === 'droite') { cle = 'kedric_danse'; image = 0; retourne = true; }
    else if (pose === 'haut') { cle = 'kedric_danse'; image = 1; }
    else if (pose === 'bas') { cle = 'kedric_danse'; image = 0; ecrase = 0.78; }
    else if (pose === 'defaite') cle = 'kedric_defaite';
    k.setTexture(cle, image).setFlipX(retourne);
    const z = (pose === 'defaite' ? 220 : 265) / k.frame.height;   // assez petit pour ne pas cacher la jauge du public
    k.setScale(z, z * ecrase);
  }

  // Toi (de dos) : une pose par pas ; tant que tes images de frime n'existent pas, on prend tes poses de match
  poseToi(pose) {
    const s = this.s, t = this.toi;
    const voulue = 'kedric_toi_frime_' + pose;
    let cle = 'kedric_toi_course', angle = 0, monte = 0;
    if (pose && s.estIllustre(voulue)) cle = voulue;
    else if (pose === 'gauche') { cle = 'kedric_toi_victoire'; angle = -16; }
    else if (pose === 'droite') { cle = 'kedric_toi_victoire'; angle = 16; }
    else if (pose === 'haut') { cle = 'kedric_toi_saut'; monte = 40; }
    else if (pose === 'bas') cle = 'kedric_toi_rotation';
    t.setTexture(cle, 0).setAngle(angle).setY(HAUTEUR + 10 - monte);
    t.setScale(1.05 * s.zoom(cle));
    if (pose) { s.tweens.killTweensOf(t); t.setScale(t.scaleX * 1.08); s.tweens.add({ targets: t, scale: t.scaleX / 1.08, duration: 160 }); }
  }
}
