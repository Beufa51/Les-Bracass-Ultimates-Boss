// Boss Julien — MINI-NIVEAU « LE LYCÉE » (entre la manif et la salle de classe ; audit A :
// propositions/julien_audit_classe.md). Même moteur 3D que la manif (JulienManif.js, dont cette scène hérite).
// Hall → cantine → CDI (le CARNET DE CORRESPONDANCE, la clé) → couloir des casiers → porte de la salle 12 → Julien.
//  - SURVEILLANT (le pion) : IA du CRS sans bouclier (il siffle, puis il fonce : pas de côté, puis bombarde-le).
//  - DAME DE CANTINE : IA du lanceur, mais de la PURÉE : flaque où l'on avance au ralenti.
//  - FAYOTS : invincibles ; quand ils te voient ils crient et ALERTENT tout le monde ; de près, ils s'enfuient.
//  - Armes de la manif INTERDITES : seulement la SARBACANE.
//  - EXTINCTEUR (le baril de Doom) : une boulette dessus → nuage de mousse (même effet que le sac de farine de la manif).
//  - CANETTES : petits soins. Un casier ouvert cache un placard secret.
// Plan et textes : niveau_lycee.js ; réglages : RG.surveillant, RG.cantiniere, RG.lycee.
import { JulienManif } from './JulienManif.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { estTactile } from '../../core/tactile.js';
import { texte, voile } from '../../core/ui.js';
import { LARGEUR } from '../../core/reglages.js';
import { REGLAGES as RG, DIFFICULTES } from './reglages.js';
import { vueLibre } from './raycaster.js';
import { PLAN_LYCEE, OBJETS_LYCEE, SECRETS_LYCEE, PORTE_SALLE_12, ZONES_LYCEE, RENFORTS_LYCEE, REPLIQUES_LYCEE as TXT } from './niveau_lycee.js';
import { construireDecorLycee, spritesLycee, spritesClasse, HAUTEURS_LYCEE } from './decor_classe.js';
import { mainSarbacane } from './JulienClasse.js';

const L = 480, VUE_H = 222;   // comme JulienManif
const hasard = (liste) => liste[(Math.random() * liste.length) | 0];
const POSES = {
  surveillant: ['marche0', 'marche1', 'cri', 'charge', 'touche', 'fuite', 'essouffle', 'attrape'],   // (2 derniers : section 21e)
  cantiniere: ['marche0', 'marche1', 'bras', 'lance', 'touche', 'fuite'],
  fayot: ['bras', 'crie', 'saute', 'fuite'],
};
// vraies images des murs (outils/julien/decouper_planches.py) : code du plan → image
const MURS_IMAGES = { 1: 'mur_casiers', 2: 'mur_couloir', 3: 'mur_cantine', 4: 'porte_classe', 5: 'mur_classe', 6: 'mur_cdi' };
const IMAGES = [...Object.entries(POSES).flatMap(([t, ps]) => ps.map(p => `${t}_${p}`)), ...Object.values(MURS_IMAGES),
  'table', 'bureau', 'canette', 'extincteur', 'carnet', 'puree', 'flaque', 'comptoir', 'mousse', 'main_sarbacane', 'main_sarbacane_tir',
  'etagere', 'etagere_basse', 'table_lecture', 'ordinateur', 'surveillant_touche_papier', 'cantiniere_touche_papier'];   // (section 19)   // (5 derniers : section 17 des prompts)
const RAYONS = { table: 0.48, comptoir: 0.55, extincteur: 0.3, fayot: 0.3, etagere: 0.45, etagere_basse: 0.45, table_lecture: 0.45, ordinateur: 0.38 };
const estCantine = (x, y) => x >= 8 && x <= 21 && y >= 2 && y <= 9;

export class JulienLycee extends JulienManif {
  constructor() { super('JulienLycee'); }

  preload() {
    for (const n of IMAGES) if (!this.textures.exists('julien_' + n)) this.load.image('julien_' + n, `assets/sprites/julien/julien_${n}.png`);
    super.preload();
  }

