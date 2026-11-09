// =====================================================================
// BOSS GREG : combat de boxe en 3 rounds.
// Vue "Punch-Out" (ton boxeur de dos, Greg de face), règles façon Hajime no Ippo :
//   - Greg prévient avant de frapper ("!" à côté de sa tête) :
//       jaune = visage (esquive du côté opposé ou garde Bas), violet = corps (garde Bas),
//       rouge "!!" = SMASH (esquive sur le côté !)
//   - Esquive réussie => fenêtre de CONTRE (dégâts x3) ; seules les esquives remplissent la jauge d'esprit
//   - UN SEUL coup de poing (Espace ou Z) : plus de choix visage / corps (nov. 2026, demande de Fabien)
//   - Jauge d'esprit pleine => X : DEMPSEY ROLL (boule sur un "∞", ◀ / ▶ en rythme)
//   - Au tapis : alterner ◀ ▶ avant 10 !
// Tous les chiffres sont dans reglages.js.
// =====================================================================
import { BossScene, attendreOK } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte, voile } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { annoncer, taireAnnonceur } from '../../core/annonceur.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { IDENTITE, DIFFICULTES, REGLAGES as R, ATTAQUES, ENCHAINEMENTS, ENCHAINEMENTS_ENERVE, CONSEILS, CONSEIL_ROUND1, REPLIQUES, ONOMATOPEES as ONO } from './reglages.js';
import { lignesImpact, onomatopee, flash, encart, encartDempsey, bulle, gouttes } from './effets.js';
import { jouerClip } from '../../core/clips.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { Sauvegarde, formatTemps, lignesDefis } from '../../core/sauvegarde.js';
import { choisirDifficulte, cleRecord } from './difficulte.js';
import { rangerBoutonPause } from './boutonPause.js';
import { installerGestes } from './gestes.js';

// compte en japonais : [kana, lecture en lettres si le navigateur n'a pas de voix japonaise]
const JAPONAIS = [['いち', 'itchi'], ['に', 'ni'], ['さん', 'sann'], ['し', 'chi'], ['ご', 'go'],
  ['ろく', 'roku'], ['しち', 'chitchi'], ['はち', 'hatchi'], ['きゅう', 'kyou']];
const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)];
const entre = (min, max) => min + Math.random() * (max - min);
// Pose de Greg au moment où il frappe
const POSE_FRAPPE = { jab: 'jab', crochet: 'crochet', corps: 'corps', rafale: 'jab', smash: 'uppercut' };
const POSE_PREPA = { tete: 'prepare', corps: 'prepare_bas', smash: 'prepare_smash' };
// couleurs des alertes (corps en violet pour ne pas confondre avec le cadre de garde)
const COULEUR_ALERTE = { tete: '#ffd84a', corps: '#c77dff', smash: '#ff3b3b' };
// Points d'impact à l'écran
const VISAGE_GREG = { x: R.centreX, y: 140 };
const CORPS_GREG = { x: R.centreX, y: 215 };
const TETE_JOUEUR_Y = 405;       // tête de ton boxeur à l'écran
const VENTRE_JOUEUR = 70;        // le ventre est un peu plus bas
// Boutons tactiles : pendant le combat / sur les écrans à valider
const ETIQUETTES_COMBAT = { haut: null, bas: '▼\nGarde', espace: 'Coup', z: null, x: 'Dempsey' };
const ETIQUETTES_OK = { haut: null, bas: null, gauche: null, droite: null, espace: 'OK', z: null, x: null };
// téléphone : en combat, plus de boutons, des GESTES (gestes.js) ; R.gestesTactiles = false pour revenir aux boutons
const SANS_BOUTONS = { haut: null, bas: null, gauche: null, droite: null, espace: null, z: null, x: null };

export class GregCombat extends BossScene {
  constructor() { super('GregCombat', IDENTITE); }

  create() {
    const phase = this.donnees.phase || 'round1';
    this.round = Phaser.Math.Clamp(parseInt(phase.replace('round', ''), 10) || 1, 1, R.nbRounds);
    this.etat = 'intro';          // intro | coin | combat | compte | fin
    this.gel = 0;                 // combat figé (encarts), en secondes réelles
    this.apresGel = null;
    this.ralenti = 1; this.ralentiTemps = 0;
    this.horloge = 0;
    this.stats = { donnes: 0, recus: 0 };
    this.statsRound = this.nouvellesStatsRound();
    this.arret = 0;   // hit-stop : image figée un instant à l'impact
    this.tempsTotal = 0; this.secretFait = false; this.nargueRound = 0;
    this.momentNargue = entre(...R.nargue.entre);   // moment (secondes restantes) où il nargue, tiré à chaque round
    this.smashAnnonce = false;
    this.roundsJoues = 0;
    this.nomDiff = 'normal'; this.diff = DIFFICULTES.normal;
    // audit nov. 2026 : rien ne doit rester de la partie d'avant (REJOUER / retour du hub)
    this.compte = null; this.caseKO = null; this.barreReleve = null; this.arbitre = null; this.dempseyVu = false; this.dempseyLance = false; this.texteAideDempsey = null;
    this.tempsRound = R.dureeRound; this.coupsRecents = []; this.serie = 0; this.serieJusqua = -1; this.smashR2Fait = false; this.dernierSeq = -1;

    this.add.image(0, 0, 'greg_ring').setOrigin(0);
    this.add.ellipse(R.centreX, R.piedsGreg - 4, 260, 34, 0x000000, 0.25);

    this.j = {
      vie: 100, souffle: 100, esprit: 0, downs: 0,
      action: null, esquive: null, esquivePause: 0, garde: false, sonne: 0,
      contreJusqua: -1, reposSouffle: 0, dempsey: null, decalage: 0, tremble: 0, finEsquive: -9,
      sprite: this.add.image(R.centreX, R.piedsJoueur, 'heros_boxe_garde').setOrigin(0.5, 1).setDepth(10)
        .setScale(R.tailleJoueur).setAlpha(R.transparenceJoueur),   // transparent pour bien voir Greg
    };
    // contour lumineux cyan autour de ton boxeur (comme Little Mac), si la carte graphique le permet
    // (déjà intégré dans les images illustrées ; l'effet "glow" en direct coûte trop cher en fluidité)
    if (!this.textures.exists('heros_garde')) {
      try { if (this.j.sprite.preFX) this.j.sprite.preFX.addGlow(0x7fe8ff, 3, 0, false, 0.1, 12); } catch (e) { /* ignoré */ }
    }
    this.g = {
      vie: 100, souffle: 100, downs: 0, fureur: 1, secousse: 0, combo: 0, couvert: 0, vertige: 0,
      etat: 'garde', t: 0, attaque: null, coupIndex: 0, garde: 'haute',
      seqIndex: 0, seqPas: 0, finSeq: true, pause: 1.5, poseForcee: null,
      sprite: this.add.image(R.centreX, R.piedsGreg, 'greg_garde').setOrigin(0.5, 1).setDepth(9),
      vis: { dx: 0, dy: 0, echelle: 1, angle: 0 },   // mouvements de l'illustration
    };
    // Si l'illustration détourée de Greg existe, on l'utilise (sinon : les poses dessinées par le code)
    this.illustre = this.textures.exists(R.illustre.poses.entier.cle);
    if (this.illustre) this.g.sprite.setTexture(R.illustre.poses.entier.cle);
    // jambes de Greg (posées sur le tapis, sous le haut du corps)
    const J = R.illustre.jambes;
    this.g.jambes = this.illustre && this.textures.exists(J.cle)
      ? this.add.image(R.centreX, 0, J.cle).setDepth(8.9) : null;
    this.zoneGarde = this.add.graphics().setDepth(9.5);
    this.aura = this.add.graphics().setDepth(8);
    this.etoiles = this.add.graphics().setDepth(12);        // aura bleue derrière Greg (coup au corps)
    this.cible = this.add.graphics().setDepth(25);      // cible qui se resserre là où le coup va frapper
    this.alerte = texte(this, R.centreX + 150, 150, '!', 60, '#ffd84a').setDepth(30).setVisible(false);
    // grosse flèche "où esquiver" pendant que Greg prépare son coup
    this.flecheEsquive = texte(this, R.centreX, 300, '', 40, '#ffd84a', { lineSpacing: 2 }).setDepth(31).setVisible(false);
    this.aideContre = texte(this, R.centreX, 250, 'CONTRE !', 28, '#ff8a3d').setDepth(30).setVisible(false);

    this.creerHud();
    this.touches = creerTouches(this);
    this.events.once('shutdown', () => taireAnnonceur());
    rangerBoutonPause(this);   // sur téléphone : pause en haut à droite (comme chez Lionel)
    this.gestes = estTactile() && R.gestesTactiles ? installerGestes(this, {
      mode: () => {
        if (this.etat === 'compte' && this.compte && this.compte.qui === 'joueur') return 'tapis';
        if (this.etat !== 'combat' || this.gel > 0) return null;
        const d = this.j.dempsey;
        return d ? (d.contre ? 'frein' : 'dempsey') : 'combat';
      },
      dempseyPret: () => this.j.esprit >= 100 && this.etat === 'combat' && !this.j.dempsey && this.gel <= 0,
    }) : null;
    // ambiance du public en continu : plus Greg est en difficulté, plus le public hurle
    if (this.cache.audio.exists('greg_ambiance')) {
      this.ambiance = this.sound.add('greg_ambiance', { loop: true, volume: 0 });
      this.ambiance.play();
      const pause = () => this.ambiance.pause(), reprise = () => this.ambiance.resume();
      this.events.on('pause', pause); this.events.on('resume', reprise);
      this.events.once('shutdown', () => { this.events.off('pause', pause); this.events.off('resume', reprise); this.ambiance.stop(); this.ambiance.destroy(); });
    }
    // au retour de pause, on "oublie" la touche qui a servi à reprendre
    const oublier = () => { this.lireTouches(); this.memoire = {}; };
    this.events.on('resume', oublier);
    this.events.once('shutdown', () => this.events.off('resume', oublier));
    // pause pendant le clip du Dempsey : la vidéo est cachée (sinon elle couvre le menu de pause)
    const cacherClip = (v) => () => { if (this.clipDempsey) this.clipDempsey.cacher(v); };
    const c1 = cacherClip(true), c2 = cacherClip(false);
    this.events.on('pause', c1); this.events.on('resume', c2);
    this.events.once('shutdown', () => { this.events.off('pause', c1); this.events.off('resume', c2); });
    // musique de fond (Hajime no Ippo, opening 2) : chargée pendant l'écran des commandes
    jouerMusique(this, 'greg_musique');
    this.afficher();

    etiquettesTactiles(ETIQUETTES_OK);
    const tactile = estTactile();
    this.afficherIntro('GREG - Le Boxeur', this.gestes ? [
      'GAUCHE de l\'écran : glisse ◀ ▶ = esquive (côté OPPOSÉ au coup)',
      'GAUCHE de l\'écran : doigt posé = GARDE',
      'DROITE de l\'écran : touche = COUP DE POING',
      'Esquives réussies => jauge => bouton doré DEMPSEY ROLL',
      'Au tapis : touche gauche / droite très vite pour te relever !',
    ] : [
      '◀ / ▶ : esquive du côté OPPOSÉ au coup (puis frappe vite = CONTRE !)',
      tactile ? 'Coup : coup de poing' : 'Espace : coup de poing',
      tactile ? '▼ Garde (maintenu) : garde' : 'Bas (maintenu) : garde',
      tactile ? 'Esquives réussies => jauge d\'esprit => bouton Dempsey' : 'Esquives réussies => jauge d\'esprit => X = DEMPSEY ROLL',
      'Au tapis : alterne ◀ ▶ très vite pour te relever !',
    ], () => this.presentation(() => this.choisirDifficulte(() => this.ouvrirCoin())));
  }

  // =================================================================
  //  BOUCLE PRINCIPALE
  // =================================================================
  update(temps, delta) {
    if (this.termine) return;
    const reel = delta / 1000;
    if (this.arret > 0) { this.arret -= reel; return; }   // hit-stop
    this.lireTouches();

    if (this.gel > 0) {
      this.gel -= reel;
      if (this.gel <= 0 && this.apresGel) { const f = this.apresGel; this.apresGel = null; f(); }
      return;
    }
    if (this.ralentiTemps > 0) {
      this.ralentiTemps -= reel;
      if (this.ralentiTemps <= 0) this.ralenti = 1;
    }
    const dt = reel * this.ralenti;

    if (this.etat === 'combat') {
      this.horloge += dt;
      if (!this.j.dempsey) this.tempsRound -= dt;   // chrono figé pendant le Dempsey Roll
      this.tempsTotal += dt;
      if (this.j.dempsey) this.majDempsey(dt);
      else { this.majJoueur(dt); this.majGreg(dt); }
      if (this.etat === 'combat' && this.tempsRound <= 0) this.finDuRound();
    } else if (this.etat === 'compte') {
      this.majCompte(dt);
    }
    this.afficher(reel);
  }

  // Appui "en mémoire" pour le joueur : un appui fait pendant son coup ou quand il est sonné
  // est gardé un court instant (R.memoireAppui) puis joué dès que possible
  memo(k) { return this.memoire && this.memoire[k] > this.time.now; }
  consommer(...ks) { ks.forEach(k => { if (this.memoire) this.memoire[k] = 0; }); }

  // Appuis de l'image en cours (lus à chaque image pour ne pas "garder" un appui en mémoire)
  lireTouches() {
    const t = this.touches;
    this.appuis = {
      espace: vientDAppuyer(t.espace), z: vientDAppuyer(t.z), x: vientDAppuyer(t.x),
      haut: vientDAppuyer(t.haut), bas: vientDAppuyer(t.bas),
      gauche: vientDAppuyer(t.gauche), droite: vientDAppuyer(t.droite),
    };
    this.memoire = this.memoire || {};
    for (const k of ['espace', 'z', 'x', 'gauche', 'droite']) {
      if (this.appuis[k]) this.memoire[k] = this.time.now + (k === 'gauche' || k === 'droite' ? R.memoireEsquive : R.memoireAppui) * 1000;
    }
  }


