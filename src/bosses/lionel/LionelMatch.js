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
import { texte, voile } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { annoncer, taireAnnonceur } from '../../core/annonceur.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { onomatopee, flash, encart, bulle, lignesImpact } from '../../core/effets.js';
import { estTactile, etiquettesTactiles, modeJoystick, placerBoutonPause } from '../../core/tactile.js';
import { Sauvegarde, formatTemps } from '../../core/sauvegarde.js';
import { choisirDifficulte, cleRecord } from '../../core/difficulte.js';
import { IDENTITE, TERRAIN as T, DIFFICULTES, REGLAGES as R, REPLIQUES } from './reglages.js';
import { ETAPES, VITESSE_ENTRAINEMENT } from './entrainement.js';

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
const POSES_AVEC_DISQUE = ['tient', 'nargue', 'rattrape'];

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
    // zigzag : monte et descend en dents de scie
    d.vy = d.zig.amplitude * (Math.floor(d.t / d.zig.periode) % 2 ? 1 : -1);
  } else d.vy += d.ay * dt;
  d.x += d.vx * dt; d.y += d.vy * dt;
  const r = R.rayonDisque;
  if (d.y < T.y0 + r) { d.y = 2 * (T.y0 + r) - d.y; d.vy = -d.vy; d.ay = -d.ay; if (d.zig) d.zig.amplitude *= -1; ev = 'rebond'; }
  if (d.y > T.y1 - r) { d.y = 2 * (T.y1 - r) - d.y; d.vy = -d.vy; d.ay = -d.ay; if (d.zig) d.zig.amplitude *= -1; ev = 'rebond'; }
  // super de Lionel : s'arrête juste avant le filet (de son côté), puis repart en flèche
  if (d.type === 'superL' && !d.arrete && d.x <= T.filet + 34) { d.arrete = true; d.arret = d.arretDuree; d.vx = 0; d.vy = 0; }
  if (d.x <= T.x0 + r) return 'butG';
  if (d.x >= T.x1 - r) return 'butD';
  return ev;
}

