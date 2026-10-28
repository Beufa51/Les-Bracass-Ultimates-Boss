// =====================================================================
// LIONEL : match de frisbee en 1 contre 1, façon Windjammers (Neo Geo, 1994).
// Vue de 3/4 au-dessus du terrain : TOI à gauche, Lionel à droite.
//  - Le frisbee rebondit sur les murs du haut et du bas.
//  - S'il passe derrière toi : 3 points (côtés) ou 5 points (milieu) pour l'autre.
//  - Lob qui tombe par terre : 2 points pour celui qui l'a lancé.
//  - Rattraper un lob juste en dessous = SUPER LANCER.
//  - Relancer tout de suite après avoir attrapé = lancer PUISSANT.
//  - 12 points ou 30 s par set, 2 sets gagnants.
// Toute la logique avance dans update() (pas de minuteries Phaser) : le jeu
// peut donc être accéléré pour les tests avec des bots.
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { onomatopee, flash, encart, bulle, lignesImpact } from './effets.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { installerJoystick } from './joystick.js';
import { Sauvegarde, formatTemps, lignesDefis } from '../../core/sauvegarde.js';
import { choisirDifficulte, cleRecord } from './difficulte.js';
import { IDENTITE, TERRAIN as T, DIFFICULTES, REGLAGES as R, REPLIQUES } from './reglages.js';
import { ETAPES, VITESSE_ENTRAINEMENT } from './entrainement.js';
import { Surprises } from './surprises.js';

// ordre d'affichage : plus on est bas sur le terrain, plus on est devant (entre 10 et 60)
const profondeur = (y) => 10 + y / 10;
const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)];
const entre = (min, max) => min + Math.random() * (max - min);
const borne = Phaser.Math.Clamp;

const MILIEU_Y = (T.y0 + T.y1) / 2;
const HAUT_T = T.y1 - T.y0;
const ZONE5 = [T.y0 + HAUT_T * T.zone5[0], T.y0 + HAUT_T * T.zone5[1]];
const LIMITES = {
  j: { x0: T.x0 + 22, x1: T.filet - 26 },
  l: { x0: T.filet + 26, x1: T.x1 - 22 },
  y0: T.y0 + 10, y1: T.y1 - 2,
};
const MAISON = { j: T.x0 + 110, l: T.x1 - 110 };

// poses dessinées où le joueur a déjà le frisbee dans la main
// durée de la scène du super lancer (secondes)
const DUREE_CINEMATIQUE = 1.6;

const POSES_AVEC_DISQUE = ['tient', 'nargue', 'rattrape'];
// les illustrations de Lionel ont les mains vides : où poser le frisbee du jeu (x vers l'avant, y depuis ses pieds)
const MAINS_LIONEL = { tient: [27, -71], rattrape: [-25, -134], plongeon: [67, -61], nargue: [-28, -172] };

// 2 boutons seulement : Lancer (Espace) et Lob (Z)
const ETIQUETTES_JEU = { espace: 'Lancer', z: 'Lob', x: null };
const ETIQUETTES_OK = { haut: null, bas: null, gauche: null, droite: null, espace: 'OK', z: null, x: null };

// ---------------------------------------------------------------------
// Avance le frisbee de dt secondes. Sert au jeu ET à Lionel pour deviner
// où le frisbee va arriver (il simule le vol sur une copie).
// Renvoie un événement : 'rebond', 'butG' (derrière toi), 'butD' (derrière Lionel), 'sol' (lob tombé), 'relance'
// ---------------------------------------------------------------------
function avancerDisque(d, dt) {
  d.t += dt;
  if (d.type === 'lob') {
    const k = Math.min(1, d.t / d.lob.duree);
    d.x = d.lob.x0 + (d.lob.x1 - d.lob.x0) * k;
    d.y = d.lob.y0 + (d.lob.y1 - d.lob.y0) * k;
    d.z = 4 * d.lob.hauteur * k * (1 - k);
    return k >= 1 ? 'sol' : null;
  }
  if (d.arret > 0) {
    d.arret -= dt;
    if (d.arret <= 0) { d.vx = d.apres.vx; d.vy = d.apres.vy; return 'relance'; }
    return null;
  }
  let ev = null;
  if (d.type === 'superJ') {
    // ta tornade est téléguidée : ▲ ▼ (d.pilote) la font monter ou descendre
    d.vy += (d.pilote * d.guide.vitesse - d.vy) * Math.min(1, dt * d.guide.reactivite);
  } else d.vy += d.ay * dt;
  d.x += d.vx * dt; d.y += d.vy * dt;
  const r = R.rayonDisque;
  if (d.y < T.y0 + r) { d.y = 2 * (T.y0 + r) - d.y; d.vy = -d.vy; d.ay = -d.ay; ev = 'rebond'; }
  if (d.y > T.y1 - r) { d.y = 2 * (T.y1 - r) - d.y; d.vy = -d.vy; d.ay = -d.ay; ev = 'rebond'; }
  // super de Lionel : s'arrête juste avant le filet (de son côté), puis repart en flèche
  if (d.type === 'superL' && !d.arrete && d.x <= T.filet + 34) { d.arrete = true; d.arret = d.arretDuree; d.vx = 0; d.vy = 0; }
  if (d.x <= T.x0 + r) return 'butG';
  if (d.x >= T.x1 - r) return 'butD';
  return ev;
}

function copieDisque(d) {
  return { ...d, lob: d.lob && { ...d.lob }, guide: d.guide && { ...d.guide }, apres: d.apres && { ...d.apres } };
}

export class LionelMatch extends BossScene {
  constructor() { super('LionelMatch', IDENTITE); }

  create() {
    this.phase = this.donnees.phase || 'set1';
    this.etat = 'intro';          // intro | jeu | point | finSet | fin
    this.attente = 0; this.apresAttente = null;   // pause chronométrée (après un point...)
    this.gel = 0;                 // jeu figé un instant (impact, super lancer)
    this.nomDiff = 'normal'; this.diff = DIFFICULTES.normal;
    this.score = { j: 0, l: 0 }; this.sets = { j: 0, l: 0 }; this.numSet = 1;
    this.tempsSet = R.dureeSet; this.pointEnOr = false;
    this.tempsTotal = 0; this.stats = { concedes: 0, marques: 0, supers: 0, puissants: 0, plongeons: 0 };
    this.echange = 0;             // nombre de lancers dans l'échange (le frisbee accélère)
    this.memoire = {};            // appuis gardés un instant (relancer pile en attrapant)
    this.horloge = 0;
    this.trainee = [];
    // (la scène est réutilisée d'une visite à l'autre : tout remettre à zéro)
    this.tuto = null; this.ralentiReste = 0; this.dirJoueur = { x: 0, y: 0 }; this.finCinematique = null;

    this.add.image(0, 0, 'lionel_terrain').setOrigin(0);
    // le décor illustré n'a pas de zones de but dessinées : bandes 3 / 5 / 3 le long des deux murs de but
    if (this.estIllustre('lionel_terrain')) this.dessinerButs();

    // ---------- les deux joueurs ----------
    const joueur = (cote, prefixe) => ({
      cote, prefixe, sens: cote === 'j' ? 1 : -1,
      x: MAISON[cote], y: MILIEU_Y, vx: 0, vy: 0,
      tient: false, tenue: 0, superPret: false, rapideDispo: false,
      glisse: 0, glisseX: 0, glisseY: 0, recharge: 0, relever: 0,
      pose: null, poseTemps: 0,
      ombre: this.add.ellipse(0, 0, 58, 16, 0x000000, 0.28),
      sprite: this.add.sprite(0, 0, prefixe + '_garde').setOrigin(0.5, 1),
    });
    this.j = joueur('j', 'heros_frisbee');
    this.l = joueur('l', 'lionel');
    this.l.sprite.setFlipX(true);   // Lionel regarde vers la gauche
    Object.assign(this.l, { cible: { x: MAISON.l, y: MILIEU_Y }, reaction: 0, plan: null, tenueVoulue: 0, nargue: false, bulle: null });

    // ---------- le frisbee ----------
    this.d = null;   // en vol : { x, y, z, vx, vy, ay, type, lanceur, t... } ; null = tenu par quelqu'un
    this.porteur = null;
    this.disque = this.add.sprite(0, 0, 'frisbee').play('frisbee');
    this.disqueFantome = this.add.sprite(0, 0, 'frisbee').play('frisbee').setVisible(false);   // le faux frisbee du Dédoubleur
    this.public = { j: 0, l: 0 };   // jauges du public (la tienne, celle de Lionel)
    this.astucePublic = false;      // l'explication de la jauge s'affiche une fois par visite
    this.ralentiReste = 0;    // ralenti du contre parfait
    this.surprises = null;
    this.ombreDisque = this.add.ellipse(0, 0, 26, 9, 0x000000, 0.3);
    this.graphTrainee = this.add.graphics();
    this.reperes = this.add.graphics().setDepth(5);   // où tombe le lob, où arrive le frisbee (aide)

    this.creerHud();
    this.touches = creerTouches(this);
    // sur téléphone : joystick qui suit le pouce et pause en haut à droite, SEULEMENT pendant ce match
    // (le hub, Greg et les autres boss gardent la croix et la pause au milieu)
    this.joystick = installerJoystick(this);
    // musique de fond (Windjammers, « Lawn Court ») : démarre pendant l'écran des commandes, en boucle
    jouerMusique(this, 'lionel_musique');
    // ambiance du public de la plage
    if (this.cache.audio.exists('lionel_ambiance')) {
      this.ambiance = this.sound.add('lionel_ambiance', { loop: true, volume: 0.18 });
      this.ambiance.play();
      const pause = () => this.ambiance.pause(), reprise = () => this.ambiance.resume();
      this.events.on('pause', pause); this.events.on('resume', reprise);
      this.events.once('shutdown', () => { this.events.off('pause', pause); this.events.off('resume', reprise); this.ambiance.stop(); this.ambiance.destroy(); });
    }
    // au retour de pause, on « oublie » la touche qui a servi à reprendre
    const oublier = () => { this.lireTouches(); this.memoire = {}; };
    this.events.on('resume', oublier);
    this.events.once('shutdown', () => this.events.off('resume', oublier));

    this.placerPourService('j');
    this.afficher();

    this.etiquettes(ETIQUETTES_OK);
    const tactile = estTactile();
    this.afficherIntro('LIONEL - Le Chambreur', [
      'BUT : vise le mur derrière Lionel (jaune = 3 points, rouge = 5)',
      'Flèches : cours vers le cercle vert (suis les points blancs !)',
      (tactile ? 'Lancer' : 'ESPACE') + ' : lancer (maintiens ▲ ou ▼ pour lancer en biais)',
      (tactile ? 'Lob' : 'Z') + ' : lob, visé avec les flèches (▶ = profond : 3 points !)',
      'Attrape un lob juste en dessous = SUPER LANCER, guidé avec ▲ ▼ !',
      (tactile ? 'Lancer' : 'ESPACE') + ' en courant vers le frisbee = plongeon',
      (tactile ? 'Lancer' : 'ESPACE') + ' juste avant d\'attraper = CONTRE PARFAIT !',
      'Jauge PUBLIC pleine (plongeons, contres parfaits) = SUPER !',
    ], () => this.presentation(() => this.choixDifficulte()));
  }