  // ------------------------------------------------------------------ points d'entrée (voir JulienManif)
  creerDecor() {
    const T = this.T;
    if (!T.lycee) {
      const img = (n) => this.textures.exists('julien_' + n) ? this.textures.get('julien_' + n).getSourceImage() : null;
      T.spr.boulette = T.spr.boulette || spritesClasse().boulette;   // la boulette de la sarbacane
      // la sarbacane en main (vraie image si livrée, sinon le dessin en pixel art de la classe)
      const ms = img('main_sarbacane');
      T.main.sarbacane = ms || mainSarbacane(false); T.main.sarbacane_tir = img('main_sarbacane_tir') || ms || mainSarbacane(true);
      Object.assign(T.spr, spritesLycee());
      Object.assign(T.hauteurs, HAUTEURS_LYCEE);
      for (const [t, ps] of Object.entries(POSES)) for (const p of ps) { const i = img(`${t}_${p}`); if (i) T.spr[`${t}_${p}`] = i; }
      if (!this.textures.exists('julien_surveillant_essouffle')) T.spr.surveillant_essouffle = T.spr.surveillant_marche0;   // (l'IA du CRS a une pose « essoufflé »)
      for (const n of ['table', 'canette', 'extincteur', 'carnet', 'puree', 'flaque', 'mousse', 'etagere', 'etagere_basse', 'table_lecture', 'ordinateur']) { const i = img(n); if (i) T.spr[n] = i; }
      for (const n of ['etagere', 'etagere_basse', 'table_lecture', 'ordinateur']) if (!T.spr[n]) T.spr[n] = T.spr.table;
      if (d < 1.3) { o.fuit = true; o.fuitT = 0; o.type = 'fayot_fuite'; o.solide = false; this.message('« Je le dirai à ma mère ! »', 1.6); continue; }
      o.criT -= dt;
      const voit = j.vie > 0 && d < F.fayotVue && vueLibre(this.plan, o.x, o.y, j.x, j.y);
      if (voit && o.criT <= 0) {
        o.criT = F.fayotCri;
        this.message(hasard(TXT.fayot), 2);
        jouerSon(this, 'julien_halte', { rate: 1.5 });
        // il alerte tout le monde autour (même ceux qui ne te voient pas) : ils savent où tu es
        for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite' && Math.hypot(e.x - o.x, e.y - o.y) < F.fayotAlerte * (this.anarchiste ? F.anarchisteAlerte : 1)) {
          e.alerte = true; e.vuX = j.x; e.vuY = j.y; if (e.etat === 'attente') e.t = 0.6;
        }
      }
      o.type = !voit ? 'fayot_bras' : o.criT > F.fayotCri - 1.2 ? 'fayot_crie' : ((this.time.now / 250) | 0) % 2 ? 'fayot_saute' : 'fayot_crie';
    }
  }

  ramasser() {
    const j = this.j;
    for (const o of this.objets) {
      if (!o.actif || o.solide || Math.hypot(o.x - j.x, o.y - j.y) > 0.5) continue;
      if (o.type === 'carnet') {
        o.actif = false; this.carnet = true; this.sortie = { x: PORTE_SALLE_12.x + 0.5, y: PORTE_SALLE_12.y + 1.5 };
        this.message(TXT.carnet, 4.5); jouerSon(this, 'julien_portail', { rate: 1.3 }); j.expr = 'content'; j.exprT = 1.2; j.or = 0.8;
      } else if (o.type === 'canette' && j.vie < RG.joueur.vie) {
        o.actif = false; this.ramasses++;
        j.vie = Math.min(RG.joueur.vie, j.vie + RG.lycee.canette);
        this.message(`Une canette, ça rafraîchit ! (+${RG.lycee.canette})`); jouerSon(this, 'julien_ramasse'); j.expr = 'content'; j.exprT = 0.9; j.or = 0.6;
      }
    }
    super.ramasser();
  }

  // la porte de la salle 12 : fermée sans le carnet ; avec, on entre en classe
  porte(dt) {
    const j = this.j, px = PORTE_SALLE_12.x + 0.5, py = PORTE_SALLE_12.y + 0.5;
    this.porteT -= dt;
    if (Math.hypot(j.x - px, j.y - py) > 1.25) return;
    if (!this.carnet) { if (this.porteT <= 0) { this.message(TXT.porteFermee, 3.5); jouerSon(this, 'julien_plonk', { rate: 0.5 }); this.porteT = 4; } return; }
    this.entrerEnClasse();
  }

  entrerEnClasse() {
    if (this.fini) return;
    this.fini = true; this.enJeu = false; this.termine = true;
    if (this.joy) this.joy.activer(false);
    this.libererSouris();
    jouerSon(this, 'julien_portail');
    voile(this, 0.85).setDepth(1000);
    texte(this, LARGEUR / 2, 200, 'SALLE 12', 44, '#ffd84a').setDepth(1001);
    texte(this, LARGEUR / 2, 270, TXT.porte, 24, '#ffffff').setDepth(1001);
    this.time.delayedCall(2600, () => this.scene.start('JulienClasse', { depuisManif: true }));
  }

  // ------------------------------------------------------------------ dessin
  spritesEnPlus(liste) {
    for (const f of this.flaques) liste.push({ x: f.x, y: f.y, toile: this.T.spr.flaque, haut: this.T.hauteurs.flaque, z: 0 });
  }

  dessiner(dt) {
    super.dessiner(dt);
    if (!this.txtLycee) return;
    this.txtLycee.setText(this.carnet ? 'OUI' : 'NON');
    this.txtMunitions.setText('SARBACANE ∞');
  }
}
