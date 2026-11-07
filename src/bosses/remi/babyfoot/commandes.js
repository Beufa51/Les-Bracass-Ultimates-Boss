// Babyfoot de Rémi — les COMMANDES : boutons ◀ ▶ (plusieurs doigts), TIR, ROULETTE ; ton gardien et ta visée.
// Méthodes ajoutées à la scène RemiBaby (Object.assign) : « this » est la scène.
import { LARGEUR, HAUTEUR } from '../../../core/reglages.js';
import { texte } from '../../../core/ui.js';
import { jouerSon } from '../../../core/ressources.js';
import { vientDAppuyer } from '../../../core/clavier.js';
import { BABY as B, REPLIQUES } from '../reglages.js';
import { remi } from '../dessins.js';
import { bulle, annonce, hasard, choisir } from '../commun.js';
import { CX, L, W, R, proj, plier, xSur, profondeur, hommes, BARRES, BOUTON_G, BOUTON_D, BOUTON_ROULETTE, BOUTON_TIR, ZONE_BOUTONS, VIDES } from './outils.js';

export const Commandes = {

  installerDoigt() {
    this.input.addPointer(2);   // les deux pouces (+ un doigt pour tirer)
    this.input.on('pointerdown', (p) => {
      if (this.termine) return;
      // V19p : le bouton « ROULETTE ! » (seulement pendant le temps où l'on peut crier)
      if (this.horloge < this.appelPossible && Math.hypot(p.x - BOUTON_ROULETTE.x, p.y - BOUTON_ROULETTE.y) < BOUTON_ROULETTE.r + 20) { this.appelRoulette(); return; }
      if (this.dansBouton(p)) return;   // les boutons sont lus à chaque image (pasGardien)
      if (this.dansTir(p)) { if (this.etat === 'riposte') this.riposter(this.viseeVraie()); return; }   // TIR : part dès l'appui
      if (this.etat !== 'intro' && p.y < proj(0, 0, L).y - 20) { this.appelRoulette(); return; }   // toucher Rémi = « ROULETTE ! »
      this.doigt = { x: p.x, y: p.y, t: this.horloge, id: p.id };
    });
    this.input.on('pointermove', (p) => {
      const d = this.doigt;
      if (!p.isDown || !d || p.id !== d.id) return;
      if (this.etat === 'riposte' && d.y - p.y > 45) {   // glissé vers le haut : tir (un peu en biais selon le geste)
        const dx = p.x - d.x, dy = d.y - p.y;
        this.riposter(Phaser.Math.Clamp(dx / dy, -1, 1) * B.viseeMax); this.doigt = null;
      }
    });
    this.input.on('pointerup', (p) => {
      const d = this.doigt;
      if (!d || p.id !== d.id) return;
      this.doigt = null;
      if (this.etat !== 'riposte') return;
      if (this.horloge - d.t < 0.35 && Math.hypot(p.x - d.x, p.y - d.y) < 30) this.riposter(this.viseeVraie());   // toucher bref : tir dans la visée (qui titube si tu as bu)
    });
  },


  // ---------- commandes ----------
  // V19d MANIABILITÉ (retour : le glissé « pavé tactile » n'allait pas, choix de Fabien) : DEUX GROS BOUTONS ◀ ▶ en bas,
  // sous les pouces : on MAINTIENT, le gardien glisse (il accélère un peu si on garde appuyé). Plusieurs doigts à la fois.
  // Le reste de l'écran : toucher bref = TIR droit (ou en biais du côté du bouton tenu), glisser vers le haut = tir en biais ;
  // toucher Rémi = « ROULETTE ! ».
  dansBouton(p) { return p.y > ZONE_BOUTONS.y && (p.x < ZONE_BOUTONS.g ? -1 : p.x < ZONE_BOUTONS.d ? 1 : 0); },
  dansTir(p) { return p.y > ZONE_BOUTONS.y && p.x > ZONE_BOUTONS.tir; },


  // direction tenue : boutons à l'écran (tous les doigts posés) ou flèches du clavier
  lireDirection() {
    let g = this.touches.gauche.isDown, d = this.touches.droite.isDown;
    for (const p of this.input.manager.pointers) {
      if (!p.isDown) continue;
      const c = this.dansBouton(p);
      if (c < 0) g = true; else if (c > 0) d = true;
    }
    this.tenuG = g; this.tenuD = d;
    return (d ? 1 : 0) - (g ? 1 : 0);
  },


  pasGardien(dt) {
    // les boutons (ou les flèches) : le gardien glisse, un peu plus vite si on garde appuyé
    this.dir = this.lireDirection();
    this.tenu = this.dir ? (this.tenu || 0) + dt : 0;
    const v = B.vitesseBoutons * Math.min(1, B.depart + this.tenu / B.montee * (1 - B.depart));
    if (this.etat === 'riposte') {   // V19k : balle arrêtée : ◀ ▶ TOURNENT LA VISÉE (le gardien ne bouge plus)
      const va = B.vitesseVisee * Math.min(1, B.depart + this.tenu / B.montee * (1 - B.depart));
      this.visee = Phaser.Math.Clamp(this.visee + this.dir * va * dt, -B.viseeMax, B.viseeMax);
    } else this.cible = Phaser.Math.Clamp(this.cible + this.dir * v * dt, -B.course, B.course);
    if (!this.dir) this.cible = Phaser.Math.Clamp(this.cible, this.pos.toi - 0.01, this.pos.toi + 0.01);   // lâché : il s'arrête net
    // l'alcool : le gardien tremble et traîne un peu
    const tremble = this.ivresse * B.trembleBu * Math.sin(this.horloge * 7.3);
    const vmax = B.vitesseGardien * (1 - Math.min(0.4, this.ivresse * 0.05));
    // AIDE (difficultés faciles) : quand son tir arrive, ton gardien est attiré vers l'endroit où la balle va passer
    let cible = this.cible;
    const b = this.balle;
    if (this.etat === 'tir' && b && b.vz < 0 && this.diff.babyAide) {
      const xc = Phaser.Math.Clamp(b.x + b.vx * (b.z - BARRES.toi.z) / -b.vz, -B.course, B.course);
      cible += (xc - cible) * this.diff.babyAide;
    }
    const d = cible + tremble - this.pos.toi;
    this.pos.toi += Phaser.Math.Clamp(d, -vmax * dt, vmax * dt);
    this.pos.toi = Phaser.Math.Clamp(this.pos.toi, -B.course, B.course);
  }
};