  choixDifficulte() {
    // ◀ ▶ du joystick pour choisir (mêmes boutons que l'écran de difficulté)
    this.etiquettes({ haut: null, bas: null, z: null, x: null, espace: 'OK' });
    choisirDifficulte(this, 'lionel', DIFFICULTES, (nom, diff) => {
      this.nomDiff = nom; this.diff = diff; this.demarrerMatch();
    }, 'frisbee_rebond');
  }

  // Boutons tactiles de la scène + directions du joystick (sur téléphone)
  etiquettes(e) {
    etiquettesTactiles(e);
    if (this.joystick) this.joystick.directions(e);
  }

  // Lancement du match (aussi appelé directement par les tests)
  demarrerMatch() {
    // la première fois (ou depuis le menu F1) : petit entraînement avant le match
    if (this.phase === 'entrainement' || (this.phase === 'set1' && !Sauvegarde.fait('lionel_entrainement') && !this.sansEntrainement)) {
      return this.debutEntrainement();
    }
    if (this.phase === 'decisif') { this.sets = { j: 1, l: 1 }; this.numSet = 3; }
    this.debutSet();
  }

  // =================================================================
  //  ENTRAÎNEMENT (mini-tutoriel, voir entrainement.js)
  // =================================================================
  debutEntrainement() {
    const tactile = estTactile();
    this.boutons = { lancer: tactile ? 'Lancer' : 'ESPACE', lob: tactile ? 'Lob' : 'Z' };
    this.tuto = {
      etape: 0, enAttente: false,
      banniere: texte(this, LARGEUR / 2, 120, '', 20, '#ffffff', { backgroundColor: '#000000cc', padding: { x: 12, y: 6 } }).setDepth(92),
      // sur téléphone, le bouton « Passer » suffit
      passer: texte(this, LARGEUR - 12, HAUTEUR - 14, tactile ? '' : 'X : passer l\'entraînement', 14, '#aaaaaa')
        .setOrigin(1, 1).setDepth(92),
    };
    this.etiquettes({ ...ETIQUETTES_JEU, x: 'Passer' });
    this.placerPourService('l');
    this.etat = 'pret';
    encartRapide(this, 'ENTRAÎNEMENT', 'Lionel va te montrer les bases', '#7fd0ff', 1.3);
    this.attendre(1.4, () => this.etapeTuto(0));
  }

  etapeTuto(i) {
    if (i >= ETAPES.length) return this.finEntrainement();
    const E = ETAPES[i], tu = this.tuto;
    tu.etape = i; tu.enAttente = false;
    tu.banniere.setText(E.texte(this.boutons)).setColor('#ffffff');
    if (E.depart === 'l' || !this.j.tient) this.placerPourService(E.depart);
    if (E.depart === 'l') this.l.tenueVoulue = 1.2;
    if (E.joueurLoin) this.j.y = T.y0 + 30;
    if (E.superPret) this.j.superPret = true;
    this.etat = 'jeu';
  }

  // étape réussie : petit bravo, puis la suivante
  reussiTuto(delai) {
    const tu = this.tuto;
    if (!tu || tu.enAttente) return;
    tu.enAttente = true;
    tu.banniere.setText(auHasard(['Bravo !', 'Parfait !', 'Super !', 'Bien joué !'])).setColor('#7fff7f');
    jouerSon(this, 'ui_valider');
    this.attendre(delai, () => this.etapeTuto(tu.etape + 1));
  }

  rateTuto(message) {
    const tu = this.tuto;
    if (!tu || tu.enAttente) return;
    tu.enAttente = true;
    tu.banniere.setText(message).setColor('#ffb347');
    this.etat = 'pret'; this.d = null;
    this.attendre(1.3, () => { this.placerPourService(ETAPES[tu.etape].depart); this.etapeTuto(tu.etape); });
  }

  // vérifie ce que tu viens de faire pendant l'entraînement
  actionTuto(action, type, parfait) {
    const tu = this.tuto;
    if (!tu || tu.enAttente) return;
    const but = ETAPES[tu.etape].but;
    if (action === 'attrape') {
      if (but === 'attrape' || (but === 'attrapeLob' && type) || (but === 'parfait' && parfait)) { this.etat = 'pret'; this.reussiTuto(0.9); }
      else if (but === 'parfait') this.rateTuto('Pas tout à fait ! Appuie au moment où le cercle devient BLEU.');
      return;
    }
    if (action === 'guide') { if (but === 'superGuide') this.reussiTuto(1.0); return; }
    if (but === 'superGuide') return;   // le lancer du super seul ne suffit pas : il faut le guider
    // un lancer
    const ok = (but === 'lance' && (type === 'droit' || type === 'biais')) || but === type
      || (but === 'lobProfond' && type === 'lob' && this.d && this.d.lob.points > R.pointsLob);
    if (ok) this.reussiTuto(0.9);
    else if (['lance', 'biais', 'super', 'lob', 'lobProfond'].includes(but)) this.rateTuto('Presque ! Regarde bien la consigne et réessaie.');
  }

  finEntrainement() {
    Sauvegarde.marquerFait('lionel_entrainement');
    const tu = this.tuto;
    if (!tu) return;
    tu.banniere.destroy(); tu.passer.destroy();
    this.tuto = null;
    this.d = null; this.echange = 0;
    this.j.superPret = false; this.l.superPret = false;
    this.debutSet();
  }

  // =================================================================
  //  BOUCLE PRINCIPALE
  // =================================================================
  update(temps, delta) {
    if (this.termine) return;
    const dt = Math.min(delta, 50) / 1000;
    this.horloge += dt;
    const e = this.lireTouches();
    for (const k of ['espace', 'z']) if (e[k]) this.memoire[k] = this.horloge;
    if (e.x && this.tuto) { this.attente = 0; this.apresAttente = null; this.finEntrainement(); }

    if (this.attente > 0) {
      this.attente -= dt;
      if (this.attente <= 0 && this.apresAttente) { const f = this.apresAttente; this.apresAttente = null; f(); }
    }
    if (this.etat === 'jeu') {
      if (this.gel > 0) {
        this.gel -= dt;
        // la scène du super se termine en même temps que le jeu reprend (même sur un téléphone lent)
        if (this.finCinematique && this.gel <= 0.3) { const f = this.finCinematique; this.finCinematique = null; f(); }
      }
      else if (this.ralentiReste > 0) { this.ralentiReste -= dt; this.majJeu(dt * R.parfait.ralenti, e); }   // contre parfait
      else this.majJeu(dt, e);
    }
    this.afficher();
  }

  lireTouches() {
    const t = this.touches, jd = Phaser.Input.Keyboard.JustDown;
    return {
      haut: t.haut.isDown, bas: t.bas.isDown, gauche: t.gauche.isDown, droite: t.droite.isDown,
      espace: jd(t.espace), z: jd(t.z), x: jd(t.x),
    };
  }

  // appui fait il y a moins de 0,15 s (ou 'fenetre' s) : on le "consomme"
  aAppuye(k, fenetre = 0.15) {
    if (this.memoire[k] !== undefined && this.horloge - this.memoire[k] <= fenetre) { delete this.memoire[k]; return true; }
    return false;
  }

  majJeu(dt, e) {
    this.tempsTotal += dt;
    // chrono du set (arrêté pendant que quelqu'un tient le frisbee : service, Lionel qui nargue...)
    if (!this.pointEnOr && !this.porteur && !this.tuto) {
      this.tempsSet -= dt;
      if (this.tempsSet <= 0) {
        this.tempsSet = 0;
        if (this.score.j !== this.score.l) { this.finSet(this.score.j > this.score.l ? 'j' : 'l'); return; }
        this.pointEnOr = true;
        encartRapide(this, 'POINT EN OR !', 'Le prochain point gagne le set', '#ffd84a');
        this.gel = 1.2;
        return;
      }
    }
    if (this.surprises && !this.tuto) this.surprises.maj(dt);
    this.majJoueur(dt, e);
    this.majLionel(dt);
    for (const p of [this.j, this.l]) this.bouger(p, dt);
    if (this.d) this.majDisque(dt);
  }

  // ---------- déplacements communs ----------
  bouger(p, dt) {
    p.recharge = Math.max(0, p.recharge - dt);
    p.poseTemps = Math.max(0, p.poseTemps - dt);
    if (p.tient) { p.tenue += dt; p.vx = p.vy = 0; return; }
    if (p.glisse > 0) {
      p.glisse -= dt;
      p.vx = p.glisseX * R.glissade.vitesse; p.vy = p.glisseY * R.glissade.vitesse;
      if (p.glisse <= 0) { p.relever = R.glissade.relever; p.vx = p.vy = 0; }
    } else if (p.relever > 0) {
      p.relever -= dt; p.vx = p.vy = 0;
    }
    const L = LIMITES[p.cote];
    p.x = borne(p.x + p.vx * dt, L.x0, L.x1);
    p.y = borne(p.y + p.vy * dt, LIMITES.y0, LIMITES.y1);
  }

  plonger(p, dx, dy) {
    const n = Math.hypot(dx, dy) || 1;
    p.glisse = R.glissade.duree; p.glisseX = dx / n; p.glisseY = dy / n;
    p.recharge = R.glissade.duree + R.glissade.recharge;
    jouerSon(this, 'frisbee_plongeon');
    if (p === this.j) this.stats.plongeons++;
  }

  peutBouger(p) { return !p.tient && p.glisse <= 0 && p.relever <= 0; }

