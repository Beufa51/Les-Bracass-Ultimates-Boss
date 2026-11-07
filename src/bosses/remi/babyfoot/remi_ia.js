// Babyfoot de Rémi — RÉMI : son engagement, sa préparation (la penche qu'on lit), son tir, ses barres (défense qui suit ta visée).
// Méthodes ajoutées à la scène RemiBaby (Object.assign) : « this » est la scène.
import { LARGEUR, HAUTEUR } from '../../../core/reglages.js';
import { texte } from '../../../core/ui.js';
import { jouerSon } from '../../../core/ressources.js';
import { vientDAppuyer } from '../../../core/clavier.js';
import { BABY as B, REPLIQUES } from '../reglages.js';
import { remi } from '../dessins.js';
import { bulle, annonce, hasard, choisir } from '../commun.js';
import { CX, L, W, R, proj, plier, xSur, profondeur, hommes, BARRES, BOUTON_G, BOUTON_D, BOUTON_ROULETTE, BOUTON_TIR, ZONE_BOUTONS, VIDES } from './outils.js';

export const RemiIA = {

  // ---------- Rémi : engagement, préparation (lecture), tir ----------
  engagement() {
    if (this.termine) return;
    const balleMatch = this.butsRemi === B.buts - 1;
    if (balleMatch || this.butsToi === B.buts - 1) annonce(this, 'BALLE DE MATCH', balleMatch ? '#ff6b6b' : '#7fff7f', 0.9);
    jouerSon(this, 'remi_baby_engage');
    const D = this.diff;
    // côté visé (-1 à 1 dans le but) ; feinte : il penche d'abord de l'autre côté
    const vise = choisir([-1, 1]) * hasard(0.35, 0.95);
    // le joueur de l'attaque qui a la balle : celui du milieu ou celui du côté visé (sinon le tir sortirait)
    const qui = Math.random() < 0.5 ? 1 : (vise > 0 ? 2 : 0);
    const derriere = this.butsRemi < this.butsToi;
    const roul = Math.random() < D.babyRoulette * (derriere ? 2 : 1) && this.butsRemi < B.buts - 1;
    // V19u : 3 TIRS reconnaissables : normal ; PISSETTE (préparation éclair, très rapide, pas de feinte) ;
    // PIÈGE (lent, il change de côté plusieurs fois : attends le dernier changement)
    const de = Math.random(), type = balleMatch ? 'piege' : de < D.babyPissette ? 'pissette' : de < D.babyPissette + D.babyPiege ? 'piege' : 'normal';
    const TYPES = { normal: { prep: 1, vit: 1 }, pissette: { prep: B.pissette.prep, vit: B.pissette.vitesse }, piege: { prep: B.piege.prep, vit: B.piege.vitesse } };
    this.tir = {
      qui, vise, t: 0, type, vit: TYPES[type].vit,
      d: hasard(B.prep[0], B.prep[1]) * D.babyLecture * TYPES[type].prep,
      feinte: type === 'normal' && Math.random() < D.babyFeinte,
      bande: Math.random() < D.babyBande,
      roulette: roul,
      promene: hasard(-1, 1),
    };
    this.etat = 'prep';
    this.balle = { x: 0, z: BARRES.att.z - 0.04, vx: 0, vz: 0, vue: 1 };
  },


  pasPrep(dt) {
    const T = this.tir; T.t += dt;
    const a = T.t / T.d;
    // il promène la balle : sa barre glisse doucement
    this.pos.att = Phaser.Math.Clamp(Math.sin(this.horloge * 2.2 + T.promene * 3) * BARRES.att.course, -BARRES.att.course, BARRES.att.course);
    const xs = hommes(BARRES.att, this.pos.att);
    this.balle.x = xs[T.qui]; this.balle.z = BARRES.att.z - 0.04;
    // LECTURE : il se penche vers le côté visé (feinte : l'autre côté jusqu'à 65 %, puis il change)
    const cote = Math.sign(T.vise);
    const faux = T.type === 'piege' ? (a < 0.3 || (a > 0.52 && a < 0.74)) : T.feinte && a < B.feinteBascule;
    this.penche = Phaser.Math.Linear(this.penche, (faux ? -cote : cote) * Math.min(1, a * 1.6), Math.min(1, dt * 8));
    if (a > 0.82) this.arme = (a - 0.82) / 0.18; else this.arme = 0;   // la barre s'arme (le joueur se lève)
    if (T.roulette && a > 0.7 && !this.roulette) {
      this.roulette = { t: this.horloge }; jouerSon(this, 'remi_baby_roulette');
      if (B.roulettePunie && !this.vuRoulette) { this.vuRoulette = true; bulle(this, 'ROULETTE = interdit ! S\'il marque comme ça, appuie sur ROULETTE pour annuler.', '#ff9a9a', 2.2, 360); }
    }
    if (a >= 1) this.tirer();
  },


  tirer() {
    const T = this.tir, b = this.balle, D = this.diff;
    this.arme = 0; this.poseTemp('lance', 0.6);
    let v = D.babyVitesse * T.vit * (T.roulette ? B.rouletteVitesse : 1) * (1 - this.remiBu * B.pinteTir);
    // cible : dans le but, du côté visé (rarement à côté)
    let tx = T.vise * (B.but / 2) * 0.9;
    if (Math.random() < D.babyRate) tx = Math.sign(T.vise) * (B.but / 2 + hasard(0.03, 0.08));
    // la cible est l'endroit où la balle PASSE DEVANT TON GARDIEN (c'est ce que sa penche annonce)
    const x0 = b.x, z0 = b.z, zg = BARRES.toi.z;
    if (T.bande) {   // tir en bande : on vise le reflet de la cible derrière la bande opposée
      const s = -Math.sign(T.vise) || 1;
      tx = s * (W - 2 * R) - tx; v *= 1.1;
    }
    const dx = tx - x0, dz = zg - z0, n = Math.hypot(dx, dz);
    b.vx = dx / n * v; b.vz = dz / n * v;
    this.etat = 'tir';
    // V19o : SON tir se sent aussi : éclat rouge à son pied, la caméra « encaisse » vers toi, gros claquement
    jouerSon(this, 'remi_baby_frappe', { volume: 1, rate: 0.9 });
    this.eclats.push({ x: b.x, z: b.z, t: 0, c: 0xff5a5a });
    this.tweens.add({ targets: this.cameras.main, zoom: 1.03, duration: 70, yoyo: true, ease: 'Quad.easeOut' });
    if (T.type === 'pissette') annonce(this, 'PISSETTE !', '#ff6b6b', 0.35);
    else if (v > D.babyVitesse * 1.05) annonce(this, T.roulette ? 'ROULETTE !?' : 'PATATE !', '#ff6b6b', 0.35);
  },


  pasBarresRemi(dt) {
    const b = this.balle, D = this.diff;
    const vers = (nom, but, v) => { this.pos[nom] += Phaser.Math.Clamp(but - this.pos[nom], -v * dt, v * dt); this.pos[nom] = Phaser.Math.Clamp(this.pos[nom], -BARRES[nom].course, BARRES[nom].course); };
    // pendant que tu tiens la balle, ses barres d'attaque et de défense visent l'endroit où ta balle ÉTAIT (Rémi réagit
    // en retard) : une feinte rapide ouvre un trou. Une fois ta balle partie, elles sont figées (trop rapide pour lui).
    const tiens = this.etat === 'riposte' && b, vole = this.etat === 'riposte_vol' && b;
    // V19l : sa défense lit TA VISÉE (là où ton tir passera sur sa ligne), avec un temps de retard : feinte-la ou joue les bandes
    if (tiens) this.memoire += (xSur(b.x, b.z, this.visee, BARRES.def.z) - this.memoire) * Math.min(1, dt * B.retardRemi);
    for (const nom of ['def', 'gar', ...(this.etat === 'prep' ? [] : ['att'])]) {
      const br = BARRES[nom];
      let but = Math.sin(this.horloge * (nom === 'def' ? 1.3 : 1.7)) * br.course * (nom === 'gar' ? 0.25 : 0.6);   // son gardien attend plutôt au centre
      const devant = (x) => hommes(br, 0).map(h => x - h).reduce((a, c) => Math.abs(c) < Math.abs(a) ? c : a);
      if (nom === 'gar') {
        // son GARDIEN ne bouge qu'une fois ta balle partie, avec un temps de retard
        // V19j : il se balance devant son but (des trous s'ouvrent) ; V19v : il LIT AUSSI ta visée (part babyGardienLit) :
        // il glisse vers l'endroit où ton tir arriverait, comme sa défense (il faut feinter les deux)
        if (tiens) {
          const balance = Math.sin(this.horloge * B.balancier) * br.course * 0.6;
          const lit = Phaser.Math.Clamp(xSur(b.x, b.z, this.visee, br.z), -br.course, br.course);
          but = Phaser.Math.Linear(balance, lit, this.diff.babyGardienLit || 0);
        }
        else if (!vole) but = Math.sin(this.horloge * 1.7) * br.course * 0.25;
        if (vole) { this.reflexe -= dt; if (this.reflexe > 0) continue; but = devant(b.x); }
      } else {
        if (vole) continue;
        if (tiens) but = devant(this.memoire);
      }
      vers(nom, but, nom === 'gar' ? this.vitGarRemi() : tiens ? D.babyDefense * this.sobriete(B.defBue) : B.vitesseBarresRemi);
    }
  },


  // V19n : RÉMI BOURRÉ : chaque but que tu marques (une pinte pour lui) ralentit sa défense et son gardien
  sobriete(parPinte) { return Math.max(0.5, 1 - parPinte * this.remiBu); },

  vitGarRemi() { return this.diff.babyGardienRemi * this.sobriete(B.garBue); }
};
