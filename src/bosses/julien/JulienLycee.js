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
      for (const n of ['etagere', 'etagere_basse', 'table_lecture', 'ordinateur']) if (!T.spr[n]) T.spr[n] = T.spr.table;   // (image absente : une table)
      // touchés par une BOULETTE (sans jaune d'œuf) : l'IA choisit « <type>_touche_propre » quand le coup ne fait pas de tache
      for (const t of ['surveillant', 'cantiniere']) { const i = img(t + '_touche_papier'); if (i) T.spr[t + '_touche_propre'] = i; }
      T.spr.comptoir = img('comptoir') || img('bureau') || T.spr.bureau;   // vraie image du comptoir, sinon le bureau du prof
      T.lycee = construireDecorLycee(this.ctx, L, VUE_H, PLAN_LYCEE, estCantine);
      for (const [code, n] of Object.entries(MURS_IMAGES)) { const i = img(n); if (i) T.lycee.murs[code] = i; }
    }
    return T.lycee;
  }
  planDepart() { return PLAN_LYCEE; }
  lancerMusique() { jouerMusique(this, 'julien_lycee_musique'); }   // thème de Duke Nukem 3D
  imageFin() { return 'julien_fin_attrape'; }
  // carte : le CARNET (tant qu'il n'est pas pris), puis la porte de la salle 12
  reperesCarte() {
    if (!this.carnet) { const k = this.objets.find(o => o.type === 'carnet' && o.actif); return k ? [{ x: k.x, y: k.y, couleur: '#ffd84a', nom: 'CARNET' }] : []; }
    return [{ x: PORTE_SALLE_12.x + 0.5, y: PORTE_SALLE_12.y + 0.5, couleur: '#7fff7f', nom: 'SALLE 12' }];
  }
  messagesFuite() { return TXT.fuite; }   // surveillants et fayots : pas de « commissariat » au lycée

  create() {
    this.txtLycee = null;   // (la scène est réutilisée quand on rejoue : ne pas toucher au texte de la partie d'avant)
    super.create();
    this.lblFlics.setText('REPOUSSÉS');
    this.lblLycee.setText('CARNET');
    this.txtLycee = texte(this, 868, VUE_H * 2 + 86, '', 12, '#ffd84a');   // sous la boussole (elle vise le carnet, puis la porte)
    this.dessiner(0);
  }

  intro() {
    const tact = estTactile();
    this.afficherIntro('LE LYCÉE', [
      'Tu es dans le lycée… et en RETARD ! Julien t\'attend en SALLE 12.',
      'Œufs et tomates INTERDITS ici : seulement ta SARBACANE (infinie).',
      'Salle 12 fermée : va chercher ton CARNET au CDI (après la cantine).',
      'SURVEILLANT : il siffle puis fonce → pas de côté. CANTINIÈRE : gare à la purée.',
      'Les FAYOTS te dénoncent : on ne peut pas les toucher, contourne-les.',
      'Une boulette sur un EXTINCTEUR : mousse partout !   Les CANETTES soignent.',
      ...(tact ? [this.joy ? 'Joystick : avancer, reculer, pas de côté     ↺ ↻ : tourner' : '▲ ▼ avancer / reculer   ◀ ▶ pas de côté   ↺ ↻ tourner',
        'LANCER : tirer      ARME : changer d\'arme'] : this.lignesCommandes()),
    ], () => this.demarrer());
  }

  demarrer() {
    super.demarrer();
    if (this.anarchiste) this.message('ANARCHISTE : le CPE a doublé les surveillants… et les fayots ont l\'oreille fine !', 4);
  }

  appliquerDifficulte() {
    this.j.mun.oeufs = 0; this.j.mun.tomates = 0;   // armes de la manif interdites : seulement la sarbacane
    // ANARCHISTE (audit : « pas de surprise ») : renforts de surveillants et de cantinières, fayots qui alertent plus loin
    this.anarchiste = this.diff === DIFFICULTES.anarchiste;
    if (this.anarchiste) for (const [type, x, y] of RENFORTS_LYCEE) this.ajouterEnnemi(type, x, y);
    this.total = this.ennemis.filter(e => e.actif).length;
  }

  perdu() { super.perdu('ATTRAPÉ !', 'Direction le bureau du CPE… Retente ta chance !'); }

  // ------------------------------------------------------------------ niveau
  lireNiveau() {
    this.j = this.nouveauJoueur();
    this.j.armes = new Set(['sarbacane']); this.j.arme = 'sarbacane';   // les armes de la manif sont INTERDITES au lycée
    this.ennemis = []; this.objets = []; this.tirs = []; this.grenades = []; this.nuages = []; this.splats = [];
    this.farines = []; this.rideaux = []; this.flaques = []; this.fourgonFait = true;
    this.secrets = new Map(); this.secretsTrouves = 0; this.secretsSignales = new Set();
    this.carnet = false; this.fini = false; this.porteT = 0;
    this.plan = this.plan.map((ligne, y) => [...ligne].map((c, x) => {
      const px = x + 0.5, py = y + 0.5;
      if (c === 'J') { this.j.x = px; this.j.y = py; return '.'; }
      if (SECRETS_LYCEE[c]) { this.secrets.set(`${x},${y}`, true); return SECRETS_LYCEE[c]; }
      const type = OBJETS_LYCEE[c];
      if (!type) return c;
      if (type === 'surveillant' || type === 'cantiniere') { this.ajouterEnnemi(type, x, y); return '.'; }
      const o = { type, x: px, y: py, solide: !!RAYONS[type], rayon: RAYONS[type] || 0.3, actif: true, n: 0 };
      if (type === 'fayot') Object.assign(o, { type: 'fayot_bras', fayot: true, criT: 0, replique: TXT.fayotTouche });
      this.objets.push(o);
      return '.';
    }).join(''));
    this.total = this.ennemis.length; this.repousses = 0;
    this.totalObjets = this.objets.filter(o => !o.solide).length; this.ramasses = 0;
    this.zonesVues = new Set(); this.portailOuvert = true; this.temps = 0;
    this.sortieCases = new Set();
    const k = this.objets.find(o => o.type === 'carnet');
    this.sortie = { x: k.x, y: k.y };   // la boussole vise le carnet, puis la porte de la salle 12
  }

  ajouterEnnemi(type, x, y) {
    const px = x + 0.5, py = y + 0.5;
    this.ennemis.push({ type, x: px, y: py, vie: RG[type].vie, etat: 'attente', t: 1 + Math.random(), anim: 0, bouge: false,
      vuX: px, vuY: py, alerte: false, cdx: 0, cdy: 0, actif: true, parvis: false,
      ronde: true, rdx: x % 2 ? 1 : -1, rdy: 0, rondeT: 2.5 });
  }

  // ------------------------------------------------------------------ boucle (la boucle commune est dans JulienManif)
  zonesNiveau() { return ZONES_LYCEE; }
  majJeu(dt) {
    const j = this.j;
    for (const f of this.flaques) f.t -= dt;
    this.flaques = this.flaques.filter(f => f.t > 0);
    j.lent = this.flaques.some(f => Math.hypot(f.x - j.x, f.y - j.y) < 0.8);
    this.bougerJoueur(dt);
    this.ennemis.forEach(e => this.ia(e, dt));
    this.fayots(dt);
    this.projectiles(dt);
    this.ramasser();
    this.porte(dt);
  }

  // les FAYOTS : ils te voient → ils crient et alertent tout le monde ; trop près → ils s'enfuient (en courant)
  fayots(dt) {
    const j = this.j, F = RG.lycee;
    for (const o of this.objets) {
      if (!o.fayot || !o.actif) continue;
      const ox = j.x - o.x, oy = j.y - o.y, d = Math.hypot(ox, oy);
      if (o.fuit) {
        this.deplacer(o, -ox / d * 2.4 * dt, -oy / d * 2.4 * dt, 0.28, o);
        o.fuitT += dt;
        if (o.fuitT > 0.6 && !this.visible(o)) o.actif = false;
        continue;
      }
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