  // =================================================================
  //  TOI
  // =================================================================
  majJoueur(dt, e) {
    const p = this.j;
    let dirY = (e.haut ? -1 : 0) + (e.bas ? 1 : 0), dirX = (e.gauche ? -1 : 0) + (e.droite ? 1 : 0);
    // après avoir attrapé en courant, les flèches encore tenues ne comptent pas tant qu'on ne les a pas lâchées
    // (sinon, surtout avec le pouce sur téléphone, tous les lancers partiraient en biais sans le vouloir)
    if (p.flechesBloquees) {
      if (!dirX && !dirY) p.flechesBloquees = false;
      else if (p.tient) { dirX = 0; dirY = 0; }
    }
    this.dirJoueur = { x: dirX, y: dirY };   // pour le viseur de lob
    // ta tornade de feu se guide avec ▲ ▼ pendant tout son vol
    if (this.d && this.d.type === 'superJ') {
      this.d.pilote = dirY;
      if (dirY && this.d.t > 0.15) this.actionTuto('guide');
    }
    if (p.tient) {
      if (p.tenue < R.ralentiTenue) return;
      // appui fait juste AVANT d'attraper : relancé tout droit (les flèches tenues en courant ne comptent pas)
      if (p.lancerMemorise) {
        const k = p.lancerMemorise; p.lancerMemorise = null;
        // contre parfait : la direction ▲ ▼ est lue à la fin du ralenti (on peut donc le viser)
        const dir = p.parfait ? dirY : 0;
        return this.lancer(p, k === 'z' ? 'lob' : (p.superPret ? 'super' : (dir ? 'biais' : 'droit')), dir);
      }
      if (this.aAppuye('espace')) return this.lancer(p, p.superPret ? 'super' : (dirY ? 'biais' : 'droit'), dirY);
      if (this.aAppuye('z')) return this.lancer(p, 'lob', dirY, dirX);
      if (p.tenue >= R.tenueMax && !this.tuto) return this.lancer(p, 'droit', 0);
      return;
    }
    if (!this.peutBouger(p)) return;
    const n = Math.hypot(dirX, dirY) || 1;
    p.vx = dirX / n * R.vitesseJoueur; p.vy = dirY / n * R.vitesseJoueur;
    // plongeon : Espace en courant, seulement si le frisbee arrive vers toi, encore loin, et que tu n'es pas
    // déjà au bon endroit (sinon l'appui est gardé pour relancer dès que tu l'attrapes). Il plonge VERS le frisbee.
    if ((dirX || dirY) && p.recharge <= 0 && this.memoire.espace !== undefined && this.horloge - this.memoire.espace <= 0.05) {
      const d = this.d, vient = d && (d.type === 'lob' ? d.lob.x1 < T.filet : d.vx < 0);
      const pr = vient && this.prevoir(d, p);
      if (pr && Math.hypot(d.x - p.x, d.y - p.y) > 140 && Math.hypot(pr.x - p.x, pr.y - p.y) > 60) {
        delete this.memoire.espace; this.plonger(p, pr.x - p.x, pr.y - p.y);
      }
    }
  }

  // =================================================================
  //  LIONEL (le cerveau)
  // =================================================================
  majLionel(dt) {
    const p = this.l, D = this.diff, ia = R.ia;
    if (p.tient) {
      if (p.tenue >= p.tenueVoulue) this.lancerLionel();
      return;
    }
    // le frisbee vient vers lui : il devine où il arrive (après un temps de réaction)
    const d = this.d;
    const versLui = d && (d.type === 'lob' ? d.lob.x1 > T.filet : (d.vx > 0 || (d.arret > 0 && d.lanceur === 'j')));
    if (versLui) {
      if (!p.plan) {
        // plus le frisbee va vite, plus il se trompe
        const vite = d.type === 'lob' ? 1 : Math.max(1, Math.hypot(d.vx, d.vy) / R.vitesseDisque);
        p.plan = { reaction: D.reaction * entre(0.8, 1.2) * (d.type === 'lob' ? D.lentLob || 1 : 1), erreur: entre(-1, 1) * D.erreur * vite * vite };
      }
      if (p.plan.reaction > 0) { p.plan.reaction -= dt; }
      else {
        const pr = this.prevoir(d, p);
        if (pr) {
          // plus le frisbee approche, plus il corrige son erreur
          const corr = d.type === 'lob' || pr.temps >= 0.3 ? 1 : 0.55;
          p.cible = { x: pr.x, y: borne(pr.y + p.plan.erreur * corr, LIMITES.y0, LIMITES.y1) };
          // trop loin pour y arriver en courant : il plonge
          const dist = Math.hypot(p.cible.x - p.x, p.cible.y - p.y);
          const vitesse = R.vitesseLionel * D.vitesse;
          if (this.peutBouger(p) && p.recharge <= 0 && dist > ia.plongeon && dist / vitesse > pr.temps - 0.05 && pr.temps < 0.45) {
            this.plonger(p, p.cible.x - p.x, p.cible.y - p.y);
          }
        }
      }
    } else {
      p.plan = null;
      // il se replace, en suivant un peu ta position
      p.cible = { x: MAISON.l, y: MILIEU_Y + (this.j.y - MILIEU_Y) * 0.3 };
    }
    if (!this.peutBouger(p)) return;
    const dx = p.cible.x - p.x, dy = p.cible.y - p.y, dist = Math.hypot(dx, dy);
    const v = R.vitesseLionel * D.vitesse * (versLui ? 1 : 0.6);
    if (dist < 4) { p.vx = p.vy = 0; return; }
    const k = Math.min(1, dist / (v * dt)) * v / dist;
    p.vx = dx * k; p.vy = dy * k;
  }

  // Où (et dans combien de temps) le frisbee arrivera-t-il à la hauteur du joueur p ?
  prevoir(d, p) {
    const c = copieDisque(d), pas = 1 / 60;
    if (c.type === 'lob') return { x: c.lob.x1, y: c.lob.y1, temps: c.lob.duree - c.t };
    const ligne = p.cote === 'l' ? Math.min(p.x, MAISON.l + 20) : Math.max(p.x, MAISON.j - 20);
    for (let t = 0; t < 4; t += pas) {
      const ev = avancerDisque(c, pas);
      if ((p.cote === 'l' && c.x >= ligne) || (p.cote === 'j' && c.x <= ligne) || ev === 'butG' || ev === 'butD') {
        return { x: ligne, y: c.y, temps: t };
      }
    }
    return null;
  }

  // Où tombe ton lob selon les flèches (▲ ▼ = côté, ◀ = court, ▶ = profond à 3 points)
  cibleLob(dirY, dirX) {
    const L = R.lobVise, ciblesY = { '-1': T.y0 + 55, 0: MILIEU_Y, 1: T.y1 - 55 };
    const x1 = dirX > 0 ? T.x1 - L.profondX : dirX < 0 ? T.filet + L.courtX : (T.filet + T.x1) / 2;
    return { x1, y1: ciblesY[dirY], duree: dirX > 0 ? L.dureeProfond : dirX < 0 ? L.dureeCourt : R.lob.duree,
      hauteur: R.lob.hauteur, points: dirX > 0 ? L.pointsProfond : R.pointsLob };
  }

  // Lob qui tombe dans le sable : gerbe de sable, « BOUM ! », secousse
  explosionSable(x, y, points) {
    this.cameras.main.shake(260, 0.014);
    onomatopee(this, x, y - 70, points >= 3 ? 'LOB PROFOND !' : 'BOUM !', points >= 3 ? 34 : 40, '#ffd84a');
    const onde = this.add.ellipse(x, y, 40, 16).setStrokeStyle(5, 0xfff0c0, 1).setDepth(6);
    this.tweens.add({ targets: onde, scaleX: 5, scaleY: 5, alpha: 0, duration: 450, onComplete: () => onde.destroy() });
    for (let k = 0; k < 22; k++) {
      const grain = this.add.circle(x, y, 3 + Math.random() * 4, Math.random() < 0.5 ? 0xe9cf92 : 0xc9a65e).setDepth(profondeur(y) + 1);
      const a = -Math.PI * Math.random(), v = 60 + Math.random() * 120;
      this.tweens.add({ targets: grain, x: x + Math.cos(a) * v, y: y + Math.sin(a) * v * 0.9, alpha: 0, duration: 500 + Math.random() * 300,
        ease: 'Cubic.Out', onComplete: () => grain.destroy() });
    }
  }

  // Points du trajet au sol jusqu'à la hauteur du joueur p (pour dessiner l'aide)
  trajet(d, p) {
    const c = copieDisque(d), pas = 1 / 60, pts = [];
    for (let t = 0; t < 3; t += pas) {
      const ev = avancerDisque(c, pas);
      if (Math.round(t / pas) % 3 === 0) pts.push({ x: c.x, y: c.y });
      if ((p.cote === 'j' && c.x <= p.x) || ev === 'butG' || ev === 'butD') break;
    }
    return pts;
  }

  lancerLionel() {
    const p = this.l, D = this.diff;
    // côté opposé au tien
    const dir = this.j.y < MILIEU_Y ? 1 : -1;
    if (this.tuto) {
      const E = ETAPES[this.tuto.etape];
      // pendant l'entraînement, il ne relance pas tes lancers : il attend l'étape suivante
      return E.lionel && !this.tuto.enAttente ? this.lancer(p, E.lionel, dir) : null;
    }
    if (p.superPret || Math.random() < D.superHasard) return this.lancer(p, 'super', dir);
    const poids = this.diff.choix || R.ia.choix, total = Object.values(poids).reduce((a, b) => a + b, 0);
    let r = Math.random() * total, type = 'droit';
    for (const [k, w] of Object.entries(poids)) { if ((r -= w) < 0) { type = k; break; } }
    if (type === 'droit' && Math.abs(this.j.y - MILIEU_Y) < 50) type = 'biais';
    // FACILE / NORMAL : ses premiers lancers de l'échange sont droits (le temps de se mettre en route)
    if (type === 'biais' && this.echange < (D.biaisApres || 0)) type = 'droit';
    this.lancer(p, type, type === 'droit' ? 0 : (Math.random() < 0.75 ? dir : -dir));
  }

  // =================================================================
  //  LE FRISBEE
  // =================================================================
  vitesseDeBase() {
    return Math.min(R.vitesseMax, R.vitesseDisque * (1 + R.accelEchange * this.echange));
  }

