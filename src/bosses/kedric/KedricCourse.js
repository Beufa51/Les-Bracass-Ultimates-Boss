// =====================================================================
// KÉDRIC : match de football américain façon Eyeshield 21, vu de DOS.
// 3 COURSES : chacune commence par un COUP D'ENVOI (le ballon arrive du fond du terrain, ▲ au bon moment = super
// réception), puis tu remontes TOUT le terrain d'une traite face à la défense de Kédric, rang après rang.
// Plaqué = la course s'arrête là ; personne ne t'arrête = TOUCHDOWN. Z (tapé vite) = SPRINT, pour semer ceux qui te poursuivent.
//  - ◀ ▶ : changer de couloir (plaqueur debout, mur de 2 défenseurs)
//  - ▲ : sauter (plaquage aux jambes)      ▼ : se baisser en tournant (bras tendus)
//  - chaque esquive d'affilée te fait accélérer ; les défenseurs esquivés de côté peuvent te POURSUIVRE ;
//  - esquives PARFAITES = jauge du DEVIL BAT GHOST (Espace : le prochain défenseur est passé à coup sûr).
// Après les 3 courses : le BATTLE DE DANSE contre Kédric (showtime.js), le boss de fin ; tes touchdowns mettent le public de ton côté.
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
import { estTactile, etiquettesTactiles, disposition } from '../../core/tactile.js';
import { Sauvegarde, formatTemps, lignesDefis } from '../../core/sauvegarde.js';
import { choisirDifficulte, cleRecord } from './difficulte.js';
import { Showtime } from './showtime.js';
import { IDENTITE, DIFFICULTES, VUE, REGLAGES as R, COURSES, COUVERTURE, FORMATIONS, VERROU_SUIVEUR, REPLIQUES } from './reglages.js';

const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)];
const entre = (min, max) => min + Math.random() * (max - min);
const borne = Phaser.Math.Clamp;

// ---------- la perspective : d = yards devant toi (0 = à tes pieds) ----------
const echelle = (d) => VUE.recul / Math.max(0.05, d + VUE.recul);
const ecranY = (d) => VUE.horizon + (VUE.pieds - VUE.horizon) * echelle(d);
const ecranX = (x, d) => LARGEUR / 2 + x * VUE.largeurCouloir * echelle(d);

// le terrain du KÉDRIC SHOW va de 0 (ton en-but) à EN_BUT (celui de Kédric) : plus long qu'un vrai terrain (réglage `terrain`)
const EN_BUT = R.terrain;
const MILIEU = EN_BUT / 2;

// ce qu'il faut faire contre chaque type de défenseur
const SYMBOLES = {
  bloc: { texte: '◀ ▶', couleur: '#ffffff', aide: '◀ ▶  CHANGE DE COULOIR !' },
  bas: { texte: '▲', couleur: '#ffd84a', aide: '▲  SAUTE !' },
  haut: { texte: '▼', couleur: '#d9a0ff', aide: '▼  BAISSE-TOI !' },
  suiveur: { texte: '◎', couleur: '#ff9a3c', aide: 'IL TE SUIT... attends qu\'il soit ROUGE !' },
  verrou: { texte: '◀ ▶', couleur: '#ff4a4a', aide: '◀ ▶  MAINTENANT !' },
};
// explications du mode ENTRAÎNEMENT (avec ralenti) : une fois par type de plaquage, à chaque partie
const TUTO = {
  bloc: 'PLAQUEUR dans ton couloir : ◀ ou ▶ pour l\'éviter !',
  bas: 'Il plonge aux JAMBES : ▲ pour sauter par-dessus !',
  haut: 'BRAS TENDUS : ▼ pour passer dessous en tournant !',
  suiveur: 'Le POT DE COLLE te suit : attends qu\'il devienne ROUGE, puis ◀ ▶ !',
};

// hauteur du symbole au-dessus des pieds selon la pose (plus bas quand il plonge, sinon on ne sait plus à qui il est)
const HAUTEUR_POSE = { course: 215, garde: 200, bas: 165, plonge: 120, bras: 240, rate: 150 };

// les illustrations sont enregistrées 1,5 fois plus grandes que leur taille à l'écran (plus nettes)
const ZOOM_ILLUSTRE = 1 / 1.5;

const ETIQUETTES_JEU = { haut: '▲', bas: '▼', gauche: '◀', droite: '▶', espace: 'Ghost', z: 'Sprint', x: null };
const ETIQUETTES_OK = { haut: null, bas: null, gauche: null, droite: null, espace: 'OK', z: null, x: null };

export class KedricCourse extends BossScene {
  constructor() { super('KedricCourse', IDENTITE); }

