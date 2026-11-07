// =====================================================================
// RÉMI — JEU 2 : LE BABYFOOT (PROTOTYPE, dessiné au code, remplace le beer pong)
// Vue à la 1re personne : TON GARDIEN DE DOS au premier plan, la table, Rémi en face.
// BOUCLE : LIRE → ARRÊTER → RIPOSTER.
//  1) Rémi promène la balle avec son attaque puis tire. Il se PENCHE du côté où il va tirer (il feinte parfois :
//     il penche d'un côté puis change au dernier moment). Ton gardien suit ton doigt (gauche / droite).
//  2) Arrêt = la balle colle à ton gardien : tu as une seconde pour RIPOSTER (toucher bref ou glisser vers le haut ;
//     ESPACE au clavier) à travers ses barres qui bougent. Trop tard : Rémi récupère.
//  3) Règles de bar : GAMELLE (la balle rentre et ressort : but + un point retiré à l'autre) ; ROULETTE interdite :
//     si Rémi fait tourner sa barre (elle tourbillonne) et marque, touche RÉMI (ou Z) pour faire annuler le but.
//     Faux appel = tu bois. Chaque but encaissé = tu bois (l'écran tangue, ton gardien tremble).
// Premier à BABY.buts. Réglages : BABY dans reglages.js ; difficulté : baby* dans DIFFICULTES.
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, BABY as B, REPLIQUES, POINTS } from './reglages.js';
import { remi } from './dessins.js';
import { Dessin } from './babyfoot/dessin.js';
import { Commandes } from './babyfoot/commandes.js';
import { RemiIA } from './babyfoot/remi_ia.js';
import { Physique } from './babyfoot/physique.js';
import { Effets } from './babyfoot/effets.js';
import { CX, L, W, R, proj, xSur, profondeur, hommes, BARRES, BOUTON_ROULETTE, BOUTON_TIR, VIDES } from './babyfoot/outils.js';
import { bulle, annonce, jeuSuivant, ecranPerdu, difficulteOuChoix, hasard, choisir, laisserPasserTactile, bilanDe, noterJeu } from './commun.js';

export class RemiBaby extends BossScene {
  constructor() { super('RemiBaby', IDENTITE); }

