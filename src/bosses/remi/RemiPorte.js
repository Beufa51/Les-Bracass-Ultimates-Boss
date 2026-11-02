// =====================================================================
// RÉMI — JEU 3 : « LA PORTE ET LE VIDEUR » (V11, vue de dos, la porte des WC du bar)
// Rémi parie que tu ne défonceras pas la porte avant lui. Chacun son tour :
//   MAINTENIR (le doigt n'importe où, ou ESPACE) = tu armes ton poing, la puissance monte de plus en plus vite ;
//   LÂCHER = le coup part. Dégâts = puissance x précision (la cible qui se promène sur la porte doit être sur ton poing +).
// LE VIDEUR fait sa ronde : on entend ses pas, son ombre s'allonge dans le couloir, puis il passe la tête (à gauche).
//   S'il te voit en train de charger (ou au moment du coup) : ATTRAPÉ — coup perdu, la porte est rafistolée.
// Une seule règle : la porte a une SOLIDITÉ commune ; celui dont le coup la fait CÉDER gagne (et le badge).
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique, facteurMusique } from '../../core/musique.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, PORTE as R, REPLIQUES } from './reglages.js';
import { bulle, annonce, ecranPerdu, difficulteOuChoix, hasard, choisir, laisserPasserTactile } from './commun.js';

// la porte du décor illustré (remi_porte_decor.jpg, 960 x 536), zoomé x1,5 sur la porte (à droite)
const BATTANT = { x: 774, y: 147, l: 140, h: 322 };
const ZOOM = 1.5, DECOR_X = -480, DECOR_Y = -183;
const PORTE = { x: DECOR_X + BATTANT.x * ZOOM, y: DECOR_Y + BATTANT.y * ZOOM, l: BATTANT.l * ZOOM, h: BATTANT.h * ZOOM };
const IMPACT = { x: 730, y: 272 };   // où le poing touche la porte (écran)
// planches de dos : cases alignées à gauche ; « poing » = où est le poing dans la case de l'impact
const DOS = {
  remi: { tex: 'remi_dos', echelle: 0.75, haut: 150, cases: { garde: 0, charge: 0, coup: 1, frappe: 2 }, poing: 520 },
  toi: { tex: 'remi_toi_dos', echelle: 1.1, haut: 128, cases: { garde: 0, charge: 1, coup: 2, frappe: 3 }, poing: 336 },
};
const VIDEUR = { x: 120, echelle: 0.42 };   // l'intrus passe la tête au coin du couloir (à gauche)
// LES INTRUS (V13) : pas que le videur ! Chacun a ses pas, son ombre, son rythme et ses feintes préférées.
//  lent : x durée de l'annonce ; regard : x durée du regard ; ombre : taille ; feinte : mode préféré (en plus des autres)
const INTRUS = {
  videur: { poids: 0.45, nom: 'Le videur', lent: 1, regard: 1, ombre: 1, pas: ['remi_atterrit', 0.6], rythme: [0.18, 0.4], feinte: null,
    repliques: 'porteAttrape' },
  pisseur: { poids: 0.33, nom: 'Le gars qui vient pisser', lent: 1, regard: 1.3, ombre: 1, pas: ['remi_atterrit', 0.8], rythme: [0.2, 0.65], feinte: 'fausse',
    repliques: 'porteAttrapePisseur' },
  mamie: { poids: 0.22, nom: 'La mamie', lent: 1, regard: 1.6, ombre: 1, pas: ['remi_rebond', 0.45], rythme: [0.45, 0.6], feinte: 'retour',
    repliques: 'porteAttrapeMamie' },
};
const VIDES = { haut: null, bas: null, gauche: null, droite: null, espace: null, z: null, x: null };

export class RemiPorte extends BossScene {
  constructor() { super('RemiPorte', IDENTITE); }