  create() {
    this.phase = this.donnees.phase || 'action1';
    this.etat = 'intro';          // intro | envoi | jeu | pause | showtime | fin
    this.attente = 0; this.apresAttente = null;
    this.gel = 0;                 // jeu figé un instant (impact, cinématique)
    this.ralenti = 1;             // < 1 pendant l'explication d'un nouveau plaquage
    this.ralentiDrame = 0;        // le ralenti DRAMATIQUE : temps RÉEL restant (se décompte dans pas())
    this.horloge = 0; this.memoire = {};
    this.nomDiff = 'normal'; this.diff = DIFFICULTES.normal;
    this.numAttaque = 0; this.attaque = COURSES[0];
    this.score = { toi: 0, ked: 0 };
    this.pos = R.envoi.depart;
    this.boost = 0; this.finale = null; this.retour = false; this.envoi = null; this.prochain = null;
    this.ghostAction = false; this.file = [];
    this.niveau = 0; this.serie = 0; this.jauge = 0; this.ghostArme = 0;
    this.tempsTotal = 0;
    this.stats = { plaquages: 0, esquives: 0, parfaits: 0, ghosts: 0, touchdowns: 0 };
    this.defs = []; this.groupe = 0; this.poursuivants = [];
    this.duel = null; this.kedricVu = false;
    this.tutoVus = {}; this.tuto = null;
    this.j = { voie: 0, x: 0, saut: 0, sautDebut: -9, rotation: 0, rotationDebut: -9, recharge: 0, changeT: -9, ancienneVoie: 0, pose: null, poseTemps: 0 };

    // ---------- le décor ----------
    this.dessinerStade();
    this.terrain = this.add.graphics().setDepth(1);
    this.lignesVitesse = this.add.graphics().setDepth(3);
    this.nombres = [];
    for (let k = 0; k < 18; k++) this.nombres.push(this.add.text(0, 0, '', { fontFamily: 'monospace', fontStyle: 'bold', fontSize: '40px', color: '#ffffff' }).setOrigin(0.5).setDepth(2).setVisible(false));
    this.texteEnBut = this.add.text(0, 0, 'KÉDRIC', { fontFamily: 'monospace', fontStyle: 'bold italic', fontSize: '90px', color: '#ffd84a', stroke: '#0b3d20', strokeThickness: 10 }).setOrigin(0.5).setDepth(2).setVisible(false);
    this.poteaux = this.add.graphics().setDepth(4);
    this.reperes = this.add.graphics().setDepth(6);   // cible du coup d'envoi, anneau sous le prochain défenseur
    this.ombreBallon = this.add.ellipse(0, 0, 40, 12, 0x000000, 0.35).setDepth(6).setVisible(false);
    this.ballon = this.add.sprite(0, 0, 'kedric_ballon').play('kedric_ballon').setDepth(965).setVisible(false);

    // ---------- toi ----------
    this.ombreJ = this.add.ellipse(0, 0, 110, 26, 0x000000, 0.35).setDepth(499);
    this.fantomes = [0, 1, 2].map(() => this.add.sprite(0, 0, 'kedric_toi_course').setOrigin(0.5, 1).setTint(0x9fe0ff).setAlpha(0).setDepth(498));
    this.sprJ = this.add.sprite(0, 0, 'kedric_toi_course').setOrigin(0.5, 1).setDepth(500);
    this.sprJ.play('kedric_toi_course');
    this.aide = texte(this, LARGEUR / 2, 512, '', 26, '#ffffff', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 12, y: 4 } }).setDepth(900).setVisible(false);
    // bandeau de l'action (avant le « HUT ! ») et alerte de poursuite
    this.bandeau = texte(this, LARGEUR / 2, 214, '', 28, '#ffffff', { fontStyle: 'bold', backgroundColor: '#0b2a16dd', padding: { x: 16, y: 8 }, wordWrap: { width: 880 } }).setDepth(905).setVisible(false);   // retour à la ligne auto : plus JAMAIS de phrase qui déborde de l'écran
    this.alertePoursuite = texte(this, LARGEUR / 2, 470, '', 24, '#ff5a5a', { fontStyle: 'bold' }).setDepth(905).setVisible(false);

    this.creerHud();
    // téléphone : ◀ ▶ sous le pouce gauche, ▲ ▼ (et Ghost, Sprint) sous le pouce droit, comme au battle de danse
    disposition('separee');
    this.events.once('shutdown', () => disposition('normale'));
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
      `${R.courses} COURSES : traverse tout le terrain d'une traite... puis le BATTLE DE DANSE !`,
      'COUP D\'ENVOI : va sous le ballon, ▲ juste avant qu\'il arrive = SUPER RÉCEPTION',
      'Un seul plaquage et la course s\'arrête ; personne ne t\'arrête = TOUCHDOWN',
      '◀ ▶ : change de couloir      ▲ : saute      ▼ : baisse-toi en tournant',
      'Le symbole au-dessus du prochain défenseur te dit quoi faire.',
      (tactile ? 'Sprint' : 'Z') + ' tapé vite = SPRINT (pour semer ceux qui te poursuivent)',
      'Esquive au DERNIER moment = PARFAIT : remplit la jauge GHOST',
      'Jauge pleine : ' + (tactile ? 'Ghost' : 'ESPACE') + ' = DEVIL BAT GHOST (passe le défenseur suivant)',
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
    // menu F1 : directement le battle de danse (après 2 touchdowns)
    if (this.phase === 'finale') { this.score = { toi: 2 * R.points, ked: 0 }; this.stats.touchdowns = 2; this.debutFinale(); }
    else { this.score = { toi: 0, ked: 0 }; this.points = 0; this.debutAttaque(0); }   // this.points : le SCORE DE SHOW (esquives x vitesse)
  }

  debutAttaque(n) {
    this.numAttaque = n;
    this.attaque = COURSES[n];
    this.viderDefenseurs();
    this.pos = R.envoi.depart;
    this.etat = 'pause';
    etiquettesTactiles(ETIQUETTES_JEU);
    const A = this.attaque;
    const e = encart(this, `${A.nom}  ${n + 1} / ${R.courses}`, `« ${A.titre} »  -  touchdowns : ${this.stats.touchdowns}`, '#ffd84a', 0x0b2a16);
    jouerSon(this, 'kedric_sifflet');
    this.attendre(1.8, () => {
      e.fermer();
      this.coupEnvoi();
    });
  }

  // remise à zéro au début d'une course
  preparerAction() {
    this.viderDefenseurs();
    this.niveau = 0; this.serie = 0;
    this.ghostArme = 0; this.ghostAction = false; this.duel = null; this.boost = 0;
    Object.assign(this.j, { voie: 0, x: 0, saut: 0, rotation: 0, recharge: 0, pose: null, poseTemps: 0, sautDebut: -9 });
  }

  // =================================================================
  //  LE COUP D'ENVOI
  // =================================================================
  // COUP D'ENVOI : le ballon arrive du fond du terrain ; le vent peut le faire changer de couloir en route.
  // ▲ pile quand il arrive = réception PARFAITE (vitesse 3 + Ghost), presque = BIEN (vitesse 2), sinon attrapé (vitesse 0).
  coupEnvoi() {
    this.preparerAction();
    this.pos = R.envoi.depart;
    // l'équipe du coup d'envoi : au fond, elle arrive déjà sur toi
    for (const [prof, type, couloir] of COUVERTURE.liste) this.placerRang(this.pos + prof + 10, type, couloir);
    for (const d of this.defs) d.charge = true;
    this.retour = true;
    // derrière elle, toute la défense de la course jusqu'à l'en-but
    this.preparerFile(this.pos + COUVERTURE.liste[COUVERTURE.liste.length - 1][0] + 10 + R.defense.espace + R.defense.souffle);
    this.lancerBallon();
    jouerSon(this, 'kedric_sifflet');
    jouerSon(this, 'kedric_plaque', { volume: 0.4, rate: 1.6 });   // le coup de pied
    this.direCoach(REPLIQUES.envoi, 1000, true);
    this.bandeau.setText('COUP D\'ENVOI : va sous le ballon !\n▲ PILE quand il arrive = SUPER RÉCEPTION !').setColor('#ffd84a').setVisible(true);
  }

  // le ballon part du fond du terrain
  lancerBallon() {
    const P = R.envoi;
    const depart = Math.random() < 0.65 ? auHasard([-1, 1]) : 0;
    // le vent peut le faire changer de couloir en route
    const arrivee = Math.random() < 0.5 ? auHasard([-1, 0, 1].filter(k => k !== depart)) : depart;
    this.envoi = { t: 0, vol: P.vol, hauteur: P.hauteur, loin: 60, depart, voie: depart, arrivee, rebond: 0, resolu: false };
    this.etat = 'envoi';
    this.memoire = {};
  }

  majEnvoi(dt) {
    const E = this.envoi;
    this.tempsTotal += dt;
    this.majJoueur(dt);
    // l'équipe du coup d'envoi descend
    for (const d of this.defs) if (d.etat === 'approche') d.pos -= this.diff.charge * dt;
    if (E.rebond > 0) {
      // ballon raté : tu le ramasses
      E.rebond -= dt;
      if (E.rebond <= 0) this.debutRetour(0);
      return;
    }
    E.t += dt;
    if (E.t > 1) this.bandeau.setVisible(false);   // on dégage la vue pour suivre le ballon
    // le vent décide du couloir final en cours de vol
    if (E.t >= E.vol * R.envoi.choix) E.voie += borne(E.arrivee - E.voie, -dt * 3, dt * 3);
    if (E.t >= E.vol && E.dansCouloir === undefined) E.dansCouloir = Math.abs(this.j.x - E.arrivee) < 0.5;
    // on laisse un tout petit délai après l'arrivée pour un ▲ un peu tardif
    if (E.t < E.vol + R.envoi.parfait) return;
    this.ballon.setVisible(false); this.ombreBallon.setVisible(false);
    const j = this.j;
    if (E.dansCouloir) {
      const ecart = Math.abs(j.sautDebut - (this.horloge - (E.t - E.vol)));
      const x = ecranX(j.x, 0), y = VUE.pieds - 230;
      if (ecart <= R.envoi.parfait) {
        this.stats.parfaits++; this.remplirGhost(R.ghost.parParfait);
        this.points += 30;   // la RÉCEPTION PARFAITE du coup d'envoi paie aussi
        jouerSon(this, 'kedric_parfait');
        onomatopee(this, LARGEUR / 2, 260, 'RÉCEPTION PARFAITE !', 44, '#7fe8ff');
        lignesImpact(this, x, y, 0x9fe0ff, 18, 180);
        this.debutRetour(3);
      } else if (ecart <= R.envoi.bien) {
        jouerSon(this, 'kedric_niveau');
        onomatopee(this, LARGEUR / 2, 260, 'BIEN ATTRAPÉ !', 38, '#7fff7f');
        this.remplirGhost(R.ghost.parEsquive);
        this.debutRetour(2);
      } else {
        jouerSon(this, 'kedric_saut', { rate: 0.8 });
        onomatopee(this, LARGEUR / 2, 260, 'ATTRAPÉ', 32, '#ffffff');
        this.debutRetour(0);
      }
      if (Math.random() < 0.4) this.direCoach(auHasard(REPLIQUES.reception));
    } else {
      // coup d'envoi raté : il rebondit, tu perds du temps à le ramasser (et ils se rapprochent)
      E.rebond = R.envoi.rebond;
      jouerSon(this, 'kedric_alerte', { rate: 0.6 });
      onomatopee(this, ecranX(E.arrivee, 1), VUE.pieds - 120, 'BOING !', 36, '#ff9a3c');
      this.messageCentre('Raté ! Tu ramasses le ballon...', '#ff9a3c');
      this.direCoach(REPLIQUES.rate, 1400, true);
      j.voie = E.arrivee;
    }
  }

  // la course commence après une réception : niveau de vitesse de départ selon la réception
  debutRetour(niveau) {
    this.etat = 'jeu';
    this.envoi = null;
    this.bandeau.setVisible(false);
    this.niveau = niveau; this.serie = niveau * R.esquivesParNiveau;
    this.memoire = {};
    // la réception se VOIT : plus tu l'as bien attrapé, plus tu pars vite (niveau de vitesse de départ)
    if (niveau >= 3) this.messageCentre('DÉPART TURBO ! Réception PARFAITE : 3 crans de vitesse déjà montés !', '#ff9a3c', 24, 1.6);
    else if (niveau === 2) this.messageCentre('BON DÉPART ! La vitesse est déjà à moitié montée !', '#7fff7f', 24, 1.6);
    else this.messageCentre('Réception molle : tu pars de ZÉRO — reste synchro pour monter en vitesse !', '#ffffff', 22, 1.6);
  }

  // Toute la défense de la course, rang après rang jusqu'à l'en-but, dans l'ordre des formations de la course.
  // Les rangs entrent en jeu au fur et à mesure qu'on approche (voir majJeu). Avec kedric: true, il garde l'en-but.
  preparerFile(depart) {
    const A = this.attaque;
    this.file = [];
    let pos = depart, i = 0;
    while (pos < EN_BUT - R.defense.finAvant) {
      const F = FORMATIONS[A.formations[i++ % A.formations.length]];
      F.liste.forEach(([type, couloir], k) => {
        if (pos >= EN_BUT - R.defense.finAvant) return;
        // au premier rang d'une formation, Kédric crie son nom
        this.file.push({ pos, type, couloir, nom: k === 0 ? F.nom : null });
        pos += R.defense.espace;
      });
      pos += R.defense.souffle;   // un petit répit entre deux formations
    }
    if (A.kedric) this.file.push({ pos: EN_BUT + 2, kedric: true });
  }

  // les rangs proches entrent en jeu
  appelerRangs() {
    while (this.file.length && this.file[0].pos - this.pos < VUE.loin - 5) {
      const r = this.file.shift();
      if (r.kedric) {
        const d = this.ajouterDefenseur({ pos: r.pos, type: 'bloc', voie: 0, groupe: ++this.groupe, star: true });
        d.etat = 'attend';   // il attend son heure (le duel commence quand tu arrives près de lui, seul)
        continue;
      }
      if (r.nom) this.direCoach(r.nom, 1300, true);
      this.placerRang(r.pos, r.type, r.couloir);
    }
  }

  placerRang(pos, type, couloir, ligneDef = false) {
    const g = ++this.groupe;
    let voies;
    if (couloir === 'tous') voies = [-1, 0, 1];
    else if (couloir === 'mur') {
      // le trou est tiré UNE fois (avant, il était retiré pour chaque couloir : parfois 3 couloirs bouchés, une ligne impassable)
      const trou = this.trouLigne();
      voies = ligneDef || !this.diff.murTardif ? [-1, 0, 1].filter(v => v !== trou) : ['mur', 'mur'];
    }
    else voies = [null];   // 'toi' : il vise ton couloir jusqu'au dernier moment
    voies.forEach((vo, i) => {
      const d = this.ajouterDefenseur({ pos, type, voie: vo === 'mur' ? (i ? 1 : -1) : vo, groupe: g });
      if (vo === 'mur') d.mur = true;   // le trou du mur est choisi au dernier moment (jamais dans ton couloir)
      d.ligne = ligneDef;
      // plongeon et bras tendus seuls dans ton couloir : ils te suivent jusqu'au bout (◀ ▶ ne suffit pas)
      d.colle = vo === null && (type === 'bas' || type === 'haut');
      d.x += (Math.random() - 0.5) * 0.1;
    });
  }
  // le trou dans la ligne : à gauche ou à droite (tu pars du milieu)
  trouLigne() { return auHasard([-1, 1]); }

  attendre(duree, ensuite) { this.attente = duree; this.apresAttente = ensuite; }

  // Un seul message au centre de l'écran à la fois (le nouveau remplace l'ancien)
  messageCentre(contenu, couleur = '#ffd84a', taille = 28, duree = 1.2) {
    if (this.msgCentre && this.msgCentre.active) this.msgCentre.destroy();
    const t = this.msgCentre = texte(this, LARGEUR / 2, 300, contenu, taille, couleur, { fontStyle: 'bold' }).setDepth(910);
    this.tweens.add({ targets: t, alpha: 0, delay: duree * 1000, duration: 300, onComplete: () => t.destroy() });
    return t;
  }

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
    for (const k of ['gauche', 'droite', 'haut', 'bas', 'espace', 'z']) if (e[k]) this.memoire[k] = this.horloge;
    if (this.attente > 0) {
      this.attente -= dt;
      if (this.attente <= 0 && this.apresAttente) { const f = this.apresAttente; this.apresAttente = null; f(); }
    }
    if (this.etat === 'envoi') { this.majEnvoi(dt); return; }
    if (this.etat === 'showtime') { this.show.maj(dt, e); return; }
    if (this.etat !== 'jeu') return;
    if (this.gel > 0) { this.gel -= dt; if (this.gel <= 0 && this.apresGel) { const f = this.apresGel; this.apresGel = null; f(); } return; }
    // le ralenti dramatique se décompte en temps RÉEL (dt), pas au ralenti
    if (this.ralentiDrame > 0) { this.ralentiDrame -= dt; if (this.ralentiDrame <= 0) this.ralenti = 1; }
    this.majJeu(dt * this.ralenti);
  }

  lireTouches() {
    const t = this.touches, jd = Phaser.Input.Keyboard.JustDown;
    const e = { gauche: jd(t.gauche), droite: jd(t.droite), haut: jd(t.haut), bas: jd(t.bas), espace: jd(t.espace), z: jd(t.z) };
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
      if (!debut || !['jeu', 'envoi'].includes(this.etat)) { debut = null; return; }
      const dx = p.x - debut.x, dy = p.y - debut.y; debut = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
      this.balaye = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'gauche' : 'droite') : (dy < 0 ? 'haut' : 'bas');
    });
  }

  vitesse() {
    return (R.vitesseBase + this.niveau * R.pasVitesse) * this.diff.vitesse + this.boost;
  }
  alerte() { return this.diff.alerte * (1 - R.alerteParNiveau * this.niveau); }

  // Toi : couloirs, saut, rotation, sprint (aussi pendant les réceptions)
  majJoueur(dt) {
    const j = this.j;
    if (j.recharge > 0) j.recharge -= dt;
    if (j.saut > 0) { j.saut -= dt; if (j.saut <= 0) j.recharge = R.saut.recharge; }
    if (j.rotation > 0) { j.rotation -= dt; if (j.rotation <= 0) j.recharge = R.rotation.recharge; }
    if (j.poseTemps > 0) j.poseTemps -= dt;
    const libre = j.saut <= 0 && j.rotation <= 0 && j.recharge <= 0;
    if (this.aAppuye('gauche') && j.voie > -1) this.changerCouloir(-1);
    if (this.aAppuye('droite') && j.voie < 1) this.changerCouloir(1);
    if (libre && this.aAppuye('haut')) { j.saut = R.saut.duree; j.sautDebut = this.horloge; jouerSon(this, 'kedric_saut'); }
    else if (libre && this.aAppuye('bas')) { j.rotation = R.rotation.duree; j.rotationDebut = this.horloge; jouerSon(this, 'kedric_esquive', { rate: 0.8 }); }
    j.x += borne(j.voie - j.x, -dt / R.changementCouloir, dt / R.changementCouloir);
    // sprint : chaque appui sur Z ajoute de la vitesse, qui retombe toute seule
    if (this.aAppuye('z', 0.05)) { this.boost = Math.min(R.sprint.max, this.boost + R.sprint.parAppui); this.flashSprint = 0.15; }
    this.boost = Math.max(0, this.boost - this.boost * R.sprint.baisse * dt);
  }

  majJeu(dt) {
    this.tempsTotal += dt;
    this.majJoueur(dt);
    if (this.aAppuye('espace', 0.05) && this.jauge >= this.diff.ghost && this.ghostArme <= 0) this.armerGhost();
    if (this.ghostArme > 0) {
      this.ghostArme -= dt;
      if (this.ghostArme <= 0) this.messageCentre(this.ghostPasses ? `GHOST : ${this.ghostPasses} défenseur(s) passé(s) !` : 'Ghost dans le vide...', '#9fe0ff', 24, 0.9);
    }

    // ---------- on avance ----------
    // pendant le duel, tu restes face à Kédric (le terrain ne défile pas) : son rythme est toujours le même
    const enDuel = this.duel && this.duel.vies > 0;
    const v = enDuel ? 0 : this.vitesse();
    this.pos += v * dt;
    if (this.pos >= EN_BUT) { this.pos = EN_BUT; this.touchdown(); return; }
    this.appelerRangs();

    // ---------- Kédric en personne : le duel commence quand tu arrives près de lui, et que tous les autres sont passés ----------
    const star = this.defs.find(d => d.star && d.etat === 'attend');
    if (star && star.pos - this.pos <= R.duel.distance + 2 && this.defs.every(d => d.star || d.etat !== 'approche')) this.entreeKedric(star);
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
    if (this.etat === 'jeu') this.majPoursuivants(dt, v);
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
  ajouterDefenseur({ pos, type, voie, groupe, star = false }) {
    const prefixe = star ? 'kedric_star_' : 'kedric_def_';
    const d = {
      pos, type, groupe, star, prefixe,
      voie: voie === null ? this.j.voie : voie, x: voie === null ? this.j.voie : voie,
      suit: voie === null,           // 'toi' : il vise ton couloir jusqu'au dernier moment
      etat: 'approche', alerte: false, verrou: false, menace: false, charge: false, chute: 0, angle: 0, poseActuelle: null,
      sprite: this.add.sprite(0, 0, prefixe + 'garde').setOrigin(0.5, 1),
      ombre: this.add.ellipse(0, 0, 120, 24, 0x000000, 0.3).setDepth(5),
      symbole: texte(this, 0, 0, '', 40, '#ffffff', { fontStyle: 'bold' }).setVisible(false),
    };
    this.defs.push(d);
    return d;
  }

  viderDefenseurs() {
    for (const d of this.defs) { d.sprite.destroy(); d.ombre.destroy(); d.symbole.destroy(); }
    this.defs = [];
    this.viderPoursuivants();
  }

  viderPoursuivants() {
    for (const p of this.poursuivants) p.sprite.destroy();
    this.poursuivants = [];
    if (this.alertePoursuite) this.alertePoursuite.setVisible(false);
  }

  // vitesse à laquelle le défenseur se rapproche de toi
  vitesseRelative(d, v) {
    if (d.star) return (this.duel && this.duel.vies > 0 ? 0 : v) + (this.duel && this.duel.phase === 'charge' ? R.duel.charge : 0);
    return v + (d.charge ? this.diff.charge : 0);
  }

  majDefenseur(d, dt, v) {
    if (d.etat === 'rate') {
      // il s'écroule sur le côté
      d.chute += dt; d.x += d.sensChute * dt * 1.6; d.angle += d.sensChute * dt * 260;
      return;
    }
    if (d.etat !== 'approche' || d.star) return;   // Kédric : géré par majDuel
    // en place, puis il fonce sur toi (sauf la ligne, occupée avec tes bloqueurs)
    if (!d.charge && !d.ligne && (d.pos - this.pos) / v < R.chargeAvant) d.charge = true;
    if (d.charge) d.pos -= this.diff.charge * dt;
    const ttc = (d.pos - this.pos) / this.vitesseRelative(d, v);
    // un mur de 2 défenseurs choisit son trou au dernier moment : jamais dans ton couloir
    if (d.mur && ttc < this.alerte() + 0.5) {
      const libre = auHasard([-1, 0, 1].filter(k => k !== this.j.voie));
      const voies = [-1, 0, 1].filter(k => k !== libre);
      this.defs.filter(o => o.groupe === d.groupe).forEach((o, i) => { o.mur = false; o.voie = voies[i]; });
    }
    // il vise ton couloir, puis se décide (le suiveur : jusqu'au verrou ; plongeon et bras tendus : jusqu'au bout)
    if (d.colle) d.voie = this.j.voie;
    else if (d.suit) {
      const limite = d.type === 'suiveur' ? VERROU_SUIVEUR : this.alerte() + 0.35;
      if (ttc > limite) d.voie = this.j.voie;
      else { d.suit = false; if (d.type === 'suiveur') { d.verrou = true; jouerSon(this, 'kedric_alerte', { rate: 1.5 }); } }
    }
    const vx = d.colle ? 9 : d.type === 'suiveur' ? 7 : d.charge || d.ligne ? 5 : 2;
    d.x += borne(d.voie - d.x, -dt * vx, dt * vx);
    this.alerterSiBesoin(d, ttc);
  }

  alerterSiBesoin(d, ttc) {
    const enFace = Math.abs(d.x - this.j.x) < 0.5;
    if (ttc < this.alerte()) {
      if (!d.alerte) {
        d.alerte = true;
        if (this.groupeSonne !== d.groupe) { this.groupeSonne = d.groupe; jouerSon(this, 'kedric_alerte'); }
        // explication avec ralenti (mode ENTRAÎNEMENT seulement : plus JAMAIS tout seul dans une première partie)
        if (this.diff.aide && enFace && !this.tutoVus[d.type] && TUTO[d.type]) this.debutTuto(d);
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
    const type = d.star ? this.duel.vrai : d.type;
    // plongeon et bras tendus qui te suivent (et Kédric) : ◀ ▶ ne suffit pas, il faut ▲ ou ▼
    const colle = d.colle || (d.star && (type === 'bas' || type === 'haut'));
    const enFace = colle || Math.abs(d.x - j.x) < 0.5;
    // BUGFIX COLLISION : ◀ ▶ pressé juste avant le contact mais le perso n'a pas fini de glisser
    // de couloir → l'esquive COMPTE quand même (avant : plaqué alors que la réaction était la bonne)
    if (enFace && !colle && this.horloge - j.changeT <= this.diff.parfait + 0.08 && Math.abs(d.x - j.voie) >= 0.5) {
      this.esquive(d, this.horloge - j.changeT <= this.diff.parfait ? 'parfait' : 'cote');
      return;
    }
    if (this.tuto && this.tuto.d === d) this.finTuto();
    if (!enFace) {
      if (d.menace || d.star) this.esquive(d, this.horloge - j.changeT <= this.diff.parfait ? 'parfait' : 'cote');
      else { d.etat = 'passe'; }
      return;
    }
    if (this.ghostArme > 0) { this.passeGhost(d); return; }
    const fen = this.diff.parfait + 0.06;
    if (type === 'bas' && j.saut > 0) { this.esquive(d, this.horloge - j.sautDebut <= fen ? 'parfait' : 'saut'); return; }
    if (type === 'haut' && j.rotation > 0) { this.esquive(d, this.horloge - j.rotationDebut <= fen ? 'parfait' : 'rotation'); return; }
    // plaqué ! (et pourquoi)
    let pourquoi = null;
    if (type === 'bas') pourquoi = this.horloge - j.sautDebut < 1 ? 'Trop tôt !' : (j.rotation > 0 ? 'Il fallait SAUTER (▲) !' : 'SAUTE (▲) !');
    if (type === 'haut') pourquoi = this.horloge - j.rotationDebut < 1 ? 'Trop tôt !' : (j.saut > 0 ? 'Il fallait te BAISSER (▼) !' : 'BAISSE-TOI (▼) !');
    if (type === 'bloc' || type === 'suiveur') pourquoi = j.saut > 0 || j.rotation > 0 ? 'Change de COULOIR (◀ ▶) !' : null;
    this.plaque(d, pourquoi);
  }

  esquive(d, comment) {
    // les défenseurs d'un même groupe qui ne te visaient pas passent simplement
    for (const o of this.defs) if (o.groupe === d.groupe && o !== d && o.etat === 'approche' && o.pos - this.pos <= 0.3) o.etat = 'passe';
    d.etat = 'rate'; d.chute = 0; d.sensChute = d.x >= this.j.x ? 1 : -1; if (Math.abs(d.x - this.j.x) < 0.3) d.sensChute = auHasard([-1, 1]);
    const parfait = comment === 'parfait';
    const x = ecranX(this.j.x, 0), y = VUE.pieds - 250;
    if (comment !== 'ghost') {
      this.stats.esquives++;
      this.serie++;
      // chaque esquive remplit la jauge du Ghost ; une PARFAITE la remplit plus
      this.remplirGhost(parfait ? R.ghost.parParfait : R.ghost.parEsquive);
      if (parfait) {
        this.stats.parfaits++;
        jouerSon(this, 'kedric_parfait');
        onomatopee(this, x, y, 'PARFAIT !', 40, '#7fe8ff');
        lignesImpact(this, x, y + 60, 0x9fe0ff, 16, 150);
      } else jouerSon(this, 'kedric_esquive');
      this.monterVitesse(x, y);
      // LE SCORE DE SHOW : plus tu es RAPIDE (chaque esquive monte le niveau de vitesse), plus l'esquive PAIE
      const gagne = (parfait ? 20 : 10) * (1 + this.niveau);
      this.points += gagne;
      onomatopee(this, x, y + 40, '+' + gagne, 26, parfait ? '#7fe8ff' : '#dff6ff');
      // RALENTI DRAMATIQUE : une PARFAITE dans les derniers yards, ou Kédric lui-même esquivé près de l'en-but
      if ((parfait && this.pos > EN_BUT - 18) || (d.star && this.pos > EN_BUT - 25)) this.dramatiser();
      // esquivé de côté, il peut se relever et te courir après (jamais quand Kédric est là)
      if ((comment === 'cote' || parfait) && !d.star && (d.type === 'bloc' || d.type === 'suiveur') && !this.duel
        && !this.defs.some(o => o.star) && Math.random() < this.diff.poursuite) this.ajouterPoursuivant();
    }
    if (d.star) this.kedricEsquive();
  }

  // le RALENTI DRAMATIQUE : 0,7 s à 35 % de vitesse — réservé aux moments de flamme près de l'en-but
  dramatiser() { this.ralenti = 0.35; this.ralentiDrame = 0.7; }

  // la jauge du Devil Bat Ghost (gardée d'une course à l'autre) ; pleine : on prévient
  remplirGhost(n) {
    this.jauge = Math.min(this.diff.ghost, this.jauge + n);
    if (this.jauge >= this.diff.ghost && !this.ghostAnnonce) {
      this.ghostAnnonce = true;
      jouerSon(this, 'kedric_niveau', { rate: 1.3 });
      this.messageCentre(`DEVIL BAT GHOST PRÊT : ${estTactile() ? 'Ghost' : 'ESPACE'} !`, '#9fe0ff', 28, 1.3);
    }
  }

  monterVitesse() {
    const niveau = Math.min(R.niveauMax, Math.floor(this.serie / R.esquivesParNiveau));
    if (niveau <= this.niveau) return;
    this.niveau = niveau;
    jouerSon(this, 'kedric_niveau');
    this.flashVitesse = 0.5;   // la barre de vitesse clignote (pas de texte en plus à l'écran)
  }

  // d = le plaqueur (null : rattrapé par le poursuivant, derrière toi)
  plaque(d, pourquoi) {
    const j = this.j;
    this.stats.plaquages++;
    this.ghostArme = 0; this.niveau = 0; this.serie = 0;
    if (d) { d.etat = 'plaqueur'; d.pos = this.pos + 0.25; d.x = j.x; }
    j.pose = 'plaque'; j.poseTemps = 99; j.saut = 0; j.rotation = 0;
    if (this.tuto) this.finTuto();
    jouerSon(this, 'kedric_plaque');
    jouerSon(this, 'kedric_foule', { volume: 0.7 });
    this.cameras.main.shake(260, 0.016);
    flash(this, 0.55);
    onomatopee(this, LARGEUR / 2, 240, ['CRAAAC !', 'BAM !', 'SBAM !'], 60, '#ff5a5a');
    lignesImpact(this, LARGEUR / 2, 380, 0xffffff, 22, 260);
    if (pourquoi) this.messageCentre(pourquoi, '#ffd84a', 28, 1.2);
    this.direCoach(d ? auHasard(REPLIQUES.plaque) : REPLIQUES.rattrape, 1600, true);
    if (Math.random() < 0.3) this.danseKedric();
    this.finAction1();
  }

  // plaqué : pause, puis la fin de la course
  finAction1() {
    this.etat = 'pause';
    this.viderPoursuivants();
    this.aide.setVisible(false);
    this.attendre(R.apresAction, () => this.finAction());
  }

  // Plaqué : la course s'arrête là (pas de points), on passe à la suivante
  finAction() {
    jouerSon(this, 'kedric_sifflet', { volume: 0.7 });
    const reste = Math.ceil(EN_BUT - this.pos);
    const e = encart(this, 'PLAQUÉ !', `Arrêté à ${reste} yards de l'en-but  -  touchdowns : ${this.stats.touchdowns}`, '#ff6b6b', 0x2a0b0b, 'kedric_coach');
    this.attendre(2.2, () => { e.fermer(); this.finAttaque(false); });
  }

  // =================================================================
  //  LE POURSUIVANT (derrière toi) : un seul, visible, que le sprint peut semer
  // =================================================================
  ajouterPoursuivant() {
    if (this.poursuivants.length >= R.poursuite.max) return;
    const s = this.add.sprite(0, HAUTEUR + 300, 'kedric_def_course').setOrigin(0.5, 1).setDepth(520);
    // il court un peu plus vite que toi au moment où il part : sans sprint il te rattrape, avec le sprint tu le sèmes
    this.poursuivants.push({ ecart: R.poursuite.depart, vitesse: this.vitesse() + this.diff.poursuiteEcart, cote: auHasard([-1, 1]), sprite: s });
    if (Math.random() < 0.3) this.direCoach(auHasard(REPLIQUES.poursuite));
  }

  majPoursuivants(dt, v) {
    if (!this.poursuivants.length) { this.alertePoursuite.setVisible(false); return; }
    const p = this.poursuivants[0];
    p.ecart += (v - p.vitesse) * dt;
    if (p.ecart <= 0) { this.plaque(null, 'Rattrapé par derrière ! Sprinte (Z) !'); return; }
    if (p.ecart >= R.poursuite.abandon) {
      this.viderPoursuivants();
      this.messageCentre('SEMÉ !', '#7fff7f', 30, 0.6);
      jouerSon(this, 'kedric_niveau', { rate: 1.2 });
      return;
    }
    // jauge « LUI ▮▮▮▯ TOI » : plus il y a de cases, plus il est loin
    const z = estTactile() ? 'Sprint' : 'Z';
    const cases = Math.round(10 * p.ecart / R.poursuite.abandon);
    this.alertePoursuite.setVisible(true).setText(`POURSUIVANT  ${'▮'.repeat(cases)}${'▯'.repeat(10 - cases)}  ${z} ${z} ${z} !`)
      .setColor(p.ecart < 2 ? '#ff5a5a' : '#ffd84a');
    if (p.ecart < 2.5 && Math.floor(this.horloge * 4) !== Math.floor((this.horloge - dt) * 4)) jouerSon(this, 'kedric_pas', { volume: 0.5, rate: 0.7 });
  }

  // =================================================================
  //  DEVIL BAT GHOST : pendant quelques secondes (R.ghost.duree), vitesse maximale et TOUS les défenseurs sont passés
  // =================================================================
  armerGhost() {
    this.jauge = 0; this.ghostAnnonce = false;
    this.stats.ghosts++;
    this.ghostArme = R.ghost.duree; this.ghostAction = true; this.ghostPasses = 0;
    this.viderPoursuivants();   // il sème aussi celui qui te court après
    this.serie = Math.max(this.serie, R.niveauMax * R.esquivesParNiveau);
    this.niveau = R.niveauMax;
    jouerSon(this, 'kedric_ghost');
    flash(this, 0.4, 0x9fe0ff);
    onomatopee(this, LARGEUR / 2, 250, 'DEVIL BAT GHOST !', 44, '#9fe0ff');
  }

  passeGhost(d) {
    this.ghostPasses++;
    this.esquive(d, 'ghost');
    jouerSon(this, 'kedric_parfait', { rate: 0.8 });
    lignesImpact(this, ecranX(this.j.x, 0), VUE.pieds - 200, 0x9fe0ff, 24, 260);
    onomatopee(this, ecranX(d.x, 0.5), VUE.pieds - 230, ['?!', 'Hein ?!', 'Où ?!'], 40, '#9fe0ff');
    // le premier défenseur passé : petit arrêt sur image (les suivants : on file)
    if (this.ghostPasses === 1) { this.gel = R.ghost.gel; this.direCoach(REPLIQUES.ghost, 1500, true); }
  }

  // =================================================================
  //  KÉDRIC EN PERSONNE (option : attaques avec kedric: true dans reglages.js ; il garde l'en-but en zone rouge),
  //  TOUJOURS seul sur le terrain. (Par défaut, il ne plaque plus : on l'affronte au SHOWTIME, voir showtime.js)
  //  Il prévient toujours de la même façon : il danse → il prend la POSE de son attaque (couleur + symbole) → il CHARGE
  // =================================================================
  entreeKedric(k) {
    this.viderPoursuivants();
    for (const d of this.defs) if (!d.star && d.etat === 'approche') d.etat = 'passe';
    this.duel = { vies: R.duel.vies, phase: 'danse', attente: R.duel.danse, kedric: k, montre: 'bloc', vrai: 'bloc',
      precedent: null, depuisFeinte: 3 };
    k.etat = 'approche'; k.pos = this.pos + R.duel.distance;
    if (!this.kedricVu) {
      this.kedricVu = true;
      jouerSon(this, 'kedric_touchdown', { volume: 0.6 });
      const e = encart(this, 'KÉDRIC GARDE L\'EN-BUT !', `« ${REPLIQUES.duel} »`, '#ffd84a', 0x1d1606, 'kedric_coach');
      this.gel = 1.8;
      this.apresGel = () => e.fermer();
      this.danseKedric();
    } else {
      onomatopee(this, LARGEUR / 2, 220, 'KÉDRIC !', 44, '#ffd84a');
    }
  }

  majDuel(dt) {
    const D = this.duel;
    if (D.vies <= 0) return;
    const k = D.kedric;
    if (D.phase === 'retour') {
      // il se relève et revient se placer devant toi
      D.attente -= dt;
      if (D.attente > 0) return;
      k.etat = 'approche'; k.chute = 0; k.angle = 0; k.alerte = false; k.menace = false; k.sprite.setAlpha(1);
      k.pos = this.pos + R.duel.distance;
      D.phase = 'danse'; D.attente = R.duel.danse;
      return;
    }
    if (D.phase === 'danse') {
      // il se dandine (sans s'approcher), puis il choisit son attaque
      k.pos = this.pos + R.duel.distance;
      k.x = Math.sin(this.horloge * 3.2) * 0.5;
      k.alerte = false;
      D.attente -= dt;
      if (D.attente > 0) return;
      const types = ['bloc', 'bas', 'haut'].filter(t => t !== D.precedent);
      D.vrai = auHasard(types); D.precedent = D.vrai;
      // feinte : seulement en CHAMPION, au plus 1 sur 3 charges
      const feintesPermises = this.nomDiff === 'champion';
      D.feinte = feintesPermises && D.depuisFeinte >= 2 && Math.random() < this.diff.feintes;
      D.depuisFeinte = D.feinte ? 0 : D.depuisFeinte + 1;
      D.montre = D.feinte ? auHasard(['bloc', 'bas', 'haut'].filter(t => t !== D.vrai)) : D.vrai;
      D.feinteFaite = false;
      k.type = D.montre; k.voie = this.j.voie; k.suit = true;
      this.direCoach(REPLIQUES.attaques[D.montre], 1000, true);
      // la POSE : immobile, son attaque s'affiche (couleur, symbole) avant qu'il ne charge
      D.phase = 'pose'; D.attente = R.duel.pose;
      k.alerte = true; k.menace = true;
      jouerSon(this, 'kedric_alerte', { rate: 0.8 });
      return;
    }
    if (D.phase === 'pose') {
      k.pos = this.pos + R.duel.distance;
      if (k.type === 'bloc') k.voie = this.j.voie;
      k.x += borne(k.voie - k.x, -dt * 6, dt * 6);
      D.attente -= dt;
      if (D.attente <= 0) D.phase = 'charge';
      return;
    }
    if (D.phase === 'charge' && k.etat === 'approche') {
      k.pos -= R.duel.charge * dt;
      const ttc = (k.pos - this.pos) / R.duel.charge;
      // l'épaule : il vise ton couloir jusqu'à 0,4 s du contact ; plongeon et corde : il te suit jusqu'au bout
      if (k.type === 'bloc' && ttc > 0.4) k.voie = this.j.voie;
      if (k.type !== 'bloc') k.voie = this.j.voie;
      k.x += borne(k.voie - k.x, -dt * 7, dt * 7);
      // la feinte, ANNONCÉE : il change d'attaque à 0,75 s du contact
      if (D.feinte && !D.feinteFaite && ttc < R.duel.feinteAvant) {
        D.feinteFaite = true; k.type = D.vrai;
        if (D.vrai === 'bloc') k.voie = this.j.voie;
        jouerSon(this, 'kedric_alerte', { rate: 0.6 });
        flash(this, 0.25, 0xff5a5a);
        this.messageCentre('FEINTE !', '#ff5a5a', 40, 0.5);
      }
      k.alerte = true;
      if (Math.abs(k.x - this.j.x) < 0.5) k.menace = true;
    }
  }

  kedricEsquive() {
    const D = this.duel;
    D.vies--;
    D.phase = 'retour'; D.attente = 0.8;
    if (D.vies <= 0) {
      jouerSon(this, 'kedric_foule');
      const e = encart(this, 'KÉDRIC EST PASSÉ !', 'Fonce jusqu\'à l\'en-but !', '#7fff7f', 0x0b2a16);
      this.gel = 1.1; this.apresGel = () => e.fermer();
      this.direCoach('NOOON ! Mon show !', 1600, true);
    } else this.messageCentre(`Kédric esquivé ! Encore ${D.vies}`, '#ffd84a', 26, 0.8);
  }

  // =================================================================
  //  TOUCHDOWN / FIN
  // =================================================================
  touchdown() {
    this.etat = 'pause';
    this.stats.touchdowns++;
    this.score.toi += R.points;
    const bonusTD = 100 + 20 * this.niveau;   // le TOUCHDOWN paie, et il paie PLUS si tu es arrivé à GRANDE vitesse
    this.points += bonusTD;
    this.j.pose = 'victoire'; this.j.poseTemps = 99; this.ghostArme = 0;
    if (this.tuto) this.finTuto();
    this.viderPoursuivants(); this.aide.setVisible(false);
    // LA CÉLÉBRATION : d'abord 1,2 s de LIESSE — pose de victoire, foule, flash, secousse, IMPACT géant
    jouerSon(this, 'kedric_touchdown');
    jouerSon(this, 'kedric_foule');
    flash(this, 0.5, 0xffd84a);
    this.cameras.main.shake(350, 0.008);
    onomatopee(this, LARGEUR / 2, 200, 'TOUCHDOWN !!', 76, '#ffd84a');
    lignesImpact(this, LARGEUR / 2, VUE.pieds - 260, 0xffd84a, 20, 240);
    this.attendre(1.2, () => {
      const e = encart(this, 'TOUCHDOWN !!', `+${bonusTD} POINTS !  -  Score : ${this.points}`, '#ffd84a', 0x0b2a16);
      this.direCoach(auHasard(REPLIQUES.touchdown), 2000, true);
      this.attendre(2.6, () => { e.fermer(); this.finAttaque(true); });
    });
  }

  // =================================================================
  //  SHOWTIME : le battle de danse contre Kédric, le boss de fin (voir showtime.js)
  // =================================================================
  lancerShowtime(options, ensuite) {
    this.viderDefenseurs();
    this.etat = 'showtime';
    if (this.tuto) this.finTuto();   // le panneau du tuto (« ◀ ▶ : CHANGE DE COULOIR »...) ne reste JAMAIS à l'écran pendant le battle
    this.aide.setVisible(false);
    // sur scène : plus d'interface de match (vitesse, ghost, score), seulement la jauge du public
    this.elementsHud.forEach(o => o.setVisible(false));
    etiquettesTactiles({ haut: '▲', bas: '▼', gauche: '◀', droite: '▶', espace: null, z: null, x: null });
    this.show = new Showtime(this, options, (gagne, bilan) => {
      this.etat = 'pause';
      this.attendre(1.4, () => {
        this.show.detruire(); this.show = null;
        this.bandeau.setVisible(false);
        this.elementsHud.forEach(o => o.setVisible(true));
        etiquettesTactiles(ETIQUETTES_JEU);
        ensuite(gagne, bilan);
      });
    });
  }

  // =================================================================
  //  LA FINALE : le BATTLE DE DANSE contre Kédric (2 rounds), après les courses
  //  « Tu m'as eu au football américain... mais tu ne m'auras pas sur la CLASSE ! »
  //  Tes touchdowns mettent le public de ton côté au départ (aucun : il part du côté de Kédric).
  // =================================================================
  debutFinale() {
    this.viderDefenseurs();
    this.finale = true;
    this.attaque = { nom: 'FINALE', titre: 'SHOWTIME', formations: [] };
    this.numAttaque = R.courses;
    this.pos = EN_BUT - 1;
    this.etat = 'pause';
    const td = this.stats.touchdowns;
    const depart = Math.max(-R.showtime.avanceMax, Math.min(R.showtime.avanceMax, (td - 1) * R.showtime.parTouchdown));
    const avance = depart > 0 ? `${td} touchdowns : le public est déjà un peu pour toi !` : depart < 0 ? 'Aucun touchdown : le public est pour lui...' : `${td} touchdown : le public attend de voir...`;
    // la transition : le stade s'éteint (fondu au noir), puis Kédric apparaît sur scène et lance le défi (showtime.js)
    jouerSon(this, 'kedric_sifflet');
    const noir = this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x000000).setDepth(928).setAlpha(0);   // sous le « SHOWTIME ! » (930)
    this.tweens.add({ targets: noir, alpha: 1, duration: 600 });
    onomatopee(this, LARGEUR / 2, HAUTEUR / 2, 'SHOWTIME !', 70, '#ffd84a');
    // LE RÉCAP DU MATCH : ce que tu as réussi (et loupé) pendant les courses, AVANT de passer sur scène
    const st = this.stats;
    const recap = encart(this, 'FIN DU MATCH !',
      `Touchdowns : ${st.touchdowns}/${R.courses} — Esquives : ${st.esquives} (${st.parfaits} PARFAITES) — Plaqué : ${st.plaquages}` +
      `\nScore de course : ${this.points || 0} POINTS`,
      '#7fe8ff', 0x0b2230, 'kedric_coach');
    this.attendre(3.6, () => {
      recap.fermer();
      this.tweens.add({ targets: noir, alpha: 0, duration: 500, onComplete: () => noir.destroy() });
      this.lancerShowtime({ jauge: depart,
        replique: td > 0 ? REPLIQUES.finale : REPLIQUES.finaleZero, sousTitre: avance }, (gagne, bilan) => {
        this.dernierBilanDanse = bilan;   // parfaits, biens, ratés, part du public : pour le bilan de victoire
        this.stats.parfaits += bilan.parfaits;
        if (bilan.entrainement) {
          const f = encart(this, 'ENTRAÎNEMENT TERMINÉ !', `Parfaits : ${bilan.parfaits} - Ratés : ${bilan.rates}\nAucune défaite comptée, aucune victoire non plus.\nReviens gagner le vrai match !`, '#7fe8ff', 0x0b2230);
          this.attendre(3.2, () => { f.fermer(); this.finMatch(false); });
        } else if (gagne) {
          jouerSon(this, 'kedric_touchdown'); jouerSon(this, 'kedric_foule');
          flash(this, 0.5, 0xffd84a);
          const f = encart(this, 'LE PUBLIC EST À TOI !', `Kédric s'effondre... le nouveau showman, c'est toi !`, '#ffd84a', 0x0b2a16);
          this.attendre(2.4, () => { f.fermer(); this.finMatch(true); });
        } else {
          this.danseKedric();
          this.direCoach(REPLIQUES.defaite, 2000, true);
          this.attendre(2.0, () => this.finMatch(false));
        }
      });
    });
  }

  // Après chaque course : la suivante, puis le battle de danse (le boss de fin)
  finAttaque() {
    this.viderDefenseurs();
    this.file = [];
    const n = this.numAttaque + 1;
    if (n < R.courses) this.debutAttaque(n);
    else this.debutFinale();
  }

  finMatch(gagne) {
    etiquettesTactiles(ETIQUETTES_OK);
    this.etat = 'fin';
    this.aide.setVisible(false); this.bandeau.setVisible(false); this.alertePoursuite.setVisible(false);
    if (gagne) this.victoire(this.classement());
    else this.defaite(`Kédric gagne le battle de danse !\nKédric : « ${REPLIQUES.defaite} »\nTouchdowns : ${this.stats.touchdowns} / ${R.courses}`);
  }

  cleRecord() { return cleRecord('kedric', this.nomDiff); }

  // Rang S / A / B / C : les touchdowns, les plaquages, les esquives parfaites, le temps
  classement() {
    let score = 80;
    score += (this.stats.touchdowns - 1) * 7;
    score -= this.stats.plaquages * 1.2;
    score += Math.min(10, this.stats.parfaits * 0.4);
    score -= Math.max(0, this.tempsTotal - R.tempsReference) * 0.1;
    score += Math.min(25, (this.points || 0) * 0.05);   // le SCORE DE SHOW (vitesse + esquives) compte pour le rang
    const rang = R.rangs.find(r => score >= r.seuil).rang;
    const complet = this.phase === 'action1';
    const record = complet ? Sauvegarde.proposerRecord(this.cleRecord(), rang, this.tempsTotal, R.rangs.map(r => r.rang)) : Sauvegarde.record(this.cleRecord());
    this.rang = rang;
    // LE BILAN DU COACH : réussites, erreurs, part du public gagnée (battle) + UN conseil pour progresser
    const bd = this.dernierBilanDanse;
    const publicPourToi = bd ? Math.max(0, Math.min(100, Math.round(bd.jauge || 0))) : null;
    const conseil = bd
      ? (bd.rates >= 10 ? 'Conseil du coach : au battle, garde le rythme même piégé — chaque raté rend le public à Kédric.'
        : bd.rates >= 5 ? 'Conseil du coach : vise le PARFAIT pile sur le temps : c\'est lui qui fait basculer le public.'
        : 'Conseil du coach : enchaîne 5 PARFAITS d\'affilée : la foule est à toi (COMBO x1,5).')
      : (this.stats.plaquages >= 3 ? 'Conseil du coach : esquive les plaqueurs PLUS TÔT, le symbole s\'affiche avant le contact.'
        : 'Conseil du coach : les esquives PARFAITES remplissent le Devil Bat Ghost — garde-le pour les murs.');
    return `Kédric est battu au battle de danse !  Touchdowns : ${this.stats.touchdowns} / ${R.courses}\nRANG ${rang}   -   temps ${formatTemps(this.tempsTotal)}` +
      `\nPlaquages subis : ${this.stats.plaquages}   esquives : ${this.stats.esquives}` +
      `\nEsquives parfaites : ${this.stats.parfaits}` +
      `\nScore de course : ${this.points || 0} points` +
      (this.stats.ghosts ? `   Devil Bat Ghost : ${this.stats.ghosts}` : '') +
      (publicPourToi !== null ? `\nBattle : ${bd.parfaits} parfaits, ${bd.bien} biens, ${bd.rates} ratés   -   public gagné : ${publicPourToi} %` : '') +
      (record ? `\nRecord : rang ${record.rang} en ${formatTemps(record.temps)}` : '') +
      (this.nomDiff !== 'normal' ? `\nMode ${this.diff.nom}` : '') +
      '\n' + lignesDefis('kedric', [
        { id: 'parfait40', nom: '40 esquives PARFAITES (courses + battle)', test: () => this.stats.parfaits >= 40 },
        { id: 'sansGhost', nom: 'Gagner sans JAMAIS utiliser le Devil Bat Ghost', test: () => this.stats.ghosts === 0 },
        { id: 'public80', nom: 'Battle gagné avec 80 % du public pour toi', test: () => publicPourToi !== null && publicPourToi >= 80 },
      ]).join('\n') +
      `\n${conseil}`;
  }

  // =================================================================
  //  KÉDRIC LE SHOWMAN (bulles, danse)
  // =================================================================
  direCoach(message, duree = 1400, crie = false) {
    if (this.bulleCoach && this.bulleCoach.active) this.bulleCoach.destroy();
    // la bulle part du HAUT, à droite du portrait : elle DESCEND — plus JAMAIS de texte qui monte hors écran
    this.bulleCoach = bulle(this, 166, 10, `Kédric : « ${message} »`, duree).setOrigin(0, 0).setDepth(960);
    this.bulleCoach.setWordWrapWidth(420);
    if (crie) { this.coachCrie = 0.7; this.tweens.add({ targets: this.cadreCoach, scale: 1.08, duration: 90, yoyo: true }); }
  }

  // Kédric surgit sur le côté en dansant (après un plaquage, à son entrée en jeu)
  danseKedric() {
    const k = this.add.sprite(-170, HAUTEUR - 10, 'kedric_danse').setOrigin(0.5, 1).setDepth(940).play('kedric_danse');
    k.setScale(260 / k.height);
    this.tweens.add({ targets: k, x: 205, duration: 260, ease: 'Back.Out' });
    this.tweens.add({ targets: k, x: -170, delay: 1300, duration: 260, ease: 'Cubic.In', onComplete: () => k.destroy() });
    for (let n = 0; n < 6; n++) {
      const e = this.add.star(205 + Phaser.Math.Between(-90, 90), HAUTEUR - Phaser.Math.Between(80, 260), 5, 4, 10, 0xffd84a).setDepth(941).setScale(0);
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
    ].join('\n'), 22, '#ffffff', { lineSpacing: 12 }).setDepth(1102));
    el.push(texte(this, 300, 460, (estTactile() ? 'OK' : 'ESPACE') + ' : sur le terrain !', 22, '#7fff7f').setDepth(1102));
    el.push(bulle(this, LARGEUR - 190, 80, REPLIQUES.presentation, 99999).setDepth(1103));
    jouerSon(this, 'kedric_foule', { volume: 0.6 });
    this.time.delayedCall(500, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        el.forEach(e => e.destroy());
        jouerSon(this, 'ui_valider');
        ensuite();
      });
    });
  }

  // un pied touche la pelouse : bruit de crampons + touffe d'herbe qui part vers l'arrière (vers toi)
  appui(x) {
    jouerSon(this, 'kedric_pas', { volume: 0.35, rate: 0.9 + Math.random() * 0.2 });
    for (let k = 0; k < 4; k++) {
      const t = this.add.ellipse(x + Phaser.Math.Between(-10, 10), VUE.pieds + 2, 9, 5, k % 2 ? 0x2f7a32 : 0x8a6a40, 0.85).setDepth(501);
      this.tweens.add({ targets: t, x: t.x + Phaser.Math.Between(-30, 30), y: t.y + Phaser.Math.Between(10, 30), scale: 1.8, alpha: 0, duration: 260, onComplete: () => t.destroy() });
    }
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
      if (L >= EN_BUT) couleur = (L < EN_BUT + 10) ? 0x15603a : 0x0f3a1c;
      quad(d0, d1, -B, B, couleur);
    }
    // lignes des yards
    g.lineStyle(3, 0xffffff, 0.85);
    let iN = 0;
    for (let L = Math.ceil((this.pos - 0.9) / 5) * 5; L < this.pos + VUE.loin && L <= EN_BUT + 10; L += 5) {
      const d = L - this.pos, y = ecranY(d);
      g.lineStyle(Math.max(1, 4 * echelle(d)), 0xffffff, L === EN_BUT ? 1 : 0.8);
      g.lineBetween(ecranX(-B, d), y, ecranX(B, d), y);
      // numéros des yards (comme sur un vrai terrain : 10, 20... 50... 20, 10)
      const n = L <= MILIEU ? L : EN_BUT - L;
      if (L % 10 === 0 && n > 0 && L < EN_BUT && iN < this.nombres.length - 1 && d > 0.5) {
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
    const dEB = EN_BUT + 5 - this.pos;
    if (dEB < VUE.loin && dEB > 0) {
      const k = echelle(dEB);
      this.texteEnBut.setVisible(true).setPosition(LARGEUR / 2, ecranY(dEB)).setScale(k * 1.4, k * 0.6);
    } else this.texteEnBut.setVisible(false);
    // les poteaux (jaunes) au fond de l'en-but
    const p = this.poteaux; p.clear();
    const dP = EN_BUT + 10 - this.pos;
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
    const fort = this.ghostArme > 0 ? 1 : Math.max(0, this.niveau - 2) / 3;
    if (fort <= 0 || this.etat !== 'jeu') return;
    const cx = LARGEUR / 2, cy = VUE.horizon;
    g.lineStyle(2, this.ghostArme > 0 ? 0x9fe0ff : 0xffffff, 0.25 + 0.35 * fort);
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
    const enShow = !!this.show;
    this.sprJ.setVisible(!enShow); this.ombreJ.setVisible(!enShow);
    let pose = j.poseTemps > 0 && j.pose ? j.pose : (j.saut > 0 ? 'saut' : j.rotation > 0 ? 'rotation' : 'course');
    const hauteur = j.saut > 0 ? Math.sin(Math.PI * (1 - j.saut / R.saut.duree)) * 80 : 0;
    const cle = 'kedric_toi_' + pose;
    const enCourse = pose === 'course' && this.etat === 'jeu' && this.gel <= 0;
    if (pose === 'course') {
      if (this.sprJ.texture.key !== cle || !this.sprJ.anims.isPlaying) this.sprJ.play(cle);
      this.sprJ.anims.timeScale = enCourse ? 1 + this.niveau * 0.12 + (this.ghostArme > 0 ? 0.5 : 0) : 0;
    } else if (this.sprJ.texture.key !== cle) { this.sprJ.stop(); this.sprJ.setTexture(cle); }
    // rebond continu calé sur l'animation : le corps est au plus bas quand un pied se pose (images 3 et 6 sur 6),
    // au plus haut entre deux appuis ; bruit de crampons et touffe d'herbe à chaque appui.
    // (une course dessinée en une seule image rebondit au même rythme)
    let saute = 0, penche = 0;
    if (enCourse) {
      const n = this.textures.get(cle).frameTotal - 1;
      let phase;
      // 2 foulées par tour d'animation ; décalé d'1/6 pour que l'appui tombe au milieu des images « pieds au sol » (3e et 6e)
      if (n > 1) {
        const A = this.sprJ.anims, i = A.currentFrame ? A.currentFrame.index - 1 : 0;
        const f = A.nextTick > 0 ? borne(A.accumulator / A.nextTick, 0, 1) : 0;   // avancement dans l'image en cours
        phase = (i + f) / n * 2 + 1 / 6;
      }
      else phase = this.horloge * (2.6 + this.niveau * 0.3);
      const u = (phase % 1);                                   // 0 = pied posé, 0,5 = en l'air
      saute = Math.sin(Math.PI * u) * 7;
      penche = Math.sin(Math.PI * 2 * phase / 2) * 1.5;
      const appui = Math.floor(phase);
      if (this.appuiJ !== appui) { if (this.appuiJ !== undefined) this.appui(xJ + (appui % 2 ? -26 : 26)); this.appuiJ = appui; }
    }
    this.sprJ.setPosition(xJ, VUE.pieds + 8 - hauteur - saute).setScale(this.zoom(cle));
    this.sprJ.setAngle(j.rotation > 0 ? Math.sin(this.horloge * 30) * 6 : penche);
    this.ombreJ.setPosition(xJ, VUE.pieds + 4).setScale(1 - (hauteur + saute) / 200);
    // Devil Bat Ghost : images fantômes de chaque côté
    this.fantomes.forEach((f, k) => {
      if (this.ghostArme > 0 && this.etat === 'jeu') {
        const dec = Math.sin(this.horloge * 22 + k * 2.1) * (70 + k * 25);
        f.setTexture(this.sprJ.texture.key, this.sprJ.frame.name).setPosition(xJ + dec, this.sprJ.y).setScale(this.sprJ.scaleX, this.sprJ.scaleY).setAlpha(0.35 - k * 0.08);
      } else f.setAlpha(0);
    });
    // ---------- les défenseurs ----------
    for (const d of this.defs) this.afficherDefenseur(d);
    this.afficherReperes();
    // ---------- les poursuivants : on voit leur casque surgir en bas de l'écran quand ils se rapprochent ----------
    for (const p of this.poursuivants) {
      const z = this.zoom('kedric_def_course') * 1.25;
      // toujours visible : son casque remonte du bas de l'écran à mesure qu'il se rapproche
      p.sprite.setPosition(xJ + p.cote * 150, HAUTEUR + 46 + p.ecart * 23.5 - Math.abs(Math.sin(this.horloge * 9)) * 8).setScale(z).setAlpha(0.95);
    }
    this.majHud();
  }

  // Repères au sol : la cible du coup d'envoi, l'anneau sous le prochain défenseur
  afficherReperes() {
    const g = this.reperes; g.clear();
    // coup d'envoi : le ballon tombe du fond du terrain ; la cible (jaune, puis BLEUE quand il faut sauter) montre où il arrive
    const E = this.envoi;
    if (E && E.rebond <= 0 && this.etat === 'envoi') {
      const k = Math.min(1, E.t / E.vol), d = E.loin * (1 - k);
      const z = 4 * E.hauteur * k * (1 - k) + 1.4 * k;
      const e = echelle(d);
      this.ballon.setVisible(true).setPosition(ecranX(E.voie, d), ecranY(d) - z * 107 * e).setScale(Math.max(0.9, e * 2.2));
      this.ombreBallon.setVisible(true).setPosition(ecranX(E.voie, d), ecranY(d)).setScale(Math.max(0.2, e * 1.5));
      // cercle de timing : il se resserre sur la cible ; BLEU quand il faut appuyer sur ▲ (blanc pile au bon moment)
      const reste = E.vol - E.t;
      const bleu = reste <= R.envoi.bien, pile = Math.abs(reste) <= R.envoi.parfait;
      const xc = ecranX(E.voie, 0), r = 60 + 90 * Math.max(0, 1 - k);
      g.lineStyle(6, pile ? 0xffffff : bleu ? 0x3fa7ff : 0xffd84a, 0.95); g.strokeEllipse(xc, VUE.pieds, r * 2, r * 0.55);
      g.lineStyle(3, 0xffffff, 0.6); g.strokeEllipse(xc, VUE.pieds, 120, 33);
    } else { this.ballon.setVisible(false); this.ombreBallon.setVisible(false); }
    // anneau coloré sous le prochain défenseur (celui qui a le symbole)
    const d = this.prochain;
    if (d && d.etat === 'approche' && this.ghostArme <= 0 && (this.etat === 'jeu')) {
      const dist = d.pos - this.pos, k = echelle(dist);
      const S = SYMBOLES[d.type === 'suiveur' ? (d.verrou ? 'verrou' : 'suiveur') : d.type];
      g.lineStyle(Math.max(2, 5 * k), Phaser.Display.Color.HexStringToColor(S.couleur).color, 0.9);
      g.strokeEllipse(ecranX(d.x, dist), ecranY(dist) + 2, 150 * k, 40 * k);
    }
  }

  afficherDefenseur(d) {
    const dist = d.pos - this.pos, k = echelle(dist);
    let pose;
    if (d.etat === 'rate') pose = 'rate';
    else if (d.etat === 'plaqueur') pose = d.type === 'haut' ? 'bras' : 'plonge';
    else if (d.etat === 'passe') pose = 'course';
    else if (d.etat === 'attend' || (d.star && this.duel && this.duel.phase === 'danse')) pose = 'garde';
    else if (!d.alerte) pose = d.charge ? 'course' : 'garde';
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
    // les rangs derrière le prochain défenseur sont estompés : on lit d'abord celui qui arrive
    const derriere = this.prochain && d.etat === 'approche' && !d.star && d.groupe !== this.prochain.groupe && d.pos > this.prochain.pos + 1;
    d.sprite.setAlpha(d.etat === 'rate' ? Math.max(0, 1 - d.chute * 0.9) : derriere ? 0.45 : 1);
    if (this.ghostArme > 0 && d.etat === 'approche') d.sprite.setTint(0xbbbbcc); else d.sprite.clearTint();
    d.ombre.setPosition(x, y + 2).setScale(k).setVisible(d.etat !== 'rate');
    // le symbole : ce qu'il faut faire
    const S = d === this.prochain && d.etat === 'approche' && d.alerte && this.ghostArme <= 0 ? SYMBOLES[d.type === 'suiveur' ? (d.verrou ? 'verrou' : 'suiveur') : d.type] : null;
    if (S) {
      // Kédric : symbole plus gros (c'est LUI qu'il faut lire)
      d.symbole.setVisible(true).setText(S.texte).setColor(S.couleur).setPosition(x, y - (HAUTEUR_POSE[pose] || 215) * k - 18).setScale(Math.max(d.star ? 1.1 : 0.6, k * (d.star ? 1.8 : 1.3))).setDepth(890);
    } else d.symbole.setVisible(false);
  }

  // Aide près de toi : que faire contre le défenseur le plus proche (FACILE / NORMAL)
  majAide() {
    // le PROCHAIN défenseur qui te menace : le seul à avoir un symbole et un anneau à ses pieds (plus lisible)
    let proche = null;
    for (const d of this.defs) {
      if (d.etat !== 'approche' || !d.alerte || (Math.abs(d.x - this.j.x) >= 0.5 && !d.star)) continue;
      if (!proche || d.pos < proche.pos) proche = d;
    }
    this.prochain = proche;
    if (!this.diff.aide || this.ghostArme > 0 || !proche) { this.aide.setVisible(false); return; }
    const S = SYMBOLES[proche.type === 'suiveur' ? (proche.verrou ? 'verrou' : 'suiveur') : proche.type];
    this.aide.setVisible(true).setText(S.aide).setColor(S.couleur);
  }

  // =================================================================
  //  HUD
  // =================================================================
  creerHud() {
    const P = 920, avant = this.children.list.length;
    // Kédric au micro, en haut à gauche
    this.cadreCoach = this.add.container(86, 74).setDepth(P);
    const fond = this.add.rectangle(0, 0, 132, 132, 0x0b2a16).setStrokeStyle(4, 0xffd84a);
    this.sprCoach = this.add.sprite(0, -4, 'kedric_coach', 0);
    this.sprCoach.setScale(Math.min(124 / this.sprCoach.width, 118 / this.sprCoach.height));
    const nom = texte(this, 0, 58, 'COACH KÉDRIC', 13, '#ffd84a');
    this.cadreCoach.add([fond, this.sprCoach, nom]);
    this.coachCrie = 0;
    // en haut à droite : les touchdowns, la course, la distance à l'en-but
    this.hudAction = texte(this, LARGEUR - 150, 26, '', 22, '#ffd84a', { fontStyle: 'bold' }).setDepth(P);
    this.hudTentatives = texte(this, LARGEUR - 150, 54, '', 17, '#ffffff').setDepth(P);
    this.hudYards = texte(this, LARGEUR - 150, 80, '', 17, '#ffffff').setDepth(P);
    this.hudScore = texte(this, LARGEUR - 150, 114, '', 17, '#7fe8ff', { fontStyle: 'bold' }).setDepth(P);   // le SCORE DE SHOW, en permanence : ÇA MOTIVE
    this.hudBarre = this.add.graphics().setDepth(P);
    // à gauche : la vitesse ; à droite : la jauge du Devil Bat Ghost
    this.hudVitesse = this.add.graphics().setDepth(P);
    this.hudVitesseTexte = texte(this, 34, 440, '', 13, '#ffffff').setDepth(P);
    texte(this, 34, 182, 'VITESSE', 12, '#7fff7f').setDepth(P);
    this.hudGhost = this.add.graphics().setDepth(P);
    this.hudGhostTexte = texte(this, LARGEUR - 34, 182, 'GHOST', 12, '#9fe0ff').setDepth(P);
    this.hudPret = texte(this, LARGEUR - 34, 440, '', 13, '#9fe0ff', { fontStyle: 'bold' }).setDepth(P);
    this.elementsHud = this.children.list.slice(avant);   // cachés pendant le battle de danse
  }

  majHud() {
    if (!this.hudAction) return;
    if (this.coachCrie > 0) this.coachCrie -= 1 / 60;
    this.sprCoach.setFrame(this.coachCrie > 0 ? 1 : 0);
    const t1 = `TOUCHDOWNS : ${this.stats.touchdowns}`;
    if (this.hudAction.text !== t1) this.hudAction.setText(t1);
    let t2 = this.etat === 'envoi' ? 'COUP D\'ENVOI' : 'FONCE VERS L\'EN-BUT !';
    if (this.finale) t2 = 'BATTLE DE DANSE';
    if (this.hudTentatives.text !== t2) this.hudTentatives.setText(t2);
    const t3 = `${this.attaque.nom} ${Math.min(this.numAttaque + 1, R.courses)}/${R.courses}  ·  en-but à ${Math.max(0, Math.ceil(EN_BUT - this.pos))}`;
    if (this.hudYards.text !== t3) this.hudYards.setText(t3);
    const tScore = `SCORE : ${this.points || 0}`;
    if (this.hudScore.text !== tScore) this.hudScore.setText(tScore);
    const b = this.hudBarre; b.clear();
    const bx = LARGEUR - 260, bl = 220, f = (L) => bx + bl * borne(L / EN_BUT, 0, 1);
    b.fillStyle(0x000000, 0.5); b.fillRect(bx, 96, bl, 10);
    b.fillStyle(0x7fff7f, 1); b.fillRect(bx, 96, f(this.pos) - bx, 10);
    b.lineStyle(2, 0xffffff, 0.8); b.strokeRect(bx, 96, bl, 10);
    // vitesse : 5 crans
    const v = this.hudVitesse; v.clear();
    if (this.flashVitesse > 0) this.flashVitesse -= 1 / 60;
    if (this.flashSprint > 0) this.flashSprint -= 1 / 60;
    if ((this.flashVitesse > 0 && Math.floor(this.horloge * 12) % 2) || this.flashSprint > 0) { v.fillStyle(0xffffff, 0.35); v.fillRect(16, 180, 36, 236); }
    // sprint : petite barre orange à côté de la vitesse
    if (this.boost > 0) { v.fillStyle(0xff9a3c, 1); v.fillRect(52, 410 - 220 * this.boost / R.sprint.max, 6, 220 * this.boost / R.sprint.max); }
    for (let k = 0; k < R.niveauMax; k++) {
      const y = 410 - k * 44;
      const g2 = this.ghostArme > 0;
      v.fillStyle(k < this.niveau || g2 ? (g2 ? 0x9fe0ff : [0x7fff7f, 0xb8ff5a, 0xffd84a, 0xff9a3c, 0xff4a4a][k]) : 0x000000, k < this.niveau || g2 ? 1 : 0.45);
      v.fillRect(20, y - 36, 28, 38);
      v.lineStyle(2, 0xffffff, 0.7); v.strokeRect(20, y - 36, 28, 38);
    }
    const t4 = `40 yd\n${(40 / this.vitesse()).toFixed(1)} s`;
    if (this.hudVitesseTexte.text !== t4) this.hudVitesseTexte.setText(t4);
    // jauge du Devil Bat Ghost
    const g = this.hudGhost; g.clear();
    const plein = this.jauge >= this.diff.ghost, fj = this.ghostArme > 0 ? this.ghostArme / R.ghost.duree : this.jauge / this.diff.ghost;
    g.fillStyle(0x000000, 0.5); g.fillRect(LARGEUR - 48, 194, 28, 220);
    g.fillStyle(plein && Math.floor(this.horloge * 6) % 2 ? 0xffffff : 0x9fe0ff, 1); g.fillRect(LARGEUR - 48, 194 + 220 * (1 - fj), 28, 220 * fj);
    g.lineStyle(2, 0xffffff, 0.8); g.strokeRect(LARGEUR - 48, 194, 28, 220);
    const t5 = plein && this.ghostArme <= 0 ? (estTactile() ? 'Ghost !' : 'ESPACE !') : '';
    if (this.hudPret.text !== t5) this.hudPret.setText(t5);
  }
}
