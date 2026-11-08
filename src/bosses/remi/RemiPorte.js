// =====================================================================
// RÉMI — JEU 3 : « LA PORTE ET LE VIDEUR » (V11, vue de dos, la porte des WC du bar)
// Rémi parie que tu ne défonceras pas la porte avant lui. Chacun son tour :
//   MAINTENIR (le doigt n'importe où, ou ESPACE) = tu armes ton poing, la puissance monte de plus en plus vite ;
//   LÂCHER = le coup part. Dégâts = puissance x précision (la cible qui se promène sur la porte doit être sur ton poing +).
// LE VIDEUR fait sa ronde : on entend ses pas, son ombre s'allonge dans le couloir, puis il passe la tête (à gauche).
//   S'il te voit en train de charger (ou au moment du coup) : ATTRAPÉ — coup perdu.
// Une seule règle (V17) : la porte a une SOLIDITÉ commune ; quand elle CÈDE, celui qui a fait le PLUS DE DÉGÂTS gagne
// (chacun le même nombre de tours : celui qui la casse a eu un tour de plus → DERNIER COUP pour l'autre).
// V19z SIMPLE : seul le bouton L'AIR DE RIEN cache le poing (lâcher frappe TOUJOURS) ; RAGE au-delà de 100 % (bruit) ;
//   plus de pisseur, de sifflet, de culot ni de rafistolage (interrupteurs dans PORTE, reglages.js).
// V18 : TU COMMENCES (avant : toujours Rémi). (Lâcher quand quelqu'un arrive = POING CACHÉ, la charge est GARDÉE (bords
//   rouges + consigne) ; on reprend en remaintenant. Une arrivée est toujours annoncée au moins PORTE.annonceMini s.
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte, voile } from '../../core/ui.js';
import { Sauvegarde, formatTemps } from '../../core/sauvegarde.js';
import { cleRecord } from './difficulte.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique, facteurMusique } from '../../core/musique.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, PORTE as R, REPLIQUES, POINTS, RANGS } from './reglages.js';
// V19x : bouton « L'AIR DE RIEN » sous le pouce gauche
const BOUTON_RIEN = { x: 86, y: 446, r: 66 };
import { bulle, annonce, bandeauRegle, etoilesBonus, ecranPerdu, difficulteOuChoix, hasard, choisir, laisserPasserTactile, bilanDe, noterJeu } from './commun.js';

