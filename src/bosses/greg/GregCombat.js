// =====================================================================
// BOSS GREG : combat de boxe en 3 rounds.
// Vue "Punch-Out" (ton boxeur de dos, Greg de face), règles façon Hajime no Ippo :
//   - Greg prévient avant de frapper ("!" à côté de sa tête) :
//       jaune = visage (esquive Gauche/Droite ou garde Bas), bleu = corps (garde Bas),
//       rouge "!!" = SMASH (esquive sur le côté !)
//   - Esquive réussie => fenêtre de CONTRE (dégâts x2)
//   - Garde de Greg haute => tape au corps ; basse => tape au visage
//   - Jauge d'esprit pleine => X : DEMPSEY ROLL (alterner Gauche / Droite)
//   - Au tapis : marteler Espace (bouton Visage sur mobile) avant 10 !
// Tous les chiffres sont dans reglages.js.
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte, voile } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { IDENTITE, REGLAGES as R, ATTAQUES, ATTAQUES_PAR_ROUND, CONSEILS, REPLIQUES, ONOMATOPEES as ONO } from './reglages.js';
import { lignesImpact, onomatopee, flash, encart, encartDempsey, bulle, gouttes } from './effets.js';
import { jouerClip } from '../../core/clips.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';

const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)];
const entre = (min, max) => min + Math.random() * (max - min);
// Pose de Greg au moment où il frappe
const POSE_FRAPPE = { jab: 'jab', crochet: 'crochet', corps: 'corps', rafale: 'jab', smash: 'uppercut' };
const POSE_PREPA = { tete: 'prepare', corps: 'prepare_bas', smash: 'prepare_smash' };
const COULEUR_ALERTE = { tete: '#ffd84a', corps: '#5ad1ff', smash: '#ff3b3b' };
// Points d'impact à l'écran
const VISAGE_GREG = { x: R.centreX, y: 140 };
const CORPS_GREG = { x: R.centreX, y: 215 };
const TETE_JOUEUR_Y = 405;       // tête de ton boxeur à l'écran
const VENTRE_JOUEUR = 70;        // le ventre est un peu plus bas
// Boutons tactiles : pendant le combat / sur les écrans à valider
const ETIQUETTES_COMBAT = { haut: null, bas: '▼\nGarde', espace: 'Visage', z: 'Corps', x: 'Dempsey' };
const ETIQUETTES_OK = { haut: null, bas: null, gauche: null, droite: null, espace: 'OK', z: null, x: null };

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
    this.smashAnnonce = false;
    this.roundsJoues = 0;

    this.add.image(0, 0, 'greg_ring').setOrigin(0);
    this.add.ellipse(R.centreX, R.piedsGreg - 4, 260, 34, 0x000000, 0.25);

    this.j = {
      vie: 100, souffle: 100, esprit: 0, downs: 0,
      action: null, esquive: null, esquivePause: 0, garde: false, sonne: 0,
      contreJusqua: -1, reposSouffle: 0, dempsey: null, decalage: 0, tremble: 0,
      sprite: this.add.image(R.centreX, R.piedsJoueur, 'heros_boxe_garde').setOrigin(0.5, 1).setDepth(10)
        .setScale(R.tailleJoueur).setAlpha(R.transparenceJoueur),   // transparent pour bien voir Greg
    };
    this.g = {
      vie: 100, souffle: 100, downs: 0, fureur: 1, secousse: 0, combo: 0, couvert: 0,
      etat: 'garde', t: 0, attaque: null, coupIndex: 0, garde: 'haute',
      gardeTimer: entre(...R.changementGarde), pause: 1.5, poseForcee: null,
      sprite: this.add.image(R.centreX, R.piedsGreg, 'greg_garde').setOrigin(0.5, 1).setDepth(9),
      vis: { dx: 0, dy: 0, echelle: 1, angle: 0 },   // mouvements de l'illustration
    };
    // Si l'illustration détourée de Greg existe, on l'utilise (sinon : les poses dessinées par le code)
    this.illustre = this.textures.exists('greg_combat');
    if (this.illustre) this.g.sprite.setTexture('greg_combat');
    // jambes de Greg (posées sur le tapis, sous le haut du corps)
    const J = R.illustre.jambes;
    this.g.jambes = this.illustre && this.textures.exists(J.cle)
      ? this.add.image(R.centreX, J.y, J.cle).setOrigin(J.origine[0], J.origine[1]).setScale(J.taille).setDepth(8.9) : null;
    this.zoneGarde = this.add.graphics().setDepth(9.5);
    this.aura = this.add.graphics().setDepth(8);        // aura bleue derrière Greg (coup au corps)
    this.cible = this.add.graphics().setDepth(25);      // cible qui se resserre là où le coup va frapper
    this.alerte = texte(this, R.centreX + 150, 150, '!', 60, '#ffd84a').setDepth(30).setVisible(false);
    // grosse flèche "où esquiver" pendant que Greg prépare son coup
    this.flecheEsquive = texte(this, R.centreX, 300, '', 40, '#ffd84a', { lineSpacing: 2 }).setDepth(31).setVisible(false);
    this.aideContre = texte(this, R.centreX, 250, 'CONTRE !', 28, '#ff8a3d').setDepth(30).setVisible(false);

    this.creerHud();
    this.touches = creerTouches(this);
    // musique de fond (Hajime no Ippo, opening 2) : chargée pendant l'écran des commandes
    jouerMusique(this, 'greg_musique');
    this.afficher();

    etiquettesTactiles(ETIQUETTES_OK);
    const tactile = estTactile();
    this.afficherIntro('GREG - Le Boxeur', [
      '◀ / ▶ : esquive du côté OPPOSÉ au coup (puis frappe vite = CONTRE !)',
      tactile ? 'Visage : coup au visage      Corps : coup au corps' : 'Espace : coup au VISAGE      Z : coup au CORPS',
      tactile ? '▼ Garde (maintenu) : garde' : 'Bas (maintenu) : garde',
      tactile ? 'Jauge d\'esprit pleine : Dempsey = DEMPSEY ROLL' : 'Jauge d\'esprit pleine : X = DEMPSEY ROLL',
      tactile ? 'Au tapis : tape vite sur Visage !' : 'Au tapis : martèle Espace !',
    ], () => this.presentation(() => this.ouvrirCoin()));
  }

  // =================================================================
  //  BOUCLE PRINCIPALE
  // =================================================================
  update(temps, delta) {
    if (this.termine) return;
    this.lireTouches();
    const reel = delta / 1000;

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
      this.tempsRound -= dt;
      if (this.j.dempsey) this.majDempsey(dt);
      else { this.majJoueur(dt); this.majGreg(dt); }
      if (this.etat === 'combat' && this.tempsRound <= 0) this.finDuRound();
    } else if (this.etat === 'compte') {
      this.majCompte(dt);
    }
    this.afficher(reel);
  }

  // Appuis de l'image en cours (lus à chaque image pour ne pas "garder" un appui en mémoire)
  lireTouches() {
    const t = this.touches;
    this.appuis = {
      espace: vientDAppuyer(t.espace), z: vientDAppuyer(t.z), x: vientDAppuyer(t.x),
      haut: vientDAppuyer(t.haut), bas: vientDAppuyer(t.bas),
      gauche: vientDAppuyer(t.gauche), droite: vientDAppuyer(t.droite),
    };
  }

  figer(secondes, ensuite) { this.gel = secondes; this.apresGel = ensuite || null; }
  ralentir(facteur, secondes) { this.ralenti = facteur; this.ralentiTemps = secondes; }

  // =================================================================
  //  JOUEUR
  // =================================================================
  majJoueur(dt) {
    const j = this.j, a = this.appuis, t = this.touches;
    j.esquivePause -= dt;

    // souffle
    j.reposSouffle -= dt;
    if (j.reposSouffle <= 0 && !j.action) j.souffle = Math.min(100, j.souffle + R.souffleRecup * dt);

    if (j.sonne > 0) { j.sonne -= dt; j.garde = false; return; }

    // Dempsey Roll (prioritaire, même pendant une esquive)
    if (!j.action && a.x && j.esprit >= 100) {
      this.lancerDempsey();
      return;
    }

    // coup en cours
    if (j.action) {
      const c = R.coups[j.action.coup];
      j.action.t += dt;
      if (!j.action.fait && j.action.t >= c.impact) { j.action.fait = true; this.coupDuJoueur(j.action.coup); }
      if (j.action && j.action.t >= c.duree) j.action = null;
      return;
    }

    // esquive en cours : on peut l'annuler en frappant pendant la fenêtre de contre
    if (j.esquive) {
      j.esquive.t += dt;
      const contrePossible = this.horloge < j.contreJusqua;
      if (contrePossible && (a.espace || a.z)) { j.esquive = null; this.frapper(this.choixCoup(a)); return; }
      if (j.esquive.t >= R.esquiveDuree) { j.esquive = null; j.esquivePause = R.esquivePause; }
      return;
    }

    j.garde = t.bas.isDown;
    if (j.garde) return;

    if ((a.gauche || a.droite) && j.esquivePause <= 0) {
      if (j.souffle < R.esquiveSouffle) { this.essouffle(); return; }
      j.souffle -= R.esquiveSouffle; j.reposSouffle = 0.4;
      j.esquive = { t: 0, cote: a.gauche ? -1 : 1 };
      return;
    }
    if (a.espace || a.z) this.frapper(this.choixCoup(a));
  }

  choixCoup(a) {
    return a.z ? 'corps' : 'visage';
  }

  frapper(coup) {
    const j = this.j, c = R.coups[coup];
    if (j.souffle < c.souffle) { this.essouffle(); return; }
    j.souffle -= c.souffle; j.reposSouffle = 0.5;
    // pour le visage, on alterne jab et crochet (juste pour l'animation)
    this.alterne = !this.alterne;
    j.action = { coup, t: 0, fait: false, pose: coup === 'corps' ? 'corps' : (this.alterne ? 'jab' : 'crochet') };
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
    const bloque = !contre && ((neutre &&
      ((g.garde === 'haute' && c.cible === 'tete') || (g.garde === 'basse' && c.cible === 'corps'))) || g.couvert > 0);

    if (bloque) {
      jouerSon(this, 'greg_bloque');
      onomatopee(this, xImpact, yImpact, ONO.bloque, 26, '#cccccc');
      if (g.couvert <= 0) g.poseForcee = { nom: 'bloque', t: 0.18 };
      g.combo = 0;
      return;
    }

    let degats = c.degats;
    if (contre) {
      degats *= R.contreMultiplicateur;
      j.contreJusqua = -1;
      j.esprit += R.esprit.contre;
      this.ralentir(0.25, 0.35);
      flash(this, 0.7);
      lignesImpact(this, xImpact, yImpact, 0xffd84a, 26, 240);
      onomatopee(this, xImpact, yImpact - 50, 'CONTRE !!', 52, '#ff8a3d');
      this.cameras.main.shake(180, 0.012);
    } else {
      onomatopee(this, xImpact, yImpact, c.cible === 'corps' ? ONO.corps : ONO.fort, 40, c.cible === 'corps' ? '#5ad1ff' : '#ffffff');
      lignesImpact(this, xImpact, yImpact, 0xffffff, 14, 140);
      this.cameras.main.shake(70, 0.005);
    }
    jouerSon(this, contre ? 'greg_coup_fort' : 'greg_coup');
    j.esprit = Math.min(100, j.esprit + R.esprit.coupPorte);
    g.secousse = contre ? 0.3 : 0.15;
    if (c.souffleGreg) g.souffle -= c.souffleGreg * (contre ? 2 : 1);
    this.blesserGreg(degats);
    if (g.etat === 'sol') return;

    // Après plusieurs coups d'affilée, Greg se couvre puis riposte (pas de "coups gratuits" à l'infini)
    g.combo++;
    if (g.combo >= R.comboMax && !contre) {
      g.combo = 0;
      g.couvert = R.dureeCouverture;
      g.poseForcee = { nom: 'bloque', t: R.dureeCouverture };
      g.etat = 'garde'; g.t = 0; g.attaque = null; g.pause = R.dureeCouverture + 0.1;
      this.alerte.setVisible(false);
      onomatopee(this, R.centreX + 170, 80, 'Il se couvre !', 22, '#cccccc');
      return;
    }

    // Pendant qu'il prépare son coup, seul un contre l'interrompt (sauf le Smash)
    const interrompt = g.etat !== 'prepare' || contre;
    const smash = g.attaque && g.attaque.cible === 'smash' && (g.etat === 'prepare' || g.etat === 'frappe');
    if (interrompt && !smash) {
      if (g.etat === 'prepare') onomatopee(this, R.centreX + 170, 60, 'Interrompu !', 22, '#7fff7f');
      g.etat = 'touche'; g.t = 0; g.attaque = null;
      this.alerte.setVisible(false);
      // Greg apprend : il protège parfois l'endroit touché
      if (Math.random() < 0.35) g.garde = c.cible === 'corps' ? 'basse' : 'haute';
    }
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
    if (g.poseForcee) { g.poseForcee.t -= dt; if (g.poseForcee.t <= 0) g.poseForcee = null; }

    if (g.souffle <= 0 && (g.etat === 'garde' || g.etat === 'touche' || g.etat === 'recup')) {
      g.etat = 'essouffle'; g.t = 0; g.attaque = null;
      onomatopee(this, R.centreX + 170, 80, 'Haa... haa...', 26, '#ffb347');
    }

    switch (g.etat) {
      case 'garde': {
        g.souffle = Math.min(100, g.souffle + R.souffleGregRecup * dt);
        g.gardeTimer -= dt;
        if (g.gardeTimer <= 0) {
          g.garde = g.garde === 'haute' ? 'basse' : 'haute';
          g.gardeTimer = entre(...R.changementGarde);
        }
        g.pause -= dt;
        if (g.pause <= 0) this.choisirAttaque();
        break;
      }
      case 'prepare':
        if (g.t >= g.prepa) this.impactGreg();
        break;
      case 'frappe':   // très court : on montre le coup, puis la suite
        if (g.t >= 0.14) {
          const at = g.attaque;
          if (at.coups && g.coupIndex < at.coups) {
            g.etat = 'prepare'; g.t = 0; g.prepa = at.entre * g.fureur;
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
        if (g.t >= R.dureeTouche) this.retourGardeGreg(0.5);
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
    g.pause = pauseMin !== undefined ? entre(pauseMin, pauseMin + 0.6) : entre(min, max);
  }

  choisirAttaque() {
    const g = this.g;
    const nom = auHasard(ATTAQUES_PAR_ROUND[this.round - 1]);
    const at = ATTAQUES[nom];
    g.attaque = { id: nom, ...at, cote: this.coteAuHasard(at) };
    g.coupIndex = 0; g.combo = 0;
    g.etat = 'prepare'; g.t = 0; g.prepa = at.prepa * g.fureur;
    g.souffle -= at.souffle;
    this.montrerAlerte();
    if (at.cible === 'smash' && !this.smashAnnonce) {
      this.smashAnnonce = true;
      const e = encart(this, 'SMASH !!', 'Greg arme son uppercut... ESQUIVE sur le côté !', '#ff3b3b', 0x2a0000, 'greg_visage');
      this.figer(1.0, () => e.fermer());
    }
  }

  // De quel côté de l'écran part le coup : 'g' (gauche), 'd' (droite) ; le SMASH part du centre
  coteAuHasard(at) {
    return at.cible === 'smash' ? 'centre' : (Math.random() < 0.5 ? 'g' : 'd');
  }

  montrerAlerte() {
    const at = this.g.attaque;
    // le "!" apparaît du côté d'où part le coup
    const x = at.cote === 'g' ? R.centreX - 170 : (at.cote === 'd' ? R.centreX + 170 : R.centreX + 150);
    this.alerte.setText(at.cible === 'smash' ? '!!' : (at.cible === 'corps' ? '!\n▼' : '!'))
      .setColor(COULEUR_ALERTE[at.cible]).setVisible(true).setScale(0.4).setPosition(x, 150);
    // la flèche montre quoi faire
    const f = this.flecheEsquive;
    if (at.cible === 'corps') f.setText('▼\nGARDE').setPosition(R.centreX, 285);
    else if (at.cible === 'smash') f.setText('◀   ▶\nESQUIVE').setPosition(R.centreX, 285);
    else if (at.cote === 'g') f.setText('▶▶\nESQUIVE').setPosition(R.centreX + 190, 285);
    else f.setText('◀◀\nESQUIVE').setPosition(R.centreX - 190, 285);
    f.setColor(COULEUR_ALERTE[at.cible]);
    this.tweens.add({ targets: this.alerte, scale: 1, duration: 120, ease: 'Back.Out' });
    jouerSon(this, 'greg_alerte');
  }

  // Le coup de Greg arrive : esquivé, bloqué ou encaissé ?
  impactGreg() {
    const g = this.g, j = this.j, at = g.attaque;
    g.coupIndex++;
    g.etat = 'frappe'; g.t = 0;
    // gant blanc qui fonce vers l'écran (seulement s'il n'y a pas d'image de coup)
    if (this.illustre && !this.textures.exists('greg_coup_visage')) this.gantVolant(at, j.esquive && j.esquive.t <= R.esquiveProtege && at.cible !== 'corps' ? j.esquive.cote : 0);
    this.alerte.setVisible(false);
    const xImpact = R.centreX + j.decalage, yImpact = at.cible === 'corps' ? TETE_JOUEUR_Y + VENTRE_JOUEUR : TETE_JOUEUR_Y;

    // esquive réussie = partir du côté OPPOSÉ au coup (coup venant de gauche => esquive à droite)
    const bonCote = at.cote === 'centre' || !at.cote || (j.esquive && j.esquive.cote === (at.cote === 'g' ? 1 : -1));
    const esquive = j.esquive && j.esquive.t <= R.esquiveProtege && bonCote;
    if (j.esquive && !bonCote && at.cible !== 'corps') onomatopee(this, R.centreX, TETE_JOUEUR_Y - 70, 'Mauvais côté !', 26, '#ff6b6b');
    if (esquive && at.cible !== 'corps') {
      jouerSon(this, 'greg_esquive');
      onomatopee(this, R.centreX - j.esquive.cote * 60, yImpact - 40, ONO.esquive, 34, '#aaffff');
      j.esprit = Math.min(100, j.esprit + R.esprit.esquive);
      j.contreJusqua = this.horloge + R.contreFenetre;
      this.ralentir(0.4, 0.25);
      if (at.cible === 'smash') onomatopee(this, R.centreX + 170, 60, 'Dans le vide !', 24, '#7fff7f');
      return;
    }

    let degats = at.degats;
    if (j.garde && at.cible !== 'smash') {
      degats *= R.garde;
      j.souffle = Math.max(0, j.souffle - R.gardeSouffle);
      jouerSon(this, 'greg_bloque');
      onomatopee(this, xImpact, yImpact, ONO.bloque, 28, '#cccccc');
      j.tremble = 0.1;
    } else if (j.garde && at.cible === 'smash') {
      degats *= at.gardeCassee;
      j.garde = false; j.sonne = 0.6;
      onomatopee(this, xImpact, yImpact - 30, 'Garde brisée !', 32, '#ff6b6b');
      this.cameras.main.shake(200, 0.015);
      jouerSon(this, 'greg_coup_fort');
    } else {
      j.esquive = null; j.action = null;
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
    const clip = jouerClip(this, 'greg_dempsey');
    if (clip) { this.figer(clip.duree, () => { clip.fermer(); this.aideDempsey(); }); return; }
    const e = encartDempsey(this);
    this.figer(1.8, () => { e.fermer(); this.aideDempsey(); });
  }

  // Consigne affichée tant que la boule attend le premier appui
  aideDempsey() {
    if (!this.texteAideDempsey) {
      this.texteAideDempsey = texte(this, R.centreX, 375, '', 20, '#ffd84a', { lineSpacing: 4 }).setDepth(46);
    }
    this.texteAideDempsey.setText('Appuie sur ▶ pour lancer le roll !\nEnsuite : ◀ quand la boule arrive à GAUCHE, ▶ à DROITE').setVisible(true);
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
        this.alerte.setText('!!\nGARDE !').setColor('#ff3b3b').setVisible(true).setPosition(R.centreX + 170, 150);
        jouerSon(this, 'greg_alerte');
      }
    }
    const coteDemi = d.demi % 2 === 0 ? 'd' : 'g';
    const centre = coteDemi === 'd' ? 0 : Math.PI;
    const ecart = Math.abs(Phaser.Math.Angle.Wrap(d.phi - centre));

    // Greg contre : il faut freiner avec la garde (▼) au bon moment
    if (d.contre) {
      if (a.bas && !d.touche) {
        if (ecart > D.bien) { this.contreDempsey(); return; }
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
    if (ecart > D.bien) { d.touche = true; this.erreurDempsey(Phaser.Math.Angle.Wrap(d.phi - centre) < 0 ? 'Trop tôt !' : 'Trop tard !'); return; }
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
    g.poseForcee = { nom: 'touche', t: 0.25 };
    g.secousse = 0.25;
    this.blesserGreg(degats);
    if (g.etat === 'sol') { j.dempsey = null; return; }
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
    this.blesserJoueur(R.dempsey.degatsContre);
  }

  finDempsey() {
    const g = this.g;
    this.j.dempsey = null;
    this.alerte.setVisible(false);
    if (g.etat !== 'sol') { g.etat = 'touche'; g.t = -0.6; }
  }

  // Le "∞" à l'écran, la boule, les zones de frappe et les lignes de vitesse
  dessinerDempsey() {
    const gr = this.grDempsey, fond = this.grVitesse, d = this.j.dempsey;
    gr.clear(); fond.clear();
    this.texteCombo.setVisible(false);
    if (!d || this.etat !== 'combat') return;
    // lignes de vitesse de plus en plus intenses
    const intensite = Math.min(1, 0.25 + d.coups * 0.08);
    fond.lineStyle(3, 0xffffff, 0.12 + intensite * 0.25);
    for (let k = 0; k < 30; k++) {
      const ang = Math.random() * Math.PI * 2, r1 = 150 + Math.random() * 80, r2 = 600;
      fond.lineBetween(R.centreX + Math.cos(ang) * r1, 240 + Math.sin(ang) * r1, R.centreX + Math.cos(ang) * r2, 240 + Math.sin(ang) * r2);
    }
    // piste en "∞"
    const cx = R.centreX, cy = 455, ax = 210, ay = 140;
    gr.fillStyle(0x000000, 0.45).fillRoundedRect(cx - ax - 50, cy - 60, (ax + 50) * 2, 120, 20);
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
    this.texteCombo.setVisible(d.coups > 0).setText(`${d.coups} COUPS !`).setScale(1 + d.coups * 0.04);
  }

  // =================================================================
  //  AU TAPIS ET COMPTE DE L'ARBITRE
  // =================================================================
  gregAuTapis() {
    const g = this.g;
    g.downs++; g.etat = 'sol'; g.attaque = null; g.poseForcee = null;
    this.j.action = null; this.j.dempsey = null; this.j.esquive = null;
    this.alerte.setVisible(false);
    flash(this, 0.9);
    lignesImpact(this, VISAGE_GREG.x, VISAGE_GREG.y, 0xffd84a, 36, 340);
    onomatopee(this, LARGEUR / 2, 200, 'DOWN !!', 76, '#ffd84a');
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
      this.caseKO = this.ouvrirCaseKO();
    }
    if (qui === 'joueur') {
      this.barreReleve = this.add.graphics().setDepth(45);
      this.texteCompte2.setText(estTactile() ? 'VISAGE ! VISAGE ! VISAGE !' : 'ESPACE ! ESPACE ! ESPACE !').setColor('#7fff7f');
    }
  }

  majCompte(dt) {
    const c = this.compte;
    c.t += dt;
    if (c.qui === 'joueur') {
      const besoin = R.appuisPourSeRelever[Math.min(this.j.downs, R.appuisPourSeRelever.length) - 1];
      if (this.appuis.espace) { c.appuis++; this.j.tremble = 0.08; }
      this.barreReleve.clear();
      this.barreReleve.fillStyle(0x000000, 0.7).fillRect(LARGEUR / 2 - 160, 265, 320, 22);
      this.barreReleve.fillStyle(0x7fff7f, 1).fillRect(LARGEUR / 2 - 157, 268, 314 * Math.min(1, c.appuis / besoin), 16);
      if (!c.monologue && c.n >= 2) { c.monologue = true; bulle(this, R.centreX, 360, auHasard(REPLIQUES.joueurSol), 2200); }
      if (!c.coach && c.n >= 5) { c.coach = true; bulle(this, 150, 440, 'Coach : « ' + REPLIQUES.coach + ' »', 1800); }
      if (c.appuis >= besoin) { this.releveJoueur(); return; }
    }
    if (c.t >= R.secondeCompte) {
      c.t = 0; c.n++;
      jouerSon(this, 'greg_compte');
      this.texteCompte.setText(c.n >= 10 ? 'K.O. !!' : String(c.n)).setScale(1.6);
      this.tweens.add({ targets: this.texteCompte, scale: 1, duration: 150 });
      if (c.qui === 'greg') {
        const releve = R.compteGregRelevee[this.g.downs - 1];
        if (this.g.downs < R.knockdownsMax && c.n >= releve) { this.releveGreg(); return; }
      }
      if (c.n >= 10) {
        this.etat = 'fin';
        if (c.qui === 'greg') this.time.delayedCall(1200, () => this.victoire('K.O. !! Greg reste au tapis. Le Dempsey Roll a parlé !'));
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
    this.compte = null;
    this.etat = 'combat';
    onomatopee(this, LARGEUR / 2, 200, 'BOX !', 68, '#ffd84a');
    this.figer(0.6);
  }

  releveJoueur() {
    const j = this.j;
    j.vie = R.vieApresRelevee[Math.min(j.downs, R.vieApresRelevee.length) - 1];
    j.souffle = 100;
    j.esprit = Math.min(100, j.esprit + R.esprit.releve);
    j.sonne = 0;
    this.retourGardeGreg();
    this.finCompte();
  }

  releveGreg() {
    const g = this.g;
    g.vie = R.vieGregApresRelevee[Math.min(g.downs, R.vieGregApresRelevee.length) - 1];
    g.souffle = 100;
    g.fureur *= R.fureur;
    this.retourGardeGreg();
    this.finCompte();
    bulle(this, R.centreX + 230, 130, 'Greg : « ' + auHasard(REPLIQUES.gregReleve) + ' »', 2000);
  }

  // =================================================================
  //  ROUNDS ET COIN DU RING
  // =================================================================
  // Écran de présentation de Greg (son illustration), avant le premier round
  presentation(ensuite) {
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
      'Arme secrète : le SMASH (round 3)',
      'Signe distinctif : afro légendaire',
      'Tatouages : guerriers de légende',
    ].join('\n'), 20, '#dddddd', { lineSpacing: 10 }).setDepth(102));
    el.push(texte(this, 300, 460, (estTactile() ? 'OK' : 'ESPACE') + ' : au coin !', 22, '#7fff7f').setDepth(102));
    jouerSon(this, 'greg_coup_fort');
    this.cameras.main.shake(200, 0.01);
    this.time.delayedCall(500, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        el.forEach(e => e.destroy());
        jouerSon(this, 'ui_valider');
        ensuite();
      });
    });
  }

  ouvrirCoin() {
    this.etat = 'coin';
    etiquettesTactiles(ETIQUETTES_OK);
    const fin = this.roundsJoues > 0;
    const el = [];
    el.push(voile(this, 0.85).setDepth(100));
    el.push(texte(this, LARGEUR / 2, 60, fin ? `FIN DU ROUND ${this.round - 1}` : 'DANS TON COIN', 36, '#ffd84a').setDepth(101));
    el.push(this.add.image(170, 250, 'greg_coach').setDepth(101).setScale(1.2));
    el.push(texte(this, 170, 360, 'Le vieux coach', 18, '#aaaaaa').setDepth(101));
    el.push(texte(this, 580, 130, `Conseils pour le ROUND ${this.round} :`, 24, '#ffffff').setDepth(101));
    el.push(texte(this, 580, 250, CONSEILS[this.round - 1].join('\n\n'), 18, '#ffffff', {
      wordWrap: { width: 620 }, lineSpacing: 2,
    }).setDepth(101));
    if (fin) {
      el.push(texte(this, 580, 400,
        `Ta vie remonte (+${R.soinEntreRounds}).   Coups donnés : ${Math.round(this.stats.donnes)}   reçus : ${Math.round(this.stats.recus)}`,
        16, '#7fff7f').setDepth(101));
    }
    el.push(texte(this, LARGEUR / 2, HAUTEUR - 50, (estTactile() ? 'OK' : 'ESPACE') + ' : on y va !', 22, '#7fff7f').setDepth(101));
    this.time.delayedCall(400, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        el.forEach(e => e.destroy());
        jouerSon(this, 'ui_valider');
        this.debutRound();
      });
    });
  }

  debutRound() {
    etiquettesTactiles({ ...ETIQUETTES_COMBAT, x: null });
    this.boutonDempsey = false;
    const j = this.j;
    j.souffle = 100; this.g.souffle = 100;
    j.action = null; j.esquive = null; j.sonne = 0; j.contreJusqua = -1;
    this.retourGardeGreg(1.2);
    this.tempsRound = R.dureeRound;
    this.smashAnnonce = false;
    this.etat = 'combat';
    this.afficher();
    jouerSon(this, 'greg_cloche');
    const e = encart(this, `ROUND ${this.round}`, this.round === R.nbRounds ? 'Dernier round !' : '', '#ffffff', 0x000000);
    this.figer(1.2, () => {
      e.fermer();
      onomatopee(this, LARGEUR / 2, 200, 'BOX !', 68, '#ffd84a');
      if (this.round === 1) bulle(this, R.centreX + 230, 130, 'Greg : « ' + auHasard(REPLIQUES.gregDebut) + ' »', 1800);
    });
  }

  finDuRound() {
    jouerSon(this, 'greg_cloche');
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
    const pointsGreg = this.stats.recus + this.j.downs * 20;
    const e = encart(this, 'DÉCISION DES JUGES...', `Toi : ${Math.round(pointsJoueur)} pts   -   Greg : ${Math.round(pointsGreg)} pts`, '#ffffff', 0x000000);
    this.time.delayedCall(2200, () => {
      e.fermer();
      if (pointsJoueur > pointsGreg) this.victoire('Victoire aux points ! Greg n\'en revient pas.');
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
    else if (j.action) pj = j.action.pose;
    else if (j.esquive) pj = 'esquive';
    else if (j.garde) pj = 'bloque';
    j.sprite.setTexture('heros_boxe_' + pj);
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

    this.flecheEsquive.setVisible(this.etat === 'combat' && g.etat === 'prepare' && !j.dempsey
      && Math.floor(this.time.now / 140) % 4 !== 0);   // clignote
    const contre = this.horloge < j.contreJusqua && this.etat === 'combat';
    this.aideContre.setVisible(contre).setPosition(R.centreX + j.decalage, 250);
    this.dessinerDempsey();
    this.majHud();
  }

  // Greg en illustrations : on choisit l'image selon ce qu'il fait, puis on la bouge / grossit / teinte
  afficherGregIllustre(reel) {
    const g = this.g, v = g.vis, I = R.illustre, t = this.time.now;
    const existe = (nom) => this.textures.exists(I.poses[nom].cle);
    const garde = g.garde === 'haute' && existe('haute') ? 'haute' : 'basse';
    const imageCoup = (cible) => (cible === 'corps' ? 'corps' : 'visage');
    let pose = garde, dx = 0, dy = 0, echelle = 1, angle = 0, teinte = null, rapide = false;
    const forcee = g.poseForcee ? g.poseForcee.nom : null;

    // au tapis, Greg est montré dans une case de manga (voir ouvrirCaseKO) : on le cache sur le ring
    if (g.etat === 'sol') {
      g.sprite.setVisible(false); if (g.jambes) g.jambes.setVisible(false);
      this.zoneGarde.clear(); this.dessinerCibleEtAura();
      return;
    }
    g.sprite.setVisible(true);
    if (forcee === 'touche' || g.etat === 'touche') { pose = existe('haute') ? 'haute' : 'basse'; dx = -18; angle = g.secousse > 0 ? 9 : 5; teinte = 0xff9a9a; rapide = true; }
    else if (forcee === 'bloque') { pose = existe('haute') ? 'haute' : 'basse'; echelle = 0.97; teinte = 0xc8d4ff; rapide = true; }
    else if (forcee === 'uppercut') { pose = 'visage'; echelle = 1.12; dy = 20; rapide = true; }
    else if (g.etat === 'prepare') {
      const c = g.attaque.cible, avance = g.t / g.prepa, sens = g.attaque.cote === 'g' ? -1 : (g.attaque.cote === 'd' ? 1 : 0);
      const debut = c === 'corps' ? I.debutElanCorps : I.debutElan;
      if (avance < debut) {             // il arme son coup
        if (c === 'smash') { dy = 34; echelle = 0.93; angle = -3; }
        else if (c === 'corps') { dy = 46; echelle = 0.9; dx = sens * 20; angle = sens * 4; }   // il plonge bas
        else { dx = sens * 34; angle = sens * 6; echelle = 0.96; }
      } else {                          // le coup part : l'image du coup grossit vers toi, du bon côté
        const elan = (avance - debut) / (1 - debut);
        pose = imageCoup(c); rapide = true;
        if (c === 'corps') {            // coup au corps : il remonte d'en bas, en tournant
          echelle = 0.84 + elan * 0.24; dx = sens * 26 * (1 - elan); dy = 60 - elan * 30; angle = sens * 10 * (1 - elan);
        } else {
          echelle = 0.82 + elan * 0.25; dx = sens * 30 * (1 - elan);
          dy = c === 'smash' ? 30 - elan * 40 : elan * 10;
        }
      }
      if (Math.floor(this.horloge * 10) % 2) teinte = c === 'smash' ? 0xff7070 : (c === 'corps' ? 0x8fd6ff : 0xfff0a0);
    }
    else if (g.etat === 'frappe' || (g.etat === 'recup' && g.t < 0.15 && g.attaque && g.attaque.cible)) {
      pose = imageCoup(g.attaque.cible); echelle = 1.1; dy = g.attaque.cible === 'smash' ? -15 : (g.attaque.cible === 'corps' ? 30 : 14); rapide = true;
      angle = g.attaque.id === 'crochet' ? -6 : 0;
    }
    else if (g.etat === 'essouffle' || g.etat === 'recup') { pose = 'basse'; dy = 14 + Math.sin(t / 140) * 4; echelle = 0.98; teinte = 0xd8d0e8; }
    else if (this.etat === 'fin' && this.j.downs >= R.knockdownsMax) { pose = 'basse'; dy = -10 + Math.sin(t / 160) * 6; echelle = 1.04; }
    else { dx = Math.sin(t / 400) * 12; dy = Math.sin(t / 300) * 2; }     // en garde : il se balance et respire
    if (!existe(pose)) pose = 'basse';

    const k = rapide ? 1 : Math.min(1, reel * 12);
    v.dx += (dx - v.dx) * k; v.dy += (dy - v.dy) * k; v.echelle += (echelle - v.echelle) * k; v.angle += (angle - v.angle) * k;
    g.secousse = Math.max(0, g.secousse - reel);
    const secousse = g.secousse > 0 ? Phaser.Math.Between(-8, 8) : 0;

    const P = I.poses[pose], sp = g.sprite;
    // les images de coup sont retournées si le coup part de l'autre côté
    const coteCoup = g.attaque && g.attaque.cote;
    const retourne = !!(P.cote && coteCoup && coteCoup !== 'centre' && coteCoup !== P.cote);
    sp.setTexture(P.cle).setFlipX(retourne).setOrigin(retourne ? 1 - P.origine[0] : P.origine[0], P.origine[1]);
    sp.setPosition(I.teteX + v.dx + secousse, I.teteY + v.dy).setScale(P.taille * v.echelle).setAngle(v.angle);
    if (teinte) sp.setTint(teinte); else sp.clearTint();
    if (g.jambes) {   // les jambes suivent un peu le buste, mais restent plantées
      g.jambes.setVisible(true).setX(I.teteX + v.dx * 0.35 + secousse * 0.3);
      if (teinte) g.jambes.setTint(teinte); else g.jambes.clearTint();
    }

    this.dessinerCibleEtAura();

    // sans l'image "garde haute", une zone bleue montre ce qu'il protège
    const z = this.zoneGarde;
    z.clear();
    if (!existe('haute') && g.etat === 'garde' && this.etat === 'combat' && !this.j.dempsey) {
      const haut = g.garde === 'haute';
      const x = R.centreX + v.dx, y = haut ? VISAGE_GREG.y : CORPS_GREG.y + 10, l = haut ? 120 : 150, h = haut ? 100 : 90;
      const pulse = 0.5 + Math.sin(t / 200) * 0.2;
      z.fillStyle(0x5ad1ff, 0.16 * pulse + 0.06).fillRoundedRect(x - l / 2, y - h / 2, l, h, 18);
      z.lineStyle(3, 0x9fe6ff, pulse).strokeRoundedRect(x - l / 2, y - h / 2, l, h, 18);
    }
  }

  // Cible qui se resserre sur toi (là où le coup va frapper) + aura bleue du coup au corps
  dessinerCibleEtAura() {
    const g = this.g, c = this.cible, a = this.aura, t = this.time.now;
    c.clear(); a.clear();
    if (this.etat !== 'combat' || g.etat !== 'prepare' || !g.attaque || this.j.dempsey) return;
    const at = g.attaque, avance = Phaser.Math.Clamp(g.t / g.prepa, 0, 1);
    const couleur = at.cible === 'corps' ? 0x5ad1ff : (at.cible === 'smash' ? 0xff3b3b : 0xffd84a);
    const x = R.centreX, y = at.cible === 'corps' ? TETE_JOUEUR_Y + VENTRE_JOUEUR : TETE_JOUEUR_Y - 10;
    const r = 24 + 80 * (1 - avance);
    c.lineStyle(5, couleur, 0.9).strokeCircle(x, y, r);
    c.lineStyle(2, couleur, 0.9).strokeCircle(x, y, 20);
    c.lineBetween(x - r - 10, y, x - r + 14, y).lineBetween(x + r - 14, y, x + r + 10, y)
     .lineBetween(x, y - r - 10, x, y - r + 14).lineBetween(x, y + r - 14, x, y + r + 10);
    if (at.cible === 'corps') {
      // aura bleue qui pulse autour de Greg + traits qui montent
      const pulse = 0.5 + Math.sin(t / 70) * 0.5;
      a.fillStyle(0x5ad1ff, 0.12 + pulse * 0.12).fillEllipse(R.centreX + this.g.vis.dx, 290, 280, 430);
      a.lineStyle(3, 0x9fe6ff, 0.6);
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
    this.texteCombo = texte(this, R.centreX, 370, '', 30, '#ffd84a').setDepth(36).setVisible(false);
    // portraits (façon Super Punch-Out)
    this.add.image(38, 38, 'heros_portrait').setDepth(41).setDisplaySize(60, 60);
    this.add.image(LARGEUR - 38, 38, 'greg_visage').setDepth(41).setDisplaySize(60, 60);
    this.hudCadre = this.add.graphics().setDepth(42);
    this.hudCadre.lineStyle(3, 0xffd84a, 1).strokeRect(LARGEUR - 68, 8, 60, 60);
    texte(this, LARGEUR / 2, 24, 'VS', 30, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 6 }).setDepth(41);
    this.texteTemps = texte(this, LARGEUR / 2, 56, '', 24, '#ffffff').setDepth(41);
    this.texteRound = texte(this, LARGEUR / 2, 80, '', 13, '#cccccc').setDepth(41);
    this.texteGarde = texte(this, LARGEUR - 30, 92, '', 14, '#cccccc').setOrigin(1, 0.5).setDepth(41);
    texte(this, 120, 76, 'ESPRIT', 12, '#ffd84a').setOrigin(1, 0.5).setDepth(41);
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
    if (this.etat === 'combat' && dempseyPret !== this.boutonDempsey) {
      this.boutonDempsey = dempseyPret;
      etiquettesTactiles({ ...ETIQUETTES_COMBAT, x: dempseyPret ? 'Dempsey' : null });
    }

    this.texteRound.setText(`ROUND ${this.round} / ${R.nbRounds}`);
    const reste = Math.max(0, Math.ceil(this.tempsRound ?? R.dureeRound));
    this.texteTemps.setText(`TIME ${Math.floor(reste / 60)}'${String(reste % 60).padStart(2, '0')}`);
    this.texteGarde.setText(g.etat === 'garde' ? `Garde ${g.garde === 'haute' ? 'HAUTE : vise le corps' : 'BASSE : vise la tête'}` : '');
  }
}