  parler(texte, options) { if (R.annonceur) annoncer(texte, options); }

  figer(secondes, ensuite) { this.gel = secondes; this.apresGel = ensuite || null; }
  // Hit-stop : fige l'image un court instant à l'impact (séparé de figer, qui sert aux encarts)
  arreter(secondes) { this.arret = Math.max(this.arret, secondes); }
  nouvellesStatsRound() { return { tete: 0, corps: 0, smash: 0, tropTot: 0, mauvaisCote: 0 }; }
  ralentir(facteur, secondes) { this.ralenti = facteur; this.ralentiTemps = secondes; }

  // =================================================================
  //  JOUEUR
  // =================================================================
  majJoueur(dt) {
    const j = this.j, a = this.appuis, t = this.touches;
    j.esquivePause -= dt;

    // souffle
    j.reposSouffle -= dt;
    // pas de récupération de souffle tant qu'on tient la garde : la garde a un vrai coût
    if (j.reposSouffle <= 0 && !j.action && !t.bas.isDown) j.souffle = Math.min(100, j.souffle + R.souffleRecup * dt);
    j.sprite.setTint(j.sonne > 0 ? 0xff7070 : 0xffffff);

    if (j.sonne > 0) { j.sonne -= dt; j.garde = false; return; }

    // Dempsey Roll (prioritaire, même pendant une esquive)
    if (!j.action && this.memo('x') && j.esprit >= 100) {
      this.consommer('x');
      this.lancerDempsey();
      return;
    }

    // coup en cours
    if (j.action) {
      const c = R.coups[j.action.coup];
      j.action.t += dt;
      if (!j.action.fait && j.action.t >= c.impact) { j.action.fait = true; this.coupDuJoueur(j.action.coup); }
      const rush = this.g.etat === 'etourdi' ? R.etourdi.coupRapide : 1;   // Greg étourdi : on enchaîne plus vite
      if (j.action && j.action.t >= c.duree * rush) j.action = null;
      // on peut couper la fin de son coup pour esquiver
      else if (j.action && j.action.fait && (this.memo('gauche') || this.memo('droite'))) j.action = null;   // on peut couper son coup dès l'impact
      else return;
      if (j.action) return;
    }

    // esquive en cours : on peut l'annuler en frappant pendant la fenêtre de contre
    if (j.esquive) {
      j.esquive.t += dt;
      const contrePossible = this.horloge < j.contreJusqua;
      if (contrePossible && (this.memo('espace') || this.memo('z'))) {
        const coup = 'visage';   // un seul coup (Espace ou Z)
        this.consommer('espace', 'z');
        const poing = j.esquive.cote < 0 ? 'd' : 'g';   // esquive à gauche => le poing DROIT part (et inversement)
        j.esquive = null; this.frapper(coup, poing); return;
      }
      if (j.esquive.t >= Math.max(R.esquiveDuree, this.diff.esquive + 0.05)) { j.esquive = null; j.esquivePause = R.esquivePause; j.finEsquive = this.horloge; }
      return;
    }

    j.garde = t.bas.isDown;
    if (j.garde) return;

    if ((this.memo('gauche') || this.memo('droite')) && j.esquivePause <= 0) {
      const cote = this.memo('gauche') ? -1 : 1;
      this.consommer('gauche', 'droite');
      if (j.souffle < R.esquiveSouffle) { this.essouffle(); return; }
      j.souffle -= R.esquiveSouffle; j.reposSouffle = 0.4;
      j.esquive = { t: 0, cote };
      return;
    }
    if (this.memo('espace') || this.memo('z')) {
      this.consommer('espace', 'z');
      this.frapper('visage');   // un seul coup (Espace ou Z)
    }
  }

  frapper(coup, poing) {
    const j = this.j, c = R.coups[coup];
    const rush = this.g.etat === 'etourdi';   // Greg étourdi : tes coups ne coûtent pas de souffle
    if (!rush && j.souffle < c.souffle) { this.essouffle(); return; }
    if (!rush) { j.souffle -= c.souffle; j.reposSouffle = 0.5; }
    // poing GAUCHE / DROIT : imposé (contre après une esquive) ou chacun son tour (juste pour l'animation)
    if (!poing) { this.alterne = !this.alterne; poing = this.alterne ? 'g' : 'd'; } else this.alterne = poing === 'g';
    const pose = coup === 'corps' ? (poing === 'g' ? 'corps_g' : 'corps') : (poing === 'g' ? 'jab' : 'crochet');
    j.action = { coup, t: 0, fait: false, debut: this.horloge, pose };
  }

  essouffle() {
    if (this.messageSouffle && this.messageSouffle.active) return;
    this.messageSouffle = texte(this, R.centreX, 300, 'À bout de souffle...', 20, '#ffb347').setDepth(30);
    this.tweens.add({ targets: this.messageSouffle, alpha: 0, delay: 600, duration: 300, onComplete: () => this.messageSouffle.destroy() });
  }

  // Résultat d'un coup du joueur au moment de l'impact
  coupDuJoueur(coup) {
    const j = this.j, g = this.g, c = R.coups[coup];
    if (g.etat === 'sol') return;
    const point = c.cible === 'corps' ? CORPS_GREG : VISAGE_GREG;
    const xImpact = point.x + Phaser.Math.Between(-30, 30), yImpact = point.y;
    const contre = this.horloge < j.contreJusqua;
    const neutre = g.etat === 'garde';
    const titube = g.etat === 'etourdi';
    const sonneGreg = g.etat === 'touche';   // il vient d'encaisser : il pare aussi (il faut CONTRER)
    // anti-martelage : trop de coups en peu de temps (sans contre) = il pare tout ce qui n'est pas un contre
    this.coupsRecents = (this.coupsRecents || []).filter(t => this.horloge - t < R.martelage.fenetre);
    if (!contre) this.coupsRecents.push(this.horloge);
    const martele = this.coupsRecents.length > R.martelage.coups && (neutre || sonneGreg || g.etat === 'recup');   // (essoufflé = grande ouverture : on peut cogner)
    // pendant qu'il ARME un coup (sauf SMASH), il pare : il faut esquiver puis contrer
    const pareEnArmant = g.etat === 'prepare' && g.attaque && g.attaque.cible !== 'smash';
    // même dans la zone ouverte, il pare parfois (les contres restent la vraie source de dégâts)
    const pareLibre = (neutre || sonneGreg) && Math.random() < R.blocageLibre[this.round - 1];
    const bloque = !contre && !titube && (g.couvert > 0 || pareEnArmant || pareLibre || martele);

    if (bloque) {
      jouerSon(this, 'greg_bloque');
      onomatopee(this, xImpact, yImpact, pareEnArmant ? 'PARÉ !' : (martele ? 'Arrête de marteler !' : ONO.bloque), martele ? 22 : 26, '#cccccc');
      if (g.couvert <= 0) g.poseForcee = { nom: 'bloque', t: 0.18 };
      g.combo = 0; this.finSerie();
      // tu le martèles : il pare et te punit tout de suite (fini les blocages en boucle)
      if (martele && (neutre || sonneGreg) && !g.riposte) {
        g.riposte = true; g.etat = 'garde'; g.t = 0; g.attaque = null; g.pause = 0.15;
      }
      return;
    }

    let degats = c.degats;
    // il faut avoir lancé un coup APRÈS qu'il a baissé la garde (pas en martelant avant)
    const secretValide = g.etat === 'nargue' && j.action && j.action.debut >= g.nargueDebut && coup === R.nargue.coup;
    if (g.etat === 'nargue' && !secretValide) {
      // mauvais coup ou coup lancé trop tôt : il esquive en rigolant et reprend sa garde
      onomatopee(this, R.centreX + 150, 150, 'Raté, hé hé !', 22, '#ffd84a');
      jouerSon(this, 'greg_esquive');
      this.retourGardeGreg(0.3);
      return;
    }
    if (secretValide) {
      if (!this.secretFait) {   // COUP SECRET : il tombe direct
        this.secretFait = true;
        flash(this, 0.9, 0xffd84a);
        this.arreter(0.25);
        jouerSon(this, 'greg_foule');
        onomatopee(this, R.centreX, 110, 'COUP SECRET !!', 56, '#ffd84a');
        jouerSon(this, 'greg_coup_fort', { rate: 0.7 });
        this.delaiDown = 0.6;   // le "DOWN !!" arrive juste après, pour ne pas se superposer
        this.blesserGreg(g.vie);
        return;
      }
      degats *= R.nargue.multiplicateur;
      onomatopee(this, xImpact, yImpact - 50, 'BIEN VU !!', 46, '#ffd84a');
      this.arreter(R.arretImpact.contre);
    }
    if (titube) degats *= R.etourdi.multiplicateur;   // RUSH : Greg sans défense, chaque coup fait très mal
    g.reculSens = null;
    if (contre) {
      degats *= R.contreMultiplicateur;
      j.contreJusqua = -1;
      j.esprit += R.esprit.contre;
      this.ralentir(0.25, 0.35);
      flash(this, 0.7);
      lignesImpact(this, xImpact, yImpact, 0xffd84a, 26, 240);
      onomatopee(this, xImpact, yImpact - 50, 'CONTRE !!', 52, '#ff8a3d');
      this.cameras.main.shake(180, 0.012);
      this.arreter(R.arretImpact.contre);
      this.tweens.add({ targets: this.cameras.main, zoom: 1.04, duration: 80, hold: 60, yoyo: true });
    } else {
      onomatopee(this, xImpact, yImpact, c.cible === 'corps' ? ONO.corps : ONO.fort, 40, c.cible === 'corps' ? '#5ad1ff' : '#ffffff');
      lignesImpact(this, xImpact, yImpact, 0xffffff, 14, 140);
      this.cameras.main.shake(70, 0.005);
      this.arreter(R.arretImpact.coup);
    }
    jouerSon(this, contre ? 'greg_coup_fort' : 'greg_coup');
    // série « X HITS » : chaque coup enchaîné frappe un peu plus fort
    this.serie = this.horloge < this.serieJusqua ? this.serie + 1 : 1;
    this.serieJusqua = this.horloge + R.serie.oubli;
    degats *= 1 + R.serie.bonus * (this.serie - 1);
    if (this.serie >= 2) this.montrerSerie();
    degats *= this.diff.degatsJoueur || 1;
    j.esprit = Math.min(100, j.esprit + R.esprit.coupPorte);
    g.secousse = contre ? 0.3 : 0.15;
    if (c.souffleGreg) g.souffle -= c.souffleGreg * (contre ? 2 : 1);
    this.blesserGreg(degats);
    if (g.etat === 'sol') return;
    if (contre && Math.random() < 0.35) bulle(this, R.centreX - 220, 330, auHasard(REPLIQUES.joueurContre), 900);
    if (g.etat === 'etourdi') return;   // il titube : il encaisse tout
    if (g.etat === 'essouffle') return;   // à bout de souffle : il encaisse SANS sortir de son essoufflement (sinon il ne reprenait jamais son souffle)

    // jauge d'étourdissement (cachée)
    g.vertige += (contre ? R.etourdi.parContre : R.etourdi.parCoup) * (c.vertige || 1);
    if (g.vertige >= 100) { this.etourdirGreg(); return; }

    // Après plusieurs coups d'affilée, Greg se couvre puis riposte (pas de "coups gratuits" à l'infini)
    g.combo++;
    if (g.combo >= R.comboMax && !contre) {
      g.combo = 0;
      g.couvert = R.dureeCouverture;
      g.poseForcee = { nom: 'bloque', t: R.dureeCouverture };
      g.etat = 'garde'; g.t = 0; g.attaque = null; g.pause = R.dureeCouverture + 0.1;
      g.riposte = true;   // ... puis il riposte tout de suite
      this.alerte.setVisible(false);
      onomatopee(this, R.centreX + 170, 80, 'Il se couvre !', 22, '#cccccc');
      return;
    }

    // Pendant qu'il prépare son coup, seul un contre l'interrompt (sauf le Smash)
    const interrompt = g.etat !== 'prepare' || contre;
    const smash = g.attaque && g.attaque.cible === 'smash' && (g.etat === 'prepare' || g.etat === 'frappe');
    if (interrompt && !smash) {
      if (g.etat === 'prepare') onomatopee(this, R.centreX + 170, 60, 'Interrompu !', 22, '#7fff7f');
      // il garde le temps qui lui restait avant d'attaquer (pas de blocage en boucle)
      g.pauseAvant = g.etat === 'garde' ? g.pause : R.pauseApresTouche;
      g.toucheDepuis = this.time.now;
      g.etat = 'touche'; g.t = 0; g.attaque = null;
      this.alerte.setVisible(false);
    }
  }