// la porte du décor illustré (remi_porte_decor.jpg, 960 x 536), zoomé x1,5 sur la porte (à droite)
const BATTANT = { x: 774, y: 147, l: 140, h: 322 };
const ZOOM = 1.5, DECOR_X = -480, DECOR_Y = -183;
const PORTE = { x: DECOR_X + BATTANT.x * ZOOM, y: DECOR_Y + BATTANT.y * ZOOM, l: BATTANT.l * ZOOM, h: BATTANT.h * ZOOM };
// V17 : le poing frappe AU MILIEU de la porte (c'est là qu'elle se casse, plus de traits vers la serrure)
const IMPACT = { x: PORTE.x + PORTE.l / 2, y: 272 };   // où le poing touche la porte (écran)
// planches de dos : cases alignées à gauche ; « poing » = où est le poing dans la case de l'impact
const DOS = {
  // V16 : planche « coups » (en pied, le poing qui écrase la porte) : poing de l'impact à x 321 / 317, y 107 dans la case
  remi: { tex: 'remi_dos', echelle: 0.8, haut: 272 - 107 * 0.8, cases: { garde: 0, charge: 0, coup: 1, frappe: 2 }, poing: 321 },
  toi: { tex: 'remi_toi_dos', echelle: 0.8, haut: 272 - 107 * 0.8, cases: { garde: 0, charge: 1, coup: 1, frappe: 2 }, poing: 317 },
};
const VIDEUR = { x: 120, echelle: 0.42 };   // l'intrus passe la tête au coin du couloir (à gauche)
// LES INTRUS (V13) : pas que le videur ! Chacun a ses pas, son ombre, son rythme et ses feintes préférées.
//  lent : x durée de l'annonce ; regard : x durée du regard ; ombre : taille ; feinte : mode préféré (en plus des autres)
const INTRUS = {
  videur: { poids: 1, nom: 'Le videur', lent: 1, regard: 1, ombre: 1, pas: ['remi_atterrit', 0.6], rythme: [0.18, 0.4], feinte: null,
    repliques: 'porteAttrape' },
  pisseur: { poids: 0,   // V19z SIMPLE : plus de pisseur (il fallait deviner QUI vient) ; remettre 0,38 pour le revoir
    nom: 'Le gars qui vient pisser', lent: 1, regard: 1.3, ombre: 1, pas: ['remi_atterrit', 0.8], rythme: [0.2, 0.65], feinte: 'fausse',
    repliques: 'porteAttrapePisseur' },
  // (V17 : la mamie est retirée à la demande de Fabien : plus que le videur, et le gars qui vient pisser pour les feintes)
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
    this.eclats = []; this.degats = 0; this.trou = this.formeTrou(); this.elan = 0; this.flash = 0; this.gel = 0; this.tremble = 0; this.entree = 1; this.dernierFrappeur = null;
    this.compteur = 0; this.coups = { toi: 0, remi: 0 }; this.attrapes = { toi: 0, remi: 0 }; this.parfaits = 0;
    this.total = { toi: 0, remi: 0 }; this.tours = { toi: 0, remi: 0 }; this.dernierTour = false; this.txtDegats = null;
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
    // le gars qui vient pisser : son image si elle existe, sinon un bourré (debout / il sursaute)
    this.sprPisseur = this.textures.exists('remi_pisseur') ? this.add.sprite(-300, HAUTEUR + 10, 'remi_pisseur', 0).setOrigin(0.5, 1).setScale(VIDEUR.echelle).setDepth(7)
      : this.add.sprite(-300, HAUTEUR + 60, 'remi_bourres', 0).setOrigin(0.5, 1).setScale(0.62).setDepth(7);
    this.gJauges = this.add.graphics().setDepth(900);
    this.ecran = texte(this, 130, 110, '000', 54, '#ff3030', { fontStyle: 'bold', stroke: '#300000', strokeThickness: 6, backgroundColor: '#100000' }).setDepth(4);
    this.hud = texte(this, 190, 28, '', 20, '#ffffff', { fontStyle: 'bold' }).setDepth(900);
    this.consigne = texte(this, LARGEUR / 2, 505, '', 24, '#ffd84a', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 12, y: 4 } }).setDepth(900).setVisible(false);
    this.touches = creerTouches(this);
    this.txtRien = texte(this, BOUTON_RIEN.x, BOUTON_RIEN.y, 'L\'AIR\nDE RIEN', 17, '#ffffff', { fontStyle: 'bold', align: 'center', stroke: '#000000', strokeThickness: 4 }).setDepth(901).setVisible(false);
    laisserPasserTactile(this);
    // la musique (Street Fighter II, Ken) : on la BAISSE quand le videur approche, on la COUPE net quand il regarde
    // (« on fait genre de rien »), elle repart quand il s'en va
    jouerMusique(this, 'remi_musique_porte'); this.volMusique = 1;
    this.events.once('shutdown', () => facteurMusique('remi_musique_porte', 1));
    // MAINTENIR = le doigt posé n'importe où (ou ESPACE)
    // V19x (retour : « je n'arrivais pas à faire semblant de rien une fois la charge commencée ») : bouton « L'AIR DE RIEN »
    // sous le pouce GAUCHE, à tout moment pendant que tu charges : poing caché, charge gardée, et tu peux lever ton doigt
    // de charge SANS frapper (avant, lâcher frappait sauf si l'arrivée était déjà annoncée). Clavier : Z.
    this.input.addPointer(1);
    this.input.on('pointerdown', (p) => {
      if (Math.hypot(p.x - BOUTON_RIEN.x, p.y - BOUTON_RIEN.y) < BOUTON_RIEN.r + 25) { if (this.frappeur === 'toi') this.rienDemande = true; else this.siffler(); return; }
      this.doigt = true; this.doigtId = p.id;
    });
    const lever = (p) => { if (p.id === this.doigtId) this.doigt = false; };
    this.input.on('pointerup', lever);
    this.input.on('pointerupoutside', lever);   // doigt lâché hors de l'écran : la charge ne reste plus bloquée

    etiquettesTactiles({ ...VIDES, espace: 'OK' });
    const t = estTactile();
    const lancer = () => difficulteOuChoix(this, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.bilan = bilanDe(this); this.debutJeu = Date.now(); this.tour('toi'); });
    if (this.donnees.bilan) {   // soirée enchaînée : un bandeau au lieu de l'écran de règles
      lancer();
      bandeauRegle(this, `Maintiens ${t ? 'le doigt' : 'ESPACE'} pour armer, lâche sur le + . Quelqu'un arrive ? ${t ? 'L\'AIR DE RIEN' : 'Z'} !`, 3.5, 'COGNE !', 'maintenir');
      return;
    }
    this.afficherIntro('RÉMI - La porte et le videur', [
      REPLIQUES.porteIntro,
      `MAINTIENS ${t ? 'le doigt' : 'ESPACE'} pour armer ton poing, LÂCHE quand la cible est sur le + : celui qui fait le PLUS DE DÉGÂTS gagne.`,
      `Quelqu'un arrive (pas, ombre, bords rouges) ? ${t ? 'L\'AIR DE RIEN (pouce gauche)' : 'Z'} : tu caches ton poing. S'il te voit charger : ATTRAPÉ !`,
      'Plus tu tiens, plus c\'est FORT... et plus ça fait de BRUIT.',
    ], () => difficulteOuChoix(this, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.bilan = bilanDe(this); this.debutJeu = Date.now(); this.tour('toi'); }));
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
    if (this.termine || (this.solidite <= 0 && !this.dernierTour)) return;
    this.tours[qui]++;
    this.frappeur = qui; this.puissance = 0; this.charge = false; this.poingCache = false; this.tCible = Math.random() * 3; this.culot = false;
    this.pose[qui] = 'garde';
    this.etat = qui;
    etiquettesTactiles(VIDES);
    if (qui === 'toi') {
      this.doigt = false;
      // V19z (bug : le toucher qui ferme les règles lançait un coup) : on attend que le doigt / ESPACE soit levé avant de charger
      this.attendreRelache = true;
      this.consigne.setVisible(true);
      annonce(this, 'À TOI !', '#7fff7f', 0.6);
    } else {
      this.consigne.setVisible(false);
      // jusqu'où Rémi va charger cette fois (un peu au hasard autour de sa « gourmandise »)
      this.remiVise = Phaser.Math.Clamp(this.diff.remiCharge + hasard(-0.12, 0.12), 0.25, this.diff.remiRage ? R.rageMax : 1);   // (CUL SEC : il fait de la RAGE)
      this.siffleUtilise = false; this.mefiant = false;
      if (R.sifflet && !this.vuSiffle) { this.vuSiffle = true; this.time.delayedCall(1300, () => bulle(this, 'Psst : SIFFLE LE VIDEUR pendant que Rémi charge... (1 fois par tour)', '#9fe0ff', 2.4, 330)); }
      this.remiAttend = hasard(0.4, 0.9) / R.remiVitesse;   // il se met en place (V19z : Rémi joue plus vite : on attend moins)
      // V20d : une fois sur deux, le videur passe PENDANT le tour de Rémi (sinon, Rémi jouant vite, il ne le croisait jamais)
      this.remiDecision = undefined; this.remiReaction = undefined;
      if (this.videur.etat === 'absent' && Math.random() < R.videurSurRemi) this.videur.t = this.remiAttend + hasard(0.1, 0.5);
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
      if (this.etat === 'toi') this.pasToi(dt); else if (this.etat === 'remi') { if (vientDAppuyer(this.touches.z)) this.siffler(); this.pasRemi(dt); }
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
    // V19y RAGE : la jauge continue au-delà de 100 % (jusqu'à R.rageMax) : plus de dégâts, mais le BRUIT attire l'intrus
    const max = this.frappeur === 'toi' || this.diff.remiRage ? R.rageMax : 1;
    this.puissance = Math.min(max, this.puissance + (R.charge + Math.min(1, this.puissance) * R.accel) * (this.puissance >= 1 ? R.rageLente : 1) * dt);
    if (avant < 1 && this.puissance >= 1 && max > 1) {
      if (R.rageExpliquee && this.frappeur === 'toi' && !this.vuRage) { this.vuRage = true; bulle(this, 'RAGE ! Encore plus fort... mais ça fait du BRUIT : on va t\'entendre !', '#ff6a3a', 2.2, 150); }
      jouerSon(this, 'remi_porte', { rate: 0.5, volume: 0.4 });
    }
    if (this.puissance > 1) this.cameras.main.shake(40, 0.0012 * this.rage());
    this.charge = true;
    this.pose[this.frappeur] = 'charge';
    if (Math.floor(this.puissance * 10) !== Math.floor(avant * 10)) jouerSon(this, 'remi_tape', { rate: 0.7 + this.puissance });
  }

  // part de RAGE du frappeur qui charge (0 = pas de rage, 1 = au maximum)
  rage() { return this.charge || this.poingCache ? Math.max(0, (this.puissance - 1) / (R.rageMax - 1)) : 0; }

  pasToi(dt) {
    const tenu = this.doigt || this.touches.espace.isDown;
    const danger = this.videur.etat === 'annonce' || this.videur.etat === 'regarde';
    const maintiens = estTactile() ? 'REMETS le doigt' : 'REMAINTIENS ESPACE';
    if (vientDAppuyer(this.touches.z)) this.rienDemande = true;   // (pendant le tour de Rémi, Z = SIFFLE : voir update)
    if (this.rienDemande) { this.rienDemande = false; if (this.charge) { this.faireGenre('toi'); this.attendreRelache = true; } }
    if (this.attendreRelache) { if (!tenu) this.attendreRelache = false; }   // poing caché : lever le doigt ne frappe pas
    else if (tenu) { this.poingCache = false; this.charger(dt); }
    else if (this.charge && danger && R.lacherCache) { this.faireGenre('toi'); }   // (V18 : lâcher = cacher ; V19z SIMPLE : non, seul L'AIR DE RIEN cache, lâcher FRAPPE toujours)
    else if (this.charge) { this.frapper('toi'); return; }
    const pc = Math.round(this.puissance * 100);
    this.consigne.setColor(this.charge && danger ? '#ff5a5a' : this.poingCache ? '#9fe0ff' : '#ffd84a');
    this.consigne.setText(this.charge && danger ? 'QUELQU\'UN ARRIVE !  L\'AIR DE RIEN !'
      : this.poingCache && danger ? `POING CACHÉ (${pc} % gardés)  -  attends qu'il reparte...`
      : this.poingCache ? `VOIE LIBRE !  ${maintiens} : tu repars de ${pc} %`
      : this.charge && this.puissance > 1 ? `RAGE ${pc} % !  ça fait du BRUIT...  LÂCHE sur le +`
      : this.charge ? `PUISSANCE ${pc} %  -  LÂCHE sur le +   (L'AIR DE RIEN = cacher)`
      : `${estTactile() ? 'MAINTIENS le doigt' : 'MAINTIENS ESPACE'} pour charger... gare à qui arrive !`);
  }

  pasRemi(dt) {
    if (this.remiAttend > 0) { this.remiAttend -= dt; return; }
    // V20d (retour : « Rémi ne se fait jamais prendre ») : à chaque passage pendant son tour, Rémi décide (après un temps
    // de réaction) : PRUDENT (il cache son poing / n'ose pas commencer) ou GOURMAND (il insiste ET charge encore plus fort)
    const present = this.videur.etat !== 'absent';
    if (!present) this.remiDecision = undefined;
    if (present && this.remiDecision === undefined) {
      this.remiReaction = (this.remiReaction ?? hasard(0.25, 0.6)) - dt;
      if (this.remiReaction <= 0) {
        this.remiReaction = undefined;
        this.remiDecision = Math.random() < this.diff.remiPrudent ? 'prudent' : 'gourmand';
        if (this.remiDecision === 'gourmand') {
          this.remiVise = Math.min(this.diff.remiRage ? R.rageMax : 1.15, this.remiVise + R.remiInsiste);
          bulle(this, choisir(['Rémi : « Il me voit pas, lui... »', 'Rémi : « Encore un peu... »', 'Rémi : « Tranquille, il regarde ailleurs. »']), '#ffd84a', 1.2, 80);
        }
      } else if (this.puissance === 0) return;   // (il hésite : il ne commence pas pendant qu'il réfléchit)
    }
    if (this.remiDecision === 'prudent') { if (this.charge) this.faireGenre('remi'); return; }
    this.poingCache = false;
    this.charger(dt * 0.8 * R.remiVitesse);
    // il lâche quand la cible passe près de son poing, une fois assez chargé
    const d = Math.hypot(this.cible.x - IMPACT.x, this.cible.y - IMPACT.y);
    // V19y : en DIABOLO / PANACHÉ, il frappe dès sa gourmandise atteinte (sans attendre la cible) ; sinon il attend la cible
    if (this.puissance >= this.remiVise && (!this.diff.remiAttend || d < 40 || this.puissance >= Math.max(1, this.remiVise))) this.frapper('remi');
  }

  // V19y SIFFLE LE VIDEUR (pendant le tour de Rémi, 1 fois par tour) : le videur arrive tout de suite. Si Rémi charge
  // quand il regarde : RÉMI ATTRAPÉ. Mais il se MÉFIE de toi : à ton tour suivant, il s'annonce moins longtemps.
  siffler() {
    const v = this.videur;
    if (!R.sifflet || this.frappeur !== 'remi' || this.etat !== 'remi' || this.siffleUtilise || v.etat !== 'absent') return;
    this.siffleUtilise = true; this.mefiant = true;
    v.siffle = true; v.t = 0; v.retourPrevu = false;
    jouerSon(this, 'remi_sonnette', { rate: 1.6, volume: 0.6 });
    bulle(this, '*siffle le videur*  « Psssst ! Par ici ! »', '#9fe0ff', 1.2, 330);
  }

  // FAIRE GENRE DE RIEN (V17, choix de Fabien) : on baisse le poing sans frapper, le tour continue
  // V18 (retour : « pas clair ») : le poing est CACHÉ, la charge est GARDÉE ; on repart de là quand la voie est libre
  faireGenre(qui) {
    this.charge = false; this.poingCache = true; this.pose[qui] = 'garde';
    this.puissance *= R.cacheGarde;   // V19y : cacher son poing coûte (on ne garde que R.cacheGarde de la charge)
    // V20e : une des 2 poses « l'air de rien » (images), la bulle va avec
    this.poseRien = Math.random() < 0.5 ? 0 : 1;
    const geste = this.poseRien === 0 ? '*sifflote*' : '*se gratte la nuque*';
    if (qui === 'toi') bulle(this, geste, '#cccccc', 0.9, 330);
    else bulle(this, `Rémi : ${geste}`, '#ffd84a', 0.9, 80);
  }

  // ---------- le videur ----------
  // LE VIDEUR ET SES FEINTES (V12) : à chaque passage, il choisit une façon de venir (plus de feintes en CHAMPION) :
  //  normal   : ses pas, son ombre, le « ! »… puis il regarde (annonce de durée VARIABLE, pas toujours au même rythme)
  //  fausse   : il approche… et fait DEMI-TOUR (ceux qui ont lâché trop tôt ont gâché leur charge)
  //  surprise : presque pas d'annonce (un seul pas), il surgit
  //  retour   : après avoir regardé, il repart… et revient aussitôt jeter un 2e coup d'œil
  pasVideur(dt) {
    const v = this.videur;
    v.t -= dt * (v.etat === 'absent' ? 1 + R.rageBruit * this.rage() : 1);   // la RAGE fait du bruit : il arrive plus vite
    if (v.etat === 'absent' && v.t <= 0) {
      // QUI vient ? (sauf un 2e coup d'œil : c'est le même)
      if (!v.retourPrevu) { let r0 = Math.random(); v.qui = 'videur'; for (const [n, i] of Object.entries(INTRUS)) { r0 -= i.poids; if (r0 <= 0) { v.qui = n; break; } } }
      const I = INTRUS[v.qui];
      const f = this.diff.feintes, r = Math.random();
      v.mode = v.retourPrevu ? 'retour' : I.feinte && Math.random() < f * 0.6 ? I.feinte : r < f * 0.45 ? 'fausse' : r < f * 0.8 && R.feintesToutes ? 'surprise' : 'normal';   // (V19z SIMPLE : seule la fausse alerte)
      v.retourPrevu = false;
      const base = R.videurAnnonce * this.diff.videur * I.lent;
      // V18 (retour : « pas le temps de réagir ») : jamais moins de R.annonceMini (avant : 0,3 s en surprise, 0,4 s au retour)
      v.duree = v.mode === 'surprise' || v.mode === 'retour' ? R.annonceMini : Math.max(R.annonceMini, base * hasard(0.7, 1.3));
      // V19y : SIFFLÉ par toi : c'est le videur, il arrive tout de suite (annonce courte) ; MÉFIANT (ton tour après un
      // coup de sifflet) ou RAGE : il s'annonce moins longtemps (jamais moins de R.annonceRage)
      if (v.siffle) { v.qui = 'videur'; v.mode = 'normal'; v.duree = R.siffleAnnonce; }
      else {
        const court = (this.frappeur === 'toi' && this.mefiant ? R.mefiantAnnonce : 1) * (1 - 0.5 * this.rage());
        if (court < 1) v.duree = Math.max(R.annonceRage, v.duree * court);
      }
      if (this.frappeur === 'toi' && !this.vuAnnonce) { this.vuAnnonce = true; bulle(this, 'Quelqu\'un arrive ! Vite : L\'AIR DE RIEN !', '#ff9a9a', 2, 150); }
      v.etat = 'annonce'; v.t = v.duree; v.pas = 0;
      v.rythme = v.mode === 'surprise' || v.mode === 'retour' ? 0.12 : hasard(I.rythme[0], I.rythme[1]) * (v.qui === 'pisseur' ? R.pisseurTraine : 1);   // (V19y : le pisseur traîne les pieds)
      v.hips = v.qui === 'pisseur' && Math.random() < 0.5;   // ... et parfois il a le hoquet en arrivant : un indice à écouter   // pressé : pas rapides   // ses pas plus ou moins rapides
      v.demiTour = v.mode === 'fausse' ? v.duree * hasard(0.45, 0.8) : -1;
    } else if (v.etat === 'annonce') {
      v.pas -= dt;
      // FEINTE : tant qu'il n'est pas là, TOUT LE MONDE fait le même bruit et la même ombre : impossible de savoir
      // si c'est le videur... ou juste le gars qui vient pisser (qui, lui, s'en fiche)
      if (v.pas <= 0) { v.pas = v.rythme; jouerSon(this, 'remi_atterrit', { rate: 0.6 }); }
      if (v.hips && v.duree - v.t > v.duree * 0.4) { v.hips = false; jouerSon(this, 'remi_hips', { volume: 0.6 }); }
      // fausse alerte : il fait demi-tour avant d'arriver
      if (v.demiTour > 0 && v.duree - v.t >= v.demiTour) { v.etat = 'repart'; v.t = 0.6; return; }
      if (v.t <= 0) {
        v.etat = 'regarde'; v.t = hasard(R.videurRegard[0], R.videurRegard[1]) * INTRUS[v.qui].regard * (v.mode === 'retour' ? 0.6 : 1);
        v.pose = 0; v.vu = false; jouerSon(this, 'remi_scratch');
        // ... et on découvre QUI c'est : le gars qui vient pisser s'en fiche (on aurait pu continuer !),
        // le videur, lui, ne rate rien
        if (v.qui === 'pisseur') { bulle(this, 'Le gars : « Pardon, pardon... URGENCE ! » (il s\'en fiche : continue !)', '#9fe0ff', 1.6, 150); this.time.delayedCall(300, () => jouerSon(this, 'remi_hips')); }
      }
    } else if (v.etat === 'repart') {
      v.pas -= dt;
      if (v.pas <= 0) { v.pas = 0.35; jouerSon(this, 'remi_atterrit', { rate: 0.5, volume: 0.5 }); }
      if (v.t <= 0) { v.etat = 'absent'; v.t = hasard(0.5, 1.5) * this.diff.videur; }
    } else if (v.etat === 'regarde') {
      // il regarde : celui qui charge (ou qui vient juste de frapper) se fait ATTRAPER
      let fautif = (this.etat === 'toi' || this.etat === 'remi') && this.charge ? this.frappeur
        : this.etat === 'coup' && this.tCoup < 0.25 ? this.frappeur : null;
      if (v.qui === 'pisseur') {                                                                // trop pressé pour regarder
        if (fautif === 'toi' && this.charge && !this.culot) { this.culot = true; bulle(this, `CULOT ! +${Math.round((R.culot - 1) * 100)} % sur ce coup`, '#7fff7f', 1.2, 330); }
        fautif = null;
      }
      if (fautif && !v.vu) this.attraper(fautif);
      if (v.t <= 0) {
        v.etat = 'absent'; v.pose = 0; v.siffle = false;
        // le coup du 2e coup d'œil : il revient tout de suite
        v.retourPrevu = R.feintesToutes && v.mode !== 'retour' && Math.random() < this.diff.feintes * 0.5;
        v.t = v.retourPrevu ? hasard(0.4, 0.8) : hasard(R.videurAttente[0], R.videurAttente[1]) * this.diff.videur;
      }
    }
  }

  attraper(qui) {
    // (BUG corrigé V17 : attrapé juste après le coup qui fait céder la porte → le « rafistolage » la remettait debout
    //  et un nouveau tour repartait derrière l'écran de victoire)
    if (this.etat === 'fin' || (this.solidite <= 0 && !this.dernierTour)) return;
    const v = this.videur;
    v.vu = true; v.pose = 1; v.t = Math.max(v.t, 1.3);
    this.attrapes[qui]++;
    // V17 (demande de Fabien) : attrapé au moment du coup = le coup est ANNULÉ (dégâts rendus, coup parfait pas compté)
    const c = this.coupEnCours;
    if (this.etat === 'coup' && c && c.qui === qui) {
      this.total[qui] -= c.score;
      if (!this.dernierTour) this.solidite = Math.min(R.solidite, this.solidite + c.score);
      if (c.parfait) this.parfaits = Math.max(0, this.parfaits - 1);
      this.tweens.killTweensOf(this); this.compteur = 0;   // (l'afficheur retombe à 000)
    }
    this.coupEnCours = null;
    if (!this.dernierTour) this.solidite = Math.min(R.solidite, this.solidite + R.scotch);   // le barman rafistole la porte
    jouerSon(this, 'remi_porte', { rate: 0.6 });
    this.cameras.main.shake(200, 0.006);
    annonce(this, qui === 'toi' ? 'ATTRAPÉ !' : 'RÉMI ATTRAPÉ !', qui === 'toi' ? '#ff5a5a' : '#7fff7f', 1);
    const I = INTRUS[v.qui] || INTRUS.videur;
    bulle(this, `${I.nom} : « ${choisir(REPLIQUES[I.repliques])} »`, '#ffb070', 1.8, 150);
    this.time.delayedCall(500, () => bulle(this, R.scotch ? `Coup ANNULÉ, et le barman rafistole la porte (+${R.scotch})` : 'Coup ANNULÉ !', '#ffffff', 1.4, 330));
    if (qui === 'remi') this.time.delayedCall(900, () => bulle(this, 'Rémi : « Mais... j\'ai rien fait ! »', '#ffd84a', 1.2, 80));
    this.etat = 'pause'; this.puissance = 0; this.charge = false; this.pose[qui] = 'garde';
    this.consigne.setVisible(false);
    this.time.delayedCall(1800, () => this.dernierTour ? this.finir() : this.tour(qui === 'toi' ? 'remi' : 'toi'));
  }

  // la porte a cédé (et chacun a eu ses tours) : celui qui a fait le PLUS DE DÉGÂTS gagne
  finir() {
    if (this.etat === 'fin') return;
    this.porteCede(this.total.toi >= this.total.remi ? 'toi' : 'remi');
  }

  // ---------- le coup ----------
  frapper(qui) {
    const d = Math.hypot(this.cible.x - IMPACT.x, this.cible.y - IMPACT.y), zr = this.diff.zone * 200;
    const precision = qui === 'remi' ? hasard(this.diff.remiPrecis ?? 0.5, 0.95) :   // (V17 : Rémi un peu moins précis, avant 0,65-1)
      d <= zr ? 1 : Math.max(0.2, 1 - (d - zr) / 130);
    // V19y : la précision compte plus (R.precisionBase) ; la RAGE dépasse 999 ; CULOT devant le pisseur = bonus
    const score = Math.round(999 * (R.degatsMin + (1 - R.degatsMin) * this.puissance) * (R.precisionBase + (1 - R.precisionBase) * precision) * (qui === 'toi' && this.culot ? R.culot : 1));
    if (qui === 'toi') this.culot = false;
    this.etat = 'coup'; this.tCoup = 0; this.charge = false; this.consigne.setVisible(false);
    this.coups[qui]++;
    this.coupEnCours = { qui, score: 0, parfait: qui === 'toi' && precision === 1 && this.puissance > 0.9 };
    if (qui === 'toi' && precision === 1 && this.puissance > 0.9) { this.parfaits++; bulle(this, 'COUP PARFAIT !', '#ffd84a', 1, 150); jouerSon(this, 'remi_foule'); }
    else if (qui === 'toi' && precision === 1) { annonce(this, 'PILE DESSUS !', '#7fff7f', 0.6); jouerSon(this, 'remi_foule', { volume: 0.5 }); this.cameras.main.flash(120, 255, 255, 255); }
    this.pose[qui] = 'coup';
    // (V17 : attrapé avant que le poing touche → pas d'impact du tout)
    this.time.delayedCall(90, () => { if (this.etat !== 'coup') return; this.pose[qui] = 'frappe'; this.impact(qui, score); });
    this.time.delayedCall(550, () => { this.pose[qui] = 'garde'; });
  }

  impact(qui, score) {
    // LE COUP SE VOIT (V15) : le frappeur plonge en avant, une bulle de BD « BAM ! » éclate sur la porte, le bois garde un CREUX
    this.elan = 0.18;
    this.bulleBD(score);
    // V19x (bug trouvé par l'avis plaisir) : le coup qui CASSE la porte compte EN ENTIER, comme le dernier coup de l'autre
    // (avant : seulement la solidité restante, parfois 19 points → celui qui cassait la porte perdait presque toujours)
    const effectif = score;
    if (this.coupEnCours && this.coupEnCours.qui === qui) this.coupEnCours.score = effectif;
    this.total[qui] += effectif;
    this.solidite = Math.max(0, this.solidite - score);
    this.gel = 0.06 + score / 999 * 0.1;
    this.tremble = score / 999;
    this.cameras.main.shake(160 + score / 4, 0.004 + score / 999 * 0.014);
    jouerSon(this, score >= R.casse ? 'remi_porte_fort' : 'remi_porte');
    // la porte se BOMBE puis revient
    this.tweens.add({ targets: this.battant, scaleX: ZOOM * (1 - 0.06 * score / 999), scaleY: ZOOM * (1 + 0.03 * score / 999), duration: 70, yoyo: true });
    for (let k = 0; k < Math.floor(score / 60); k++) this.eclats.push({ x: IMPACT.x, y: IMPACT.y, vx: hasard(-260, 260), vy: hasard(-380, 80), r: hasard(-6, 6), a: 0, vie: hasard(0.5, 1) });
    if (score >= R.casse) this.flash = 1;
    this.compteur = 0; this.tweens.add({ targets: this, compteur: score, duration: 600, ease: 'Cubic.Out' });
    const pop = texte(this, IMPACT.x, IMPACT.y - 100, String(score), 30 + score / 25, score >= R.casse ? '#ffd84a' : '#ffffff', { fontStyle: 'bold italic', strokeThickness: 8 }).setDepth(950);
    this.tweens.add({ targets: pop, y: IMPACT.y - 170, alpha: 0, scale: 1.3, duration: 1000, delay: 200, onComplete: () => pop.destroy() });
    if (this.dernierTour) { this.time.delayedCall(900, () => this.finir()); return; }
    if (this.solidite <= 0) {
      // celui qui la casse a eu un tour de plus que l'autre → DERNIER COUP pour l'autre (V18 : toi tu commences, donc
      // c'est en général Rémi qui a le dernier coup ; avant, Rémi commençait toujours)
      const autre = qui === 'toi' ? 'remi' : 'toi';
      if (this.tours[autre] < this.tours[qui]) {
        this.dernierTour = true;
        this.time.delayedCall(700, () => {
          annonce(this, autre === 'toi' ? 'DERNIER COUP !' : 'DERNIER COUP DE RÉMI', '#ffd84a', 1);
          bulle(this, `La porte est cassée... ${autre === 'toi' ? 'mais il te reste un coup' : 'mais Rémi a encore un coup'} : TOI ${this.total.toi} - ${this.total.remi} RÉMI`, '#ffffff', 2, 330);
        });
        this.time.delayedCall(1700, () => this.tour(autre));
        return;
      }
      this.time.delayedCall(700, () => this.finir()); return;
    }
    if (this.solidite < R.solidite * 0.25 && !this.alerte) { this.alerte = true; this.time.delayedCall(800, () => bulle(this, 'La porte ne tient plus qu\'à un fil !', '#ff9a5a', 1.6, 200)); }
    this.time.delayedCall(1300, () => { if (this.etat === 'coup') this.tour(qui === 'toi' ? 'remi' : 'toi'); });
  }

  // bulle de bande dessinée sur la porte : étoile jaune + « BAM ! » (« KRAK ! » pour un gros coup)
  bulleBD(score) {
    const fort = score >= R.casse, k = 0.6 + score / 999 * 0.7;
    const gb = this.add.graphics().setDepth(940).setPosition(IMPACT.x, IMPACT.y);
    const pts = [];
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = (i % 2 ? 38 : 70) * k; pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8 }); }
    gb.fillStyle(0x000000, 1).fillPoints(pts.map(p => ({ x: p.x * 1.08, y: p.y * 1.08 })), true);
    gb.fillStyle(fort ? 0xff4020 : 0xffd84a, 1).fillPoints(pts, true);
    const t = texte(this, IMPACT.x, IMPACT.y, fort ? 'KRAK !' : choisir(['BAM !', 'POW !', 'BOUM !']), 30 * k + 6, fort ? '#ffffff' : '#c81e2a', { fontStyle: 'bold italic', stroke: '#000000', strokeThickness: 5 }).setDepth(941).setAngle(hasard(-12, 12));
    gb.setScale(0.3); t.setScale(0.3);
    this.tweens.add({ targets: [gb, t], scale: 1, duration: 90, ease: 'Back.Out' });
    this.tweens.add({ targets: [gb, t], alpha: 0, delay: 450, duration: 200, onComplete: () => { gb.destroy(); t.destroy(); } });
  }

  // le TROU au milieu de la porte (V17) : une forme déchiquetée tirée une fois, qui grandit avec les dégâts
  formeTrou() {
    const n = 22, bords = [], echardes = [], fentes = [];
    for (let i = 0; i < n; i++) bords.push(hasard(0.7, 1.15) * (i % 2 ? 0.82 : 1));
    for (let i = 0; i < 9; i++) echardes.push({ a: Math.random() * Math.PI * 2, l: hasard(0.25, 0.55), w: hasard(0.12, 0.22) });
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + hasard(-0.3, 0.3), pts = [];
      for (let k = 0; k <= 3; k++) pts.push([a + hasard(-0.2, 0.2), k / 3]);
      fentes.push(pts);
    }
    return { bords, echardes, fentes };
  }

  dessinerTrou(g, dx) {
    const d = this.degats;
    if (d <= 0.01) return;
    const cx = IMPACT.x + dx, cy = IMPACT.y, R0 = 10 + d * 72, n = this.trou.bords.length;
    const pt = (a, r) => ({ x: cx + Math.cos(a) * r * Math.min(1, (PORTE.l / 2 - 6) / (R0 * 1.25)), y: cy + Math.sin(a) * r * 1.3 });
    const contour = k => this.trou.bords.map((b, i) => pt(i / n * Math.PI * 2, R0 * b * k));
    // le bois enfoncé autour (plus sombre), le bois cassé (clair) puis le trou noir
    g.fillStyle(0x2a1608, 0.55).fillPoints(contour(1.45), true);
    g.fillStyle(0xd9a866, 1).fillPoints(contour(1.12), true);
    g.fillStyle(0x070403, 1).fillPoints(contour(1), true);
    // échardes qui pointent vers l'intérieur du trou
    g.fillStyle(0xc89050, 1);
    for (const e of this.trou.echardes) g.fillTriangle(pt(e.a - e.w, R0 * 1.05).x, pt(e.a - e.w, R0 * 1.05).y, pt(e.a + e.w, R0 * 1.05).x, pt(e.a + e.w, R0 * 1.05).y, pt(e.a, R0 * (1 - e.l)).x, pt(e.a, R0 * (1 - e.l)).y);
    // quelques fentes COURTES qui partent du trou (pas jusqu'au bord de la porte)
    g.lineStyle(3, 0x1a0e06, 1);
    for (const f of this.trou.fentes) {
      g.beginPath();
      f.forEach(([a, k], i) => { const p = pt(a, R0 * 1.1 + k * (8 + d * 30)); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); });
      g.strokePath();
    }
  }

  porteCede(qui) {
    this.etat = 'fin';
    jouerSon(this, 'remi_porte_fort'); jouerSon(this, 'remi_foule');
    this.cameras.main.shake(500, 0.02);
    this.tweens.add({ targets: this.battant, x: PORTE.x + PORTE.l, scaleX: 0.1, duration: 260, ease: 'Cubic.In' });
    this.degats = 0;
    if (qui === 'toi') {
      noterJeu(this, 'porte', POINTS.porteGagne + this.parfaits * POINTS.porteParfait - this.attrapes.toi * POINTS.porteAttrape
        + (this.total.toi - this.total.remi) * POINTS.porteEcart, { attrapes: this.attrapes.toi, parfaits: this.parfaits });
      annonce(this, 'LA PORTE CÈDE !', '#ffd84a', 1.4);
      bulle(this, `Dégâts : TOI ${this.total.toi} - ${this.total.remi} RÉMI`, '#7fff7f', 1.6, 330);
      this.time.delayedCall(1800, () => this.victoire(REPLIQUES.porteGagne));
    } else {
      annonce(this, 'RÉMI A TAPÉ PLUS FORT', '#ff5a5a', 1.4);
      this.time.delayedCall(1800, () => ecranPerdu(this, 'RÉMI A TAPÉ PLUS FORT', `${REPLIQUES.portePerdu}\nDégâts : TOI ${this.total.toi} - ${this.total.remi} RÉMI`, this.nomDiff));
    }
  }

  // ---------- fin de la soirée (V17) : points des 3 jeux, RANG et record (soirée complète seulement) ----------
  ecranVictoire(message) {
    const P = 1000, b = this.bilan || { temps: 0 }, cx = LARGEUR / 2;
    const complet = b.velo !== undefined && b.baby !== undefined && b.porte !== undefined;
    const total = (b.velo || 0) + (b.baby || 0) + (b.porte || 0);
    voile(this, 0.9).setDepth(P);
    const titre = texte(this, cx, 52, 'VICTOIRE !', 54, '#ffd84a', { fontStyle: 'bold italic', strokeThickness: 8 }).setDepth(P + 1).setScale(2.5).setAlpha(0);
    this.tweens.add({ targets: titre, scale: 1, alpha: 1, duration: 300, ease: 'Back.Out' });
    texte(this, cx, 102, message, 18, '#ffffff', { wordWrap: { width: 820 } }).setDepth(P + 1);
    const badge = this.add.image(150, 250, 'badge_' + this.identite.id).setDepth(P + 1).setScale(0);
    this.tweens.add({ targets: badge, scale: 2, delay: 300, duration: 300, ease: 'Back.Out' });
    texte(this, 150, 310, 'Badge Rémi !', 18, '#ffd84a').setDepth(P + 1);
    // les points, ligne par ligne
    const lignes = [['VÉLO', b.velo], ['BABYFOOT', b.baby], ['PORTE', b.porte], ['TOTAL', complet ? total : undefined]];
    lignes.forEach(([nom, pts], n) => this.time.delayedCall(400 + n * 350, () => {
      const y = 160 + n * 44, fort = nom === 'TOTAL';
      texte(this, cx + 40, y, nom, fort ? 28 : 24, fort ? '#ffd84a' : '#ff9a5a').setOrigin(1, 0.5).setDepth(P + 1);
      texte(this, cx + 70, y, pts === undefined ? '—' : `${pts} pts`, fort ? 28 : 24, '#ffffff').setOrigin(0, 0.5).setDepth(P + 1);
      jouerSon(this, 'remi_pinte');
    }));
    this.time.delayedCall(400 + lignes.length * 350, () => {
      if (!complet) {
        texte(this, cx + 60, 360, 'Joue la SOIRÉE COMPLÈTE (vélo, babyfoot, porte)\npour avoir un RANG et un record.', 18, '#aaaaaa', { align: 'center' }).setDepth(P + 1);
        return;
      }
      const r = RANGS.find(x => total >= x.seuil);
      const record = Sauvegarde.proposerRecord(cleRecord(IDENTITE.id, this.nomDiff), r.rang, b.temps, RANGS.map(x => x.rang));
      const nouveau = record.rang === r.rang && Math.abs(record.temps - b.temps) < 0.01;
      const lettre = texte(this, 150, 430, r.rang, 90, '#ffffff', { fontStyle: 'bold', stroke: '#e8742a', strokeThickness: 12 }).setDepth(P + 2).setScale(0);
      this.tweens.add({ targets: lettre, scale: 1, duration: 300, ease: 'Back.Out', onComplete: () => this.cameras.main.shake(200, 0.008) });
      texte(this, 150, 368, 'RANG', 20, '#ffd84a').setDepth(P + 1);
      texte(this, cx + 60, 362, r.nom, 30, '#ffd84a', { fontStyle: 'bold' }).setDepth(P + 1);
      const d = this.diff || {};
      texte(this, cx + 60, 400, `${d.nom || ''}   -   temps de jeu ${formatTemps(b.temps)}`, 18, d.couleur || '#ffffff').setDepth(P + 1);
      texte(this, cx + 60, 430, nouveau ? '★ NOUVEAU RECORD ★' : `Record : rang ${record.rang} en ${formatTemps(record.temps)}`, 18, nouveau ? '#7fff7f' : '#aaaaaa').setDepth(P + 1);
      const suivant = RANGS[RANGS.indexOf(r) - 1];
      if (suivant) texte(this, cx + 60, 460, `Rang ${suivant.rang} (${suivant.nom}) à ${suivant.seuil} pts`, 15, '#9fe0ff').setDepth(P + 1);
      const etoiles = etoilesBonus(b);
      if (etoiles.length) texte(this, cx + 60, 490, etoiles.map(t => '★ ' + t).join('     '), 17, '#ffd84a').setDepth(P + 1);
      jouerSon(this, 'remi_foule');
    });
    texte(this, cx, HAUTEUR - 22, `${estTactile() ? 'OK' : 'ESPACE'} : retour au hub`, 18, '#aaaaaa').setDepth(P + 1);
  }

  // ---------- dessin ----------
  dessiner(dt) {
    if (this.etat === 'coup') this.tCoup += dt;
    this.tremble = Math.max(0, this.tremble - dt * 2.5);
    const g = this.gPorte.clear();
    const dx = Math.sin(this.horloge * 60) * this.tremble * 5;
    if (this.etat !== 'fin') this.battant.x = PORTE.x + PORTE.l / 2 + dx;
    this.elan = Math.max(0, this.elan - dt);
    // le TROU au milieu : il suit les dégâts (et rétrécit quand le barman rafistole)
    if (this.etat !== 'fin') { const cible = 1 - this.solidite / R.solidite; this.degats += (cible - this.degats) * Math.min(1, dt * 12); }
    this.dessinerTrou(g, dx);
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
      // au moment du coup : il plonge vers la porte (élan) et grossit un peu (il se rapproche de nous)
      const pl = pose === 'frappe' ? Math.min(1, this.elan / 0.18) : 0;
      // V20e : poing caché = la pose « l'air de rien » (si les images sont là)
      const rien = this.poingCache && this.textures.exists(c.tex + '_rien');
      if (rien) spr.setTexture(c.tex + '_rien', this.poseRien || 0); else if (spr.texture.key !== c.tex) spr.setTexture(c.tex, 0);
      if (!rien) spr.setFrame(c.cases[pose] ?? 0);
      spr.setPosition(x + bal + pl * 30, c.haut + ch * 10 - pl * 8).setRotation(-0.08 * ch + pl * 0.05)
        .setScale(c.echelle * (1 + pl * 0.06));
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
    // V19y : sifflé ou méfiant, il fait le geste « je te surveille » (V vers ses yeux) au lieu de son air distrait
    // (V19z : il prend aussi cette pose quand celui qui charge est en RAGE : il a entendu le bruit)
    const mef = v.pose === 0 && (v.siffle || (this.mefiant && this.frappeur === 'toi') || (this.charge && this.puissance > 1)) && this.textures.exists('remi_videur_mefiant');
    if (mef) this.sprVideur.setTexture('remi_videur_mefiant', 0); else this.sprVideur.setTexture('remi_videur', v.pose);
    this.sprVideur.setPosition(v.qui === 'videur' || !v.qui ? v.x : -400, HAUTEUR + 10);
    if (this.textures.exists('remi_pisseur')) this.sprPisseur.setPosition(v.qui === 'pisseur' ? v.x : -400, HAUTEUR + 10).setFrame(v.pose);
    else this.sprPisseur.setPosition(v.qui === 'pisseur' ? v.x + 30 : -400, HAUTEUR + 60).setFrame(v.pose ? 1 : 0).setFlipX(true).setRotation(Math.sin(this.horloge * 3) * 0.06);
  }

  dessinerJauges() {
    const j = this.gJauges.clear();
    if (this.etat === 'intro') return;
    // le bouton « L'AIR DE RIEN » (ton tour seulement ; il s'allume quand tu charges)
    const rien = (this.frappeur === 'toi' || (R.sifflet && this.etat === 'remi')) && this.etat !== 'fin' && this.etat !== 'pause';
    this.txtRien.setVisible(rien);
    if (rien && this.frappeur === 'remi') {   // pendant le tour de Rémi : SIFFLE ! (1 fois)
      const b = BOUTON_RIEN, dispo = !this.siffleUtilise && this.videur.etat === 'absent';
      j.fillStyle(0x000000, 0.5).fillCircle(b.x, b.y, b.r);
      j.fillStyle(0xffd84a, dispo ? 0.35 + 0.15 * Math.sin(this.horloge * 6) : 0.08).fillCircle(b.x, b.y, b.r - 6);
      j.lineStyle(4, 0xffd84a, dispo ? 1 : 0.3).strokeCircle(b.x, b.y, b.r);
      this.txtRien.setText('SIFFLE\nLE VIDEUR').setAlpha(dispo ? 1 : 0.4);
    } else if (rien) {
      this.txtRien.setText('L\'AIR\nDE RIEN');
      const b = BOUTON_RIEN, actif = this.charge, cache = this.poingCache;
      j.fillStyle(0x000000, 0.5).fillCircle(b.x, b.y, b.r);
      j.fillStyle(cache ? 0x9fe0ff : 0x7fc4ff, actif ? 0.45 + 0.2 * Math.sin(this.horloge * 8) : cache ? 0.35 : 0.12).fillCircle(b.x, b.y, b.r - 6);
      j.lineStyle(4, 0x9fe0ff, actif ? 1 : 0.5).strokeCircle(b.x, b.y, b.r);
      this.txtRien.setAlpha(actif || cache ? 1 : 0.5);
    }
    // SOLIDITÉ de la porte (en haut)
    const x0 = 400, L = 300, v = this.solidite / R.solidite;
    j.fillStyle(0x000000, 0.6).fillRect(x0 - 6, 12, L + 12, 30);
    j.fillStyle(0x3a2a1a, 1).fillRect(x0, 18, L, 18);
    j.fillStyle(v < 0.25 ? (Math.floor(this.horloge * 6) % 2 ? 0xff3030 : 0xffd84a) : 0xc89050, 1).fillRect(x0, 18, L * v, 18);
    if (!this.txtSolidite) this.txtSolidite = texte(this, x0 + L / 2, 52, 'SOLIDITÉ DE LA PORTE', 17, '#ffd84a').setDepth(901);
    // V17 : qui MÈNE aux dégâts (c'est ça qui fait gagner)
    if (!this.txtDegats) this.txtDegats = texte(this, x0 + L / 2, 76, '', 18, '#ffffff', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 8, y: 2 } }).setDepth(901);
    const t = this.total;
    this.txtDegats.setText(`TOI ${t.toi}  ${t.toi > t.remi ? '▲' : t.toi < t.remi ? '▼' : '='}  ${t.remi} RÉMI`).setColor(t.toi >= t.remi ? '#7fff7f' : '#ff7a7a');
    this.hud.setText(this.frappeur === 'toi' ? 'À TOI' : 'À RÉMI');
    // PUISSANCE en 10 paliers (celui qui frappe)
    if (this.etat === 'toi' || this.etat === 'remi' || this.etat === 'coup') {
      const COUL = [0x3ad03a, 0x5ad03a, 0x8ad03a, 0xb8d03a, 0xe0d03a, 0xffc03a, 0xff9a3a, 0xff6a3a, 0xff3a3a, 0xff2080];
      // (à DROITE, contre le bord de l'écran : elle ne cache plus les intrus qui arrivent à gauche)
      const xj = LARGEUR - 46;
      j.fillStyle(0x000000, 0.65).fillRect(xj - 6, 136, 40, 288);
      for (let k = 0; k < 10; k++) j.fillStyle(COUL[k], this.puissance * 10 > k ? 1 : 0.18).fillRect(xj - 1, 416 - (k + 1) * 27.6 + 3, 30, 22);
      // V19y : la RAGE (au-delà de 100 %) : 3 paliers rouges qui clignotent au-dessus
      const nRage = Math.round((R.rageMax - 1) * 10);
      j.fillStyle(0x000000, 0.65).fillRect(xj - 6, 136 - nRage * 27.6, 40, nRage * 27.6);
      for (let k = 0; k < nRage; k++) j.fillStyle(0xff1030, this.puissance * 10 > 10 + k ? 0.6 + 0.4 * Math.sin(this.horloge * 20) : 0.12).fillRect(xj - 1, 136 - (k + 1) * 27.6 + 3, 30, 22);
    }
    // V18 : quelqu'un arrive = BORDS DE L'ÉCRAN ROUGES dès le premier pas (on le voit même sans le son)
    const va = this.videur.etat;
    if (va === 'annonce' || va === 'regarde') {
      const a = va === 'regarde' ? 0.55 : 0.3 + 0.25 * Math.abs(Math.sin(this.horloge * 10));
      j.fillStyle(0xff2020, a).fillRect(0, 0, LARGEUR, 14).fillRect(0, HAUTEUR - 14, LARGEUR, 14).fillRect(0, 0, 14, HAUTEUR).fillRect(LARGEUR - 14, 0, 14, HAUTEUR);
    }
    // poing caché : la jauge passe en bleu (la charge est gardée)
    if (this.poingCache && (this.etat === 'toi' || this.etat === 'remi')) {
      const xj = LARGEUR - 46;
      j.lineStyle(3, 0x9fe0ff, 1).strokeRect(xj - 6, 136, 40, 288);
    }
    // le videur arrive : « ! » rouge qui clignote, à gauche
    if (va === 'annonce' && Math.floor(this.horloge * 8) % 2) {
      j.fillStyle(0xff3030, 1).fillTriangle(140, 320, 200, 320, 170, 250);
      j.fillStyle(0xffffff, 1).fillRect(167, 270, 6, 30).fillRect(167, 305, 6, 7);
    }
  }
}
