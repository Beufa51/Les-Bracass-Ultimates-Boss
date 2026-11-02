// =====================================================================
// RÉMI — JEU 1 : LE VÉLO (V5, vue de PROFIL, la ville défile vers la gauche)
// Le vélo roule TOUT SEUL (de plus en plus vite). Deux gestes seulement :
//   SAUTER : moitié DROITE de l'écran (ou ▲ / ESPACE) — garder appuyé = saut plus haut et plus long
//            → bourré allongé, verre cassé, flaque ; et les PINTES en l'air (+1 s chacune)
//   DRING  : moitié GAUCHE de l'écran (ou Z / ◀) — la sonnette, dans la zone jaune devant toi
//            → un bourré DEBOUT s'écarte, un bourré qui TRAVERSE s'arrête et recule
// Une icône au-dessus de chaque obstacle dit quoi faire (sauf en CHAMPION). Obstacles passés proprement à la suite = SÉRIE
// (tous les 5 : +2 s). Chute = temps perdu ; si le bar ferme avant ton arrivée : perdu.
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, DIFFICULTES, VELO as V, REPLIQUES } from './reglages.js';
import { cycliste, bourre, verreCasse, flaque, remi, COULEURS } from './dessins.js';
import { bulle, annonce, jeuSuivant, ecranPerdu, hasard, choisir , laisserPasserTactile } from './commun.js';
import { choisirDifficulte } from './difficulte.js';

const SOL = 440;                     // hauteur de la route à l'écran
const X_VELO = 260;                  // le vélo reste à cet endroit de l'écran (c'est la rue qui défile)
const DEMI_VELO = 65;                // demi-longueur du vélo pour les chocs (un peu plus petite que l'image : indulgent)
const HAUT_PINTE = 260;              // hauteur des pintes au-dessus de la route (on ne les attrape qu'en sautant)
const BOUTON_G = { x: 88, y: 448, r: 74 }, BOUTON_D = { x: LARGEUR - 88, y: 448, r: 74 };   // les 2 gros boutons
// LES ROUTES (V8) : le trajet = 3 tronçons. Au bout des 2 premiers, un CARREFOUR : on choisit la suite (gauche / droite).
//  longueur : part de la longueur d'un tronçon (raccourci = plus court mais plus chargé) ; densite / pintes / voitures : x
const DEPART_ROUTE = { nom: 'LA RUE DES BARS', image: 'remi_rue', teinte: 0xffffff, longueur: 1, densite: 1, pintes: 1, voitures: 1 };
const CARREFOURS = [
  [{ nom: 'LES QUAIS', texte: 'tranquille, plein de pintes', image: 'remi_rue2', teinte: 0x9fb8ff, longueur: 1, densite: 0.75, pintes: 1.6, voitures: 1 },
    { nom: 'LA RUELLE', texte: 'RACCOURCI, mais bondé', image: '', teinte: 0x9a80c0, longueur: 0.65, densite: 1.35, pintes: 0.6, voitures: 0 }],
  [{ nom: 'LE CENTRE-VILLE', texte: 'la fête : tremplins et pintes', image: 'remi_rue3', teinte: 0xffc8a0, longueur: 1, densite: 1, pintes: 1.5, voitures: 2 },
    { nom: 'LES PETITES RUES', texte: 'RACCOURCI, mais bondé', image: '', teinte: 0x80a8c0, longueur: 0.65, densite: 1.35, pintes: 0.6, voitures: 0 }],
];
// voitures illustrées (remi_voitures.png, 3 cases) : taille réelle de chaque voiture dans sa case ; ECH_VOIT = taille à l'écran
const VOIT_IMG = [{ l: 394, h: 175 }, { l: 434, h: 179 }, { l: 382, h: 213 }], ECH_VOIT = 0.74;
// tremplin illustré : le haut de la planche est à 81 % de la largeur de l'image
const TREMPLIN_IMG = { l: 1114, h: 459, haut: 0.81 };
const VIDES = { haut: null, bas: null, gauche: null, droite: null, espace: null, z: null, x: null };
// hauteur et demi-largeur de chaque obstacle (chocs) ; debout et traverse sont plus hauts que le plus grand saut
const TAILLE = { allonge: [52, 58], verre: [13, 36], debout: [210, 23], traverse: [210, 26], vomi: [5, 55] };
const SONNER = { debout: true, traverse: true };    // les obstacles qui demandent la sonnette (les autres : sauter)
// illustration des bourrés (remi_bourres.png : debout, sursaute, allongé, traverse de face) et sa taille à l'écran
const BOURRE = 0.33, IMAGE_BOURRE = { debout: 0, ecarte: 1, allonge: 2, marche: 3 };
const TEINTES = [0xffffff, 0xffe2d8, 0xdfe6ff, 0xe4ffd9, 0xfff3c0];

export class RemiVelo extends BossScene {
  constructor() { super('RemiVelo', IDENTITE); }