function copieDisque(d) {
  return { ...d, lob: d.lob && { ...d.lob }, zig: d.zig && { ...d.zig }, apres: d.apres && { ...d.apres } };
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

    this.add.image(0, 0, 'lionel_terrain').setOrigin(0);

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
    this.ombreDisque = this.add.ellipse(0, 0, 26, 9, 0x000000, 0.3);
    this.graphTrainee = this.add.graphics();
    this.reperes = this.add.graphics().setDepth(5);   // où tombe le lob, où arrive le frisbee (aide)

    this.creerHud();
    this.touches = creerTouches(this);
    this.events.once('shutdown', () => taireAnnonceur());
    // sur téléphone : joystick qui suit le pouce et pause en haut à droite, SEULEMENT pendant ce match
    // (le hub, Greg et les autres boss gardent la croix et la pause au milieu)
    modeJoystick(true); placerBoutonPause('droite');
    this.events.once('shutdown', () => { modeJoystick(false); placerBoutonPause('centre'); });
    // ambiance du public de la plage
    if (this.cache.audio.exists('greg_ambiance')) {
      this.ambiance = this.sound.add('greg_ambiance', { loop: true, volume: 0.18 });
      this.ambiance.play();
      this.events.on('pause', () => this.ambiance.pause());
      this.events.on('resume', () => this.ambiance.resume());
      this.events.once('shutdown', () => { this.ambiance.stop(); this.ambiance.destroy(); });
    }
    this.events.on('resume', () => { this.lireTouches(); this.memoire = {}; });

    this.placerPourService('j');
    this.afficher();

    etiquettesTactiles(ETIQUETTES_OK);
    const tactile = estTactile();
    this.afficherIntro('LIONEL - Le Chambreur', [
      'BUT : vise le mur derrière Lionel (jaune = 3 points, rouge = 5)',
      'Flèches : cours vers le cercle vert (suis les points blancs !)',
      (tactile ? 'Lancer' : 'ESPACE') + ' : lancer (maintiens ▲ ou ▼ pour lancer en biais)',
      (tactile ? 'Lob' : 'Z') + ' : lob (2 points s\'il tombe dans le sable : une bonne arme !)',
      'Attrape un lob juste en dessous = SUPER LANCER !',
      (tactile ? 'Lancer' : 'ESPACE') + ' en courant vers le frisbee = plongeon',
    ], () => this.presentation(() => choisirDifficulte(this, 'lionel', DIFFICULTES, (nom, diff) => {
      this.nomDiff = nom; this.diff = diff; this.demarrerMatch();
    }, 'frisbee_rebond')));
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
      banniere: texte(this, LARGEUR / 2, 150, '', 20, '#ffffff', { backgroundColor: '#000000cc', padding: { x: 12, y: 6 } }).setDepth(92),
      // sur téléphone, le bouton « Passer » suffit
      passer: texte(this, LARGEUR - 12, HAUTEUR - 14, tactile ? '' : 'X : passer l\'entraînement', 14, '#aaaaaa')
        .setOrigin(1, 1).setDepth(92),
    };
    etiquettesTactiles({ ...ETIQUETTES_JEU, x: 'Passer' });
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
  actionTuto(action, type) {
    const tu = this.tuto;
    if (!tu || tu.enAttente) return;
    const but = ETAPES[tu.etape].but;
    if (action === 'attrape') {
      if (but === 'attrape' || (but === 'attrapeLob' && type)) { this.etat = 'pret'; this.reussiTuto(0.7); }
      return;
    }
    // un lancer
    const ok = (but === 'lance' && (type === 'droit' || type === 'biais')) || but === type;
    if (ok) this.reussiTuto(0.9);
    else if (['lance', 'biais', 'super', 'lob'].includes(but)) this.rateTuto('Presque ! Regarde bien la consigne et réessaie.');
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
      if (this.gel > 0) this.gel -= dt;
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

  // appui fait il y a moins de 0,15 s (on le "consomme")
  aAppuye(k) {
    if (this.memoire[k] !== undefined && this.horloge - this.memoire[k] <= 0.15) { delete this.memoire[k]; return true; }
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
        annoncer('Point en or !');
        this.gel = 1.2;
        return;
      }
    }
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
    const dirY = (e.haut ? -1 : 0) + (e.bas ? 1 : 0), dirX = (e.gauche ? -1 : 0) + (e.droite ? 1 : 0);
    if (p.tient) {
      if (p.tenue < R.ralentiTenue) return;
      // appui fait juste AVANT d'attraper : relancé tout droit (les flèches tenues en courant ne comptent pas)
      if (p.lancerMemorise) {
        const k = p.lancerMemorise; p.lancerMemorise = null;
        return this.lancer(p, k === 'z' ? 'lob' : (p.superPret ? 'super' : 'droit'), 0);
      }
      if (this.aAppuye('espace')) return this.lancer(p, p.superPret ? 'super' : (dirY ? 'biais' : 'droit'), dirY);
      if (this.aAppuye('z')) return this.lancer(p, 'lob', dirY);
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
        p.plan = { reaction: D.reaction * entre(0.8, 1.2), erreur: entre(-1, 1) * D.erreur * vite * vite };
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
    if (p.superPret || (this.numSet >= 2 && Math.random() < D.superHasard)) return this.lancer(p, 'super', dir);
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

  lancer(p, type, dir) {
    const autre = p === this.j ? this.l : this.j;
    let v = this.vitesseDeBase();
    if (p === this.l) v *= this.diff.disque * (this.tuto ? VITESSE_ENTRAINEMENT : 1);
    // lancer PUISSANT : relancé tout de suite après avoir attrapé
    const puissant = p.rapideDispo && p.tenue <= R.rapide.fenetre && type !== 'lob' && type !== 'super';
    if (puissant) {
      v *= R.rapide.bonus;
      onomatopee(this, p.x + p.sens * 40, p.y - 120, 'PUISSANT !', 26, '#ff8a3d');
      if (p === this.j) this.stats.puissants++;
    }
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
      d.lob = { x0, y0, x1: xMoitie + entre(-50, 50), y1: ty + entre(-15, 15), duree: R.lob.duree, hauteur: R.lob.hauteur };
      if (p === this.l) bulleLionel(this, auHasard(REPLIQUES.lob));
    } else if (type === 'super') {
      jouerSon(this, 'frisbee_super');
      flash(this, 0.5, p === this.j ? 0x7fff9a : 0xc77dff);
      this.cameras.main.shake(250, 0.01);
      if (p === this.j) {
        const S = R.superJoueur;
        d.type = 'superJ'; d.vx = p.sens * v * S.vitesse;
        d.zig = { periode: S.zigzag, amplitude: S.amplitude * (dir || 1) };
        encartRapide(this, S.nom + ' !!', 'Ton super lancer !', '#7fff7f');
        this.stats.supers++;
      } else {
        const S = R.superLionel;
        d.type = 'superL'; d.vx = p.sens * v * 1.2; d.arretDuree = S.arret;
        // il repart vers le coin le plus loin de toi, dans la zone à 3 points
        const ty = this.j.y < MILIEU_Y ? T.y1 - 30 : T.y0 + 30, tx = T.x0;
        const dx = tx - (T.filet + 34), dy = ty - y0, n = Math.hypot(dx, dy);
        d.apres = { vx: dx / n * v * S.vitesse, vy: dy / n * v * S.vitesse };
        encartRapide(this, S.nom + ' !!', auHasard(REPLIQUES.super), '#c77dff');
        annoncer('Le chambreur !');
      }
      p.superPret = false;
      this.gel = 0.7;
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
    if (this.d) {
      this.trainee.push({ x: d.x, y: d.y - d.z - R.hauteurMain });
      if (this.trainee.length > 10) this.trainee.shift();
    }
  }

  pasDisque(d, dt) {
    const ev = avancerDisque(d, dt);
    if (ev === 'rebond') jouerSon(this, 'frisbee_rebond', { volume: 0.7 });
    if (ev === 'relance') { jouerSon(this, 'frisbee_super'); lignesImpact(this, d.x, d.y - R.hauteurMain, 0xc77dff, 14, 120); }

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
    if (ev === 'sol') return this.marquer(d.lanceur, R.pointsLob, 'lob');
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
      jouerSon(this, 'frisbee_super', { volume: 0.5 });
    }
    if (p === this.l) {
      p.plan = null;
      const [a, b] = R.ia.tenue;
      p.nargue = !sousLeLob && !this.tuto && Math.random() < R.ia.nargue;
      p.tenueVoulue = p.nargue ? R.ia.tenueNargue : entre(a, b) + (plongeon ? 0.2 : 0);
      if (p.nargue) bulleLionel(this, auHasard(REPLIQUES.nargue));
    } else {
      // appui fait juste avant d'attraper : on le garde pour relancer aussitôt (PUISSANT)
      p.lancerMemorise = this.aAppuye('z') ? 'z' : this.aAppuye('espace') ? 'espace' : null;
      this.actionTuto('attrape', sousLeLob);
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
    const d = this.d;
    this.d = null; this.etat = 'point'; this.echange = 0;
    const x = raison === 'lob' ? d.x : (qui === 'j' ? T.x1 - 40 : T.x0 + 40);
    const y = d.y;
    jouerSon(this, raison === 'lob' ? 'frisbee_sol' : 'frisbee_but');
    if (raison === 'but') { flash(this, 0.35, points === 5 ? 0xff3b3b : 0xffd84a); this.cameras.main.shake(220, 0.012); lignesImpact(this, x, y, 0xffffff, 20, 150); }
    const t = texte(this, x + (qui === 'j' ? -60 : 60), y - 40, `+${points}`, 48, points === 5 ? '#ff5a5a' : '#ffd84a', { fontStyle: 'bold' }).setDepth(900).setScale(0.3);
    this.tweens.add({ targets: t, scale: 1, duration: 150, ease: 'Back.Out' });
    this.tweens.add({ targets: t, alpha: 0, y: y - 90, delay: 900, duration: 400, onComplete: () => t.destroy() });
    annoncer(points === 5 ? 'Cinq points !' : points === 3 ? 'Trois points !' : 'Deux points !');
    this.poser(perdant, 'touche', 0.9);
    this.poser(qui === 'j' ? this.j : this.l, 'victoire', 0.9);
    bulleLionel(this, auHasard(qui === 'l' ? REPLIQUES.marque : REPLIQUES.encaisse));
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
    if (gagnant === 'l') this.stats.setsPerdus = (this.stats.setsPerdus || 0) + 1;
    this.majHud();
    jouerSon(this, 'frisbee_sifflet');
    const fini = this.sets[gagnant] >= R.setsGagnants;
    annoncer(fini ? 'Match !' : 'Set !');
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
    this.score = { j: 0, l: 0 }; this.tempsSet = R.dureeSet; this.pointEnOr = false;
    this.j.poseTemps = 0; this.l.poseTemps = 0;
    this.placerPourService(serveur);
    this.majHud();
    etiquettesTactiles(ETIQUETTES_JEU);
    this.etat = 'pret';
    encartRapide(this, this.numSet === 3 ? 'SET DÉCISIF !' : `SET ${this.numSet}`, 'Prêt ?... Lancez !', '#ffd84a', 1.3);
    annoncer('Prêt ? Lancez !');
    jouerSon(this, 'frisbee_sifflet');
    this.attendre(1.4, () => { this.etat = 'jeu'; });
  }

  placerPourService(serveur) {
    for (const p of [this.j, this.l]) {
      Object.assign(p, { x: MAISON[p.cote], y: MILIEU_Y, vx: 0, vy: 0, glisse: 0, relever: 0, tient: false, tenue: 0, superPret: false, rapideDispo: false, lancerMemorise: null });
    }
    const s = serveur === 'j' ? this.j : this.l;
    s.tient = true; s.tenue = 0;
    this.d = null; this.porteur = s; this.echange = 0; this.trainee = [];
    this.l.plan = null; this.l.nargue = false;
    this.l.tenueVoulue = entre(1.2, 1.6);   // il prend son temps pour servir
  }

  finMatch(gagnant) {
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
    return `Lionel est battu !\nRANG ${rang}   -   temps ${formatTemps(this.tempsTotal)}` +
      `\nSets ${this.sets.j} - ${this.sets.l}   points encaissés : ${this.stats.concedes}` +
      (record ? `\nRecord : rang ${record.rang} en ${formatTemps(record.temps)}` : '') +
      (this.stats.supers ? `\nSuper lancers : ${this.stats.supers}` : '') +
      (this.nomDiff !== 'normal' ? `\nMode ${this.diff.nom}` : '');
  }

  attendre(duree, ensuite) { this.attente = duree; this.apresAttente = ensuite; }

  // =================================================================
  //  ÉCRANS
  // =================================================================
  presentation(ensuite) {
    etiquettesTactiles(ETIQUETTES_OK);
    const el = [];
    el.push(this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x0b0b14, 0.96).setDepth(100));
    const portrait = this.add.image(LARGEUR + 200, HAUTEUR / 2 + 10, 'lionel_portrait').setDepth(101);
    portrait.setScale(Math.min(500 / portrait.height, 340 / portrait.width));
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
      'Arme secrète : LE CHAMBREUR (super lancer)',
      'Signe distinctif : le maillot n°93',
      'Phrase culte : « Trop facile ! »',
    ].join('\n'), 20, '#dddddd', { lineSpacing: 10 }).setDepth(102));
    el.push(texte(this, 300, 460, (estTactile() ? 'OK' : 'ESPACE') + ' : sur le terrain !', 22, '#7fff7f').setDepth(102));
    const b = bulle(this, LARGEUR - 190, 70, 'Toi ? Contre moi ? Hé hé...', 99999).setDepth(103);
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
    taireAnnonceur();
    jouerSon(this, 'greg_foule'); jouerSon(this, 'frisbee_sifflet');
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
    const trophee = this.add.image(300, 300, 'trophee').setDepth(P + 3).setScale(0).setAngle(-30);
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
      if (!this.textures.exists(cle)) cle = p.prefixe + '_garde';
      const anim = this.anims.exists(cle) && this.textures.get(cle).frameTotal > 2;
      if (anim) { if (p.sprite.anims.currentAnim?.key !== cle || !p.sprite.anims.isPlaying) p.sprite.play(cle); }
      else if (p.sprite.texture.key !== cle || p.sprite.anims.isPlaying) { p.sprite.stop(); p.sprite.setTexture(cle); }
      // en courant, il regarde dans le sens de sa course
      let versGauche = p === this.l;
      if (pose === 'course' && Math.abs(p.vx) > 40) versGauche = p.vx < 0;
      if (pose === 'plongeon' && Math.abs(p.glisseX) > 0.3) versGauche = p.glisseX < 0;
      // les illustrations de Lionel regardent vers la gauche ; les tiennes et les dessins du code vers la droite
      const illustre = this.estIllustre(cle), imageVersDroite = !illustre || p === this.j;
      p.sprite.setFlipX(versGauche === imageVersDroite);
      p.sprite.setScale(illustre ? R.echelleIllustre : 1);
      // une illustration de course n'a qu'une image : petits bonds pour l'animer
      const bond = illustre && pose === 'course' ? -Math.abs(Math.sin(this.horloge * 14)) * 5 : 0;
      p.sprite.setAngle(illustre && pose === 'course' ? Math.sin(this.horloge * 14) * 3 : 0);
      p.sprite.setPosition(p.x, p.y + 6 + bond).setDepth(profondeur(p.y));
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
        const c = d.type === 'superJ' ? 0x7fff9a : d.type === 'superL' ? 0xc77dff : 0xffffff;
        this.graphTrainee.setDepth(profondeur(d.y) + 0.4);
        this.trainee.forEach((q, k) => this.graphTrainee.fillStyle(c, (k + 1) / this.trainee.length * 0.45).fillCircle(q.x, q.y, 4 + k * 0.9));
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
        if (pose === 'plongeon') this.disque.setPosition(p.x + (p.sprite.flipX ? -1 : 1) * 70, p.y - 40);
        else this.disque.setPosition(p.x + 3, p.y - 72);
      } else if (POSES_AVEC_DISQUE.includes(pose) || (pose === 'plongeon' && illustre)) {
        // ces poses ont déjà le frisbee en main (dessins du code, illustrations de Lionel)
        this.disque.setVisible(false);
      }
    } else { this.disque.setVisible(false); this.ombreDisque.setVisible(false); }
    this.dessinerReperes();
    this.majChrono();
  }

  // Repères au sol : où tombe le lob (toujours), où arrive le frisbee (aide, sauf en CHAMPION)
  dessinerReperes() {
    const g = this.reperes.clear(), d = this.d;
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
      g.lineStyle(4, 0xc77dff, 0.35 + 0.4 * Math.abs(Math.sin(this.horloge * 20)));
      g.lineBetween(d.x, d.y, d.x + d.apres.vx * k, d.y + d.apres.vy * k);
    }
    const aide = this.diff.aides === 'tot' || (this.diff.aides === 'filet' && d.x < T.filet);
    if (aide && (d.vx < 0 || (d.arret > 0 && d.lanceur === 'l')) && d.t > 0.05) {
      const pr = this.prevoir(d, this.j);
      if (pr) {
        // le trajet du frisbee en pointillés, rebonds compris
        g.fillStyle(0xffffff, 0.9);
        this.trajet(d, this.j).forEach((q, k) => { if (k % 2 === 0) g.fillCircle(q.x, q.y, 4); });
        const A = this.diff.attrape;
        g.fillStyle(0x7fff7f, 0.18).fillEllipse(pr.x, pr.y, A.x * 2, 28);
        g.lineStyle(4, 0x7fff7f, 0.9).strokeEllipse(pr.x, pr.y, A.x * 2, 28);
      }
    }
  }

  creerHud() {
    const P = 90;   // sous les écrans d'intro (100) mais au-dessus du jeu
    this.add.rectangle(LARGEUR / 2, 30, 560, 54, 0x000000, 0.55).setDepth(P).setStrokeStyle(2, 0xffffff, 0.3);
    texte(this, 260, 18, 'TOI', 16, '#7fd0ff').setDepth(P + 1);
    texte(this, 700, 18, 'LIONEL', 16, '#7fff9a').setDepth(P + 1);
    this.hudScoreJ = texte(this, 260, 42, '0', 28, '#ffffff', { fontStyle: 'bold' }).setDepth(P + 1);
    this.hudScoreL = texte(this, 700, 42, '0', 28, '#ffffff', { fontStyle: 'bold' }).setDepth(P + 1);
    this.hudChrono = texte(this, LARGEUR / 2, 38, '45', 30, '#ffd84a', { fontStyle: 'bold' }).setDepth(P + 1);
    this.hudSet = texte(this, LARGEUR / 2, 12, 'SET 1', 13, '#dddddd').setDepth(P + 1);
    this.hudSets = this.add.graphics().setDepth(P + 1);
    // message au-dessus de ta tête (SUPER PRÊT, lance !)
    this.hudSuper = texte(this, 0, 0, '', 18, '#7fff7f', { fontStyle: 'bold', backgroundColor: '#000000cc', padding: { x: 8, y: 4 } }).setDepth(P + 1);
    this.majHud();
  }

  majHud() {
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

  majChrono() {
    if (!this.hudChrono) return;
    this.hudChrono.setText(this.pointEnOr ? 'OR' : String(Math.ceil(this.tempsSet)));
    this.hudChrono.setColor(this.tempsSet <= 10 && !this.pointEnOr ? '#ff6b6b' : '#ffd84a');
    const j = this.j, bouton = estTactile() ? 'Lancer' : 'ESPACE';
    let msg = '';
    if (j.superPret) msg = `SUPER PRÊT !  ${bouton}`;
    else if (j.tient && j.tenue > 0.8 && this.etat === 'jeu') msg = `${bouton} : lance !`;
    this.hudSuper.setText(msg).setVisible(!!msg).setColor(j.superPret ? '#7fff7f' : '#ffd84a')
      .setPosition(borne(j.x, 120, LARGEUR - 120), j.y - 160);
  }
}

// Bulle de Lionel au-dessus de sa tête (une seule à la fois)
function bulleLionel(scene, message, duree = 1300) {
  const p = scene.l;
  if (p.bulle && p.bulle.active) p.bulle.destroy();
  p.bulle = bulle(scene, borne(p.x, 620, LARGEUR - 130), Math.max(150, p.y - 140), 'Lionel : « ' + message + ' »', duree).setDepth(950);
}

// Bandeau rapide au milieu de l'écran (se ferme tout seul)
function encartRapide(scene, titre, sousTitre, couleur, duree = 0.9) {
  const e = encart(scene, titre, sousTitre, couleur);
  scene.time.delayedCall(duree * 1000, () => e.fermer());
}