  create() {
    // la scène est RÉUTILISÉE d'une partie à l'autre : on oublie les objets créés « à la demande » la fois d'avant
    // (sinon on réutilise un texte déjà détruit → bug « drawImage » à la 2e partie)
    this.txtSolidite = null; this.alerte = false; this.remiPrudence = undefined;
    this.etat = 'intro';         // intro | remi | toi | coup | pause | fin
    this.horloge = 0; this.frappeur = 'remi'; this.pose = { remi: 'garde', toi: 'garde' };
    this.solidite = R.solidite; this.puissance = 0; this.cible = { x: 0, y: 0 }; this.tCible = 0; this.tCoup = 0;
    this.fissures = []; this.eclats = []; this.flash = 0; this.gel = 0; this.tremble = 0; this.entree = 1; this.dernierFrappeur = null;
    this.compteur = 0; this.coups = { toi: 0, remi: 0 }; this.attrapes = { toi: 0, remi: 0 };
    this.videur = { etat: 'absent', t: 2.5, x: -300, pose: 0 };
    this.doigt = false; this.charge = false; this.remiAttend = 0;

    this.decor();
    this.gPorte = this.add.graphics().setDepth(3);
    this.gOmbre = this.add.graphics().setDepth(4);
    this.dos = {
      remi: this.add.sprite(0, 0, DOS.remi.tex, 0).setOrigin(0, 0).setScale(DOS.remi.echelle).setDepth(6).setVisible(false),
      toi: this.add.sprite(0, 0, DOS.toi.tex, 0).setOrigin(0, 0).setScale(DOS.toi.echelle).setDepth(6).setVisible(false),
    };
    this.sprVideur = this.add.sprite(-300, HAUTEUR + 10, 'remi_videur', 0).setOrigin(0.5, 1).setScale(VIDEUR.echelle).setDepth(7);
    // le gars qui vient pisser : son image si elle existe, sinon un bourré (debout / il sursaute) ; la mamie : image ou dessin
    this.sprPisseur = this.textures.exists('remi_pisseur') ? this.add.sprite(-300, HAUTEUR + 10, 'remi_pisseur', 0).setOrigin(0.5, 1).setScale(VIDEUR.echelle).setDepth(7)
      : this.add.sprite(-300, HAUTEUR + 60, 'remi_bourres', 0).setOrigin(0.5, 1).setScale(0.62).setDepth(7);
    this.sprMamie = this.textures.exists('remi_mamie') ? this.add.sprite(-300, HAUTEUR + 10, 'remi_mamie', 0).setOrigin(0.5, 1).setScale(VIDEUR.echelle).setDepth(7) : null;
    this.gMamie = this.add.graphics().setDepth(7);
    this.gJauges = this.add.graphics().setDepth(900);
    this.ecran = texte(this, 130, 110, '000', 54, '#ff3030', { fontStyle: 'bold', stroke: '#300000', strokeThickness: 6, backgroundColor: '#100000' }).setDepth(4);
    this.hud = texte(this, 190, 28, '', 20, '#ffffff', { fontStyle: 'bold' }).setDepth(900);
    this.consigne = texte(this, LARGEUR / 2, 505, '', 24, '#ffd84a', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 12, y: 4 } }).setDepth(900).setVisible(false);
    this.touches = creerTouches(this);
    laisserPasserTactile(this);
    // la musique (Street Fighter II, Ken) : on la BAISSE quand le videur approche, on la COUPE net quand il regarde
    // (« on fait genre de rien »), elle repart quand il s'en va
    jouerMusique(this, 'remi_musique_porte'); this.volMusique = 1;
    this.events.once('shutdown', () => facteurMusique('remi_musique_porte', 1));
    // MAINTENIR = le doigt posé n'importe où (ou ESPACE)
    this.input.on('pointerdown', () => { this.doigt = true; });
    this.input.on('pointerup', () => { this.doigt = false; });

    etiquettesTactiles({ ...VIDES, espace: 'OK' });
    const t = estTactile();
    this.afficherIntro('RÉMI - La porte et le videur', [
      REPLIQUES.porteIntro,
      `MAINTIENS ${t ? 'le doigt sur l\'écran' : 'ESPACE'} : tu armes ton poing (ça monte de plus en plus vite)`,
      'LÂCHE : le coup part. Lâche quand la cible passe sur ton poing (+) = coup parfait.',
      'Des pas, une ombre, le « ! »... QUELQU\'UN ARRIVE. S\'il te voit charger : ATTRAPÉ !',
      'Mais qui ? Le VIDEUR ne rate rien ; la MAMIE n\'entend que les gros coups ; le GARS QUI VIENT PISSER s\'en fiche !',
      'Et il FEINTE : fausse alerte, il surgit sans prévenir, il revient d\'un coup...',
      'Celui dont le coup fait CÉDER la porte gagne.',
    ], () => difficulteOuChoix(this, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.tour('remi'); }));
  }

  decor() {
    this.cameras.main.setBackgroundColor('#141018');
    const t = this.textures.get('remi_porte_decor');
    if (!t.has('battant')) t.add('battant', 0, BATTANT.x, BATTANT.y, BATTANT.l, BATTANT.h);
    this.add.image(DECOR_X, DECOR_Y, 'remi_porte_decor').setOrigin(0, 0).setScale(ZOOM).setDepth(1);
    this.add.rectangle(PORTE.x, PORTE.y, PORTE.l, PORTE.h, 0x050308).setOrigin(0, 0).setDepth(2);
    // le battant, centré (il se BOMBE à chaque coup)
    this.battant = this.add.image(PORTE.x + PORTE.l / 2, PORTE.y + PORTE.h / 2, 'remi_porte_decor', 'battant').setScale(ZOOM).setDepth(2.5);
  }

  // ---------- les tours ----------
  tour(qui) {
    if (this.termine || this.solidite <= 0) return;
    this.frappeur = qui; this.puissance = 0; this.charge = false; this.tCible = Math.random() * 3;
    this.pose[qui] = 'garde';
    this.etat = qui;
    etiquettesTactiles(VIDES);
    if (qui === 'toi') {
      this.doigt = false;
      this.consigne.setVisible(true);
      annonce(this, 'À TOI !', '#7fff7f', 0.6);
    } else {
      this.consigne.setVisible(false);
      // jusqu'où Rémi va charger cette fois (un peu au hasard autour de sa « gourmandise »)
      this.remiVise = Phaser.Math.Clamp(this.diff.remiCharge + hasard(-0.12, 0.12), 0.25, 1);
      this.remiAttend = hasard(0.4, 0.9);   // il se met en place
      this.remiPrudence = undefined; this.remiReaction = undefined;
      bulle(this, `Rémi : « ${choisir(REPLIQUES.porteRemiFrappe)} »`, '#ffd84a', 1.2, 80);
    }
  }

  update(temps, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.horloge += dt;
    if (this.gel > 0) { this.gel -= dt; this.dessiner(0); return; }
    if (this.etat === 'toi' || this.etat === 'remi') {
      this.tCible += dt;
      this.bougerCible();
      this.pasVideur(dt);
      if (this.etat === 'toi') this.pasToi(dt); else if (this.etat === 'remi') this.pasRemi(dt);
    } else if (this.etat === 'coup' || this.etat === 'pause') this.pasVideur(dt);
    this.dessiner(dt);
  }

  bougerCible() {
    const t = this.tCible * this.diff.visee / R.periodeVisee * 2.2, b = PORTE;
    this.cible.x = b.x + b.l / 2 + (b.l / 2 - 26) * Math.sin(t * 1.05);
    this.cible.y = IMPACT.y + 110 * Math.sin(t * 1.4 + 0.8);
  }

  charger(dt) {
    const avant = this.puissance;
    this.puissance = Math.min(1, this.puissance + (R.charge + this.puissance * R.accel) * dt);
    this.charge = true;
    this.pose[this.frappeur] = 'charge';
    if (Math.floor(this.puissance * 10) !== Math.floor(avant * 10)) jouerSon(this, 'remi_tape', { rate: 0.7 + this.puissance });
  }

  pasToi(dt) {
    const tenu = this.doigt || this.touches.espace.isDown;
    if (tenu) this.charger(dt);
    else if (this.charge) { this.frapper('toi'); return; }
    this.consigne.setText(this.charge ? `PUISSANCE ${Math.round(this.puissance * 100)} %  -  LÂCHE quand la cible est sur le + !`
      : `${estTactile() ? 'MAINTIENS le doigt' : 'MAINTIENS ESPACE'} pour charger... gare à qui arrive !`);
  }

  pasRemi(dt) {
    if (this.remiAttend > 0) { this.remiAttend -= dt; return; }
    // Rémi ne commence pas à charger quand le videur arrive ; s'il charge déjà, il lâche (selon sa prudence)... ou il insiste
    if (this.videur.etat !== 'absent' && this.puissance === 0) return;
    if (this.videur.etat === 'annonce' && this.remiPrudence === undefined) {
      // il lui faut un moment pour réagir (et il est parfois trop sûr de lui)
      this.remiReaction = (this.remiReaction ?? hasard(0.25, 0.7)) - dt;
      if (this.remiReaction <= 0) { this.remiPrudence = Math.random() < this.diff.remiPrudent; this.remiReaction = undefined; }
    }
    if (this.remiPrudence) { this.frapper('remi'); return; }
    this.charger(dt * 0.8);
    // il lâche quand la cible passe près de son poing, une fois assez chargé
    const d = Math.hypot(this.cible.x - IMPACT.x, this.cible.y - IMPACT.y);
    if (this.puissance >= this.remiVise && (d < 40 || this.puissance >= 1)) this.frapper('remi');
  }

  // ---------- le videur ----------
  // LE VIDEUR ET SES FEINTES (V12) : à chaque passage, il choisit une façon de venir (plus de feintes en CHAMPION) :
  //  normal   : ses pas, son ombre, le « ! »… puis il regarde (annonce de durée VARIABLE, pas toujours au même rythme)
  //  fausse   : il approche… et fait DEMI-TOUR (ceux qui ont lâché trop tôt ont gâché leur charge)
  //  surprise : presque pas d'annonce (un seul pas), il surgit
  //  retour   : après avoir regardé, il repart… et revient aussitôt jeter un 2e coup d'œil
  pasVideur(dt) {
    const v = this.videur;
    v.t -= dt;
    if (v.etat === 'absent' && v.t <= 0) {
      // QUI vient ? (sauf un 2e coup d'œil : c'est le même)
      if (!v.retourPrevu) { let r0 = Math.random(); v.qui = 'videur'; for (const [n, i] of Object.entries(INTRUS)) { r0 -= i.poids; if (r0 <= 0) { v.qui = n; break; } } }
      const I = INTRUS[v.qui];
      const f = this.diff.feintes, r = Math.random();
      v.mode = v.retourPrevu ? 'retour' : I.feinte && Math.random() < f * 0.6 ? I.feinte : r < f * 0.45 ? 'fausse' : r < f * 0.8 ? 'surprise' : 'normal';
      if (v.mode === 'retour' && !v.retourPrevu) v.mode = 'normal', v.retourForce = true;   // (la mamie revient toujours)
      v.retourPrevu = false;
      const base = R.videurAnnonce * this.diff.videur * I.lent;
      v.duree = v.mode === 'surprise' ? 0.3 : v.mode === 'retour' ? 0.4 : base * hasard(0.6, 1.3);
      v.etat = 'annonce'; v.t = v.duree; v.pas = 0;
      v.rythme = v.mode === 'surprise' ? 1 : hasard(I.rythme[0], I.rythme[1]);   // ses pas plus ou moins rapides
      v.demiTour = v.mode === 'fausse' ? v.duree * hasard(0.45, 0.8) : -1;
    } else if (v.etat === 'annonce') {
      v.pas -= dt;
      // FEINTE : tant qu'il n'est pas là, TOUT LE MONDE fait le même bruit et la même ombre : impossible de savoir
      // si c'est le videur... ou juste le gars qui vient pisser (qui, lui, s'en fiche)
      if (v.pas <= 0) { v.pas = v.rythme; jouerSon(this, 'remi_atterrit', { rate: 0.6 }); }
      // fausse alerte : il fait demi-tour avant d'arriver
      if (v.demiTour > 0 && v.duree - v.t >= v.demiTour) { v.etat = 'repart'; v.t = 0.6; return; }
      if (v.t <= 0) {
        v.etat = 'regarde'; v.t = hasard(R.videurRegard[0], R.videurRegard[1]) * INTRUS[v.qui].regard * (v.mode === 'retour' ? 0.6 : 1);
        v.pose = 0; v.vu = false; jouerSon(this, 'remi_scratch');
        // ... et on découvre QUI c'est : le gars qui vient pisser s'en fiche (on aurait pu continuer !),
        // la mamie n'entend que les GROS coups (charge à plus de 50 %) ; le videur, lui, ne rate rien
        if (v.qui === 'pisseur') { bulle(this, 'Le gars : « Pardon, pardon... URGENCE ! » (il s\'en fiche : continue !)', '#9fe0ff', 1.6, 150); this.time.delayedCall(300, () => jouerSon(this, 'remi_hips')); }
        if (v.qui === 'mamie') { bulle(this, 'La mamie : « Hein ? C\'est quoi ce bruit ? » (elle est un peu sourde...)', '#d8b0ff', 1.6, 150); jouerSon(this, 'remi_rebond', { rate: 0.45 }); }
      }
    } else if (v.etat === 'repart') {
      v.pas -= dt;
      if (v.pas <= 0) { v.pas = 0.35; jouerSon(this, 'remi_atterrit', { rate: 0.5, volume: 0.5 }); }
      if (v.t <= 0) { v.etat = 'absent'; v.t = hasard(0.5, 1.5) * this.diff.videur; }
    } else if (v.etat === 'regarde') {
      // il regarde : celui qui charge (ou qui vient juste de frapper) se fait ATTRAPER
      let fautif = (this.etat === 'toi' || this.etat === 'remi') && this.charge ? this.frappeur
        : this.etat === 'coup' && this.tCoup < 0.25 ? this.frappeur : null;
      if (v.qui === 'pisseur') fautif = null;                                                  // trop pressé pour regarder
      if (v.qui === 'mamie' && this.etat !== 'coup' && this.puissance < 0.5) fautif = null;   // un peu sourde : seulement les gros coups
      if (fautif && !v.vu) this.attraper(fautif);
      if (v.t <= 0) {
        v.etat = 'absent'; v.pose = 0;
        // le coup du 2e coup d'œil : il revient tout de suite
        v.retourPrevu = v.mode !== 'retour' && (v.retourForce || Math.random() < this.diff.feintes * 0.5);
        v.retourForce = false;
        v.t = v.retourPrevu ? hasard(0.4, 0.8) : hasard(R.videurAttente[0], R.videurAttente[1]) * this.diff.videur;
      }
    }
  }

  attraper(qui) {
    const v = this.videur;
    v.vu = true; v.pose = 1; v.t = Math.max(v.t, 1.3);
    this.attrapes[qui]++;
    this.solidite = Math.min(R.solidite, this.solidite + R.scotch);   // le barman rafistole la porte
    jouerSon(this, 'remi_porte', { rate: 0.6 });
    this.cameras.main.shake(200, 0.006);
    annonce(this, qui === 'toi' ? 'ATTRAPÉ !' : 'RÉMI ATTRAPÉ !', qui === 'toi' ? '#ff5a5a' : '#7fff7f', 1);
    const I = INTRUS[v.qui] || INTRUS.videur;
    bulle(this, `${I.nom} : « ${choisir(REPLIQUES[I.repliques])} »`, '#ffb070', 1.8, 150);
    this.time.delayedCall(500, () => bulle(this, `Coup perdu, et le barman rafistole la porte (+${R.scotch})`, '#ffffff', 1.4, 330));
    if (qui === 'remi') this.time.delayedCall(900, () => bulle(this, 'Rémi : « Mais... j\'ai rien fait ! »', '#ffd84a', 1.2, 80));
    this.etat = 'pause'; this.puissance = 0; this.charge = false; this.pose[qui] = 'garde';
    this.consigne.setVisible(false);
    this.time.delayedCall(1800, () => this.tour(qui === 'toi' ? 'remi' : 'toi'));
  }

  // ---------- le coup ----------
  frapper(qui) {
    const d = Math.hypot(this.cible.x - IMPACT.x, this.cible.y - IMPACT.y), zr = this.diff.zone * 200;
    const precision = qui === 'remi' ? hasard(0.65, 1) : d <= zr ? 1 : Math.max(0.2, 1 - (d - zr) / 130);
    const score = Math.round(999 * (R.degatsMin + (1 - R.degatsMin) * this.puissance) * (0.55 + 0.45 * precision));
    this.etat = 'coup'; this.tCoup = 0; this.charge = false; this.consigne.setVisible(false);
    this.coups[qui]++;
    if (qui === 'toi' && precision === 1 && this.puissance > 0.9) { bulle(this, 'COUP PARFAIT !', '#ffd84a', 1, 150); jouerSon(this, 'remi_foule'); }
    else if (qui === 'toi' && precision === 1) bulle(this, 'PILE DESSUS !', '#7fff7f', 0.8, 150);
    this.pose[qui] = 'coup';
    this.time.delayedCall(90, () => { this.pose[qui] = 'frappe'; this.impact(qui, score); });
    this.time.delayedCall(550, () => { this.pose[qui] = 'garde'; });
  }

  impact(qui, score) {
    this.solidite = Math.max(0, this.solidite - score);
    this.gel = 0.06 + score / 999 * 0.1;
    this.tremble = score / 999;
    this.cameras.main.shake(160 + score / 4, 0.004 + score / 999 * 0.014);
    jouerSon(this, score >= R.casse ? 'remi_porte_fort' : 'remi_porte');
    // la porte se BOMBE puis revient
    this.tweens.add({ targets: this.battant, scaleX: ZOOM * (1 - 0.06 * score / 999), scaleY: ZOOM * (1 + 0.03 * score / 999), duration: 70, yoyo: true });
    const n = 2 + Math.floor(score / 140), L = 20 + score / 7;
    for (let k = 0; k < n; k++) this.fissures.push(this.fissure(Math.random() * Math.PI * 2, L * hasard(0.5, 1)));
    for (let k = 0; k < Math.floor(score / 60); k++) this.eclats.push({ x: IMPACT.x, y: IMPACT.y, vx: hasard(-260, 260), vy: hasard(-380, 80), r: hasard(-6, 6), a: 0, vie: hasard(0.5, 1) });
    if (score >= R.casse) this.flash = 1;
    this.compteur = 0; this.tweens.add({ targets: this, compteur: score, duration: 600, ease: 'Cubic.Out' });
    const pop = texte(this, IMPACT.x, IMPACT.y - 40, String(score), 30 + score / 25, score >= R.casse ? '#ffd84a' : '#ffffff', { fontStyle: 'bold italic', strokeThickness: 8 }).setDepth(950);
    this.tweens.add({ targets: pop, y: IMPACT.y - 120, alpha: 0, scale: 1.3, duration: 1000, delay: 200, onComplete: () => pop.destroy() });
    if (this.solidite <= 0) { this.time.delayedCall(700, () => this.porteCede(qui)); return; }
    if (this.solidite < R.solidite * 0.25 && !this.alerte) { this.alerte = true; this.time.delayedCall(800, () => bulle(this, 'La porte ne tient plus qu\'à un fil !', '#ff9a5a', 1.6, 200)); }
    this.time.delayedCall(1300, () => { if (this.etat === 'coup') this.tour(qui === 'toi' ? 'remi' : 'toi'); });
  }

  fissure(angle, longueur) {
    const pts = [[IMPACT.x, IMPACT.y]];
    for (let k = 1; k <= 5; k++) {
      const r = longueur * k / 5, a = angle + hasard(-0.25, 0.25);
      pts.push([Phaser.Math.Clamp(IMPACT.x + Math.cos(a) * r, PORTE.x + 6, PORTE.x + PORTE.l - 6), Phaser.Math.Clamp(IMPACT.y + Math.sin(a) * r, PORTE.y + 6, PORTE.y + PORTE.h - 6)]);
    }
    return pts;
  }

  porteCede(qui) {
    this.etat = 'fin';
    jouerSon(this, 'remi_porte_fort'); jouerSon(this, 'remi_foule');
    this.cameras.main.shake(500, 0.02);
    this.tweens.add({ targets: this.battant, x: PORTE.x + PORTE.l, scaleX: 0.1, duration: 260, ease: 'Cubic.In' });
    this.fissures = [];
    if (qui === 'toi') {
      annonce(this, 'LA PORTE CÈDE !', '#ffd84a', 1.4);
      this.time.delayedCall(1800, () => this.victoire(REPLIQUES.porteGagne));
    } else {
      annonce(this, 'RÉMI A DÉFONCÉ LA PORTE', '#ff5a5a', 1.4);
      this.time.delayedCall(1800, () => ecranPerdu(this, 'RÉMI A DÉFONCÉ LA PORTE', REPLIQUES.portePerdu, this.nomDiff));
    }
  }

  // ---------- dessin ----------
  dessiner(dt) {
    if (this.etat === 'coup') this.tCoup += dt;
    this.tremble = Math.max(0, this.tremble - dt * 2.5);
    const g = this.gPorte.clear();
    const dx = Math.sin(this.horloge * 60) * this.tremble * 5;
    if (this.etat !== 'fin') this.battant.x = PORTE.x + PORTE.l / 2 + dx;
    for (const f of this.fissures) {
      g.lineStyle(3, 0x1a0e06, 1).beginPath(); g.moveTo(f[0][0] + dx, f[0][1]);
      for (const [x, y] of f.slice(1)) g.lineTo(x + dx, y);
      g.strokePath();
    }
    // éclats de bois et flash
    for (const e of this.eclats) { e.x += e.vx * dt; e.y += e.vy * dt; e.vy += 900 * dt; e.a += e.r * dt; e.vie -= dt; }
    this.eclats = this.eclats.filter(e => e.vie > 0);
    for (const e of this.eclats) {
      const c = Math.cos(e.a), s = Math.sin(e.a);
      g.fillStyle(0x8a5a2b, Math.min(1, e.vie * 2)).fillPoints([{ x: e.x - c * 8, y: e.y - s * 8 }, { x: e.x + c * 8, y: e.y + s * 8 }, { x: e.x + c * 8 - s * 3, y: e.y + s * 8 + c * 3 }], true);
    }
    this.flash = Math.max(0, this.flash - dt * 4);
    if (this.flash > 0) g.fillStyle(0xffffff, this.flash * 0.6).fillRect(0, 0, LARGEUR, HAUTEUR);
    // la cible sur la porte et le poing (+)
    if (this.etat === 'toi' || (this.etat === 'remi' && this.remiAttend <= 0)) {
      const c = this.cible, zr = this.diff.zone * 200;
      g.lineStyle(4, 0xff3030, 0.95).strokeCircle(c.x, c.y, zr + 10).strokeCircle(c.x, c.y, zr * 0.5 + 4);
      g.fillStyle(0xff3030, 0.2).fillCircle(c.x, c.y, zr + 10);
      g.lineStyle(4, 0xffffff, 1).lineBetween(IMPACT.x - 16, IMPACT.y, IMPACT.x + 16, IMPACT.y).lineBetween(IMPACT.x, IMPACT.y - 16, IMPACT.x, IMPACT.y + 16);
    }
    this.ecran.setText(String(Math.round(this.compteur)).padStart(3, '0'));
    this.dessinerFrappeur(dt);
    this.dessinerVideur(dt);
    this.dessinerJauges();
  }

  dessinerFrappeur(dt) {
    if (this.dernierFrappeur !== this.frappeur) { this.dernierFrappeur = this.frappeur; this.entree = 1; }
    this.entree = Math.max(0, this.entree - dt * 3);
    for (const qui of ['remi', 'toi']) {
      const spr = this.dos[qui], c = DOS[qui], vis = this.frappeur === qui && this.etat !== 'intro';
      spr.setVisible(vis);
      if (!vis) continue;
      const pose = this.pose[qui];
      // en garde il respire ; en charge il recule et TREMBLE de plus en plus
      const ch = pose === 'charge' ? this.puissance : 0;
      const bal = pose === 'garde' ? Math.sin(this.horloge * 4) * 4 : Math.sin(this.horloge * 47) * 6 * ch;
      const x = IMPACT.x - c.poing * c.echelle - 400 * this.entree * this.entree - ch * 40;
      spr.setFrame(c.cases[pose] ?? 0).setPosition(x + bal, c.haut + ch * 10).setRotation(-0.08 * ch);
    }
  }

  dessinerVideur(dt) {
    const v = this.videur, o = this.gOmbre.clear();
    // volume de la musique selon le videur (baissée quand il approche, coupée quand il regarde)
    const voulu = this.etat === 'fin' ? 1 : v.etat === 'regarde' ? 0 : v.etat === 'annonce' || v.etat === 'repart' ? 0.35 : 1;
    this.volMusique += (voulu - this.volMusique) * Math.min(1, dt * (voulu === 0 ? 30 : 4));
    facteurMusique('remi_musique_porte', this.volMusique);
    // son OMBRE s'allonge sur le sol du couloir pendant qu'il approche
    if (v.etat === 'repart') o.fillStyle(0x000000, 0.45 * v.t / 0.6).fillEllipse(30 + 120 * v.t / 0.6, HAUTEUR - 18, 120 + 260 * v.t / 0.6, 34);   // l'ombre recule
    if (v.etat === 'annonce' || v.etat === 'regarde') {
      const k = v.etat === 'annonce' ? 1 - v.t / v.duree : 1;
      const om = (INTRUS[v.qui] || INTRUS.videur).ombre;
      o.fillStyle(0x000000, 0.45 * k).fillEllipse(30 + 120 * k * om, HAUTEUR - 18, (120 + 260 * k) * om, 34 * om);
    }
    const cible = v.etat === 'regarde' ? VIDEUR.x : -260;
    v.x += (cible - v.x) * Math.min(1, dt * 10);
    // seul l'intrus du moment est montré
    this.sprVideur.setPosition(v.qui === 'videur' || !v.qui ? v.x : -400, HAUTEUR + 10).setFrame(v.pose);
    if (this.textures.exists('remi_pisseur')) this.sprPisseur.setPosition(v.qui === 'pisseur' ? v.x : -400, HAUTEUR + 10).setFrame(v.pose);
    else this.sprPisseur.setPosition(v.qui === 'pisseur' ? v.x + 30 : -400, HAUTEUR + 60).setFrame(v.pose ? 1 : 0).setFlipX(true).setRotation(Math.sin(this.horloge * 3) * 0.06);
    const gm = this.gMamie.clear();
    if (this.sprMamie) this.sprMamie.setPosition(v.qui === 'mamie' ? v.x : -400, HAUTEUR + 10).setFrame(v.pose);
    else if (v.qui === 'mamie') this.dessinerMamie(gm, v.x, HAUTEUR, v.pose);
  }

  // la mamie dessinée au code (en attendant son image) : chignon gris, lunettes, gilet violet, canne
  dessinerMamie(g, x, bas, furieuse) {
    g.fillStyle(0x6a3a8a, 1).fillRoundedRect(x - 60, bas - 190, 120, 200, 30);                      // gilet
    g.fillStyle(0xf1c27d, 1).fillCircle(x, bas - 230, 42);                                           // tête
    g.fillStyle(0xc8c8d0, 1).fillCircle(x, bas - 278, 22).fillEllipse(x, bas - 258, 96, 34);       // chignon, cheveux
    g.lineStyle(3, 0x222222, 1).strokeCircle(x - 15, bas - 232, 10).strokeCircle(x + 15, bas - 232, 10);   // lunettes
    if (furieuse) { g.lineStyle(4, 0x222222, 1).lineBetween(x - 26, bas - 252, x - 6, bas - 244).lineBetween(x + 26, bas - 252, x + 6, bas - 244); }
    g.lineStyle(3, 0x8a3a3a, 1).lineBetween(x - 12, bas - 205, x + 12, bas - 205 + (furieuse ? 4 : -2));
    g.lineStyle(8, 0x5a3a1a, 1).lineBetween(x + 70, bas - (furieuse ? 260 : 120), x + 80, bas);      // la canne (levée si furieuse)
    g.fillStyle(0xf1c27d, 1).fillCircle(x + 70, bas - (furieuse ? 260 : 120), 12);
  }

  dessinerJauges() {
    const j = this.gJauges.clear();
    if (this.etat === 'intro') return;
    // SOLIDITÉ de la porte (en haut)
    const x0 = 400, L = 300, v = this.solidite / R.solidite;
    j.fillStyle(0x000000, 0.6).fillRect(x0 - 6, 12, L + 12, 30);
    j.fillStyle(0x3a2a1a, 1).fillRect(x0, 18, L, 18);
    j.fillStyle(v < 0.25 ? (Math.floor(this.horloge * 6) % 2 ? 0xff3030 : 0xffd84a) : 0xc89050, 1).fillRect(x0, 18, L * v, 18);
    if (!this.txtSolidite) this.txtSolidite = texte(this, x0 + L / 2, 52, 'SOLIDITÉ DE LA PORTE', 14, '#ffd84a').setDepth(901);
    this.hud.setText(this.frappeur === 'toi' ? 'À TOI' : 'À RÉMI');
    // PUISSANCE en 10 paliers (celui qui frappe)
    if (this.etat === 'toi' || this.etat === 'remi' || this.etat === 'coup') {
      const COUL = [0x3ad03a, 0x5ad03a, 0x8ad03a, 0xb8d03a, 0xe0d03a, 0xffc03a, 0xff9a3a, 0xff6a3a, 0xff3a3a, 0xff2080];
      j.fillStyle(0x000000, 0.65).fillRect(36, 166, 48, 288);
      for (let k = 0; k < 10; k++) j.fillStyle(COUL[k], this.puissance * 10 > k ? 1 : 0.18).fillRect(42, 446 - (k + 1) * 27.6 + 3, 36, 22);
    }
    // le videur arrive : « ! » rouge qui clignote, à gauche
    if (this.videur.etat === 'annonce' && Math.floor(this.horloge * 8) % 2) {
      j.fillStyle(0xff3030, 1).fillTriangle(140, 320, 200, 320, 170, 250);
      j.fillStyle(0xffffff, 1).fillRect(167, 270, 6, 30).fillRect(167, 305, 6, 7);
    }
  }
}