  lancer(p, type, dir, dirX = 0) {
    const autre = p === this.j ? this.l : this.j;
    let v = this.vitesseDeBase();
    if (p === this.l) v *= this.diff.disque * (this.tuto ? VITESSE_ENTRAINEMENT : 1);
    // lancer PUISSANT : relancé tout de suite après avoir attrapé
    const puissant = p.rapideDispo && p.tenue <= R.rapide.fenetre && type !== 'lob' && type !== 'super';
    if (puissant && p.parfait) {
      v *= R.parfait.bonus;   // (le « CONTRE PARFAIT ! » s'est affiché à l'attrape)
    } else if (puissant) {
      v *= R.rapide.bonus;
      onomatopee(this, p.x + p.sens * 40, p.y - 120, 'PUISSANT !', 26, '#ff8a3d');
      if (p === this.j) this.stats.puissants++;
      this.ajouterPublic(p.cote, R.public.puissant, 'lancer puissant');
    }
    p.parfait = false;
    p.tient = false; p.rapideDispo = false;
    this.echange++;
    const x0 = p.x + p.sens * 30, y0 = p.y;
    const d = { x: x0, y: y0, z: 0, vx: p.sens * v, vy: 0, ay: 0, t: 0, type, lanceur: p.cote, arret: 0, vitesse: v };
    if (type === 'droit' && p === this.l) {
      // Lionel vise à côté de toi, sans rebond : tu dois bouger, mais le trajet reste simple
      const ecart = R.ia.ecartVise, j = this.j;
      const ty = borne(j.y + (j.y < MILIEU_Y ? ecart : -ecart), T.y0 + 25, T.y1 - 25);
      const a = Math.atan2(ty - y0, Math.abs(MAISON.j - x0));
      d.vx = p.sens * v * Math.cos(a); d.vy = v * Math.sin(a);
    } else if (type === 'biais') {
      d.vx = p.sens * v * Math.cos(R.angle); d.vy = dir * v * Math.sin(R.angle);
    } else if (type === 'courbe') {
      // part d'un côté, finit de l'autre : on calcule la courbe pour arriver décalé
      const xFin = p === this.j ? T.x1 - 60 : T.x0 + 60;
      const tVol = Math.abs(xFin - x0) / v;
      const yFin = borne(y0 + dir * R.courbe.decalage * 1.4, T.y0 + 40, T.y1 - 40);
      d.vy = -dir * R.courbe.depart * v;
      d.ay = 2 * (yFin - y0 - d.vy * tVol) / (tVol * tVol);
    } else if (type === 'lob') {
      const ciblesY = { '-1': T.y0 + 55, 0: MILIEU_Y, 1: T.y1 - 55 };
      const xMoitie = p === this.j ? (T.filet + T.x1) / 2 : (T.x0 + T.filet) / 2;
      const ty = p === this.j ? ciblesY[dir] : borne(autre.y < MILIEU_Y ? T.y1 - 60 : T.y0 + 60, T.y0 + 40, T.y1 - 40);
      d.lob = { x0, y0, x1: xMoitie + entre(-50, 50), y1: ty + entre(-15, 15), duree: R.lob.duree, hauteur: R.lob.hauteur, points: R.pointsLob };
      if (p === this.j) Object.assign(d.lob, this.cibleLob(dir, dirX), { x0, y0 });
      if (p === this.l) bulleLionel(this, auHasard(REPLIQUES.lob));
    } else if (type === 'super') {
      if (p === this.j) {
        const S = R.superJoueur;
        d.type = 'superJ'; d.vx = p.sens * v * S.vitesse;
        d.guide = { vitesse: S.pilotage, reactivite: S.reactivite }; d.pilote = dir; d.vy = dir * S.pilotage * 0.5;
        this.cinematiqueSuper(p, S.nom, 'Ton super lancer !', 0xff9a3c, '#ffd84a');
        this.stats.supers++;
      } else {
        // un de ses trois supers, au hasard
        const sorte = auHasard(Object.keys(R.supersLionel)), S2 = R.supersLionel[sorte];
        const loin = this.j.y < MILIEU_Y ? 1 : -1;   // le côté le plus loin de toi
        if (sorte === 'chambreur') {
          const S = R.superLionel;
          d.type = 'superL'; d.vx = p.sens * v * 1.2; d.arretDuree = S.arret;
          // il repart vers le coin le plus loin de toi, dans la zone à 3 points
          const ty = loin > 0 ? T.y1 - 30 : T.y0 + 30, tx = T.x0;
          const dx = tx - (T.filet + 34), dy = ty - y0, n = Math.hypot(dx, dy);
          d.apres = { vx: dx / n * v * S.vitesse, vy: dy / n * v * S.vitesse };
        } else if (sorte === 'dedoubleur') {
          // deux frisbees en V : un vrai, un faux qui disparaît juste avant toi
          const a = S2.ecart * (Math.random() < 0.5 ? 1 : -1), vv = v * S2.vitesse;
          d.type = 'superD'; d.vx = p.sens * vv * Math.cos(a); d.vy = vv * Math.sin(a);
          d.fantome = { x: x0, y: y0, vx: d.vx, vy: -d.vy };
        } else {
          // boomerang : part vers un côté et revient en crochet, loin de toi
          const vv = v * S2.vitesse, xFin = T.x0 + 60, tVol = Math.abs(xFin - x0) / vv;
          const yFin = borne(this.j.y + loin * S2.decalage, T.y0 + 30, T.y1 - 30);
          d.type = 'superB'; d.vx = p.sens * vv; d.vy = -loin * 0.45 * vv;
          d.ay = 2 * (yFin - y0 - d.vy * tVol) / (tVol * tVol);
        }
        this.cinematiqueSuper(p, S2.nom, 'Lionel : « ' + auHasard(REPLIQUES.super) + ' »', 0x3fd07a, '#a8ffc0');
      }
      p.superPret = false;
      this.gel = DUREE_CINEMATIQUE;   // le jeu reste figé pendant la scène du super
    }
    if (type !== 'super') jouerSon(this, 'frisbee_lancer');
    this.d = d; this.porteur = null;
    this.trainee = [];
    this.poser(p, type === 'super' ? 'super' : 'lance', 0.28);
    if (p === this.j) this.actionTuto('lance', type);
  }

  majDisque(dt) {
    let d = this.d;
    // ralenti quand le frisbee arrive près de toi (FACILE / NORMAL)
    if (this.diff.ralenti < 1 && d.type !== 'lob' && d.vx < 0 && Math.hypot(d.x - this.j.x, d.y - this.j.y) < 120) dt *= this.diff.ralenti;
    // plusieurs petits pas si le frisbee va très vite (il ne doit pas traverser un joueur)
    const pas = Math.max(1, Math.ceil(Math.hypot(d.vx, d.vy) * dt / 20));
    for (let k = 0; k < pas && this.d === d; k++) this.pasDisque(d, dt / pas);
    if (this.d === d && d.fantome) this.majFantome(d, dt);
    if (this.d) {
      this.trainee.push({ x: d.x, y: d.y - d.z - R.hauteurMain });
      if (this.trainee.length > (d.type.startsWith('super') ? 22 : 10)) this.trainee.shift();
    }
  }

  pasDisque(d, dt) {
    const ev = avancerDisque(d, dt);
    if (ev === 'rebond') jouerSon(this, 'frisbee_rebond', { volume: 0.7 });
    if (this.surprises) this.surprises.toucher(d);
    if (ev === 'relance') { jouerSon(this, 'frisbee_super', { volume: 0.6 }); lignesImpact(this, d.x, d.y - R.hauteurMain, 0x3fd07a, 14, 120); }

    // qui peut l'attraper ? (même en train de plonger ou de se relever)
    const defenseur = d.type === 'lob' ? (d.lob.x1 < T.filet ? this.j : this.l) : (d.vx < 0 ? this.j : d.vx > 0 ? this.l : null);
    if (defenseur && !defenseur.tient) {
      const dx = d.x - defenseur.x, dy = d.y - defenseur.y, dist = Math.hypot(dx, dy);
      if (d.type === 'lob') {
        const k = d.t / d.lob.duree, rayon = defenseur === this.j ? R.lob.attrape : R.lob.attrapeLionel;
        if (k > 0.82 && dist < rayon) return this.attraper(defenseur, true);
      } else if (defenseur === this.j) {
        // ta zone d'attrape : plus large que haute, et plus profonde vers le fond (là où est dessiné ton corps)
        const A = this.diff.attrape;
        if (Math.abs(dx) < A.x && dy > -A.haut && dy < A.bas) return this.attraper(defenseur, false);
      } else if (dist < R.rayon + R.rayonDisque) return this.attraper(defenseur, false);
    }
    if (ev === 'butG') return this.marquer('l', this.zonePoints(d.y), 'but');
    if (ev === 'butD') return this.marquer('j', this.zonePoints(d.y), 'but');
    if (ev === 'sol') return this.marquer(d.lanceur, d.lob.points || R.pointsLob, 'lob');
  }

  // Le faux frisbee du Dédoubleur : il vole à côté du vrai et disparaît (« POF ! ») juste avant toi
  majFantome(d, dt) {
    const f = d.fantome, r = R.rayonDisque;
    if (d.arret > 0) return;
    f.x += f.vx * dt; f.y += f.vy * dt;
    if (f.y < T.y0 + r || f.y > T.y1 - r) f.vy = -f.vy;
    if (f.x <= this.j.x + 70) {
      onomatopee(this, f.x, f.y - 50, 'POF !', 26, '#a8ffc0');
      const nuage = this.add.circle(f.x, f.y - R.hauteurMain, 14, 0xffffff, 0.8).setDepth(profondeur(f.y) + 1);
      this.tweens.add({ targets: nuage, scale: 3, alpha: 0, duration: 350, onComplete: () => nuage.destroy() });
      d.fantome = null;
    }
  }