  create() {
    this.etat = 'intro';
    this.nomDiff = 'normal'; this.diff = DIFFICULTES.normal;
    this.bx = 0; this.v = 0; this.y = 0; this.vy = 0; this.a = 0; this.tenu = 0; this.tampon = 0;
    this.chute = 0; this.ralenti = 0; this.glisse = 0; this.recharge = 0; this.dring = 0; this.invincible = 0; this.horloge = 0;
    this.prochainTexto = 9; this.chutes = 0; this.score = 0; this.serie = 0; this.pintesPrises = 0;
    this.obstacles = []; this.pintes = [];
    this.sautDoigt = false; this.voitures = []; this.tremplins = []; this.auSol = true; this.apprentissage = {}; this.action = null;

    this.creerDecor();
    this.decor = this.add.graphics().setDepth(2);
    this.gPintes = this.add.graphics().setDepth(9);
    this.gVelo = this.add.graphics().setDepth(11);
    // l'illustration du vélo (8 poses) ; sans fichier, c'est le dessin du code
    this.sprVelo = this.textures.exists('remi_velo') ? this.add.sprite(0, 0, 'remi_velo', 0).setOrigin(0.5, 1).setDepth(10).setScale(0.78) : null;
    this.gRemi = this.add.graphics().setDepth(6);
    this.facade = this.textures.exists('remi_bar_facade') ? this.add.image(0, 0, 'remi_bar_facade').setOrigin(0.5, 1).setScale(340 / 917).setDepth(3).setVisible(false) : null;
    // Rémi t'attend devant le bar, détendu : son illustration « remi_accueil » (en pied) si elle existe, sinon la pose
    // « attend » du beer pong (coupée à la taille), derrière une table haute de terrasse dessinée qui cache le bas
    this.remiAccueil = this.textures.exists('remi_accueil');
    this.sprRemi = this.remiAccueil ? this.add.image(0, 0, 'remi_accueil').setOrigin(0.5, 1).setDepth(6).setVisible(false)
      : this.textures.exists('remi_pong') ? this.add.sprite(0, 0, 'remi_pong', 0).setOrigin(0.5, 1).setScale(0.3).setDepth(6).setVisible(false) : null;
    if (this.sprRemi && this.remiAccueil) this.sprRemi.setScale(230 / this.sprRemi.height);
    this.gTable = this.add.graphics().setDepth(6.5);
    this.enseigne = texte(this, 0, 0, 'BAR', 54, '#ff4fd8', { fontStyle: 'bold', stroke: '#5a0a4a', strokeThickness: 6 }).setDepth(4).setVisible(false);
    this.creerHud();

    this.touches = creerTouches(this);
    this.installerZones();
    laisserPasserTactile(this);   // les blocs de boutons cachés ne mangent plus les touchers
    this.dessiner();

    etiquettesTactiles({ ...VIDES, espace: 'OK' });
    const t = estTactile();
    this.afficherIntro('RÉMI - Direction le bar', [
      'Rémi t\'attend au bar... et le bar ferme bientôt ! Le vélo roule tout seul.',
      `SAUTE : ${t ? 'touche la moitié DROITE de l\'écran' : '▲ ou ESPACE'} (garde appuyé = plus haut)`,
      '   → bourré allongé, verre cassé, flaque... et attrape les PINTES (+1 s)',
      `DRING : ${t ? 'touche la moitié GAUCHE' : 'Z ou ◀'} quand le bourré est dans la zone jaune`,
      '   → le bourré DEBOUT s\'écarte, celui qui TRAVERSE s\'arrête',
      'L\'icône au-dessus de chaque obstacle te dit quoi faire. Série de 5 = +2 s.',
    ], () => this.presentation(() => this.choixDifficulte()));
  }

  presentation(ensuite) {
    this.afficherPresentation({
      image: 'remi_presentation', nom: 'RÉMI', surnom: 'Le Roi du Comptoir', couleur: '#e8742a',
      infos: ['Spécialité : la sortie au bar', 'Arme : le beer pong', 'Signe distinctif : tape dans les portes',
        'Devise : « Allez, une dernière ! »'],
      invite: 'en selle !',
    }, ensuite);
  }

