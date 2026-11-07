// Babyfoot de Rémi — la PHYSIQUE : la balle (bandes, barres, buts), la visée qui titube, le chemin VERT, le guide.
// Méthodes ajoutées à la scène RemiBaby (Object.assign) : « this » est la scène.
import { LARGEUR, HAUTEUR } from '../../../core/reglages.js';
import { texte } from '../../../core/ui.js';
import { jouerSon } from '../../../core/ressources.js';
import { vientDAppuyer } from '../../../core/clavier.js';
import { BABY as B, REPLIQUES } from '../reglages.js';
import { remi } from '../dessins.js';
import { bulle, annonce, hasard, choisir } from '../commun.js';
import { CX, L, W, R, proj, plier, xSur, profondeur, hommes, BARRES, BOUTON_G, BOUTON_D, BOUTON_ROULETTE, BOUTON_TIR, ZONE_BOUTONS, VIDES } from './outils.js';

export const Physique = {

  // ---------- mouvement de la balle (bandes, barres, buts) ----------
  pasBalle(dt) {
    const b = this.balle; if (!b) return;
    const zAvant = b.z, xAvant = b.x;
    // x de la balle à l'instant exact où elle croise la ligne z (sinon une balle en biais « traverse » un joueur entre 2 images)
    // (V19o : même calcul que la ligne de visée, rebonds compris : un tir en bande est jugé comme il est montré)
    const aAvant = Math.atan2(b.vx, b.vz || 1e-6), xA = (z) => b.vz ? xSur(xAvant, zAvant, aAvant, z) : xAvant;
    b.x += b.vx * dt; b.z += b.vz * dt;
    if (b.x > W / 2 - R) { b.x = W - 2 * R - b.x; b.vx = -Math.abs(b.vx); jouerSon(this, 'remi_baby_clac', { volume: 0.6 }); }
    if (b.x < -W / 2 + R) { b.x = -W + 2 * R - b.x; b.vx = Math.abs(b.vx); jouerSon(this, 'remi_baby_clac', { volume: 0.6 }); }
    if (this.etat === 'tir') {
      // ta barre : la balle passe-t-elle sur ton gardien ?
      const zg = BARRES.toi.z;
      if (zAvant > zg && b.z <= zg) {
        if (Math.abs(xA(zg) - this.pos.toi) < B.priseToi) { this.arret(); return; }   // (V19h : ton gardien, plus large)
      }
      if (b.z <= 0) {
        if (Math.abs(b.x) < B.but / 2) this.butRemi(Math.abs(b.x) > B.but / 2 * B.gamelleBord && Math.random() < B.gamelle);
        else this.sortie('À côté !');
      }
    } else if (this.etat === 'riposte_vol') {
      // V19e : quand tu tires depuis ton gardien, Rémi LÈVE sa barre d'attaque (comme au vrai babyfoot) : seuls sa défense
      // et son gardien peuvent arrêter ta riposte
      for (const nom of ['def', 'gar']) {
        const br = BARRES[nom];
        if (zAvant < br.z && b.z >= br.z && hommes(br, this.pos[nom]).some(x => Math.abs(xA(br.z) - x) < B.prise * (nom === 'gar' ? B.priseGardienRemi : B.priseDefense))) {
          this.contre(nom); return;
        }
      }
      if (b.z >= L) {
        if (Math.abs(b.x) < B.but / 2) this.butToi(Math.abs(b.x) > B.but / 2 * B.gamelleBord && Math.random() < B.gamelle);
        else this.sortie('Dehors !');
      }
    }
  },


  // ta riposte passerait-elle sa défense ? (biais = celui du bouton tenu) ; bloque = z du joueur qui l'arrête
  // V19m BOURRÉ : la visée réelle TITUBE (elle ondule toute seule, d'autant plus que tu as bu)
  viseeVraie() {
    const i = Math.min(this.ivresse, B.ivresseMax), h = this.horloge;
    return Phaser.Math.Clamp(this.visee + i * B.titubeVisee * (Math.sin(h * 2.1) + 0.5 * Math.sin(h * 3.7)), -B.viseeMax, B.viseeMax);
  },


  // ta riposte (balle en xb, angle a) passerait-elle ? Trajet avec rebonds. bloque = z du joueur qui l'arrête
  cheminLibre(xb = this.balle.x, a = this.viseeVraie()) {
    const z0 = this.balle.z, br = BARRES.def, en = (z) => xSur(xb, z0, a, z);
    const bloque = hommes(br, this.pos.def).some(h => Math.abs(en(br.z) - h) < B.prise * B.priseDefense + B.margeDefense) ? br.z : L + 1;   // (+1 cm de marge : sa défense bouge encore un peu)
    // son gardien : il n'arrête que ce qu'il peut atteindre (sa prise + ce qu'il parcourt entre son réflexe et l'arrivée)
    const eclair = this.fenetre > 0;
    const t = (BARRES.gar.z - z0) / (B.riposteVitesse * (eclair ? B.eclairVitesse : 1) * Math.cos(a));
    const portee = B.prise * B.priseGardienRemi + this.vitGarRemi() * Math.max(0, t + B.margeGardien - this.diff.babyReflexe - this.remiBu * B.pinteReflexe - (eclair ? B.eclairReflexe : 0));
    const enFace = Math.abs(en(BARRES.gar.z) - this.pos.gar) < portee;
    const xBut = en(L), cote = Math.abs(xBut) > B.but / 2 - R;
    return { biais: a, bloque: cote ? Math.min(bloque, L - 0.02) : bloque, libre: bloque > L && !cote, enFace, cote, xBut };
  },


  // GUIDE : de quel côté TOURNER la visée pour trouver un tir VERT ? -1 / 1, 0 = tu y es, null = rien pour l'instant
  chercherVert() {
    const ok = (l) => l.libre && !l.enFace;
    if (ok(this.cheminLibre())) return 0;
    let meilleur = null;
    for (let a = -B.viseeMax; a <= B.viseeMax + 1e-9; a += 0.01) {
      if (ok(this.cheminLibre(this.balle.x, a)) && (meilleur === null || Math.abs(a - this.visee) < Math.abs(meilleur - this.visee))) meilleur = a;
    }
    return meilleur === null ? null : Math.abs(meilleur - this.visee) < 0.006 ? 0 : Math.sign(meilleur - this.visee);
  }
};
