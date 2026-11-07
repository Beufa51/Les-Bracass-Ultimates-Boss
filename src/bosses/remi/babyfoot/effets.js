// Babyfoot de Rémi — les EFFETS : célébration du but (ralenti, filet, confettis), éclats, hoquets, gamelle.
// Méthodes ajoutées à la scène RemiBaby (Object.assign) : « this » est la scène.
import { LARGEUR, HAUTEUR } from '../../../core/reglages.js';
import { texte } from '../../../core/ui.js';
import { jouerSon } from '../../../core/ressources.js';
import { vientDAppuyer } from '../../../core/clavier.js';
import { BABY as B, REPLIQUES } from '../reglages.js';
import { remi } from '../dessins.js';
import { bulle, annonce, hasard, choisir } from '../commun.js';
import { CX, L, W, R, proj, plier, xSur, profondeur, hommes, BARRES, BOUTON_G, BOUTON_D, BOUTON_ROULETTE, BOUTON_TIR, ZONE_BOUTONS, VIDES } from './outils.js';

export const Effets = {

  // V19n SENSATION DE BUT : la balle continue au fond du filet (qui se gonfle), RALENTI, zoom vers la cage, flash,
  // confettis et foule (ton but) ; secousse rouge (le sien)
  celebrer(pourToi) {
    this.etat = 'filet';
    const b = this.balle, cam = this.cameras.main;
    this.filet = { x: b.x, t: 0, chezRemi: pourToi };
    if (pourToi) {
      this.ralentiFin = this.horloge + B.ralentiDuree;
      cam.flash(180, 255, 255, 255);
      const c = proj(b.x, 0.04, L);
      cam.pan(Phaser.Math.Linear(CX, c.x, 0.6), Phaser.Math.Linear(HAUTEUR / 2, c.y, 0.45), 260, 'Quad.easeOut');
      cam.zoomTo(1.3, 260, 'Quad.easeOut');
      this.time.delayedCall(1100, () => { cam.pan(CX, HAUTEUR / 2, 400, 'Quad.easeInOut'); cam.zoomTo(1, 400, 'Quad.easeInOut'); });
      for (let i = 0; i < 46; i++) this.confettis.push({ x: c.x + hasard(-30, 30), y: c.y - hasard(0, 30), vx: hasard(-260, 260), vy: hasard(-420, -120), c: choisir([0xffd84a, 0x7fff7f, 0x4fe8ff, 0xff5a8a, 0xffffff]), r: hasard(2, 4.5), vie: hasard(1.2, 2) });
      jouerSon(this, 'remi_foule'); jouerSon(this, 'remi_baby_but');
    } else {
      cam.shake(260, 0.012);
      jouerSon(this, 'remi_baby_but', { volume: 0.7 });
    }
  },


  pasEffets(dt) {
    const dtr = Math.min(0.05, this.game.loop.delta / 1000);   // les confettis gardent leur vitesse pendant le ralenti
    for (const e of this.eclats) e.t += dtr;
    this.eclats = this.eclats.filter(e => e.t < 0.3);
    for (const c of this.confettis) { c.x += c.vx * dtr; c.y += c.vy * dtr; c.vy += 700 * dtr; c.vx *= 0.98; c.vie -= dtr; }
    this.confettis = this.confettis.filter(c => c.vie > 0);
    if (this.filet) { this.filet.t += dtr; if (this.filet.t > 1.4) this.filet = null; }
  },


  dessinerEffets(g) {
    for (const e of this.eclats) { const q = proj(e.x, R, e.z), a = 1 - e.t / 0.3; g.lineStyle(4, e.c, a).strokeCircle(q.x, q.y, (8 + e.t * 160) * q.k / 900); g.lineStyle(3, e.c, a); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, r0 = 6 + e.t * 60, r1 = r0 + 12; g.lineBetween(q.x + Math.cos(an) * r0, q.y + Math.sin(an) * r0 * 0.6, q.x + Math.cos(an) * r1, q.y + Math.sin(an) * r1 * 0.6); } }
    for (const c of this.confettis) g.fillStyle(c.c, Math.min(1, c.vie)).fillRect(c.x - c.r, c.y - c.r * 0.6, c.r * 2, c.r * 1.2);
    // le FILET qui se gonfle : un creux qui s'enfonce là où la balle frappe, des mailles qui vibrent
    const f = this.filet;
    if (f && f.chezRemi) {
      const a = Math.max(0, 1 - f.t / 1.4), gonfle = Math.sin(Math.min(1, f.t * 4) * Math.PI) * 0.03 + 0.01;
      const z = L + 0.05 + gonfle, H = 0.075, x0 = Phaser.Math.Clamp(f.x, -B.but / 2 + 0.02, B.but / 2 - 0.02);
      g.lineStyle(2, 0xffffff, 0.8 * a);
      for (let i = 0; i <= 6; i++) {
        const y = H * i / 6, pts = [];
        for (let k = 0; k <= 10; k++) { const x = -B.but / 2 + B.but * k / 10, creux = Math.exp(-((x - x0) ** 2) / 0.002) * gonfle * 1.5; pts.push(proj(x, y, L + 0.05 + creux)); }
        g.strokePoints(pts);
      }
      const c = proj(x0, 0.035, z); g.fillStyle(0xffffff, 0.35 * a).fillCircle(c.x, c.y, 10 + f.t * 30);
    }
  },


  // HOQUET (à partir de 2 pintes) : secousse, ton gardien et ta visée sautent d'un coup, la vue se trouble
  hoquet() {
    const i = Math.min(this.ivresse, B.ivresseMax);
    this.prochainHoquet = this.horloge + hasard(5, 9) / (1 + 0.15 * i);
    jouerSon(this, 'remi_hips');
    this.cameras.main.shake(160, 0.006);
    const saut = hasard(-1, 1) * B.hoquetGardien * (0.6 + 0.1 * i);
    this.pos.toi = Phaser.Math.Clamp(this.pos.toi + saut, -B.course, B.course); this.cible = this.pos.toi;
    if (this.etat === 'riposte') this.visee = Phaser.Math.Clamp(this.visee + hasard(-1, 1) * B.hoquetVisee, -B.viseeMax, B.viseeMax);
    this.flou = 0.35;
    bulle(this, 'HIPS !', '#e8a52a', 0.6, 360);
  },


  // GAMELLE : la balle rentre et ressort (but) + un point retiré à l'autre
  gamelleAnim(pourToi) {
    this.gamelles += pourToi ? 1 : 0;
    if (pourToi) this.butsRemi = Math.max(0, this.butsRemi - 1); else this.butsToi = Math.max(0, this.butsToi - 1);
    this.time.delayedCall(700, () => bulle(this, pourToi ? 'GAMELLE : un point retiré à Rémi !' : 'GAMELLE : il te retire un point !', pourToi ? '#7fff7f' : '#ff6b6b', 1.6, 130));
  }
};