  choixDifficulte() {
    choisirDifficulte(this, 'remi', DIFFICULTES, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.demarrer(); });
  }

  // (re)démarrage du trajet (aussi appelé directement par les tests)
  demarrer() {
    this.genererParcours();
    this.bx = 0; this.v = V.vitesseDepart; this.y = 0; this.vy = 0; this.invincible = 0; this.auSol = true; this.surTremplin = null;
    this.score = 0; this.serie = 0; this.pintesPrises = 0; this.chutes = 0;
    this.tempsRestant = this.diff.temps;
    this.quartier = undefined; this.changerQuartier(DEPART_ROUTE); this.carrefourOuvert = false;
    this.etat = 'jeu';
    etiquettesTactiles(VIDES);   // sur téléphone : pas de boutons, deux grandes moitiés d'écran
    annonce(this, 'C\'EST PARTI !', '#7fff7f', 0.8);
  }

  // ---------- commandes : deux moitiés d'écran (téléphone), ou le clavier ----------
  installerZones() {
    this.input.on('pointerdown', (p) => {
      if (this.etat !== 'jeu') return;
      if (this.carrefourOuvert && !this.choix) { this.toucheChoix = p.x < LARGEUR / 2 ? 0 : 1; return; }
      if (p.x < LARGEUR / 2) this.demanderDring();
      else { this.sautDoigt = true; this.doigtSaut = p.id; this.tampon = V.tampon; this.appuiD = 0.15; }
    });
    this.input.on('pointerup', (p) => { if (p.id === this.doigtSaut) this.sautDoigt = false; });
  }

  demanderDring() { this.appuiG = 0.15; if (this.recharge <= 0 && this.chute <= 0) this.sonner(); }

  genererParcours() {
    for (const o of [...this.obstacles, ...(this.voitures || []), ...(this.tremplins || [])]) { if (o.g) o.g.destroy(); if (o.spr) o.spr.destroy(); }
    this.obstacles = []; this.pintes = []; this.voitures = []; this.tremplins = [];
    this.troncon = V.longueur / 3;                 // longueur d'un tronçon « normal »
    this.route = DEPART_ROUTE; this.numCarrefour = 0; this.choix = null;
    this.finTroncon = this.troncon;               // où finit le tronçon en cours (le carrefour ou le bar)
    this.longueur = V.longueur;                   // longueur totale prévue (change avec les raccourcis)
    this.genererTroncon(0, this.finTroncon, DEPART_ROUTE, true);
  }

  // obstacles d'un tronçon [x0, x1] selon la route choisie ; rien juste avant le carrefour (on lit les panneaux)
  genererTroncon(x0, x1, route, debutPartie) {
    const poids = Object.entries(V.types), total = poids.reduce((s, [, p]) => s + p, 0);
    const tirer = () => { let r = Math.random() * total; for (const [n, p] of poids) { r -= p; if (r <= 0) return n; } return 'debout'; };
    // les 3 premiers obstacles apprennent les gestes : allongé (saut), debout (sonnette), traverse (sonnette)
    const debut = debutPartie ? ['allonge', 'debout', 'traverse'] : [];
    let x = debutPartie ? 1100 : x0 + 500, k = debutPartie ? 0 : 4;
    const tousLes = route.voitures > 0 ? Math.max(2, Math.round(V.voitures / route.voitures)) : 999;
    const marge = x1 >= this.longueur - 1 ? 800 : 1700;   // pas d'obstacle pendant le panneau du carrefour
    while (x < x1 - marge) {
      // tous les « tousLes » obstacles : un TREMPLIN puis 2 VOITURES garées (on roule sur le toit, pintes au-dessus)
      if (k > 3 && k % tousLes === 0) {
        const L = V.longueurVoiture, H = V.hauteurVoiture;
        const lt = 150, ht = this.textures.exists('remi_tremplin') ? Math.round(lt / TREMPLIN_IMG.haut * TREMPLIN_IMG.h / TREMPLIN_IMG.l) : 70;
        this.tremplins.push({ x0: x, l: lt, h: ht });
        let xv = x + lt + 130;
        for (let n = 0; n < 2; n++) {
          // une voiture illustrée au hasard (sa longueur et sa hauteur de toit viennent de l'image), sinon la voiture dessinée
          const img = this.textures.exists('remi_voitures') ? Math.floor(Math.random() * 3) : -1;
          const l = img >= 0 ? VOIT_IMG[img].l * ECH_VOIT : L, h = img >= 0 ? VOIT_IMG[img].h * ECH_VOIT : H;
          this.voitures.push({ x0: xv, l, h, img, couleur: choisir([0xb03a3a, 0x3a6ab0, 0xd8c060, 0x5a8a4a, 0x8a4ab0]), touche: false });
          this.pintes.push({ x: xv + l * 0.5, h: h + 140, prise: false, t: Math.random() * 6 });
          xv += l + 40;
        }
        x = xv + 480; k++;
        continue;
      }
      const type = k < debut.length ? debut[k] : tirer();
      k++;
      this.ajouter(type, x);
      // l'écart se compte en TEMPS, à la vitesse prévue à cet endroit : jamais deux obstacles collés
      const vit = V.vitesseDepart + (V.vitesseFin - V.vitesseDepart) * Math.min(1, x / V.longueur);
      const ecart = vit * hasard(V.ecart[0], V.ecart[1]) / (this.diff.densite * route.densite) + (type === 'traverse' ? 120 : 0);
      if (k > 2 && Math.random() < V.pintes * route.pintes) this.pintes.push({ x: x + ecart / 2, h: HAUT_PINTE, prise: false, t: Math.random() * 6 });
      x += ecart;
    }
  }

  ajouter(type, x) {
    const g = this.add.graphics().setDepth(type === 'traverse' ? 5 : 8);
    const spr = IMAGE_BOURRE[type === 'traverse' ? 'marche' : type] !== undefined && this.textures.exists('remi_bourres')
      ? this.add.sprite(0, 0, 'remi_bourres', 0).setOrigin(0.5, 1).setDepth(g.depth).setTint(choisir(TEINTES)).setVisible(false) : null;
    this.obstacles.push({ type, x, etat: 'normal', t: Math.random() * 6, p: 0, touche: false, passe: false, g, spr, couleur: choisir(COULEURS.bourre) });
  }

  // ---------- décor : la rue illustrée (sinon des immeubles dessinés), la route dessinée à chaque image ----------
  creerDecor() {
    this.cameras.main.setBackgroundColor('#0d1030');
    const ciel = this.add.graphics().setDepth(0);
    ciel.fillGradientStyle(0x0b0d2a, 0x0b0d2a, 0x2a1f4a, 0x2a1f4a, 1).fillRect(0, 0, LARGEUR, SOL);
    ciel.fillStyle(0xf6f1d0, 1).fillCircle(820, 70, 26);
    ciel.fillStyle(0x0b0d2a, 1).fillCircle(810, 64, 22);
    for (let k = 0; k < 40; k++) ciel.fillStyle(0xffffff, Math.random() * 0.6 + 0.2).fillRect(Math.random() * LARGEUR, Math.random() * 200, 2, 2);
    this.planLoin = this.add.tileSprite(0, SOL - 230, LARGEUR, 230, this.texImmeubles('remi_loin', 0x1c1a3a, 0.35, 160)).setOrigin(0, 0).setDepth(1);
    this.planPres = this.add.tileSprite(0, SOL - 260, LARGEUR, 260, this.texImmeubles('remi_pres', 0x2a2448, 0.8, 230)).setOrigin(0, 0).setDepth(1);
    if (this.textures.exists('remi_rue')) {
      const k = (SOL - 14) / 575;
      this.rue = this.add.tileSprite(0, 0, LARGEUR, SOL - 14, 'remi_rue').setOrigin(0, 0).setTileScale(k).setDepth(1);
      this.rueEchelle = k;
      ciel.setVisible(false); this.planLoin.setVisible(false); this.planPres.setVisible(false);
    }
  }

  texImmeubles(cle, couleur, lumiere, hMax) {
    if (this.textures.exists(cle)) return cle;
    const W = 1600, H = hMax + 30, tex = this.textures.createCanvas(cle, W, H), c = tex.getContext();
    let x = 0;
    while (x < W) {
      const w = Math.min(W - x, 90 + Math.floor(Math.random() * 120)), h = 80 + Math.random() * (hMax - 80);
      c.fillStyle = '#' + couleur.toString(16).padStart(6, '0'); c.fillRect(x, H - h, w - 4, h);
      for (let wy = H - h + 14; wy < H - 20; wy += 26) {
        for (let wx = x + 10; wx < x + w - 20; wx += 22) {
          if (Math.random() < 0.45) { c.fillStyle = `rgba(255, 214, 120, ${lumiere * (0.5 + Math.random() * 0.5)})`; c.fillRect(wx, wy, 11, 14); }
        }
      }
      x += w;
    }
    tex.refresh();
    return cle;
  }

  creerHud() {
    this.hudTemps = texte(this, 140, 26, '', 22, '#ffd84a', { fontStyle: 'bold' }).setDepth(900);
    this.hudBarre = this.add.graphics().setDepth(900);
    this.hudScore = texte(this, LARGEUR - 110, 26, '', 20, '#ffffff', { fontStyle: 'bold' }).setDepth(900);
    // DEUX GROS BOUTONS dessinés en bas (toute la moitié d'écran marche, mais on voit où appuyer)
    const t = estTactile();
    this.gBoutons = this.add.graphics().setDepth(899);
    this.zoneG = texte(this, BOUTON_G.x, BOUTON_G.y + 22, t ? 'DRING' : 'DRING (Z)', 22, '#ffe680', { fontStyle: 'bold' }).setDepth(900).setVisible(false);
    this.zoneD = texte(this, BOUTON_D.x, BOUTON_D.y + 22, t ? 'SAUTE' : 'SAUTE (▲)', 22, '#9fe0ff', { fontStyle: 'bold' }).setDepth(900).setVisible(false);
    this.appuiG = 0; this.appuiD = 0;
  }

  // ---------- boucle ----------
  update(temps, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.horloge += dt;
    if (this.etat === 'jeu') this.pas(dt);
    else if (this.etat === 'arrivee') this.pasArrivee(dt);
    this.dessiner(dt);
  }

  pas(dt0) {
    const T = this.touches;
    // RALENTI D'APPRENTISSAGE : les premières fois, le jeu ralentit au bon moment et dit quoi faire
    this.action = this.etat === 'jeu' ? this.actionDuMoment() : null;
    const apprendre = this.action && this.action.maintenant && this.nomDiff !== 'champion' && (this.apprentissage[this.action.geste] || 0) < 2;
    const dt = apprendre ? dt0 * 0.3 : dt0;
    if (apprendre && !this.action.o.vuApprendre) { this.action.o.vuApprendre = true; this.apprentissage[this.action.geste] = (this.apprentissage[this.action.geste] || 0) + 1; }
    this.tempsRestant -= dt;
    if (this.tempsRestant <= 0) {
      this.tempsRestant = 0; this.etat = 'fin';
      ecranPerdu(this, 'LE BAR A FERMÉ', 'Rémi : « Bon ben je rentre... T\'étais où ?! »', this.nomDiff);
      return;
    }
    this.recharge = Math.max(0, this.recharge - dt);
    this.dring = Math.max(0, this.dring - dt);
    this.invincible = Math.max(0, this.invincible - dt);
    this.ralenti = Math.max(0, this.ralenti - dt);
    this.glisse = Math.max(0, this.glisse - dt);
    if (vientDAppuyer(T.haut) || vientDAppuyer(T.espace)) { this.tampon = V.tampon; this.appuiD = 0.15; }   // un saut demandé un peu trop tôt est gardé
    this.tampon = Math.max(0, this.tampon - dt);
    if (this.carrefourOuvert && !this.choix && vientDAppuyer(T.gauche)) this.toucheChoix = 0;
    else if (vientDAppuyer(T.z) || vientDAppuyer(T.x) || vientDAppuyer(T.gauche)) this.demanderDring();
    const tenu = T.haut.isDown || T.espace.isDown || this.sautDoigt;
    if (this.chute > 0) {
      this.chute -= dt; this.v = 0;
      if (this.chute <= 0) { this.y = 0; this.vy = 0; this.auSol = true; this.invincible = V.invincible; }
    } else {
      // vitesse : de plus en plus vite vers le bar ; ralentie après une crevaison ou une glissade
      const cible = (V.vitesseDepart + (V.vitesseFin - V.vitesseDepart) * Math.min(1, this.bx / this.longueur)) * (this.ralenti > 0 ? 0.55 : 1);
      this.v += Math.sign(cible - this.v) * Math.min(Math.abs(cible - this.v), 500 * dt);
      if (this.auSol && this.tampon > 0) { this.vy = V.saut; this.tenu = 0; this.tampon = 0; this.auSol = false; jouerSon(this, 'remi_saut'); }
    }
    // le SOL sous le vélo : la route (0), un tremplin (pente), le toit d'une voiture
    const avant = this.surTremplin;
    const sol = this.solSous(this.y);
    if (this.auSol && avant && !this.surTremplin && this.bx > avant.x0 + avant.l) {
      // bout du tremplin : ENVOL !
      this.vy = V.tremplin; this.auSol = false; this.surTremplin = null; this.tenu = 0;
      jouerSon(this, 'remi_saut', { rate: 0.8 }); bulle(this, 'ENVOL !', '#9fe0ff', 0.6, 140); this.score += 15;
    } else if (this.auSol && this.vy <= 0) {
      if (sol < this.y - 2) this.auSol = false;   // on quitte le toit (ou la fin du tremplin) : on tombe
      else this.y = sol;
    }
    // saut : tant qu'on garde appuyé (au début), la gravité est plus faible = saut plus haut et plus long
    if (!this.auSol) {
      this.tenu += dt;
      const leger = tenu && this.vy > 0 && this.tenu < V.sautTenu;
      const yAvant = this.y;
      this.y += this.vy * dt; this.vy -= (leger ? V.graviteTenue : V.gravite) * dt;
      const sol2 = this.solSous(Math.max(this.y, yAvant));   // (vu d'où on était : on ne traverse pas un toit en tombant vite)
      if (this.vy <= 0 && this.y <= sol2) { this.y = sol2; this.vy = 0; this.auSol = true; jouerSon(this, 'remi_atterrit'); }
    }
    this.voituresPas();
    this.bx += this.v * dt;
    this.a += this.v * dt / 14;
    this.obstaclesPas(dt);
    this.pintesPas();
    // CARREFOUR : on approche de la fin du tronçon (pas le dernier) → on choisit la route ; au bout, on y entre
    if (this.numCarrefour < CARREFOURS.length) {
      if (!this.choix && !this.carrefourOuvert && this.bx > this.finTroncon - 1500) this.ouvrirCarrefour();
      if (this.carrefourOuvert) this.pasCarrefour(dt);
      if (this.bx >= this.finTroncon) this.entrerRoute();
    }
    this.prochainTexto -= dt;
    if (this.prochainTexto <= 0) { this.prochainTexto = hasard(10, 15); bulle(this, '📱 ' + choisir(REPLIQUES.textos), '#9fe0ff', 2.4, 76); jouerSon(this, 'remi_texto'); }
    if (this.bx >= this.longueur) this.arriver();
  }

  // ---------- carrefours ----------
  ouvrirCarrefour() {
    const [a, b] = CARREFOURS[this.numCarrefour];
    this.carrefourOuvert = true; this.choixTemps = 3; this.choix = null;
    const t = estTactile();
    this.panneau = [
      this.add.rectangle(LARGEUR / 2, 150, 860, 150, 0x000000, 0.75).setDepth(950).setStrokeStyle(3, 0xffd84a),
      texte(this, LARGEUR / 2, 92, 'CARREFOUR : CHOISIS TA ROUTE !', 24, '#ffd84a', { fontStyle: 'bold' }).setDepth(951),
      texte(this, 250, 150, `◀ ${a.nom}\n${a.texte}`, 22, '#9fe0ff', { fontStyle: 'bold' }).setDepth(951),
      texte(this, LARGEUR - 250, 150, `${b.nom} ▶\n${b.texte}`, 22, '#ffb070', { fontStyle: 'bold' }).setDepth(951),
      texte(this, LARGEUR / 2, 205, t ? 'touche la gauche ou la droite de l\'écran' : '◀ ou ▶', 16, '#ffffff').setDepth(951),
    ];
    jouerSon(this, 'remi_texto');
  }

  pasCarrefour(dt) {
    const T = this.touches;
    this.choixTemps -= dt;
    if (!this.choix) {
      if (vientDAppuyer(T.droite)) this.choisir(1);
      else if (this.toucheChoix !== undefined) this.choisir(this.toucheChoix);
      else if (this.choixTemps <= 0) this.choisir(0);   // pas de choix : la première route
    }
    this.toucheChoix = undefined;
  }

  choisir(n) {
    const r = CARREFOURS[this.numCarrefour][n];
    this.choix = r; this.carrefourOuvert = false;
    for (const e of this.panneau) e.destroy();
    jouerSon(this, 'ui_valider');
    bulle(this, `Direction : ${r.nom}`, n ? '#ffb070' : '#9fe0ff', 1.4, 140);
    // la suite du trajet : ce tronçon (plus court si raccourci), puis le reste prévu au plus long
    const x0 = this.finTroncon, x1 = x0 + this.troncon * r.longueur;
    const restants = CARREFOURS.length - 1 - this.numCarrefour;
    this.longueur = x1 + restants * this.troncon;
    this.genererTroncon(x0, x1, r, false);
    this.prochainFin = x1;
  }

  entrerRoute() {
    if (!this.choix) this.choisir(0);
    const r = this.choix;
    this.route = r; this.numCarrefour++; this.choix = null;
    this.finTroncon = this.prochainFin;
    this.changerQuartier(r);
  }

  changerQuartier(z) {
    const premier = this.quartier === undefined;
    this.quartier = z;
    if (!this.rue) return;
    const appliquer = () => {
      const img = z.image && this.textures.exists(z.image);
      this.rue.setTexture(img ? z.image : 'remi_rue');
      this.rue.setTint(img ? 0xffffff : z.teinte);
    };
    if (premier) { appliquer(); return; }
    // petit fondu au noir pendant qu'on change de quartier
    const voileQ = this.add.rectangle(0, 0, LARGEUR, SOL - 14, 0x000000, 0).setOrigin(0, 0).setDepth(1.5);
    this.tweens.add({ targets: voileQ, fillAlpha: 0.85, duration: 300, yoyo: true, onYoyo: appliquer, onComplete: () => voileQ.destroy() });
    annonce(this, z.nom, '#9fe0ff', 1);
  }

  // hauteur du sol sous le vélo, vu depuis la hauteur y : on ne « monte » sur un toit que par au-dessus (marche de 30 px)
  solSous(y) {
    let h = 0;
    this.surTremplin = null;
    for (const t of this.tremplins) {
      if (this.bx >= t.x0 && this.bx <= t.x0 + t.l) {
        const ht = t.h * (this.bx - t.x0) / t.l;
        if (ht <= y + 30) { h = Math.max(h, ht); this.surTremplin = t; }
      }
    }
    for (const v of this.voitures) {
      if (this.bx + DEMI_VELO * 0.7 >= v.x0 && this.bx - DEMI_VELO * 0.7 <= v.x0 + v.l && v.h <= y + 30) h = Math.max(h, v.h);
    }
    return h;
  }

  // rentrer dans une voiture par le côté = chute
  voituresPas() {
    if (this.chute > 0 || this.invincible > 0) return;
    for (const v of this.voitures) {
      if (v.touche) continue;
      if (this.bx + DEMI_VELO * 0.8 >= v.x0 && this.bx - DEMI_VELO * 0.8 <= v.x0 + v.l && this.y < v.h - 30) {
        v.touche = true; this.serie = 0;
        this.tomber({ type: 'voiture', etat: '', p: 0 });
        this.bx = v.x0 - DEMI_VELO - 10;   // on recule devant la voiture
      }
    }
  }

  sonner() {
    this.recharge = V.sonnette; this.dring = 0.35;
    jouerSon(this, 'remi_sonnette');
    for (const o of this.obstacles) {
      const d = o.x - this.bx;
      if (!SONNER[o.type] || d < 60 || d > this.diff.sonnette) continue;
      if (o.type === 'debout' && o.etat === 'normal') { o.etat = 'ecarte'; o.p = 0; }
      // celui qui traverse s'arrête et recule, s'il n'est pas déjà au milieu de la route
      if (o.type === 'traverse' && o.etat !== 'recule' && o.p < 0.36) o.etat = 'recule';
    }
  }

  // L'OBSTACLE À GÉRER MAINTENANT (le plus proche devant, pas encore passé) et si c'est le bon moment :
  //  sauter : quand il est à 0,22 - 0,5 s devant ; sonner : quand il est dans la zone jaune (et la sonnette prête)
  actionDuMoment() {
    for (const o of this.obstacles) {
      const d = o.x - this.bx;
      if (d < 0 || o.touche || o.etat === 'ecarte' || o.etat === 'recule') continue;
      if (SONNER[o.type]) {
        if (o.type === 'traverse' && o.p >= 0.36) continue;
        const dedans = d > 80 && d < this.diff.sonnette;
        if (d < this.diff.sonnette + 300) return { o, geste: 'dring', maintenant: dedans && this.recharge <= 0 };
      } else {
        const tps = (d - DEMI_VELO - TAILLE[o.type][1]) / Math.max(1, this.v);
        if (tps < 1.2) return { o, geste: 'saute', maintenant: tps > 0.05 && tps < 0.32 };
      }
      return null;
    }
    return null;
  }

  obstaclesPas(dt) {
    for (const o of this.obstacles) {
      o.t += dt;
      const d = o.x - this.bx;
      if (o.etat === 'ecarte') o.p = Math.min(1, o.p + dt / 0.4);
      if (o.type === 'traverse') {
        // il part quand tu arrives (il te couperait la route ~0,9 s plus tard)
        if (o.etat === 'normal' && d < this.v * 1.7) o.etat = 'marche';
        if (o.etat === 'marche') o.p = Math.min(1, o.p + dt * this.diff.traverse / 1.8);
        if (o.etat === 'recule') o.p = Math.max(0, o.p - dt * 0.8);
      }
      // obstacle dépassé sans le toucher : SÉRIE
      if (!o.passe && d < -DEMI_VELO - 40) {
        o.passe = true;
        if (!o.touche) this.reussir();
      }
      if (o.touche || this.chute > 0 || (this.invincible > 0 && !['verre', 'vomi'].includes(o.type))) continue;
      const [h, w] = TAILLE[o.type];
      if (Math.abs(d) > w + DEMI_VELO) continue;
      if (o.type === 'debout' && o.etat === 'ecarte') continue;
      if (o.type === 'traverse' && (o.p < 0.36 || o.p > 0.74)) continue;
      if (this.y >= h) continue;
      o.touche = true;
      this.serie = 0;
      if (o.type === 'verre') { this.ralenti = V.ralenti; bulle(this, 'Crevaison... ça roule mal !', '#ffb0b0', 1.2, 140); jouerSon(this, 'remi_crevaison'); }
      else if (o.type === 'vomi') { this.ralenti = V.ralenti; this.glisse = 0.8; bulle(this, 'Beurk, ça glisse !', '#d8e05a', 1.2, 140); jouerSon(this, 'remi_glisse'); }
      else this.tomber(o);
    }
  }

  reussir() {
    this.serie++;
    this.score += 10 * Math.min(3, 1 + Math.floor(this.serie / 5));
    if (this.serie % V.serie === 0) {
      this.tempsRestant += 2;
      bulle(this, `SÉRIE x${this.serie} !  +2 s`, '#7fff7f', 1, 140);
      jouerSon(this, 'remi_arrivee', { rate: 1.5 });
    }
  }

  pintesPas() {
    for (const p of this.pintes) {
      if (p.prise) continue;
      const d = p.x - this.bx;
      if (Math.abs(d) < 55 && this.y + 215 >= p.h - 12) {
        p.prise = true; this.pintesPrises++;
        this.tempsRestant += V.bonusPinte; this.score += 25;
        bulle(this, `🍺 +${V.bonusPinte} s`, '#ffd84a', 0.7, 140);
        jouerSon(this, 'remi_pinte');
      }
    }
  }

  tomber(o) {
    this.chute = V.chute; this.chutes++;
    this.y = 0; this.vy = 0;
    if (o.type === 'traverse') o.etat = 'recule'; else if (o.type !== 'voiture') { o.etat = 'ecarte'; o.p = 1; }
    this.cameras.main.shake(250, 0.012);
    jouerSon(this, 'remi_chute');
    bulle(this, choisir(['Aïe !', 'Il m\'a pas vu !', 'Oh le boulet...', 'Ma roue !']), '#ff9a9a', 1.2, 140);
  }

  arriver() {
    this.etat = 'arrivee';
    etiquettesTactiles(VIDES);
    jouerSon(this, 'remi_arrivee');
    annonce(this, 'AU BAR !', '#ff4fd8', 1.2);
    const marge = Math.ceil(this.tempsRestant);
    this.time.delayedCall(700, () => bulle(this, `${marge} s d'avance  -  ${this.pintesPrises} pinte${this.pintesPrises > 1 ? 's' : ''}  -  ${this.chutes ? `${this.chutes} chute${this.chutes > 1 ? 's' : ''}` : 'aucune chute !'}  -  score ${this.score}`, '#7fff7f', 3, 140));
    this.time.delayedCall(900, () => bulle(this, `Rémi : « ${REPLIQUES.arrivee} »`, '#ffd84a', 2.6, 90));
    this.time.delayedCall(3600, () => jeuSuivant(this, 'velo', this.nomDiff));
  }

  pasArrivee(dt) {
    this.v = Math.max(0, this.v - 500 * dt);
    if (this.y > 0) { this.y = Math.max(0, this.y + this.vy * dt); this.vy -= V.gravite * dt; }
    this.bx += this.v * dt; this.a += this.v * dt / 14;
  }

  // ---------- dessin ----------
  dessiner() {
    const cam = this.bx - X_VELO;
    this.planLoin.tilePositionX = cam * 0.15;
    this.planPres.tilePositionX = cam * 0.35;
    if (this.rue) this.rue.tilePositionX = cam * 0.8 / this.rueEchelle;   // presque au pas de la route
    const g = this.decor.clear();
    g.fillStyle(0x3a3a48, 1).fillRect(0, SOL - 14, LARGEUR, 14);
    g.fillStyle(0x23232c, 1).fillRect(0, SOL, LARGEUR, HAUTEUR - SOL);
    g.fillStyle(0x55556a, 1).fillRect(0, SOL - 14, LARGEUR, 3);
    g.fillStyle(0xdddddd, 0.7);
    for (let x = -(cam % 120) - 120; x < LARGEUR; x += 120) g.fillRect(x, SOL + 52, 60, 6);
    for (let x = -(cam % 380) - 380; !this.rue && x < LARGEUR + 380; x += 380) {   // (la rue illustrée a ses lampadaires)
      g.fillStyle(0xffe9a0, 0.08).fillTriangle(x + 20, SOL - 186, x - 70, SOL, x + 110, SOL);
      g.fillStyle(0x15151c, 1).fillRect(x - 3, SOL - 190, 6, 176).fillRect(x - 3, SOL - 192, 26, 5);
      g.fillStyle(0xffe9a0, 1).fillCircle(x + 20, SOL - 186, 5);
    }
    this.dessinerBar(g, cam);
    // ZONE DE LA SONNETTE devant toi (jaune = prête)
    if (this.etat === 'jeu') {
      const x0 = X_VELO + 60, x1 = X_VELO + this.diff.sonnette, pret = this.recharge <= 0;
      g.fillStyle(pret ? 0xffe680 : 0x888888, pret ? 0.16 : 0.06).fillRect(x0, SOL - 6, x1 - x0, 12);
      g.lineStyle(2, pret ? 0xffe680 : 0x888888, pret ? 0.7 : 0.3).lineBetween(x1, SOL - 14, x1, SOL + 8);
    }
    this.dessinerObstacles(g, cam);
    this.dessinerVoitures(cam);
    // pintes à attraper en sautant
    const gp = this.gPintes.clear();
    for (const p of this.pintes) {
      const sx = p.x - cam;
      if (p.prise || sx < -50 || sx > LARGEUR + 50) continue;
      const y = SOL - p.h + Math.sin(this.horloge * 4 + p.t) * 6;
      gp.fillStyle(0xffd84a, 0.25).fillCircle(sx, y, 26);
      gp.fillStyle(0xe8a52a, 1).fillRect(sx - 11, y - 14, 22, 28);
      gp.fillStyle(0xffffff, 1).fillRect(sx - 12, y - 19, 24, 7);
      gp.lineStyle(3, 0xf4f4f4, 1).strokeRect(sx - 11, y - 14, 22, 28).strokeCircle(sx + 15, y, 6);
    }
    this.dessinerVelo();
    this.dessinerHud();
  }

  dessinerBar(g, cam) {
    const xBar = (this.longueur || V.longueur) + 260 - cam;
    if (xBar < LARGEUR + 400) {
      if (this.facade) {
        this.facade.setVisible(true).setPosition(xBar + 60, SOL + 2);
        this.facade.setTint(Math.sin(this.horloge * 9) > 0.6 ? 0xffe6ff : 0xffffff);   // le néon clignote
      } else {
        g.fillStyle(0x3b1f2b, 1).fillRect(xBar - 200, SOL - 300, 520, 286);
        g.fillStyle(0xffc860, 0.85).fillRect(xBar - 160, SOL - 170, 120, 90).fillRect(xBar + 140, SOL - 170, 120, 90);
        g.fillStyle(0x5a2a10, 1).fillRect(xBar + 30, SOL - 140, 70, 126);
        this.enseigne.setVisible(true).setPosition(xBar + 60, SOL - 240).setAlpha(0.75 + 0.25 * Math.sin(this.horloge * 9));
      }
      const gr = this.gRemi.clear().setPosition(xBar - 20, SOL);
      const gt = this.gTable.clear();
      if (this.sprRemi && this.remiAccueil) this.sprRemi.setVisible(true).setPosition(xBar - 130, SOL + 4);
      else if (this.sprRemi) {
        this.sprRemi.setVisible(true).setPosition(xBar - 130, SOL - 70);
        // table haute de terrasse (cache le bas de l'image) avec une pinte
        gt.fillStyle(0x2a1a10, 1).fillRect(xBar - 200, SOL - 92, 140, 12).fillRect(xBar - 136, SOL - 82, 10, 82).fillRect(xBar - 160, SOL - 4, 60, 6);
        gt.fillStyle(0xe8a52a, 1).fillRect(xBar - 90, SOL - 118, 18, 26);
        gt.fillStyle(0xffffff, 1).fillRect(xBar - 91, SOL - 122, 20, 6);
      }
      else remi(gr, 'garde', this.horloge);
    } else {
      this.enseigne.setVisible(false); this.gRemi.clear();
      if (this.facade) this.facade.setVisible(false);
      if (this.sprRemi) this.sprRemi.setVisible(false);
      this.gTable.clear();
    }
  }

  dessinerVoitures(cam) {
    if (!this.gVoit) this.gVoit = this.add.graphics().setDepth(7);
    const g = this.gVoit.clear();
    for (const t of this.tremplins) {
      const x = t.x0 - cam;
      if (!t.spr && this.textures.exists('remi_tremplin')) t.spr = this.add.image(0, 0, 'remi_tremplin').setOrigin(0, 1).setDepth(7).setScale(t.l / TREMPLIN_IMG.haut / TREMPLIN_IMG.l);
      if (t.spr) { t.spr.setPosition(x, SOL + 3).setVisible(x < LARGEUR + 50 && x + t.l > -80); continue; }
      if (x > LARGEUR + 50 || x + t.l < -50) continue;
      // tremplin : une planche posée sur des caisses de bière
      g.fillStyle(0x5a3a1a, 1).fillRect(x + t.l - 60, SOL - t.h + 8, 60, t.h - 8);
      g.fillStyle(0xd8a040, 1).fillRect(x + t.l - 56, SOL - t.h + 14, 52, 20).fillRect(x + t.l - 56, SOL - t.h + 40, 52, 20);
      g.lineStyle(10, 0x2a1a0a, 1).lineBetween(x, SOL, x + t.l, SOL - t.h);
      g.lineStyle(6, 0xc89050, 1).lineBetween(x, SOL - 1, x + t.l, SOL - t.h - 1);
    }
    for (const v of this.voitures) {
      const x = v.x0 - cam;
      if (v.img >= 0) {
        if (!v.spr) v.spr = this.add.sprite(0, 0, 'remi_voitures', v.img).setOrigin(0.5, 1).setDepth(7).setScale(ECH_VOIT);
        v.spr.setPosition(x + v.l / 2, SOL + 4).setVisible(x < LARGEUR + 50 && x + v.l > -50);
        continue;
      }
      if (x > LARGEUR + 50 || x + v.l < -50) continue;
      const L = v.l, H = v.h;
      g.fillStyle(0x000000, 0.3).fillEllipse(x + L / 2, SOL + 2, L, 14);
      g.fillStyle(v.couleur, 1).fillRoundedRect(x, SOL - H * 0.62, L, H * 0.5, 14);           // caisse
      g.fillRoundedRect(x + L * 0.2, SOL - H, L * 0.58, H * 0.44, { tl: 26, tr: 22, bl: 0, br: 0 });   // habitacle (le toit = H)
      g.fillStyle(0x9fd8e8, 0.85).fillRect(x + L * 0.25, SOL - H + 10, L * 0.22, H * 0.28).fillRect(x + L * 0.52, SOL - H + 10, L * 0.22, H * 0.28);
      g.fillStyle(0x111111, 1).fillCircle(x + L * 0.2, SOL - 18, 22).fillCircle(x + L * 0.8, SOL - 18, 22);
      g.fillStyle(0x888888, 1).fillCircle(x + L * 0.2, SOL - 18, 9).fillCircle(x + L * 0.8, SOL - 18, 9);
      g.fillStyle(0xffe680, 1).fillRect(x + L - 10, SOL - H * 0.5, 10, 12);
      g.lineStyle(3, 0x111111, 0.8).strokeRoundedRect(x, SOL - H * 0.62, L, H * 0.5, 14);
    }
  }

  dessinerObstacles(g, cam) {
    const icones = this.nomDiff !== 'champion' && this.etat === 'jeu';
    // le BON MOMENT : un gros mot au-dessus de l'obstacle, de la couleur du bouton à presser (pas en CHAMPION)
    const a = icones ? this.action : null;
    if (!this.motAction) this.motAction = texte(this, 0, 0, '', 34, '#ffffff', { fontStyle: 'bold italic', strokeThickness: 7 }).setDepth(940);
    if (a && a.maintenant) {
      const dring = a.geste === 'dring';
      this.motAction.setVisible(true).setText(dring ? 'DRING !' : 'SAUTE !').setColor(dring ? '#ffe680' : '#9fe0ff')
        .setPosition(a.o.x - cam, SOL - (dring ? 300 : 150)).setScale(1 + 0.12 * Math.sin(this.horloge * 20));
    } else this.motAction.setVisible(false);
    for (const o of this.obstacles) {
      const sx = o.x - cam;
      o.g.clear();
      if (o.spr) o.spr.setVisible(false);
      if (sx < -200 || sx > LARGEUR + 200) continue;
      // icône : quoi faire (▲ = saute, 🔔 = sonne), tant qu'on ne l'a pas encore passé
      if (icones && !o.touche && o.x > this.bx && sx < LARGEUR - 20 && o.etat !== 'ecarte' && o.etat !== 'recule') {
        const d = o.x - this.bx, son = SONNER[o.type], dedans = son && d > 60 && d < this.diff.sonnette;
        const y = SOL - (son ? 250 : 100) + Math.sin(this.horloge * 6) * 3;
        g.fillStyle(son ? (dedans ? 0xffe680 : 0x6a6040) : 0x9fe0ff, 0.95).fillCircle(sx, y, 15);
        if (son) { g.fillStyle(0x222222, 1).fillTriangle(sx - 8, y + 5, sx + 8, y + 5, sx, y - 9).fillCircle(sx, y + 7, 2.5); }
        else g.fillStyle(0x10304a, 1).fillTriangle(sx - 9, y + 6, sx + 9, y + 6, sx, y - 8);
      }
      if (o.type === 'verre') { o.g.setPosition(sx, SOL); verreCasse(o.g); continue; }
      if (o.type === 'vomi') { o.g.setPosition(sx, SOL); flaque(o.g); continue; }
      if (o.type === 'allonge') {
        if (o.spr) o.spr.setVisible(true).setFrame(IMAGE_BOURRE.allonge).setPosition(sx, SOL + 4).setScale(BOURRE);
        else { o.g.setPosition(sx, SOL).setRotation(0); bourre(o.g, 'allonge', o.t, o.couleur); }
        continue;
      }
      if (o.type === 'traverse') {
        // il arrive du fond (petit, plus haut) et passe devant (plus grand, plus bas) ; la sonnette le fait reculer
        const p = o.p, y = SOL - 46 + p * 96, k = 0.72 + p * 0.5, rot = Math.sin(o.t * 3) * 0.12;
        o.g.setPosition(sx, y).setScale(k).setDepth(p < 0.55 ? 5 : 15).setRotation(rot);
        if (o.spr) {
          o.spr.setVisible(true).setFrame(IMAGE_BOURRE[o.etat === 'recule' ? 'ecarte' : o.etat === 'marche' ? 'marche' : 'debout'])
            .setPosition(sx, y).setScale(BOURRE * k).setDepth(p < 0.55 ? 5 : 15).setRotation(rot).setFlipX(o.etat === 'marche' && Math.sin(o.t * 3.5) > 0);
        } else bourre(o.g, o.etat === 'marche' ? 'marche' : 'debout', o.t, o.couleur);
        continue;
      }
      // debout : titube ; s'il a entendu la sonnette, il fait un bond et reste sur le trottoir du fond
      const p = o.etat === 'ecarte' ? o.p : 0;
      const x = sx + p * 18, y = SOL - p * 30 - Math.sin(p * Math.PI) * 40, k = 1 - p * 0.25, rot = Math.sin(o.t * 2.1) * 0.14 - p * 0.3;
      if (o.spr) {
        o.spr.setVisible(true).setFrame(IMAGE_BOURRE[p > 0 && p < 1 ? 'ecarte' : 'debout']).setDepth(p >= 1 ? 4 : 8)
          .setPosition(x, y).setScale(BOURRE * k).setAlpha(1 - p * 0.3).setRotation(rot);
      } else { o.g.setPosition(x, y).setScale(k).setAlpha(1 - p * 0.3).setRotation(rot); bourre(o.g, p > 0 ? 'ecarte' : 'debout', o.t, o.couleur); }
    }
  }

  dessinerVelo() {
    const gv = this.gVelo.clear();
    const zig = this.glisse > 0 ? Math.sin(this.horloge * 30) * 0.12 : 0;
    const bond = this.chute > 0 ? 0 : -this.y;
    gv.setPosition(X_VELO, SOL + bond).setRotation(0);
    const rot = this.chute > 0 ? 0 : (this.auSol && this.surTremplin ? -Math.atan2(this.surTremplin.h, this.surTremplin.l) : this.vy > 0 ? -0.12 : !this.auSol ? 0.08 : 0) + zig;
    if (this.sprVelo) {
      const f = this.chute > 0 ? 7 : !this.auSol ? 6 : Math.floor(this.a / (Math.PI * 2) * 6) % 6;
      this.sprVelo.setFrame(f).setPosition(X_VELO, SOL + bond + 6).setRotation(rot)
        .setAlpha(this.invincible > 0 && Math.floor(this.horloge * 12) % 2 ? 0.35 : 1);   // clignote après une chute
    } else {
      if (this.chute > 0) gv.setRotation(-1.3).setPosition(X_VELO + 20, SOL - 30); else gv.setRotation(rot);
      cycliste(gv, this.a, { sonnette: this.dring > 0 });
    }
    if (this.dring > 0) gv.lineStyle(3, 0xffe680, 1).strokeCircle(78, -195, 10).strokeCircle(78, -195, 20);
  }

  dessinerHud() {
    const jeu = this.etat === 'jeu' || this.etat === 'arrivee';
    this.zoneG.setVisible(this.etat === 'jeu'); this.zoneD.setVisible(this.etat === 'jeu');
    if (!jeu) return;
    const s = Math.max(0, Math.ceil(this.tempsRestant));
    this.hudTemps.setText(`FERMETURE DANS ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`).setColor(s <= 10 ? '#ff5a5a' : '#ffd84a');
    this.hudScore.setText(`${this.score} pts${this.serie >= 2 ? `   série ${this.serie}` : ''}`);
    const hb = this.hudBarre.clear(), x0 = 300, x1 = 720, pr = Math.min(1, this.bx / (this.longueur || V.longueur));
    hb.fillStyle(0x000000, 0.5).fillRect(x0 - 4, 18, x1 - x0 + 8, 16);
    hb.fillStyle(0x7fff7f, 1).fillRect(x0, 22, (x1 - x0) * pr, 8);
    hb.fillStyle(0xff4fd8, 1).fillRect(x1 - 6, 14, 12, 24);
    hb.fillStyle(0xffffff, 1).fillCircle(x0 + (x1 - x0) * pr, 26, 7);
    // sonnette : cercle qui se remplit pendant la recharge (à côté du rappel DRING)
    // les 2 gros boutons : DRING (sa recharge fait le tour du bouton), SAUTE ; ils s'allument quand on appuie
    const gb = this.gBoutons.clear();
    if (this.etat === 'jeu') {
      this.appuiG = Math.max(0, this.appuiG - 1 / 60); this.appuiD = Math.max(0, this.appuiD - 1 / 60);
      const tenu = this.sautDoigt || this.touches.haut.isDown || this.touches.espace.isDown;
      const a = this.nomDiff !== 'champion' && this.action && this.action.maintenant ? this.action.geste : null;
      const clign = Math.floor(this.horloge * 10) % 2 === 0;
      for (const [b, c, actif, appel] of [[BOUTON_G, 0xffe680, this.appuiG > 0, a === 'dring'], [BOUTON_D, 0x9fe0ff, this.appuiD > 0 || tenu, a === 'saute']]) {
        gb.fillStyle(0x000000, actif ? 0.55 : 0.35).fillCircle(b.x, b.y, b.r);
        gb.fillStyle(c, actif ? 0.45 : appel && clign ? 0.6 : 0.15).fillCircle(b.x, b.y, b.r - 6);
        gb.lineStyle(appel ? 8 : 4, c, 0.9).strokeCircle(b.x, b.y, b.r + (appel ? 6 : 0));   // le bouton à presser MAINTENANT clignote
      }
      // icône cloche / flèche
      const g0 = BOUTON_G, d0 = BOUTON_D;
      gb.fillStyle(0xffe680, 1).fillTriangle(g0.x - 18, g0.y - 2, g0.x + 18, g0.y - 2, g0.x, g0.y - 38).fillCircle(g0.x, g0.y - 26, 12).fillCircle(g0.x, g0.y + 2, 5);
      gb.fillStyle(0x9fe0ff, 1).fillTriangle(d0.x - 22, d0.y - 6, d0.x + 22, d0.y - 6, d0.x, d0.y - 40);
      // recharge de la sonnette : un arc autour du bouton DRING
      if (this.recharge > 0) gb.lineStyle(8, 0x555555, 0.9).beginPath().arc(g0.x, g0.y, g0.r - 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (this.recharge / V.sonnette), false).strokePath();
    }
  }
}
