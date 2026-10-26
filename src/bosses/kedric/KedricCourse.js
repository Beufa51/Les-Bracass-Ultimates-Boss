// =====================================================================
// KÉDRIC : course de football américain façon Eyeshield 21.
// Vue de DOS : tu portes le ballon et tu cours vers l'en-but de Kédric.
// Kédric, le coach showman, crie ses COMBINAISONS depuis le bord du terrain :
// ses défenseurs foncent sur toi.
//  - ◀ ▶ : changer de couloir (plaqueur debout)
//  - ▲ : sauter (plaquage aux jambes)
//  - ▼ : se baisser en tournant (bras tendus)
//  - chaque esquive d'affilée te fait accélérer ; la jauge pleine = DEVIL BAT GHOST (Espace).
// 3 ACTIONS à marquer (touchdown) ; un nombre limité de plaquages par action.
// Dernière action : Kédric entre lui-même sur le terrain (duel avec feintes).
// Toute la logique avance dans pas() (pas de minuteries Phaser) : les bots de test
// peuvent jouer en accéléré.
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { onomatopee, flash, encart, bulle, lignesImpact } from './effets.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { Sauvegarde, formatTemps } from '../../core/sauvegarde.js';
import { choisirDifficulte, cleRecord } from './difficulte.js';
import { IDENTITE, DIFFICULTES, VUE, REGLAGES as R, ACTIONS, COMBINAISONS, VERROU_SUIVEUR, REPLIQUES } from './reglages.js';

const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)];
const entre = (min, max) => min + Math.random() * (max - min);
const borne = Phaser.Math.Clamp;

// ---------- la perspective : d = yards devant toi (0 = à tes pieds) ----------
const echelle = (d) => VUE.recul / Math.max(0.05, d + VUE.recul);
const ecranY = (d) => VUE.horizon + (VUE.pieds - VUE.horizon) * echelle(d);
const ecranX = (x, d) => LARGEUR / 2 + x * VUE.largeurCouloir * echelle(d);

// ce qu'il faut faire contre chaque type de défenseur
const SYMBOLES = {
  bloc: { texte: '◀ ▶', couleur: '#ffffff', aide: '◀ ▶  CHANGE DE COULOIR !' },
  bas: { texte: '▲', couleur: '#ffd84a', aide: '▲  SAUTE !' },
  haut: { texte: '▼', couleur: '#d9a0ff', aide: '▼  BAISSE-TOI !' },
  suiveur: { texte: '◎', couleur: '#ff9a3c', aide: 'IL TE SUIT... attends qu\'il soit ROUGE !' },
  verrou: { texte: '◀ ▶', couleur: '#ff4a4a', aide: '◀ ▶  MAINTENANT !' },
};
// explications de la première fois (avec ralenti)
const TUTO = {
  bloc: 'PLAQUEUR dans ton couloir : ◀ ou ▶ pour l\'éviter !',
  bas: 'Il plonge aux JAMBES : ▲ pour sauter par-dessus !',
  haut: 'BRAS TENDUS : ▼ pour passer dessous en tournant !',
  suiveur: 'Le POT DE COLLE te suit : attends qu\'il devienne ROUGE, puis ◀ ▶ !',
};

// les illustrations sont enregistrées 1,5 fois plus grandes que leur taille à l'écran (plus nettes)
const ZOOM_ILLUSTRE = 1 / 1.5;

const ETIQUETTES_JEU = { haut: '▲', bas: '▼', gauche: '◀', droite: '▶', espace: 'Ghost', z: null, x: null };
const ETIQUETTES_OK = { haut: null, bas: null, gauche: null, droite: null, espace: 'OK', z: null, x: null };

export class KedricCourse extends BossScene {
  constructor() { super('KedricCourse', IDENTITE); }