  // Jauges du public (la tienne et celle de Lionel) : les beaux gestes la remplissent ;
  // pleine = SUPER PRÊT (sans avoir à attraper de lob). raison = ce qui l'a fait monter (affiché).
  ajouterPublic(cote, n, raison) {
    if (this.tuto || !n) return;
    const p = cote === 'j' ? this.j : this.l;
    n *= cote === 'l' ? (this.diff.publicLionel ?? 1) : 1;
    this.public[cote] = borne(this.public[cote] + n, 0, R.public.max);
    // petit « +2 PUBLIC : plongeon » qui monte au-dessus du joueur : on comprend comment la remplir
    if (raison) {
      const t = texte(this, borne(p.x, 110, LARGEUR - 110), Math.max(110, p.y - 150), `+${Math.round(n)} PUBLIC : ${raison}`, 15,
        cote === 'j' ? '#ffb070' : '#a8ffc0', { fontStyle: 'bold' }).setDepth(94);
      this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, delay: 500, duration: 600, onComplete: () => t.destroy() });
    }
    // la première fois : explication sous ta jauge
    if (cote === 'j' && !this.astucePublic) {
      this.astucePublic = true;
      const a = texte(this, 352, 104, 'Ta jauge PUBLIC monte quand tu plonges, réussis un contre parfait,\nfais un long échange ou marques. Pleine = SUPER LANCER !', 13, '#ffe0b0',
        { backgroundColor: '#000000cc', padding: { x: 8, y: 4 } }).setDepth(94).setOrigin(0.2, 0);
      this.tweens.add({ targets: a, alpha: 0, delay: 4500, duration: 500, onComplete: () => a.destroy() });
    }
    if (this.public[cote] >= R.public.max && !p.superPret) {
      this.public[cote] = 0;
      p.superPret = true;
      if (cote === 'j') {
        encartRapide(this, 'LE PUBLIC EST EN FEU !', 'SUPER PRÊT : ' + (estTactile() ? 'Lancer' : 'ESPACE') + ' !', '#ff9a3c', 1.0);
        this.cameras.main.flash(250, 255, 160, 60);
      } else {
        encartRapide(this, 'LE PUBLIC ACCLAME LIONEL !', 'Attention : son super lancer arrive !', '#7fff9a', 1.0);
        this.cameras.main.flash(250, 120, 255, 160);
        bulleLionel(this, 'Merci, merci ! Et maintenant... le super !');
      }
      jouerSon(this, 'lionel_foule'); jouerSon(this, 'frisbee_pret');
    }
    this.majJauge();
  }

  zonePoints(y) { return y >= ZONE5[0] && y <= ZONE5[1] ? 5 : 3; }

  attraper(p, sousLeLob) {
    const plongeon = p.glisse > 0;
    p.tient = true; p.tenue = 0; p.glisse = 0; p.relever = 0; p.vx = p.vy = 0;
    p.rapideDispo = !plongeon;
    this.d = null; this.porteur = p;
    jouerSon(this, 'frisbee_attrape');
    this.poser(p, plongeon ? 'plongeon' : 'rattrape', plongeon ? 0.3 : 0.18);
    if (plongeon) onomatopee(this, p.x, p.y - 90, 'PLONGEON !', 22, '#ffffff');
    if (sousLeLob && (p === this.j || this.diff.superSurLob)) {
      p.superPret = true;
      onomatopee(this, p.x, p.y - 130, 'SUPER PRÊT !', 26, p === this.j ? '#7fff7f' : '#c77dff');
      jouerSon(this, 'frisbee_pret');
    }
    if (p === this.l) {
      p.plan = null;
      const [a, b] = R.ia.tenue;
      p.nargue = !sousLeLob && !this.tuto && Math.random() < R.ia.nargue;
      p.tenueVoulue = p.nargue ? R.ia.tenueNargue : entre(a, b) + (plongeon ? 0.2 : 0);
      if (p.nargue) bulleLionel(this, auHasard(REPLIQUES.nargue));
      // le public aime aussi les beaux gestes de Lionel
      if (plongeon) this.ajouterPublic('l', R.public.plongeon, 'plongeon');
      else if (this.echange >= 3) this.ajouterPublic('l', R.public.attrape, 'bel échange');
    } else {
      // CONTRE PARFAIT : Espace appuyé juste avant d'attraper (pas en plongeon) => ralenti + lancer très rapide
      const delai = this.memoire.espace !== undefined ? this.horloge - this.memoire.espace : 99;
      const etapeParfait = this.tuto && ETAPES[this.tuto.etape].but === 'parfait';
      p.parfait = !plongeon && !sousLeLob && delai <= (this.diff.fenetreParfait || R.parfait.fenetre) && (!this.tuto || etapeParfait);
      p.flechesBloquees = true;
      if (p.parfait) {
        this.ralentiReste = R.parfait.dureeRalenti;
        onomatopee(this, p.x + 30, p.y - 120, 'CONTRE PARFAIT !', 34, '#7fd0ff');
        this.cameras.main.flash(120, 255, 255, 255);
        lignesImpact(this, p.x + 20, p.y - 60, 0x7fd0ff, 16, 110);
      }
      // (une simple attrape ne compte qu'à partir du 3e lancer de l'échange)
      if (plongeon) this.ajouterPublic('j', R.public.plongeon, 'plongeon');
      else if (p.parfait) this.ajouterPublic('j', R.public.parfait, 'contre parfait');
      else if (this.echange >= 3) this.ajouterPublic('j', R.public.attrape, 'bel échange');
      // appui fait juste avant d'attraper : on le garde pour relancer aussitôt (PUISSANT)
      p.lancerMemorise = this.aAppuye('z') ? 'z' : this.aAppuye('espace', Math.max(0.15, this.diff.fenetreParfait || 0)) ? 'espace' : null;
      this.actionTuto('attrape', sousLeLob, p.parfait);
    }
  }

  // =================================================================
  //  POINTS, SETS, MATCH
  // =================================================================
  marquer(qui, points, raison) {
    // entraînement : pas de points ; si Lionel « marque », on recommence l'étape
    if (this.tuto) {
      this.d = null;
      if (qui === 'l') this.rateTuto(raison === 'lob' ? 'Raté ! Va dans le cercle, on recommence.' : 'Raté ! Suis le cercle vert, on recommence.');
      return;
    }
    const perdant = qui === 'j' ? this.l : this.j;
    this.score[qui] += points;
    if (qui === 'j') this.stats.marques += points; else this.stats.concedes += points;
    this.ajouterPublic(qui, R.public.marque, 'point marqué');
    const d = this.d;
    this.d = null; this.etat = 'point'; this.echange = 0;
    const x = raison === 'lob' ? d.x : (qui === 'j' ? T.x1 - 40 : T.x0 + 40);
    const y = d.y;
    jouerSon(this, raison === 'lob' ? 'frisbee_sol' : 'frisbee_but');
    if (raison === 'lob') this.explosionSable(x, y, points);
    if (raison === 'but') { flash(this, 0.35, points === 5 ? 0xff3b3b : 0xffd84a); this.cameras.main.shake(220, 0.012); lignesImpact(this, x, y, 0xffffff, 20, 150); }
    const t = texte(this, x + (qui === 'j' ? -60 : 60), y - 40, `+${points}`, 48, points === 5 ? '#ff5a5a' : '#ffd84a', { fontStyle: 'bold' }).setDepth(900).setScale(0.3);
    this.tweens.add({ targets: t, scale: 1, duration: 150, ease: 'Back.Out' });
    this.tweens.add({ targets: t, alpha: 0, y: y - 90, delay: 900, duration: 400, onComplete: () => t.destroy() });
    this.poser(perdant, 'touche', 0.9);
    this.poser(qui === 'j' ? this.j : this.l, 'victoire', 0.9);
    bulleLionel(this, auHasard(qui === 'l' ? REPLIQUES.marque : raison === 'lob' ? REPLIQUES.lobRate : REPLIQUES.encaisse));
    this.majHud();
    this.attendre(R.pauseApresPoint, () => {
      if (this.score[qui] >= R.pointsSet || this.pointEnOr) return this.finSet(qui);
      this.placerPourService(perdant.cote);   // celui qui a encaissé sert
      // petit « Prêt ? » avant de reprendre
      this.etat = 'pret';
      const t = texte(this, LARGEUR / 2, 300, 'Prêt ?', 40, '#ffd84a', { fontStyle: 'bold' }).setDepth(95);
      this.attendre(0.8, () => { t.destroy(); this.etat = 'jeu'; });
    });
  }

  finSet(gagnant) {
    this.etat = 'finSet'; this.d = null;
    this.sets[gagnant]++;
    if (this.surprises) this.surprises.vider();
    if (gagnant === 'l') this.stats.setsPerdus = (this.stats.setsPerdus || 0) + 1;
    this.majHud();
    jouerSon(this, 'frisbee_sifflet');
    const fini = this.sets[gagnant] >= R.setsGagnants;
    this.poser(gagnant === 'j' ? this.j : this.l, 'victoire', 99);
    this.poser(gagnant === 'j' ? this.l : this.j, 'defaite', 99);
    const titre = fini ? (gagnant === 'j' ? 'MATCH GAGNÉ !' : 'MATCH PERDU...') : `SET ${this.numSet} : ${gagnant === 'j' ? 'POUR TOI !' : 'POUR LIONEL'}`;
    encartRapide(this, titre, `${this.score.j} - ${this.score.l}     (sets ${this.sets.j} - ${this.sets.l})`, gagnant === 'j' ? '#7fff7f' : '#ff6b6b', 2.2);
    if (!fini) bulleLionel(this, auHasard(gagnant === 'l' ? REPLIQUES.setGagne : REPLIQUES.setPerdu), 2600);
    this.attendre(2.6, () => {
      if (fini) return this.finMatch(gagnant);
      this.numSet++;
      this.debutSet(gagnant === 'j' ? 'l' : 'j');
    });
  }

  debutSet(serveur = 'j') {
    if (this.surprises) this.surprises.vider();
    this.surprises = new Surprises(this);
    this.score = { j: 0, l: 0 }; this.tempsSet = R.dureeSet; this.pointEnOr = false;
    this.j.poseTemps = 0; this.l.poseTemps = 0;
    this.placerPourService(serveur);
    this.majHud();
    this.etiquettes(ETIQUETTES_JEU);
    this.etat = 'pret';
    encartRapide(this, this.numSet === 3 ? 'SET DÉCISIF !' : `SET ${this.numSet}`, 'Prêt ?... Lancez !', '#ffd84a', 1.3);
    jouerSon(this, 'frisbee_sifflet');
    this.attendre(1.4, () => { this.etat = 'jeu'; });
  }

  placerPourService(serveur) {
    for (const p of [this.j, this.l]) {
      // (le super prêt est GARDÉ : il sert au prochain lancer, même après un point)
      Object.assign(p, { x: MAISON[p.cote], y: MILIEU_Y, vx: 0, vy: 0, glisse: 0, relever: 0, tient: false, tenue: 0, rapideDispo: false, lancerMemorise: null, parfait: false });
    }
    this.ralentiReste = 0; this.gel = 0;
    if (this.finCinematique) { const f = this.finCinematique; this.finCinematique = null; f(); }
    const s = serveur === 'j' ? this.j : this.l;
    s.tient = true; s.tenue = 0;
    this.d = null; this.porteur = s; this.echange = 0; this.trainee = [];
    this.l.plan = null; this.l.nargue = false;
    this.l.tenueVoulue = entre(1.2, 1.6);   // il prend son temps pour servir
  }

  finMatch(gagnant) {
    this.etiquettes(ETIQUETTES_OK);   // (cache aussi le joystick)
    this.etat = 'fin';
    if (gagnant === 'j') this.victoire(this.classement());
    else this.defaite(`Lionel : « ${REPLIQUES.defaite} »\nSets ${this.sets.j} - ${this.sets.l}`);
  }

  cleRecord() { return cleRecord('lionel', this.nomDiff); }

  // Rang S / A / B / C : points encaissés, sets perdus, temps
  classement() {
    let score = 100;
    score -= this.stats.concedes * 0.9;
    score -= (this.stats.setsPerdus || 0) * 15;
    score -= Math.max(0, this.tempsTotal - 70) * 0.12;
    const rang = R.rangs.find(r => score >= r.seuil).rang;
    const complet = this.phase === 'set1';
    const record = complet ? Sauvegarde.proposerRecord(this.cleRecord(), rang, this.tempsTotal, R.rangs.map(r => r.rang)) : Sauvegarde.record(this.cleRecord());
    this.rang = rang;
    // LE BILAN DU COACH : réussites, erreurs + UN conseil pour progresser (et les défis de maîtrise)
    const conseil = (this.stats.setsPerdus || 0) > 0 ? 'Conseil : garde ta position au fond du terrain : un lob mal placé coûte un set.'
      : this.stats.concedes >= 8 ? 'Conseil : rattrape les lobs juste au-dessus du sol = SUPER LANCER.'
      : 'Conseil : relance tout de suite après une réception = lancer PUISSANT, Lionel ne suit plus.';
    return `Lionel est battu !\nRANG ${rang}   -   temps ${formatTemps(this.tempsTotal)}` +
      `\nSets ${this.sets.j} - ${this.sets.l}   points marqués : ${this.stats.marques}   encaissés : ${this.stats.concedes}` +
      (record ? `\nRecord : rang ${record.rang} en ${formatTemps(record.temps)}` : '') +
      (this.stats.supers ? `\nSuper lancers : ${this.stats.supers}` : '') +
      (this.nomDiff !== 'normal' ? `\nMode ${this.diff.nom}` : '') +
      '\n' + lignesDefis('lionel', [
        { id: 'sec', nom: 'Gagner sans perdre un seul set', test: () => (this.stats.setsPerdus || 0) === 0 },
        { id: 'troisSupers', nom: 'Marquer 3 SUPER LANCERS', test: () => this.stats.supers >= 3 },
        { id: 'hermetique', nom: 'Encaisser moins de 8 points', test: () => this.stats.concedes < 8 },
      ]).join('\n') +
      `\n${conseil}`;
  }

  attendre(duree, ensuite) { this.attente = duree; this.apresAttente = ensuite; }

  // =================================================================
  //  ÉCRANS
  // =================================================================
  presentation(ensuite) {
    this.etiquettes(ETIQUETTES_OK);
    const el = [];
    el.push(this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x0b0b14, 0.96).setDepth(100));
    // un peu plus bas et plus petit : sa bulle tient au-dessus de sa tête
    const portrait = this.add.image(LARGEUR + 200, HAUTEUR / 2 + 50, 'lionel_portrait').setDepth(101);
    portrait.setScale(Math.min(430 / portrait.height, 340 / portrait.width));
    portrait.setFlipX(!this.estIllustre('lionel_portrait'));   // le dessin provisoire regarde vers la droite
    this.tweens.add({ targets: portrait, x: LARGEUR - 190, duration: 350, ease: 'Cubic.Out' });
    el.push(portrait);
    const g = this.add.graphics().setDepth(101);
    g.lineStyle(2, 0xffffff, 0.15);
    for (let k = 0; k < 40; k++) { const y = Math.random() * HAUTEUR; g.lineBetween(0, y, 600, y + (Math.random() - 0.5) * 20); }
    el.push(g);
    el.push(texte(this, 300, 90, 'LIONEL', 96, '#ffffff', { fontStyle: 'bold italic', stroke: '#1f9a6a', strokeThickness: 14 }).setDepth(102));
    el.push(texte(this, 300, 175, '« LE CHAMBREUR »', 34, '#c77dff').setDepth(102));
    el.push(texte(this, 300, 300, [
      'Sport : frisbee de plage',
      'Armes secrètes : 3 super lancers',
      'Phrase culte : « Trop facile ! »',
    ].join('\n'), 20, '#dddddd', { lineSpacing: 10 }).setDepth(102));
    el.push(texte(this, 300, 460, (estTactile() ? 'OK' : 'ESPACE') + ' : sur le terrain !', 22, '#7fff7f').setDepth(102));
    const b = bulle(this, LARGEUR - 190, 66, 'Toi ? Contre moi ? Hé hé...', 99999).setDepth(103);
    el.push(b);
    jouerSon(this, 'frisbee_lancer');
    this.time.delayedCall(500, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        el.forEach(e => e.destroy());
        jouerSon(this, 'ui_valider');
        ensuite();
      });
    });
  }

  // vrai si l'image vient d'un fichier (illustration) et pas d'un dessin du code
  estIllustre(cle) {
    this.illustrees = this.illustrees || {};
    if (!(cle in this.illustrees)) {
      const src = this.textures.exists(cle) && this.textures.get(cle).getSourceImage();
      this.illustrees[cle] = !!src && !(src instanceof HTMLCanvasElement);
    }
    return this.illustrees[cle];
  }

  // Écran de victoire : rayons, trophée, Lionel à genoux, badge, rang
  ecranVictoire(message) {
    const P = 1000, cx = LARGEUR / 2;
    jouerSon(this, 'lionel_foule'); jouerSon(this, 'frisbee_sifflet');
    this.add.rectangle(cx, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x0a0614, 0.97).setDepth(P);
    const rayons = this.add.graphics().setDepth(P + 1).setPosition(300, 300);
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      rayons.fillStyle(k % 2 ? 0x7fff9a : 0xc77dff, 0.16).beginPath();
      rayons.moveTo(0, 0); rayons.lineTo(Math.cos(a) * 700, Math.sin(a) * 700); rayons.lineTo(Math.cos(a + 0.17) * 700, Math.sin(a + 0.17) * 700);
      rayons.closePath(); rayons.fillPath();
    }
    this.tweens.add({ targets: rayons, angle: 360, duration: 20000, repeat: -1 });
    const lionel = this.add.image(LARGEUR + 200, HAUTEUR - 30, 'lionel_defaite').setOrigin(0.5, 1).setDepth(P + 2);
    lionel.setScale(330 / lionel.height).setFlipX(!this.estIllustre('lionel_defaite'));
    this.tweens.add({ targets: lionel, x: 760, duration: 500, ease: 'Cubic.Out' });
    const trophee = this.add.image(300, 300, 'lionel_trophee').setDepth(P + 3).setScale(0).setAngle(-30);
    this.tweens.add({ targets: trophee, scale: 1.15, angle: 0, delay: 350, duration: 600, ease: 'Back.Out' });
    this.tweens.add({ targets: trophee, y: 290, delay: 1000, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.time.addEvent({ delay: 180, repeat: -1, callback: () => {
      const e = this.add.star(300 + Phaser.Math.Between(-130, 130), 300 + Phaser.Math.Between(-150, 120), 4, 3, 9, 0xfff3a8).setDepth(P + 4);
      this.tweens.add({ targets: e, scale: 0, angle: 180, duration: 700, onComplete: () => e.destroy() });
    } });
    const titre = texte(this, 300, 70, 'VICTOIRE !!', 64, '#7fff7f', { fontStyle: 'bold italic', stroke: '#1f9a6a', strokeThickness: 12 }).setDepth(P + 5).setScale(3).setAlpha(0);
    this.tweens.add({ targets: titre, scale: 1, alpha: 1, duration: 300, ease: 'Back.Out', onComplete: () => this.cameras.main.shake(200, 0.01) });
    const lignes = message.split('\n');
    const rang = (lignes[1] || '').match(/RANG (\w)/);
    if (rang) {
      const r = texte(this, 140, 440, rang[1], 96, '#ffffff', { fontStyle: 'bold', stroke: '#911eb4', strokeThickness: 12 }).setDepth(P + 5).setScale(0);
      this.tweens.add({ targets: r, scale: 1, delay: 900, duration: 300, ease: 'Back.Out' });
      texte(this, 140, 375, 'RANG', 22, '#ffd84a').setDepth(P + 5);
    }
    texte(this, 300, 135, lignes[0], 22, '#ffffff').setDepth(P + 5);
    texte(this, 380, 440, lignes.slice(1).join('\n').replace(/RANG \w\s+-\s+/, ''), 17, '#ffffff', { align: 'left', lineSpacing: 5 }).setOrigin(0, 0.5).setDepth(P + 5);
    bulle(this, 760, 140, `Lionel : « ${REPLIQUES.victoire} »`, 99999).setDepth(P + 5);
    const badge = this.add.image(140, 210, 'badge_' + this.identite.id).setDepth(P + 5).setScale(0);
    this.tweens.add({ targets: badge, scale: 2, delay: 1200, duration: 300, ease: 'Back.Out' });
    texte(this, 140, 260, 'Badge Lionel !', 18, '#ffd84a').setDepth(P + 5);
    texte(this, LARGEUR / 2, HAUTEUR - 22, `${estTactile() ? 'OK' : 'ESPACE'} : retour au hub`, 18, '#aaaaaa').setDepth(P + 5);
  }

  // =================================================================
  //  AFFICHAGE
  // =================================================================
  // pose forcée pendant un moment (lancer, rattraper, touché...)
  poser(p, pose, duree) { p.pose = pose; p.poseTemps = duree; }

  choisirPose(p) {
    if (p.poseTemps > 0 && p.pose) return p.pose;
    if (p.glisse > 0 || p.relever > 0) return 'plongeon';
    if (p.tient) return p === this.l && p.nargue ? 'nargue' : 'tient';
    if (Math.hypot(p.vx, p.vy) > 20) return 'course';
    return 'garde';
  }

  afficher() {
    for (const p of [this.j, this.l]) {
      let pose = this.choisirPose(p);
      let cle = p.prefixe + '_' + pose;
      // en reculant (vers son propre mur), pas chassé face à l'adversaire s'il existe
      const recul = pose === 'course' && p.vx * p.sens < -40 && this.textures.exists(p.prefixe + '_recul');
      if (recul) cle = p.prefixe + '_recul';
      if (!this.textures.exists(cle)) cle = p.prefixe + '_garde';
      const anim = this.anims.exists(cle) && this.textures.get(cle).frameTotal > 2;
      if (anim) { if (p.sprite.anims.currentAnim?.key !== cle || !p.sprite.anims.isPlaying) p.sprite.play(cle); }
      else if (p.sprite.texture.key !== cle || p.sprite.anims.isPlaying) { p.sprite.stop(); p.sprite.setTexture(cle); }
      // en courant, il regarde dans le sens de sa course
      let versGauche = p === this.l;
      // (en courant, on se tourne dans le sens de la course ; en pas chassé, on reste face à l'adversaire)
      if (pose === 'course' && Math.abs(p.vx) > 40 && !recul) versGauche = p.vx < 0;
      if (pose === 'plongeon' && Math.abs(p.glisseX) > 0.3) versGauche = p.glisseX < 0;
      // les illustrations de Lionel regardent vers la gauche ; les tiennes et les dessins du code vers la droite
      const illustre = this.estIllustre(cle), imageVersDroite = !illustre || p === this.j;
      p.sprite.setFlipX(versGauche === imageVersDroite);
      // une illustration de course n'a qu'une image : on l'anime (foulées, penché en avant, poussière)
      // (avec une vraie planche de course en plusieurs images, l'animation dessinée prend le relais)
      const courseUneImage = illustre && pose === 'course' && this.textures.get(cle).frameTotal <= 2;
      const echelle = illustre ? R.echelleIllustre : 1;
      if (courseUneImage) {
        p.foulee = (p.foulee || 0) + Math.hypot(p.vx, p.vy) / 330 * 0.25;   // avance avec la vitesse
        const f = Math.sin(p.foulee * Math.PI * 2);
        // écrasé au moment où le pied touche le sol, étiré en l'air
        p.sprite.setScale(echelle * (1 + Math.abs(f) * 0.04), echelle * (1 - Math.abs(f) * 0.05 + 0.03));
        // penché dans le sens de la course + petit balancement
        const sens = Math.abs(p.vx) > 40 ? Math.sign(p.vx) : (p === this.l ? -1 : 1);
        p.sprite.setAngle(sens * 6 + f * 2);
        p.sprite.setPosition(p.x, p.y + 6 - Math.abs(f) * 6).setDepth(profondeur(p.y));
        // un petit nuage de sable à chaque pas
        const pas = Math.floor(p.foulee * 2);
        if (pas !== p.dernierPas) {
          p.dernierPas = pas;
          const nuage = this.add.ellipse(p.x - sens * 14, p.y + 4, 16, 7, 0xf3dca0, 0.8).setDepth(profondeur(p.y) - 0.1);
          this.tweens.add({ targets: nuage, scaleX: 2.2, scaleY: 1.6, x: nuage.x - sens * 16, alpha: 0, duration: 380, onComplete: () => nuage.destroy() });
        }
      } else {
        p.sprite.setScale(echelle).setAngle(0);
        p.sprite.setPosition(p.x, p.y + 6).setDepth(profondeur(p.y));
      }
      p.ombre.setPosition(p.x, p.y + 2).setDepth(4);
    }
    // frisbee
    const d = this.d;
    this.graphTrainee.clear();
    if (d) {
      const yAff = d.y - d.z - R.hauteurMain;
      this.disque.setVisible(true).setPosition(d.x, yAff).setDepth(profondeur(d.y) + 0.5).setScale(1 + d.z / 260);
      this.ombreDisque.setVisible(true).setPosition(d.x, d.y + 2).setDepth(4.5).setScale(1 - d.z / 400);
      const rapide = Math.hypot(d.vx, d.vy) > 760 || d.type.startsWith('super');
      if (rapide && this.trainee.length > 1) {
        const superLancer = d.type.startsWith('super');
        const c = d.type === 'superJ' ? 0xff9a3c : superLancer ? 0x3fd07a : 0xffffff;
        this.graphTrainee.setDepth(profondeur(d.y) + 0.4);
        this.trainee.forEach((q, k) => {
          const f = (k + 1) / this.trainee.length;
          // super lancer : un halo large et lumineux autour de la traînée
          if (superLancer) this.graphTrainee.fillStyle(c, f * 0.25).fillCircle(q.x, q.y, 10 + k * 0.8);
          // ta tornade : de vraies flammes (rouge au centre, jaune autour)
          if (d.type === 'superJ') this.graphTrainee.fillStyle(k % 2 ? 0xff3a1a : 0xffd84a, f * 0.5).fillCircle(q.x + (Math.random() - 0.5) * 8, q.y + (Math.random() - 0.5) * 8, 6 + k * 0.9);
          this.graphTrainee.fillStyle(superLancer ? 0xffffff : c, f * (superLancer ? 0.7 : 0.45)).fillCircle(q.x, q.y, (superLancer ? 3 : 4) + k * (superLancer ? 0.4 : 0.9));
        });
        // étincelles qui s'échappent du super lancer
        if (superLancer && this.gel <= 0 && (this.imageEtoile = (this.imageEtoile || 0) + 1) % 3 === 0) {
          const e = this.add.star(d.x, yAff, 4, 2, 6, Math.random() < 0.5 ? c : 0xffffff).setDepth(profondeur(d.y) + 0.6);
          this.tweens.add({ targets: e, x: e.x + (Math.random() - 0.5) * 60, y: e.y + (Math.random() - 0.5) * 60, alpha: 0, scale: 0.2, angle: 180,
            duration: 400, onComplete: () => e.destroy() });
        }
      }
    } else if (this.porteur) {
      const p = this.porteur;
      this.disque.setVisible(true).setPosition(p.x + p.sens * 26, p.y - 62).setDepth(profondeur(p.y) + 0.5).setScale(0.85);
      this.ombreDisque.setVisible(false);
      // pendant qu'il nargue, Lionel fait tourner le frisbee au bout du doigt
      if (p === this.l && p.nargue && this.choisirPose(p) === 'nargue') this.disque.setPosition(p.x - 6, p.y - 132);
      const pose = this.choisirPose(p), illustre = this.estIllustre(p.prefixe + '_' + pose);
      if (p === this.j && illustre) {
        // tes illustrations ont les mains vides : le frisbee est posé dans tes mains
        const sens = p.sprite.flipX ? -1 : 1;
        if (pose === 'plongeon') this.disque.setPosition(p.x + sens * 70, p.y - 40);
        else if (pose === 'tient' || pose === 'rattrape') this.disque.setPosition(p.x + sens * 39, p.y - 82);   // poing avant
        else this.disque.setPosition(p.x + 3, p.y - 72);
      } else if (p === this.l && illustre) {
        const avant = p.sprite.flipX ? 1 : -1;   // ses illustrations regardent vers la gauche
        const [mx, my] = MAINS_LIONEL[pose] || MAINS_LIONEL.tient;
        this.disque.setPosition(p.x + avant * mx, p.y + my);
      } else if (POSES_AVEC_DISQUE.includes(pose)) {
        // ces poses ont déjà le frisbee en main (dessins du code)
        this.disque.setVisible(false);
      }
    } else { this.disque.setVisible(false); this.ombreDisque.setVisible(false); }
    // le faux frisbee du Dédoubleur (pas d'ombre au sol : c'est l'indice pour les malins !)
    if (d && d.fantome) {
      const f = d.fantome;
      this.disqueFantome.setVisible(true).setPosition(f.x, f.y - R.hauteurMain).setDepth(profondeur(f.y) + 0.5);
      this.graphTrainee.fillStyle(0x3fd07a, 0.35).fillCircle(f.x + 10, f.y - R.hauteurMain, 9).fillCircle(f.x + 22, f.y - R.hauteurMain, 6);
    } else this.disqueFantome.setVisible(false);
    this.dessinerReperes();
    this.majChrono();
  }

  // Repères au sol : où tombe le lob (toujours), où arrive le frisbee (aide, sauf en CHAMPION)
  dessinerReperes() {
    const g = this.reperes.clear(), d = this.d;
    // viseur de lob : quand tu tiens le frisbee, où tomberait ton lob (Z) selon les flèches
    if (!d && this.porteur === this.j && this.etat === 'jeu' && !this.j.superPret) {
      const v = this.dirJoueur || { x: 0, y: 0 }, c = this.cibleLob(v.y, v.x);
      const profond = c.points > R.pointsLob, couleur = profond ? 0xffd84a : 0xffffff;
      const pulse = 1 + 0.12 * Math.sin(this.horloge * 8);
      g.fillStyle(couleur, 0.18).fillEllipse(c.x1, c.y1, 50 * pulse, 20 * pulse);
      g.lineStyle(3, couleur, 0.9).strokeEllipse(c.x1, c.y1, 50 * pulse, 20 * pulse);
      g.lineBetween(c.x1 - 14, c.y1, c.x1 + 14, c.y1).lineBetween(c.x1, c.y1 - 7, c.x1, c.y1 + 7);
    }
    if (!d || this.etat !== 'jeu') return;
    if (d.type === 'lob') {
      const k = Math.min(1, d.t / d.lob.duree), r = 34 - 18 * k;
      g.lineStyle(3, 0xffffff, 0.8).strokeEllipse(d.lob.x1, d.lob.y1, r * 2, r * 0.8);
      g.lineStyle(2, d.lob.x1 < T.filet ? 0x7fff7f : 0xc77dff, 0.9).strokeEllipse(d.lob.x1, d.lob.y1, R.lob.attrape * 2, R.lob.attrape * 0.8);
      return;
    }
    // super de Lionel arrêté au filet : une ligne montre où il va repartir (dans toutes les difficultés)
    if (d.arret > 0 && d.apres) {
      const n = Math.hypot(d.apres.vx, d.apres.vy), k = 260 / n;
      g.lineStyle(4, 0x3fd07a, 0.35 + 0.4 * Math.abs(Math.sin(this.horloge * 20)));
      g.lineBetween(d.x, d.y, d.x + d.apres.vx * k, d.y + d.apres.vy * k);
    }
    const aide = this.diff.aides === 'tot' || (this.diff.aides === 'filet' && d.x < T.filet);
    if (aide && (d.vx < 0 || (d.arret > 0 && d.lanceur === 'l')) && d.t > 0.05) {
      // (calcul du trajet refait toutes les 4 images seulement : moins de travail sur téléphone)
      const c = this.cacheAide = this.cacheAide || {};
      if (c.d !== d || c.vx !== Math.sign(d.vx) || ++c.images >= 4) {
        Object.assign(c, { d, vx: Math.sign(d.vx), images: 0, pr: this.prevoir(d, this.j), trajet: this.trajet(d, this.j) });
      }
      const pr = c.pr;
      if (pr) {
        // le trajet du frisbee en pointillés, rebonds compris
        // (pas pendant un super de Lionel : seulement le point d'arrivée, sinon le Dédoubleur ne trompe personne)
        if (!(d.lanceur === 'l' && d.type.startsWith('super'))) {
          g.fillStyle(0xffffff, 0.9);
          (this.cacheAide.trajet || []).forEach((q, k) => { if (k % 2 === 0) g.fillCircle(q.x, q.y, 4); });
        }
        const A = this.diff.attrape;
        // le cercle devient BLEU au moment où il faut appuyer pour un CONTRE PARFAIT
        // (le frisbee est attrapé dès qu'il entre dans ta zone : à A.x pixels devant toi ; ralenti compris)
        const ralenti = this.diff.ralenti < 1 ? this.diff.ralenti : 1;
        const tArrivee = d.vx < 0 ? (d.x - this.j.x - A.x) / (-d.vx * ralenti) : 9;
        const bleu = tArrivee <= (this.diff.fenetreParfait || R.parfait.fenetre) + 0.04 && Math.hypot(pr.x - this.j.x, pr.y - this.j.y) < 70;
        const c = bleu ? 0x5ad1ff : 0x7fff7f;
        g.fillStyle(c, bleu ? 0.4 : 0.18).fillEllipse(pr.x, pr.y, A.x * 2, 28);
        g.lineStyle(bleu ? 6 : 4, c, 0.95).strokeEllipse(pr.x, pr.y, A.x * 2, 28);
        // Dédoubleur : un 2e cercle (pointillé) pour le faux frisbee, jusqu'au « POF »
        if (d.fantome) {
          const f = d.fantome, t = (f.x - this.j.x) / -f.vx;
          let y = f.y + f.vy * Math.max(0, t);
          const h = T.y1 - T.y0 - 2 * R.rayonDisque, u = (((y - T.y0 - R.rayonDisque) % (2 * h)) + 2 * h) % (2 * h);
          y = T.y0 + R.rayonDisque + (u > h ? 2 * h - u : u);
          g.lineStyle(3, 0x7fff7f, 0.6).strokeEllipse(this.j.x, y, A.x * 2, 28);
        }
      }
    }
  }

  // =================================================================
  //  SCÈNE DU SUPER LANCER : le jeu se fige, fond sombre, lignes de vitesse qui tournent,
  //  le lanceur en grand avec ses images rémanentes, gros titre, zoom, puis onde de choc.
  // =================================================================
  cinematiqueSuper(p, nom, sousTitre, couleur, couleurTexte) {
    const P = 95, cx = LARGEUR / 2, cy = HAUTEUR / 2, el = [], gauche = p === this.j;
    const cam = this.cameras.main;
    jouerSon(this, 'frisbee_super');
    flash(this, 0.7, 0xffffff);
    // fond sombre + lignes de vitesse qui tournent autour du centre
    const fond = this.add.rectangle(cx, cy, LARGEUR, HAUTEUR, 0x05030c, 0).setDepth(P);
    this.tweens.add({ targets: fond, fillAlpha: 0.82, duration: 120 });
    const lignes = this.add.graphics().setDepth(P + 1).setPosition(gauche ? 300 : 660, cy);
    for (let k = 0; k < 44; k++) {
      const a = (k / 44) * Math.PI * 2 + Math.random() * 0.1, r1 = 90 + Math.random() * 80;
      lignes.lineStyle(2 + Math.random() * 4, k % 3 ? couleur : 0xffffff, 0.35 + Math.random() * 0.4);
      lignes.lineBetween(Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a) * 900, Math.sin(a) * 900);
    }
    this.tweens.add({ targets: lignes, angle: gauche ? 40 : -40, duration: DUREE_CINEMATIQUE * 1000 });
    // halo coloré derrière le personnage
    const halo = this.add.circle(gauche ? 300 : 660, cy + 20, 150, couleur, 0.35).setDepth(P + 2).setScale(0.2);
    this.tweens.add({ targets: halo, scale: 1.3, alpha: 0.15, duration: 500, ease: 'Cubic.Out' });
    el.push(fond, lignes, halo);
    // le lanceur en grand (pose de super), qui arrive de son côté avec des images rémanentes
    const cle = this.textures.exists(p.prefixe + '_super') ? p.prefixe + '_super' : p.prefixe + '_lance';
    const illustre = this.estIllustre(cle), imageVersDroite = !illustre || p === this.j;
    const xFin = gauche ? 300 : 660, xDebut = gauche ? -250 : LARGEUR + 250;
    const perso = this.add.image(xDebut, HAUTEUR + 10, cle).setOrigin(0.5, 1).setDepth(P + 4);
    perso.setScale(430 / perso.height).setFlipX(gauche ? !imageVersDroite : imageVersDroite);
    this.tweens.add({ targets: perso, x: xFin, duration: 260, ease: 'Cubic.Out' });
    for (let k = 1; k <= 3; k++) {
      const fantome = this.add.image(xDebut, HAUTEUR + 10, cle).setOrigin(0.5, 1).setDepth(P + 3)
        .setScale(perso.scale).setFlipX(perso.flipX).setTint(couleur).setAlpha(0.5 - k * 0.12);
      this.tweens.add({ targets: fantome, x: xFin - (gauche ? 1 : -1) * k * 45, duration: 260 + k * 60, ease: 'Cubic.Out' });
      el.push(fantome);
    }
    el.push(perso);
    // étincelles qui jaillissent
    for (let k = 0; k < 26; k++) {
      const e = this.add.star(xFin, cy, 4, 3, 9, k % 2 ? couleur : 0xffffff).setDepth(P + 5).setScale(0.4 + Math.random());
      const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 260;
      this.tweens.add({ targets: e, x: xFin + Math.cos(a) * d, y: cy + Math.sin(a) * d, angle: 360, alpha: 0,
        delay: 150 + Math.random() * 300, duration: 700 + Math.random() * 400, onComplete: () => e.destroy() });
    }
    // gros titre qui claque, puis le sous-titre
    const xt = gauche ? 640 : 320;
    const titre = this.add.text(xt, cy - 40, nom + ' !!', {
      fontFamily: 'monospace', fontStyle: 'bold italic', fontSize: '50px', color: couleurTexte, align: 'center',
      stroke: '#000000', strokeThickness: 11, wordWrap: { width: 540 },
    }).setOrigin(0.5).setDepth(P + 6).setScale(3).setAlpha(0).setAngle(-6);
    this.tweens.add({ targets: titre, scale: 1, alpha: 1, delay: 220, duration: 200, ease: 'Back.Out',
      onComplete: () => cam.shake(220, 0.014) });
    const sous = texte(this, xt, cy + 45, sousTitre, 22, '#ffffff').setDepth(P + 6).setAlpha(0);
    this.tweens.add({ targets: sous, alpha: 1, delay: 450, duration: 200 });
    el.push(titre, sous);
    // petit zoom de caméra
    cam.zoomTo(1.08, 300, 'Sine.easeOut');
    // fin : onde de choc depuis le lanceur, puis tout disparaît et le frisbee part
    this.finCinematique = () => {
      cam.zoomTo(1, 200, 'Sine.easeIn');
      el.forEach(o => this.tweens.add({ targets: o, alpha: 0, duration: 200, onComplete: () => o.destroy() }));
      const onde = this.add.circle(p.x, p.y - 40, 30).setStrokeStyle(8, couleur, 1).setDepth(P - 1);
      this.tweens.add({ targets: onde, scale: 7, alpha: 0, duration: 450, ease: 'Cubic.Out', onComplete: () => onde.destroy() });
      flash(this, 0.5, couleur);
      cam.shake(250, 0.012);
    };
  }

  // Bandes de but le long des murs (jaune = 3 points, rouge = 5 points au milieu)
  dessinerButs() {
    const g = this.add.graphics().setDepth(5);
    for (const x of [T.x0, T.x1]) {
      const sens = x === T.x0 ? 1 : -1;
      for (const [ya, yb, c, pts] of [[T.y0, ZONE5[0], 0xffd84a, 3], [ZONE5[0], ZONE5[1], 0xe6303a, 5], [ZONE5[1], T.y1, 0xffd84a, 3]]) {
        g.fillStyle(c, 0.55).fillRect(sens > 0 ? x : x - 10, ya + 2, 10, yb - ya - 4);
        texte(this, x + sens * 22, (ya + yb) / 2, String(pts), 20, pts === 5 ? '#ff5a5a' : '#ffd84a', { fontStyle: 'bold' }).setDepth(5).setAlpha(0.85);
      }
    }
  }

  creerHud() {
    const P = 90;   // sous les écrans d'intro (100) mais au-dessus du jeu
    this.hudFond = this.add.rectangle(LARGEUR / 2, 30, 560, 54, 0x000000, 0.55).setDepth(P).setStrokeStyle(2, 0xffffff, 0.3);
    this.hudEtiquettes = [texte(this, 260, 18, 'TOI', 16, '#7fd0ff').setDepth(P + 1), texte(this, 700, 18, 'LIONEL', 16, '#7fff9a').setDepth(P + 1)];
    this.hudScoreJ = texte(this, 260, 42, '0', 28, '#ffffff', { fontStyle: 'bold' }).setDepth(P + 1);
    this.hudScoreL = texte(this, 700, 42, '0', 28, '#ffffff', { fontStyle: 'bold' }).setDepth(P + 1);
    this.hudChrono = texte(this, LARGEUR / 2, 38, '45', 30, '#ffd84a', { fontStyle: 'bold' }).setDepth(P + 1);
    this.hudSet = texte(this, LARGEUR / 2, 12, 'SET 1', 13, '#dddddd').setDepth(P + 1);
    this.hudSets = this.add.graphics().setDepth(P + 1);
    // jauge du public (sous ton score)
    this.hudPublicTexte = texte(this, 226, 72, 'PUBLIC', 14, '#ffb070', { fontStyle: 'bold' }).setDepth(P + 1);
    this.hudPublicTexteL = texte(this, 734, 72, 'PUBLIC', 14, '#a8ffc0', { fontStyle: 'bold' }).setDepth(P + 1);
    this.hudPublic = this.add.graphics().setDepth(P + 1);
    // message au-dessus de ta tête (SUPER PRÊT, lance !)
    this.hudSuper = texte(this, 0, 0, '', 18, '#7fff7f', { fontStyle: 'bold', backgroundColor: '#000000cc', padding: { x: 8, y: 4 } }).setDepth(P + 1);
    this.majHud();
  }

  majHud() {
    this.majJauge();
    if (!this.hudScoreJ) return;
    this.hudScoreJ.setText(String(this.score.j));
    this.hudScoreL.setText(String(this.score.l));
    this.hudSet.setText(this.numSet === 3 ? 'SET DÉCISIF' : `SET ${this.numSet}`);
    const g = this.hudSets.clear();
    for (let k = 0; k < R.setsGagnants; k++) {
      for (const [x0, cote, c] of [[310, 'j', 0x7fd0ff], [650, 'l', 0x7fff9a]]) {
        const x = x0 + (cote === 'j' ? k * 18 : -k * 18);
        g.lineStyle(2, 0xffffff, 0.8).strokeCircle(x, 42, 6);
        if (this.sets[cote] > k) g.fillStyle(c, 1).fillCircle(x, 42, 5);
      }
    }
  }

  majJauge() {
    if (!this.hudPublic) return;
    const g = this.hudPublic.clear(), l = 180, y = 64;
    // ta jauge à gauche (orange), celle de Lionel à droite (verte, qui se remplit vers la gauche)
    for (const [cote, x, couleurs] of [['j', 262, [0xff9a3c, 0xff5a2a]], ['l', LARGEUR - 262 - l, [0x3fd07a, 0x1fae5a]]]) {
      const k = this.public[cote] / R.public.max;
      const presque = k >= 0.75 && Math.sin(this.horloge * 12) > 0;   // presque pleine : elle clignote
      g.fillStyle(0x000000, 0.6).fillRoundedRect(x - 3, y - 3, l + 6, 22, 8);
      if (k > 0) {
        const largeur = Math.max(10, l * k);
        g.fillStyle(presque ? 0xffe14a : k > 0.75 ? couleurs[1] : couleurs[0], 1).fillRoundedRect(cote === 'j' ? x : x + l - largeur, y, largeur, 16, 6);
      }
      g.lineStyle(2, presque ? 0xffe14a : 0xffffff, 0.8).strokeRoundedRect(x - 3, y - 3, l + 6, 22, 8);
    }
  }

  majChrono() {
    if (!this.hudChrono) return;
    if (Math.max(this.public.j, this.public.l) / R.public.max >= 0.75) this.majJauge();
    // (on ne redessine un texte que s'il change : sinon, sur téléphone, ça coûte à chaque image)
    const chrono = this.pointEnOr ? 'OR' : String(Math.ceil(this.tempsSet));
    if (this.hudChrono.text !== chrono) this.hudChrono.setText(chrono).setColor(this.tempsSet <= 10 && !this.pointEnOr ? '#ff6b6b' : '#ffd84a');
    const j = this.j, bouton = estTactile() ? 'Lancer' : 'ESPACE';
    let msg = '';
    if (this.d && this.d.type === 'superJ' && this.etat === 'jeu' && this.gel <= 0) msg = '▲ ▼ : guide ta tornade !';
    else if (j.superPret) msg = `SUPER PRÊT !  ${bouton}`;
    else if (j.tient && j.tenue > 0.8 && this.etat === 'jeu') msg = `${bouton} : lance !`;
    if (this.hudSuper.text !== msg) this.hudSuper.setText(msg).setColor(j.superPret ? '#7fff7f' : '#ffd84a');
    const enHaut = j.y - 160 < 90;   // joueur en haut du terrain : message sous lui, HUD transparent
    this.hudSuper.setVisible(!!msg).setPosition(borne(j.x, 120, LARGEUR - 120), enHaut ? j.y + 30 : j.y - 160);
    const alpha = j.y < T.y0 + 70 ? 0.4 : 1;
    if (this.hudFond && this.hudFond.alpha !== alpha) {
      for (const o of [this.hudFond, this.hudScoreJ, this.hudScoreL, this.hudChrono, this.hudSet, this.hudSets, this.hudPublic, this.hudPublicTexte, this.hudPublicTexteL, ...(this.hudEtiquettes || [])]) o.setAlpha(alpha);
      if (this.tuto) this.tuto.banniere.setAlpha(alpha);
    }
  }
}

// Bulle de Lionel au-dessus de sa tête (une seule à la fois)
function bulleLionel(scene, message, duree = 1300) {
  const p = scene.l;
  if (p.bulle && p.bulle.active) p.bulle.destroy();
  p.bulle = bulle(scene, borne(p.x, 620, LARGEUR - 175), Math.max(150, p.y - 140), 'Lionel : « ' + message + ' »', duree).setDepth(950);
}

// Bandeau rapide au milieu de l'écran (se ferme tout seul)
function encartRapide(scene, titre, sousTitre, couleur, duree = 0.9) {
  const e = encart(scene, titre, sousTitre, couleur);
  scene.time.delayedCall(duree * 1000, () => e.fermer());
}