  create() {
    this.etat = 'intro';   // intro | prep | tir | tient | riposte | pause | fin
    this.trace = []; this.eclats = []; this.confettis = []; this.filet = null; this.ralentiFin = 0;
    this.horloge = 0; this.ivresse = 0; this.remiBu = 0; this.prochainHoquet = 0; this.flou = 0;
    this.butsToi = 0; this.butsRemi = 0; this.arrets = 0; this.gamelles = 0;
    this.pos = { toi: 0, att: 0, def: 0, gar: 0 };      // position de chaque barre (m)
    this.cible = 0;                                     // où ton doigt veut le gardien
    this.balle = null; this.tir = null; this.roulette = null; this.appelPossible = 0;
    this.pose = 'face'; this.poseFin = 0; this.penche = 0; this.dir = 0; this.tenu = 0; this.visee = 0;
    this.decor();
    this.gRemi = this.add.graphics().setDepth(3);
    this.g = this.add.graphics().setDepth(5);
    this.gAvant = this.add.graphics().setDepth(7);
    this.gBalle = this.add.graphics();
    // V19i FIGURINES (images) : une par joueur, rangées selon leur barre ; sinon elles restent dessinées au code
    this.figures = this.textures.exists('remi_baby_rouges') && this.textures.exists('remi_baby_toi');
    this.figs = {};
    if (this.figures) for (const nom of Object.keys(BARRES)) {
      const toi = nom === 'toi';
      this.figs[nom] = Array.from({ length: BARRES[nom].n }, () => this.add.sprite(0, 0, toi ? 'remi_baby_toi' : 'remi_baby_rouges', 0)
        .setDepth(profondeur(BARRES[nom].z) + (toi ? 0.02 : 0.01)).setAlpha(toi ? B.transparenceGardien : 1));
    }
    this.txtRoulette = texte(this, BOUTON_ROULETTE.x, BOUTON_ROULETTE.y, 'ROULETTE !', 17, '#ffffff', { fontStyle: 'bold', stroke: '#000000', strokeThickness: 5 }).setDepth(901).setVisible(false);
    this.txtTir = texte(this, BOUTON_TIR.x, BOUTON_TIR.y, 'TIR', 30, '#ffffff', { fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setDepth(901).setVisible(false);
    this.txtVise = texte(this, LARGEUR / 2, 524, '', 22, '#7fff7f', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 10, y: 3 } }).setDepth(901).setVisible(false);
    this.hud = texte(this, LARGEUR / 2, 22, '', 26, '#ffffff', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 12, y: 3 } }).setDepth(900);
    this.touches = creerTouches(this);
    laisserPasserTactile(this);
    jouerMusique(this, 'remi_musique_baby', { reprendre: true });   // Captain Tsubasa (donnée par le propriétaire)
    this.installerDoigt();
    // vue qui se trouble (bords sombres) avec l'alcool : effet du moteur (WebGL), ignoré s'il n'existe pas
    this.vignette = null;
    const cam0 = this.cameras.main;
    cam0.setZoom(1).centerOn(CX, HAUTEUR / 2);   // (V19o : une partie quittée pendant le zoom du but ne le garde pas)
    try { if (cam0.postFX) { cam0.postFX.clear(); this.vignette = cam0.postFX.addVignette(0.5, 0.5, 0.75, 0); } } catch (e) { this.vignette = null; }
    etiquettesTactiles({ ...VIDES, espace: 'OK' });
    const t = estTactile();
    this.afficherIntro('RÉMI - Le babyfoot', [
      `Premier à ${B.buts} buts. Tu tiens le GARDIEN (vu de dos), Rémi attaque.`,
      `${t ? 'Pouce GAUCHE : ◀ ▶ (maintiens)' : '◀ ▶'} : ton gardien glisse à gauche / à droite`,
      'Rémi se PENCHE du côté où il va tirer... sauf quand il feinte !',
      `Balle arrêtée : ◀ ▶ TOURNENT ta visée (rebonds sur les bandes comme au billard) ; ligne VERTE = ${t ? 'gros bouton TIR sous le pouce DROIT' : 'ESPACE'}`,
      'GAMELLE (rentre et ressort) = but + un point retiré à l\'autre',
      `ROULETTE interdite : si sa barre tourbillonne et marque, ${t ? 'touche RÉMI' : 'appuie sur Z'} = but annulé`,
      'Chaque but encaissé, tu bois : ta visée titube, tu vois moins loin, hoquets...',
    ], () => difficulteOuChoix(this, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.demarrer(); }));
  }

  demarrer() {
    this.bilan = bilanDe(this); this.debutJeu = Date.now(); this.aideDoigt = this.horloge + 6;   // flèches qui clignotent au début
    etiquettesTactiles(VIDES);   // V19g : plus de boutons du téléphone (TIR tombait sur ▶) : tout est dessiné dans le jeu
    bulle(this, `Rémi : « ${REPLIQUES.babyIntro} »`, '#ffd84a', 2.4, 250);
    this.time.delayedCall(1200, () => this.engagement());
  }

  // V19p (audit n°1) : après TON but, c'est TOI qui engages : la balle est à ton gardien, Rémi défend, tu vises et tu tires
  engagementToi() {
    if (this.termine) return;
    this.aToiDEngager = false;
    if (this.butsRemi === B.buts - 1 || this.butsToi === B.buts - 1) annonce(this, 'BALLE DE MATCH', this.butsToi === B.buts - 1 ? '#7fff7f' : '#ff6b6b', 0.9);
    else annonce(this, 'À TOI D\'ENGAGER', '#7fff7f', 0.9);
    this.tir = null; this.penche = 0;
    this.balle = { x: Phaser.Math.Clamp(this.pos.toi + B.balleTenue, -B.but / 2 + 0.01, B.but / 2 - 0.01), z: BARRES.toi.z + 0.05, vx: 0, vz: 0 };
    this.etat = 'riposte'; this.fenetre = this.diff.babyFenetre; this.memoire = this.balle.x; this.visee = 0;
    this.astuce();
  }

  // ---------- issues ----------
  arret() {
    this.arrets++;
    jouerSon(this, 'remi_baby_frappe', { volume: 0.9, rate: 0.75 }); jouerSon(this, 'remi_baby_clac', { volume: 0.7 });
    this.cameras.main.shake(140, 0.008);
    this.ralentiFin = this.horloge + B.arretFige;   // V19o : petit arrêt sur image au moment de l'arrêt (on sent le choc)
    this.eclats.push({ x: this.pos.toi, z: BARRES.toi.z + 0.03, t: 0, c: 0x7fc4ff });
    this.roulette = null;
    annonce(this, 'ARRÊT !', '#7fff7f', 0.5);
    this.balle.vx = 0; this.balle.vz = 0;
    this.etat = 'riposte'; this.fenetre = this.diff.babyFenetre; this.memoire = this.balle.x; this.visee = 0;   // fenetre = temps du bonus ÉCLAIR
    this.astuce();
    if (Math.random() < 0.5) { this.poseTemp('rale', 1.2); bulle(this, `Rémi : « ${choisir(REPLIQUES.babyArret)} »`, '#ffd84a', 1.4, 300); }
  }

  // V19p : aux 2 premières ripostes d'une partie, on explique la feinte
  astuce() {
    this.nbAstuces = (this.nbAstuces || 0) + 1;
    if (this.nbAstuces <= 2) this.time.delayedCall(500, () => bulle(this, 'Ses défenseurs SUIVENT ta visée (zones rouges) : tourne d\'un côté, puis repars vite de l\'autre !', '#ffd84a', 3, 150));
  }

  riposter(biais) {
    if (this.etat !== 'riposte') return;
    const b = this.balle;
    // V19g TIR ÉCLAIR : tirer pendant le bonus (anneau jaune autour de TIR) = balle plus rapide, son gardien surpris
    const eclair = this.fenetre > 0;
    const v = B.riposteVitesse * (eclair ? B.eclairVitesse : 1);
    b.vz = v * Math.cos(biais); b.vx = v * Math.sin(biais);
    this.etat = 'riposte_vol'; this.eclairTir = eclair; this.frappeToi = this.horloge + 0.3;
    this.reflexe = this.diff.babyReflexe + this.remiBu * B.pinteReflexe + (eclair ? B.eclairReflexe : 0);   // son gardien réagit avec un temps de retard
    jouerSon(this, 'remi_baby_frappe', eclair ? { rate: 1.25 } : undefined);
    if (eclair) { annonce(this, 'TIR ÉCLAIR !', '#ffd84a', 0.5); this.cameras.main.shake(90, 0.003); }
    // V19n : le tir se SENT : éclat au pied du gardien, petit coup de zoom
    this.eclats.push({ x: b.x, z: b.z, t: 0, c: eclair ? 0xffd84a : 0xffffff });
    const cam = this.cameras.main;
    this.tweens.add({ targets: cam, zoom: eclair ? 1.06 : 1.035, duration: 60, yoyo: true, ease: 'Quad.Out' });
  }

  contre(nom) {
    this.dernierContre = nom;
    jouerSon(this, 'remi_baby_clac');
    bulle(this, nom === 'gar' ? 'Rémi : « Arrêté ! »' : 'Contré !', '#ffd84a', 1.0, 300);
    this.balle.vz = -this.balle.vz * 0.3;
    this.suivant(0.7);
  }

  sortie(msg) { bulle(this, msg, '#ffffff', 1.0, 300); this.suivant(0.8); }

  butRemi(gamelle) {
    this.aToiDEngager = false;
    const T = this.tir;
    this.butsRemi++;
    if (gamelle) this.gamelleAnim(false);
    this.appelPossible = T.roulette ? this.horloge + B.appelDuree : 0;
    this.dernierBut = { gamelle, roulette: T.roulette };
    this.poseTemp('nargue', 1.6);
    this.ivresse++;
    jouerSon(this, 'remi_boit');
    this.time.delayedCall(900, () => bulle(this, `Tu bois ta pinte... (${this.ivresse})`, '#e8a52a', 1.4, 360));
    if (this.ivresse >= 2 && !this.prochainHoquet) this.prochainHoquet = this.horloge + hasard(2, 4);
    this.cameras.main.flash(200, 230, 160, 40);
    annonce(this, gamelle ? 'GAMELLE !' : 'BUT DE RÉMI', '#ff6b6b', 0.8);
    if (!gamelle) bulle(this, `Rémi : « ${choisir(REPLIQUES.babyBut)} »`, '#ffd84a', 1.6, 300);
    this.celebrer(false);
    this.time.delayedCall(900, () => this.verifierFin(0.8));
  }

  butToi(gamelle) {
    this.aToiDEngager = true;
    this.butsToi++;
    this.remiBu++;
    if (gamelle) this.gamelleAnim(true);
    this.poseTemp('boit', 2.2);
    this.celebrer(true);
    annonce(this, gamelle ? 'GAMELLE !' : 'BUUUT !', '#7fff7f', 1.1);
    this.time.delayedCall(700, () => jouerSon(this, 'remi_pinte'));
    if (!gamelle) this.time.delayedCall(900, () => bulle(this, `Rémi : « ${choisir(REPLIQUES.babyEncaisse)} »`, '#ffd84a', 1.6, 300));
    this.time.delayedCall(1500, () => this.verifierFin(0.5));
  }

  appelRoulette() {
    if (this.etat === 'intro' || this.etat === 'fin') return;
    if (this.horloge < this.appelPossible && this.dernierBut?.roulette) {
      this.appelPossible = 0;
      this.butsRemi = Math.max(0, this.butsRemi - 1);
      if (this.dernierBut.gamelle) this.butsToi++;
      this.ivresse = Math.max(0, this.ivresse - 1);
      annonce(this, 'ROULETTE ! BUT ANNULÉ', '#7fff7f', 1.0);
      this.poseTemp('rale', 1.6);
      bulle(this, `Rémi : « ${choisir(REPLIQUES.babyRouletteVue)} »`, '#ffd84a', 1.6, 300);
      return;
    }
    if (this.etat === 'prep' || this.etat === 'tir' || this.horloge < this.appelPossible) return;   // trop tôt : on ignore
    if (this.fauxAppelDepuis && this.horloge - this.fauxAppelDepuis < 1) return;
    this.fauxAppelDepuis = this.horloge;
    this.ivresse++;
    jouerSon(this, 'remi_hips');
    bulle(this, 'Faux appel ! Tu bois.', '#ff6b6b', 1.2, 300);
  }

  verifierFin(d) {
    this.etat = 'pause'; this.balle = null; this.roulette = null;
    this.time.delayedCall(d * 1000, () => {
      if (this.termine) return;
      if (this.butsToi >= B.buts) this.gagne();
      else if (this.butsRemi >= B.buts) {
        if (this.horloge < this.appelPossible) { this.time.delayedCall(300, () => this.verifierFin(0)); return; }
        ecranPerdu(this, 'PERDU', REPLIQUES.babyPerdu, this.nomDiff);
      } else if (this.aToiDEngager) this.engagementToi();
      else this.engagement();
    });
  }

  suivant(d) {
    this.etat = 'pause';
    this.time.delayedCall(d * 1000, () => { this.balle = null; if (!this.termine) this.engagement(); });
  }

  gagne() {
    this.etat = 'fin';
    noterJeu(this, 'baby', (this.butsToi - this.butsRemi) * POINTS.babyEcart + this.arrets * POINTS.babyArret + this.gamelles * POINTS.babyGamelle);
    annonce(this, 'GAGNÉ !', '#7fff7f', 1.4);
    jouerSon(this, 'remi_arrivee');
    this.time.delayedCall(900, () => bulle(this, `Rémi : « ${REPLIQUES.babyGagne} »`, '#ffd84a', 2.8, 90));
    this.time.delayedCall(3800, () => jeuSuivant(this, 'baby', this.nomDiff));
  }

  // ---------- boucle ----------
  update(temps, delta) {
    const dt = Math.min(delta, 50) / 1000 * (this.horloge < (this.ralentiFin ?? 0) ? B.ralenti : 1);   // V19n : RALENTI au but
    this.horloge += dt;
    if (this.etat !== 'intro' && this.etat !== 'fin' && !this.termine) {
      this.pasGardien(dt);
      this.pasBarresRemi(dt);
      if (this.etat === 'prep') this.pasPrep(dt);
      if (this.etat === 'tir' || this.etat === 'riposte_vol') this.pasBalle(dt);
      if (this.etat === 'filet' && this.balle) {   // la balle file au fond du filet puis s'y écrase
        const b = this.balle, fond = b.vz > 0 ? L + 0.045 : -0.045;
        b.x += b.vx * dt; b.z += b.vz * dt;
        if ((b.vz > 0 && b.z >= fond) || (b.vz < 0 && b.z <= fond)) { b.z = fond; b.vx = 0; b.vz = 0; }
      }
      this.pasEffets(dt);
      if (this.etat === 'riposte') {
        this.balle.x = Phaser.Math.Clamp(this.pos.toi + B.balleTenue, -B.but / 2 + 0.01, B.but / 2 - 0.01); this.balle.z = BARRES.toi.z + 0.05;   // un peu de côté : visible derrière ton gardien
        this.fenetre -= dt;   // V19g : pas de limite de temps pour viser ; seul le bonus ÉCLAIR s'éteint
        this.indice = this.diff.babyGuide ? this.chercherVert() : undefined;   // V19l : pas de guide en PRESSION / CUL SEC
        if (vientDAppuyer(this.touches.espace)) this.riposter(this.viseeVraie());
      }
      if (vientDAppuyer(this.touches.z)) this.appelRoulette();
      if (this.prochainHoquet && this.horloge > this.prochainHoquet && this.ivresse >= 2) this.hoquet();
    }
    this.dessiner();
  }

  poseTemp(p, d = 1.4) { this.pose = p; this.poseFin = this.horloge + d; }
}

// V19p : la scène est découpée en 5 fichiers (dossier babyfoot/) ; leurs méthodes s'ajoutent ici
Object.assign(RemiBaby.prototype, Dessin, Commandes, RemiIA, Physique, Effets);
