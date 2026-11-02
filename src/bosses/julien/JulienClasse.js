// Boss Julien — NIVEAU 2 : LA SALLE DE CLASSE (même moteur 3D que la manif, JulienManif.js dont elle hérite).
// Combat refait d'après l'audit (propositions/julien_audit_classe.md, partie B). Réglages : RG.julien et RG.classe.
// - FENÊTRE DE PUNITION : après chaque grosse attaque, Julien écrit au tableau DE DOS (« Notez bien ! ») :
//   dégâts ×2, les élèves chuchotent « VAS-Y ! ». Esquiver → foncer → punir.
// - Chaque attaque a SON préavis et SA réponse : livre / éventail (pas de côté), MUR DE COPIES avec un trou (s'y
//   placer), DICO qui rebondit (s'éloigner des murs), « AU TABLEAU ! » qui t'attire (courir vers le fond, se coller
//   à une table), « CONFISQUÉ ! » si tu es trop près (il prend ta sarbacane 8 s), CRAIES en rafale (derrière une
//   table), RÈGLE au contact (reculer).
// - Phases : 1 cours normal ; 2 « INTERRO SURPRISE » (mur de copies, dico, « au tableau ») ; 3 « RETENUE ! » : bureau
//   RENVERSÉ (son abri : contourne-le), alarme incendie et sprinklers (le sol glisse), il se retourne plus souvent.
//   (Le noir + rétroprojecteur de la phase 2 a été retiré : demande de Fabien.)
// - Élèves assis qui réagissent. Dans le lycée, les armes de la manif sont INTERDITES : seulement la SARBACANE.
import { JulienManif } from './JulienManif.js';
import { texte } from '../../core/ui.js';
import { LARGEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { estTactile } from '../../core/tactile.js';
import { REGLAGES as RG, DIFFICULTES } from './reglages.js';
import { armeDe } from './armes.js';
import { murEn, vueLibre } from './raycaster.js';
import { PLAN_CLASSE, OBJETS_CLASSE, RAYONS_CLASSE, ESTRADE, BUREAU_RENVERSE, REPLIQUES, ELEVES } from './niveau_classe.js';
import { construireDecorClasse, spritesClasse, HAUTEURS_CLASSE } from './decor_classe.js';
import { VueDessus, DESSUS_IMAGES } from './dessus.js';

const L = 480, VUE_H = 222;   // comme JulienManif
const hasard = (liste) => liste[(Math.random() * liste.length) | 0];
// vraies images des murs de la classe (outils/julien/decouper_planches.py) : code du plan → image
const MURS_IMAGES = { 1: 'mur_classe', 3: 'fenetres_classe', 4: 'porte_classe', 5: 'tableau_0', 6: 'tableau_1', 7: 'tableau_2', a: 'mur_classe_affiche' };
// vraies images des objets (table avec sa chaise, bureau, projectiles) et leur hauteur dans le monde
const OBJETS_IMAGES = ['table', 'bureau', 'livre', 'dico', 'copie', 'craie'];
const HAUTEURS_IMAGES_CLASSE = { table: 0.72, bureau: 0.62, livre: 0.15, dico: 0.17, copie: 0.15, craie: 0.06 };
const POSES_PROF = ['marche0', 'marche1', 'bras', 'lance', 'touche', 'dos', 'rage', 'vaincu'];
const ELEVES_IMAGES = [0, 1, 2, 3].flatMap(k => [`eleve_${k}_content`, `eleve_${k}_cache`]);
const GROSSES = new Set(['eventail', 'mur', 'murs', 'deluge', 'dico', 'aimant', 'rafale']);   // après elles : il se retourne (fenêtre de punition)
// ce qu'on annonce en grand quand il prépare une attaque, et le conseil la 1re fois
const ANNONCES = {
  mur: ['SORTEZ UNE FEUILLE !', 'Des MURS DE COPIES en rafale : suis le TROU, il se déplace à chaque mur !'],
  dico: ['LE DICTIONNAIRE !', 'Il rebondit sur les murs : reste loin des murs !'],
  aimant: ['AU TABLEAU !', 'Il t\'attire : COURS vers le fond ou colle-toi à une table !'],
  confisque: ['DONNE-MOI ÇA !', 'Trop près : il va CONFISQUER ta sarbacane. Recule !'],
  regle: ['LA RÈGLE !', 'Au contact, il frappe : RECULE !'],
  craies: ['CRAIES !', 'Des craies en rafale : planque-toi derrière une TABLE !'],
  deluge: ['CONTRÔLE SURPRISE !', 'Une PLUIE de copies : planque-toi derrière une TABLE ou faufile-toi dans les trous !'],
  murs: ['RECOPIEZ CENT FOIS !', 'Encore plus de murs, plus vite : suis le TROU qui zigzague !'],
};

// Dessin provisoire de la main qui tient la sarbacane (stylo Bic vidé), en gros pixels comme les vraies mains :
// dessiné en 35 × 40 puis agrandi ×3 (105 × 120). souffle : la boulette part (joues… non : un petit nuage de souffle).
export function mainSarbacane(souffle) {
  const p = document.createElement('canvas'); p.width = 35; p.height = 40;
  const g = p.getContext('2d');
  const R = (c, x, y, l = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, l, h); };
  const O = (c, x, y, rx, ry) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  // le tube : du poing vers le viseur (en haut à gauche) ; plastique transparent, fin contour, reflet blanc
  const tube = (x0, y0, x1, y1, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  tube(22, 24, 7, 5, 4.2, '#4d5d7a'); tube(22, 24, 7, 5, 2.6, '#dfe7f2'); tube(21, 22, 8, 6, 0.9, '#ffffff');
  tube(20, 22, 9, 8, 0.8, '#b8c6da');
  R('#1d3fa8', 5, 3, 3, 3); R('#3a64d8', 6, 3, 1, 1);   // le bout bleu (bouchon du Bic)
  if (souffle) { O('#f2efe6', 3, 1.5, 2, 1.6); R('#c8c4b8', 3, 2); R('#ffffff', 0, 4); R('#ffffff', 1, 0); }   // la boulette part
  // la manche du sweat (bleu marine) qui monte du bas à droite, avec son poignet côtelé
  g.fillStyle = '#10183a'; g.beginPath(); g.moveTo(17, 40); g.lineTo(22, 29); g.lineTo(31, 27); g.lineTo(35, 33); g.lineTo(35, 40); g.fill();
  g.fillStyle = '#24316a'; g.beginPath(); g.moveTo(19, 40); g.lineTo(23, 31); g.lineTo(31, 29); g.lineTo(34, 34); g.lineTo(34, 40); g.fill();
  g.fillStyle = '#34458a'; g.fillRect(22, 30, 9, 2);
  // le poing : contour, peau, ombre en bas ; 4 phalanges sur le devant ; le pouce par-dessus le tube
  O('#5a3420', 22, 25, 7.2, 6.2); O('#e0a47a', 22, 24.6, 6.2, 5.2); O('#b97d58', 23, 27.5, 5, 2.4);
  for (let k = 0; k < 4; k++) { O('#5a3420', 17.4 + k * 0.6, 21.5 + k * 2, 2.6, 1.3); O('#eab58c', 17.6 + k * 0.6, 21.2 + k * 2, 2, 0.8); }
  O('#5a3420', 22.5, 19.5, 3.4, 2.2); O('#e0a47a', 22.5, 19.2, 2.6, 1.5); R('#f4c9a2', 21, 18.5, 2, 1);   // le pouce
  const c = document.createElement('canvas'); c.width = 105; c.height = 120;
  const gc = c.getContext('2d'); gc.imageSmoothingEnabled = false; gc.drawImage(p, 0, 0, 105, 120);
  return c;
}

export class JulienClasse extends JulienManif {
  constructor() { super('JulienClasse'); }

  // vraies images de Julien (outils/julien/decouper_prof.py) ; image absente = dessin provisoire
  preload() {
    for (const n of [...POSES_PROF.map(p => 'julien_' + p), ...Object.values(MURS_IMAGES), ...OBJETS_IMAGES, ...ELEVES_IMAGES, ...DESSUS_IMAGES, 'main_sarbacane', 'main_sarbacane_tir']) {
      if (!this.textures.exists('julien_' + n)) this.load.image('julien_' + n, `assets/sprites/julien/julien_${n}.png`);
    }
    super.preload();
  }

  // ------------------------------------------------------------------ points d'entrée (voir JulienManif)
  creerDecor() {
    const T = this.T;
    if (!T.classe) {
      Object.assign(T.spr, spritesClasse());
      for (const p of POSES_PROF) if (this.textures.exists('julien_julien_' + p)) T.spr['julien_' + p] = this.textures.get('julien_julien_' + p).getSourceImage();
      Object.assign(T.hauteurs, HAUTEURS_CLASSE);
      T.classe = construireDecorClasse(this.ctx, L, VUE_H);
      const img = (n) => this.textures.exists('julien_' + n) ? this.textures.get('julien_' + n).getSourceImage() : null;
      for (const n of OBJETS_IMAGES) { const i = img(n); if (i) { T.spr[n] = i; T.hauteurs[n] = HAUTEURS_IMAGES_CLASSE[n]; } }
      for (const n of [...ELEVES_IMAGES, ...DESSUS_IMAGES]) { const i = img(n); if (i) T.spr[n] = i; }
      // chaque élève assis derrière SA table : une seule image (pas d'élève qui passe devant / derrière la table)
      const tb = T.spr.table, ppu = tb.height / T.hauteurs.table;
      for (let k = 0; k < 4; k++) for (const p of ['content', 'cache']) {
        // l'élève est un peu plus grand et assis plus haut que le bas de la table : on voit son buste au-dessus
        const el = T.spr[`eleve_${k}_${p}`], sh = 1.0 * ppu, sw = el.width * sh / el.height, leve = 0.16 * ppu;
        const c = document.createElement('canvas'); c.width = Math.ceil(Math.max(tb.width, sw)); c.height = Math.ceil(Math.max(sh + leve, tb.height));
        const g = c.getContext('2d');
        g.drawImage(el, (c.width - sw) / 2, c.height - sh - leve, sw, sh);
        g.drawImage(tb, (c.width - tb.width) / 2, c.height - tb.height);
        T.spr[`te_${k}_${p}`] = c; T.hauteurs[`te_${k}_${p}`] = c.height / ppu;
      }
      // la sarbacane en main : vraie image si livrée (julien_main_sarbacane / _tir), sinon dessin en pixel art
      if (img('main_sarbacane')) { T.main.sarbacane = img('main_sarbacane'); T.main.sarbacane_tir = img('main_sarbacane_tir') || T.main.sarbacane; }
      else { T.main.sarbacane = mainSarbacane(false); T.main.sarbacane_tir = mainSarbacane(true); }
      // bureau renversé (phase 3) : le bureau la tête en bas, pieds en l'air
      // (étiré ×1,6 en largeur : il doit paraître aussi large que la zone qui arrête les tirs)
      const b = T.spr.bureau, c = document.createElement('canvas'); c.width = Math.round(b.width * 1.6); c.height = b.height;
      const g = c.getContext('2d'); g.translate(0, b.height); g.scale(1, -1); g.drawImage(b, 0, 0, c.width, b.height);
      T.spr.bureau_renverse = c; T.hauteurs.bureau_renverse = (T.hauteurs.bureau || 0.6) * 1.6;   // presque aussi haut que Julien : on voit qu'il est à l'abri
      for (const [code, n] of Object.entries(MURS_IMAGES)) {
        const i = img(n); if (!i || code === 'a') continue;
        const m = T.classe.murs;
        if (code === '1') m[1] = [i, img('mur_classe_affiche') || i];   // une case sur 6 : la carte de France
        else m[code] = i;
      }
    }
    return T.classe;
  }
  planDepart() { return PLAN_CLASSE; }
  lancerMusique() { jouerMusique(this, 'julien_boss_musique'); }   // Streets of Rage 2, niveau 1

  create() {
    // (bug corrigé : la scène est RÉUTILISÉE quand on rejoue ; ces textes-là venaient de la partie d'avant, détruits → plantage)
    this.txtPhase = null; this.dessus = null; this.confisque = null;
    super.create();
    // barre du bas : la vie de Julien à la place des policiers, la phase à la place de la boussole
    this.lblFlics.setText('JULIEN');
    this.lblLycee.setText('PHASE');
    this.txtPhase = texte(this, 868, VUE_H * 2 + 58, '', 32, '#ffd84a');
    this.txtBoss = texte(this, LARGEUR / 2 - 212, 34, 'JULIEN, LE PROF', 16, '#ffd84a').setOrigin(1, 0.5).setStroke('#000', 4).setDepth(5);   // à gauche de la barre (le bouton II est au milieu)
    this.txtMsg.setY(66);   // les répliques sous la barre de vie de Julien
    this.txtAnnonce = texte(this, LARGEUR / 2, 102, '', 30, '#ffd84a').setStroke('#000', 6).setDepth(5);   // l'attaque qui arrive
    this.txtConseil = texte(this, LARGEUR / 2, 130, '', 16, '#ffffff').setStroke('#000', 4).setDepth(5);
    this.txtEleves = texte(this, LARGEUR / 2, VUE_H * 2 - 24, '', 16, '#9fd8ff').setStroke('#000', 4).setDepth(5);
    this.annonceT = 0; this.elevesT = 0;
    this.dessiner(0);
  }

  intro() {
    const tact = estTactile();
    this.afficherIntro('LA SALLE DE CLASSE', [
      'Julien, le prof, te bombarde : livres, craies, copies, dictionnaire…',
      'Chaque attaque s\'annonce à l\'écran : lis et réagis vite !',
      'Après une grosse attaque, il écrit au tableau DE DOS : FONCE, dégâts ×2 !',
      'Les TABLES t\'abritent. Trop près, il CONFISQUE ta sarbacane !',
      ...(tact ? [this.joy ? 'Joystick : avancer, reculer, pas de côté     ↺ ↻ : tourner' : '▲ ▼ avancer / reculer   ◀ ▶ pas de côté   ↺ ↻ tourner',
        'LANCER : tirer      ARME : changer d\'arme'] : this.lignesCommandes()),
    ], () => this.demarrer());
  }

  demarrer() {
    super.demarrer();
    this.julien.etat = 'marche'; this.julien.t = 1.2;
    this.message(REPLIQUES.debut, 4);
    if (this.anarchiste) { this.txtAnnonce.setText('ANARCHISTE : JULIEN EST FURIEUX !'); this.annonceT = 3; this.txtConseil.setText('Plus de vie, des interros en rafale à chaque phase… bon courage !'); }
  }

  appliquerDifficulte() {
    this.j.mun.oeufs = 0; this.j.mun.tomates = 0;   // seulement la sarbacane (infinie)
    this.total = 1;
    // ANARCHISTE (audit : « pas de surprise ») : Julien plus coriace, une rafale de murs à chaque changement de phase,
    // des pluies de copies plus longues (RG.julien.anarchiste)
    this.anarchiste = this.diff === DIFFICULTES.anarchiste;
    if (this.anarchiste) { this.vieMax = Math.round(RG.julien.vie * RG.julien.anarchiste.vie); this.julien.vie = this.vieMax; }
  }

  perdu() { super.perdu('COLLÉ !', 'Deux heures de retenue avec Julien… Retente ta chance !'); }

  // ------------------------------------------------------------------ niveau
  lireNiveau() {
    this.j = this.nouveauJoueur();
    this.j.armes = new Set(['sarbacane']); this.j.arme = 'sarbacane';   // armes de la manif interdites au lycée
    this.ennemis = []; this.objets = []; this.tirs = []; this.fumees = []; this.grenades = []; this.nuages = []; this.splats = [];
    this.farines = []; this.rideaux = []; this.secrets = new Map(); this.secretsTrouves = 0; this.fourgonFait = true;
    this.livres = []; this.finDemandee = false; this.dessus = null;
    this.eleves = []; this.alarme = false; this.alarmeT = 0; this.confisque = null;
    this.vus = new Set(); this.bureau = null;
    this.plan = this.plan.map((ligne, y) => [...ligne].map((c, x) => {
      const px = x + 0.5, py = y + 0.5;
      if (c === 'J') { this.j.x = px; this.j.y = py; return '.'; }
      if (c === 'U') {
        this.julien = { type: 'julien', x: px, y: py, vie: (this.vieMax = RG.julien.vie), etat: 'attente', t: 1, anim: 0, bouge: false,
          vuX: px, vuY: py + 5, alerte: true, actif: true, phase: 1, cible: null, taches: [], flash: 0, reste: 0 };
        this.ennemis.push(this.julien);
        return '.';
      }
      const type = OBJETS_CLASSE[c];
      if (!type) return c;
      const o = { type, x: px, y: py, solide: !!RAYONS_CLASSE[type], rayon: RAYONS_CLASSE[type] || 0.3, actif: true, n: 0 };
      this.objets.push(o);
      if (type === 'bureau') this.bureau = o;
      if (c === 'e') { o.type = `te_${this.eleves.length % 4}_content`; } if (c === 'e') this.eleves.push({ x: px, y: py, k: this.eleves.length % 4, t: 0, ph: Math.random() * 6, table: o });   // assis à sa table (une seule image : élève + table)
      return '.';
    }).join(''));
    this.sortie = null; this.sortieCases = new Set();
    this.total = 1; this.repousses = 0;
    this.totalObjets = this.objets.filter(o => !o.solide).length; this.ramasses = 0;
    this.zonesVues = new Set(); this.portailOuvert = true; this.temps = 0;
  }



  // ------------------------------------------------------------------ boucle (la boucle commune est dans JulienManif)
  zonesNiveau() { return []; }
  majJeu(dt) {
    const x0 = this.j.x, y0 = this.j.y;
    if (this.dessus) this.majDessus(dt);   // rafale de murs de copies : shoot them up vu du dessus (dessus.js)
    else {
      this.bougerJoueur(dt);
      this.glisser(dt, x0, y0);
      this.iaJulien(this.julien, dt);
    }
    this.majSalle(dt);
    this.projectiles(dt);   // tes tirs (armes.js) et les taches
    this.avancerLivres(dt);
    this.ramasser();
  }

  // ------------------------------------------------------------------ Julien
  phaseDe(e) { const p = e.vie / this.vieMax; return p > 0.5 ? 1 : p > 0.2 ? 2 : 3; }

  nouvelleCible(e) {
    if (e.phase < 3) return { x: ESTRADE.x0 + Math.random() * (ESTRADE.x1 - ESTRADE.x0), y: ESTRADE.y0 + Math.random() * (ESTRADE.y1 - ESTRADE.y0) };
    // phase 3 : il reste planqué derrière son bureau renversé (il en dépasse un peu : contourne-le !)
    // (bug corrigé : il allait jusqu'à 1,6 case de chaque côté et dépassait du bureau)
    return { x: BUREAU_RENVERSE.x + (Math.random() - 0.5) * BUREAU_RENVERSE.marche, y: 1.5 + Math.random() * 0.5 };
  }

  // grosse annonce au centre (+ le conseil, seulement la 1re fois)
  annoncer(cle, duree = 1.4) {
    const [txt, conseil] = ANNONCES[cle] || [cle, ''];
    this.txtAnnonce.setText(txt); this.annonceT = duree;
    this.txtConseil.setText(!this.vus.has(cle) ? conseil : '');
    this.vus.add(cle);
  }
  parlerEleves(cle, duree = 1.6) {   // un élève parle (pas trop souvent)
    if (this.elevesT > -4 && cle !== 'fin') return;   // (audit : ils parlaient trop souvent)
    this.txtEleves.setText(Array.isArray(ELEVES[cle]) ? hasard(ELEVES[cle]) : ELEVES[cle]); this.elevesT = duree;
  }

  iaJulien(e, dt) {
    const J = RG.julien, j = this.j, ph = e.phase - 1;
    const d = Math.hypot(j.x - e.x, j.y - e.y);
    let voit = j.vie > 0 && vueLibre(this.plan, e.x, e.y, j.x, j.y);
    if (voit) { e.vuX = j.x; e.vuY = j.y; }
    e.t -= dt; e.bouge = false; e.flash = Math.max(0, e.flash - dt);
    const marcher = (vx, vy, v) => {
      const n = Math.hypot(vx, vy); if (n < 0.01) return true;
      e.bouge = true; e.anim += dt;
      const x0 = e.x, y0 = e.y, bloque = this.deplacer(e, vx / n * v * dt, vy / n * v * dt, 0.3);
      e.vx = (e.x - x0) / dt; e.vy = (e.y - y0) / dt;   // pour l'aide à la visée (elle anticipe)
      return bloque;
    };
    e.vx = 0; e.vy = 0;
    switch (e.etat) {
      case 'attente': return;
      case 'fuite':   // vaincu : il s'assoit, sonné, les élèves applaudissent, puis l'écran de victoire
        if (e.t <= 0 && !this.finDemandee) { this.finDemandee = true; this.gagne(); }
        return;
      case 'pause': if (e.t <= 0) { e.etat = 'marche'; e.t = 0.6; e.cible = null; } return;
      case 'interro': return;   // la rafale de murs en vue du dessus (majDessus)
      case 'touche': if (e.t <= 0) { e.etat = e.apres; e.t = e.tApres; } return;
      case 'dos':   // la FENÊTRE DE PUNITION : il écrit au tableau
        if (e.t <= 0) { e.etat = 'marche'; e.t = J.cadence[ph] * this.diff.cadence * (0.6 + Math.random() * 0.3); this.txtAnnonce.setText(''); }
        return;
      case 'marche': {
        if (e.cible && Math.hypot(e.cible.x - e.x, e.cible.y - e.y) < 0.3) { e.cible = null; e.arret = J.arret[ph] * (0.6 + Math.random() * 0.8); }
        if (e.arret > 0) { e.arret -= dt; }   // il s'arrête un instant (c'est le moment de viser)
        if (!e.cible) e.cible = this.nouvelleCible(e);
        const bloque = e.arret > 0 ? false : marcher(e.cible.x - e.x, e.cible.y - e.y, e.phase === 3 ? J.vitesseRage : J.vitesse);
        if (bloque) e.cible = null;
        // au contact : la règle, tout de suite
        if (voit && d < J.regle.portee && e.t < J.cadence[ph] * 0.6) e.t = 0;
        if (e.t <= 0 && voit) this.preparer(e, d);
        return;
      }
      case 'prepare':
        if (e.motif === 'confisque' || e.motif === 'regle' || e.motif === 'aimant') { e.cible = null; }
        if (e.t <= 0) this.executer(e, voit, d);
        return;
      case 'aimant':   // « AU TABLEAU ! » : il t'attire vers l'estrade
        if (j.vie > 0 && d > 0.01) {
          this.deplacer(j, (e.x - j.x) / d * J.aimant.force * dt, (e.y - j.y) / d * J.aimant.force * dt, RG.joueur.rayon);
          if (d < 1.15) {   // arrivé au tableau : coup de règle et retour à ta place
            this.degats(J.aimant.degats, e.x, e.y); this.repousser(1.6); e.t = 0;
          }
        }
        if (e.t <= 0) this.finAttaque(e, 'aimant');
        return;
      case 'lance':
        if (e.t > 0) return;
        if (e.reste > 0) {
          e.reste--;
          if (e.motif === 'deluge') { this.vagueCopies(e, voit); e.t = J.deluge.intervalle[e.phase - 1]; return; }
          if (e.motif === 'craies') this.lancerLivre(e, 'craie', this.angleVers(e, voit) + (Math.random() - 0.5) * 2 * J.craies.dispersion);
          else this.lancerLivre(e, 'livre', this.angleVers(e, voit));
          e.t = e.motif === 'craies' ? J.craies.intervalle : J.rafale.intervalle; return;
        }
        this.finAttaque(e, e.motif);
    }
  }

  // il choisit son attaque et la PRÉPARE (préavis lisible)
  preparer(e, d) {
    const J = RG.julien, ph = e.phase - 1;
    e.motif = this.choisirMotif(e, d);
    const P = { deluge: J.deluge.preavis, murs: J.mur.preavis, dico: J.dico.preavis, mur: J.mur.preavis, craies: J.craies.preavis, aimant: J.aimant.preavis, confisque: J.confisque.preavis, regle: J.regle.preavis };
    e.etat = 'prepare'; e.t = P[e.motif] || J.preavis[ph];
    // (audit : moins de texte en combat) une attaque annoncée en grand n'a plus de réplique en plus
    if (ANNONCES[e.motif]) this.annoncer(e.motif, e.t + 0.6);
    if (e.motif === 'mur' || e.motif === 'murs' || e.motif === 'deluge') jouerSon(this, 'julien_papier');
    else if (e.motif === 'craies') jouerSon(this, 'julien_craie', { rate: 1.3 });
    else if (!ANNONCES[e.motif] && Math.random() < 0.15) this.message(hasard(REPLIQUES.lancer), 2.2);
  }

  choisirMotif(e, d) {
    if (e.forcer) { const m = e.forcer; e.forcer = null; return m; }   // (ANARCHISTE : rafale imposée au changement de phase)
    const J = RG.julien, j = this.j, r = Math.random();
    if (d < J.regle.portee) return 'regle';
    if (d < J.confisque.portee && !this.confisque && Math.random() < [0.5, 0.6, 0.85][e.phase - 1]) return 'confisque';
    if (e.phase === 1) return r < 0.3 ? 'livre' : r < 0.5 ? 'eventail' : r < 0.68 ? 'craies' : r < 0.84 ? 'mur' : 'deluge';
    if (e.phase === 2) return r < 0.25 ? 'deluge' : r < 0.5 ? 'murs' : r < 0.62 ? 'dico' : r < 0.72 ? 'eventail' : r < 0.86 ? 'aimant' : 'craies';
    return r < 0.25 ? 'deluge' : r < 0.52 ? 'murs' : r < 0.6 ? 'rafale' : r < 0.68 ? 'dico' : r < 0.84 ? 'aimant' : r < 0.93 ? 'craies' : 'eventail';
  }

  // l'attaque part
  executer(e, voit, d) {
    const J = RG.julien, j = this.j;
    if (e.motif === 'aimant') {
      e.etat = 'aimant'; e.t = J.aimant.duree; jouerSon(this, 'julien_cri', { rate: 1.4 });
      return;
    }
    if (e.motif === 'regle') {
      jouerSon(this, 'julien_pancarte', { rate: 0.7 });
      if (j.vie > 0 && d < J.regle.portee * 1.15) { this.degats(J.regle.degats, e.x, e.y); this.repousser(J.regle.recul); this.cameras.main.shake(180, 0.008); }
      e.etat = 'lance'; e.t = 0.35; e.reste = 0;
      return;
    }
    if (e.motif === 'confisque') {
      if (j.vie > 0 && d < J.confisque.portee * 1.1) this.confisquer(j.arme);
      e.etat = 'lance'; e.t = 0.35; e.reste = 0;
      return;
    }
    if (e.motif === 'mur' || e.motif === 'murs') { this.entrerDessus(e); return; }   // rafale de murs : VUE DU DESSUS
    this.lancerMotif(e, voit);
    e.etat = 'lance'; e.t = e.motif === 'dico' ? 0.8 : 0.35;   // il se retourne quand le dico est passé
  }

  // fin d'une attaque : après une grosse (ou parfois une petite en phase 2-3), il se retourne au tableau
  finAttaque(e, motif) {
    const J = RG.julien, ph = e.phase - 1;
    if (GROSSES.has(motif) || Math.random() < J.dosApresPetite[ph]) {
      e.etat = 'dos'; e.t = J.dos[ph]; e.cible = null;
      jouerSon(this, 'julien_craie');
      if (Math.random() < 0.35) this.message(hasard(REPLIQUES.dos), 2);   // (l'annonce « DE DOS » suffit le plus souvent)
      this.txtAnnonce.setText(this.vus.has('dos') ? 'DE DOS ! ×2' : 'IL EST DE DOS : FONCE ! DÉGÂTS ×2'); this.annonceT = e.t;
      this.txtConseil.setText(''); this.vus.add('dos');
      this.parlerEleves('dos'); for (const el of this.eleves) el.t = e.t;
      return;
    }
    e.etat = 'marche'; e.t = J.cadence[ph] * this.diff.cadence * (0.8 + Math.random() * 0.4);
  }

  // tu es repoussé loin de Julien (règle, « au tableau »)
  repousser(n) {
    const j = this.j, e = this.julien, d = Math.hypot(j.x - e.x, j.y - e.y) || 1;
    for (let k = 0; k < 8; k++) this.deplacer(j, (j.x - e.x) / d * n / 8, (j.y - e.y) / d * n / 8, RG.joueur.rayon);
  }

  confisquer(id) {
    const j = this.j;
    this.confisque = { id, t: RG.julien.confisque.duree };
    this.txtAnnonce.setText('CONFISQUÉ !'); this.annonceT = 1.6; this.txtConseil.setText(`Ta ${armeDe(id).nom.toLowerCase()} : rendue dans ${RG.julien.confisque.duree} s. Esquive en attendant !`);
    this.message(REPLIQUES.confisqueOk, 2);
    jouerSon(this, 'julien_plonk', { rate: 0.5 });
  }

  // aide à la visée : comme dans la manif, mais l'œuf part là où Julien SERA (il marche)
  viser(dx, dy) {
    const [vx, vy] = super.viser(dx, dy), e = this.julien, j = this.j;
    if (e.etat === 'fuite' || !(e.vx || e.vy)) return [vx, vy];
    const ox = e.x - j.x, oy = e.y - j.y, d = Math.hypot(ox, oy);
    if (Math.abs(vx * oy - vy * ox) / d > 0.02) return [vx, vy];   // l'aide n'a pas choisi Julien
    const t = d / RG.oeufs.vitesse, px = ox + e.vx * t, py = oy + e.vy * t, n = Math.hypot(px, py);
    return [px / n, py / n];
  }

  angleVers(e, voit) {   // caché : il vise là où il t'a vu
    const [x, y] = voit ? [this.j.x, this.j.y] : [e.vuX, e.vuY];
    return Math.atan2(y - e.y, x - e.x);
  }

  lancerMotif(e, voit) {
    const J = RG.julien, a = this.angleVers(e, voit);
    e.reste = 0;
    if (e.motif === 'eventail') for (const k of [-1, 0, 1]) this.lancerLivre(e, 'livre', a + k * J.eventail);
    else if (e.motif === 'dico') this.lancerLivre(e, 'dico', a);
    else if (e.motif === 'copies') {
      const n = J.copies.nombre;
      for (let k = 0; k < n; k++) this.lancerLivre(e, 'copie', a + (k - (n - 1) / 2) * J.copies.ecart);
    }
    else if (e.motif === 'deluge') { e.vague = 0; this.vagueCopies(e, voit); e.reste = J.deluge.vagues[e.phase - 1] - 1 + (this.anarchiste ? J.anarchiste.vagues : 0); }
    else if (e.motif === 'craies') { this.lancerLivre(e, 'craie', a); e.reste = J.craies.nombre - 1; }
    else { this.lancerLivre(e, 'livre', a); if (e.motif === 'rafale') e.reste = J.rafale.nombre - 1; }
    jouerSon(this, 'julien_lancer', { rate: e.motif === 'dico' ? 0.55 : 0.75 });
  }

  // DÉLUGE (bullet hell) : vagues de copies (les TABLES les arrêtent : on peut s'y abriter, demande de Fabien) ; les trous se décalent d'une vague à
  // l'autre (éventail visé sur toi, puis le même décalé d'un demi-écart), et une vague sur 3 est un cercle qui tourne
  vagueCopies(e, voit) {
    const D = RG.julien.deluge, a = this.angleVers(e, voit), k = e.vague++;
    const tirer = (ang) => { const dx = Math.cos(ang), dy = Math.sin(ang);
      this.livres.push({ genre: 'copie', droit: true, x: e.x + dx * 0.4, y: e.y + dy * 0.4, dx, dy, v: D.vitesse, degats: D.degats, rebonds: 0, t: 0, ph: Math.random() * 6 }); };
    if (k % 3 === 2) for (let i = 0; i < D.cercle; i++) tirer(i / D.cercle * Math.PI * 2 + k * 0.37);
    else for (let i = 0; i < D.nombre; i++) tirer(a + (i - (D.nombre - 1) / 2) * D.ecart + (k % 2 ? D.ecart / 2 : 0));
    jouerSon(this, 'julien_papier', { rate: 1.4 + (k % 3) * 0.1, volume: 0.6 });
  }

  lancerLivre(e, genre, a) {
    const J = RG.julien, R = genre === 'copie' ? J.copies : genre === 'craie' ? J.craies : J[genre];
    const dx = Math.cos(a), dy = Math.sin(a);
    this.livres.push({ genre, x: e.x + dx * 0.4, y: e.y + dy * 0.4, dx, dy, v: R.vitesse, degats: R.degats,
      rebonds: genre === 'dico' ? J.dico.rebonds : 0, t: 0, ph: Math.random() * 6 });
  }

  avancerLivres(dt) {
    const j = this.j;
    for (const b of this.livres) {
      b.t += dt;
      let vx = b.dx, vy = b.dy;
      if (b.genre === 'copie' && !b.droit) { const w = Math.sin(b.t * 7 + b.ph) * 0.45; vx += -b.dy * w; vy += b.dx * w; }   // elles volettent
      const nx = b.x + vx * b.v * dt, ny = b.y + vy * b.v * dt;
      if (murEn(this.plan, nx, ny)) {
        if (b.rebonds > 0) {   // le dictionnaire rebondit
          const mx = murEn(this.plan, nx, b.y), my = murEn(this.plan, b.x, ny);
          if (mx || !my) b.dx = -b.dx;
          if (my || !mx) b.dy = -b.dy;
          b.rebonds--;
          if (Math.hypot(b.x - j.x, b.y - j.y) < 7) jouerSon(this, 'julien_plonk', { rate: 0.6 });
        } else b.fini = true;
        continue;
      }
      b.x = nx; b.y = ny;
      // une table : abri ! (le mur de copies passe au-dessus ; son bureau renversé ne gêne pas Julien)
      for (const o of this.objets) if (o.actif && o.solide && o.type !== 'bureau_renverse' && Math.hypot(o.x - b.x, o.y - b.y) < o.rayon) {
        b.fini = true;
        if (Math.hypot(b.x - j.x, b.y - j.y) < 5) jouerSon(this, 'julien_plonk', { rate: b.genre === 'copie' ? 1.6 : b.genre === 'craie' ? 2 : 0.9 });
        break;
      }
      if (b.fini) continue;
      if (j.vie > 0 && Math.hypot(b.x - j.x, b.y - j.y) < 0.38) {
        b.fini = true;
        this.degats(b.degats, b.x - b.dx, b.y - b.dy);
        this.parlerEleves('aie');
        if (b.genre === 'dico') this.cameras.main.shake(200, 0.01);
      }
      if (b.t > 6) b.fini = true;
    }
    this.livres = this.livres.filter(b => !b.fini);
  }

  // ------------------------------------------------------------------ la salle (phases, élèves, arme confisquée)
  majSalle(dt) {
    const C = RG.classe;
    this.annonceT -= dt; if (this.annonceT <= 0) { this.txtAnnonce.setText(''); this.txtConseil.setText(''); }
    this.elevesT -= dt; if (this.elevesT <= 0) this.txtEleves.setText('');
    // les élèves (dessinés AVEC leur table) : contents (bras en l'air) quand ça bouge pour toi, cachés quand ça chauffe
    const chaud = this.julien.phase > 1 || this.alarme || this.julien.etat === 'aimant';
    for (const el of this.eleves) {
      el.t -= dt;
      el.table.type = `te_${el.k}_${el.t > 0 || (!chaud && this.julien.phase === 1) ? 'content' : 'cache'}`;
    }
    if (this.confisque && (this.confisque.t -= dt) <= 0) {   // il te rend ton arme
      const id = this.confisque.id; this.confisque = null;
      this.message(`Julien te rend ta ${armeDe(id).nom.toLowerCase()}. « Et que je ne vous y reprenne pas ! »`, 2.5);
    }
    if (this.alarme && (this.alarmeT -= dt) <= 0) { jouerSon(this, 'julien_alarme', { volume: 0.35 }); this.alarmeT = 4; }
  }

  // phase 3 : les sprinklers mouillent le sol, tu glisses (tu continues un peu sur ta lancée)
  glisser(dt, x0, y0) {
    const j = this.j;
    if (!this.alarme || j.vie <= 0) { j.gx = 0; j.gy = 0; return; }
    const k = Math.exp(-dt / RG.classe.glisse);
    this.deplacer(j, (j.gx || 0) * dt, (j.gy || 0) * dt, RG.joueur.rayon);
    j.gx = (j.gx || 0) * k + (j.x - x0) / dt * (1 - k) * 0.7;
    j.gy = (j.gy || 0) * k + (j.y - y0) / dt * (1 - k) * 0.7;
  }

  changerPhase(ph) {
    const e = this.julien;
    if (this.anarchiste) e.forcer = 'murs';   // ANARCHISTE : il enchaîne direct sur une rafale de murs
    if (ph === 2) {   // INTERRO SURPRISE : copies, dictionnaire, « au tableau ! »
      this.txtAnnonce.setText('INTERRO SURPRISE !'); this.annonceT = 3;
      this.txtConseil.setText('Murs de copies, dictionnaire, « AU TABLEAU ! » : lis bien les annonces !');
      this.parlerEleves('interro');
    } else {          // RETENUE : il renverse son bureau, l'alarme incendie sonne
      const b = this.bureau;
      if (b) { b.type = 'bureau_renverse'; b.x = BUREAU_RENVERSE.x; b.y = BUREAU_RENVERSE.y; b.rayon = BUREAU_RENVERSE.rayon; }
      e.x = BUREAU_RENVERSE.x; e.y = 1.7;   // il file se planquer derrière
      const j = this.j;   // pas coincé dans le bureau qui tombe
      if (Math.hypot(j.x - BUREAU_RENVERSE.x, j.y - BUREAU_RENVERSE.y) < BUREAU_RENVERSE.rayon + 0.4) j.y = BUREAU_RENVERSE.y + BUREAU_RENVERSE.rayon + 0.45;
      this.alarme = true; this.alarmeT = 0;
      this.txtAnnonce.setText('TOUT LE MONDE EN RETENUE !'); this.annonceT = 3;
      this.txtConseil.setText('Il se planque derrière son bureau : CONTOURNE-LE ! Le sol est mouillé : ça glisse.');
      this.parlerEleves('alarme');
    }
  }

  // Julien touché (œuf, tomate, pancarte) ; les autres cas passent par la manif
  toucherEnnemi(e, degats = 1, opts = {}) {
    if (e.type !== 'julien') return super.toucherEnnemi(e, degats, opts);
    const { recul = null, silencieux = false, tache = null, genre = null } = opts;
    if (e.etat === 'fuite') return;
    if (recul && e.etat !== 'dos') this.deplacer(e, recul[0] * 0.5, recul[1] * 0.5, 0.3);
    if (e.etat === 'pause') { if (!silencieux) jouerSon(this, 'julien_plonk'); return; }   // changement de phase : intouchable
    if (e.etat === 'dos') {   // DE DOS : dégâts ×2
      const m = RG.julien.multDos;
      degats *= m;
      if (!silencieux) this.bulle(`×${m}`);
    }
    e.vie = Math.max(0, e.vie - degats); e.flash = 0.15;
    for (const el of this.eleves) el.t = Math.max(el.t, 1);
    if (Math.random() < 0.35) this.parlerEleves('touche');
    if (tache && e.taches.length < 6) e.taches.push({ o: Math.random() * 1.6 - 0.8, h: 0.3 + Math.random() * 0.4, rouge: tache === 'tomate' });
    if (!silencieux) jouerSon(this, 'julien_splat');
    if (e.vie <= 0) {
      e.etat = 'fuite'; e.t = 3.4; this.repousses = 1; this.livres = [];
      this.alarme = false;
      this.txtAnnonce.setText(''); this.txtConseil.setText('');
      for (const el of this.eleves) el.t = 99;
      this.parlerEleves('fin', 3.4);
      jouerSon(this, 'julien_fuite'); this.cameras.main.shake(300, 0.01);
      this.message(REPLIQUES.vaincu, 3);
      this.j.expr = 'content'; this.j.exprT = 3;
      return;
    }
    const ph = this.phaseDe(e);
    if (ph > e.phase) {   // nouvelle phase : il s'arrête, crie, et repart plus fort
      e.phase = ph; e.etat = 'pause'; e.t = RG.julien.pause; e.reste = 0; e.cible = null;
      jouerSon(this, 'julien_cri', { rate: 1.15 }); this.cameras.main.shake(350, 0.009);
      this.message(ph === 2 ? REPLIQUES.phase2 : REPLIQUES.phase3, 3.5);
      this.changerPhase(ph);
      return;
    }
    if (Math.random() < 0.1) this.message(hasard(REPLIQUES.touche), 1.6);
    if (e.etat === 'marche') { e.apres = 'marche'; e.tApres = e.t; e.etat = 'touche'; e.t = 0.18; }   // ne coupe pas un lancer
  }

  // petit « ×2 » qui saute au milieu de l'écran
  bulle(txt) {
    const t = texte(this, LARGEUR / 2 + (Math.random() - 0.5) * 80, 230, txt, 34, '#ff8a2a').setStroke('#000', 6).setDepth(50).setScale(0.5);
    this.tweens.add({ targets: t, scale: 1, duration: 120, ease: 'Back.out' });
    this.tweens.add({ targets: t, alpha: 0, y: 200, delay: 350, duration: 350, onComplete: () => t.destroy() });
  }

  gagne() {
    if (this.joy) this.joy.activer(false);
    this.libererSouris();
    this.enJeu = false;
    const t = this.temps, mmss = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    this.victoire(`Julien est vaincu ! Pas d'interro pour cette fois.\nTemps : ${mmss}   (${this.diff.nom})`);
  }

  // ------------------------------------------------------------------ dessin
  imageEnnemi(e) {
    if (e.type !== 'julien') return super.imageEnnemi(e);
    const s = this.T.spr;
    if (e.etat === 'fuite') return s.julien_vaincu;
    if (e.etat === 'touche' || e.flash > 0) return s.julien_touche;
    if (e.etat === 'dos') return s.julien_dos || s.julien_marche0;
    if (e.etat === 'prepare' || e.etat === 'aimant') return s.julien_bras;
    if (e.etat === 'lance') return s.julien_lance;
    if (e.etat === 'pause' || (e.phase === 3 && ((this.time.now / 200) | 0) % 5 === 0)) return s.julien_rage;
    return s[(e.bouge && (e.anim * 4 | 0) % 2) ? 'julien_marche1' : 'julien_marche0'];
  }

  spritesEnPlus(liste) {
    const s = this.T.spr, H = this.T.hauteurs;
    for (const b of this.livres) {
      const g = b.genre;   // (les copies du déluge, « droit », sont dessinées plus grandes)
      liste.push({ x: b.x, y: b.y, toile: s[g], haut: b.droit ? 0.24 : H[g], z: 0.42 + (g !== 'craie' ? Math.sin(b.t * 9 + b.ph) * 0.04 : 0) });
    }
  }

  // barre de vie de Julien en haut de la vue (repères des phases à 50 % et 20 %)
  dessinerEnPlus(g) {
    const t = this.time.now / 1000;
    if (this.dessus) this.dessinerDessus(g);
    if (this.alarme) {   // alarme incendie (flash rouge) et sprinklers (gouttes)
      if (Math.sin(t * 9) > 0.6) { g.fillStyle = 'rgba(255,40,30,0.12)'; g.fillRect(0, 0, L, VUE_H); }
      g.fillStyle = 'rgba(190,220,255,0.45)';
      for (let k = 0; k < 40; k++) { const x = (k * 97 + t * 30) % L, y = (k * 53 + t * 260) % VUE_H; g.fillRect(x, y, 1, 6); }
    }
    if (this.julien.etat === 'aimant') {   // « au tableau » : lignes qui t'aspirent vers lui
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1; g.beginPath();
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + t, r = 60 + ((t * 300 + k * 37) % 120); g.moveTo(L / 2 + Math.cos(a) * r, VUE_H / 2 + Math.sin(a) * r * 0.6); g.lineTo(L / 2 + Math.cos(a) * (r + 18), VUE_H / 2 + Math.sin(a) * (r + 18) * 0.6); }
      g.stroke();
    }
    const e = this.julien, l = 200, x = L / 2 - l / 2, y = 16, p = e.vie / this.vieMax;
    g.fillStyle = '#000'; g.fillRect(x - 2, y - 2, l + 4, 9);
    g.fillStyle = e.flash > 0 ? '#ffffff' : e.phase === 3 ? '#ff3a2a' : e.phase === 2 ? '#ff8a2a' : '#ffd84a';
    g.fillRect(x, y, l * p, 5);
    g.fillStyle = '#ffffff'; g.fillRect(x + l * 0.5, y - 2, 1, 9); g.fillRect(x + l * 0.2, y - 2, 1, 9);
  }

  dessiner(dt) {
    super.dessiner(dt);
    if (!this.txtPhase) return;   // (premier dessin, avant la fin de create)
    const e = this.julien;
    this.txtFlics.setText(`${Math.ceil(100 * e.vie / this.vieMax)}%`);
    this.txtPhase.setText(`${e.phase} / 3`);
    if (this.confisque) this.txtBonus.setText(`CONFISQUÉ : ${armeDe(this.confisque.id).nom} ${Math.ceil(this.confisque.t)} s`);
    this.txtMunitions.setText(this.confisque ? 'SARBACANE CONFISQUÉE' : 'SARBACANE ∞');
  }
}

// la rafale de murs en vue du dessus (dessus.js)
Object.assign(JulienClasse.prototype, VueDessus);
