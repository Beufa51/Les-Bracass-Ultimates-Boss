// Boss Julien — NIVEAU 1 : LA MANIF (FPS façon Wolfenstein).
// Tu es un étudiant en pleine manif : traverse les rues jusqu'au portail du lycée.
// Les policiers lancent des lacrymos (nuage = tu perds de la vie, ta tête tousse), les CRS chargent au bouclier.
// Tu ripostes avec des ŒUFS : un policier touché assez de fois s'enfuit. Le bouclier arrête les œufs,
// sauf quand le CRS est essoufflé après sa charge (pas de côté pour l'esquiver, puis bombarde-le).
// La vue 3D est dessinée en basse résolution (480×270) puis agrandie ×2, façon années 90.
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte, voile } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique, deverrouillerMusiques } from '../../core/musique.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, REGLAGES as RG, DIFFICULTES, RANGS } from './reglages.js';
import { Sauvegarde } from '../../core/sauvegarde.js';
const MUSIQUES_JULIEN = ['julien_musique', 'julien_foule', 'julien_lycee_musique', 'julien_boss_musique'];
const FINS = ['julien_fin_gaze', 'julien_fin_attrape', 'julien_fin_colle', 'julien_fin_victoire'];   // outils/julien/decouper_audit21.py
import { PLAN_MANIF, OBJETS, SECRETS, ZONES, PARVIS, PAR, ABSENTS_FACILE, RENFORTS_ANARCHISTE, RIDEAUX, FOURGON, PORTES } from './niveau_manif.js';
import { rendre, murEn, vueLibre } from './raycaster.js';
import { texturesMurs, texturesSprites, texturesMain, chargerImages, appliquerImages, variantesTaches } from './textures.js';
import { construireDecor } from './decor.js';
import { installerJoystick } from './joystick.js';
import { ACTIONS, PRESETS, lireCommandes, ecrireCommandes, appliquerPreset, creerCommandes, nomsTouches, nomTouche, toucheDeEvenement } from './commandes.js';
import { ARMES, armeDe, RECHARGES, choisirArme, armeSuivante, tirer, avancerTirs } from './armes.js';
import { toileVisage, niveauVisage } from './visage.js';

// Bonus : temps (s) ou armure gagnée, et message
const BONUS = {
  echarpe: () => `Écharpe mouillée : ${RG.bonus.echarpe} s sans souffrir des lacrymos !`,
  cafe: () => `Café serré ! ${RG.bonus.cafe} s plus rapide !`,
  kway: () => `Un K-Way ! (+${RG.bonus.kway} d'armure)`,
};
const L = 480, H = 270, VUE_H = 222;   // toile basse résolution ; la vue 3D au-dessus, la barre du bas en dessous
const FOV = 0.66;                      // largeur du champ de vision (≈ 66°)
let T = null;                          // dessins (faits une seule fois)

export class JulienManif extends BossScene {
  constructor(cle = 'JulienManif') { super(cle, IDENTITE); }   // JulienClasse (niveau 2) hérite de cette scène

  preload() {
    chargerImages(this);   // vraies images (assets/sprites/julien/), avant la barre de chargement commune
    for (const n of FINS) if (!this.textures.exists(n)) this.load.image(n, `assets/sprites/julien/${n}.jpg`);   // écrans de fin illustrés
    super.preload();
  }

  create() {
    if (!T) {
      T = { murs: texturesMurs(), spr: texturesSprites(), main: texturesMain() };
      appliquerImages(this, T);
      variantesTaches(T);
    }
    etiquettesTactiles({ espace: 'OK', z: null, x: null });   // intro : seulement OK (les boutons du jeu arrivent au départ)
    this.cameras.main.setBackgroundColor('#000000');

    if (this.textures.exists('julien_vue')) this.textures.remove('julien_vue');
    this.toile = this.textures.createCanvas('julien_vue', L, H);
    this.toile.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.ctx = this.toile.getContext();
    this.ctx.imageSmoothingEnabled = false;
    this.T = T;
    this.decor = this.creerDecor();
    this.add.image(0, 0, 'julien_vue').setOrigin(0).setScale(LARGEUR / L, HAUTEUR / H);

    this.plan = this.planDepart();
    this.lireNiveau();

    // barre du bas : chiffres en haute résolution par-dessus la toile
    const yb = VUE_H * 2;
    texte(this, 92, yb + 20, 'VIE', 16, '#c9b48a');
    this.txtVie = texte(this, 92, yb + 52, '', 40, '#ff5a3c');
    this.txtArmure = texte(this, 92, yb + 84, '', 14, '#f0c818');   // K-Way
    this.txtMunitions = texte(this, 660, yb + 86, '', 12, '#c9b48a');   // tableau des munitions, comme Doom
    this.txtBonus = texte(this, 16, 44, '', 16, '#9fd8ff').setOrigin(0, 0).setStroke('#000', 4);   // bonus en cours
    this.txtArme = texte(this, 300, yb + 20, '', 16, '#c9b48a');
    this.txtOeufs = texte(this, 300, yb + 58, '', 40, '#fff2c8');
    this.lblFlics = texte(this, 660, yb + 20, 'POLICIERS REPOUSSÉS', 16, '#c9b48a');
    this.txtFlics = texte(this, 660, yb + 58, '', 32, '#9fd0ff');
    this.lblLycee = texte(this, 868, yb + 20, 'LYCÉE', 16, '#c9b48a');
    // tête du héros (vraie image, en haute résolution par-dessus la barre)
    this.tete = T.tetes ? this.add.image(LARGEUR / 2, yb + 50, 'julien_tetes', 0).setDisplaySize(82, 84) : null;
    this.txtMsg = texte(this, 16, 14, '', 18, '#ffffff').setOrigin(0, 0).setStroke('#000', 4).setWordWrapWidth(LARGEUR - 40).setAlign('left');   // (les longs messages passent à la ligne)
    this.msgT = 0;

    this.touches = creerTouches(this);
    this.sourisInstallee = false; this.okRelache = false;   // « REJOUER » relance la même scène : on repart de zéro (sinon la souris ne marche plus)
    const K = Phaser.Input.Keyboard.KeyCodes;
    // PC : commandes personnalisables (commandes.js : préréglages Moderne, Doom 93, ZQSD, WASD + touches au choix)
    this.reg = lireCommandes();
    this.cmd = estTactile() ? null : creerCommandes(this, this.reg);
    this.installerSouris();
    this.touchesCarte = this.input.keyboard.addKeys({ tab: K.TAB, m: K.M });
    this.touchesArmes = this.input.keyboard.addKeys({ a1: K.ONE, a2: K.TWO, a3: K.THREE, a4: K.FOUR, a5: K.FIVE, a6: K.SIX });
    this.carte = false;
    this.decor.vus = new Uint8Array(this.plan[0].length * this.plan.length);   // murs déjà vus (la carte n'affiche qu'eux)
    this.decor.speciaux = this.indicesSecrets();
    this.installerBoutonCarte();
    this.bloquerRaccourcisNavigateur();
    this.agrandirCroix();
    this.joy = RG.joueur.tactile.joystick ? installerJoystick(this) : null;   // téléphone : joystick à gauche (sinon la croix)
    this.tactile = estTactile();   // téléphone : croix = avancer / reculer / pas de côté, ↺ ↻ = tourner, ŒUF en haut
    this.enJeu = false;
    this.lancerMusique();
    // (Fabien : plus de musique en classe, sur téléphone) le lycée et la classe démarrent SANS appui (fin du niveau
    // d'avant) : le téléphone refuse alors leur musique. Comme pour Kédric, on DÉBLOQUE toutes les musiques de Julien
    // à chaque appui (jouées en muet un instant), pour qu'elles puissent partir plus tard toutes seules.
    const debloquer = () => deverrouillerMusiques(MUSIQUES_JULIEN);
    for (const t of ['touchend', 'click', 'keydown', 'pointerup']) window.addEventListener(t, debloquer, { capture: true });
    this.events.once('shutdown', () => { for (const t of ['touchend', 'click', 'keydown', 'pointerup']) window.removeEventListener(t, debloquer, { capture: true }); });
    this.dessiner(0);
    this.diff = DIFFICULTES[Sauvegarde.difficulte(IDENTITE.id)] || DIFFICULTES.bloqueur;
    if (this.donnees.rejouer) { this.appliquerDifficulte(); this.time.delayedCall(60, () => this.demarrer()); }   // « recommencer » : direct
    else if (this.donnees.depuisManif) { this.appliquerDifficulte(); this.time.delayedCall(120, () => this.intro()); }   // niveau 2 : difficulté déjà choisie
    else this.afficherPresentation({
      image: 'julien_presentation', nom: 'JULIEN', surnom: '« LE PROF »', couleur: '#1f8a2e',
      infos: [
        'Terrain : la manif, le lycée, puis SA classe',
        'Arme secrète : « Sortez une feuille ! »',
        'Signe distinctif : barbe poivre et sel',
        'Tee-shirt : Pyramid Head (Silent Hill)',
      ],
      invite: { JulienLycee: 'au lycée !', JulienClasse: 'en classe !' }[this.scene.key] || 'à la manif !',
    }, () => this.choisirDifficulte(() => this.time.delayedCall(120, () => this.intro())));
  }

  // --- points d'entrée que le niveau 2 (JulienClasse) remplace
  creerDecor() { return T.decor || (T.decor = construireDecor(this.ctx, T.murs, L, VUE_H)); }   // immeubles hauts, sol, ciel (decor.js)
  planDepart() { return PLAN_MANIF; }
  lancerMusique() {
    jouerMusique(this, 'julien_musique');   // « At Doom's Gate », en boucle
    jouerMusique(this, 'julien_foule');     // ambiance de manif par-dessus
  }
  spritesEnPlus() {}        // (liste) : sprites du niveau en plus
  dessinerEnPlus() {}       // (g) : par-dessus la vue, avant la barre du bas

  intro() {
    const tact = estTactile();
    this.afficherIntro('LA MANIF', [
      'Rejoins le portail du LYCÉE à travers la manif !',
      ...(tact ? [
        this.joy ? 'Joystick (pouce gauche) : avancer, reculer, pas de côté' : '▲ ▼ : avancer / reculer      ◀ ▶ : pas de côté',
        '↺ ↻ : tourner (2 appuis rapides = DEMI-TOUR)', 'LANCER : tirer      ARME (au-dessus) : changer d\'arme',
      ] : this.lignesCommandes()),
      tact ? 'CARTE (en haut à droite) : la carte, comme dans Doom' : 'TAB ou M : la carte, comme dans Doom',
      'Les lacrymos piquent : sors vite du nuage.',
      'Le bouclier arrête les œufs, SAUF quand le CRS',
      'est essoufflé après sa charge : esquive de côté puis vise !',
    ], () => this.demarrer());
  }