  // « 2 HITS ! », « 3 HITS ! »... au-dessus de Greg
  montrerSerie() {
    if (!this.texteSerie || !this.texteSerie.active) this.texteSerie = texte(this, R.centreX - 230, 200, '', 34, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 6 }).setDepth(30);
    this.tweens.killTweensOf(this.texteSerie);
    this.texteSerie.setText(`${this.serie} HITS !`).setAlpha(1).setScale(1.5).setVisible(true);
    this.tweens.add({ targets: this.texteSerie, scale: 1, duration: 140, ease: 'Back.Out' });
    this.tweens.add({ targets: this.texteSerie, alpha: 0, delay: 700, duration: 300 });
  }
  finSerie() { this.serie = 0; this.serieJusqua = -1; }

  // Greg étourdi : il titube, garde baissée, des étoiles autour de la tête
  etourdirGreg() {
    const g = this.g;
    g.vertige = 0; g.etat = 'etourdi'; g.t = 0; g.attaque = null; g.couvert = 0; g.combo = 0;
    this.alerte.setVisible(false);
    onomatopee(this, R.centreX, 210, 'ÉTOURDI !!', 54, '#ffd84a');
    onomatopee(this, R.centreX, 270, 'TAPE ! TAPE ! TAPE !', 30, '#ff8a3d');
    this.ralentir(0.5, 0.2);
    jouerSon(this, 'greg_foule');
    this.parler('Il est sonné !', { coupe: false });
  }

  blesserGreg(degats) {
    const g = this.g;
    this.stats.donnes += Math.min(degats, g.vie);
    g.vie -= degats;
    if (g.vie <= 0) { g.vie = 0; this.gregAuTapis(); }
  }

  // =================================================================
  //  GREG
  // =================================================================
  majGreg(dt) {
    const g = this.g;
    g.t += dt;
    g.couvert -= dt;
    g.vertige = Math.max(0, g.vertige - R.etourdi.baisse * dt);
    if (g.poseForcee) { g.poseForcee.t -= dt; if (g.poseForcee.t <= 0) g.poseForcee = null; }

    if (g.souffle <= 0 && (g.etat === 'garde' || g.etat === 'touche' || g.etat === 'recup')) {
      g.etat = 'essouffle'; g.t = 0; g.attaque = null;
      onomatopee(this, R.centreX + 170, 80, 'Haa... haa...', 26, '#ffb347');
    }

    switch (g.etat) {
      case 'garde': {
        g.souffle = Math.min(100, g.souffle + R.souffleGregRecup * dt);
        g.pause -= dt;
        if (g.pause <= 0) {
          if (g.riposte) this.riposter();
          else if (this.nargueRound !== this.round && this.tempsRound <= this.momentNargue && g.finSeq) this.narguer();
          else this.choisirAttaque();
        }
        break;
      }
      case 'prepare':
        if (g.t >= g.prepa) this.impactGreg();
        break;
      case 'nargue':
        if (g.t >= R.nargue.duree) this.retourGardeGreg();
        break;
      case 'frappe':   // très court : on montre le coup, puis la suite
        if (g.t >= 0.14) {
          const at = g.attaque;
          if (at.coups && g.coupIndex < at.coups) {
            g.etat = 'prepare'; g.t = 0; g.prepa = at.entre * g.fureur * R.vitesseRound[this.round - 1] * this.diff.vitesse;
            at.cote = this.coteAuHasard(at);
            this.montrerAlerte();
          }
          else { g.etat = 'recup'; g.t = 0; }
        }
        break;
      case 'recup':
        if (g.t >= g.attaque.recup) this.retourGardeGreg();
        break;
      case 'touche':
        if (g.t >= R.dureeTouche) {
          g.etat = 'garde'; g.t = 0; g.attaque = null;
          g.pause = Math.min(g.pauseAvant ?? R.pauseApresTouche, R.pauseApresTouche);
          // garde-fou : s'il n'a pas attaqué depuis longtemps (tu le martèles), il repart tout de suite
          if (this.horloge - (g.derniereAttaque ?? this.horloge) > R.maxSansAttaque) { g.riposte = true; g.pause = 0.05; }
        }
        break;
      case 'etourdi':
        if (g.t >= R.etourdi.duree) { onomatopee(this, R.centreX + 170, 80, 'Il reprend ses esprits...', 20, '#cccccc'); this.retourGardeGreg(0.3); }
        break;
      case 'essouffle':
        if (g.t >= R.dureeEssoufflement) { g.souffle = R.souffleGregApresEssoufflement; this.retourGardeGreg(); }
        break;
    }
  }

  retourGardeGreg(pauseMin) {
    const g = this.g;
    const [min, max] = R.pauseAttaque[this.round - 1];
    g.etat = 'garde'; g.t = 0; g.attaque = null;
    if (pauseMin !== undefined) g.pause = entre(pauseMin, pauseMin + 0.6);
    else if (!g.finSeq) {   // il enchaîne (rounds 2-3 : parfois un petit temps d'arrêt qui piège)
      g.pause = entre(0.35, 0.55);
      if (this.round >= 2 && Math.random() < R.hesitation.chance) g.pause += entre(...R.hesitation.duree);
    }
    else { g.pause = entre(min, max); g.garde = g.garde === 'haute' ? 'basse' : 'haute'; }   // fin d'enchaînement
  }

  // Riposte rapide après "Il se couvre" (un jab, sans avancer dans son enchaînement)
  riposter() {
    const g = this.g;
    g.riposte = false;
    const at = ATTAQUES.jab;
    g.attaque = { id: 'jab', ...at, cote: this.coteAuHasard(at) };
    g.coupIndex = 0; g.combo = 0; g.derniereAttaque = this.horloge;
    g.etat = 'prepare'; g.t = 0; g.prepa = R.riposte.prepa * this.diff.vitesse;
    this.montrerAlerte();
    onomatopee(this, R.centreX + 170, 80, 'Riposte !', 22, '#ff8a3d');
  }

  choisirAttaque() {
    const g = this.g;
    // Greg joue ses enchaînements dans l'ordre (voir ENCHAINEMENTS dans reglages.js) ; énervé : avec feintes
    const liste = g.enerve ? ENCHAINEMENTS_ENERVE : ENCHAINEMENTS[this.round - 1];
    // rounds 2-3 (et énervé) : un enchaînement au hasard, jamais deux fois de suite le même
    if (g.seqPas === 0 && (this.round >= 2 || g.enerve)) {
      const possibles = liste.map((_, k) => k).filter(k => k !== this.dernierSeq
        && !(this.round === 2 && !g.enerve && this.smashR2Fait && liste[k].includes('smash')));
      g.seqIndex = auHasard(possibles.length ? possibles : [0]);
    }
    if (g.seqPas === 0) this.dernierSeq = g.seqIndex % liste.length;
    const seq = liste[g.seqIndex % liste.length];
    const [nom, cote] = seq[g.seqPas].split(' ');
    g.seqPas++;
    g.finSeq = g.seqPas >= seq.length;
    if (g.finSeq) { g.seqPas = 0; g.seqIndex++; }
    const at = ATTAQUES[nom];
    g.attaque = { id: nom, ...at, cote: at.cible === 'smash' ? 'centre' : (cote || this.coteAuHasard(at)) };
    g.coupIndex = 0; g.combo = 0; g.derniereAttaque = this.horloge;
    g.etat = 'prepare'; g.t = 0; g.prepa = at.prepa * g.fureur * R.vitesseRound[this.round - 1] * this.diff.vitesse;
    g.souffle -= at.souffle;
    this.montrerAlerte();
    if (at.cible === 'smash') {
      if (this.round === 2) this.smashR2Fait = true;
      // son "tell" : il tape ses gants l'un contre l'autre avant le SMASH
      onomatopee(this, R.centreX - 120, 120, 'TAP !', 30, '#ff8a3d');
      this.time.delayedCall(180, () => onomatopee(this, R.centreX + 120, 110, 'TAP !', 30, '#ff8a3d'));
      jouerSon(this, 'greg_bloque'); this.time.delayedCall(180, () => jouerSon(this, 'greg_bloque'));
      if (!this.smashAnnonce) {
        this.smashAnnonce = true;
        const e = encart(this, 'SMASH !!', 'Quand il tape ses gants... ESQUIVE sur le côté !', '#ff3b3b', 0x2a0000, 'greg_visage');
        this.figer(1.0, () => e.fermer());
      }
    }
  }

  // Moment secret : il baisse la garde et te nargue. Frappe-le maintenant !
  narguer() {
    const g = this.g;
    this.nargueRound = this.round;
    g.etat = 'nargue'; g.t = 0; g.attaque = null; g.nargueDebut = this.horloge;
    this.alerte.setVisible(false);
    // bien visible (audit nov. 2026) : « hé... » + sifflement + éclat sur son ventre (là où il est ouvert)
    onomatopee(this, R.centreX - 150, 150, 'hé hé...', 30, '#ffd84a');
    jouerSon(this, 'greg_esquive', { rate: 0.6 });
    const eclat = this.add.star(CORPS_GREG.x, CORPS_GREG.y + 20, 6, 8, 30, 0xfff3a8).setDepth(29).setAlpha(0.9);
    this.tweens.add({ targets: eclat, scale: 1.8, angle: 90, alpha: 0, duration: R.nargue.duree * 1000, onComplete: () => eclat.destroy() });
  }

  // De quel côté de l'écran part le coup : 'g' (gauche), 'd' (droite) ; le SMASH part du centre
  coteAuHasard(at) {
    return at.cible === 'smash' ? 'centre' : (Math.random() < 0.5 ? 'g' : 'd');
  }

  montrerAlerte() {
    const at = this.g.attaque;
    // le "!" apparaît du côté d'où part le coup
    // (coup au corps : au MILIEU, sous son menton — le côté ne compte pas, seule la garde marche)
    const x = at.cible === 'corps' ? R.centreX : (at.cote === 'g' ? R.centreX - 170 : (at.cote === 'd' ? R.centreX + 170 : R.centreX + 150));
    this.alerte.setText(at.cible === 'smash' ? '!!' : (at.cible === 'corps' ? '!\n▼' : '!'))
      .setColor(COULEUR_ALERTE[at.cible]).setVisible(true).setScale(0.4).setPosition(x, at.cible === 'corps' ? 190 : 150);
    // la flèche montre quoi faire
    const f = this.flecheEsquive;
    if (at.cible === 'corps') f.setText('▼\nGARDE').setPosition(R.centreX, 285);
    else if (at.cible === 'smash') f.setText('◀   ▶\nESQUIVE').setPosition(R.centreX, 285);
    else if (at.cote === 'g') f.setText('▶▶\nESQUIVE').setPosition(R.centreX + 190, 285);
    else f.setText('◀◀\nESQUIVE').setPosition(R.centreX - 190, 285);
    f.setColor(COULEUR_ALERTE[at.cible]);
    this.tweens.add({ targets: this.alerte, scale: 1, duration: 120, ease: 'Back.Out' });
    // (analyse comparée, façon Punch-Out) chaque coup a SON annonce sonore : on finit par jouer à l'oreille
    const A = R.annonces[at.feinte ? 'feinte' : at.id] || R.annonces.jab;
    jouerSon(this, A.son, { rate: A.rate });
  }

  // Le coup de Greg arrive : esquivé, bloqué ou encaissé ?
  impactGreg() {
    const g = this.g, j = this.j, at = g.attaque;
    g.coupIndex++;
    g.etat = 'frappe'; g.t = 0;
    // gant blanc qui fonce vers l'écran (seulement s'il n'y a pas d'image de coup)
    if (this.illustre && !this.textures.exists(R.illustre.poses.jab.cle)) this.gantVolant(at, j.esquive && j.esquive.t <= this.diff.esquive && at.cible !== 'corps' ? j.esquive.cote : 0);
    this.alerte.setVisible(false);
    const xImpact = R.centreX + j.decalage, yImpact = at.cible === 'corps' ? TETE_JOUEUR_Y + VENTRE_JOUEUR : TETE_JOUEUR_Y;
    if (at.feinte) {   // feinte : rien ne part... et le vrai coup arrive juste après
      onomatopee(this, R.centreX + 170, 110, 'Feinte !', 26, '#ff8a3d');
      return;
    }

    // esquive réussie = partir du côté OPPOSÉ au coup (coup venant de gauche => esquive à droite)
    const bonCote = at.cote === 'centre' || !at.cote || (j.esquive && j.esquive.cote === (at.cote === 'g' ? 1 : -1));
    const esquive = j.esquive && j.esquive.t <= this.diff.esquive && bonCote;
    if (j.esquive && !bonCote && at.cible !== 'corps') {
      onomatopee(this, R.centreX, TETE_JOUEUR_Y - 70, 'Mauvais côté !', 26, '#ff6b6b');
      this.statsRound.mauvaisCote++;
    }
    // esquive déjà finie juste avant le coup : on le dit au joueur
    if (!j.esquive && !j.garde && at.cible !== 'corps' && this.horloge - j.finEsquive < R.tropTot) {
      onomatopee(this, R.centreX, TETE_JOUEUR_Y - 70, 'Trop tôt !', 28, '#ff6b6b');
      this.statsRound.tropTot++;
    }
    if (esquive && at.cible !== 'corps') {
      jouerSon(this, 'greg_esquive');
      onomatopee(this, R.centreX - j.esquive.cote * 60, yImpact - 40, ONO.esquive, 34, '#aaffff');
      j.esprit = Math.min(100, j.esprit + R.esprit.esquive);
      // esquive PARFAITE : lancée au tout dernier moment
      if (j.esquive.t <= R.esquiveParfaite) {
        j.esprit = Math.min(100, j.esprit + R.espritParfait);
        flash(this, 0.35, 0x5ad1ff);
        onomatopee(this, R.centreX + j.esquive.cote * 170, TETE_JOUEUR_Y - 90, 'PARFAIT !', 30, '#5ad1ff');
      }
      j.contreJusqua = this.horloge + R.contreFenetre;
      this.ralentir(0.4, 0.25);
      if (at.cible === 'smash') onomatopee(this, R.centreX + 170, 60, 'Dans le vide !', 24, '#7fff7f');
      return;
    }

    let degats = at.degats * this.diff.degatsGreg;
    if (j.garde && at.cible !== 'smash') {
      degats *= R.garde;
      j.souffle = Math.max(0, j.souffle - R.gardeSouffle);
      if (j.souffle <= 0) {   // plus de souffle : la garde cède
        degats = at.degats * this.diff.degatsGreg * 0.5;
        j.garde = false; j.sonne = R.gardeBriseeSonne; j.tremble = 0.3;
        onomatopee(this, xImpact, yImpact - 30, 'Garde brisée !', 32, '#ff6b6b');
        this.cameras.main.shake(200, 0.015);
        jouerSon(this, 'greg_coup_fort');
      } else {
        jouerSon(this, 'greg_bloque');
        onomatopee(this, xImpact, yImpact, ONO.bloque, 28, '#cccccc');
        j.tremble = 0.1;
      }
    } else if (j.garde && at.cible === 'smash') {
      degats *= at.gardeCassee;
      j.garde = false; j.sonne = R.smashGardeSonne;
      onomatopee(this, xImpact, yImpact - 30, 'Garde brisée !', 32, '#ff6b6b');
      this.cameras.main.shake(200, 0.015);
      jouerSon(this, 'greg_coup_fort');
    } else {
      j.esquive = null; j.action = null; this.finSerie();
      j.sonne = R.toucheDuree; j.tremble = 0.25;
      if (at.souffleJoueur) j.souffle = Math.max(0, j.souffle - at.souffleJoueur);
      const enorme = at.cible === 'smash';
      onomatopee(this, xImpact, yImpact, enorme ? ONO.enorme : (at.cible === 'corps' ? ONO.corps : ONO.fort),
        enorme ? 60 : 42, enorme ? '#ff3b3b' : '#ffffff');
      lignesImpact(this, xImpact, yImpact, enorme ? 0xff3b3b : 0xffffff, enorme ? 30 : 14, enorme ? 280 : 150);
      gouttes(this, xImpact, yImpact, Math.random() < 0.5 ? -1 : 1);
      this.cameras.main.shake(enorme ? 300 : 120, enorme ? 0.02 : 0.008);
      if (enorme) flash(this, 0.8, 0xff3b3b);
      jouerSon(this, 'greg_coup_fort');
      this.arreter(R.arretImpact.recu);
      if (Math.random() < 0.2) bulle(this, R.centreX - 220, 330, auHasard(REPLIQUES.joueurTouche), 900);
      this.statsRound[at.cible === 'tete' ? 'tete' : at.cible]++;
      if (navigator.vibrate) navigator.vibrate(enorme ? 120 : 40);
    }
    this.blesserJoueur(degats);
  }

  // Le gros gant blanc de Greg qui fonce vers l'écran (vue Punch-Out)
  gantVolant(at, esquive) {
    const depart = at.cible === 'smash' ? [R.centreX + 30, 330] : (at.cible === 'corps' ? [R.centreX + 70, 290] : [R.centreX + 80, 170]);
    const arrivee = at.cible === 'corps' ? [R.centreX, TETE_JOUEUR_Y + VENTRE_JOUEUR] : [R.centreX, TETE_JOUEUR_Y - (at.cible === 'smash' ? 40 : 0)];
    // si tu as esquivé, le gant passe à côté (du côté opposé)
    if (esquive) arrivee[0] -= esquive * 260;
    const gt = this.add.image(depart[0], depart[1], 'greg_gant').setDepth(20).setScale(0.35)
      .setAngle(at.id === 'crochet' ? -35 : (at.cible === 'smash' ? 180 : 0));
    this.tweens.add({
      targets: gt, x: arrivee[0], y: arrivee[1], scale: at.cible === 'smash' ? 2.0 : 1.6, duration: 110, ease: 'Quad.In',
      onComplete: () => this.tweens.add({ targets: gt, alpha: 0, scale: gt.scale * 1.15, duration: 140, onComplete: () => gt.destroy() }),
    });
  }

  blesserJoueur(degats) {
    const j = this.j;
    this.stats.recus += Math.min(degats, j.vie);
    j.vie -= degats;
    if (j.vie <= 0) { j.vie = 0; this.joueurAuTapis(); }
  }

  // =================================================================
  //  DEMPSEY ROLL
  // =================================================================
  lancerDempsey() {
    const j = this.j, g = this.g, D = R.dempsey;
    j.esprit = 0; j.esquive = null; j.garde = false; j.action = null;
    const [cmin, cmax] = D.contreEntre;
    j.dempsey = {
      phi: 0,                       // position de la boule sur le "∞" : elle attend dans le cercle de droite
      attente: D.attenteMax,        // ... jusqu'à ce que le joueur appuie sur ▶
      periode: D.periodeDepart,
      coups: 0, erreurs: 0, demi: 0, touche: false, cote: 'd',
      contreA: this.round >= 3 ? Phaser.Math.Between(cmin, cmax) : -1, contre: false,
    };
    g.etat = 'touche'; g.t = 0; g.attaque = null; this.alerte.setVisible(false);
    jouerSon(this, 'greg_alerte');
    // Le clip (GIF / vidéo) s'il existe dans le manifeste, sinon l'animation dessinée par le code
    const clip = R.dempsey.clipUneFois && this.dempseyVu ? null : jouerClip(this, 'greg_dempsey');
    this.dempseyVu = true;
    if (!clip && R.dempsey.clipUneFois && this.dempseyLance) {   // lancement éclair (2e roll et suivants)
      flash(this, 0.6, 0xffd84a); onomatopee(this, R.centreX, 220, 'DEMPSEY ROLL !!', 52, '#ffd84a');
      this.figer(0.5, () => this.aideDempsey()); return;
    }
    this.dempseyLance = true;
    if (clip) { this.clipDempsey = clip; this.figer(clip.duree, () => { clip.fermer(); this.clipDempsey = null; this.aideDempsey(); }); return; }
    const e = encartDempsey(this);
    this.figer(1.8, () => { e.fermer(); this.aideDempsey(); });
  }

  // Consigne affichée tant que la boule attend le premier appui
  aideDempsey() {
    if (!this.texteAideDempsey || !this.texteAideDempsey.active) {
      this.texteAideDempsey = texte(this, R.centreX, 300, '', 19, '#ffd84a', { lineSpacing: 4, backgroundColor: '#000000c0', padding: { x: 10, y: 6 } }).setDepth(46);
    }
    this.texteAideDempsey.setText(this.gestes
      ? 'Touche à DROITE de l\'écran pour lancer le roll !\nEnsuite : touche à GAUCHE / à DROITE quand la boule y arrive'
      : 'Appuie sur ▶ pour lancer le roll !\nEnsuite : ◀ quand la boule arrive à GAUCHE, ▶ à DROITE').setVisible(true);
  }

  // Le "∞" : x de -1 à 1, droite quand phi = 0, gauche quand phi = PI
  static infini(phi) {
    const s = Math.sin(phi), c = Math.cos(phi), k = 1 + s * s;
    return { x: c / k, y: s * c / k };
  }

  majDempsey(dt) {
    const j = this.j, g = this.g, d = j.dempsey, a = this.appuis, D = R.dempsey;
    g.t = 0;   // Greg reste sonné tant que le roll continue

    // Au départ, la boule attend dans le cercle de droite : le 1er appui sur ▶ lance le rythme
    if (d.attente > 0) {
      d.attente -= dt;
      if (a.droite) { d.attente = 0; if (this.texteAideDempsey) this.texteAideDempsey.setVisible(false); this.coupDempsey('d', true); }
      else if (d.attente <= 0) { if (this.texteAideDempsey) this.texteAideDempsey.setVisible(false); this.casserDempsey('Trop tard !'); }
      return;
    }
    d.phi += (Math.PI * 2 / d.periode) * dt;

    // Chaque demi-tour du "∞" = un côté (pair : droite, impair : gauche) = un coup à placer
    const demi = Math.floor((d.phi + Math.PI / 2) / Math.PI);
    if (demi !== d.demi) {
      if (!d.touche) {   // la boule est passée sans qu'on frappe
        if (d.contre) { this.contreDempsey(); return; }
        if (this.erreurDempsey('Trop tard !')) return;
      }
      d.demi = demi; d.touche = false;
      d.contre = d.coups === d.contreA;
      if (d.contre) {
        d.contreA = -1;   // un seul contre par Dempsey Roll
        this.alerte.setText(this.gestes ? '!!\nTOUCHE !' : '!!\nGARDE !').setColor('#ff3b3b').setVisible(true).setPosition(R.centreX + 170, 150);
        jouerSon(this, 'greg_alerte');
      }
    }
    const coteDemi = d.demi % 2 === 0 ? 'd' : 'g';
    const centre = coteDemi === 'd' ? 0 : Math.PI;
    const ecart = Math.abs(Phaser.Math.Angle.Wrap(d.phi - centre));
    if (d.bip !== d.demi && Phaser.Math.Angle.Wrap(d.phi - centre) >= 0) {   // bip du métronome
      d.bip = d.demi;
      jouerSon(this, 'greg_compte', { rate: 1.4 });
    }

    // Greg contre : il faut freiner avec la garde (▼) au bon moment
    if (d.contre) {
      // ▼ trop tôt (boule encore loin) = le contre de Greg passe
      if (a.bas && !d.touche && ecart > D.bien * 1.6) { this.contreDempsey(); return; }
      if (a.bas && !d.touche && ecart <= D.bien * (this.gestes ? D.toleranceTactile : 1)) {
        d.touche = true; d.contre = false;
        this.alerte.setVisible(false);
        onomatopee(this, R.centreX, 300, 'FREIN !', 46, '#7fff7f');
        onomatopee(this, R.centreX + 170, 60, 'Dans le vide !', 24, '#ffffff');
        jouerSon(this, 'greg_esquive');
        this.ralentir(0.4, 0.3);
        d.cote = coteDemi;
      } else if (a.gauche || a.droite) {
        this.contreDempsey();
      }
      return;
    }

    const appui = a.gauche ? 'g' : (a.droite ? 'd' : null);
    if (!appui || d.touche) return;
    if (appui !== coteDemi) { d.touche = true; this.erreurDempsey('Mauvais côté !'); return; }
    const bien = D.bien * (this.gestes ? D.toleranceTactile : 1);   // au doigt : fenêtre plus large (retour Fabien nov. 2026)
    if (ecart > bien) { d.touche = true; this.erreurDempsey(Phaser.Math.Angle.Wrap(d.phi - centre) < 0 ? 'Trop tôt !' : 'Trop tard !'); return; }
    this.coupDempsey(appui, ecart <= D.parfait);
  }

  // Un coup du Dempsey Roll qui touche
  coupDempsey(appui, parfait) {
    const j = this.j, g = this.g, d = j.dempsey, D = R.dempsey;
    d.touche = true; d.cote = appui; d.coups++;
    d.periode = Math.max(D.periodeMin, d.periode * D.acceleration);
    const final = d.coups >= D.coupsMax;
    const combo = 1 + D.bonusCombo * (d.coups - 1);
    const degats = final ? D.degatsFinal * combo : (parfait ? D.degatsParfait : D.degatsBien) * combo;
    const xImpact = R.centreX + (appui === 'g' ? -50 : 50), yImpact = VISAGE_GREG.y + Phaser.Math.Between(-10, 30);
    const taille = Math.min(70, 32 + d.coups * 4);
    onomatopee(this, xImpact, yImpact, final ? ONO.enorme : ONO.fort, final ? 72 : taille, final ? '#ffd84a' : '#ffffff');
    const note = texte(this, R.centreX + (appui === 'g' ? -250 : 250), 400, parfait ? 'PARFAIT !' : 'BIEN', parfait ? 30 : 22, parfait ? '#ffd84a' : '#ffffff').setDepth(46);
    this.tweens.add({ targets: note, alpha: 0, y: 370, duration: 450, onComplete: () => note.destroy() });
    lignesImpact(this, xImpact, yImpact, 0xffd84a, final ? 34 : 10 + d.coups * 2, final ? 320 : 120 + d.coups * 15);
    gouttes(this, xImpact, yImpact, appui === 'g' ? 1 : -1);
    this.cameras.main.shake(final ? 350 : 60 + d.coups * 15, final ? 0.025 : 0.004 + d.coups * 0.0012);
    jouerSon(this, 'greg_coup_fort', { rate: 0.9 + d.coups * 0.05 });   // de plus en plus aigu
    if (parfait) flash(this, 0.15 + d.coups * 0.03);
    // la tête de Greg part du côté opposé au poing, à chaque coup
    g.poseForcee = { nom: 'touche', t: 0.25 }; g.toucheDepuis = this.time.now; g.reculSens = appui === 'g' ? 1 : -1;
    g.secousse = 0.25;
    // dégâts qui s'envolent
    const chiffre = texte(this, xImpact + (appui === 'g' ? -40 : 40), yImpact - 30, '-' + Math.round(degats), 22 + d.coups, '#ff5a6e', { stroke: '#000000', strokeThickness: 4 }).setDepth(47);
    this.tweens.add({ targets: chiffre, y: chiffre.y - 50, alpha: 0, duration: 600, onComplete: () => chiffre.destroy() });
    // FINISH : s'il est déjà bien entamé, il part au tapis
    if (final && g.vie - degats <= D.finishTapis) {
      flash(this, 1, 0xffffff); this.arreter(0.35);
      onomatopee(this, R.centreX, 230, 'FINISH !!', 72, '#ff8a3d');
      this.delaiDown = 0.5; j.dempsey = null; this.finZoomDempsey();
      this.blesserGreg(g.vie);
      return;
    }
    this.blesserGreg(degats);   // (le Dempsey Roll garde toute sa force à toutes les difficultés)
    if (g.etat === 'sol') { j.dempsey = null; this.finZoomDempsey(); return; }
    if (final) {
      flash(this, 0.9);
      onomatopee(this, R.centreX, 230, 'FINISH !!', 64, '#ff8a3d');
      this.ralentir(0.25, 0.5);
      this.finDempsey();
    }
  }

  // Un raté : on continue, sauf au-delà du nombre d'erreurs permis. Renvoie vrai si le roll s'arrête.
  erreurDempsey(raison) {
    const d = this.j.dempsey;
    d.erreurs++;
    if (d.erreurs > R.dempsey.erreursPermises) { this.casserDempsey(raison); return true; }
    onomatopee(this, R.centreX, 330, raison, 28, '#ff6b6b');
    jouerSon(this, 'greg_bloque');
    return false;
  }

  casserDempsey(raison) {
    onomatopee(this, R.centreX, 300, raison, 32, '#ff6b6b');
    onomatopee(this, R.centreX, 350, 'Le rythme est cassé...', 22, '#ffffff');
    this.finDempsey();
  }

  contreDempsey() {
    const j = this.j, g = this.g;
    this.alerte.setVisible(false);
    j.dempsey = null;
    g.etat = 'recup'; g.t = 0; g.attaque = { recup: 0.6 };
    g.poseForcee = { nom: 'uppercut', t: 0.3 };
    j.sonne = 0.8; j.tremble = 0.3;
    flash(this, 0.8, 0xff3b3b);
    lignesImpact(this, R.centreX, TETE_JOUEUR_Y, 0xff3b3b, 30, 280);
    onomatopee(this, R.centreX, TETE_JOUEUR_Y, 'CONTRE DE GREG !!', 42, '#ff3b3b');
    this.cameras.main.shake(300, 0.02);
    jouerSon(this, 'greg_coup_fort');
    this.blesserJoueur(R.dempsey.degatsContre * this.diff.degatsGreg);
  }

  // le zoom du Dempsey Roll revient doucement
  finZoomDempsey() { this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 300 }); }

  finDempsey() {
    const g = this.g;
    this.j.dempsey = null; this.finZoomDempsey();
    this.alerte.setVisible(false);
    if (g.etat !== 'sol') { g.etat = 'touche'; g.t = -0.6; }
  }

  // Le "∞" à l'écran, la boule, les zones de frappe et les lignes de vitesse
  dessinerDempsey() {
    const gr = this.grDempsey, fond = this.grVitesse, d = this.j.dempsey;
    gr.clear(); fond.clear();
    this.texteCombo.setVisible(false);
    const cam = this.cameras.main;   // roll fini (quelle que soit la raison) : la caméra se recule doucement
    if (!d && cam.zoom > 1.0005 && !this.tweens.isTweening(cam)) cam.setZoom(Math.max(1, cam.zoom - 0.01));
    if (!d || this.etat !== 'combat') return;
    this.cameras.main.setZoom(1 + Math.min(0.08, d.coups * 0.009));   // la caméra se rapproche à chaque coup
    // lignes de vitesse de plus en plus intenses
    const intensite = Math.min(1, 0.25 + d.coups * 0.08);
    fond.lineStyle(3, 0xffffff, 0.12 + intensite * 0.25);
    for (let k = 0; k < 30; k++) {
      const ang = Math.random() * Math.PI * 2, r1 = 150 + Math.random() * 80, r2 = 600;
      fond.lineBetween(R.centreX + Math.cos(ang) * r1, 240 + Math.sin(ang) * r1, R.centreX + Math.cos(ang) * r2, 240 + Math.sin(ang) * r2);
    }
    // piste en "∞"
    const cx = R.centreX, cy = 400, ax = 210, ay = 140;
    gr.fillStyle(0x000000, 0.6).fillRoundedRect(cx - ax - 50, cy - 60, (ax + 50) * 2, 120, 20);
    gr.lineStyle(6, 0xffffff, 0.35).beginPath();
    for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.05) {
      const p = GregCombat.infini(t);
      t === 0 ? gr.moveTo(cx + p.x * ax, cy + p.y * ay) : gr.lineTo(cx + p.x * ax, cy + p.y * ay);
    }
    gr.strokePath();
    // zones de frappe (celle à viser brille)
    const coteDemi = d.demi % 2 === 0 ? 'd' : 'g';
    // erreurs restantes (petits coeurs)
    for (let k = 0; k <= R.dempsey.erreursPermises; k++) {
      gr.fillStyle(k < R.dempsey.erreursPermises + 1 - d.erreurs ? 0xff5a6e : 0x444444, 1).fillCircle(cx - 20 + k * 20, cy - 46, 6);
    }
    for (const cote of ['g', 'd']) {
      const x = cx + (cote === 'd' ? ax : -ax) * 0.98;
      const active = cote === coteDemi && (!d.touche || d.attente > 0);
      const couleur = d.contre && active ? 0xff3b3b : 0xffd84a;
      gr.lineStyle(4, couleur, active ? 1 : 0.35).strokeCircle(x, cy, 30);
      gr.fillStyle(couleur, active ? 0.3 : 0.08).fillCircle(x, cy, 30);
    }
    // la boule
    const p = GregCombat.infini(d.phi);
    gr.fillStyle(d.contre ? 0xff3b3b : 0xffffff, 1).fillCircle(cx + p.x * ax, cy + p.y * ay, 14);
    gr.lineStyle(3, 0x1a1014, 1).strokeCircle(cx + p.x * ax, cy + p.y * ay, 14);
    // compteur de coups
    this.texteCombo.setVisible(d.coups > 0).setText(`${d.coups} COUP${d.coups > 1 ? 'S' : ''} !`).setScale(1 + d.coups * 0.04);
  }

  // =================================================================
  //  AU TAPIS ET COMPTE DE L'ARBITRE
  // =================================================================
  gregAuTapis() {
    const g = this.g;
    g.downs++; g.etat = 'sol'; g.attaque = null; g.poseForcee = null;
    g.chuteDebut = this.time.now; g.sensChute = Math.random() < 0.5 ? -1 : 1; g.boumChute = false;
    this.j.action = null; this.j.dempsey = null; this.j.esquive = null;
    this.alerte.setVisible(false);
    flash(this, 0.9);
    lignesImpact(this, VISAGE_GREG.x, VISAGE_GREG.y, 0xffd84a, 36, 340);
    const down = () => onomatopee(this, LARGEUR / 2, 200, 'DOWN !!', 76, '#ffd84a');
    jouerSon(this, 'greg_foule');
    this.parler('Down !', { coupe: true });
    if (this.delaiDown) { this.time.delayedCall(this.delaiDown * 1000, down); this.delaiDown = 0; } else down();
    jouerSon(this, 'greg_tapis');
    this.cameras.main.shake(350, 0.02);
    this.debutCompte('greg');
  }

  joueurAuTapis() {
    const j = this.j;
    j.downs++;
    j.action = null; j.esquive = null; j.dempsey = null; j.garde = false; j.sonne = 0;
    this.g.etat = 'garde'; this.g.attaque = null;
    this.alerte.setVisible(false);
    flash(this, 0.9, 0xff3b3b);
    onomatopee(this, LARGEUR / 2, 200, 'DOWN !!', 76, '#ff3b3b');
    jouerSon(this, 'greg_tapis');
    this.cameras.main.shake(350, 0.02);
    if (j.downs >= R.knockdownsMax) {
      this.etat = 'fin';
      this.afficher();
      this.time.delayedCall(1400, () => this.defaite(`K.O. technique : ${R.knockdownsMax} fois au tapis. Greg lève les bras !`));
      return;
    }
    this.debutCompte('joueur');
  }

  debutCompte(qui) {
    this.etat = 'compte';
    this.compte = { qui, n: 0, t: -0.6, appuis: 0, monologue: false, coach: false };
    this.texteCompte = texte(this, LARGEUR / 2, 150, '', 96, '#ffffff').setDepth(45);
    this.texteCompte2 = texte(this, LARGEUR / 2, 240, '', 22, '#ffffff').setDepth(45);
    if (qui === 'greg' && this.illustre && this.textures.exists('greg_ko')) {
      // le compte se met à gauche, la case de manga du K.O. à droite
      this.texteCompte.setPosition(250, 220); this.texteCompte2.setPosition(250, 310);
      // la case manga arrive après la chute de Greg sur le ring
      const delai = R.illustre.dureeChute * 1000 + 150;
      this.time.delayedCall(delai, () => { if (this.compte && this.compte.qui === 'greg') this.caseKO = this.ouvrirCaseKO(); });
    }
    // l'arbitre compte, à gauche du ring
    if (this.textures.exists('greg_arbitre')) {
      if (this.arbitre) this.arbitre.destroy();
      this.arbitre = this.add.image(-100, HAUTEUR + 4, 'greg_arbitre').setOrigin(0.5, 1).setDepth(44);
      this.tweens.add({ targets: this.arbitre, x: 95, duration: 250, ease: 'Back.Out' });
    }
    if (qui === 'joueur') {
      this.barreReleve = this.add.graphics().setDepth(45);
      this.texteCompte2.setText(this.gestes ? 'TOUCHE GAUCHE / DROITE : RELÈVE-TOI !' : '◀ ▶ ◀ ▶  RELÈVE-TOI !').setColor('#7fff7f');
    }
  }

  majCompte(dt) {
    const c = this.compte;
    c.t += dt;
    if (c.qui === 'joueur') {
      const besoin = R.appuisPourSeRelever[Math.min(this.j.downs, R.appuisPourSeRelever.length) - 1];
      const cote = this.appuis.gauche ? 'g' : (this.appuis.droite ? 'd' : null);
      if (cote && cote !== c.dernier) { c.dernier = cote; c.appuis++; this.j.tremble = 0.08; }
      this.barreReleve.clear();
      this.barreReleve.fillStyle(0x000000, 0.7).fillRect(LARGEUR / 2 - 160, 265, 320, 22);
      this.barreReleve.fillStyle(0x7fff7f, 1).fillRect(LARGEUR / 2 - 157, 268, 314 * Math.min(1, c.appuis / besoin), 16);
      if (!c.monologue && c.n >= 2) { c.monologue = true; bulle(this, R.centreX, 360, auHasard(REPLIQUES.joueurSol), 2200); }
      if (!c.coach && c.n >= 5) {
        c.coach = true;
        bulle(this, 230, 440, 'Coach : « ' + REPLIQUES.coach + ' »', 1800);
        if (this.textures.exists('coach_severe')) {
          const img = this.add.image(-120, 400, 'coach_severe').setDepth(66).setDisplaySize(150, 129);
          this.tweens.add({ targets: img, x: 85, duration: 180, ease: 'Back.Out' });
          this.tweens.add({ targets: img, alpha: 0, delay: 1800, duration: 300, onComplete: () => img.destroy() });
        }
      }
      if (c.appuis >= besoin) { this.releveJoueur(); return; }
    }
    if (c.t >= R.secondeCompte) {
      c.t = 0; c.n++;
      jouerSon(this, 'greg_compte');
      // compte vocal désactivé (voix de synthèse pas assez naturelle) : le compte reste à l'écran
      if (R.compteVocal) this.parler(JAPONAIS[Math.min(c.n, 9) - 1], { japonais: true, vitesse: 1.1, hauteur: 0.9 });
      this.texteCompte.setText(c.n >= 10 ? 'K.O. !!' : String(c.n)).setScale(1.6);
      if (this.arbitre) this.tweens.add({ targets: this.arbitre, angle: -4, scaleY: 1.03, duration: 90, yoyo: true });   // il marque chaque chiffre
      this.tweens.add({ targets: this.texteCompte, scale: 1, duration: 150 });
      if (c.qui === 'greg') {
        const releve = R.compteGregRelevee[this.g.downs - 1];
        if (this.g.downs < R.knockdownsMax && c.n >= releve) { this.releveGreg(); return; }
      }
      if (c.n >= 10) {
        this.etat = 'fin';
        if (c.qui === 'greg') this.time.delayedCall(1200, () => this.victoire(this.classement('K.O. !! Greg reste au tapis !', true)));
        else this.time.delayedCall(1200, () => this.defaite('K.O. ! Tu n\'as pas pu te relever avant 10...'));
      }
    }
  }

  // Grande case de manga : Greg au tapis (son illustration), sur fond de lignes de vitesse
  ouvrirCaseKO() {
    const x = 680, y = 318, l = 380, h = 420;
    const c = this.add.container(x, y).setDepth(44);
    const fond = this.add.graphics();
    fond.fillStyle(0xf4f0e6, 1).fillRect(-l / 2, -h / 2, l, h);
    fond.lineStyle(2, 0x1a1014, 0.55);
    for (let k = 0; k < 70; k++) {   // lignes qui partent du centre
      const a = (k / 70) * Math.PI * 2, r1 = 80 + (k % 3) * 25, cx = Math.cos(a), sy = Math.sin(a);
      const r2 = Math.min((l / 2 - 4) / Math.abs(cx || 1e-6), (h / 2 - 4) / Math.abs(sy || 1e-6));   // s'arrête au bord
      fond.lineBetween(cx * r1, sy * r1, cx * r2, sy * r2);
    }
    const img = this.add.image(0, 10, 'greg_ko');
    img.setScale(Math.min((l - 30) / img.width, (h - 30) / img.height));
    const cadre = this.add.graphics();
    cadre.lineStyle(8, 0x1a1014, 1).strokeRect(-l / 2, -h / 2, l, h);
    const mot = texte(this, -l / 2 + 70, -h / 2 + 40, 'DOWN !!', 40, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 8 }).setAngle(-12);
    c.add([fond, img, cadre, mot]);
    // la case "claque" à l'écran
    c.setScale(0.2).setAngle(8);
    this.tweens.add({ targets: c, scale: 1, angle: -2, duration: 220, ease: 'Back.Out' });
    return c;
  }

  finCompte() {
    if (this.caseKO) { this.caseKO.destroy(); this.caseKO = null; }
    this.texteCompte.destroy(); this.texteCompte2.destroy();
    if (this.barreReleve) { this.barreReleve.destroy(); this.barreReleve = null; }
    if (this.arbitre) { this.arbitre.destroy(); this.arbitre = null; }
    this.compte = null;
    this.etat = 'combat';
    onomatopee(this, LARGEUR / 2, 200, 'BOX !', 68, '#ffd84a');
    this.parler('Box !');
    this.figer(0.6);
  }

  releveJoueur() {
    const j = this.j;
    j.vie = R.vieApresRelevee[Math.min(j.downs, R.vieApresRelevee.length) - 1];
    j.souffle = 100;
    j.esprit = Math.min(100, j.esprit + R.esprit.releve);
    j.sonne = 0;
    this.retourGardeGreg(1.0);   // il laisse un instant après « BOX ! »
    this.finCompte();
  }

  releveGreg() {
    const g = this.g;
    g.vie = R.vieGregApresRelevee[Math.min(g.downs, R.vieGregApresRelevee.length) - 1];
    g.souffle = 100;
    g.fureur *= R.fureur;
    this.retourGardeGreg(1.0);   // il se remet debout avant de repartir à l'attaque
    g.poseForcee = { nom: 'releve', t: 1.1 }; g.releveDebut = this.time.now;
    this.finCompte();
    if (g.downs >= 2 && !g.enerve) {   // il s'énerve : nouveaux enchaînements avec des feintes
      g.enerve = true; g.seqIndex = 0; g.seqPas = 0; g.finSeq = true;
      bulle(this, R.centreX + 230, 130, 'Greg : « Là, je suis VRAIMENT énervé !! »', 2200);
      onomatopee(this, R.centreX, 260, 'GREG S\'ÉNERVE !', 44, '#ff3b3b');
      return;
    }
    bulle(this, R.centreX + 230, 130, 'Greg : « ' + auHasard(REPLIQUES.gregReleve) + ' »', 2000);
  }

  // =================================================================
  //  ROUNDS ET COIN DU RING
  // =================================================================
  // record séparé pour chaque difficulté (le hub affiche celui du mode normal)
  cleRecord() { return cleRecord('greg', this.nomDiff); }

  // Choix de la difficulté (◀ ▶ puis Espace), le dernier choix est retenu
  choisirDifficulte(ensuite) {
    choisirDifficulte(this, 'greg', DIFFICULTES, (nom, diff) => { this.nomDiff = nom; this.diff = diff; ensuite(); }, 'greg_bloque');
  }

  // Écran de présentation de Greg (son illustration), avant le premier round
  presentation(ensuite) {
    // V18 : rejouer = pas de présentation ; avis jouabilité (nov. 2026) : seulement la 1re fois (pause : « Revoir les règles »)
    const vu = 'regles_' + this.identite.id + '_presentation';
    if (this.donnees.rejouer || Sauvegarde.fait(vu)) { ensuite(); return; }
    this.etat = 'coin';
    etiquettesTactiles(ETIQUETTES_OK);
    const el = [];
    el.push(this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x0b0b14, 0.96).setDepth(100));
    const portrait = this.add.image(LARGEUR + 200, HAUTEUR / 2, 'greg_portrait').setDepth(101).setDisplaySize(302, 540);
    this.tweens.add({ targets: portrait, x: LARGEUR - 175, duration: 350, ease: 'Cubic.Out' });
    el.push(portrait);
    const g = this.add.graphics().setDepth(101);
    g.lineStyle(2, 0xffffff, 0.15);
    for (let k = 0; k < 40; k++) { const y = Math.random() * HAUTEUR; g.lineBetween(0, y, 600, y + (Math.random() - 0.5) * 20); }
    el.push(g);
    el.push(texte(this, 300, 90, 'GREG', 96, '#ffffff', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 14 }).setDepth(102));
    el.push(texte(this, 300, 175, '« LE SMASH »', 34, '#ffd84a').setDepth(102));
    el.push(texte(this, 300, 300, [
      'Style : bagarreur, cogneur',
      'Arme secrète : le SMASH (dès le round 2)',
      'Signe distinctif : joue TOUJOURS en difficile',
      '(« le mode normal, c\'est pour les faibles »)',
      'Tatouages : guerriers de légende',
    ].join('\n'), 20, '#dddddd', { lineSpacing: 10 }).setDepth(102));
    el.push(texte(this, 300, 460, (estTactile() ? 'Touche l\'écran' : 'ESPACE') + ' : au coin !', 22, '#7fff7f').setDepth(102));
    jouerSon(this, 'greg_coup_fort');
    this.cameras.main.shake(200, 0.01);
    attendreOK(this, () => {   // ESPACE / OK, ou toucher n'importe où
      Sauvegarde.marquerFait(vu);
      el.forEach(e => e.destroy());
      jouerSon(this, 'ui_valider');
      ensuite();
    }, 500);
  }

  ouvrirCoin() {
    this.etat = 'coin';
    etiquettesTactiles(ETIQUETTES_OK);
    const fin = this.roundsJoues > 0;
    const el = [];
    el.push(voile(this, 0.85).setDepth(100));
    el.push(texte(this, LARGEUR / 2, 60, fin ? `FIN DU ROUND ${this.round - 1}` : 'DANS TON COIN', 36, '#ffd84a').setDepth(101));
    // portrait du coach : déterminé avant le combat, sévère si tu as fait des erreurs, malin si tu t'en sors bien
    const portrait = this.portraitCoach(fin);
    const pc = this.add.image(170, 245, portrait).setDepth(101);
    if (portrait !== 'greg_coach') { pc.setDisplaySize(220, 220 * pc.height / pc.width); }
    else pc.setScale(1.2);
    el.push(pc);
    if (portrait !== 'greg_coach') {
      const cadre = this.add.graphics().setDepth(102);
      cadre.lineStyle(4, 0xffd84a, 1).strokeRect(170 - 110, 245 - pc.displayHeight / 2, 220, pc.displayHeight);
      el.push(cadre);
    }
    el.push(texte(this, 170, 360, 'Coach Kamogawa', 18, '#dddddd').setDepth(101));
    el.push(texte(this, 580, 115, `Conseils pour le ROUND ${this.round} :`, 24, '#ffffff').setDepth(101));
    // les blocs de texte se placent les uns sous les autres (pas de chevauchement)
    // avis jouabilité : au round 1, UN seul conseil en gros (le reste s'apprend en jouant)
    const lignesConseils = this.round === 1 ? [CONSEIL_ROUND1] : CONSEILS[this.round - 1].map(l => '- ' + l);
    const conseils = texte(this, 580, 145, lignesConseils.join('\n'), this.round === 1 ? 24 : 18, '#ffffff', {
      wordWrap: { width: 600 }, lineSpacing: 8,
    }).setOrigin(0.5, 0).setDepth(101);
    el.push(conseils);
    let y = conseils.y + conseils.height + 18;
    if (fin) {
      const bilan = texte(this, 580, y,
        `Ta vie remonte (+${R.soinEntreRounds}).   Dégâts donnés : ${Math.round(this.stats.donnes)}   reçus : ${Math.round(this.stats.recus)}`,
        15, '#7fff7f', { wordWrap: { width: 600 } }).setOrigin(0.5, 0).setDepth(101);
      y += bilan.height + 12;
      // le coach commente ce que tu as raté pendant le round
      el.push(bilan, texte(this, 580, y, 'Coach : « ' + this.remarqueCoach() + ' »', 19, '#ffd84a', { wordWrap: { width: 600 } })
        .setOrigin(0.5, 0).setDepth(101));
    }
    this.statsRound = this.nouvellesStatsRound();
    el.push(texte(this, LARGEUR / 2, HAUTEUR - 50, (estTactile() ? 'Touche l\'écran' : 'ESPACE') + ' : on y va !' + (fin ? '  (ou attends 3 s)' : ''), 22, '#7fff7f').setDepth(101));
    let parti = false;
    const go = () => { if (parti) return; parti = true; el.forEach(e => e.destroy()); jouerSon(this, 'ui_valider'); this.debutRound(); };
    attendreOK(this, go, 400);
    if (fin) this.time.delayedCall(3000, go);   // entre deux rounds : le coin se ferme tout seul
  }

  // Classement de fin : rang S / A / B / C + record gardé dans le navigateur
  classement(debut, ko) {
    let score = 100;
    const C = R.rangCalcul;
    score -= Math.min(C.recusMax, this.stats.recus * C.parRecu);   // dégâts reçus
    score -= this.j.downs * C.parTapis;                            // passages au tapis
    score -= Math.max(0, this.tempsTotal - C.tempsLibre) * C.parSeconde;   // lenteur
    if (!ko) score -= 20;
    let rang = R.rangs.find(r => score >= r.seuil).rang;
    // le rang dépend aussi de la difficulté (pas de rang S en ENTRAÎNEMENT / FACILE)
    const ordre = R.rangs.map(r => r.rang);
    if (this.diff.rangMax && ordre.indexOf(rang) < ordre.indexOf(this.diff.rangMax)) rang = this.diff.rangMax;
    // record et défis seulement pour un combat complet (pas depuis le menu de test au round 2 / 3), hors ENTRAÎNEMENT
    const complet = (this.donnees.phase || 'round1') === 'round1' && !this.diff.sansRecord;
    const record = this.diff.sansRecord ? null : complet ? Sauvegarde.proposerRecord(this.cleRecord(), rang, this.tempsTotal, ordre) : Sauvegarde.record(this.cleRecord());
    const t = formatTemps;   // chrono au centième, comme Super Punch-Out
    // LE BILAN DU COACH : réussites, erreurs + UN conseil pour progresser (et les défis de maîtrise)
    const sr = this.statsRound || {};
    const conseil = sr.tropTot >= 3 ? 'Conseil du coach : n\'attaque pas TROP TÔT — attends son « ! » pour frapper.'
      : (sr.mauvaisCote || 0) >= 3 ? 'Conseil du coach : esquive du côté OPPOSÉ au poing (ou garde BASSE sur le jaune).'
      : this.stats.recus >= 40 ? 'Conseil du coach : esquive plus, encaisse moins — chaque coup reçu te rapproche du tapis.'
      : 'Conseil du coach : après une esquive, la fenêtre de CONTRE frappe trois fois plus fort.';
    return `${debut}\nRANG ${rang}   -   temps ${t(this.tempsTotal)}` +
      (record ? `\nRecord : rang ${record.rang} en ${t(record.temps)}` : '') +
      (this.secretFait ? '\n(Coup secret trouvé !)' : '') +
      (this.nomDiff !== 'normal' ? `\nMode ${this.diff.nom}` : '') +
      `\nDégâts donnés : ${Math.round(this.stats.donnes)}   reçus : ${Math.round(this.stats.recus)}\nPassages au tapis : ${this.j.downs}` +
      (complet ? '\n' + lignesDefis('greg', [
        { id: 'ko', nom: 'Gagner par K.O. (pas aux points)', test: () => ko },
        { id: 'jamaisTapis', nom: 'Ne JAMAIS aller au tapis', test: () => this.j.downs === 0 },
        { id: 'cuirasse', nom: 'Moins de 30 dégâts reçus', test: () => this.stats.recus < 30 },
      ]).join('\n') : (this.diff.sansRecord ? '\n(Entraînement : ni record ni défis)' : '')) +
      `\n${conseil}`;
  }

  // Écran de victoire : rayons dorés, Greg amoché qui te remet le trophée, ton rang et ton temps
  ecranVictoire(message) {
    const P = 1000, cx = LARGEUR / 2, el = [];
    taireAnnonceur();
    jouerSon(this, 'greg_foule'); jouerSon(this, 'greg_cloche');
    el.push(this.add.rectangle(cx, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x0a0614, 0.97).setDepth(P));
    // rayons qui tournent
    const rayons = this.add.graphics().setDepth(P + 1).setPosition(300, 300);
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      rayons.fillStyle(k % 2 ? 0xffd84a : 0xff8a3d, 0.16).beginPath();
      rayons.moveTo(0, 0); rayons.lineTo(Math.cos(a) * 700, Math.sin(a) * 700); rayons.lineTo(Math.cos(a + 0.17) * 700, Math.sin(a + 0.17) * 700);
      rayons.closePath(); rayons.fillPath();
    }
    this.tweens.add({ targets: rayons, angle: 360, duration: 20000, repeat: -1 });
    el.push(rayons);
    // Greg, le visage marqué, qui tend le trophée
    const cleGreg = this.textures.exists(R.illustre.poses.touche.cle) ? R.illustre.poses.touche.cle : 'greg_garde';
    const greg = this.add.image(LARGEUR + 200, HAUTEUR + 10, cleGreg).setOrigin(0.5, 1).setDepth(P + 2).setFlipX(true);
    greg.setScale(380 / greg.height);
    this.tweens.add({ targets: greg, x: 830, duration: 500, ease: 'Cubic.Out' });
    // le trophée apparaît en tournoyant
    const trophee = this.add.image(280, 310, 'greg_trophee').setDepth(P + 3).setScale(0).setAngle(-30);
    this.tweens.add({ targets: trophee, scale: 0.95, angle: 0, delay: 350, duration: 600, ease: 'Back.Out' });
    this.tweens.add({ targets: trophee, y: 290, delay: 1000, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // étincelles
    this.time.addEvent({ delay: 180, repeat: -1, callback: () => {
      const e = this.add.star(300 + Phaser.Math.Between(-130, 130), 300 + Phaser.Math.Between(-150, 120), 4, 3, 9, 0xfff3a8).setDepth(P + 4);
      this.tweens.add({ targets: e, scale: 0, angle: 180, duration: 700, onComplete: () => e.destroy() });
    } });
    // textes
    const titre = texte(this, 300, 70, 'VICTOIRE !!', 64, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 12 }).setDepth(P + 5).setScale(3).setAlpha(0);
    this.tweens.add({ targets: titre, scale: 1, alpha: 1, duration: 300, ease: 'Back.Out', onComplete: () => this.cameras.main.shake(200, 0.01) });
    const lignes = message.split('\n');
    const rang = (lignes[1] || '').match(/RANG (\w)/);
    if (rang) {
      const r = texte(this, 140, 440, rang[1], 96, '#ffffff', { fontStyle: 'bold', stroke: '#b3202c', strokeThickness: 12 }).setDepth(P + 5).setScale(0);
      this.tweens.add({ targets: r, scale: 1, delay: 900, duration: 300, ease: 'Back.Out' });
      texte(this, 140, 375, 'RANG', 22, '#ffd84a').setDepth(P + 5);
    }
    texte(this, 300, 135, lignes[0], 22, '#ffffff', { wordWrap: { width: 560 } }).setDepth(P + 5);
    // colonne entre le trophée et Greg, avec retour à la ligne (comme Lionel : rien ne sort de l'écran)
    const corps = lignes.slice(1).join('\n').replace(/RANG \w\s+-\s+/, '')
      .replace(/★ DÉFI RÉUSSI : /g, '★ ').replace(/Défi déjà réussi : /g, '✓ ').replace(/Défi à débloquer : /g, '☐ ')
      .replace(/^Conseil du coach : /m, 'Coach : ');
    const bloc = texte(this, 420, 165, corps, 14, '#ffffff',
      { align: 'left', lineSpacing: 3, wordWrap: { width: 236 }, backgroundColor: '#000000aa', padding: { x: 8, y: 6 } })
      .setOrigin(0, 0).setDepth(P + 5);
    if (bloc.height > 330) bloc.setScale(330 / bloc.height);
    bulle(this, 790, 120, 'Greg : « Ok... t\'as gagné. Prends-le, ce trophée. »', 99999).setDepth(P + 5);
    const badge = this.add.image(140, 210, 'badge_' + this.identite.id).setDepth(P + 5).setScale(0);
    this.tweens.add({ targets: badge, scale: 2, delay: 1200, duration: 300, ease: 'Back.Out' });
    texte(this, 140, 260, 'Badge Greg !', 18, '#ffd84a').setDepth(P + 5);
    texte(this, LARGEUR / 2, HAUTEUR - 22, `${estTactile() ? 'OK' : 'ESPACE'} : retour au hub`, 18, '#aaaaaa').setDepth(P + 5);
  }

  // Quel portrait du coach afficher dans le coin
  portraitCoach(fin) {
    const ok = (k) => this.textures.exists(k);
    if (!ok('coach_regard')) return 'greg_coach';
    if (!fin) return ok('coach_kbg') ? 'coach_kbg' : 'coach_regard';
    const s = this.statsRound;
    const erreurs = s.tropTot + s.mauvaisCote + s.corps + s.smash * 2 + s.tete;
    if (erreurs >= 4) return ok('coach_severe') ? 'coach_severe' : 'coach_regard';
    if (erreurs <= 1) return ok('coach_malin') ? 'coach_malin' : 'coach_regard';
    return 'coach_regard';
  }

  // Remarque du coach selon les erreurs du round
  remarqueCoach() {
    const s = this.statsRound;
    if (s.tropTot >= 3) return `${s.tropTot} esquives trop tôt ! Attends que son coup PARTE, petit !`;
    if (s.mauvaisCote >= 3) return `${s.mauvaisCote} fois du mauvais côté... Coup de gauche = esquive à DROITE !`;
    if (s.corps >= 3) return `${s.corps} coups au foie encaissés ! Le « ! » violet, c'est la GARDE (▼) !`;
    if (s.smash >= 1) return 'Tu as mangé son SMASH... Quand il tape ses gants, ESQUIVE !';
    if (s.tete >= 4) return `${s.tete} coups au visage, tu dors ? Esquive et CONTRE !`;
    return 'Pas mal, petit ! Continue à esquiver et à contrer !';
  }

  debutRound() {
    etiquettesTactiles(this.gestes ? SANS_BOUTONS : { ...ETIQUETTES_COMBAT, x: null });
    this.boutonDempsey = false;
    const j = this.j;
    j.souffle = 100; this.g.souffle = 100;
    j.action = null; j.esquive = null; j.sonne = 0; j.contreJusqua = -1;
    const g = this.g; g.seqIndex = 0; g.seqPas = 0; g.finSeq = true; g.riposte = false;   // ses enchaînements repartent du début
    this.momentNargue = entre(...R.nargue.entre);
    j.dempsey = null; g.derniereAttaque = this.horloge;
    this.retourGardeGreg(1.2);
    this.tempsRound = R.dureeRound;
    this.smashAnnonce = false;
    this.etat = 'combat';
    this.afficher();
    jouerSon(this, 'greg_cloche');
    this.parler(this.round === R.nbRounds ? 'Dernier round !' : `Round ${this.round}`);
    const e = encart(this, `ROUND ${this.round}`, this.round === R.nbRounds ? 'Dernier round !' : '', '#ffffff', 0x000000);
    this.figer(1.2, () => {
      e.fermer();
      onomatopee(this, LARGEUR / 2, 200, 'BOX !', 68, '#ffd84a');
      this.parler('Box !');
      if (this.round === 1) bulle(this, R.centreX + 230, 130, 'Greg : « ' + auHasard(REPLIQUES.gregDebut) + ' »', 1800);
    });
  }

  finDuRound() {
    jouerSon(this, 'greg_cloche');
    // la cloche arrête tout : un Dempsey Roll en cours ne continue pas au round suivant
    if (this.j.dempsey) { this.j.dempsey = null; this.dessinerDempsey(); }
    if (this.texteAideDempsey) this.texteAideDempsey.setVisible(false);
    this.j.action = null; this.j.esquive = null;
    this.alerte.setVisible(false);
    this.roundsJoues++;
    if (this.round >= R.nbRounds) { this.decision(); return; }
    this.etat = 'coin';
    onomatopee(this, LARGEUR / 2, 200, 'DING DING DING !', 52, '#ffd84a');
    this.j.vie = Math.min(100, this.j.vie + R.soinEntreRounds);
    this.g.vie = Math.min(100, this.g.vie + R.soinGregEntreRounds);
    this.round++;
    this.time.delayedCall(900, () => this.ouvrirCoin());
  }

  // Fin du dernier round sans K.O. : les juges décident aux points
  decision() {
    this.etat = 'fin';
    const pointsJoueur = this.stats.donnes + this.g.downs * 20;
    const pointsGreg = this.stats.recus * 1.5 + this.j.downs * 20;   // encaisser coûte cher
    const e = encart(this, 'DÉCISION DES JUGES...', `Toi : ${Math.round(pointsJoueur)} pts   -   Greg : ${Math.round(pointsGreg)} pts`, '#ffffff', 0x000000);
    this.time.delayedCall(2200, () => {
      e.fermer();
      if (pointsJoueur > pointsGreg) this.victoire(this.classement('Victoire aux points ! Greg n\'en revient pas.', false));
      else this.defaite('Défaite aux points... Il faut le mettre K.O. !');
    });
  }

  // =================================================================
  //  AFFICHAGE
  // =================================================================
  afficher(reel = 0) {
    const j = this.j, g = this.g;

    // ---- ton boxeur (de dos) ----
    let pj = 'garde';
    if (this.compte && this.compte.qui === 'joueur') pj = 'sol';
    else if (this.etat === 'fin' && j.downs >= R.knockdownsMax) pj = 'sol';
    else if (this.etat === 'fin' && g.etat === 'sol') pj = 'victoire';
    else if (j.dempsey) pj = Math.cos(j.dempsey.phi) < 0 ? 'dempsey_g' : 'dempsey_d';
    else if (j.sonne > 0) pj = 'touche';
    else if (j.action) { pj = j.action.pose; j.dernierePose = pj; j.poseJusqua = this.time.now + 120; }
    else if (j.poseJusqua > this.time.now && !j.esquive && !j.garde) pj = j.dernierePose;   // le coup reste visible un instant
    else if (j.esquive) pj = 'esquive';
    else if (j.garde) pj = 'bloque';
    j.sprite.setTexture('heros_boxe_' + (pj === 'corps_g' ? 'corps' : pj));
    // l'esquive fait glisser le boxeur sur le côté
    let cible = 0;
    if (j.esquive) cible = j.esquive.cote * R.decalageEsquive;
    else if (j.dempsey) cible = GregCombat.infini(j.dempsey.phi).x * 90;
    j.decalage += (cible - j.decalage) * Math.min(1, reel * 22);
    j.tremble = Math.max(0, j.tremble - reel);
    const tremble = j.tremble > 0 ? Phaser.Math.Between(-6, 6) : 0;
    // petit rebond sur place, comme dans Punch-Out
    const rebond = pj === 'garde' ? Math.sin(this.time.now / 180) * 3 : 0;
    // pendant que Greg est au tapis, ton boxeur s'efface un peu pour qu'on le voie bien
    j.sprite.setAlpha(this.g.etat === 'sol' ? R.transparenceJoueur * 0.5 : R.transparenceJoueur);
    j.sprite.setPosition(R.centreX + j.decalage + tremble, R.piedsJoueur + rebond + (pj === 'sol' ? -30 : 0));
    // illustrations de ton boxeur (si elles existent) : posées sur la ceinture, à la place du dessin
    // esquive : la même image, retournée quand tu pars à droite
    const poseIll = pj === 'esquive' && j.esquive && j.esquive.cote > 0 ? 'esquive_d' : pj;
    const H = R.herosIllustre, ill = H && H.poses[poseIll];
    if (ill && this.textures.exists(ill.cle)) {
      const P = H.images[ill.cle];
      j.sprite.setTexture(ill.cle).setFlipX(!!ill.miroir)
        .setOrigin(ill.miroir ? 1 - P[0] : P[0], P[1]).setScale(H.taille * (ill.echelle || 1)).setAngle(ill.angle || 0)
        .setPosition(R.centreX + j.decalage + tremble + (ill.dx || 0), H.ceintureY + rebond + (ill.dy || 0));
    } else {
      j.sprite.setFlipX(false).setOrigin(0.5, 1).setScale(R.tailleJoueur).setAngle(0);
    }

    // ---- Greg (de face) ----
    if (this.illustre) { this.afficherGregIllustre(reel); }
    else {
    let pg = g.garde === 'haute' ? 'garde' : 'garde_basse';
    if (g.etat === 'sol') pg = 'sol';
    else if (g.poseForcee) pg = g.poseForcee.nom;
    else if (g.etat === 'prepare') pg = POSE_PREPA[g.attaque.cible];
    else if (g.etat === 'frappe') pg = POSE_FRAPPE[g.attaque.id] || 'jab';
    else if (g.etat === 'touche') pg = 'touche';
    else if (g.etat === 'essouffle' || g.etat === 'recup') pg = 'essouffle';
    else if (this.etat === 'fin' && j.downs >= R.knockdownsMax) pg = 'victoire';
    g.sprite.setTexture('greg_' + pg);
    g.secousse = Math.max(0, g.secousse - reel);
    const balance = g.etat === 'garde' ? Math.sin(this.time.now / 400) * 12 : 0;
    const secousse = g.secousse > 0 ? Phaser.Math.Between(-8, 8) : 0;
    // quand Greg frappe, il "avance" vers l'écran (il grossit un peu)
    g.sprite.setScale(R.tailleGreg * (g.etat === 'frappe' ? 1.08 : 1));
    g.sprite.setPosition(R.centreX + balance + secousse, R.piedsGreg + (g.etat === 'frappe' ? 20 : 0));
    // Greg clignote en rouge pendant la préparation du Smash
    if (g.etat === 'prepare' && g.attaque.cible === 'smash' && Math.floor(this.horloge * 12) % 2) g.sprite.setTint(0xff7070);
    else g.sprite.clearTint();
    }

    this.flecheEsquive.setVisible(this.etat === 'combat' && g.etat === 'prepare' && !j.dempsey && R.aideFleche[this.round - 1] && this.diff.aides
      && Math.floor(this.time.now / 140) % 4 !== 0);   // clignote
    const contre = this.horloge < j.contreJusqua && this.etat === 'combat';
    this.aideContre.setVisible(contre).setPosition(R.centreX + j.decalage, 250);
    this.dessinerDempsey();
    this.majHud();
    if (this.ambiance) {
      const g = this.g;
      let cible = this.etat === 'combat' || this.etat === 'compte' ? 0.1 + 0.25 * (1 - g.vie / 100) : 0.05;
      if (g.etat === 'etourdi' || g.etat === 'sol' || this.j.dempsey) cible += 0.25;
      cible *= Sauvegarde.volume('sons');
      this.ambiance.setVolume(this.ambiance.volume + (cible - this.ambiance.volume) * Math.min(1, reel * 3));
    }
  }

  // Greg en illustrations : on choisit l'image selon ce qu'il fait, puis on la bouge / grossit / teinte
  afficherGregIllustre(reel) {
    const g = this.g, v = g.vis, I = R.illustre, t = this.time.now;
    const existe = (nom) => !!I.poses[nom] && this.textures.exists(I.poses[nom].cle);
    const ou = (...noms) => noms.find(existe) || 'basse';   // première pose disponible
    const repos = existe('entier') ? 'entier' : 'basse';   // image complète si elle existe
    const haute = existe('gardePied') ? 'gardePied' : 'haute';
    // pour l'instant, la même pose (gants levés) sert pour les deux gardes ;
    // c'est la zone lumineuse qui montre ce qu'il protège
    const unePoseDeGarde = existe('gardePied') && !existe('gardeBasse');
    const garde = g.garde === 'haute' ? ou('gardePied', 'haute', repos) : (unePoseDeGarde ? haute : ou('gardeBasse', repos));
    // une image par coup (jab, crochet, corps, smash) si elle existe
    const imageCoup = (cible) => {
      const id = g.attaque && g.attaque.id;
      if (cible === 'smash') return ou('smash', 'visage');
      if (cible === 'corps') return ou('corpsPied', 'corps');
      return id === 'crochet' ? ou('crochet', 'visage') : ou('jab', 'visage');
    };
    let pose = garde, dx = 0, dy = 0, echelle = 1, angle = 0, teinte = null, rapide = false;
    const forcee = g.poseForcee ? g.poseForcee.nom : null;

    // au tapis, Greg est montré dans une case de manga (voir ouvrirCaseKO) : on le cache sur le ring
    if (g.etat === 'sol') {
      // d'abord la chute (pose "K.O. debout" qui bascule en arrière et s'écrase), puis il disparaît
      const e = (t - (g.chuteDebut || 0)) / 1000;
      if (existe('koDebout') && e < I.dureeChute) {
        const P = I.poses.koDebout, p = Phaser.Math.Clamp((e - 0.15) / (I.dureeChute - 0.15), 0, 1);
        const chute = p * p;   // accélère, comme un vrai corps qui tombe
        g.sprite.setVisible(true).setTexture(P.cle).setFlipX(false).clearTint().setOrigin(P.origine[0], P.origine[1])
          .setPosition(I.teteX + (g.sensChute || 1) * 30 * chute, I.solY + 30 * chute)
          .setScale(P.taille, P.taille * (1 - 0.4 * chute)).setAngle((g.sensChute || 1) * 12 * chute)
          .setAlpha(p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25);   // il s'efface en touchant le tapis
        if (g.jambes) g.jambes.setVisible(false);
        this.zoneGarde.clear(); this.dessinerCibleEtAura(); this.etoiles.clear();
        if (p >= 0.8 && !g.boumChute) {   // impact sur le tapis : secousse + nuage de poussière
          g.boumChute = true; this.cameras.main.shake(250, 0.02); jouerSon(this, 'greg_tapis');
          for (let k = 0; k < 14; k++) {
            const c = this.add.circle(I.teteX + Phaser.Math.Between(-90, 90), I.solY - Phaser.Math.Between(0, 30), Phaser.Math.Between(10, 24), 0xe8e2d4, 0.8).setDepth(11);
            this.tweens.add({ targets: c, y: c.y - Phaser.Math.Between(20, 60), x: c.x + Phaser.Math.Between(-60, 60), scale: 1.8, alpha: 0, duration: 600, onComplete: () => c.destroy() });
          }
        }
        return;
      }
      g.sprite.setVisible(false).setAlpha(1); if (g.jambes) g.jambes.setVisible(false);
      this.zoneGarde.clear(); this.dessinerCibleEtAura();
      return;
    }
    g.sprite.setVisible(true).setAlpha(1);
    if (g.etat === 'etourdi') { pose = ou('etourdi', repos); dx = Math.sin(t / 160) * 22; angle = Math.sin(t / 160) * 6; dy = 8; teinte = 0xfff3c0; }
    else if (g.etat === 'nargue') { pose = ou('nargue', repos); dy = Math.sin(t / 110) * 5; dx = Math.sin(t / 220) * 8; }
    else if (forcee === 'touche' || g.etat === 'touche' || (g.etat === 'garde' && t - (g.toucheDepuis || -9999) < 550)) {
      // il prend un coup : la tête part en arrière, puis il a l'air sonné une demi-seconde
      const e = t - (g.toucheDepuis || t);
      pose = ou('touche', repos);
      const sens = g.reculSens || -1;
      dx = e < 140 ? sens * (g.reculSens ? 30 : 18) : Math.sin(t / 120) * 6; angle = g.secousse > 0 ? -sens * 9 : 3; rapide = e < 140;
      if (e < 90) teinte = 0xffc0c0;
    }
    else if (forcee === 'releve') {   // il se relève : il monte du tapis, amoché et furieux, puis souffle
      const e = Math.min(1, (t - (g.releveDebut || t)) / 350);
      pose = ou('releve', 'etourdi', repos); dy = 40 * (1 - e) + Math.sin(t / 150) * 3; echelle = 0.92 + 0.08 * e;
    }
    else if (forcee === 'bloque') { pose = existe(haute) ? haute : repos; echelle = 0.97; teinte = 0xc8d4ff; rapide = true; }
    else if (forcee === 'uppercut') { pose = ou('smash', 'visage'); echelle = 1.12; dy = 20; rapide = true; }
    else if (g.etat === 'prepare') {
      const c = g.attaque.cible, avance = g.t / g.prepa, sens = g.attaque.cote === 'g' ? -1 : (g.attaque.cote === 'd' ? 1 : 0);
      const debut = c === 'corps' ? I.debutElanCorps : I.debutElan;
      if (avance < debut) {             // il arme son coup
        if (c === 'smash') { dy = 34; echelle = 0.93; angle = -3; if (existe('tapeGants')) { pose = 'tapeGants'; dy = 0; angle = 0; } }
        else if (c === 'corps') { dy = 46; echelle = 0.9; dx = sens * 20; angle = sens * 4; }   // il plonge bas
        else { dx = sens * 34; angle = sens * 6; echelle = 0.96; }
      } else {                          // le coup part : l'image du coup grossit vers toi, du bon côté
        const elan = (avance - debut) / (1 - debut);
        pose = imageCoup(c); rapide = true;
        if (c === 'corps') {            // coup au corps : il remonte d'en bas, en tournant
          echelle = 0.84 + elan * 0.24; dx = sens * 26 * (1 - elan); dy = 60 - elan * 30; angle = sens * 10 * (1 - elan);
        } else {
          echelle = 0.86 + elan * 0.12; dx = sens * 30 * (1 - elan);   // (moins de zoom : le gant de face est déjà énorme)
          dy = c === 'smash' ? 30 - elan * 40 : elan * 10;
        }
      }
      if (c === 'smash' && Math.floor(this.horloge * 10) % 2) teinte = 0xff7070;
    }
    else if (g.etat === 'frappe' || (g.etat === 'recup' && g.t < 0.15 && g.attaque && g.attaque.cible)) {
      pose = imageCoup(g.attaque.cible); echelle = g.attaque.cible === 'smash' ? 1.1 : 1.0; dy = g.attaque.cible === 'smash' ? -15 : (g.attaque.cible === 'corps' ? 30 : 14); rapide = true;
      angle = g.attaque.id === 'crochet' ? -6 : 0;
    }
    else if (g.etat === 'recup') { pose = garde; dy = 6; }   // après son coup, il reprend sa garde
    else if (g.etat === 'essouffle') { pose = ou('etourdi', haute, repos); dy = 14 + Math.sin(t / 140) * 4; echelle = 0.98; teinte = 0xd8d0e8; }
    else if (this.etat === 'fin' && this.j.downs >= R.knockdownsMax) { pose = ou('victoire', haute, repos); dy = -10 + Math.sin(t / 160) * 6; echelle = 1.04; }
    else { dx = Math.sin(t / 400) * 12; dy = Math.sin(t / 300) * 2; }     // en garde : il se balance et respire
    if (!existe(pose)) pose = repos;

    const k = rapide ? 1 : Math.min(1, reel * 12);
    v.dx += (dx - v.dx) * k; v.dy += (dy - v.dy) * k; v.echelle += (echelle - v.echelle) * k; v.angle += (angle - v.angle) * k;
    g.secousse = Math.max(0, g.secousse - reel);
    const secousse = g.secousse > 0 ? Phaser.Math.Between(-8, 8) : 0;

    const P = I.poses[pose], sp = g.sprite;
    // les images de coup sont retournées si le coup part de l'autre côté
    const coteCoup = g.attaque && g.attaque.cote;
    const retourne = !!(P.cote && coteCoup && coteCoup !== 'centre' && coteCoup !== P.cote);
    sp.setTexture(P.cle).setFlipX(retourne).setOrigin(retourne ? 1 - P.origine[0] : P.origine[0], P.origine[1]);
    const y = P.pied ? I.solY + v.dy : I.teteY + v.dy + (P.decalY || 0);   // pose "pied" : posée sur ses pieds
    sp.setPosition(I.teteX + v.dx + secousse, y).setScale(P.taille * v.echelle).setAngle(v.angle);
    if (teinte) sp.setTint(teinte); else sp.clearTint();
    // jambes : posées juste sous la ceinture de l'image du haut (seulement pour les poses coupées)
    if (g.jambes) {
      const C = P.ceinture;
      g.jambes.setVisible(!!C);
      if (C) {
        const echelle = P.taille * v.echelle;
        let ox = (C[0] - P.origine[0] * sp.width) * echelle * (retourne ? -1 : 1);
        let oy = (C[1] - P.origine[1] * sp.height) * echelle;
        const a = Phaser.Math.DegToRad(v.angle), cs = Math.cos(a), sn = Math.sin(a);
        [ox, oy] = [ox * cs - oy * sn, ox * sn + oy * cs];
        g.jambes.setPosition(sp.x + ox, sp.y + oy).setScale(echelle * C[2] / I.jambes.largeur)
          .setOrigin(I.jambes.ceintureX / g.jambes.width, 0).setAngle(v.angle);
        if (teinte) g.jambes.setTint(teinte); else g.jambes.clearTint();
      }
    }

    this.dessinerCibleEtAura();
    // étoiles qui tournent autour de la tête quand il est étourdi
    const et = this.etoiles;
    et.clear();
    if (g.etat === 'etourdi') {
      for (let k = 0; k < 4; k++) {
        const a = t / 250 + k * Math.PI / 2, x = I.teteX + v.dx + Math.cos(a) * 55, y = I.teteY - 30 + Math.sin(a) * 14;
        et.fillStyle(0xffd84a, 1).lineStyle(2, 0x1a1014, 1).beginPath();
        for (let i = 0; i < 10; i++) { const b = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 10; et.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r); }
        et.closePath(); et.fillPath(); et.strokePath();
      }
    }

    // (nov. 2026 : plus de cadre « zone protégée » : un seul coup de poing, plus de choix visage / corps)
    this.zoneGarde.clear();
  }

  // Cible qui se resserre sur toi (là où le coup va frapper) + aura bleue du coup au corps
  dessinerCibleEtAura() {
    const g = this.g, c = this.cible, a = this.aura, t = this.time.now;
    c.clear(); a.clear();
    if (this.etat !== 'combat' || g.etat !== 'prepare' || !g.attaque || this.j.dempsey) return;
    const at = g.attaque, avance = Phaser.Math.Clamp(g.t / g.prepa, 0, 1);
    const couleur = at.cible === 'corps' ? 0xc77dff : (at.cible === 'smash' ? 0xff3b3b : 0xffd84a);
    const x = R.centreX, y = at.cible === 'corps' ? TETE_JOUEUR_Y + VENTRE_JOUEUR : TETE_JOUEUR_Y - 10;
    const r = 24 + 80 * (1 - avance);
    if (R.aideCible[this.round - 1] && this.diff.aides) {
    c.lineStyle(5, couleur, 0.9).strokeCircle(x, y, r);
    c.lineStyle(2, couleur, 0.9).strokeCircle(x, y, 20);
    c.lineBetween(x - r - 10, y, x - r + 14, y).lineBetween(x + r - 14, y, x + r + 10, y)
     .lineBetween(x, y - r - 10, x, y - r + 14).lineBetween(x, y + r - 14, x, y + r + 10);
    }
    if (at.cible === 'corps') {
      // aura bleue qui pulse autour de Greg + traits qui montent
      const pulse = 0.5 + Math.sin(t / 70) * 0.5;
      a.fillStyle(0xc77dff, 0.12 + pulse * 0.12).fillEllipse(R.centreX + this.g.vis.dx, 290, 280, 430);
      a.lineStyle(3, 0xe0b8ff, 0.6);
      for (let k = 0; k < 10; k++) {
        const lx = R.centreX - 150 + ((k * 37 + t / 3) % 300), ly = 380 - ((t / 2 + k * 53) % 220);
        a.lineBetween(lx, ly, lx, ly - 40);
      }
    }
  }

  creerHud() {
    this.hud = this.add.graphics().setDepth(40);
    this.grVitesse = this.add.graphics().setDepth(5);
    this.grDempsey = this.add.graphics().setDepth(35);
    this.texteCombo = texte(this, R.centreX, 312, '', 30, '#ffd84a').setDepth(36).setVisible(false);
    // portraits (façon Super Punch-Out)
    this.add.image(38, 38, 'heros_portrait').setDepth(41).setDisplaySize(60, 60);
    this.add.image(LARGEUR - 38, 38, 'greg_visage').setDepth(41).setDisplaySize(60, 60);
    this.hudCadre = this.add.graphics().setDepth(42);
    this.hudCadre.lineStyle(3, 0xffd84a, 1).strokeRect(LARGEUR - 68, 8, 60, 60);
    texte(this, LARGEUR / 2, 24, 'VS', 30, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 6 }).setDepth(41);
    this.texteTemps = texte(this, LARGEUR / 2, 56, '', 24, '#ffffff').setDepth(41);
    this.texteRound = texte(this, LARGEUR / 2, 80, '', 18, '#dddddd').setDepth(41);
    this.texteGarde = texte(this, 20, 108, '', 17, '#ffffff', { stroke: '#000000', strokeThickness: 4 }).setOrigin(0, 0.5).setDepth(41);
    texte(this, 120, 76, 'ESPRIT', 16, '#ffd84a').setOrigin(1, 0.5).setDepth(41);
    this.texteDempsey = texte(this, 80, 98, estTactile() ? 'Dempsey : DEMPSEY ROLL !' : 'X : DEMPSEY ROLL !', 18, '#ffd84a').setOrigin(0, 0.5).setDepth(41).setVisible(false);
  }

  majHud() {
    const j = this.j, g = this.g, h = this.hud;
    h.clear();
    const barre = (x, y, l, hauteur, part, couleur, versGauche) => {
      part = Phaser.Math.Clamp(part, 0, 1);
      h.fillStyle(0x000000, 0.7).fillRect(x - 2, y - 2, l + 4, hauteur + 4);
      h.fillStyle(0x444444, 1).fillRect(x, y, l, hauteur);
      h.fillStyle(couleur, 1).fillRect(versGauche ? x + l * (1 - part) : x, y, l * part, hauteur);
    };
    const couleurVie = (v) => v > 50 ? 0x4cd964 : (v > 25 ? 0xffcc00 : 0xff3b30);
    h.fillStyle(0x000000, 0.6).fillRect(0, 0, LARGEUR, 86);   // bandeau du haut
    barre(80, 14, 300, 18, j.vie / 100, couleurVie(j.vie), false);
    barre(80, 38, 300, 7, j.souffle / 100, 0x5ad1ff, false);
    barre(LARGEUR - 380, 14, 300, 18, g.vie / 100, couleurVie(g.vie), true);
    barre(LARGEUR - 380, 38, 300, 7, g.souffle / 100, 0x5ad1ff, true);
    // knockdowns subis (petits ronds rouges)
    for (let i = 0; i < j.downs; i++) h.fillStyle(0xff3b30, 1).fillCircle(400 + i * 16, 23, 5);
    for (let i = 0; i < g.downs; i++) h.fillStyle(0xff3b30, 1).fillCircle(LARGEUR - 400 - i * 16, 23, 5);

    const plein = j.esprit >= 100;
    const clignote = plein && Math.floor(this.time.now / 150) % 2;
    barre(128, 70, 252, 12, j.esprit / 100, clignote ? 0xffffff : 0xffd84a, false);
    const dempseyPret = plein && this.etat === 'combat' && !j.dempsey;
    this.texteDempsey.setVisible(dempseyPret);
    // sur mobile, le bouton Dempsey n'apparaît que quand la jauge est pleine
    if (this.gestes) { this.texteDempsey.setVisible(false); this.gestes.maj(this.round); }   // le bouton doré est au milieu
    else if (this.etat === 'combat' && dempseyPret !== this.boutonDempsey) {
      this.boutonDempsey = dempseyPret;
      etiquettesTactiles({ ...ETIQUETTES_COMBAT, x: dempseyPret ? 'Dempsey' : null });
    }

    this.texteRound.setText(`ROUND ${this.round} / ${R.nbRounds}`);
    const reste = Math.max(0, Math.ceil(this.tempsRound ?? R.dureeRound));
    this.texteTemps.setText(`TIME ${Math.floor(reste / 60)}'${String(reste % 60).padStart(2, '0')}`);
    this.texteGarde.setText('');   // (plus de garde haute / basse à lire : un seul coup)
  }
}
