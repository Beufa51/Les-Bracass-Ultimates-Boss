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
import { jouerMusique } from '../../core/musique.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, REGLAGES as RG, DIFFICULTES, RANGS } from './reglages.js';
import { Sauvegarde } from '../../core/sauvegarde.js';
import { PLAN_MANIF, OBJETS, SECRETS, ZONES, PARVIS, PAR, ABSENTS_FACILE, RENFORTS_ANARCHISTE, RIDEAUX, FOURGON } from './niveau_manif.js';
import { rendre, murEn, vueLibre } from './raycaster.js';
import { texturesMurs, texturesSprites, texturesMain, chargerImages, appliquerImages, variantesTaches } from './textures.js';
import { construireDecor } from './decor.js';
import { installerJoystick } from './joystick.js';
import { ARMES, armeDe, RECHARGES, choisirArme, armeSuivante, tirer, avancerTirs, dansFumee } from './armes.js';
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
  constructor() { super('JulienManif', IDENTITE); }

  preload() {
    chargerImages(this);   // vraies images (assets/sprites/julien/), avant la barre de chargement commune
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
    if (!T.decor) T.decor = construireDecor(this.ctx, T.murs, L, VUE_H);   // immeubles hauts, sol, ciel (decor.js)
    this.add.image(0, 0, 'julien_vue').setOrigin(0).setScale(LARGEUR / L, HAUTEUR / H);

    this.plan = PLAN_MANIF;
    this.lireNiveau();

    // barre du bas : chiffres en haute résolution par-dessus la toile
    const yb = VUE_H * 2;
    texte(this, 92, yb + 20, 'VIE', 14, '#c9b48a');
    this.txtVie = texte(this, 92, yb + 52, '', 40, '#ff5a3c');
    this.txtArmure = texte(this, 92, yb + 84, '', 14, '#f0c818');   // K-Way
    this.txtMunitions = texte(this, 660, yb + 86, '', 12, '#c9b48a');   // tableau des munitions, comme Doom
    this.txtBonus = texte(this, 16, 44, '', 16, '#9fd8ff').setOrigin(0, 0).setStroke('#000', 4);   // bonus en cours
    this.txtArme = texte(this, 300, yb + 20, '', 14, '#c9b48a');
    this.txtOeufs = texte(this, 300, yb + 58, '', 40, '#fff2c8');
    texte(this, 660, yb + 20, 'POLICIERS REPOUSSÉS', 14, '#c9b48a');
    this.txtFlics = texte(this, 660, yb + 58, '', 32, '#9fd0ff');
    texte(this, 868, yb + 20, 'LYCÉE', 14, '#c9b48a');
    // tête du héros (vraie image, en haute résolution par-dessus la barre)
    this.tete = T.tetes ? this.add.image(LARGEUR / 2, yb + 50, 'julien_tetes', 0).setDisplaySize(82, 84) : null;
    this.txtMsg = texte(this, 16, 14, '', 18, '#ffffff').setOrigin(0, 0).setStroke('#000', 4);
    this.msgT = 0;

    this.touches = creerTouches(this);
    const K = Phaser.Input.Keyboard.KeyCodes;
    // commandes de Doom (1993), tout au clavier : Alt + ← → pas de côté (ou , et .), Ctrl tirer, Maj courir
    this.cotes = this.input.keyboard.addKeys({ alt: K.ALT, ctrl: K.CTRL, maj: K.SHIFT, virgule: K.COMMA, point: K.PERIOD,
      q: K.Q, d: K.D });
    this.touchesCarte = this.input.keyboard.addKeys({ tab: K.TAB, m: K.M });
    this.touchesArmes = this.input.keyboard.addKeys({ a1: K.ONE, a2: K.TWO, a3: K.THREE, a4: K.FOUR, a5: K.FIVE });
    this.carte = false;
    T.decor.vus = new Uint8Array(this.plan[0].length * this.plan.length);   // murs déjà vus (la carte n'affiche qu'eux)
    T.decor.speciaux = this.indicesSecrets();
    this.installerBoutonCarte();
    this.bloquerRaccourcisNavigateur();
    this.agrandirCroix();
    this.joy = RG.joueur.tactile.joystick ? installerJoystick(this) : null;   // téléphone : joystick à gauche (sinon la croix)
    this.tactile = estTactile();   // téléphone : croix = avancer / reculer / pas de côté, ↺ ↻ = tourner, ŒUF en haut
    this.enJeu = false;
    jouerMusique(this, 'julien_musique');   // « At Doom's Gate », en boucle
    jouerMusique(this, 'julien_foule');     // ambiance de manif par-dessus
    this.dessiner(0);
    this.diff = DIFFICULTES[Sauvegarde.difficulte(IDENTITE.id)] || DIFFICULTES.bloqueur;
    if (this.donnees.rejouer) { this.appliquerDifficulte(); this.time.delayedCall(60, () => this.demarrer()); }   // « recommencer » : direct
    else this.choisirDifficulte(() => this.time.delayedCall(120, () => this.intro()));
  }

  intro() {
    const tact = estTactile();
    this.afficherIntro('LA MANIF', [
      'Rejoins le portail du LYCÉE à travers la manif !',
      tact ? (this.joy ? 'Joystick (pouce gauche) : avancer, reculer, pas de côté' : '▲ ▼ : avancer / reculer      ◀ ▶ : pas de côté') : '↑ ↓ : avancer / reculer      ← → : tourner',
      tact ? '↺ ↻ : tourner' : 'ALT + ← → (ou , et .) : pas de côté',
      tact ? 'LANCER : tirer      ARME (au-dessus) : changer d\'arme' : 'CTRL : tirer   1 à 5 : armes   MAJ : courir',
      tact ? 'CARTE (en haut à droite) : la carte, comme dans Doom' : 'TAB ou M : la carte, comme dans Doom',
      'Les lacrymos piquent : sors vite du nuage.',
      'Le bouclier arrête les œufs, SAUF quand le CRS',
      'est essoufflé après sa charge : esquive de côté puis vise !',
    ], () => this.demarrer());
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
  perdu() {
    if (this.termine) return;
    this.termine = true;
    if (this.joy) this.joy.activer(false);
    jouerSon(this, 'ui_defaite');
    etiquettesTactiles({ espace: 'REJOUER', x: 'HUB', z: null, haut: null, bas: null, gauche: null, droite: null });
    voile(this, 0.75).setDepth(1000);
    texte(this, LARGEUR / 2, 170, 'GAZÉ !', 56, '#ff6b6b').setDepth(1001);
    texte(this, LARGEUR / 2, 250, 'Les CRS t\'ont renvoyé chez toi. Le lycée attendra…', 22, '#ffffff').setDepth(1001);
    texte(this, LARGEUR / 2, 360, `${estTactile() ? 'REJOUER' : 'ESPACE'} : recommencer tout de suite`, 24, '#7fff7f').setDepth(1001);
    texte(this, LARGEUR / 2, 400, `${estTactile() ? 'HUB' : 'X'} : retour au hub`, 18, '#aaaaaa').setDepth(1001);
    this.time.delayedCall(600, () => {
      this.input.keyboard.once('keydown-SPACE', () => this.scene.restart({ rejouer: true }));
      this.input.keyboard.once('keydown-X', () => this.retourHub());
    });
  }

  // Menu des difficultés façon Doom (▲ ▼ puis ESPACE / OK) ; le choix est retenu
  choisirDifficulte(suite) {
    const noms = Object.keys(DIFFICULTES);
    let i = Math.max(0, noms.indexOf(Sauvegarde.difficulte(IDENTITE.id)));
    if (i === 0 && !DIFFICULTES[Sauvegarde.difficulte(IDENTITE.id)]) i = 2;
    const el = [voile(this, 0.85).setDepth(1000), texte(this, LARGEUR / 2, 90, 'CHOISIS TA DIFFICULTÉ', 36, '#ffd84a').setDepth(1001)];
    const lignes = noms.map((n, k) => texte(this, LARGEUR / 2, 180 + k * 56, DIFFICULTES[n].nom, 28, DIFFICULTES[n].couleur).setDepth(1001));
    const aide = texte(this, LARGEUR / 2, 420, '', 18, '#ffffff').setDepth(1001);
    const bas = texte(this, LARGEUR / 2, HAUTEUR - 40, `▲ ▼ : choisir      ${estTactile() ? 'OK' : 'ESPACE'} : valider`, 18, '#aaaaaa').setDepth(1001);
    const maj = () => { lignes.forEach((l, k) => l.setAlpha(k === i ? 1 : 0.35).setScale(k === i ? 1.1 : 1)); aide.setText(DIFFICULTES[noms[i]].texte); };
    maj();
    const touche = (ev) => {
      if (ev.key === 'ArrowUp') { i = (i + noms.length - 1) % noms.length; maj(); jouerSon(this, 'julien_lancer'); }
      else if (ev.key === 'ArrowDown') { i = (i + 1) % noms.length; maj(); jouerSon(this, 'julien_lancer'); }
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

  // ------------------------------------------------------------------ niveau
  lireNiveau() {
    const j = RG.joueur;
    this.j = { x: 2.5, y: 2.5, a: -Math.PI / 2, vie: j.vie, recharge: 0,
      mun: { oeufs: RG.oeufs.depart, tomates: 0, eau: 0, fumigenes: 0 }, armes: new Set(['pancarte', 'oeufs']), arme: 'oeufs', armure: 0, echarpe: 0, cafe: 0, lanceT: 0, bob: 0,
      regard: 0, regardT: 1.2, expr: 'normal', exprT: 0, rouge: 0, gaz: 0 };
    this.ennemis = []; this.objets = []; this.tirs = []; this.fumees = []; this.grenades = []; this.nuages = []; this.splats = [];
    this.sortie = null;
    this.secrets = new Map(); this.secretsTrouves = 0;
    this.rideaux = []; this.farines = []; this.fourgonFait = false; this.fourgonT = FOURGON.attente;
    let nm = 0;
    this.plan = this.plan.map((ligne, y) => [...ligne].map((c, x) => {
      const px = x + 0.5, py = y + 0.5;
      if (c === 'J') { this.j.x = px; this.j.y = py; return '.'; }
      if (c === 'S') return '.';
      if (SECRETS[c]) { this.secrets.set(`${x},${y}`, true); return SECRETS[c]; }
      if (RIDEAUX[c]) { this.rideaux.push([x, y]); return RIDEAUX[c]; }
      const type = OBJETS[c];
      if (!type) return c;
      if (type === 'lanceur' || type === 'bouclier') {
        this.ajouterEnnemi(type, x, y);
      } else {
        const solide = !RECHARGES[type] && !BONUS[type] && type !== 'sandwich';
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

  // Alt + ← / → (pas de côté, comme Doom) = « page précédente / suivante » pour le navigateur : on l'en empêche
  // pendant la manif ; et si le navigateur revient quand même en arrière, on reste sur le jeu.
  bloquerRaccourcisNavigateur() {
    const touche = (e) => {
      if (e.altKey && e.key && e.key.startsWith('Arrow')) e.preventDefault();
      if (e.key === 'Alt') e.preventDefault();   // Alt seul : pas de menu du navigateur
    };
    const retour = () => history.pushState({ manif: true }, '');
    // APRÈS Phaser (il ignore les touches déjà « bloquées ») : on s'inscrit en dernier, sans « capture »
    window.addEventListener('keydown', touche);
    window.addEventListener('keyup', touche);
    history.pushState({ manif: true }, '');
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
    }
    if (j.vie <= 0) {
      j.expr = 'ko'; j.exprT = 99;
      this.enJeu = false;
      this.time.delayedCall(1200, () => this.perdu());
    }
  }

  // ------------------------------------------------------------------ boucle
  update(temps, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    if (this.enJeu && !this.termine) {
      if (vientDAppuyer(this.touchesCarte.tab) || vientDAppuyer(this.touchesCarte.m)) this.carte = !this.carte;
      ['a1', 'a2', 'a3', 'a4', 'a5'].forEach((t, i) => { if (vientDAppuyer(this.touchesArmes[t])) choisirArme(this, ARMES[i].id); });
      this.bougerJoueur(dt);
      this.ennemis.forEach(e => this.ia(e, dt));
      this.projectiles(dt);
      this.ramasser();
      this.temps += dt;
      this.j.echarpe = Math.max(0, this.j.echarpe - dt); this.j.cafe = Math.max(0, this.j.cafe - dt);
      const j = this.j;
      ZONES.forEach((z, i) => {   // message à la première entrée dans une zone
        if (!this.zonesVues.has(i) && j.x >= z.x0 && j.x < z.x1 + 1 && j.y >= z.y0 && j.y < z.y1 + 1) { this.zonesVues.add(i); this.message(this.portailOuvert && z.ouvert ? z.ouvert : z.texte, 4.5); }
      });
      this.majFourgon(dt);
      if (!this.portailOuvert && this.fourgonFait && this.ennemis.every(e => !e.parvis || !e.actif || e.etat === 'fuite')) this.ouvrirPortail();
      this.j.changeT = Math.max(0, (this.j.changeT || 0) - dt);
      for (const f of this.farines) f.t -= dt;
      this.farines = this.farines.filter(f => f.t > 0);
      if (this.sortieCases.has(`${j.x | 0},${j.y | 0}`)) this.finNiveau();
    }
    this.majVisage(dt);
    this.dessiner(dt);
  }

  bougerJoueur(dt) {
    const j = this.j, k = this.touches, c = this.cotes, R = RG.joueur;
    // Clavier (Doom 93) : ← → tournent, Alt + ← → = pas de côté.
    // Téléphone (demande de Fabien) : ◀ ▶ = pas de côté ; boutons ↺ (touche Z) et ↻ (Espace) = tourner ; ŒUF (touche X).
    const modeCote = this.tactile || c.alt.isDown || k.x.isDown;
    const maj = !this.tactile && (c.maj.isDown || k.espace.isDown);
    const course = this.tactile ? (R.tactile.courir ? R.course : 1) : ((R.toujoursCourir ? !maj : maj) ? R.course : 1);   // toujours courir : Maj fait marcher
    let tourne = 0, avance = 0, cote = 0;
    if (k.gauche.isDown) { if (modeCote) cote -= 1; else tourne -= 1; }
    if (k.droite.isDown) { if (modeCote) cote += 1; else tourne += 1; }
    if (c.virgule.isDown || c.q.isDown) cote -= 1;
    if (c.point.isDown || c.d.isDown) cote += 1;
    if (this.tactile) {
      if (!k.espace.isDown) this.okRelache = true;   // le OK du départ (même bouton que ↻) ne fait pas tourner
      if (k.z.isDown) tourne -= 1;
      if (k.espace.isDown && this.okRelache) tourne += 1;
    }
    if (k.haut.isDown) avance += course;
    if (k.bas.isDown) avance -= course;
    cote = Math.sign(cote) * course;
    if (this.joy) { const jv = this.joy.valeur(); avance += jv.y; cote += jv.x; }   // joystick : en douceur
    j.a += tourne * (this.tactile ? R.tactile.rotation : R.rotation) * dt;
    const dx = Math.cos(j.a), dy = Math.sin(j.a);
    const v = j.cafe > 0 ? RG.bonus.cafeVitesse : 1;   // café serré : plus rapide
    const mx = (dx * avance * R.vitesse + -dy * cote * R.vitesseCote) * dt * v;
    const my = (dy * avance * R.vitesse + dx * cote * R.vitesseCote) * dt * v;
    this.deplacer(j, mx, my, R.rayon);
    if (mx || my) j.bob += dt * 9;
    // mur secret : il s'ouvre quand on pousse dedans en avançant
    if (avance > 0) {
      const k = `${(j.x + dx * 0.5) | 0},${(j.y + dy * 0.5) | 0}`;
      if (this.secrets.get(k)) this.ouvrirSecret(k);
    }
    // les policiers ne se traversent pas
    for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite') {
      const d = Math.hypot(j.x - e.x, j.y - e.y);
      if (d < 0.55 && d > 0.001) this.deplacer(j, (j.x - e.x) / d * (0.55 - d), (j.y - e.y) / d * (0.55 - d), R.rayon);
    }

    j.recharge -= dt; j.lanceT -= dt;
    const appui = this.tactile ? k.x.isDown : (k.z.isDown || c.ctrl.isDown);
    const nouveau = this.tactile ? vientDAppuyer(k.x) : (vientDAppuyer(k.z) || vientDAppuyer(c.ctrl));
    tirer(this, dx, dy, appui, nouveau);
  }

  // plusieurs policiers mis en fuite en moins de 3 s : « OMELETTE ×N ! »
  combo() {
    const t = this.time.now;
    this.comboN = t - (this.comboT || -1e9) < 3000 ? (this.comboN || 1) + 1 : 1;
    this.comboT = t;
    if (this.comboN < 2) return;
    const txt = texte(this, LARGEUR / 2, 150, `OMELETTE ×${this.comboN} !`, 44, '#ffd84a').setDepth(50).setScale(0.4);
    this.tweens.add({ targets: txt, scale: 1, duration: 180, ease: 'Back.out' });
    this.tweens.add({ targets: txt, alpha: 0, y: 120, delay: 900, duration: 500, onComplete: () => txt.destroy() });
    jouerSon(this, 'julien_ramasse', { rate: 1.2 });
  }

  // Aide à la visée : un œuf lancé presque vers un policier (écart < aide) part droit sur lui
  viser(dx, dy) {
    const j = this.j;
    let meilleur = this.tactile ? RG.oeufs.aideTactile : RG.oeufs.aide, vx = dx, vy = dy;
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
      g.font = `bold ${14 * u}px monospace`; g.fillStyle = '#ffe14a'; g.textAlign = 'center';
      g.fillText('↘?', 46 * u, 58 * u);
      m.set(y * W + x, c);
    }
    return m;
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
    this.farines.push({ x: sac.x, y: sac.y, t: 1.6 });
    jouerSon(this, 'julien_farine');
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
    const voit = j.vie > 0 && !e.aveugle && d < R.vue && vueLibre(this.plan, e.x, e.y, j.x, j.y) && !dansFumee(this, e.x, e.y) && !dansFumee(this, j.x, j.y);
    if (voit) { e.vuX = j.x; e.vuY = j.y; if (!e.alerte) { e.alerte = true; e.t = 0.6 + Math.random() * 0.6; this.alerter(e.x, e.y, 6); jouerSon(this, 'julien_halte', { rate: e.type === 'bouclier' ? 0.8 : 1 }); } }
    e.t -= dt; e.bouge = false;
    const marcher = (vx, vy, vitesse) => {
      const n = Math.hypot(vx, vy); if (n < 0.01) return true;
      e.bouge = true; e.anim += dt;
      return this.deplacer(e, vx / n * vitesse * dt, vy / n * vitesse * dt, 0.28);
    };

    if (e.etat === 'fuite') {
      marcher(-ox, -oy, 2.6);
      if (e.t <= 0) e.actif = false;
      return;
    }
    if (e.etat === 'touche') { if (e.t <= 0) { e.etat = e.apres; e.t = e.tApres; } return; }

    if (e.type === 'lanceur') {
      if (e.etat === 'attente') { if (e.alerte) e.etat = 'chasse'; else if (e.ronde) this.ronde(e, marcher, dt); return; }
      if (e.etat === 'chasse') {
        if (voit) {
          if (d > R.distance + 0.6) marcher(ox, oy, R.vitesse);
          else if (d < R.distance - 1.2) marcher(-ox, -oy, R.vitesse);
          if (e.t <= 0) { e.etat = 'prepare'; e.t = R.preavis; }
        } else if (Math.hypot(e.vuX - e.x, e.vuY - e.y) > 0.3) marcher(e.vuX - e.x, e.vuY - e.y, R.vitesse);
        return;
      }
      if (e.etat === 'prepare' && e.t <= 0) {
        this.grenades.push({ x0: e.x, y0: e.y, x1: j.x, y1: j.y, t: 0, x: e.x, y: e.y, z: 0.6 });
        jouerSon(this, 'julien_tir');
        e.etat = 'lance'; e.t = 0.35;
        return;
      }
      if (e.etat === 'lance' && e.t <= 0) { e.etat = 'chasse'; e.t = R.cadence * this.diff.cadence * (0.8 + Math.random() * 0.4); }
      return;
    }

    // CRS au bouclier
    if (e.etat === 'attente') { if (e.alerte) e.etat = 'approche'; else if (e.ronde) this.ronde(e, marcher, dt); return; }
    if (e.etat === 'approche') {
      if (voit) {
        if (d > 1) marcher(ox, oy, R.vitesse);
        if (d < R.porteeCharge && e.t <= 0) { e.etat = 'cri'; e.t = R.preavis; jouerSon(this, 'julien_cri'); this.message('« DISPERSEZ-VOUS ! »'); }
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

  // degats : 1 = un œuf ; options : recul [dx, dy], perceBouclier (fumée), silencieux (eau, fumée : pas de son ni de sursaut)
  // tache : 'oeuf' (jaune), 'tomate' (rouge) ou null (pancarte, eau, fumée : pas de trace)
  toucherEnnemi(e, degats = 1, { recul = null, perceBouclier = false, silencieux = false, tache = null } = {}) {
    if (recul) this.deplacer(e, recul[0], recul[1], 0.28);
    if (e.type === 'bouclier' && e.etat !== 'essouffle' && !perceBouclier) { if (!silencieux) jouerSon(this, 'julien_plonk'); return; }
    e.vie -= degats;
    e.dernier = tache || 'propre';   // pour l'image « touché » / « fuite » : jaune, rouge ou sans trace
    // il garde la trace : jaune d'œuf ou tomate sur l'uniforme (4 au plus)
    if (tache && (e.taches || (e.taches = [])).length < 4) e.taches.push({ o: Math.random() * 1.6 - 0.8, h: 0.3 + Math.random() * 0.35, rouge: tache === 'tomate' });
    if (!silencieux) jouerSon(this, 'julien_splat');
    if (e.vie <= 0) {
      e.etat = 'fuite'; e.t = 1.8; this.repousses++;
      jouerSon(this, 'julien_fuite');
      this.combo();
      this.message(['Il s\'enfuit tout dégoulinant !', 'Omelette !', 'Un de moins !', 'Retour au commissariat !'][this.repousses % 4]);
      this.j.expr = 'content'; this.j.exprT = 0.9;
      return;
    }
    if (!e.alerte) { e.alerte = true; e.vuX = this.j.x; e.vuY = this.j.y; e.etat = e.type === 'lanceur' ? 'chasse' : 'approche'; }
    if (silencieux || e.etat === 'touche') return;
    if (e.type === 'lanceur' && e.etat === 'prepare') return;   // le lancer part quand même
    e.apres = e.etat; e.tApres = e.t; e.etat = 'touche'; e.t = 0.22;
  }

  projectiles(dt) {
    const j = this.j;
    avancerTirs(this, dt);   // œufs, tomates, eau, fumigènes (armes.js)
    // grenades lacrymogènes : vol en cloche, puis nuage
    for (const g of this.grenades) {
      g.t += dt / RG.lacrymo.vol;
      const t = Math.min(1, g.t);
      g.x = g.x0 + (g.x1 - g.x0) * t; g.y = g.y0 + (g.y1 - g.y0) * t;
      g.z = 0.6 * (1 - t) + 1.4 * t * (1 - t);
      if (t >= 1) {
        g.fini = true; this.nuages.push({ x: g.x, y: g.y, t: RG.lacrymo.duree }); jouerSon(this, 'julien_gaz');
        if (Math.hypot(g.x - j.x, g.y - j.y) < 2.5) this.cameras.main.shake(150, 0.006);
      }
    }
    this.grenades = this.grenades.filter(g => !g.fini);
    j.gaz = Math.max(0, j.gaz - dt * 1.5);
    for (const n of this.nuages) {
      n.t -= dt;
      for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite' && Math.hypot(e.x - n.x, e.y - n.y) < RG.lacrymo.rayon) {
        this.toucherEnnemi(e, RG.lacrymo.degatsPolice * dt, { perceBouclier: true, silencieux: true });   // ils toussent aussi !
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
      } else if (o.type === 'sandwich') {
        if (j.vie >= RG.joueur.vie) continue;
        j.vie = Math.min(RG.joueur.vie, j.vie + RG.sandwich);
        this.message(`Un sandwich, ça requinque ! (+${RG.sandwich})`);
      } else continue;
      o.actif = false; this.ramasses++;
      jouerSon(this, 'julien_ramasse');
      j.expr = 'content'; j.exprT = 0.9; j.or = 0.6;   // petit flash doré, comme Doom
    }
  }

  finNiveau() {
    this.enJeu = false; this.termine = true; if (this.joy) this.joy.activer(false);
    jouerSon(this, 'julien_ramasse');
    etiquettesTactiles({ espace: 'OK', z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    this.txtMsg.setText(''); this.msgT = 0; this.txtBonus.setVisible(false);
    voile(this, 0.85).setDepth(1000);
    const pc = (a, b) => b ? `${Math.round(100 * a / b)}%` : '—';
    const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    texte(this, LARGEUR / 2, 70, 'LA MANIF : TERMINÉ', 40, '#ffd84a').setDepth(1001);
    const lignes = [
      ['POLICIERS', pc(this.repousses, this.total)], ['OBJETS', pc(this.ramasses, this.totalObjets)],
      ['SECRETS', pc(this.secretsTrouves, this.secrets.size)], ['TEMPS', mmss(this.temps)], ['PAR', mmss(PAR)],
    ];
    lignes.forEach(([nom, val], n) => {   // les lignes apparaissent une par une, comme dans Doom
      this.time.delayedCall(400 + n * 450, () => {
        texte(this, LARGEUR / 2 - 40, 130 + n * 48, nom, 30, '#ff5a3c').setOrigin(1, 0.5).setDepth(1001);
        texte(this, LARGEUR / 2 + 40, 130 + n * 48, val, 30, '#ffffff').setOrigin(0, 0.5).setDepth(1001);
        jouerSon(this, 'julien_lancer');
      });
    });
    // rang : policiers 50, secrets 20, objets 10, temps 20 (plein si sous le PAR)
    const f = (a, b) => b ? a / b : 1;
    const score = 50 * f(this.repousses, this.total) + 20 * f(this.secretsTrouves, this.secrets.size) + 10 * f(this.ramasses, this.totalObjets)
      + 20 * Math.min(1, PAR / Math.max(1, this.temps));
    const rang = RANGS.find(r => score >= r.mini);
    const record = Sauvegarde.proposerRecord(IDENTITE.id, rang.court, this.temps, RANGS.map(r => r.court));
    this.time.delayedCall(400 + lignes.length * 450, () => {
      texte(this, LARGEUR / 2, 382, `RANG : ${rang.nom}`, 30, '#ffd84a').setDepth(1001);
      texte(this, LARGEUR / 2, 416, `${this.diff.nom}${record.rang === rang.court && Math.abs(record.temps - this.temps) < 0.01 ? '   ★ NOUVEAU RECORD ★' : ''}`, 16, this.diff.couleur).setDepth(1001);
      jouerSon(this, 'julien_portail');
    });
    this.time.delayedCall(1000 + lignes.length * 450, () => {
      texte(this, LARGEUR / 2, 452, 'Mais Julien t\'attend en classe… (niveau 2 bientôt)', 18, '#9fd0ff').setDepth(1001);
      texte(this, LARGEUR / 2, HAUTEUR - 28, `${estTactile() ? 'OK' : 'ESPACE'} : retour au hub`, 20, '#aaaaaa').setDepth(1001);
      this.attendreRetour(300);
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
    if (e.type === 'lanceur') {
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
      liste.push({ x: e.x, y: e.y, toile: this.imageEnnemi(e), haut: T.hauteurs[e.type], z: 0 });
      if (e.etat !== 'fuite') for (const t of e.taches || []) {   // traces d'œuf / de tomate, un peu devant lui
        liste.push({ x: e.x + qx * t.o * 0.18 - dx * 0.06, y: e.y + qy * t.o * 0.18 - dy * 0.06, toile: t.rouge ? s.splat_rouge : s.splat, haut: 0.09, z: t.h });
      }
    }
    for (const o of this.tirs) {
      if (o.genre === 'fumi') liste.push({ x: o.x, y: o.y, toile: s.fumi, haut: 0.14, z: o.z });
      else if (o.genre !== 'eau' || o.t > 0.05) liste.push({ x: o.x, y: o.y, toile: s[o.genre], haut: o.genre === 'eau' ? 0.05 : T.hauteurs.oeuf, z: o.genre === 'eau' ? 0.4 : 0.42 });
    }
    for (const f of this.farines) liste.push({ x: f.x, y: f.y, toile: s.nuage_farine, haut: 1.0 + (1.6 - f.t) * 0.5, z: 0 });
    for (const f of this.fumees) liste.push({ x: f.x, y: f.y, toile: s.fumee, haut: 1.3 + 0.1 * Math.sin(f.t * 2), z: 0 });
    for (const gr of this.grenades) liste.push({ x: gr.x, y: gr.y, toile: s.grenade, haut: T.hauteurs.grenade, z: gr.z });
    for (const sp of this.splats) liste.push({ x: sp.x, y: sp.y, toile: sp.rouge ? s.splat_rouge : s.splat, haut: T.hauteurs.splat, z: 0.38 });
    for (const n of this.nuages) liste.push({ x: n.x, y: n.y, toile: s.nuage, haut: T.hauteurs.nuage + 0.1 * Math.sin(n.t * 3), z: 0 });

    const tps = this.time.now / 1000;   // néons des vitrines : ils grésillent
    T.decor.neonEteint = Math.sin(tps * 23) + Math.sin(tps * 3.1) > 1.3 ? 0.35 : 0;
    rendre(g, L, VUE_H, this.plan, cam, T.decor, liste);

    // la main et l'arme en bas de l'écran
    const bx = Math.sin(j.bob) * 5, by = Math.abs(Math.cos(j.bob)) * 4 + (j.changeT > 0 ? Math.sin(Math.PI * j.changeT / 0.3) * 90 : 0);   // changement d'arme : elle descend puis remonte
    if (j.arme === 'oeufs' && T.main.image) {   // vraies images (210×240) : le bras sort du bas de l'écran
      if (j.lanceT > 0) g.drawImage(T.main.lance, L / 2 + 30, VUE_H - 128, 112, 128);
      else if (j.mun.oeufs > 0) g.drawImage(T.main.tient, L / 2 + 60 + bx, VUE_H - 110 + by, 105, 120);
    } else {
      const m = T.main[j.arme] || T.main.tient, frappe = j.lanceT > 0;
      const img = frappe && j.arme !== 'eau' && T.main[j.arme + '_tir'] ? T.main[j.arme + '_tir'] : m;   // eau : le jet, ce sont les gouttes
      if (j.arme === 'eau') g.drawImage(img, L / 2 - 52 + bx * 0.5, VUE_H - 118 + by + (frappe ? 4 : 0), 112, 120);   // tenu à deux mains, au centre
      else g.drawImage(img, L / 2 + (frappe ? 30 : 60) + bx, VUE_H - (frappe ? 125 : 110) + by, 105, 120);
    }
    // petit viseur au centre
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(L / 2 - 4, VUE_H / 2 - 1, 9, 3); g.fillRect(L / 2 - 1, VUE_H / 2 - 4, 3, 9);
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(L / 2 - 3, VUE_H / 2, 7, 1); g.fillRect(L / 2, VUE_H / 2 - 3, 1, 7);
    // voile de gaz et flash rouge
    if (j.gaz > 0) { g.fillStyle = `rgba(190,205,160,${0.5 * j.gaz})`; g.fillRect(0, 0, L, VUE_H); }
    if (j.rose > 0) { g.fillStyle = `rgba(230,120,190,${0.35 * j.rose})`; g.fillRect(0, 0, L, VUE_H); }
    if (j.rouge > 0) { g.fillStyle = `rgba(200,0,0,${j.rouge * 0.6})`; g.fillRect(0, 0, L, VUE_H); }
    if (j.blanc > 0) { g.fillStyle = `rgba(255,255,250,${j.blanc * 0.7})`; g.fillRect(0, 0, L, VUE_H); j.blanc = Math.max(0, j.blanc - 0.03); }
    if (j.or > 0) { g.fillStyle = `rgba(255,210,80,${j.or * 0.35})`; g.fillRect(0, 0, L, VUE_H); j.or = Math.max(0, j.or - 0.04); }
    let gyro = 99;   // gyrophares des camions de CRS : flash bleu quand on est près
    for (const o of this.objets) if (o.type === 'camion') gyro = Math.min(gyro, Math.hypot(o.x - j.x, o.y - j.y));
    if (gyro < 6 && Math.sin(this.time.now / 110) > 0.2) { g.fillStyle = `rgba(60,110,255,${0.16 * (1 - gyro / 6)})`; g.fillRect(0, 0, L, VUE_H); }

    if (this.carte) this.dessinerCarte(g);
    this.dessinerBarre(g, cam);
    this.toile.refresh();
    this.txtVie.setText(`${Math.ceil(j.vie)}%`);
    this.txtMunitions.setText(`ŒUFS ${j.mun.oeufs}  TOMATES ${j.mun.tomates}  EAU ${Math.ceil(j.mun.eau)}  FUMI ${j.mun.fumigenes}`);
    this.txtArmure.setText(j.armure > 0 ? `K-WAY ${Math.ceil(j.armure)}` : '');
    const restants = this.ennemis.filter(e => e.parvis && e.actif && e.etat !== 'fuite').length;
    const parvis = this.zonesVues.has(ZONES.length - 1) && !this.portailOuvert ? `PARVIS : ${restants} policier${restants > 1 ? 's' : ''}` : '';
    this.txtBonus.setText([j.echarpe > 0 ? `ÉCHARPE ${Math.ceil(j.echarpe)}` : '', j.cafe > 0 ? `CAFÉ ${Math.ceil(j.cafe)}` : '', parvis].filter(Boolean).join('   '));
    const a = armeDe(j.arme);
    this.txtArme.setText(`${ARMES.indexOf(a) + 1} · ${a.nom}`);
    this.txtOeufs.setText(a.mun ? `${Math.ceil(j.mun[a.mun])}` : '∞');
    this.txtFlics.setText(`${this.repousses} / ${this.total}`);
  }

  // Carte en filigrane façon Doom : murs déjà vus (rouge), portail (jaune), toi (flèche blanche) ; le nord en haut
  dessinerCarte(g) {
    const E = 7, j = this.j, p = this.plan, vus = T.decor.vus, W = p[0].length, H = p.length;
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