  // texte des commandes PC d'après le réglage choisi
  lignesCommandes() {
    const t = this.reg.touches, n = (a) => nomsTouches(t[a]);
    return [
      `${PRESETS[this.reg.preset] ? PRESETS[this.reg.preset].nom : 'PERSONNALISÉ'} :  avancer ${n('avancer')}   reculer ${n('reculer')}`,
      `pas de côté ${n('coteG')} ${n('coteD')}   tourner ${n('tourneG')} ${n('tourneD')}${this.reg.souris ? '   souris (clic)' : ''}`,
      `tirer ${n('tirer')}${this.reg.souris ? ' / clic' : ''}   arme ${n('arme')} ou 1-6   ${this.reg.toujoursCourir ? 'marcher' : 'courir'} ${n('marcher')}`,
    ];
  }

  demarrer() { etiquettesTactiles({ x: 'LANCER', z: '↺', espace: '↻' }); if (this.joy) this.joy.activer(true); this.enJeu = true; }

  // Difficulté : œufs de départ + nombre de policiers (absents en facile, renforts en Anarchiste)
  appliquerDifficulte() {
    this.j.mun.oeufs = Math.round(RG.oeufs.depart * this.diff.munitions);
    if (this.diff === DIFFICULTES.sage || this.diff === DIFFICULTES.delegue) {
      for (const [x, y] of ABSENTS_FACILE) this.ennemis.forEach(e => { if ((e.x | 0) === x && (e.y | 0) === y) e.actif = false; });
    }
    if (this.diff === DIFFICULTES.anarchiste) for (const r of RENFORTS_ANARCHISTE) this.ajouterEnnemi(r.type, r.x, r.y);
    this.total = this.ennemis.filter(e => e.actif).length;
  }

  // Perdu : comme Doom, on recommence tout de suite (ESPACE / OK) ; X = retour au hub
  perdu(titre = 'GAZÉ !', sous = 'Les CRS t\'ont renvoyé chez toi. Le lycée attendra…') {
    if (this.termine) return;
    this.termine = true;
    if (this.joy) this.joy.activer(false);
    this.libererSouris();
    jouerSon(this, 'ui_defaite');
    etiquettesTactiles({ espace: 'REJOUER', x: 'HUB', z: null, haut: null, bas: null, gauche: null, droite: null });
    const fond = this.textures.exists(this.imageFin()) ? this.add.image(LARGEUR / 2, HAUTEUR / 2, this.imageFin()).setDisplaySize(LARGEUR, HAUTEUR).setDepth(1000) : null;   // écran illustré
    voile(this, fond ? 0.4 : 0.75).setDepth(1000);
    texte(this, LARGEUR / 2, 170, titre, 56, '#ff6b6b').setDepth(1001).setStroke('#000', 8);
    texte(this, LARGEUR / 2, 250, sous, 22, '#ffffff').setDepth(1001).setStroke('#000', 5);
    texte(this, LARGEUR / 2, 360, `${estTactile() ? 'REJOUER' : 'ESPACE'} : recommencer tout de suite`, 24, '#7fff7f').setDepth(1001).setStroke('#000', 5);
    texte(this, LARGEUR / 2, 400, `${estTactile() ? 'HUB' : 'X'} : retour au hub`, 18, '#dddddd').setDepth(1001).setStroke('#000', 4);
    this.time.delayedCall(600, () => {
      this.input.keyboard.once('keydown-SPACE', () => this.scene.restart(this.donneesRejouer()));
    });
    // HUB seulement après 1,5 s : LANCER (= X) tapé en rafale au moment de mourir ne renvoie plus au hub par erreur
    this.time.delayedCall(1500, () => this.input.keyboard.once('keydown-X', () => this.retourHub()));
  }

  // Écran COMMANDES (PC) : préréglage, souris, toujours courir, et chaque touche à personnaliser
  ecranCommandes(retour) {
    const r = this.reg, noms = Object.keys(PRESETS);
    const lignes = [{ t: 'preset' }, { t: 'souris' }, { t: 'courir' }, ...ACTIONS.map(([a, n]) => ({ t: 'action', a, n })), { t: 'fin' }];
    let i = 0, attente = null;
    const el = [voile(this, 0.9).setDepth(1000), texte(this, LARGEUR / 2, 40, 'COMMANDES DU CLAVIER', 30, '#ffd84a').setDepth(1001)];
    const txt = lignes.map((_, k) => texte(this, LARGEUR / 2, 90 + k * 29, '', 18, '#ffffff').setDepth(1001));
    const aide = texte(this, LARGEUR / 2, HAUTEUR - 52, '', 15, '#9fd0ff', { wordWrap: { width: 900 } }).setDepth(1001);
    const bas = texte(this, LARGEUR / 2, HAUTEUR - 22, '▲ ▼ choisir   ◀ ▶ / ENTRÉE changer   C : terminer', 15, '#aaaaaa').setDepth(1001);
    const libelle = (l) => l.t === 'preset' ? `PRÉRÉGLAGE :  ◀ ${PRESETS[r.preset] ? PRESETS[r.preset].nom : 'PERSONNALISÉ'} ▶`
      : l.t === 'souris' ? `Souris pour tourner (clic) :  ${r.souris ? 'OUI' : 'NON'}`
      : l.t === 'courir' ? `Toujours courir :  ${r.toujoursCourir ? 'OUI' : 'NON'}`
      : l.t === 'fin' ? '[ TERMINER ]'
      : `${l.n} :  ${attente === l.a ? '… appuie sur une touche …' : nomsTouches(r.touches[l.a])}`;
    const maj = () => {
      txt.forEach((o, k) => o.setText(libelle(lignes[k])).setColor(k === i ? '#ffd84a' : '#ffffff').setAlpha(k === i ? 1 : 0.7));
      const l = lignes[i];
      aide.setText(attente ? 'Appuie sur la nouvelle touche (Retour arrière : annuler).'
        : l.t === 'preset' ? (PRESETS[r.preset] ? PRESETS[r.preset].texte : 'Tes touches à toi.')
        : l.t === 'action' ? 'ENTRÉE puis la nouvelle touche (elle remplace l\'ancienne).' : '');
    };
    maj();
    const fermer = () => {
      this.input.keyboard.off('keydown', touche);
      [...el, ...txt, aide, bas].forEach(o => o.destroy());
      ecrireCommandes(r);
      this.cmd = creerCommandes(this, r);
      this.installerSouris();
      retour();
    };
    const touche = (ev) => {
      if (attente) {   // personnalisation : la touche suivante remplace l'ancienne
        if (ev.key !== 'Backspace') {
          const n = toucheDeEvenement(ev);
          if (n) { r.touches[attente] = [n]; r.preset = 'perso'; }
        }
        attente = null; maj(); return;
      }
      const l = lignes[i], cote = ev.key === 'ArrowLeft' ? -1 : ev.key === 'ArrowRight' ? 1 : 0;
      if (ev.key === 'ArrowUp') i = (i + lignes.length - 1) % lignes.length;
      else if (ev.key === 'ArrowDown') i = (i + 1) % lignes.length;
      else if (ev.key === 'c' || ev.key === 'C') { fermer(); return; }
      else if (l.t === 'preset' && (cote || ev.key === 'Enter')) {
        const k = Math.max(0, noms.indexOf(r.preset));
        appliquerPreset(r, noms[(k + (cote || 1) + noms.length) % noms.length]);
      } else if (l.t === 'souris' && (cote || ev.key === 'Enter')) r.souris = !r.souris;
      else if (l.t === 'courir' && (cote || ev.key === 'Enter')) r.toujoursCourir = !r.toujoursCourir;
      else if (l.t === 'action' && ev.key === 'Enter') attente = l.a;
      else if (l.t === 'fin' && (ev.key === 'Enter' || ev.key === ' ')) { fermer(); return; }
      else return;
      jouerSon(this, 'julien_lancer');
      maj();
    };
    this.input.keyboard.on('keydown', touche);
  }

  // Depuis le menu pause (PC) : jeu figé pendant l'écran des commandes, puis 'retour' (qui rouvre la pause)
  commandesDisponibles() { return this.enJeu && !this.termine; }   // pas pendant les menus / l'intro / la fin
  ouvrirCommandes(retour) {
    const avant = this.enJeu;
    this.enJeu = false; this.libererSouris();
    this.ecranCommandes(() => { this.enJeu = avant; retour(); });
  }

  // Menu des difficultés façon Doom (▲ ▼ puis ESPACE / OK) ; le choix est retenu
  choisirDifficulte(suite) {
    const noms = Object.keys(DIFFICULTES);
    let i = Math.max(0, noms.indexOf(Sauvegarde.difficulte(IDENTITE.id)));
    if (i === 0 && !DIFFICULTES[Sauvegarde.difficulte(IDENTITE.id)]) i = 2;
    const el = [voile(this, 0.85).setDepth(1000), texte(this, LARGEUR / 2, 90, 'CHOISIS TA DIFFICULTÉ', 36, '#ffd84a').setDepth(1001)];
    const lignes = noms.map((n, k) => texte(this, LARGEUR / 2, 180 + k * 56, DIFFICULTES[n].nom, 28, DIFFICULTES[n].couleur).setDepth(1001));
    const aide = texte(this, LARGEUR / 2, 420, '', 18, '#ffffff').setDepth(1001);
    const bas = texte(this, LARGEUR / 2, HAUTEUR - 40, `▲ ▼ : choisir      ${estTactile() ? 'OK' : 'ESPACE'} : valider${estTactile() ? '' : '      C : COMMANDES DU CLAVIER'}`, 18, '#aaaaaa').setDepth(1001);
    if (this.raccourciClasse()) el.push(texte(this, LARGEUR / 2, HAUTEUR - 72, `Manif déjà finie : ${estTactile() ? '▶' : '2'} = aller direct en CLASSE (niveau 2)`, 18, '#9fd0ff').setDepth(1001));
    const maj = () => { lignes.forEach((l, k) => l.setAlpha(k === i ? 1 : 0.35).setScale(k === i ? 1.1 : 1)); aide.setText(DIFFICULTES[noms[i]].texte); };
    maj();
    const touche = (ev) => {
      if (ev.key === 'ArrowUp') { i = (i + noms.length - 1) % noms.length; maj(); jouerSon(this, 'julien_lancer'); }
      else if (ev.key === 'ArrowDown') { i = (i + 1) % noms.length; maj(); jouerSon(this, 'julien_lancer'); }
      else if ((ev.key === 'c' || ev.key === 'C') && !estTactile()) {   // écran des commandes, puis retour à ce menu
        this.input.keyboard.off('keydown', touche);
        [...el, ...lignes, aide, bas].forEach(o => o.destroy());
        this.ecranCommandes(() => this.choisirDifficulte(suite));
      }
      else if ((ev.key === '2' || (ev.key === 'ArrowRight' && estTactile())) && this.raccourciClasse()) {   // manif déjà finie : direct en classe
        this.input.keyboard.off('keydown', touche);
        Sauvegarde.reglerDifficulte(IDENTITE.id, noms[i]);
        this.scene.start('JulienClasse', { depuisManif: true });
      }
      else if (ev.key === ' ') {
        this.input.keyboard.off('keydown', touche);
        [...el, ...lignes, aide, bas].forEach(o => o.destroy());
        Sauvegarde.reglerDifficulte(IDENTITE.id, noms[i]);
        this.diff = DIFFICULTES[noms[i]];
        this.appliquerDifficulte();
        jouerSon(this, 'julien_ramasse');
        suite();
      }
    };
    this.input.keyboard.on('keydown', touche);
  }