  create() {
    this.phase = this.donnees.phase || 'action1';
    this.etat = 'intro';          // intro | jeu | pause | fin
    this.attente = 0; this.apresAttente = null;
    this.gel = 0;                 // jeu figé un instant (impact, cinématique)
    this.ralenti = 1;             // < 1 pendant l'explication d'un nouveau plaquage
    this.horloge = 0; this.memoire = {};
    this.nomDiff = 'normal'; this.diff = DIFFICULTES.normal;
    this.numAction = this.phase === 'action3' ? 2 : 0;
    this.pos = 0; this.objectif = ACTIONS[this.numAction].yards;
    this.tentatives = this.diff.tentatives;
    this.niveau = 0; this.serie = 0; this.jauge = 0; this.ghost = 0;
    this.tempsTotal = 0;
    this.stats = { plaquages: 0, esquives: 0, parfaits: 0, ghosts: 0, touchdowns: 0 };
    this.defs = []; this.groupe = 0;
    this.iComb = 0; this.prochaine = 1.2;
    this.duel = null;             // Kédric en personne (dernière action)
    this.tutoVus = {}; this.tuto = null;
    this.j = { voie: 0, x: 0, saut: 0, sautDebut: -9, rotation: 0, rotationDebut: -9, recharge: 0, changeT: -9, ancienneVoie: 0, pose: null, poseTemps: 0, sautHauteur: 0 };

    // ---------- le décor ----------
    this.dessinerStade();
    this.terrain = this.add.graphics().setDepth(1);
    this.lignesVitesse = this.add.graphics().setDepth(3);
    this.nombres = [];
    for (let k = 0; k < 18; k++) this.nombres.push(this.add.text(0, 0, '', { fontFamily: 'monospace', fontStyle: 'bold', fontSize: '40px', color: '#ffffff' }).setOrigin(0.5).setDepth(2).setVisible(false));
    this.texteEnBut = this.add.text(0, 0, 'KÉDRIC', { fontFamily: 'monospace', fontStyle: 'bold italic', fontSize: '90px', color: '#ffd84a', stroke: '#0b3d20', strokeThickness: 10 }).setOrigin(0.5).setDepth(2).setVisible(false);
    this.poteaux = this.add.graphics().setDepth(4);

    // ---------- toi ----------
    this.ombreJ = this.add.ellipse(0, 0, 110, 26, 0x000000, 0.35).setDepth(499);
    this.fantomes = [0, 1, 2].map(() => this.add.sprite(0, 0, 'kedric_toi_course').setOrigin(0.5, 1).setTint(0x9fe0ff).setAlpha(0).setDepth(498));
    this.sprJ = this.add.sprite(0, 0, 'kedric_toi_course').setOrigin(0.5, 1).setDepth(500);
    this.sprJ.play('kedric_toi_course');
    this.aide = texte(this, LARGEUR / 2, 512, '', 26, '#ffffff', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 12, y: 4 } }).setDepth(900).setVisible(false);

    this.creerHud();
    this.touches = creerTouches(this);
    this.installerBalayage();
    // musique de fond (Eyeshield 21) : démarre pendant l'écran des commandes, en boucle
    jouerMusique(this, 'kedric_musique');
    if (this.cache.audio.exists('kedric_ambiance')) {
      this.ambiance = this.sound.add('kedric_ambiance', { loop: true, volume: 0.12 });
      this.ambiance.play();
      const pause = () => this.ambiance.pause(), reprise = () => this.ambiance.resume();
      this.events.on('pause', pause); this.events.on('resume', reprise);
      this.events.once('shutdown', () => { this.events.off('pause', pause); this.events.off('resume', reprise); this.ambiance.stop(); this.ambiance.destroy(); });
    }
    // au retour de pause, on « oublie » la touche qui a servi à reprendre
    const oublier = () => { this.lireTouches(); this.memoire = {}; };
    this.events.on('resume', oublier);
    this.events.once('shutdown', () => this.events.off('resume', oublier));

    this.afficher();
    etiquettesTactiles(ETIQUETTES_OK);
    const tactile = estTactile();
    this.afficherIntro('KÉDRIC - Le Showman', [
      'BUT : porte le ballon jusqu\'à l\'en-but de Kédric (3 actions)',
      '◀ ▶ : change de couloir (plaqueur debout)',
      '▲ : saute (plaquage aux jambes)      ▼ : baisse-toi (bras tendus)',
      'Le symbole au-dessus du défenseur te dit quoi faire.',
      'Chaque esquive d\'affilée te fait ACCÉLÉRER.',
      'Esquive au DERNIER moment = PARFAIT (jauge x2)',
      'Jauge pleine : ' + (tactile ? 'Ghost' : 'ESPACE') + ' = DEVIL BAT GHOST !',
      tactile ? '(Tu peux aussi glisser le doigt sur l\'écran.)' : '',
    ].filter(Boolean), () => this.presentation(() => this.choixDifficulte()));
  }

  choixDifficulte() {
    choisirDifficulte(this, 'kedric', DIFFICULTES, (nom, diff) => {
      this.nomDiff = nom; this.diff = diff; this.demarrerMatch();
    }, 'kedric_alerte');
  }

  // Lancement du match (aussi appelé directement par les tests)
  demarrerMatch() {
    this.tempsTotal = 0;
    this.stats = { plaquages: 0, esquives: 0, parfaits: 0, ghosts: 0, touchdowns: 0 };
    this.jauge = 0;
    this.debutAction(this.numAction);
  }

  debutAction(n) {
    this.numAction = n;
    const A = ACTIONS[n];
    this.pos = 0; this.objectif = A.yards;
    this.tentatives = this.diff.tentatives;
    this.niveau = 0; this.serie = 0; this.ghost = 0;
    this.iComb = 0; this.prochaine = 1.3;
    this.duel = null;
    this.viderDefenseurs();
    Object.assign(this.j, { voie: 0, x: 0, saut: 0, rotation: 0, recharge: 0, pose: null, poseTemps: 0 });
    this.etat = 'pause';
    etiquettesTactiles(ETIQUETTES_JEU);
    const e = encart(this, A.nom, `« ${A.titre} » - ${A.yards} yards jusqu'à l'en-but`, '#ffd84a', 0x0b2a16);
    jouerSon(this, 'kedric_sifflet');
    this.majHud();
    this.attendre(1.6, () => {
      e.fermer();
      this.etat = 'jeu';
      if (n === 0) this.direCoach('Les gars ! On lui montre le SHOW !');
    });
  }

  attendre(duree, ensuite) { this.attente = duree; this.apresAttente = ensuite; }

  // =================================================================
  //  BOUCLE PRINCIPALE
  // =================================================================
  update(temps, delta) {
    if (this.termine) return;
    const dt = Math.min(delta, 50) / 1000;
    this.pas(dt, this.lireTouches());
    this.afficher();
  }

  // Une "image" de logique (les tests l'appellent en boucle pour jouer en accéléré)
  pas(dt, e) {
    this.horloge += dt;
    for (const k of ['gauche', 'droite', 'haut', 'bas', 'espace']) if (e[k]) this.memoire[k] = this.horloge;
    if (this.attente > 0) {
      this.attente -= dt;
      if (this.attente <= 0 && this.apresAttente) { const f = this.apresAttente; this.apresAttente = null; f(); }
    }
    if (this.etat !== 'jeu') return;
    if (this.gel > 0) { this.gel -= dt; if (this.gel <= 0 && this.apresGel) { const f = this.apresGel; this.apresGel = null; f(); } return; }
    this.majJeu(dt * this.ralenti);
  }

  lireTouches() {
    const t = this.touches, jd = Phaser.Input.Keyboard.JustDown;
    const e = { gauche: jd(t.gauche), droite: jd(t.droite), haut: jd(t.haut), bas: jd(t.bas), espace: jd(t.espace) };
    // glissements du doigt (téléphone)
    if (this.balaye) { e[this.balaye] = true; this.balaye = null; }
    return e;
  }

  // appui fait il y a moins de 0,15 s : on le "consomme"
  aAppuye(k, fenetre = 0.15) {
    if (this.memoire[k] !== undefined && this.horloge - this.memoire[k] <= fenetre) { delete this.memoire[k]; return true; }
    return false;
  }

  // Sur téléphone (et à la souris) : glisser vers le haut / bas / gauche / droite = la flèche
  installerBalayage() {
    let debut = null;
    this.input.on('pointerdown', (p) => { debut = { x: p.x, y: p.y }; });
    this.input.on('pointerup', (p) => {
      if (!debut || this.etat !== 'jeu') { debut = null; return; }
      const dx = p.x - debut.x, dy = p.y - debut.y; debut = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
      this.balaye = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'gauche' : 'droite') : (dy < 0 ? 'haut' : 'bas');
    });
  }

  vitesse() {
    if (this.ghost > 0) return R.ghost.vitesse;
    let v = (R.vitesseBase + this.niveau * R.pasVitesse) * this.diff.vitesse;
    if (this.duel && this.duel.vies > 0) v *= R.duel.tonAllure;
    return v;
  }
  alerte() { return this.diff.alerte * (1 - R.alerteParNiveau * this.niveau); }

  majJeu(dt) {
    this.tempsTotal += dt;
    const j = this.j;
    // ---------- toi ----------
    if (j.recharge > 0) j.recharge -= dt;
    if (j.saut > 0) { j.saut -= dt; if (j.saut <= 0) j.recharge = R.saut.recharge; }
    if (j.rotation > 0) { j.rotation -= dt; if (j.rotation <= 0) j.recharge = R.rotation.recharge; }
    if (j.poseTemps > 0) j.poseTemps -= dt;
    const libre = j.saut <= 0 && j.rotation <= 0 && j.recharge <= 0;
    if (this.aAppuye('gauche') && j.voie > -1) this.changerCouloir(-1);
    if (this.aAppuye('droite') && j.voie < 1) this.changerCouloir(1);
    if (libre && this.aAppuye('haut')) { j.saut = R.saut.duree; j.sautDebut = this.horloge; jouerSon(this, 'kedric_saut'); }
    else if (libre && this.aAppuye('bas')) { j.rotation = R.rotation.duree; j.rotationDebut = this.horloge; jouerSon(this, 'kedric_esquive', { rate: 0.8 }); }
    if (this.aAppuye('espace', 0.05) && this.jauge >= this.diff.ghost && this.ghost <= 0) this.lancerGhost();
    j.x += borne(j.voie - j.x, -dt / R.changementCouloir, dt / R.changementCouloir);
    if (this.ghost > 0) this.ghost -= dt;

    // ---------- on avance ----------
    const v = this.vitesse();
    this.pos += v * dt;
    if (this.duel && this.duel.vies > 0) this.pos = Math.min(this.pos, this.objectif - 3);
    if (this.pos >= this.objectif) { this.pos = this.objectif; this.touchdown(); return; }

    // ---------- Kédric appelle ses combinaisons ----------
    const A = ACTIONS[this.numAction];
    const debutDuel = A.duel ? this.objectif - R.duel.avant : Infinity;
    this.prochaine -= dt;
    if (this.prochaine <= 0 && !this.duel) {
      const nom = A.combinaisons[this.iComb % A.combinaisons.length];
      const C = COMBINAISONS[nom];
      const fin = C.liste[C.liste.length - 1][0];
      // pas de nouvelle combinaison qui arriverait dans l'en-but (ou dans la zone du duel)
      if (this.pos + v * (VUE.apparition + fin) < Math.min(this.objectif - 4, debutDuel - 2)) {
        this.appelerCombinaison(nom, v);
        this.iComb++;
        this.prochaine = fin + this.diff.ecart + 0.25;
      } else this.prochaine = 0.3;
    }
    if (A.duel && !this.duel && this.pos >= debutDuel && this.defs.every(d => d.etat !== 'approche')) this.entreeKedric();
    if (this.duel) this.majDuel(dt);

    // ---------- les défenseurs ----------
    for (const d of this.defs) this.majDefenseur(d, dt, v);
    for (const d of this.defs) {
      if (d.etat === 'approche' && d.pos - this.pos <= 0) { this.contact(d); if (this.etat !== 'jeu' || this.gel > 0) break; }
    }
    this.defs = this.defs.filter(d => {
      if (d.pos - this.pos < -1.6 && !d.star) { d.sprite.destroy(); d.ombre.destroy(); d.symbole.destroy(); return false; }
      return true;
    });
    this.majAide();
  }

  changerCouloir(sens) {
    const j = this.j;
    j.ancienneVoie = j.voie; j.voie += sens; j.changeT = this.horloge;
    jouerSon(this, 'kedric_esquive', { rate: 1.2, volume: 0.6 });
  }

  // =================================================================
  //  LES DÉFENSEURS
  // =================================================================
  appelerCombinaison(nom, v) {
    const C = COMBINAISONS[nom];
    this.direCoach(C.nom, 1400, true);
    for (const [delai, type, couloir] of C.liste) {
      const pos = this.pos + v * (VUE.apparition + delai);
      const g = ++this.groupe;
      let voies;
      if (couloir === 'tous') voies = [-1, 0, 1];
      else if (couloir === 'mur') {
        const libre = auHasard([-1, 0, 1].filter(k => k !== this.j.voie));
        voies = [-1, 0, 1].filter(k => k !== libre);
      } else if (couloir === 'autre') voies = [this.j.voie === 0 ? auHasard([-1, 1]) : 0];
      else voies = [null];   // 'toi' : décidé au dernier moment
      for (const vo of voies) this.ajouterDefenseur({ pos, type, voie: vo, groupe: g });
    }
  }

  ajouterDefenseur({ pos, type, voie, groupe, star = false }) {
    const prefixe = star ? 'kedric_star_' : 'kedric_def_';
    const d = {
      pos, type, groupe, star, prefixe,
      voie: voie === null ? this.j.voie : voie, x: voie === null ? this.j.voie : voie,
      suit: voie === null,           // 'toi' : il vise ton couloir jusqu'au dernier moment
      etat: 'approche', alerte: false, verrou: false, menace: false, chute: 0, angle: 0, poseActuelle: null,
      sprite: this.add.sprite(0, 0, prefixe + 'course').setOrigin(0.5, 1),
      ombre: this.add.ellipse(0, 0, 120, 24, 0x000000, 0.3).setDepth(5),
      symbole: texte(this, 0, 0, '', 40, '#ffffff', { fontStyle: 'bold' }).setVisible(false),
    };
    this.defs.push(d);
    return d;
  }

  viderDefenseurs() {
    for (const d of this.defs) { d.sprite.destroy(); d.ombre.destroy(); d.symbole.destroy(); }
    this.defs = [];
  }

  // vitesse à laquelle le défenseur se rapproche de toi
  vitesseRelative(d, v) { return v + (d.star && this.duel && this.duel.phase === 'charge' ? R.duel.charge : 0); }

  majDefenseur(d, dt, v) {
    if (d.etat === 'rate') {
      // il s'écroule sur le côté
      d.chute += dt; d.x += d.sensChute * dt * 1.6; d.angle += d.sensChute * dt * 260;
      return;
    }
    if (d.etat !== 'approche') return;
    if (d.star) return;   // Kédric : géré par majDuel
    const ttc = (d.pos - this.pos) / v;
    // il vise ton couloir, puis se décide (le suiveur : jusqu'au verrou)
    if (d.suit) {
      const limite = d.type === 'suiveur' ? VERROU_SUIVEUR : this.alerte() + 0.35;
      if (ttc > limite) d.voie = this.j.voie;
      else { d.suit = false; if (d.type === 'suiveur') { d.verrou = true; jouerSon(this, 'kedric_alerte', { rate: 1.5 }); } }
    }
    d.x += borne(d.voie - d.x, -dt * (d.type === 'suiveur' ? 7 : 5), dt * (d.type === 'suiveur' ? 7 : 5));
    this.alerterSiBesoin(d, ttc);
  }

  alerterSiBesoin(d, ttc) {
    const enFace = Math.abs(d.x - this.j.x) < 0.5;
    if (ttc < this.alerte()) {
      if (!d.alerte) {
        d.alerte = true;
        if (this.groupeSonne !== d.groupe) { this.groupeSonne = d.groupe; jouerSon(this, 'kedric_alerte'); }
        // explication avec ralenti, la première fois (FACILE / NORMAL)
        if (this.diff.aide && !Sauvegarde.fait('kedric_tuto') && this.numAction === 0 && enFace && !this.tutoVus[d.type] && TUTO[d.type]) this.debutTuto(d);
      }
      if (enFace) d.menace = true;
    }
  }

  debutTuto(d) {
    this.tutoVus[d.type] = true;
    this.ralenti = 0.25;
    this.tuto = { d, banniere: texte(this, LARGEUR / 2, 168, TUTO[d.type], 22, '#ffd84a', { backgroundColor: '#000000cc', padding: { x: 12, y: 8 } }).setDepth(950) };
  }
  finTuto() {
    if (!this.tuto) return;
    const b = this.tuto.banniere; this.tuto = null; this.ralenti = 1;
    this.tweens.add({ targets: b, alpha: 0, delay: 500, duration: 300, onComplete: () => b.destroy() });
  }

  // Le défenseur arrive à ta hauteur : esquivé ou plaqué ?
  contact(d) {
    const j = this.j;
    const enFace = Math.abs(d.x - j.x) < 0.5;
    const type = d.star ? this.duel.vrai : d.type;
    if (this.tuto && this.tuto.d === d) this.finTuto();
    if (this.ghost > 0) { this.esquive(d, 'ghost'); return; }
    if (!enFace) {
      if (d.menace || d.star) this.esquive(d, this.horloge - j.changeT <= this.diff.parfait ? 'parfait' : 'cote');
      else { d.etat = 'passe'; }
      return;
    }
    const fen = this.diff.parfait + 0.06;
    if (type === 'bas' && j.saut > 0) { this.esquive(d, this.horloge - j.sautDebut <= fen ? 'parfait' : 'saut'); return; }
    if (type === 'haut' && j.rotation > 0) { this.esquive(d, this.horloge - j.rotationDebut <= fen ? 'parfait' : 'rotation'); return; }
    // plaqué ! (et pourquoi)
    let pourquoi = null;
    if (type === 'bas') pourquoi = this.horloge - j.sautDebut < 1 ? 'Trop tôt !' : (j.rotation > 0 ? 'Il fallait SAUTER (▲) !' : null);
    if (type === 'haut') pourquoi = this.horloge - j.rotationDebut < 1 ? 'Trop tôt !' : (j.saut > 0 ? 'Il fallait te BAISSER (▼) !' : null);
    if (type === 'bloc' || type === 'suiveur') pourquoi = j.saut > 0 || j.rotation > 0 ? 'Change de COULOIR (◀ ▶) !' : null;
    this.plaque(d, pourquoi);
  }

  esquive(d, comment) {
    // les défenseurs d'un même groupe qui ne te visaient pas passent simplement
    for (const o of this.defs) if (o.groupe === d.groupe && o !== d && o.etat === 'approche' && o.pos - this.pos <= 0.3) o.etat = 'passe';
    d.etat = 'rate'; d.chute = 0; d.sensChute = d.x >= this.j.x ? 1 : -1; if (Math.abs(d.x - this.j.x) < 0.3) d.sensChute = auHasard([-1, 1]);
    const parfait = comment === 'parfait';
    const x = ecranX(this.j.x, 0), y = VUE.pieds - 250;
    if (comment === 'ghost') {
      onomatopee(this, ecranX(d.x, 0.5), y + 40, ['?!', 'Hein ?!', 'Où ?!'], 34, '#9fe0ff');
    } else {
      this.stats.esquives++;
      this.serie++;
      this.jauge = Math.min(this.diff.ghost, this.jauge + (parfait ? 2 : 1));
      if (parfait) {
        this.stats.parfaits++;
        jouerSon(this, 'kedric_parfait');
        onomatopee(this, x, y, 'PARFAIT !', 40, '#7fe8ff');
        lignesImpact(this, x, y + 60, 0x9fe0ff, 16, 150);
        if (Math.random() < 0.35 && !d.star) this.direCoach(auHasard(REPLIQUES.parfait));
      } else {
        jouerSon(this, 'kedric_esquive');
        onomatopee(this, x, y, comment === 'saut' ? 'HOP !' : comment === 'rotation' ? 'SPIN !' : 'ZIP !', 32, '#ffffff');
        if (Math.random() < 0.15 && !d.star) this.direCoach(auHasard(REPLIQUES.esquive));
      }
      const niveau = Math.min(R.niveauMax, Math.floor(this.serie / R.esquivesParNiveau));
      if (niveau > this.niveau) {
        this.niveau = niveau;
        jouerSon(this, 'kedric_niveau');
        const t = texte(this, x, y - 50, niveau === R.niveauMax ? 'VITESSE MAX : 4"2 !' : 'VITESSE +1', 24, '#7fff7f').setDepth(905);
        this.tweens.add({ targets: t, y: y - 90, alpha: 0, duration: 900, onComplete: () => t.destroy() });
      }
      if (this.jauge >= this.diff.ghost && !this.ghostAnnonce) {
        this.ghostAnnonce = true;
        jouerSon(this, 'kedric_niveau', { rate: 1.3 });
        const t = texte(this, LARGEUR / 2, 220, `DEVIL BAT GHOST PRÊT : ${estTactile() ? 'Ghost' : 'ESPACE'} !`, 28, '#9fe0ff', { fontStyle: 'bold' }).setDepth(905);
        this.tweens.add({ targets: t, alpha: 0, delay: 1300, duration: 400, onComplete: () => t.destroy() });
      }
    }
    if (d.star) this.kedricEsquive(comment === 'ghost');
  }

  plaque(d, pourquoi) {
    const j = this.j;
    this.stats.plaquages++;
    this.tentatives--;
    this.serie = 0; this.niveau = 0; this.ghost = 0;
    d.etat = 'plaqueur'; d.pos = this.pos + 0.25; d.x = j.x;
    j.pose = 'plaque'; j.poseTemps = 99; j.saut = 0; j.rotation = 0;
    if (this.tuto) this.finTuto();
    jouerSon(this, 'kedric_plaque');
    jouerSon(this, 'kedric_foule', { volume: 0.7 });
    this.cameras.main.shake(260, 0.016);
    flash(this, 0.55);
    onomatopee(this, LARGEUR / 2, 260, ['CRAAAC !', 'BAM !', 'SBAM !'], 64, '#ff5a5a');
    lignesImpact(this, LARGEUR / 2, 380, 0xffffff, 22, 260);
    if (pourquoi) {
      const t = texte(this, LARGEUR / 2, 330, pourquoi, 28, '#ffd84a', { fontStyle: 'bold' }).setDepth(910);
      this.tweens.add({ targets: t, alpha: 0, delay: 1300, duration: 300, onComplete: () => t.destroy() });
    }
    this.direCoach(auHasard(REPLIQUES.plaque), 1600, true);
    this.danseKedric();
    this.etat = 'pause';
    this.majHud();
    this.attendre(R.pausePlaquage, () => {
      if (this.tentatives <= 0) { this.finMatch(false); return; }
      this.reprendreApresPlaquage();
    });
  }

  reprendreApresPlaquage() {
    this.viderDefenseurs();
    Object.assign(this.j, { pose: null, poseTemps: 0, saut: 0, rotation: 0, recharge: 0, voie: 0, x: 0 });
    this.prochaine = 1.0;
    if (this.duel) { this.duel.kedric = null; this.duel.phase = 'retour'; this.duel.attente = 0.4; }
    const n = this.diff.tentatives - this.tentatives + 1;
    const t = texte(this, LARGEUR / 2, 250, `${n}e TENTATIVE`, 44, '#ffffff', { fontStyle: 'bold italic', stroke: '#1d8a4a', strokeThickness: 8 }).setDepth(905);
    const reste = texte(this, LARGEUR / 2, 300, this.tentatives === 1 ? 'DERNIÈRE CHANCE !' : `encore ${this.tentatives} plaquages permis`, 22, this.tentatives === 1 ? '#ff6b6b' : '#dddddd').setDepth(905);
    jouerSon(this, 'kedric_sifflet');
    this.etat = 'pause';
    this.attendre(1.1, () => { t.destroy(); reste.destroy(); this.etat = 'jeu'; });
  }

  // =================================================================
  //  DEVIL BAT GHOST
  // =================================================================
  lancerGhost() {
    this.jauge = 0; this.ghostAnnonce = false;
    this.stats.ghosts++;
    jouerSon(this, 'kedric_ghost');
    const e = encart(this, 'DEVIL BAT GHOST', 'Stop... and GO ! Personne ne peut te toucher !', '#9fe0ff', 0x061428);
    this.gel = R.ghost.cinematique;
    this.apresGel = () => { e.fermer(); this.ghost = R.ghost.duree; flash(this, 0.5, 0x9fe0ff); this.direCoach(REPLIQUES.ghost, 1500, true); };
  }

  // =================================================================
  //  LE DUEL CONTRE KÉDRIC (dernière action)
  // =================================================================
  entreeKedric() {
    this.duel = { vies: R.duel.vies, phase: 'retour', attente: 0, kedric: null, montre: 'bloc', vrai: 'bloc', feinteFaite: false, precedent: null };
    jouerSon(this, 'kedric_touchdown', { volume: 0.6 });
    const e = encart(this, 'KÉDRIC ENTRE EN JEU !', `« ${REPLIQUES.duel} »`, '#ffd84a', 0x1d1606, 'kedric_coach');
    this.gel = 1.8;
    this.apresGel = () => e.fermer();
    this.danseKedric();
  }

  majDuel(dt) {
    const D = this.duel;
    if (D.vies <= 0) return;
    if (D.phase === 'retour') {
      // il revient se placer devant toi (en dansant)
      D.attente -= dt;
      if (D.attente > 0) return;
      if (D.kedric) { D.kedric.sprite.destroy(); D.kedric.ombre.destroy(); D.kedric.symbole.destroy(); this.defs = this.defs.filter(o => o !== D.kedric); }
      D.kedric = this.ajouterDefenseur({ pos: this.pos + R.duel.distance, type: 'bloc', voie: this.j.voie, groupe: ++this.groupe, star: true });
      D.phase = 'danse'; D.attente = entre(...R.duel.attente);
      if (Math.random() < 0.6) this.direCoach(auHasard(REPLIQUES.duelEsquive), 1200, true);
      return;
    }
    const k = D.kedric;
    if (D.phase === 'danse') {
      // il garde ses distances en se dandinant d'un couloir à l'autre
      k.pos = this.pos + R.duel.distance;
      k.x = Math.sin(this.horloge * 3.2) * 0.6;
      D.attente -= dt;
      if (D.attente <= 0) {
        // il choisit son attaque (jamais deux fois la même), et peut-être une feinte
        const types = ['bloc', 'bas', 'haut'].filter(t => t !== D.precedent);
        D.vrai = auHasard(types); D.precedent = D.vrai;
        D.feinte = Math.random() < this.diff.feintes;
        D.montre = D.feinte ? auHasard(['bloc', 'bas', 'haut'].filter(t => t !== D.vrai)) : D.vrai;
        D.feinteFaite = false;
        k.type = D.montre; k.alerte = false; k.menace = false; k.suit = true; k.voie = this.j.voie;
        D.phase = 'charge';
        onomatopee(this, ecranX(k.x, R.duel.distance), ecranY(R.duel.distance) - 120, 'SHOWTIME !', 30, '#ffd84a');
      }
      return;
    }
    if (D.phase === 'charge' && k.etat === 'approche') {
      const v = this.vitesse() + R.duel.charge;
      k.pos -= R.duel.charge * dt;
      const ttc = (k.pos - this.pos) / v;
      // il vise ton couloir jusqu'au moment de l'alerte
      if (k.suit && ttc < this.alerte() + 0.1) k.suit = false;
      if (k.suit) k.voie = this.j.voie;
      k.x += borne(k.voie - k.x, -dt * 6, dt * 6);
      // la feinte : il change d'attaque au dernier moment
      if (D.feinte && !D.feinteFaite && ttc < this.diff.feinte) {
        D.feinteFaite = true; k.type = D.vrai; k.alerte = false;
        if (D.vrai === 'bloc') k.voie = this.j.voie;
        jouerSon(this, 'kedric_alerte', { rate: 0.7 });
        onomatopee(this, ecranX(k.x, k.pos - this.pos) + 90, ecranY(k.pos - this.pos) - 160, 'FEINTE !', 30, '#ff5a5a');
      }
      this.alerterSiBesoin(k, ttc);
    }
  }

  kedricEsquive(ghost) {
    const D = this.duel;
    D.vies = ghost ? 0 : D.vies - 1;
    D.phase = 'retour'; D.attente = 1.0;
    if (D.vies <= 0) {
      jouerSon(this, 'kedric_foule');
      const e = encart(this, ghost ? 'IL N\'A RIEN VU !' : 'KÉDRIC EST PASSÉ !', 'Fonce jusqu\'à l\'en-but !', '#7fff7f', 0x0b2a16);
      this.gel = 1.1; this.apresGel = () => e.fermer();
      this.direCoach(ghost ? REPLIQUES.ghost : 'NOOON ! Mon show !', 1600, true);
    } else {
      const t = texte(this, LARGEUR / 2, 200, `Kédric esquivé ! Encore ${D.vies}`, 26, '#ffd84a', { fontStyle: 'bold' }).setDepth(905);
      this.tweens.add({ targets: t, alpha: 0, delay: 900, duration: 300, onComplete: () => t.destroy() });
    }
  }

  // =================================================================
  //  TOUCHDOWN / FIN
  // =================================================================
  touchdown() {
    this.etat = 'pause';
    this.stats.touchdowns++;
    this.j.pose = 'victoire'; this.j.poseTemps = 99; this.ghost = 0;
    if (this.tuto) this.finTuto();
    if (this.numAction === 0 && this.diff.aide) Sauvegarde.marquerFait('kedric_tuto');
    jouerSon(this, 'kedric_touchdown');
    jouerSon(this, 'kedric_foule');
    flash(this, 0.5, 0xffd84a);
    const e = encart(this, 'TOUCHDOWN !!', `${this.stats.touchdowns} / ${ACTIONS.length}`, '#ffd84a', 0x0b2a16);
    const fin = this.numAction >= ACTIONS.length - 1;
    if (!fin) this.direCoach(REPLIQUES.touchdown[this.numAction % REPLIQUES.touchdown.length], 2000, true);
    this.attendre(2.4, () => {
      e.fermer();
      this.viderDefenseurs();
      if (fin) this.finMatch(true);
      else this.debutAction(this.numAction + 1);
    });
  }

  finMatch(gagne) {
    etiquettesTactiles(ETIQUETTES_OK);
    this.etat = 'fin';
    this.aide.setVisible(false);
    if (gagne) this.victoire(this.classement());
    else this.defaite(`BALLE PERDUE !\nKédric : « ${REPLIQUES.defaite} »\nTouchdowns : ${this.stats.touchdowns} / ${ACTIONS.length}`);
  }

  cleRecord() { return cleRecord('kedric', this.nomDiff); }

  // Rang S / A / B / C : plaquages, esquives parfaites, temps
  classement() {
    let score = 100;
    score -= this.stats.plaquages * 11;
    score += Math.min(10, this.stats.parfaits * 0.6);
    score -= Math.max(0, this.tempsTotal - R.tempsReference) * 0.35;
    const rang = R.rangs.find(r => score >= r.seuil).rang;
    const complet = this.phase === 'action1';
    const record = complet ? Sauvegarde.proposerRecord(this.cleRecord(), rang, this.tempsTotal, R.rangs.map(r => r.rang)) : Sauvegarde.record(this.cleRecord());
    this.rang = rang;
    return `Kédric est battu !\nRANG ${rang}   -   temps ${formatTemps(this.tempsTotal)}` +
      `\nPlaquages subis : ${this.stats.plaquages}   esquives : ${this.stats.esquives}` +
      `\nEsquives parfaites : ${this.stats.parfaits}` +
      (this.stats.ghosts ? `   Devil Bat Ghost : ${this.stats.ghosts}` : '') +
      (record ? `\nRecord : rang ${record.rang} en ${formatTemps(record.temps)}` : '') +
      (this.nomDiff !== 'normal' ? `\nMode ${this.diff.nom}` : '');
  }

  // =================================================================
  //  KÉDRIC LE SHOWMAN (bulles, danse)
  // =================================================================
  direCoach(message, duree = 1400, crie = false) {
    if (this.bulleCoach && this.bulleCoach.active) this.bulleCoach.destroy();
    this.bulleCoach = bulle(this, 166, 136, `Kédric : « ${message} »`, duree).setOrigin(0, 1).setDepth(960);
    this.bulleCoach.setWordWrapWidth(300);
    if (crie) { this.coachCrie = 0.7; this.tweens.add({ targets: this.cadreCoach, scale: 1.08, duration: 90, yoyo: true }); }
  }

  // Kédric surgit sur le côté en dansant (après un plaquage, à son entrée en jeu)
  danseKedric() {
    const k = this.add.sprite(-170, HAUTEUR - 10, 'kedric_danse').setOrigin(0.5, 1).setDepth(940).play('kedric_danse');
    k.setScale(260 / k.height);
    this.tweens.add({ targets: k, x: 120, duration: 260, ease: 'Back.Out' });
    this.tweens.add({ targets: k, x: -170, delay: 1300, duration: 260, ease: 'Cubic.In', onComplete: () => k.destroy() });
    for (let n = 0; n < 6; n++) {
      const e = this.add.star(120 + Phaser.Math.Between(-90, 90), HAUTEUR - Phaser.Math.Between(80, 260), 5, 4, 10, 0xffd84a).setDepth(941).setScale(0);
      this.tweens.add({ targets: e, scale: 1.2, angle: 180, delay: 200 + n * 90, duration: 400, yoyo: true, onComplete: () => e.destroy() });
    }
  }

  // =================================================================
  //  ÉCRANS
  // =================================================================
  presentation(ensuite) {
    etiquettesTactiles(ETIQUETTES_OK);
    const el = [];
    el.push(this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x0b0b14, 0.96).setDepth(1100));
    // projecteurs sur la star
    const g = this.add.graphics().setDepth(1101);
    g.fillStyle(0xfff3a8, 0.08);
    for (const x0 of [560, 900]) { g.beginPath(); g.moveTo(x0, 0); g.lineTo(LARGEUR - 330, HAUTEUR); g.lineTo(LARGEUR - 40, HAUTEUR); g.closePath(); g.fillPath(); }
    g.lineStyle(2, 0xffffff, 0.15);
    for (let k = 0; k < 40; k++) { const y = Math.random() * HAUTEUR; g.lineBetween(0, y, 600, y + (Math.random() - 0.5) * 20); }
    el.push(g);
    const portrait = this.add.image(LARGEUR + 200, HAUTEUR / 2 + 50, 'kedric_portrait').setDepth(1102);
    portrait.setScale(Math.min(430 / portrait.height, 380 / portrait.width));
    this.tweens.add({ targets: portrait, x: LARGEUR - 190, duration: 350, ease: 'Cubic.Out' });
    el.push(portrait);
    el.push(texte(this, 300, 90, 'KÉDRIC', 96, '#ffffff', { fontStyle: 'bold italic', stroke: '#1d8a4a', strokeThickness: 14 }).setDepth(1102));
    el.push(texte(this, 300, 175, '« LE SHOWMAN »', 34, '#ffd84a').setDepth(1102));
    el.push(texte(this, 300, 300, [
      'Sport : football américain',
      'Poste : coach... et star du show',
      'Arme secrète : ses combinaisons',
      'Phrase culte : « C\'est MON show ! »',
    ].join('\n'), 20, '#dddddd', { lineSpacing: 10 }).setDepth(1102));
    el.push(texte(this, 300, 460, (estTactile() ? 'OK' : 'ESPACE') + ' : sur le terrain !', 22, '#7fff7f').setDepth(1102));
    el.push(bulle(this, LARGEUR - 190, 66, REPLIQUES.presentation, 99999).setDepth(1103));
    jouerSon(this, 'kedric_foule', { volume: 0.6 });
    this.time.delayedCall(500, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        el.forEach(e => e.destroy());
        jouerSon(this, 'ui_valider');
        ensuite();
      });
    });
  }

  // réduction à appliquer à une image (les illustrations sont enregistrées en plus grand)
  zoom(cle) { return this.estIllustre(cle) ? ZOOM_ILLUSTRE : 1; }

  // vrai si l'image vient d'un fichier (illustration) et pas d'un dessin du code
  estIllustre(cle) {
    this.illustrees = this.illustrees || {};
    if (!(cle in this.illustrees)) {
      const src = this.textures.exists(cle) && this.textures.get(cle).getSourceImage();
      this.illustrees[cle] = !!src && !(src instanceof HTMLCanvasElement);
    }
    return this.illustrees[cle];
  }

  // Écran de victoire : rayons, trophée, Kédric à genoux, badge, rang
  ecranVictoire(message) {
    const P = 1000, cx = LARGEUR / 2;
    jouerSon(this, 'kedric_foule'); jouerSon(this, 'kedric_touchdown');
    this.add.rectangle(cx, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x06140a, 0.97).setDepth(P);
    const rayons = this.add.graphics().setDepth(P + 1).setPosition(300, 300);
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      rayons.fillStyle(k % 2 ? 0x7fff9a : 0xffd84a, 0.16).beginPath();
      rayons.moveTo(0, 0); rayons.lineTo(Math.cos(a) * 700, Math.sin(a) * 700); rayons.lineTo(Math.cos(a + 0.17) * 700, Math.sin(a + 0.17) * 700);
      rayons.closePath(); rayons.fillPath();
    }
    this.tweens.add({ targets: rayons, angle: 360, duration: 20000, repeat: -1 });
    const ked = this.add.image(LARGEUR + 200, HAUTEUR - 30, 'kedric_defaite').setOrigin(0.5, 1).setDepth(P + 2);
    ked.setScale(300 / ked.height);
    this.tweens.add({ targets: ked, x: 760, duration: 500, ease: 'Cubic.Out' });
    const trophee = this.add.image(300, 300, 'kedric_trophee').setDepth(P + 3).setScale(0).setAngle(-30);
    this.tweens.add({ targets: trophee, scale: 1.15, angle: 0, delay: 350, duration: 600, ease: 'Back.Out' });
    this.tweens.add({ targets: trophee, y: 290, delay: 1000, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.time.addEvent({ delay: 180, repeat: -1, callback: () => {
      const e = this.add.star(300 + Phaser.Math.Between(-130, 130), 300 + Phaser.Math.Between(-150, 120), 4, 3, 9, 0xfff3a8).setDepth(P + 4);
      this.tweens.add({ targets: e, scale: 0, angle: 180, duration: 700, onComplete: () => e.destroy() });
    } });
    const titre = texte(this, 300, 70, 'VICTOIRE !!', 64, '#7fff7f', { fontStyle: 'bold italic', stroke: '#1d8a4a', strokeThickness: 12 }).setDepth(P + 5).setScale(3).setAlpha(0);
    this.tweens.add({ targets: titre, scale: 1, alpha: 1, duration: 300, ease: 'Back.Out', onComplete: () => this.cameras.main.shake(200, 0.01) });
    const lignes = message.split('\n');
    const rang = (lignes[1] || '').match(/RANG (\w)/);
    if (rang) {
      const r = texte(this, 140, 440, rang[1], 96, '#ffffff', { fontStyle: 'bold', stroke: '#1d8a4a', strokeThickness: 12 }).setDepth(P + 5).setScale(0);
      this.tweens.add({ targets: r, scale: 1, delay: 900, duration: 300, ease: 'Back.Out' });
      texte(this, 140, 375, 'RANG', 22, '#ffd84a').setDepth(P + 5);
    }
    texte(this, 300, 135, lignes[0], 22, '#ffffff').setDepth(P + 5);
    texte(this, 380, 440, lignes.slice(1).join('\n').replace(/RANG \w\s+-\s+/, ''), 17, '#ffffff', { align: 'left', lineSpacing: 5 }).setOrigin(0, 0.5).setDepth(P + 5);
    bulle(this, 760, 150, `Kédric : « ${REPLIQUES.victoire} »`, 99999).setDepth(P + 5);
    const badge = this.add.image(140, 210, 'badge_' + this.identite.id).setDepth(P + 5).setScale(0);
    this.tweens.add({ targets: badge, scale: 2, delay: 1200, duration: 300, ease: 'Back.Out' });
    texte(this, 140, 260, 'Badge Kédric !', 18, '#ffd84a').setDepth(P + 5);
    texte(this, LARGEUR / 2, HAUTEUR - 22, `${estTactile() ? 'OK' : 'ESPACE'} : retour au hub`, 18, '#aaaaaa').setDepth(P + 5);
  }

  // =================================================================
  //  AFFICHAGE
  // =================================================================
  // Le stade (fixe) : ciel de nuit, projecteurs, tribunes pleines, écran géant
  // (dessiné une seule fois dans une image : des milliers de petits ronds redessinés à chaque image ralentiraient le jeu)
  dessinerStade() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const H = VUE.horizon;
    g.fillGradientStyle(0x07081a, 0x07081a, 0x1b2350, 0x1b2350, 1); g.fillRect(0, 0, LARGEUR, H);
    // tribunes
    g.fillStyle(0x1a1a28, 1); g.fillRect(0, H - 70, LARGEUR, 70);
    const alea = Phaser.Math.RND;
    const couleurs = [0x1d8a4a, 0xffd84a, 0xffffff, 0xc8202c, 0x3fa7ff, 0x2fae7a, 0xff9a3c];
    for (let y = H - 64; y < H - 4; y += 7) {
      for (let x = 2; x < LARGEUR; x += 7) {
        if (alea.frac() < 0.85) { g.fillStyle(couleurs[alea.between(0, couleurs.length - 1)], 0.75); g.fillCircle(x + alea.between(-1, 1), y, 2.6); }
      }
    }
    g.fillStyle(0x0d0d16, 1); g.fillRect(0, H - 6, LARGEUR, 6);
    // écran géant au milieu
    g.fillStyle(0x111111, 1); g.fillRect(LARGEUR / 2 - 90, H - 118, 180, 54);
    g.lineStyle(3, 0xffd84a, 1); g.strokeRect(LARGEUR / 2 - 90, H - 118, 180, 54);
    // projecteurs
    for (const x of [70, 250, LARGEUR - 250, LARGEUR - 70]) {
      g.fillStyle(0xfff6c8, 0.12); g.fillCircle(x, 34, 40);
      g.fillStyle(0xfff6c8, 0.25); g.fillCircle(x, 34, 22);
      g.fillStyle(0xffffff, 1); for (let k = -1; k <= 1; k++) g.fillCircle(x + k * 10, 34, 4);
      g.lineStyle(3, 0x333344, 1); g.lineBetween(x, 44, x, H - 70);
    }
    const rt = this.add.renderTexture(0, 0, LARGEUR, H).setOrigin(0).setDepth(0);
    const ecran = this.make.text({ x: LARGEUR / 2, y: H - 91, text: 'KÉDRIC SHOW', style: { fontFamily: 'monospace', fontStyle: 'bold', fontSize: '22px', color: '#ffd84a' } }, false).setOrigin(0.5);
    rt.draw(g); rt.draw(ecran);
    g.destroy(); ecran.destroy();
  }

  dessinerTerrain() {
    const g = this.terrain; g.clear();
    const B = VUE.bord, H = VUE.horizon;
    // bords du terrain (piste foncée)
    g.fillStyle(0x0f3a1c, 1); g.fillRect(0, H, LARGEUR, HAUTEUR - H);
    const quad = (d0, d1, x0, x1, couleur, alpha = 1) => {
      g.fillStyle(couleur, alpha); g.beginPath();
      g.moveTo(ecranX(x0, d0), ecranY(d0)); g.lineTo(ecranX(x1, d0), ecranY(d0));
      g.lineTo(ecranX(x1, d1), ecranY(d1)); g.lineTo(ecranX(x0, d1), ecranY(d1)); g.closePath(); g.fillPath();
    };
    // bandes de pelouse de 5 yards (deux verts)
    const debut = Math.floor((this.pos - 1) / 5) * 5;
    for (let L = debut; L < this.pos + VUE.loin; L += 5) {
      const d0 = Math.max(-0.9, L - this.pos), d1 = Math.min(VUE.loin, L + 5 - this.pos);
      if (d1 <= d0) continue;
      let couleur = (Math.round(L / 5) % 2) ? 0x2f8a3a : 0x3a9a44;
      if (L >= this.objectif) couleur = (L < this.objectif + 10) ? 0x15603a : 0x0f3a1c;
      quad(d0, d1, -B, B, couleur);
    }
    // lignes des yards
    g.lineStyle(3, 0xffffff, 0.85);
    let iN = 0;
    for (let L = Math.ceil((this.pos - 0.9) / 5) * 5; L < this.pos + VUE.loin && L <= this.objectif + 10; L += 5) {
      const d = L - this.pos, y = ecranY(d);
      g.lineStyle(Math.max(1, 4 * echelle(d)), 0xffffff, L === this.objectif ? 1 : 0.8);
      g.lineBetween(ecranX(-B, d), y, ecranX(B, d), y);
      // numéros des yards (comme sur un vrai terrain : 10, 20... 50... 20, 10)
      const yardTerrain = 100 - this.objectif + L, n = yardTerrain <= 50 ? yardTerrain : 100 - yardTerrain;
      if (L % 10 === 0 && n > 0 && L < this.objectif && iN < this.nombres.length - 1 && d > 0.5) {
        for (const s of [-1, 1]) {
          const t = this.nombres[iN++]; if (!t) break;
          const k = echelle(d);
          t.setText(String(n)).setPosition(ecranX(s * (B - 0.3), d), y - 14 * k).setScale(k * 1.1, k * 0.55).setVisible(true).setAlpha(0.85);
        }
      }
    }
    for (; iN < this.nombres.length; iN++) this.nombres[iN].setVisible(false);
    // lignes de touche
    for (const s of [-1, 1]) { g.lineStyle(5, 0xffffff, 0.9); g.lineBetween(ecranX(s * B, -0.9), ecranY(-0.9), ecranX(s * B, VUE.loin), ecranY(VUE.loin)); }
    // repères des couloirs (petits traits)
    g.lineStyle(2, 0xffffff, 0.35);
    for (let L = Math.ceil(this.pos); L < this.pos + 40; L += 1) {
      const d = L - this.pos; if (d < 0) continue;
      for (const x of [-0.5, 0.5]) { const y = ecranY(d); g.lineBetween(ecranX(x, d) - 6 * echelle(d), y, ecranX(x, d) + 6 * echelle(d), y); }
    }
    // l'en-but de Kédric : son nom écrit sur la pelouse
    const dEB = this.objectif + 5 - this.pos;
    if (dEB < VUE.loin && dEB > 0) {
      const k = echelle(dEB);
      this.texteEnBut.setVisible(true).setPosition(LARGEUR / 2, ecranY(dEB)).setScale(k * 1.4, k * 0.6);
    } else this.texteEnBut.setVisible(false);
    // les poteaux (jaunes) au fond de l'en-but
    const p = this.poteaux; p.clear();
    const dP = this.objectif + 10 - this.pos;
    if (dP < VUE.loin) {
      const k = echelle(dP), x = LARGEUR / 2, y = ecranY(dP);
      p.lineStyle(Math.max(2, 9 * k), 0xffd84a, 1);
      p.lineBetween(x, y, x, y - 260 * k);
      p.lineBetween(x - 150 * k, y - 260 * k, x + 150 * k, y - 260 * k);
      p.lineBetween(x - 150 * k, y - 260 * k, x - 150 * k, y - 640 * k);
      p.lineBetween(x + 150 * k, y - 260 * k, x + 150 * k, y - 640 * k);
    }
  }

  // Lignes de vitesse sur les côtés (à partir du niveau 3, et en Devil Bat Ghost)
  dessinerVitesse() {
    const g = this.lignesVitesse; g.clear();
    const fort = this.ghost > 0 ? 1 : Math.max(0, this.niveau - 2) / 3;
    if (fort <= 0 || this.etat !== 'jeu') return;
    const cx = LARGEUR / 2, cy = VUE.horizon;
    g.lineStyle(2, this.ghost > 0 ? 0x9fe0ff : 0xffffff, 0.25 + 0.35 * fort);
    for (let k = 0; k < 10 + fort * 14; k++) {
      const a = Math.random() * Math.PI * 2, r0 = 380 + Math.random() * 120, r1 = r0 + 120 + Math.random() * 200;
      const ax = Math.cos(a), ay = Math.sin(a) * 0.7;
      if (ay < -0.2) continue;
      g.lineBetween(cx + ax * r0, cy + 160 + ay * r0, cx + ax * r1, cy + 160 + ay * r1);
    }
  }

  afficher() {
    this.dessinerTerrain();
    this.dessinerVitesse();
    const j = this.j;
    // ---------- toi ----------
    const xJ = ecranX(j.x, 0);
    let pose = j.poseTemps > 0 && j.pose ? j.pose : (j.saut > 0 ? 'saut' : j.rotation > 0 ? 'rotation' : 'course');
    const hauteur = j.saut > 0 ? Math.sin(Math.PI * (1 - j.saut / R.saut.duree)) * 80 : 0;
    const cle = 'kedric_toi_' + pose;
    if (pose === 'course') {
      if (this.sprJ.texture.key !== cle || !this.sprJ.anims.isPlaying) this.sprJ.play(cle);
      this.sprJ.anims.timeScale = this.etat === 'jeu' && this.gel <= 0 ? 0.7 + this.niveau * 0.15 + (this.ghost > 0 ? 0.6 : 0) : 0;
    } else if (this.sprJ.texture.key !== cle) { this.sprJ.stop(); this.sprJ.setTexture(cle); }
    // une illustration de course = une seule image : on la fait rebondir à chaque foulée
    const foulee = pose === 'course' && this.estIllustre(cle) && this.etat === 'jeu' && this.gel <= 0;
    const pas = foulee ? Math.sin(this.horloge * (11 + this.niveau * 1.6 + (this.ghost > 0 ? 6 : 0))) : 0;
    this.sprJ.setPosition(xJ, VUE.pieds + 8 - hauteur - Math.abs(pas) * 9).setScale(this.zoom(cle) * (1 + Math.abs(pas) * 0.02), this.zoom(cle) * (1 - Math.abs(pas) * 0.02));
    this.sprJ.setAngle(j.rotation > 0 ? Math.sin(this.horloge * 30) * 6 : pas * 3);
    this.ombreJ.setPosition(xJ, VUE.pieds + 4).setScale(1 - hauteur / 200);
    // Devil Bat Ghost : images fantômes de chaque côté
    this.fantomes.forEach((f, k) => {
      if (this.ghost > 0 && this.etat === 'jeu') {
        const dec = Math.sin(this.horloge * 22 + k * 2.1) * (70 + k * 25);
        f.setTexture(this.sprJ.texture.key, this.sprJ.frame.name).setPosition(xJ + dec, this.sprJ.y).setScale(this.sprJ.scaleX, this.sprJ.scaleY).setAlpha(0.35 - k * 0.08);
      } else f.setAlpha(0);
    });
    // ---------- les défenseurs ----------
    for (const d of this.defs) this.afficherDefenseur(d);
    this.majHud();
  }

  afficherDefenseur(d) {
    const dist = d.pos - this.pos, k = echelle(dist);
    let pose;
    if (d.etat === 'rate') pose = 'rate';
    else if (d.etat === 'plaqueur') pose = d.type === 'haut' ? 'bras' : 'plonge';
    else if (d.etat === 'passe') pose = 'course';
    else if (d.star && this.duel && this.duel.phase === 'danse') pose = 'garde';
    else if (!d.alerte) pose = 'course';
    else {
      const ttc = dist / Math.max(1, this.vitesseRelative(d, this.vitesse()));
      pose = d.type === 'bas' ? (ttc > 0.3 ? 'bas' : 'plonge') : d.type === 'haut' ? 'bras' : 'garde';
    }
    const cle = d.prefixe + pose;
    if (d.poseActuelle !== cle) {
      d.poseActuelle = cle;
      if (this.anims.exists(cle) && this.textures.get(cle).frameTotal > 2) d.sprite.play(cle); else { d.sprite.stop(); d.sprite.setTexture(cle); }
    }
    const x = ecranX(d.x, dist), y = ecranY(dist);
    const montee = pose === 'bras' && d.etat === 'approche' ? 20 * k : 0;
    const illustre = this.estIllustre(cle);
    // course illustrée (une seule image) : petits rebonds ; Kédric en joueur n'a qu'une image : on la penche selon la pose
    const pas = illustre && (pose === 'course' || (d.star && pose === 'garde')) && d.etat !== 'plaqueur' ? Math.sin(this.horloge * 12 + d.groupe) : 0;
    let angle = d.etat === 'rate' ? d.angle * 0.25 : pas * 3, ecrase = 1;
    if (d.star && illustre) {
      if (pose === 'plonge') angle = (d.x >= this.j.x ? -1 : 1) * 60;
      else if (pose === 'bas') ecrase = 0.78;
      else if (pose === 'bras') angle = Math.sin(this.horloge * 20) * 8;
      else if (pose === 'rate') angle = d.sensChute * 80;
    }
    const z = k * this.zoom(cle) * (d.star ? 1.08 : 1.04);
    d.sprite.setPosition(x, y + 6 * k - montee - Math.abs(pas) * 8 * k).setScale(z, z * ecrase).setAngle(angle);
    // le plongeon illustré part vers la gauche : retourné s'il vient de ta gauche
    d.sprite.setFlipX(illustre && pose === 'plonge' && !d.star && d.x < this.j.x - 0.1);
    // ton illustration « plaqué » montre déjà le plaqueur
    d.sprite.setVisible(!(d.etat === 'plaqueur' && this.estIllustre('kedric_toi_plaque')));
    d.sprite.setDepth(500 - dist * 8 + (d.etat === 'plaqueur' ? 20 : 0));
    d.sprite.setAlpha(d.etat === 'rate' ? Math.max(0, 1 - d.chute * 0.9) : 1);
    if (this.ghost > 0 && d.etat === 'approche') d.sprite.setTint(0xbbbbcc); else d.sprite.clearTint();
    d.ombre.setPosition(x, y + 2).setScale(k).setVisible(d.etat !== 'rate');
    // le symbole : ce qu'il faut faire
    const S = d.etat === 'approche' && d.alerte && this.ghost <= 0 ? SYMBOLES[d.type === 'suiveur' ? (d.verrou ? 'verrou' : 'suiveur') : d.type] : null;
    if (S) {
      d.symbole.setVisible(true).setText(S.texte).setColor(S.couleur).setPosition(x, y - 215 * k - 18).setScale(Math.max(0.6, k * 1.3)).setDepth(890);
    } else d.symbole.setVisible(false);
  }

  // Aide près de toi : que faire contre le défenseur le plus proche (FACILE / NORMAL)
  majAide() {
    if (!this.diff.aide || this.ghost > 0) { this.aide.setVisible(false); return; }
    let proche = null;
    for (const d of this.defs) {
      if (d.etat !== 'approche' || !d.alerte || Math.abs(d.x - this.j.x) >= 0.5) continue;
      if (!proche || d.pos < proche.pos) proche = d;
    }
    if (!proche) { this.aide.setVisible(false); return; }
    const S = SYMBOLES[proche.type === 'suiveur' ? (proche.verrou ? 'verrou' : 'suiveur') : proche.type];
    this.aide.setVisible(true).setText(S.aide).setColor(S.couleur);
  }

  // =================================================================
  //  HUD
  // =================================================================
  creerHud() {
    const P = 920;
    // Kédric au micro, en haut à gauche
    this.cadreCoach = this.add.container(86, 74).setDepth(P);
    const fond = this.add.rectangle(0, 0, 132, 132, 0x0b2a16).setStrokeStyle(4, 0xffd84a);
    this.sprCoach = this.add.sprite(0, -4, 'kedric_coach', 0);
    this.sprCoach.setScale(Math.min(124 / this.sprCoach.width, 118 / this.sprCoach.height));
    const nom = texte(this, 0, 58, 'COACH KÉDRIC', 13, '#ffd84a');
    this.cadreCoach.add([fond, this.sprCoach, nom]);
    this.coachCrie = 0;
    // en haut à droite : action, tentatives, distance
    this.hudAction = texte(this, LARGEUR - 150, 26, '', 22, '#ffd84a', { fontStyle: 'bold' }).setDepth(P);
    this.hudTentatives = texte(this, LARGEUR - 150, 54, '', 18, '#ffffff').setDepth(P);
    this.hudYards = texte(this, LARGEUR - 150, 80, '', 18, '#ffffff').setDepth(P);
    this.hudBarre = this.add.graphics().setDepth(P);
    // à gauche : la vitesse ; à droite : la jauge du Devil Bat Ghost
    this.hudVitesse = this.add.graphics().setDepth(P);
    this.hudVitesseTexte = texte(this, 34, 440, '', 13, '#ffffff').setDepth(P);
    texte(this, 34, 182, 'VITESSE', 12, '#7fff7f').setDepth(P);
    this.hudGhost = this.add.graphics().setDepth(P);
    this.hudGhostTexte = texte(this, LARGEUR - 34, 182, 'GHOST', 12, '#9fe0ff').setDepth(P);
    this.hudPret = texte(this, LARGEUR - 34, 440, '', 13, '#9fe0ff', { fontStyle: 'bold' }).setDepth(P);
  }

  majHud() {
    if (!this.hudAction) return;
    if (this.coachCrie > 0) this.coachCrie -= 1 / 60;
    this.sprCoach.setFrame(this.coachCrie > 0 ? 1 : 0);
    const A = ACTIONS[this.numAction];
    const t1 = `${A.nom} / ${ACTIONS.length}`;
    if (this.hudAction.text !== t1) this.hudAction.setText(t1);
    const t2 = 'TENTATIVES ' + '●'.repeat(Math.max(0, this.tentatives)) + '○'.repeat(Math.max(0, this.diff.tentatives - this.tentatives));
    if (this.hudTentatives.text !== t2) this.hudTentatives.setText(t2);
    const reste = Math.max(0, Math.ceil(this.objectif - this.pos));
    const t3 = `EN-BUT : ${reste} yards`;
    if (this.hudYards.text !== t3) this.hudYards.setText(t3);
    const b = this.hudBarre; b.clear();
    b.fillStyle(0x000000, 0.5); b.fillRect(LARGEUR - 260, 96, 220, 10);
    b.fillStyle(0x7fff7f, 1); b.fillRect(LARGEUR - 260, 96, 220 * borne(this.pos / this.objectif, 0, 1), 10);
    b.lineStyle(2, 0xffffff, 0.8); b.strokeRect(LARGEUR - 260, 96, 220, 10);
    // vitesse : 5 crans
    const v = this.hudVitesse; v.clear();
    for (let k = 0; k < R.niveauMax; k++) {
      const y = 410 - k * 44;
      v.fillStyle(k < this.niveau || this.ghost > 0 ? (this.ghost > 0 ? 0x9fe0ff : [0x7fff7f, 0xb8ff5a, 0xffd84a, 0xff9a3c, 0xff4a4a][k]) : 0x000000, k < this.niveau || this.ghost > 0 ? 1 : 0.45);
      v.fillRect(20, y - 36, 28, 38);
      v.lineStyle(2, 0xffffff, 0.7); v.strokeRect(20, y - 36, 28, 38);
    }
    const t4 = `40 yd\n${(40 / this.vitesse()).toFixed(1)} s`;
    if (this.hudVitesseTexte.text !== t4) this.hudVitesseTexte.setText(t4);
    // jauge du Devil Bat Ghost
    const g = this.hudGhost; g.clear();
    const plein = this.jauge >= this.diff.ghost, f = this.ghost > 0 ? this.ghost / R.ghost.duree : this.jauge / this.diff.ghost;
    g.fillStyle(0x000000, 0.5); g.fillRect(LARGEUR - 48, 194, 28, 220);
    g.fillStyle(plein && Math.floor(this.horloge * 6) % 2 ? 0xffffff : 0x9fe0ff, 1); g.fillRect(LARGEUR - 48, 194 + 220 * (1 - f), 28, 220 * f);
    g.lineStyle(2, 0xffffff, 0.8); g.strokeRect(LARGEUR - 48, 194, 28, 220);
    const t5 = plein && this.ghost <= 0 ? (estTactile() ? 'Ghost !' : 'ESPACE !') : '';
    if (this.hudPret.text !== t5) this.hudPret.setText(t5);
  }
}