  raccourciClasse() { return this.scene.key === 'JulienManif' && Sauvegarde.fait('julien_manif'); }

  // ------------------------------------------------------------------ niveau
  nouveauJoueur() {
    return { x: 2.5, y: 2.5, a: -Math.PI / 2, vie: RG.joueur.vie, recharge: 0,
      mun: { oeufs: RG.oeufs.depart, tomates: 0, eau: 0, sono: 0 }, carte: false, armes: new Set(['pancarte', 'oeufs']), arme: 'oeufs', armure: 0, echarpe: 0, cafe: 0, lanceT: 0, bob: 0,
      regard: 0, regardT: 1.2, expr: 'normal', exprT: 0, rouge: 0, gaz: 0 };
  }

  lireNiveau() {
    this.j = this.nouveauJoueur();
    this.ennemis = []; this.objets = []; this.tirs = []; this.grenades = []; this.nuages = []; this.splats = [];
    this.sortie = null;
    this.secrets = new Map(); this.secretsTrouves = 0; this.secretsSignales = new Set();
    this.rideaux = []; this.farines = []; this.fourgonFait = false; this.fourgonT = FOURGON.attente;
    this.portes = new Map(); this.balles = []; this.porteMsgT = 0;   // porte de service (carte de cantine), balles de LBD
    let nm = 0;
    this.plan = this.plan.map((ligne, y) => [...ligne].map((c, x) => {
      const px = x + 0.5, py = y + 0.5;
      if (c === 'J') { this.j.x = px; this.j.y = py; return '.'; }
      if (c === 'S') return '.';
      if (SECRETS[c]) { this.secrets.set(`${x},${y}`, true); return SECRETS[c]; }
      if (RIDEAUX[c]) { this.rideaux.push([x, y]); return RIDEAUX[c]; }
      if (PORTES[c]) { this.portes.set(`${x},${y}`, true); return PORTES[c]; }
      const type = OBJETS[c];
      if (!type) return c;
      if (type === 'lanceur' || type === 'bouclier' || type === 'bac' || type === 'lbd') {
        this.ajouterEnnemi(type, x, y);
      } else {
        const solide = !RECHARGES[type] && !BONUS[type] && type !== 'sandwich' && type !== 'carte' && type !== 'pourris';
        const rayon = { barriere: 0.45, statue: 0.75, camion: 0.6, colonne: 0.4 }[type] || 0.3;
        const o = { type, x: px, y: py, solide, rayon, actif: true, n: nm };
        if (type === 'manifestant') nm++;
        this.objets.push(o);
      }
      return '.';
    }).join(''));
    this.finLecture();
  }

  ajouterEnnemi(type, x, y) {
    const px = x + 0.5, py = y + 0.5;
    this.ennemis.push({ type, x: px, y: py, vie: RG[type].vie, etat: 'attente', t: 1 + Math.random(), anim: 0, bouge: false,
      vuX: px, vuY: py, alerte: false, cdx: 0, cdy: 0, actif: true,
      parvis: x >= PARVIS.x0 && x <= PARVIS.x1 && y >= PARVIS.y0 && y <= PARVIS.y1,
      // rondes : tous sauf le parvis et le cordon (rue du lycée) ; horizontales sauf dans les rues étroites
      ronde: !(x >= PARVIS.x0 && x <= PARVIS.x1 && y >= PARVIS.y0 && y <= PARVIS.y1) && !(x >= 15 && x <= 17 && y >= 9 && y <= 17),
      rdx: (y >= 28 && y <= 35) ? 0 : (x % 2 ? 1 : -1), rdy: (y >= 28 && y <= 35) ? 1 : 0, rondeT: 2.5 });
  }

  finLecture() {
    this.sortieCases = new Set();
    PLAN_MANIF.forEach((l, y) => [...l].forEach((c, x) => { if (c === 'S') this.sortieCases.add(`${x},${y}`); }));
    const cs = [...this.sortieCases].map(k => k.split(',').map(Number));
    this.sortie = { x: cs.reduce((a, c) => a + c[0], 0) / cs.length + 0.5, y: cs[0][1] + 0.5 };   // la boussole vise la cour
    this.total = this.ennemis.length;
    this.repousses = 0;
    this.totalObjets = this.objets.filter(o => !o.solide).length; this.ramasses = 0;
    this.zonesVues = new Set(); this.portailOuvert = false; this.temps = 0;
  }

  // Souris (PC, facultative) : un clic la capture ; la bouger tourne la vue, cliquer tire ; Échap la libère
  installerSouris() {
    this.sourisX = 0; this.clic = false; this.clicNouveau = false;
    if (estTactile() || !RG.joueur.sourisActive || !this.reg.souris || this.sourisInstallee) return;
    this.sourisInstallee = true;
    const souris = this.input.mouse;
    this.input.on('pointerdown', () => {
      if (!this.enJeu) return;
      if (!souris.locked) { souris.requestPointerLock(); return; }
      this.clic = true; this.clicNouveau = true;
    });
    this.input.on('pointerup', () => { this.clic = false; });
    this.input.on('pointermove', (p) => { if (souris.locked && this.enJeu) this.sourisX += p.movementX; });
    this.events.once('shutdown', () => { if (souris.locked) souris.releasePointerLock(); });
  }
  libererSouris() { if (this.input.mouse && this.input.mouse.locked) this.input.mouse.releasePointerLock(); this.clic = false; }

  // Alt + ← / → (pas de côté, comme Doom) = « page précédente / suivante » pour le navigateur : on l'en empêche
  // pendant la manif ; et si le navigateur revient quand même en arrière, on reste sur le jeu.
  bloquerRaccourcisNavigateur() {
    const touche = (e) => {
      if (e.altKey && e.key && e.key.startsWith('Arrow')) e.preventDefault();
      if (e.key === 'Alt') e.preventDefault();   // Alt seul : pas de menu du navigateur
    };
    // V18 (audit global) : une seule entrée dans l'historique, même après plusieurs parties (avant : une de plus à chaque
    // visite → le bouton Retour du téléphone devait être pressé plusieurs fois pour quitter le site)
    const pousser = () => { if (!(history.state && history.state.manif)) history.pushState({ manif: true }, ''); };
    const retour = () => pousser();
    // APRÈS Phaser (il ignore les touches déjà « bloquées ») : on s'inscrit en dernier, sans « capture »
    window.addEventListener('keydown', touche);
    window.addEventListener('keyup', touche);
    pousser();
    window.addEventListener('popstate', retour);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', touche);
      window.removeEventListener('keyup', touche);
      window.removeEventListener('popstate', retour);
    });
  }

  // Téléphone : flèches de gauche plus grandes dans la manif (remises comme avant en partant)
  agrandirCroix() {
    const croix = document.querySelector('.tactile.gauche');
    if (!croix) return;
    const avant = croix.getAttribute('style') || '';
    croix.style.gridTemplateColumns = 'repeat(3, 96px)'; croix.style.gridTemplateRows = 'repeat(2, 96px)';
    const boutons = [...document.querySelectorAll('.tactile button')], polices = boutons.map(b => b.style.fontSize);
    boutons.forEach(b => { b.style.fontSize = '30px'; });   // flèches ET ↺ ↻ bien lisibles
    this.events.once('shutdown', () => { croix.setAttribute('style', avant); boutons.forEach((b, i) => { b.style.fontSize = polices[i]; }); });
  }

  // Téléphone : bouton CARTE en haut à droite (sur ordinateur : TAB ou M)
  installerBoutonCarte() {
    if (!estTactile()) return;
    const b = document.createElement('button');
    b.textContent = 'CARTE';
    Object.assign(b.style, { position: 'fixed', top: '6px', right: '8px', height: '34px', padding: '0 10px', zIndex: 11,
      border: '2px solid rgba(255,255,255,0.55)', borderRadius: '10px', background: 'rgba(20,20,30,0.45)', color: '#fff',
      font: 'bold 14px monospace', touchAction: 'none' });
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (this.enJeu) this.carte = !this.carte; });
    const arme = b.cloneNode(); arme.textContent = 'ARME';   // passe à l'arme suivante : juste au-dessus de LANCER, sous le pouce droit
    Object.assign(arme.style, { top: 'auto', bottom: '250px', right: '12px', width: '140px', height: '50px', fontSize: '18px' });   // bien au-dessus de LANCER
    arme.addEventListener('pointerdown', (e) => { e.preventDefault(); if (this.enJeu) armeSuivante(this); });
    document.body.append(b, arme);
    this.events.once('shutdown', () => { b.remove(); arme.remove(); });
  }

  message(t, duree = 2.8) { this.txtMsg.setText(t); this.msgT = duree; }

  // collision : murs + objets solides (cercle). ignore : l'entité qui bouge (pour ne pas se bloquer elle-même)
  libre(x, y, r, ignore) {
    const p = this.plan;
    if (murEn(p, x - r, y - r) || murEn(p, x + r, y - r) || murEn(p, x - r, y + r) || murEn(p, x + r, y + r)) return false;
    for (const o of this.objets) if (o.actif && o.solide && o !== ignore && Math.hypot(o.x - x, o.y - y) < r + o.rayon) return false;
    return true;
  }
  deplacer(e, dx, dy, r, ignore) {
    let bloque = false;
    if (this.libre(e.x + dx, e.y, r, ignore)) e.x += dx; else bloque = true;
    if (this.libre(e.x, e.y + dy, r, ignore)) e.y += dy; else bloque = true;
    return bloque;
  }

  // (analyse comparée, comme tous les FPS depuis Doom) lueur rouge sur le bord de l'écran d'où vient le coup
  bordRouge(cote) {
    const g = this.add.graphics().setScrollFactor(0).setDepth(900);
    const bandes = cote === 0 ? [-1, 1] : [cote];
    for (const c of bandes) for (let k = 0; k < 8; k++) {
      g.fillStyle(0xff2020, 0.09 * (8 - k) / 8);
      g.fillRect(c < 0 ? k * 9 : LARGEUR - (k + 1) * 9, 0, 9, HAUTEUR);
    }
    this.tweens.add({ targets: g, alpha: 0, delay: 150, duration: 350, onComplete: () => g.destroy() });
  }

  degats(n, sx, sy) {
    const j = this.j;
    if (j.vie <= 0) return;
    n *= this.diff.degats;   // difficulté
    if (j.armure > 0) { const a = Math.min(j.armure, n * RG.bonus.absorbe); j.armure -= a; n -= a; }   // le K-Way encaisse une part
    j.vie = Math.max(0, j.vie - n);
    if (sx !== undefined) {
      const dx = Math.cos(j.a), dy = Math.sin(j.a);
      const droite = (sx - j.x) * -dy + (sy - j.y) * dx;
      j.regard = droite > 0.2 ? 1 : droite < -0.2 ? -1 : 0;
      j.expr = 'aie'; j.exprT = 0.6; j.rouge = 0.55;
      jouerSon(this, 'julien_aie');
      this.bordRouge(j.regard);
    }
    if (j.vie <= 0) {
      j.expr = 'ko'; j.exprT = 99;
      this.enJeu = false;
      this.time.delayedCall(1200, () => this.perdu());
    }
  }

  // ------------------------------------------------------------------ boucle
  // BOUCLE COMMUNE aux 3 niveaux (manif, lycée, classe) : chaque niveau ne remplace que majJeu() et zonesNiveau()
  // (audit final : la boucle était recopiée 3 fois)
  update(temps, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    if (this.enJeu && !this.termine) {
      const j = this.j;
      if (vientDAppuyer(this.touchesCarte.tab) || vientDAppuyer(this.touchesCarte.m)) this.carte = !this.carte;
      ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].forEach((t, i) => { if (vientDAppuyer(this.touchesArmes[t])) choisirArme(this, ARMES[i].id); });
      this.majJeu(dt);
      this.temps += dt;
      j.echarpe = Math.max(0, j.echarpe - dt); j.cafe = Math.max(0, j.cafe - dt);
      j.changeT = Math.max(0, (j.changeT || 0) - dt);
      for (const f of this.farines) f.t -= dt;
      this.farines = this.farines.filter(f => f.t > 0);
      this.zonesNiveau().forEach((z, i) => {   // message à la première entrée dans une zone
        if (!this.zonesVues.has(i) && j.x >= z.x0 && j.x < z.x1 + 1 && j.y >= z.y0 && j.y < z.y1 + 1) { this.zonesVues.add(i); this.message(this.portailOuvert && z.ouvert ? z.ouvert : z.texte, 4.5); }
      });
    }
    this.majVisage(dt);
    this.dessiner(dt);
  }
  zonesNiveau() { return ZONES; }
  // la manif : déplacements, policiers, tirs, fourgon de la dernière vague, portail, arrivée dans la cour
  majJeu(dt) {
    const j = this.j;
    this.bougerJoueur(dt);
    this.ennemis.forEach(e => this.ia(e, dt));
    this.projectiles(dt);
    this.ramasser();
    this.majFourgon(dt);
    if (!this.portailOuvert && this.fourgonFait && this.ennemis.every(e => !e.parvis || !e.actif || e.etat === 'fuite')) this.ouvrirPortail();
    if (this.sortieCases.has(`${j.x | 0},${j.y | 0}`)) this.finNiveau();
  }

  bougerJoueur(dt) {
    const j = this.j, k = this.touches, R = RG.joueur;
    // Clavier (Doom 93) : ← → tournent, Alt + ← → = pas de côté.
    // Téléphone (demande de Fabien) : ◀ ▶ = pas de côté ; boutons ↺ (touche Z) et ↻ (Espace) = tourner ; ŒUF (touche X).
    // PC (demande de Fabien, comme sur téléphone) : ← → = pas de côté ; Alt (ou X) + ← → = tourner ; Q / A / D = tourner ; souris
    const m = this.cmd;
    const maj = !this.tactile && m.bas('marcher');
    const course = this.tactile ? (R.tactile.courir ? R.course : 1) : ((this.reg.toujoursCourir ? !maj : maj) ? R.course : 1);   // toujours courir : Maj fait marcher
    let tourne = 0, avance = 0, cote = 0;
    if (this.tactile) {
      if (k.gauche.isDown) cote -= 1;
      if (k.droite.isDown) cote += 1;
      if (k.haut.isDown) avance += course;
      if (k.bas.isDown) avance -= course;
    } else {
      const inv = m.bas('inverser');   // maintenu : pas de côté ↔ tourner
      const cg = m.bas('coteG'), cd = m.bas('coteD'), tg = m.bas('tourneG'), td = m.bas('tourneD');
      cote = (inv ? (tg ? -1 : 0) + (td ? 1 : 0) : (cg ? -1 : 0) + (cd ? 1 : 0));
      tourne = (inv ? (cg ? -1 : 0) + (cd ? 1 : 0) : (tg ? -1 : 0) + (td ? 1 : 0));
      if (m.bas('avancer')) avance += course;
      if (m.bas('reculer')) avance -= course;
      if (m.vient('arme')) armeSuivante(this);
    }
    if (this.tactile) {
      if (!k.espace.isDown) this.okRelache = true;   // le OK du départ (même bouton que ↻) ne fait pas tourner
      if (k.z.isDown) tourne -= 1;
      if (k.espace.isDown && this.okRelache) tourne += 1;
      // (analyse comparée, Doom 64 / Resident Evil) DEMI-TOUR ÉCLAIR : toucher 2 fois vite ↺ ou ↻
      for (const [touche, sens] of [[k.z, -1], [k.espace, 1]]) {
        if (!Phaser.Input.Keyboard.JustDown(touche) || (sens > 0 && !this.okRelache)) continue;
        if (this.dernierTourne && this.dernierTourne.sens === sens && this.time.now - this.dernierTourne.t < 300) {
          this.demiTour = { reste: Math.PI, sens }; this.dernierTourne = null;
        } else this.dernierTourne = { sens, t: this.time.now };
      }
    }
    if (this.demiTour) {   // le demi-tour se fait en 0,2 s
      const pas = Math.min(this.demiTour.reste, Math.PI / 0.2 * dt);
      j.a += pas * this.demiTour.sens; this.demiTour.reste -= pas; tourne = 0;
      if (this.demiTour.reste <= 0) this.demiTour = null;
    }
    cote = Math.sign(cote) * course;
    if (this.joy) { const jv = this.joy.valeur(); avance += jv.y; cote += jv.x; }   // joystick : en douceur
    j.a += tourne * (this.tactile ? R.tactile.rotation : R.rotation) * dt + this.sourisX * R.souris;   // + la souris
    this.sourisX = 0;
    const dx = Math.cos(j.a), dy = Math.sin(j.a);
    const v = (j.cafe > 0 ? RG.bonus.cafeVitesse : 1) * (j.lent ? RG.cantiniere.ralenti : 1);   // café serré : plus rapide ; purée : au ralenti
    const mx = (dx * avance * R.vitesse + -dy * cote * R.vitesseCote) * dt * v;
    const my = (dy * avance * R.vitesse + dx * cote * R.vitesseCote) * dt * v;
    this.deplacer(j, mx, my, R.rayon);
    if (mx || my) j.bob += dt * 9;
    // mur secret : il s'ouvre quand on pousse dedans en avançant
    if (avance > 0) {
      const k = `${(j.x + dx * 0.5) | 0},${(j.y + dy * 0.5) | 0}`;
      if (this.secrets.get(k)) this.ouvrirSecret(k);
      if (this.portes && this.portes.get(k)) this.pousserPorte(k);
    }
    // à côté d'un mur secret encore fermé : un petit message, une fois par mur (« ça sonne creux »)
    for (const [ks, ferme] of this.secrets) if (ferme && !(this.secretsSignales || (this.secretsSignales = new Set())).has(ks)) {
      const [sx, sy] = ks.split(',').map(Number);
      if (Math.hypot(sx + 0.5 - j.x, sy + 0.5 - j.y) < 1.8) { this.secretsSignales.add(ks); this.message('Ce mur a l\'air CREUX… pousse dedans en avançant !', 3); }
    }
    this.porteMsgT = Math.max(0, (this.porteMsgT || 0) - dt);
    // les policiers ne se traversent pas
    for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite') {
      const d = Math.hypot(j.x - e.x, j.y - e.y);
      if (d < 0.55 && d > 0.001) this.deplacer(j, (j.x - e.x) / d * (0.55 - d), (j.y - e.y) / d * (0.55 - d), R.rayon);
    }

    j.recharge -= dt; j.lanceT -= dt;
    const appui = this.tactile ? k.x.isDown : (m.bas('tirer') || this.clic);
    const nouveau = this.tactile ? vientDAppuyer(k.x) : (m.vient('tirer') || this.clicNouveau);
    this.clicNouveau = false;
    tirer(this, dx, dy, appui, nouveau);
  }

  // plusieurs policiers mis en fuite en moins de 3 s : « OMELETTE ×N ! »
  // le nom du combo dépend de l'arme qui a fini le dernier (Fabien : « OMELETTE » même avec des tomates)
  combo(tache, genre) {
    const nom = genre === 'boulette' ? 'PAPIER MÂCHÉ' : tache === 'tomate' ? 'SAUCE TOMATE' : tache === 'oeuf' ? 'OMELETTE'
      : genre === 'pancarte' ? 'K.-O.' : genre === 'eau' ? 'DOUCHE FROIDE' : 'DÉROUTE';
    const t = this.time.now;
    this.comboN = t - (this.comboT || -1e9) < 3000 ? (this.comboN || 1) + 1 : 1;
    this.comboT = t;
    if (this.comboN < 2) return;
    const txt = texte(this, LARGEUR / 2, 150, `${nom} ×${this.comboN} !`, 44, '#ffd84a').setDepth(50).setScale(0.4);
    this.tweens.add({ targets: txt, scale: 1, duration: 180, ease: 'Back.out' });
    this.tweens.add({ targets: txt, alpha: 0, y: 120, delay: 900, duration: 500, onComplete: () => txt.destroy() });
    jouerSon(this, 'julien_ramasse', { rate: 1.2 });
  }

  multAide() { return 1; }   // (la classe la réduit : RG.julien.aide)

  // Aide à la visée : un œuf lancé presque vers un policier (écart < aide) part droit sur lui
  viser(dx, dy) {
    const j = this.j;
    let meilleur = (this.tactile ? RG.oeufs.aideTactile : RG.oeufs.aide) * this.multAide(), vx = dx, vy = dy;
    for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite') {
      const ox = e.x - j.x, oy = e.y - j.y, d = Math.hypot(ox, oy);
      if (d > 12 || d < 0.3) continue;
      const ecart = Math.abs(Math.atan2(dx * oy - dy * ox, dx * ox + dy * oy));
      if (ecart < meilleur && vueLibre(this.plan, j.x, j.y, e.x, e.y)) { meilleur = ecart; vx = ox / d; vy = oy / d; }
    }
    return [vx, vy];
  }

  // un policier qui te repère (ou entend un œuf s'écraser) prévient ses collègues proches
  alerter(x, y, rayon) {
    for (const e of this.ennemis) if (e.actif && !e.alerte && Math.hypot(e.x - x, e.y - y) < rayon) {
      e.alerte = true; e.vuX = this.j.x; e.vuY = this.j.y; e.t = 0.8 + Math.random() * 0.6;
    }
  }

  // Murs secrets : même aspect que leurs voisins, mais avec un petit INDICE (flèche taguée « ↘ ? »), comme dans Doom
  indicesSecrets() {
    const W = this.plan[0].length, m = new Map();
    for (const k of this.secrets.keys()) {
      const [x, y] = k.split(',').map(Number);
      const code = Number(this.plan[y][x]);
      let base = T.murs[code]; if (Array.isArray(base)) base = base[0];
      const c = document.createElement('canvas'); c.width = base.width; c.height = base.height;
      const g = c.getContext('2d'); g.drawImage(base, 0, 0);
      const u = base.width / 64;
      // (Fabien : 2e secret jamais trouvé) indice plus GROS et plus visible : tag jaune cerné de noir + fissures
      g.strokeStyle = 'rgba(20,20,20,0.75)'; g.lineWidth = 1.5 * u;
      g.beginPath(); g.moveTo(10 * u, 8 * u); g.lineTo(18 * u, 20 * u); g.lineTo(14 * u, 30 * u); g.moveTo(54 * u, 10 * u); g.lineTo(48 * u, 22 * u); g.stroke();
      g.font = `bold ${24 * u}px monospace`; g.textAlign = 'center'; g.lineWidth = 4 * u; g.strokeStyle = '#111';
      g.strokeText('→?', 32 * u, 46 * u); g.fillStyle = '#ffe14a'; g.fillText('→?', 32 * u, 46 * u);
      m.set(y * W + x, c);
    }
    return m;
  }

  // PORTE DE SERVICE (audit nov. 2026, « clé + porte ») : elle s'ouvre si on a la CARTE DE CANTINE
  pousserPorte(k) {
    if (!this.j.carte) {
      if (this.porteMsgT <= 0) { this.message('Porte de service fermée : il faut une CARTE DE CANTINE (cherche bien les secrets !).', 3); jouerSon(this, 'julien_plonk', { rate: 0.6 }); }
      this.porteMsgT = 3;
      return;
    }
    this.portes.set(k, false);
    const [x, y] = k.split(',').map(Number);
    this.plan[y] = this.plan[y].slice(0, x) + '.' + this.plan[y].slice(x + 1);
    jouerSon(this, 'julien_portail');
    this.message('BIP ! La porte de service s\'ouvre : un couloir vers le PARVIS, sans passer par le cordon !', 4);
  }

  // LA SONO (arme 7, le « BFG ») : un coup de basse, et tous les policiers EN VUE (à portée) s'enfuient
  sono() {
    const j = this.j;
    jouerSon(this, 'julien_fourgon', { rate: 0.6 }); jouerSon(this, 'julien_cri', { rate: 0.55 });
    this.cameras.main.shake(600, 0.016); j.or = 1;
    let n = 0;
    for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite' && Math.hypot(e.x - j.x, e.y - j.y) < RG.sono.portee && vueLibre(this.plan, j.x, j.y, e.x, e.y)) {
      this.toucherEnnemi(e, 99, { perceBouclier: true }); n++;
    }
    this.nuages = [];   // la basse souffle aussi les lacrymos
    this.message(n ? `LA SONO : « ON LÂCHE RIEN ! » (${n} en fuite)` : 'LA SONO : « ON LÂCHE RIEN ! »… mais personne en vue.', 2.5);
  }

  ouvrirSecret(k) {
    this.secrets.set(k, false);
    const [x, y] = k.split(',').map(Number);
    this.plan[y] = this.plan[y].slice(0, x) + '.' + this.plan[y].slice(x + 1);
    this.secretsTrouves++;
    jouerSon(this, 'julien_secret');
    this.message('PASSAGE SECRET !');
  }

  // Dernière vague : un fourgon bloque la rue du lycée derrière toi et dépose des CRS (le portail attend qu'ils fuient)
  majFourgon(dt) {
    if (this.fourgonFait || !this.zonesVues.has(ZONES.length - 1)) return;
    this.fourgonT -= dt;
    const j = this.j, [cx, cy] = FOURGON.camion;
    if (this.fourgonT > 0 || Math.hypot(j.x - cx, j.y - cy) < 2.2) return;   // jamais sur le joueur
    this.fourgonFait = true;
    this.objets.push({ type: 'camion', x: cx, y: cy, solide: true, rayon: 0.6, actif: true, n: 0 });   // rayon = largeur de l'image
    const renforts = [...FOURGON.renforts, ...(this.diff === DIFFICULTES.anarchiste ? [FOURGON.renfortAnarchiste] : [])];
    for (const [type, x, y] of renforts) {
      this.ajouterEnnemi(type, Math.floor(x), Math.floor(y));
      const e = this.ennemis[this.ennemis.length - 1];
      Object.assign(e, { x, y, parvis: true, ronde: false, alerte: true, vuX: j.x, vuY: j.y, etat: type === 'lanceur' ? 'chasse' : 'approche', t: 1.2 });
      this.total++;
    }
    if (FOURGON.perche) {   // un policier SUR LE TOIT du fourgon : il ne bouge pas, il lance d'en haut
      const [type, x, y, z] = FOURGON.perche;
      this.ajouterEnnemi(type, Math.floor(x), Math.floor(y));
      const e = this.ennemis[this.ennemis.length - 1];
      Object.assign(e, { x, y, perche: z, vie: 1, parvis: true, ronde: false, alerte: true, vuX: j.x, vuY: j.y, etat: 'chasse', t: 2.5 });   // 1 œuf suffit
      this.objets[this.objets.length - 1].porteur = e;   // le fourgon ne protège pas celui qui est dessus
      this.total++;
    }
    jouerSon(this, 'julien_fourgon');
    this.cameras.main.shake(400, 0.008);
    this.message('Un fourgon débarque derrière toi : des CRS en renfort !', 3.5);
  }

  // Embuscade : les rideaux de fer du passage se lèvent (quand on ramasse le 1er pistolet à eau)
  ouvrirRideaux() {
    if (!this.rideaux.length) return;
    for (const [x, y] of this.rideaux) {
      this.plan[y] = this.plan[y].slice(0, x) + '.' + this.plan[y].slice(x + 1);
      this.alerter(x - 0.5, y + 0.5, 1.5);
    }
    this.rideaux = [];
    jouerSon(this, 'julien_rideau');
    this.message('EMBUSCADE ! Les rideaux de fer se lèvent !', 3);
  }

  // Sac de farine (le baril de Doom) : nuage blanc, les policiers autour encaissent et sont aveuglés ; en chaîne
  exploserFarine(sac) {
    if (!sac.actif) return;
    sac.actif = false;
    const F = RG.farine, j = this.j;
    this.farines.push({ x: sac.x, y: sac.y, t: 1.6, mousse: sac.type === 'extincteur' });
    jouerSon(this, 'julien_farine');
    if (sac.type === 'extincteur') this.message('PSCHHHT ! De la mousse partout : ils glissent et n\'y voient plus rien !', 2.5);
    if (Math.hypot(j.x - sac.x, j.y - sac.y) < 6) this.cameras.main.shake(180, 0.007);
    if (Math.hypot(j.x - sac.x, j.y - sac.y) < F.rayon) j.blanc = 0.9;
    for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite' && Math.hypot(e.x - sac.x, e.y - sac.y) < F.rayon) {
      e.aveugle = F.aveugle;
      this.toucherEnnemi(e, F.degats, { perceBouclier: true, recul: [(e.x - sac.x) * 0.4, (e.y - sac.y) * 0.4] });
    }
    for (const o of this.objets) if (o.actif && o.type === 'farine' && Math.hypot(o.x - sac.x, o.y - sac.y) < F.rayon) {
      this.time.delayedCall(F.chaine * 1000, () => this.exploserFarine(o));
    }
  }

  ouvrirPortail() {
    this.portailOuvert = true;
    this.plan = this.plan.map(l => l.replace(/7/g, '.'));
    jouerSon(this, 'julien_portail');
    this.message('Le parvis est libre : le CPE ouvre le portail ! Entre vite !', 4);
  }

  // ronde : un policier pas encore alerté fait des allers-retours (on peut le surprendre de dos… ou de face)
  ronde(e, marcher, dt) {
    e.rondeT -= dt;
    if (marcher(e.rdx, e.rdy, 0.7) || e.rondeT <= 0) { e.rdx = -e.rdx; e.rdy = -e.rdy; e.rondeT = 2.2 + Math.random(); }
  }

  ia(e, dt) {
    if (!e.actif) return;
    const j = this.j, R = RG[e.type];
    const ox = j.x - e.x, oy = j.y - e.y, d = Math.hypot(ox, oy);
    e.aveugle = Math.max(0, (e.aveugle || 0) - dt);   // farine dans les yeux
    e.tousseT = Math.max(0, (e.tousseT || 0) - dt); e.attrapePose = Math.max(0, (e.attrapePose || 0) - dt);   // (poses « tousse » et « attrape »)
    const voit = j.vie > 0 && !e.aveugle && d < R.vue && vueLibre(this.plan, e.x, e.y, j.x, j.y);
    if (voit) { e.vuX = j.x; e.vuY = j.y; if (!e.alerte) { e.alerte = true; e.t = 0.6 + Math.random() * 0.6; this.alerter(e.x, e.y, 6); jouerSon(this, 'julien_halte', { rate: e.type === 'bouclier' ? 0.8 : 1 }); } }
    e.t -= dt; e.bouge = false;
    const marcher = (vx, vy, vitesse) => {
      const n = Math.hypot(vx, vy); if (n < 0.01) return true;
      e.bouge = true; e.anim += dt;
      return this.deplacer(e, vx / n * vitesse * dt, vy / n * vitesse * dt, 0.28);
    };

    if (e.etat === 'fuite' && e.perche) {   // le policier du toit du fourgon saute et disparaît
      e.fuiteT = (e.fuiteT || 0) + dt; e.perche = Math.max(0, e.perche - dt * 1.5);
      if (e.fuiteT > 0.5) e.actif = false;
      return;
    }
    if (e.etat === 'fuite') {   // il s'enfuit par un chemin libre, et ne disparaît que quand tu ne le vois plus
      e.fuiteT = (e.fuiteT || 0) + dt;
      if (!e.fdx || e.t <= 0) this.directionFuite(e, -ox / (d || 1), -oy / (d || 1));
      if (marcher(e.fdx, e.fdy, RG.fuite.vitesse)) e.t = 0;   // bloqué : il cherche un autre chemin
      if (e.fuiteT > RG.fuite.mini && !this.visible(e)) e.actif = false;
      return;
    }
    if (e.etat === 'touche') { if (e.t <= 0) { e.etat = e.apres; e.t = e.tApres; } return; }

    if (e.type === 'lanceur' || e.type === 'cantiniere' || e.type === 'lbd') {   // (la dame de cantine du lycée : même IA, elle lance de la purée)
      if (e.etat === 'attente') { if (e.alerte) e.etat = 'chasse'; else if (e.ronde) this.ronde(e, marcher, dt); return; }
      if (e.etat === 'chasse') {
        if (voit) {
          if (e.perche) { /* sur le toit du fourgon : il ne bouge pas */ }
          else if (d > R.distance + 0.6) marcher(ox, oy, R.vitesse);
          else if (d < R.distance - 1.2) marcher(-ox, -oy, R.vitesse);
          if (e.t <= 0) { e.etat = 'prepare'; e.t = R.preavis; }
        } else if (!e.perche && Math.hypot(e.vuX - e.x, e.vuY - e.y) > 0.3) marcher(e.vuX - e.x, e.vuY - e.y, R.vitesse);
        return;
      }
      if (e.etat === 'prepare' && e.t <= 0 && e.type === 'lbd') {   // LBD : une balle rapide, droit sur toi (pas de côté !)
        const [cx, cy] = voit ? [j.x, j.y] : [e.vuX, e.vuY], n = Math.hypot(cx - e.x, cy - e.y) || 1;
        this.balles.push({ x: e.x, y: e.y, dx: (cx - e.x) / n, dy: (cy - e.y) / n, t: 0 });
        jouerSon(this, 'julien_tir', { rate: 1.6 });
        if (Math.random() < 0.35) this.message(R.replique, 1.5);
        e.etat = 'lance'; e.t = 0.35;
        return;
      }
      if (e.etat === 'prepare' && e.t <= 0) {
        const [cx, cy] = voit ? [j.x, j.y] : [e.vuX, e.vuY];   // caché derrière un mur : il vise là où il t'a vu
        this.grenades.push({ x0: e.x, y0: e.y, x1: cx, y1: cy, t: 0, x: e.x, y: e.y, z: 0.6, puree: e.type === 'cantiniere' });
        jouerSon(this, e.type === 'cantiniere' ? 'julien_lancer' : 'julien_tir', e.type === 'cantiniere' ? { rate: 0.6 } : undefined);
        if (R.replique && Math.random() < 0.35) this.message(R.replique, 2);
        e.etat = 'lance'; e.t = 0.35;
        return;
      }
      if (e.etat === 'lance' && e.t <= 0) { e.etat = 'chasse'; e.t = R.cadence * this.diff.cadence * (0.8 + Math.random() * 0.4) * (e.perche ? 2.4 : 1); }   // (le policier du toit lance moins souvent)
      return;
    }

    // CRS au bouclier (et le surveillant du lycée, sans bouclier)
    // surveillant : au contact, il t'ATTRAPE (dégâts + il te bouscule), même sans charger
    if (R.attrape && (e.etat === 'approche' || e.etat === 'cri') && voit) {
      e.attrapeT = (e.attrapeT || 0) - dt;
      if (d < R.attrape.portee && e.attrapeT <= 0) {
        e.attrapeT = R.attrape.cadence; e.attrapePose = 0.5;
        this.degats(R.attrape.degats, e.x, e.y);
        this.deplacer(j, ox / d * 0.6, oy / d * 0.6, RG.joueur.rayon);
        this.cameras.main.shake(150, 0.008);
        if (Math.random() < 0.5) this.message(R.attrape.replique, 1.5);
      }
    }
    if (e.etat === 'attente') { if (e.alerte) e.etat = 'approche'; else if (e.ronde) this.ronde(e, marcher, dt); return; }
    if (e.etat === 'approche') {
      if (voit) {
        if (d > 1) marcher(ox, oy, R.vitesse);
        if (d < R.porteeCharge && e.t <= 0) { e.etat = 'cri'; e.t = R.preavis; jouerSon(this, 'julien_cri'); this.message(R.cri || '« DISPERSEZ-VOUS ! »'); }
      } else if (Math.hypot(e.vuX - e.x, e.vuY - e.y) > 0.3) marcher(e.vuX - e.x, e.vuY - e.y, R.vitesse);
      return;
    }
    if (e.etat === 'cri' && e.t <= 0) {   // la direction est choisie à la FIN du cri : un pas de côté suffit à l'esquiver
      e.cdx = ox / d; e.cdy = oy / d; e.etat = 'charge'; e.t = R.dureeCharge;
      return;
    }
    if (e.etat === 'charge') {
      const bloque = marcher(e.cdx, e.cdy, R.vitesseCharge);
      if (d < 0.7) {
        this.degats(R.degats, e.x, e.y);
        this.cameras.main.shake(260, 0.012);
        this.deplacer(j, e.cdx * 0.9, e.cdy * 0.9, RG.joueur.rayon);
        e.etat = 'essouffle'; e.t = R.essouffle * this.diff.essouffle;
      } else if (bloque || e.t <= 0) { e.etat = 'essouffle'; e.t = R.essouffle * this.diff.essouffle; }
      return;
    }
    if (e.etat === 'essouffle' && e.t <= 0) { e.etat = 'approche'; e.t = 0.8; }
  }

  // fuite : la direction la plus dégagée qui l'éloigne de toi (jamais droit dans un mur)
  directionFuite(e, ax, ay) {
    let mieux = -1e9;
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a);
      let libre = 0;
      while (libre < 3 && this.libre(e.x + dx * (libre + 0.3), e.y + dy * (libre + 0.3), 0.28, e)) libre += 0.3;
      const score = (dx * ax + dy * ay) * 2 + libre;
      if (score > mieux) { mieux = score; e.fdx = dx; e.fdy = dy; }
    }
    e.t = 0.8;
  }
  // vrai si tu vois ce personnage à l'écran (devant toi, pas caché par un mur)
  visible(e) {
    const j = this.j, ox = e.x - j.x, oy = e.y - j.y, d = Math.hypot(ox, oy);
    if (d > 16) return false;
    const ecart = Math.abs(Math.atan2(Math.cos(j.a) * oy - Math.sin(j.a) * ox, Math.cos(j.a) * ox + Math.sin(j.a) * oy));
    return ecart < Math.atan(FOV) + 0.25 && vueLibre(this.plan, j.x, j.y, e.x, e.y);
  }

  // degats : 1 = un œuf ; options : recul [dx, dy], perceBouclier (fumée), silencieux (eau, fumée : pas de son ni de sursaut)
  // tache : 'oeuf' (jaune), 'tomate' (rouge) ou null (pancarte, eau, fumée : pas de trace)
  toucherEnnemi(e, degats = 1, { recul = null, perceBouclier = false, silencieux = false, tache = null, genre = null } = {}) {
    if (recul && !e.perche) this.deplacer(e, recul[0], recul[1], 0.28);
    if (e.type === 'bouclier' && !this.bouclierBaisse(e) && !perceBouclier) {
      if (!silencieux) jouerSon(this, 'julien_plonk');
      if (!e.alerte) { e.alerte = true; e.vuX = this.j.x; e.vuY = this.j.y; e.etat = 'approche'; }   // « plonk » : il t'a repéré
      return;
    }
    e.vie -= degats;
    e.dernier = tache || 'propre';   // pour l'image « touché » / « fuite » : jaune, rouge ou sans trace
    // il garde la trace : jaune d'œuf ou tomate sur l'uniforme (4 au plus)
    if (tache && (e.taches || (e.taches = [])).length < 4) e.taches.push({ o: Math.random() * 1.6 - 0.8, h: 0.3 + Math.random() * 0.35, rouge: tache === 'tomate' });
    if (!silencieux) jouerSon(this, 'julien_splat');
    if (e.vie <= 0) {
      e.etat = 'fuite'; e.t = 0; e.fdx = 0; e.fuiteT = 0; this.repousses++;
      jouerSon(this, 'julien_fuite');
      if (Math.random() < RG.soins.casseCroute) {   // dans sa fuite, il lâche son casse-croûte
        this.objets.push({ type: 'sandwich', x: e.x, y: e.y, solide: false, rayon: 0.3, actif: true, n: 0, lache: true });
        this.time.delayedCall(900, () => this.message('Il a lâché son casse-croûte !', 2));
      }
      this.combo(tache, genre);
      this.message(this.messagesFuite()[this.repousses % 4]);
      this.j.expr = 'content'; this.j.exprT = 0.9;
      return;
    }
    if (!e.alerte) { e.alerte = true; e.vuX = this.j.x; e.vuY = this.j.y; e.etat = e.type === 'lanceur' ? 'chasse' : 'approche'; }
    if (silencieux || e.etat === 'touche') return;
    if (e.type === 'lanceur' && e.etat === 'prepare') return;   // le lancer part quand même
    e.apres = e.etat; e.tApres = e.t; e.etat = 'touche'; e.t = 0.22;
  }

  // durée de la dernière image en « images à 60 Hz » (les flashs durent pareil sur un téléphone à 120 Hz)
  pas60() { return Math.min(4, (this.game.loop.delta || 16.7) / 16.7); }

  imageFin() { return 'julien_fin_gaze'; }
  reperesCarte() { return []; }   // repères sur la carte (le lycée : le carnet)
  donneesRejouer() { return { rejouer: true }; }   // (la classe ajoute le point de reprise)   // image de l'écran PERDU (le lycée et la classe ont la leur)

  // message quand un ennemi s'enfuit (le lycée a les siens)
  messagesFuite() { return ['Il s\'enfuit tout dégoulinant !', 'Omelette !', 'Un de moins !', 'Retour au commissariat !']; }

  // CRS vulnérable : essoufflé, ou en train de sursauter pendant son essoufflement (sinon le 2e œuf fait « plonk »)
  bouclierBaisse(e) { return e.etat === 'essouffle' || (e.etat === 'touche' && e.apres === 'essouffle'); }

  projectiles(dt) {
    const j = this.j;
    avancerTirs(this, dt);   // œufs, tomates, eau (armes.js)
    // grenades lacrymogènes : vol en cloche, puis nuage
    for (const g of this.grenades) {
      g.t += dt / RG.lacrymo.vol;
      const t = Math.min(1, g.t);
      g.x = g.x0 + (g.x1 - g.x0) * t; g.y = g.y0 + (g.y1 - g.y0) * t;
      g.z = 0.6 * (1 - t) + 1.4 * t * (1 - t);
      if (t >= 1 && g.puree) {   // purée de la cantine : une flaque (on y avance au ralenti) et une éclaboussure
        g.fini = true; this.flaques = this.flaques || []; this.flaques.push({ x: g.x, y: g.y, t: RG.cantiniere.flaque });
        jouerSon(this, 'julien_splat', { rate: 0.6 });
        if (Math.hypot(g.x - j.x, g.y - j.y) < RG.cantiniere.rayon) this.degats(RG.cantiniere.degats, g.x, g.y);
      } else if (t >= 1) {
        g.fini = true; this.nuages.push({ x: g.x, y: g.y, t: RG.lacrymo.duree }); jouerSon(this, 'julien_gaz');
        if (Math.hypot(g.x - j.x, g.y - j.y) < 2.5) this.cameras.main.shake(150, 0.006);
      }
    }
    this.grenades = this.grenades.filter(g => !g.fini);
    if (!this.balles) this.balles = [];   // (lycée, classe : pas de LBD)
    for (const b of this.balles) {   // balles de LBD : droites et rapides ; un mur ou toi les arrêtent
      b.t += dt; b.x += b.dx * RG.lbd.balle.vitesse * dt; b.y += b.dy * RG.lbd.balle.vitesse * dt;
      if (murEn(this.plan, b.x, b.y) || b.t > 2.5) { b.fini = true; continue; }
      if (j.vie > 0 && Math.hypot(b.x - j.x, b.y - j.y) < RG.lbd.balle.rayon) {
        b.fini = true; this.degats(RG.lbd.balle.degats, b.x - b.dx, b.y - b.dy); this.cameras.main.shake(120, 0.01);
      }
    }
    this.balles = this.balles.filter(b => !b.fini);
    j.gaz = Math.max(0, j.gaz - dt * 1.5);
    for (const n of this.nuages) {
      n.t -= dt;
      for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite' && Math.hypot(e.x - n.x, e.y - n.y) < RG.lacrymo.rayon) {
        this.toucherEnnemi(e, RG.lacrymo.degatsPolice * dt, { perceBouclier: true, silencieux: true });   // ils toussent aussi !
        e.tousseT = 0.6;
      }
      if (j.vie > 0 && j.echarpe <= 0 && Math.hypot(n.x - j.x, n.y - j.y) < RG.lacrymo.rayon) {   // l'écharpe mouillée protège
        this.degats(RG.lacrymo.degats * dt);
        j.gaz = Math.min(1, j.gaz + dt * 3);
        if (this.time.now > (this.touxT || 0)) { jouerSon(this, 'julien_toux'); this.touxT = this.time.now + 1300; }
        if (j.expr !== 'aie') { j.expr = 'tousse'; j.exprT = 0.4; }
      }
    }
    this.nuages = this.nuages.filter(n => n.t > 0);
    for (const s of this.splats) s.t -= dt;
    this.splats = this.splats.filter(s => s.t > 0);
  }

  ramasser() {
    const j = this.j;
    // un manifestant (une fois chacun) te soigne quand tu passes à côté : gourde, pansement…
    if (j.vie < RG.joueur.vie) for (const o of this.objets) if (o.type === 'manifestant' && !o.soigne && Math.hypot(o.x - j.x, o.y - j.y) < 1.1) {
      o.soigne = true; j.vie = Math.min(RG.joueur.vie, j.vie + RG.soins.manifestant);
      this.message(['« Tiens, bois un coup ! »', '« Attends, je te mets un pansement ! »', '« Du sérum phy pour tes yeux ! »', '« Courage, camarade ! »'][(o.n || 0) % 4] + ` (+${RG.soins.manifestant})`, 2.5);
      jouerSon(this, 'julien_ramasse', { rate: 0.8 }); j.expr = 'content'; j.exprT = 0.9; j.or = 0.5;
      break;
    }
    for (const o of this.objets) {
      if (!o.actif || o.solide || Math.hypot(o.x - j.x, o.y - j.y) > 0.5) continue;
      if (RECHARGES[o.type]) {
        const r = RECHARGES[o.type](), nouvelle = !j.armes.has(o.type);
        if (!nouvelle && j.mun[o.type] >= r.maxi) continue;
        j.mun[o.type] = Math.min(r.maxi, j.mun[o.type] + Math.round(r.n * this.diff.munitions));
        if (nouvelle) { j.armes.add(o.type); j.arme = o.type; this.message(r.trouve, 4); if (o.type === 'eau') this.time.delayedCall(1500, () => this.ouvrirRideaux()); } else this.message(r.txt);
      } else if (BONUS[o.type]) {
        if (o.type === 'kway') { if (j.armure >= RG.bonus.kwayMaxi) continue; j.armure = Math.min(RG.bonus.kwayMaxi, j.armure + RG.bonus.kway); }
        else j[o.type] = RG.bonus[o.type];
        this.message(BONUS[o.type](), 3);
      } else if (o.type === 'pourris') {
        j.pourris = RG.pourris.nombre; j.mun.oeufs = Math.max(j.mun.oeufs, RG.pourris.nombre); if (j.armes.has('oeufs')) j.arme = 'oeufs';
        this.message(`TRÉSOR : des ŒUFS POURRIS ! Les ${RG.pourris.nombre} prochains œufs font ×${RG.pourris.degats} et passent les boucliers (ça pue !)`, 4.5);
      } else if (o.type === 'carte') {
        this.j.carte = true;
        this.message('La CARTE DE CANTINE ! Elle ouvre la PORTE DE SERVICE de la place (le rideau de fer, à droite).', 4.5);
      } else if (o.type === 'sandwich') {
        if (j.vie >= RG.joueur.vie) continue;
        j.vie = Math.min(RG.joueur.vie, j.vie + RG.sandwich);
        this.message(`Un sandwich, ça requinque ! (+${RG.sandwich})`);
      } else continue;
      o.actif = false; if (!o.lache) this.ramasses++;   // un casse-croûte lâché ne compte pas dans les objets du niveau
      jouerSon(this, 'julien_ramasse');
      j.expr = 'content'; j.exprT = 0.9; j.or = 0.6;   // petit flash doré, comme Doom
    }
  }

  finNiveau() {
    this.enJeu = false; this.termine = true; if (this.joy) this.joy.activer(false); this.libererSouris();
    jouerSon(this, 'julien_ramasse');
    etiquettesTactiles({ espace: 'OK', z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    this.txtMsg.setText(''); this.msgT = 0; this.txtBonus.setVisible(false);
    voile(this, 0.85).setDepth(1000);
    const pc = (a, b) => b ? `${Math.round(100 * a / b)}%` : '—';
    const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    texte(this, LARGEUR / 2, 70, 'LA MANIF : TERMINÉ', 40, '#ffd84a').setDepth(1001);
    const lignes = [
      ['POLICIERS', pc(this.repousses, this.total)],   // (plus d'« OBJETS » : munitions et soins sont des consommables, demande de Fabien)
      ['SECRETS', pc(this.secretsTrouves, this.secrets.size)], ['TEMPS', mmss(this.temps)], ['PAR', mmss(PAR)],
    ];
    lignes.forEach(([nom, val], n) => {   // les lignes apparaissent une par une, comme dans Doom
      this.time.delayedCall(400 + n * 450, () => {
        texte(this, LARGEUR / 2 - 40, 130 + n * 48, nom, 30, '#ff5a3c').setOrigin(1, 0.5).setDepth(1001);
        texte(this, LARGEUR / 2 + 40, 130 + n * 48, val, 30, '#ffffff').setOrigin(0, 0.5).setDepth(1001);
        jouerSon(this, 'julien_lancer');
      });
    });
    // rang : policiers 55, secrets 25, temps 20 (plein si sous le PAR) ; les objets ne comptent plus (consommables)
    const f = (a, b) => b ? a / b : 1;
    const score = 55 * f(this.repousses, this.total) + 25 * f(this.secretsTrouves, this.secrets.size)
      + 20 * Math.min(1, PAR / Math.max(1, this.temps));
    const rang = RANGS.find(r => score >= r.mini);
    Sauvegarde.marquerFait('julien_manif');   // la porte du hub propose ensuite d'aller directement en classe
    const record = Sauvegarde.proposerRecord(IDENTITE.id, rang.court, this.temps, RANGS.map(r => r.court));
    this.time.delayedCall(400 + lignes.length * 450, () => {
      texte(this, LARGEUR / 2, 382, `RANG : ${rang.nom}`, 30, '#ffd84a').setDepth(1001);
      texte(this, LARGEUR / 2, 416, `${this.diff.nom}${record.rang === rang.court && Math.abs(record.temps - this.temps) < 0.01 ? '   ★ NOUVEAU RECORD ★' : ''}`, 16, this.diff.couleur).setDepth(1001);
      jouerSon(this, 'julien_portail');
    });
    this.time.delayedCall(1000 + lignes.length * 450, () => {
      texte(this, LARGEUR / 2, 452, 'Mais Julien t\'attend en classe… salle 12, au fond du lycée.', 18, '#9fd0ff').setDepth(1001);
      // avis jouabilité : lycée déjà fini une fois => il devient FACULTATIF (▶ / 2 = direct en classe)
      const lyceeFait = Sauvegarde.fait('julien_lycee');
      texte(this, LARGEUR / 2, HAUTEUR - 28, `${estTactile() ? 'OK' : 'ESPACE'} : entrer dans le lycée` +
        (lyceeFait ? `      ${estTactile() ? '▶' : '2'} : direct en CLASSE` : ''), 20, '#aaaaaa').setDepth(1001);
      if (lyceeFait && estTactile()) etiquettesTactiles({ espace: 'OK', droite: '▶', gauche: null, haut: null, bas: null, z: null, x: null });
      this.time.delayedCall(300, () => {
        let parti = false;
        const aller = (cle) => { if (parti) return; parti = true; this.input.keyboard.off('keydown', choix); this.scene.start(cle, { depuisManif: true }); };
        const choix = (ev) => {
          if (ev.key === ' ') aller('JulienLycee');
          else if (lyceeFait && (ev.key === '2' || ev.key === 'ArrowRight')) aller('JulienClasse');
        };
        this.input.keyboard.on('keydown', choix);
      });
    });
  }

  // ------------------------------------------------------------------ tête du héros
  majVisage(dt) {
    const j = this.j;
    j.exprT -= dt;
    if (j.exprT <= 0 && j.vie > 0) j.expr = 'normal';
    j.regardT -= dt;
    if (j.regardT <= 0 && j.expr === 'normal') { j.regard = [-1, 0, 0, 1][(Math.random() * 4) | 0]; j.regardT = 0.6 + Math.random() * 1.4; }
    j.rouge = Math.max(0, j.rouge - dt * 1.5);
    if (this.msgT > 0) { this.msgT -= dt; if (this.msgT <= 0) this.txtMsg.setText(''); }
  }

  // ------------------------------------------------------------------ dessin
  imageEnnemi(e) {
    const s = T.spr, p = e.type + '_';
    const v = e.dernier === 'tomate' ? '_rouge' : e.dernier === 'propre' ? '_propre' : '';   // les images ont du jaune d'œuf
    if (e.etat === 'fuite') return s[p + 'fuite' + v] || s[p + 'fuite'];
    if (e.etat === 'touche') return s[p + 'touche' + v] || s[p + 'touche'];
    if (e.aveugle > 0 && s[p + 'farine']) return s[p + 'farine'];   // enfariné : il se frotte les yeux
    if (e.tousseT > 0 && s[p + 'tousse']) return s[p + 'tousse'];   // dans la lacrymo : il tousse
    if (e.attrapePose > 0 && s[p + 'attrape']) return s[p + 'attrape'];   // le surveillant t'attrape
    if (e.type === 'lanceur' || e.type === 'cantiniere' || e.type === 'lbd') {
      if (e.etat === 'prepare') return s[p + 'bras'];
      if (e.etat === 'lance') return s[p + 'lance'];
    } else {
      if (e.etat === 'cri') return s[p + 'cri'];
      if (e.etat === 'charge') return s[p + 'charge'];
      if (e.etat === 'essouffle') return s[p + 'essouffle'];
    }
    return s[p + ((e.bouge && (e.anim * 4 | 0) % 2) ? 'marche1' : 'marche0')];
  }

  dessiner() {
    const g = this.ctx, j = this.j, s = T.spr;
    const dx = Math.cos(j.a), dy = Math.sin(j.a);
    const cam = { x: j.x, y: j.y, dx, dy, px: -dy * FOV, py: dx * FOV };
    const liste = [];
    for (const o of this.objets) if (o.actif) {
      const t = o.type === 'manifestant' ? s['manifestant_' + (o.n % T.nbManif)] : o.type === 'eau' ? s.eau_pistolet : s[o.type];
      const haut = T.hauteurs[o.type];
      liste.push({ x: o.x, y: o.y, toile: t, haut, z: o.type === 'manifestant' ? Math.abs(Math.sin(this.time.now / 300 + o.n)) * 0.03 : 0 });
    }
    const nP = Math.hypot(cam.px, cam.py), qx = cam.px / nP, qy = cam.py / nP;
    for (const e of this.ennemis) if (e.actif) {
      liste.push({ x: e.x, y: e.y, toile: this.imageEnnemi(e), haut: T.hauteurs[e.type], z: e.perche || 0 });
      if (e.etat !== 'fuite') for (const t of e.taches || []) {   // traces d'œuf / de tomate, un peu devant lui
        liste.push({ x: e.x + qx * t.o * 0.18 - dx * 0.06, y: e.y + qy * t.o * 0.18 - dy * 0.06, toile: t.rouge ? s.splat_rouge : s.splat, haut: 0.09, z: t.h });
      }
    }
    for (const o of this.tirs) {
      if (o.genre !== 'eau' || o.t > 0.05) liste.push({ x: o.x, y: o.y, toile: s[o.genre], haut: o.genre === 'eau' ? 0.05 : T.hauteurs.oeuf, z: o.genre === 'eau' ? 0.4 : 0.42 });
    }
    for (const f of this.farines) liste.push({ x: f.x, y: f.y, toile: f.mousse && s.mousse ? s.mousse : s.nuage_farine, haut: 1.0 + (1.6 - f.t) * 0.5, z: 0 });
    for (const b of (this.balles || [])) liste.push({ x: b.x, y: b.y, toile: s.balle, haut: 0.07, z: 0.45 });
    for (const gr of this.grenades) liste.push({ x: gr.x, y: gr.y, toile: gr.puree ? s.puree : s.grenade, haut: gr.puree ? T.hauteurs.puree : T.hauteurs.grenade, z: gr.z });
    for (const sp of this.splats) liste.push({ x: sp.x, y: sp.y, toile: sp.papier && s.dessus_explosion ? s.dessus_explosion : sp.rouge ? s.splat_rouge : s.splat,
      haut: sp.papier ? 0.22 : T.hauteurs.splat, z: sp.papier ? 0.55 : 0.38 });   // papier : boulette sur Julien (la classe)
    for (const n of this.nuages) liste.push({ x: n.x, y: n.y, toile: s.nuage, haut: T.hauteurs.nuage + 0.1 * Math.sin(n.t * 3), z: 0 });

    const tps = this.time.now / 1000;   // néons des vitrines : ils grésillent
    this.decor.neonEteint = Math.sin(tps * 23) + Math.sin(tps * 3.1) > 1.3 ? 0.35 : 0;
    this.spritesEnPlus(liste);
    rendre(g, L, VUE_H, this.plan, cam, this.decor, liste);

    // la main et l'arme en bas de l'écran
    const bx = Math.sin(j.bob) * 5, by = Math.abs(Math.cos(j.bob)) * 4 + (j.changeT > 0 ? Math.sin(Math.PI * j.changeT / 0.3) * 90 : 0);   // changement d'arme : elle descend puis remonte
    if (this.confisque && this.confisque.id === j.arme) {   // arme confisquée (la classe) : la main vide qui proteste
      const v = T.main.vide; if (v) g.drawImage(v, L / 2 + 60 + bx, VUE_H - 110 + by, 120 * v.width / v.height, 120);
    }
    else if (j.arme === 'oeufs' && T.main.image) {   // vraies images (210×240) : le bras sort du bas de l'écran
      if (j.lanceT > 0) g.drawImage(T.main.lance, L / 2 + 30, VUE_H - 128, 112, 128);
      else if (j.mun.oeufs > 0) g.drawImage(T.main.tient, L / 2 + 60 + bx, VUE_H - 110 + by, 105, 120);
    } else {
      const m = T.main[j.arme] || T.main.tient, frappe = j.lanceT > 0;
      const img = frappe && j.arme !== 'eau' && T.main[j.arme + '_tir'] ? T.main[j.arme + '_tir'] : m;   // eau : le jet, ce sont les gouttes
      if (j.arme === 'eau') g.drawImage(img, L / 2 - 52 + bx * 0.5, VUE_H - 118 + by + (frappe ? 4 : 0), 112, 120);   // tenu à deux mains, au centre
      else g.drawImage(img, L / 2 + (frappe ? 30 : 60) + bx, VUE_H - (frappe ? 125 : 110) + by, j.arme === 'sono' ? 120 * img.width / img.height : 105, 120);   // (la sono : image plus large)
    }
    // petit viseur au centre
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(L / 2 - 4, VUE_H / 2 - 1, 9, 3); g.fillRect(L / 2 - 1, VUE_H / 2 - 4, 3, 9);
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(L / 2 - 3, VUE_H / 2, 7, 1); g.fillRect(L / 2, VUE_H / 2 - 3, 1, 7);
    // voile de gaz et flash rouge
    if (j.gaz > 0) { g.fillStyle = `rgba(190,205,160,${0.5 * j.gaz})`; g.fillRect(0, 0, L, VUE_H); }
    if (j.rouge > 0) { g.fillStyle = `rgba(200,0,0,${j.rouge * 0.6})`; g.fillRect(0, 0, L, VUE_H); }
    if (j.blanc > 0) { g.fillStyle = `rgba(255,255,250,${j.blanc * 0.7})`; g.fillRect(0, 0, L, VUE_H); j.blanc = Math.max(0, j.blanc - 0.03 * this.pas60()); }
    if (j.or > 0) { g.fillStyle = `rgba(255,210,80,${j.or * 0.35})`; g.fillRect(0, 0, L, VUE_H); j.or = Math.max(0, j.or - 0.04 * this.pas60()); }
    let gyro = 99;   // gyrophares des camions de CRS : flash bleu quand on est près
    for (const o of this.objets) if (o.type === 'camion') gyro = Math.min(gyro, Math.hypot(o.x - j.x, o.y - j.y));
    if (gyro < 6 && Math.sin(this.time.now / 110) > 0.2) { g.fillStyle = `rgba(60,110,255,${0.16 * (1 - gyro / 6)})`; g.fillRect(0, 0, L, VUE_H); }

    this.dessinerEnPlus(g);
    if (this.carte) this.dessinerCarte(g);
    this.dessinerBarre(g, cam);
    this.toile.refresh();
    this.txtVie.setText(`${Math.ceil(j.vie)}%`);
    this.txtMunitions.setText(`ŒUFS ${j.mun.oeufs}  TOMATES ${j.mun.tomates}  EAU ${Math.ceil(j.mun.eau)}`);
    this.txtArmure.setText(j.armure > 0 ? `K-WAY ${Math.ceil(j.armure)}` : '');
    const restants = this.ennemis.filter(e => e.parvis && e.actif && e.etat !== 'fuite').length;
    const parvis = this.zonesVues.has(ZONES.length - 1) && !this.portailOuvert ? `PARVIS : ${restants} policier${restants > 1 ? 's' : ''}` : '';
    this.txtBonus.setText([j.echarpe > 0 ? `ÉCHARPE ${Math.ceil(j.echarpe)}` : '', j.cafe > 0 ? `CAFÉ ${Math.ceil(j.cafe)}` : '', j.pourris > 0 ? `POURRIS ${j.pourris}` : '', parvis].filter(Boolean).join('   '));
    const a = armeDe(j.arme);
    this.txtArme.setText(`${ARMES.indexOf(a) + 1} · ${a.nom}`);
    this.txtOeufs.setText(a.mun ? `${Math.ceil(j.mun[a.mun])}` : '∞');
    this.txtFlics.setText(`${this.repousses} / ${this.total}`);
  }

  // Carte en filigrane façon Doom : murs déjà vus (rouge), portail (jaune), toi (flèche blanche) ; le nord en haut
  dessinerCarte(g) {
    const E = 7, j = this.j, p = this.plan, vus = this.decor.vus, W = p[0].length, H = p.length;
    const ox = Math.round(L / 2 - j.x * E), oy = Math.round(VUE_H / 2 - j.y * E);
    g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 0, L, VUE_H);
    const mur = (x, y) => murEn(p, x, y) !== 0;
    for (const [couleur, filtre] of [['rgba(255,80,60,0.9)', (c) => c !== 7], ['rgba(255,216,74,0.95)', (c) => c === 7]]) {
      g.fillStyle = couleur;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (!vus[y * W + x] || !mur(x, y) || !filtre(murEn(p, x, y))) continue;
        const X = ox + x * E, Y = oy + y * E;
        if (!mur(x, y - 1)) g.fillRect(X, Y, E + 1, 1);
        if (!mur(x, y + 1)) g.fillRect(X, Y + E, E + 1, 1);
        if (!mur(x - 1, y)) g.fillRect(X, Y, 1, E + 1);
        if (!mur(x + 1, y)) g.fillRect(X + E, Y, 1, E + 1);
      }
    }
    // repères (le lycée : le CARNET, puis la porte de la salle 12) : carré qui clignote + nom
    const clin = Math.sin(this.time.now / 160) > -0.3;
    for (const r of this.reperesCarte()) {
      const X = ox + r.x * E, Y = oy + r.y * E;
      if (clin) { g.fillStyle = r.couleur; g.fillRect(X - 4, Y - 4, 9, 9); g.fillStyle = '#000'; g.fillRect(X - 1, Y - 1, 3, 3); }
      g.font = 'bold 9px monospace'; g.textAlign = 'center'; g.fillStyle = r.couleur; g.fillText(r.nom, X, Y - 7);
    }
    const cx = L / 2, cy = VUE_H / 2, dx = Math.cos(j.a), dy = Math.sin(j.a);
    g.fillStyle = '#ffffff'; g.beginPath();
    g.moveTo(cx + dx * 6, cy + dy * 6); g.lineTo(cx - dx * 4 - dy * 4, cy - dy * 4 + dx * 4); g.lineTo(cx - dx * 4 + dy * 4, cy - dy * 4 - dx * 4);
    g.fill();
  }

  dessinerBarre(g, cam) {
    const y0 = VUE_H, j = this.j;
    g.fillStyle = '#4b4136'; g.fillRect(0, y0, L, H - y0);
    g.fillStyle = '#6a5c4c'; g.fillRect(0, y0, L, 2);
    g.fillStyle = '#2c251e'; g.fillRect(0, H - 2, L, 2);
    for (const x of [92, 236, 400]) { g.fillStyle = '#2c251e'; g.fillRect(x, y0 + 3, 2, H - y0 - 6); }
    // tête du héros au milieu, dans son cadre
    g.fillStyle = '#1a1612'; g.fillRect(L / 2 - 21, y0 + 3, 42, 44);
    const niveau = niveauVisage(j.vie, RG.joueur.vie);
    if (this.tete) {   // planche : 5 niveaux × (gauche, face, droite), puis aïe gauche, aïe droite, tousse, content, KO
      const f = { aie: j.regard > 0 ? 16 : 15, tousse: 17, content: 18, ko: 19 }[j.expr] ?? niveau * 3 + j.regard + 1;
      this.tete.setFrame(f);
    } else g.drawImage(toileVisage(niveau, j.regard, j.expr), L / 2 - 17, y0 + 5);
    // boussole vers le lycée
    if (this.sortie) {
      const ang = Math.atan2(this.sortie.y - j.y, this.sortie.x - j.x) - j.a;
      const cx = 434, cy = y0 + 32, r = 10;
      g.strokeStyle = '#c9b48a'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, r + 3, 0, Math.PI * 2); g.stroke();
      const ax = Math.sin(ang), ay = -Math.cos(ang);   // vers le haut = droit devant
      g.fillStyle = '#ffd84a'; g.beginPath();
      g.moveTo(cx + ax * r, cy + ay * r);
      g.lineTo(cx - ay * 4 - ax * 5, cy + ax * 4 - ay * 5);
      g.lineTo(cx + ay * 4 - ax * 5, cy - ax * 4 - ay * 5);
      g.fill();
    }
  }
}
